/* =====================================================================
   WHAT IS DUE SOON?
   ---------------------------------------------------------------------
   Works out today's date in Kuwait, finds everything due TOMORROW,
   and builds the reminder email.

   If nothing is due tomorrow this returns nothing, so no email is sent.
   ===================================================================== */

const TO = '__STUDENT_EMAIL__';   // <-- your email address
const TZ = 'Asia/Kuwait';         // timezone used to decide what "today" means
const REMIND_DAYS_BEFORE = 1;     // send the reminder this many days before the due date
const LOOKAHEAD_DAYS = 7;         // also list anything else due within this many days

const DAY = 24 * 60 * 60 * 1000;

/* Today as seen in Kuwait, not on the n8n server. */
const todayIso = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());

const midnight = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const today = midnight(todayIso);

const longDate = (iso) => new Date(midnight(iso)).toLocaleDateString('en-GB', {
  timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

const esc = (value) => String(value == null ? '' : value)
  .replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ICONS = { quiz: '📝', test: '📋', exam: '📋', homework: '✏️', project: '🛠️' };
const icon = (task) => ICONS[String(task.type || '').toLowerCase()] || '📌';

/* Keep only rows with a real date, and work out how many days are left. */
const tasks = $input.all()
  .map((item) => item.json)
  .filter((task) => typeof task.due === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(task.due))
  .map((task) => ({ ...task, daysLeft: Math.round((midnight(task.due) - today) / DAY) }));

const dueTomorrow = tasks.filter((task) => task.daysLeft === REMIND_DAYS_BEFORE);
const comingUp = tasks
  .filter((task) => task.daysLeft > REMIND_DAYS_BEFORE && task.daysLeft <= LOOKAHEAD_DAYS)
  .sort((a, b) => a.daysLeft - b.daysLeft);

/* Nothing due tomorrow -> no items -> no email. */
if (dueTomorrow.length === 0) return [];

const card = (task) => `
  <tr>
    <td style="padding:0 0 12px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="border:1px solid #E3E8EF;border-left:4px solid #2563EB;border-radius:10px;background:#FFFFFF">
        <tr>
          <td style="padding:16px 18px" dir="auto">
            <div style="font:600 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#64748B">
              ${icon(task)} ${esc(task.subject || 'School')} &middot; ${esc(task.type || 'Task')}
            </div>
            <div style="font:700 18px/1.35 Arial,Helvetica,sans-serif;color:#0F172A;margin:6px 0 4px">
              ${esc(task.title)}
            </div>
            <div style="font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#475569">
              ${esc(task.details)}
            </div>
            <div style="font:600 13px/1.5 Arial,Helvetica,sans-serif;color:#B45309;margin-top:10px">
              Due: ${esc(longDate(task.due))}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;

const comingUpRow = (task) => `
  <tr>
    <td style="padding:7px 0;border-bottom:1px solid #E3E8EF">
      <span dir="auto" style="font:600 14px/1.5 Arial,Helvetica,sans-serif;color:#0F172A">${icon(task)} ${esc(task.title)}</span>
      <span style="font:400 13px/1.5 Arial,Helvetica,sans-serif;color:#64748B">
        &nbsp;— ${esc(longDate(task.due))} (in ${task.daysLeft} days)
      </span>
    </td>
  </tr>`;

const titles = dueTomorrow.map((task) => task.title);
const subject = dueTomorrow.length === 1
  ? `Reminder: ${titles[0]} is tomorrow (${longDate(dueTomorrow[0].due)})`
  : `Reminder: ${dueTomorrow.length} things due tomorrow — ${titles.slice(0, 2).join(', ')}` +
    (titles.length > 2 ? ` +${titles.length - 2} more` : '');

const html = `<!doctype html>
<html><body style="margin:0;padding:24px 12px;background:#F1F5F9">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;background:#F1F5F9">

        <tr><td style="padding:0 0 18px 0">
          <div style="font:700 22px/1.3 Arial,Helvetica,sans-serif;color:#0F172A">
            ⏰ Due tomorrow — ${dueTomorrow.length} ${dueTomorrow.length === 1 ? 'thing' : 'things'}
          </div>
          <div style="font:400 14px/1.6 Arial,Helvetica,sans-serif;color:#64748B;margin-top:4px">
            Today is ${esc(longDate(todayIso))}. Here is what to get ready tonight.
          </div>
        </td></tr>

        ${dueTomorrow.map(card).join('')}

        ${comingUp.length ? `
        <tr><td style="padding:14px 0 6px 0">
          <div style="font:700 12px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#64748B">
            Also coming up
          </div>
        </td></tr>
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="background:#FFFFFF;border:1px solid #E3E8EF;border-radius:10px;padding:6px 16px">
            ${comingUp.map(comingUpRow).join('')}
          </table>
        </td></tr>` : ''}

        <tr><td style="padding:20px 0 0 0">
          <div style="font:400 12px/1.6 Arial,Helvetica,sans-serif;color:#94A3B8">
            Sent automatically by my n8n study reminder, one day before each due date.
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;

return [{
  json: {
    to: TO,
    subject,
    html,
    dueTomorrowCount: dueTomorrow.length,
    comingUpCount: comingUp.length,
    checkedOn: todayIso,
  },
}];
