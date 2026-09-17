/* Runs the two Code nodes outside n8n, with a fake "today", so the
   date logic can be checked before importing the workflow.
      node build/test.js
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = __dirname;
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');

function runNode(code, inputItems, fakeToday, mode = 'production') {
  const RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...args) { return args.length ? new RealDate(...args) : new RealDate(fakeToday); }
    static now() { return new RealDate(fakeToday).getTime(); }
  }
  const sandbox = {
    $input: { all: () => inputItems },
    $execution: { mode },
    Intl, console,
    Date: fakeToday ? FakeDate : RealDate,
  };
  const fn = vm.runInNewContext('(function(){' + code + '})', sandbox);
  return fn();
}

const tasksCode = read('tasks.js');
const checkCode = read('check-due.js').replace('__STUDENT_EMAIL__', 'student@example.com');

const tasks = runNode(tasksCode, [], null);
console.log('tasks loaded:', tasks.length);

const days = [
  ['2026-09-12T15:00:00Z', 'day before the Chemistry notes date (13/9)'],
  ['2026-09-16T15:00:00Z', 'day before Thursday 17/9 — 3 things'],
  ['2026-09-17T15:00:00Z', 'day before Friday 18/9 — nothing'],
  ['2026-09-19T15:00:00Z', 'day before Sunday 20/9 — 2 things'],
  ['2026-09-22T15:00:00Z', 'day before Wednesday 23/9 — Islamic test'],
];

let best = null;
for (const [when, label] of days) {
  const out = runNode(checkCode, tasks, when, 'production');
  if (out.length === 0) {
    console.log(`\n${when.slice(0, 10)}  (${label})\n   -> no email sent`);
  } else {
    const j = out[0].json;
    console.log(`\n${when.slice(0, 10)}  (${label})\n   -> to: ${j.to}\n   -> subject: ${j.subject}` +
                `\n   -> due tomorrow: ${j.dueTomorrowCount}, coming up: ${j.comingUpCount}`);
    if (!best || j.dueTomorrowCount + j.comingUpCount > best.score) {
      best = { score: j.dueTomorrowCount + j.comingUpCount, html: j.html };
    }
  }
}

// A manual run must always produce an email, even with nothing due tomorrow.
console.log('\n--- pressing "Execute Workflow" by hand on 2026-09-17 (nothing due 18/9) ---');
const manual = runNode(checkCode, tasks, '2026-09-17T15:00:00Z', 'test');
if (manual.length === 0) {
  console.log('   -> FAIL: manual run sent nothing');
  process.exitCode = 1;
} else {
  console.log(`   -> subject: ${manual[0].json.subject}`);
  console.log(`   -> test email: ${manual[0].json.isTestEmail}, items listed: ${manual[0].json.comingUpCount}`);
  fs.writeFileSync(path.join(dir, 'preview-test.html'), manual[0].json.html);
}

if (best) {
  fs.writeFileSync(path.join(dir, 'preview.html'), best.html);
  console.log('\nPreview of the fullest email written to build/preview.html');
}
