'use client';
import { Card, Kpi } from '../ui';
import { AUDIT, CLEANING_LOG, EXCLUDED, METRICS } from '@/lib/data';
import { int, kd } from '@/lib/compute';

const BEFORE_AFTER: { after: string; before: [string, number][]; note: string }[] = [
  { after: 'Al Jahra', note: '4 spellings → 1 area of 33 orders, not two areas of 19 and 14',
    before: [['al jahra', 10], ['Al Jahra', 9], ['JAHRA', 8], ['Jahra', 6]] },
  { after: 'Salmiya', note: '6 spellings, including two with stray spaces and one with a trailing h',
    before: [['salmiya', 6], ["' Salmiya '", 5], ['SALMIYA', 5], ["'Salmiya '", 3], ['Salmiyah', 3], ['Salmiya', 1]] },
  { after: 'Hawally', note: '5 spellings, one padded with a leading space, one spelled Hawalli',
    before: [["' Hawally'", 8], ['Hawally', 6], ['hawally', 5], ['Hawalli', 5], ['HAWALLY', 3]] },
  { after: 'Delivered', note: 'The misspelling "Deliverd" alone is 42 rows — 22% of the file',
    before: [['Delivered', 44], ['Deliverd', 42], ['delivered', 37], ['DELIVERED', 33]] },
  { after: 'Cancelled', note: 'One American spelling hiding among the British ones',
    before: [['cancelled', 12], ['Cancelled', 6], ['Canceled', 2]] },
  { after: 'KNET', note: 'Four spellings of one payment method, including a hyphenated form',
    before: [['knet', 21], ['K-Net', 20], ['KNET', 15], ['Knet', 12]] },
];

export default function Quality() {
  const changed = CLEANING_LOG.reduce((a, e) => a + e.rows_affected, 0);
  const A = AUDIT;
  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold tracking-tight">What we fixed — and why</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-1">
          The raw file was audited before a single value was changed. Every issue below carries an exact
          count, every fix carries a reason, and every removed row is listed by line number. Nothing was
          deleted quietly.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Original rows" value={METRICS.raw_rows} sub="kuwait-orders-dirty.csv, 11 columns" />
        <Kpi label="Rows retained" value={METRICS.clean_rows} tone="accent" sub={`${METRICS.unique_order_ids} unique order IDs — one row per order`} />
        <Kpi label="Rows excluded" value={METRICS.excluded_rows} sub="5 duplicates + 1 contradictory row, all listed below" />
        <Kpi label="Field-level fixes" value={changed} sub="Individual values corrected across 13 documented decisions" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Duplicate rows found" value={5} sub="3 byte-identical, 2 visible only after standardising" />
        <Kpi label="Missing values" value={A.email_missing + 1 + A.columns_detail.area.blank_or_missing}
             sub={`${A.email_missing} emails, 1 phone, ${A.columns_detail.area.blank_or_missing} areas`} />
        <Kpi label="Impossible values" value={7} sub="1 negative amount, 1 negative qty, 1 zero qty, 1 qty of 999, 3 truncated amounts" />
        <Kpi label="Spellings standardised" value={29 + 9 + 10} sub="29 area, 9 status, 10 payment spellings → 8, 3 and 4 real categories" />
      </div>

      <Card className="p-5">
        <h3 className="text-base font-semibold">The row count balances</h3>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-lg border border-line bg-ink-2 px-3 py-2"><strong className="numeric">195</strong> original</span>
          <span className="text-text-2">=</span>
          <span className="rounded-lg border border-accent/40 bg-ink-2 px-3 py-2"><strong className="numeric text-accent">189</strong> retained</span>
          <span className="text-text-2">+</span>
          <span className="rounded-lg border border-line bg-ink-2 px-3 py-2"><strong className="numeric">6</strong> excluded</span>
          <span className="ml-2 rounded-full border border-accent-3/40 px-3 py-1 text-xs font-semibold text-accent-3">checked ✓</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-text-1">
          A second check: every one of the 189 retained rows satisfies <code>amount_kd = unit price × quantity</code>,
          and item revenue sums to {kd(METRICS.delivered_revenue_kd)} KD — exactly the headline delivered revenue.
        </p>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold">What was excluded — all {EXCLUDED.length} rows, by line number</h3>
        <p className="mt-1 text-sm text-text-1">
          {EXCLUDED.length} rows were excluded from the cleaned dataset. Five were duplicates. One had fields
          that contradicted each other and could not be repaired without guessing.
        </p>
        <div className="scrollx mt-3">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-text-2">
              <th className="py-2 pr-3">Line in raw file</th><th className="py-2 pr-3">Order ID</th><th className="py-2">Why it was excluded</th>
            </tr></thead>
            <tbody>
              {EXCLUDED.map((e) => (
                <tr key={e.line_in_raw_file} className="border-b border-line/60 align-top">
                  <td className="numeric py-2 pr-3 font-medium">{e.line_in_raw_file}</td>
                  <td className="py-2 pr-3 font-medium text-accent">{e.order_id}</td>
                  <td className="py-2 leading-relaxed text-text-1">{e.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 rounded-lg border border-line bg-ink-2 p-3 text-xs leading-relaxed text-text-1">
          <strong className="text-accent-2">Two more rows are kept but partly excluded from charts.</strong>{' '}
          2 orders have a blank area, so they appear in every headline total but in no area bar
          (a {kd(METRICS.delivered_revenue_unknown_area_kd)} KD gap). 2 orders have an unusable date —
          <code> 31/09/2026</code>, a day that does not exist, and <code>2027-09-03</code>, a year outside the
          trading period — so they count everywhere except the time axis. Guessing those dates would have been
          inventing data.
        </p>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold">The cleaning log — {CLEANING_LOG.length} decisions</h3>
        <p className="mt-1 text-sm text-text-1">One row per decision. No change was made without a reason.</p>
        <div className="scrollx mt-3">
          <table className="w-full min-w-[900px] text-sm">
            <thead><tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-text-2">
              <th className="w-[26%] py-2 pr-4">What was wrong</th><th className="w-[24%] py-2 pr-4">What I did</th>
              <th className="w-[38%] py-2 pr-4">Why</th><th className="py-2 text-right">Rows affected</th>
            </tr></thead>
            <tbody>
              {CLEANING_LOG.map((e, i) => (
                <tr key={i} className="border-b border-line/60 align-top hover:bg-ink-2">
                  <td className="py-3 pr-4 leading-relaxed">{e.problem}</td>
                  <td className="py-3 pr-4 leading-relaxed text-text-1">{e.fix}</td>
                  <td className="py-3 pr-4 leading-relaxed text-text-2">{e.why}</td>
                  <td className="numeric py-3 text-right font-semibold text-accent">{int(e.rows_affected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold">Before → after</h3>
        <p className="mt-1 text-sm text-text-1">Real values from the file, with the row count each spelling carried.</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {BEFORE_AFTER.map((b) => (
            <div key={b.after} className="rounded-xl border border-line bg-ink-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {b.before.map(([v, n]) => (
                    <code key={v} className="rounded border border-line bg-ink-0 px-1.5 py-0.5 text-[11px] text-text-2">
                      {v} <span className="numeric text-text-2/70">×{n}</span>
                    </code>
                  ))}
                </div>
                <span className="text-accent">→</span>
                <code className="rounded border border-accent/40 bg-ink-0 px-2 py-0.5 text-[12px] font-semibold text-accent">{b.after}</code>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-2">{b.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold">The audit, before anything was changed</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-2">Date formats</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.entries(A.date_formats).map(([k, v]) => (
                <li key={k} className="flex justify-between gap-3"><span className="text-text-1">{k}</span><span className="numeric font-semibold">{v}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-2">Amount formats</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.entries(A.amount_formats).map(([k, v]) => (
                <li key={k} className="flex justify-between gap-3"><span className="text-text-1">{k}</span><span className="numeric font-semibold">{v}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-2">Distinct raw spellings</h4>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.entries(A.variants).map(([k, v]) => (
                <li key={k} className="flex justify-between gap-3"><span className="text-text-1">{k}</span><span className="numeric font-semibold">{v.distinct_raw_strings}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="https://cdn.jsdelivr.net/gh/mubarakalsafran/Alsafran-cases@20b4fab/aifc-day8/data/kuwait-orders-clean.csv" target="_blank" rel="noopener"
             className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20">
            Cleaned CSV — 189 rows
          </a>
          <a href="https://cdn.jsdelivr.net/gh/mubarakalsafran/Alsafran-cases@20b4fab/aifc-day8/data/raw/kuwait-orders-dirty.csv" target="_blank" rel="noopener"
             className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-text-1 hover:border-accent hover:text-accent">
            Original raw CSV — 195 rows, untouched
          </a>
        </div>
      </Card>
    </div>
  );
}
