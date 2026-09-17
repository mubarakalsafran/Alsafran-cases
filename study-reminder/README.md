# Study Reminder — an n8n workflow that emails me one day before each due date

A small n8n workflow. Once a day it looks at my list of quizzes, tests and homework,
and if anything is due **tomorrow** it emails me a reminder. If nothing is due tomorrow,
it sends nothing.

```
Every Day at 6 PM  →  My Tasks  →  Find What Is Due Tomorrow  →  Send Reminder Email
 (Schedule Trigger)    (Code)          (Code)                     (Gmail or SMTP)
```

## Which file to import

| File | Use it if |
|---|---|
| `study-reminder-gmail.json` | Your school email is Gmail / Google Workspace (easiest — just sign in) |
| `study-reminder-smtp.json` | You want to send through any other mail server (needs host, port, user, password) |

## Setup — 5 steps

1. In n8n: **Workflows → ⋯ (top right) → Import from File**, and pick one of the two files above.
2. Open the **Find What Is Due Tomorrow** node. On line 11 replace
   `YOUR_EMAIL_HERE@example.com` with your own email address.
3. Open the **Send Reminder Email** node and connect your account:
   * Gmail version → *Credential to connect with* → **Create new** → sign in with Google.
   * SMTP version → fill in host, port, user and password, and set **From Email**.
4. Press **Execute Workflow** once to test it. A manual run always sends an email, even on a
   day when nothing is due — you will get a `[TEST]` email listing what is coming next.
5. Switch the workflow to **Active** (toggle at the top right). From then on it runs by itself
   every day at 18:00.

## Adding a new quiz or homework

Open the **My Tasks** node and copy one block:

```js
{
  title: 'IB Physics Quiz 2',
  subject: 'Physics',
  type: 'Quiz',                 // Quiz / Test / Homework / Project
  details: 'Topic 3, worksheets 1 and 2.',
  due: '2026-10-05',            // always YYYY-MM-DD
},
```

That is the only node you normally need to touch.

## Settings you can change

All at the top of the **Find What Is Due Tomorrow** node:

| Setting | Default | What it does |
|---|---|---|
| `TO` | your email | Where the reminder is sent |
| `TZ` | `Asia/Kuwait` | The timezone used to decide what "today" is |
| `REMIND_DAYS_BEFORE` | `1` | Send the reminder this many days early — set to `2` for two days' notice |
| `LOOKAHEAD_DAYS` | `7` | Also list anything due within the next week under "Also coming up" |

The reminder time (18:00) is set in the **Every Day at 6 PM** node.

## The email block is not working

Work through these in order.

**1. The Gmail node is grey / says "no data" and no email arrives.**
This is normal, not a fault. On a scheduled run the workflow only sends an email when something
is due *tomorrow*. If tomorrow is empty, the **Find What Is Due Tomorrow** node returns nothing
and the email node never runs. Press **Execute Workflow** by hand — a manual run always sends a
`[TEST]` email, so you can prove the connection works on any day.

**2. The email arrives but shows raw HTML code.**
Open the **Send Reminder Email** node and set **Email Type** to **HTML** (not Text). In the
workflow file this is `"emailType": "html"`.

**3. Red error on the node.** Match the message:

| Error message | What it means | Fix |
|---|---|---|
| `Insufficient Permission` / `403` | The Google sign-in did not include permission to send mail | Delete the Gmail credential, create it again, and tick the send/compose permission when Google asks |
| `invalid_grant` / `Unauthorized` | The sign-in expired, or the school account blocked it | Reconnect the credential. If the school blocks it, use the SMTP version instead |
| `Bad request — Recipient address required` | `sendTo` is empty because no data reached the node | Same as point 1 — run it by hand, or check the Code node above returned an item |
| `Invalid login` / `EAUTH` (SMTP only) | Wrong SMTP username or password | With Gmail SMTP you must use an App Password, not your normal password |

**4. Still nothing.** Open the **Find What Is Due Tomorrow** node and look at its output panel.
If it shows `0 items`, the problem is the dates in **My Tasks**, not the email node.

## What the email looks like

* A heading saying how many things are due tomorrow.
* One card per task: subject, type, title, the details, and the full due date.
* An "Also coming up" list for anything due in the next 7 days.
* Arabic titles display right-to-left correctly.

On a manual run with nothing due tomorrow it instead sends a short `[TEST]` email listing the
next five things, so the workflow can always be demonstrated.

## Testing the date logic without n8n

The two Code nodes are kept as plain files in `build/` so they can be run and checked:

```bash
node build/test.js        # runs the logic against five different "todays"
```

It prints what would be emailed on each day and writes a preview of the email to
`build/preview.html`, which you can open in a browser.

After editing `build/tasks.js` or `build/check-due.js`, rebuild the importable files:

```bash
python3 build/build.py                      # placeholder email
python3 build/build.py me@school.edu.kw     # with my address filled in
```

## Note on privacy

This repository is public, so the files here use a placeholder email address.
Put your real address in after importing, in the **Find What Is Due Tomorrow** node.

## The task list this was built from

| Task | Due |
|---|---|
| Physics Quiz 1 | Thursday 17 Sep 2026 |
| Write Chemistry class notes | Sunday 13 Sep 2026 |
| امتحان إسلامية | Wednesday 23 Sep 2026 |
| Chemistry project — gym plan | Sunday 20 Sep 2026 |
| IB Biology Quiz | Thursday 17 Sep 2026 |
| IB Chemistry Quiz | Sunday 20 Sep 2026 |
| Arabic homework | Thursday 17 Sep 2026 |
