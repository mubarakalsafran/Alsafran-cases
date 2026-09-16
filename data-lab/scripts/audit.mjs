#!/usr/bin/env node
/**
 * STAGE 1 — DATA AUDIT (inspect only, change nothing).
 *
 * Schema-agnostic profiler. Reports an exact count for every data-quality
 * issue found in a raw CSV, BEFORE any cleaning decision is made.
 * It never writes to the input file and never modifies a value.
 *
 * Usage: node scripts/audit.mjs <path-to-raw.csv>
 */
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/audit.mjs <path-to-raw.csv>');
  process.exit(1);
}

const SEP = '␟'; // visible-safe record separator for internal keys

/** RFC4180-ish parser: quoted fields, embedded commas/newlines, CRLF. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\r') { /* swallow */ }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const raw = readFileSync(file, 'utf8');
const hadBom = raw.charCodeAt(0) === 0xfeff;
const grid = parseCsv(hadBom ? raw.slice(1) : raw);
const headerRaw = grid[0];
const header = headerRaw.map((h) => h.trim());
const body = grid.slice(1).filter((r) => r.some((c) => c.trim() !== ''));

const recs = body.map((r, i) => {
  const o = { __line: i + 2 };
  header.forEach((h, j) => { o[h] = r[j] ?? ''; });
  return o;
});

const out = [];
const say = (s = '') => out.push(s);
const h1 = (s) => { say(); say('='.repeat(72)); say(s); say('='.repeat(72)); };

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';
const NULLISH = new Set(['na', 'n/a', 'null', 'none', 'nan', '-', '--', '?', 'unknown', 'tbd', '#n/a', 'missing']);
const isNullish = (v) => !isBlank(v) && NULLISH.has(String(v).trim().toLowerCase());

h1('1-3. SHAPE OF THE RAW FILE');
say(`Total data rows (excluding header) : ${recs.length}`);
say(`Total columns                      : ${header.length}`);
say(`Rows with a field count != header  : ${body.filter((r) => r.length !== header.length).length}`);
say(`UTF-8 BOM present                  : ${hadBom}`);
say('Column names:');
header.forEach((h, i) => {
  const note = h !== headerRaw[i] ? `   <-- header cell had surrounding whitespace: "${headerRaw[i]}"` : '';
  say(`  [${i}] "${h}"${note}`);
});

h1('4-5. INFERRED TYPE AND MISSING VALUES (per column)');
const NUMERIC_RE = /^-?[\d,]*\.?\d+$/;
const profiles = {};
for (const col of header) {
  const vals = recs.map((r) => r[col]);
  const blanks = vals.filter(isBlank).length;
  const nullishVals = vals.filter(isNullish);
  const present = vals.filter((v) => !isBlank(v) && !isNullish(v));
  const nums = present.filter((v) => NUMERIC_RE.test(String(v).trim())).length;
  const uniq = new Set(present.map((v) => String(v).trim()));
  const untrimmed = vals.filter((v) => String(v) !== String(v).trim()).length;
  const inferred = present.length > 0 && nums === present.length ? 'numeric (as stored)'
    : nums > present.length * 0.6 ? 'MIXED numeric/text'
      : 'text';
  profiles[col] = { blanks, present: present.length, uniq, untrimmed, inferred };

  say(`\n"${col}"`);
  say(`  inferred type       : ${inferred}`);
  say(`  empty cells         : ${blanks}`);
  say(`  null-like tokens    : ${nullishVals.length}${nullishVals.length ? '  -> ' + [...new Set(nullishVals.map((v) => `"${String(v).trim()}"`))].join(', ') : ''}`);
  say(`  populated values    : ${present.length}`);
  say(`  distinct values     : ${uniq.size}`);
  say(`  leading/trailing ws : ${untrimmed}`);
  const counts = new Map();
  for (const v of present) counts.set(String(v), (counts.get(String(v)) || 0) + 1);
  if (uniq.size <= 60) {
    say('  ALL distinct values verbatim (quoted, so whitespace is visible):');
    [...counts.entries()].sort((a, b) => b[1] - a[1]).forEach(([v, n]) => say(`      ${String(n).padStart(4)} x "${v}"`));
  } else {
    say('  15 most common distinct values:');
    [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([v, n]) => say(`      ${String(n).padStart(4)} x "${v}"`));
  }
}

h1('6. DUPLICATE ROWS (every column identical after trimming)');
const rowKey = (r) => header.map((h) => String(r[h]).trim()).join(SEP);
const seen = new Map();
for (const r of recs) seen.set(rowKey(r), (seen.get(rowKey(r)) || []).concat(r.__line));
const dupGroups = [...seen.entries()].filter(([, l]) => l.length > 1);
say(`Duplicate groups                  : ${dupGroups.length}`);
say(`Redundant rows beyond first copy  : ${dupGroups.reduce((s, [, l]) => s + l.length - 1, 0)}`);
dupGroups.forEach(([k, lines]) => say(`  lines ${lines.join(', ')} :: ${k.split(SEP).join(' | ')}`));

h1('7. DUPLICATE OR SUSPICIOUS IDs');
const idCols = header.filter((h) => /(^|[_\s-])id$|order.?id|^id$|invoice|receipt|ref/i.test(h));
for (const col of (idCols.length ? idCols : header.slice(0, 1))) {
  const counts = new Map();
  recs.forEach((r) => {
    const v = String(r[col]).trim();
    counts.set(v, (counts.get(v) || []).concat(r.__line));
  });
  const dups = [...counts.entries()].filter(([, l]) => l.length > 1);
  say(`\n"${col}"`);
  say(`  values appearing more than once : ${dups.length} (covering ${dups.reduce((s, [, l]) => s + l.length, 0)} rows)`);
  dups.forEach(([v, l]) => say(`      "${v}" on lines ${l.join(', ')}`));
  const casing = new Map();
  recs.forEach((r) => {
    const v = String(r[col]).trim();
    const k = v.toLowerCase();
    casing.set(k, new Set([...(casing.get(k) || []), v]));
  });
  const caseVariants = [...casing.entries()].filter(([, s]) => s.size > 1);
  say(`  ids differing only by case      : ${caseVariants.length}`);
  caseVariants.forEach(([, s]) => say(`      ${[...s].map((x) => `"${x}"`).join(', ')}`));
  const shapes = new Map();
  recs.forEach((r) => {
    const s = String(r[col]).trim().replace(/\d+/g, '#').replace(/[A-Za-z]+/g, 'A');
    shapes.set(s, (shapes.get(s) || 0) + 1);
  });
  say(`  id shape patterns               : ${[...shapes.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => `"${s}" x${n}`).join(', ')}`);
  say(`  blank ids                       : ${recs.filter((r) => isBlank(r[col])).length}`);
}

h1('8, 11, 12. CATEGORY SPELLING VARIANTS (areas / statuses / items)');
// Cluster text values by aggressive normalisation so variants of the same
// concept collapse together and can be counted exactly.
const normKey = (v) => String(v).trim().toLowerCase()
  .replace(/ /g, ' ')
  .replace(/[,.]/g, ' ')
  .replace(/\bkuwait\b/g, ' ')
  .replace(/[^a-z0-9]+/g, '');
for (const col of header) {
  const p = profiles[col];
  if (!p || p.inferred !== 'text' || p.uniq.size === 0 || p.uniq.size > 100) continue;
  const clusters = new Map();
  for (const r of recs) {
    const v = r[col];
    if (isBlank(v)) continue;
    const k = normKey(v);
    if (!k) continue;
    const m = clusters.get(k) || new Map();
    m.set(String(v), (m.get(String(v)) || 0) + 1);
    clusters.set(k, m);
  }
  const multi = [...clusters.entries()].filter(([, m]) => m.size > 1);
  if (!multi.length) {
    say(`\n"${col}" : no spelling variants detected across ${p.uniq.size} distinct values.`);
    continue;
  }
  say(`\n"${col}" : ${multi.length} concept(s) are written more than one way.`);
  for (const [k, m] of multi.sort((a, b) => b[1].size - a[1].size)) {
    const total = [...m.values()].reduce((a, b) => a + b, 0);
    say(`   cluster "${k}" -> ${m.size} spellings across ${total} rows:`);
    [...m.entries()].sort((a, b) => b[1] - a[1]).forEach(([v, n]) => say(`        ${String(n).padStart(4)} x "${v}"`));
  }
}

h1('9. NUMBER AND CURRENCY FORMATS');
for (const col of header) {
  const buckets = new Map();
  for (const r of recs) {
    const v = String(r[col]).trim();
    if (!v) continue;
    let shape = null;
    if (/^-?\d+$/.test(v)) shape = 'plain integer';
    else if (/^-?\d*\.\d+$/.test(v)) shape = `decimal (${(v.split('.')[1] || '').length} dp)`;
    else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(v)) shape = 'thousands separator';
    else if (/^(kd|kwd|د\.ك)\s*[\d.,]+$/i.test(v)) shape = 'currency prefix';
    else if (/^[\d.,]+\s*(kd|kwd|د\.ك)$/i.test(v)) shape = 'currency suffix';
    else if (/^\(\s*[\d.,]+\s*\)$/.test(v)) shape = 'parenthesised negative';
    else if (/^-?[\d.,]+\s*%$/.test(v)) shape = 'percentage';
    else continue;
    buckets.set(shape, (buckets.get(shape) || []).concat(v));
  }
  if (buckets.size === 0) continue;
  say(`\n"${col}" : ${buckets.size} distinct numeric format(s)`);
  [...buckets.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([s, vs]) => {
    say(`   ${String(vs.length).padStart(4)} rows  ${s.padEnd(26)} e.g. ${[...new Set(vs)].slice(0, 5).map((v) => `"${v}"`).join(', ')}`);
  });
}

h1('10 & 16. DATE FORMATS AND INVALID DATES');
const DATE_PATTERNS = [
  [/^\d{4}-\d{1,2}-\d{1,2}$/, 'ISO YYYY-MM-DD'],
  [/^\d{4}\/\d{1,2}\/\d{1,2}$/, 'YYYY/MM/DD'],
  [/^\d{1,2}\/\d{1,2}\/\d{4}$/, 'D/M/YYYY or M/D/YYYY (AMBIGUOUS)'],
  [/^\d{1,2}-\d{1,2}-\d{4}$/, 'D-M-YYYY or M-D-YYYY (AMBIGUOUS)'],
  [/^\d{1,2}\.\d{1,2}\.\d{4}$/, 'D.M.YYYY (AMBIGUOUS)'],
  [/^\d{1,2}\/\d{1,2}\/\d{2}$/, 'D/M/YY (AMBIGUOUS, 2-digit year)'],
  [/^\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}$/, 'D Month YYYY'],
  [/^[A-Za-z]{3,}\s+\d{1,2},?\s+\d{4}$/, 'Month D, YYYY'],
  [/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/, 'ISO datetime'],
  [/^\d{8}$/, 'YYYYMMDD compact'],
  [/^\d{5}$/, 'Excel serial number'],
];
for (const col of header) {
  const vals = recs.map((r) => String(r[col]).trim()).filter((v) => v !== '');
  if (!vals.length) continue;
  const hits = vals.filter((v) => DATE_PATTERNS.some(([re]) => re.test(v)));
  const looksDateNamed = /date|day|time|created|ordered/i.test(col);
  if (hits.length < vals.length * 0.4 && !looksDateNamed) continue;
  say(`\n"${col}" treated as a date column (${hits.length}/${vals.length} match a known date shape)`);
  const fmt = new Map();
  for (const v of vals) {
    const m = DATE_PATTERNS.find(([re]) => re.test(v));
    const key = m ? m[1] : 'UNRECOGNISED';
    fmt.set(key, (fmt.get(key) || []).concat(v));
  }
  [...fmt.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([k, vs]) => {
    say(`   ${String(vs.length).padStart(4)} rows  ${k.padEnd(36)} e.g. ${[...new Set(vs)].slice(0, 4).map((v) => `"${v}"`).join(', ')}`);
  });
  const bad = [];
  for (const r of recs) {
    const v = String(r[col]).trim();
    if (!v) continue;
    const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    const slash = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    let y; let mo; let d;
    if (iso) { y = +iso[1]; mo = +iso[2]; d = +iso[3]; } else if (slash) {
      const a = +slash[1]; const b2 = +slash[2]; y = +slash[3];
      // Only flag a date impossible under BOTH readings.
      const okA = new Date(Date.UTC(y, b2 - 1, a)).getUTCDate() === a && b2 >= 1 && b2 <= 12;
      const okB = new Date(Date.UTC(y, a - 1, b2)).getUTCDate() === b2 && a >= 1 && a <= 12;
      if (!okA && !okB) bad.push(`line ${r.__line}: "${v}" (no such calendar date under D/M or M/D)`);
      else if (y < 2000 || y > 2100) bad.push(`line ${r.__line}: "${v}" (year outside 2000-2100)`);
      continue;
    } else continue;
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
      bad.push(`line ${r.__line}: "${v}" (no such calendar date)`);
    } else if (y < 2000 || y > 2100) {
      bad.push(`line ${r.__line}: "${v}" (year outside 2000-2100)`);
    }
  }
  say(`   impossible / implausible calendar dates : ${bad.length}`);
  bad.forEach((b) => say(`      ${b}`));
  const unrec = fmt.get('UNRECOGNISED') || [];
  say(`   unparseable date strings               : ${unrec.length}`);
  [...new Set(unrec)].forEach((v) => say(`      "${v}"`));
  const isoOnly = vals.filter((v) => /^\d{4}-\d{2}-\d{2}$/.test(v)).sort();
  if (isoOnly.length) say(`   ISO-format date range observed         : ${isoOnly[0]} -> ${isoOnly[isoOnly.length - 1]}`);
  say(`   blank dates                            : ${recs.filter((r) => isBlank(r[col])).length}`);
}

h1('13, 14, 15, 17, 18. IMPOSSIBLE / NEGATIVE / ZERO / OUT-OF-RANGE NUMBERS');
const toNum = (v) => {
  let s = String(v).trim().replace(/[\s, ]/g, '').replace(/(kd|kwd|د\.ك)/gi, '');
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  if (s.startsWith('-')) { neg = true; s = s.slice(1); }
  if (s === '' || !/^\d*\.?\d+$/.test(s)) return NaN;
  return neg ? -Number(s) : Number(s);
};
for (const col of header) {
  const parsed = recs
    .map((r) => ({ line: r.__line, raw: String(r[col]).trim(), n: toNum(r[col]) }))
    .filter((x) => x.raw !== '');
  const good = parsed.filter((x) => Number.isFinite(x.n));
  if (!good.length || good.length < parsed.length * 0.5) continue;
  if (/date|^id$|id$/i.test(col)) continue;
  const ns = good.map((x) => x.n).sort((a, b) => a - b);
  const q = (p) => ns[Math.min(ns.length - 1, Math.floor(p * (ns.length - 1)))];
  const iqr = q(0.75) - q(0.25);
  const hiFence = q(0.75) + 3 * iqr;
  const negs = good.filter((x) => x.n < 0);
  const zeros = good.filter((x) => x.n === 0);
  const nonNum = parsed.filter((x) => !Number.isFinite(x.n));
  const outliers = iqr > 0 ? good.filter((x) => x.n > hiFence) : [];
  const nonInt = good.filter((x) => !Number.isInteger(x.n));
  const mean = ns.reduce((a, b) => a + b, 0) / ns.length;
  say(`\n"${col}"  n=${good.length}  min=${ns[0]}  p25=${q(0.25)}  median=${q(0.5)}  p75=${q(0.75)}  max=${ns[ns.length - 1]}  mean=${mean.toFixed(3)}`);
  say(`   negative values     : ${negs.length}${negs.length ? '  -> ' + negs.map((x) => `line ${x.line} "${x.raw}"`).join('; ') : ''}`);
  say(`   zero values         : ${zeros.length}${zeros.length ? '  -> lines ' + zeros.map((x) => x.line).join(', ') : ''}`);
  say(`   non-integer values  : ${nonInt.length}`);
  say(`   non-numeric text    : ${nonNum.length}${nonNum.length ? '  -> ' + nonNum.map((x) => `line ${x.line} "${x.raw}"`).join('; ') : ''}`);
  say(`   extreme high outliers (> p75 + 3*IQR${iqr > 0 ? ` = ${hiFence.toFixed(3)}` : ', n/a'}) : ${outliers.length}${outliers.length ? '  -> ' + outliers.map((x) => `line ${x.line} "${x.raw}"`).join('; ') : ''}`);
  say(`   blank cells         : ${recs.filter((r) => isBlank(r[col])).length}`);
}

h1('19. OTHER INCONSISTENCIES');
say(`Rows with at least one empty cell           : ${recs.filter((r) => header.some((h) => isBlank(r[h]))).length}`);
say(`Rows fully populated                        : ${recs.filter((r) => header.every((h) => !isBlank(r[h]))).length}`);
const wsRows = recs.filter((r) => header.some((h) => String(r[h]) !== String(r[h]).trim()));
say(`Rows with untrimmed whitespace              : ${wsRows.length}${wsRows.length ? '  (lines ' + wsRows.map((r) => r.__line).join(', ') + ')' : ''}`);
const weird = recs.filter((r) => header.some((h) => /[ ​\t]/.test(String(r[h]))));
say(`Rows with nbsp / zero-width / tab chars      : ${weird.length}${weird.length ? '  (lines ' + weird.map((r) => r.__line).join(', ') + ')' : ''}`);
const nonAscii = recs.filter((r) => header.some((h) => /[^\x20-\x7E]/.test(String(r[h]))));
say(`Rows containing non-ASCII characters         : ${nonAscii.length}${nonAscii.length ? '  (lines ' + nonAscii.map((r) => r.__line).join(', ') + ')' : ''}`);
const dupHeaders = header.filter((h, i) => header.indexOf(h) !== i);
say(`Duplicate column names                      : ${dupHeaders.length}${dupHeaders.length ? ' -> ' + dupHeaders.join(', ') : ''}`);
say(`Unnamed columns                             : ${header.filter((h) => h === '').length}`);

say();
say('END OF AUDIT — this script read the file only; nothing was modified.');
console.log(out.join('\n'));
