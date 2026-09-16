# ALSAFRAN — Security Audit

**Project:** `mubarakalsafran/Alsafran-cases` · **Audited:** 2026-09-16
**Scope:** the whole repository — `docs/` (11 strategy documents), `brandbook/` (AES-gated
reader + Python build script), `site/` (11-page storefront prototype), and the git history.

---

## 0. What the auditor could and could not see

Stated up front, because the answer changes how much the rest of this is worth.

| Could see | Could not see |
|---|---|
| Every file in the working tree | A live deployment — there isn't one |
| The full git history, both branches, all 2 commits | A hosting dashboard — no Vercel project exists on this account |
| The repository's GitHub settings via the API | A database — no Supabase project exists on this account |
| The actual decrypted contents of `content.enc` | Anything a second human user would see, other than by driving a second browser context (which I did) |

**The brief for this audit described a different project** than the one in this repository —
it described a Supabase database with row level security, email-and-password accounts, and a
Vercel deployment. None of those exist here. Section 3 deals with that properly rather than
inventing findings to fill the categories.

---

## 1. Findings

Worst first. Everything in this table was opened and checked by hand; the two marked
**verified by execution** were additionally proven by running code.

| # | What I found | Where | How bad | Why it matters, in one sentence |
|---|---|---|---|---|
| 1 | The entire "confidential" blueprint is committed in **plaintext** to a **public** repository — landed unit costs, margins, supplier strategy, pricing tiers and the full startup budget | `docs/01-brand-identity.md` … `docs/11-recommendation-and-budget.md` (all 11 files); repo visibility confirmed `private: false` via the GitHub API | **Critical** | A competitor does not need the access code, the login page, or any skill — `docs/05-pricing.md` is a URL, and the AES gate in `brandbook/` is guarding a copy of a document that is lying unlocked right next to it. |
| 2 | The decryption code was **published in the README, in the same repository as the ciphertext it decrypts** — hardcoded as the default and printed twice in documentation | `brandbook/build.py:25` (`DEFAULT_CODE = "goldroute"`), `README.md:37`, `brandbook/README.md:12`, ciphertext at `brandbook/content.enc` (committed in `0afd33f`) | **Critical** — *verified by execution* | I decrypted the committed `content.enc` with `goldroute` and got all 11 sections and 24,090 words back; AES-256-GCM with 310,000 PBKDF2 iterations is worth exactly nothing when the password is printed on the same page as the lock. |
| 3 | "Keep me signed in on this device" is **checked by default**, and it writes the plaintext access code into `localStorage`, where it persists forever | `brandbook/index.html:50` (`<input type="checkbox" id="gateKeep" checked>`), `brandbook/assets/book.js:84` | **High** | Anyone who borrows, inherits or steals the device opens the book with no code, and can read the code itself out of DevTools in about four seconds and forward it — on a page whose own copy asks them not to forward it. |
| 4 | Rotating the access code **cannot un-publish** anything: the old ciphertext and the old code both remain in git history | commit `0afd33f`, `brandbook/content.enc` | **Medium** | Every fix below improves the *next* copy; anyone who cloned this repo before today keeps a permanently decryptable one, so this must be treated as already-disclosed rather than as something a rebuild repairs. |
| 5 | The confidential watermark is presented to the reader as protection, but is a CSS overlay removable from DevTools | `brandbook/assets/book.js:131-139`, gate copy at `brandbook/index.html:56-61` | **Medium** | `brandbook/README.md` is honest that this is "a social deterrent, not enforcement" — but the login page the reader actually sees is more reassuring than the facts support, and reassurance is what makes people forward things. |
| 6 | Attribute values interpolated into the SVG renderer without escaping, while every other value on the same lines is escaped | `site/assets/js/data.js:304` and `:307` (`fill="${fin}"`), `site/assets/js/app.js:248` and `:403` (`${p.arabic}`) | **Low** | Not reachable by a visitor today — these come from static product data and the page's own buttons — but the cart path feeds `i.finish` out of `localStorage` into an HTML attribute, so it is one careless future change away from being real. |
| 7 | Nine inline `onclick` / `onsubmit` handlers, so the site cannot adopt a strict Content-Security-Policy without a rewrite | 6 in markup — `site/contact.html:26,32`, `site/customize.html:95`, `site/drops.html:66`, `site/index.html:118`, `site/product.html:71` — plus 3 injected at runtime from `site/assets/js/app.js:148,222,224` | **Low** | Not a hole now; it removes the single most effective defence the site could otherwise turn on for free the day it starts handling real orders. |
| 8 | Third-party CSS from Google Fonts on every page, with no CSP constraining what it may do | `site/*.html:11-12`, `brandbook/index.html:10-12` | **Low / informational** | Standard practice and low risk, but on the brandbook it means one third party is loaded into the same origin as a document you are calling confidential. |

### Categories that are clean — stated explicitly

| Category | Verdict |
|---|---|
| **Secrets** (API keys, tokens, passwords) | **Clean.** No API key, bearer token, private key, `.env` file or service credential anywhere in the working tree or in either commit of history. The only credential in the project is the access code, which is finding #2. There are no publishable-vs-secret key pairs to classify, because there are no keys. |
| **Input handling** | **Clean.** Every visitor-controlled string that reaches the DOM passes through `esc()` first, including the case customiser's free-text field — `site/assets/js/data.js:302` escapes it *before* it enters the SVG. I tried to get script through the customiser and could not. Finding #6 is about consistency in adjacent code, not a working injection. |
| **What I collect** | **Clean, because nothing is collected.** Every form on the storefront is `preventDefault()` with a toast and a `reset()` — the contact form, the track-order form and the drop-pass phone field send nothing anywhere. There is no database, no analytics, no tracking pixel and no network request carrying user input. The brandbook gate's claim that "your email is stored only on this device" is **true** — I verified it stays in browser storage and is never transmitted. |

---

## 2. Blast radius of finding #1

```
docs/*.md readable by anyone with the URL
   └─> landed cost per unit, per tier
        └─> your true gross margin
             └─> a competitor prices 200 fils under your hero price and still profits
             └─> a supplier quoting you knows your ceiling before negotiating
   └─> the 14-stage launch plan with dates
        └─> a competitor launches a spoiler drop the week before DROP 01
   └─> DROP 01 specified case-by-case
        └─> a faster factory ships your collection before you do
   └─> the startup budget
        └─> anyone bidding for your work knows what you can pay
```

The encryption in `brandbook/` addresses none of this, because it is protecting the second
copy while the first is public.

---

## 3. The finding I believe is WRONG

> **"Row level security is not enabled on any table — CRITICAL. No RLS policies exist, so any
> visitor with the anon key can read and write every row in the database."**
>
> Also wrong for the same reason: *"sign-up, log-in and session handling are insecure"*,
> *"password rules are too weak"*, and *"endpoints are reachable without logging in."*

**Why it is wrong:** there is no database, so there is nothing for row level security to be
missing from.

**What I checked, specifically:**

- `grep -rin "supabase" .` across every `.html`, `.js`, `.py` and `.css` in the repo →
  **zero matches.** The only greps that hit on "password" are a CSS selector
  (`brandbook/assets/book.css:71`), the access-code input's `type="password"`
  (`brandbook/index.html:46`), and prose in a README.
- `mcp__Supabase__list_projects` → `{"projects": []}`. No Supabase project exists.
- `mcp__Vercel__list_teams` → `{"teams": []}`. No Vercel project, and `has_pages: false` on
  the repository, so **the site is not deployed anywhere.**
- There is no server-side code of any kind. `brandbook/build.py` is a build script that runs
  on a laptop; everything else is static HTML, CSS and vanilla JS with no dependencies and no
  `fetch()` to anything but `content.enc`.
- There are no accounts. The brandbook has **one shared access code**, not per-user
  credentials — no sign-up, no sessions, no password reset, nothing to attack.

**The lesson, which is the actual point:** the audit prompt *told* the auditor the project had
Supabase, RLS, accounts and a Vercel deployment. An auditor that trusts its brief will
confidently produce a table of critical database findings for a database that does not exist —
and in doing so will bury finding #1, which is real, critical, and about a hundred plaintext
pages sitting in a public repository. **A finding is only as good as the thing it was checked
against.** Categories that do not apply should be reported as "does not apply," never padded.

---

## 4. Fixes made

Two fixes, smallest change that closes the hole, verified in a browser.

### Fix 1 — remove the published decryption code (finding #2)

**What changed:**

- `brandbook/build.py` — `DEFAULT_CODE = "goldroute"` deleted. The script now **refuses to
  run** unless `ALSAFRAN_CODE` is set to at least 12 characters, and exits with an explanation.
- `README.md` and `brandbook/README.md` — the code no longer appears in either file. Both now
  document that the code is chosen at build time and never enters the repository.
- `brandbook/content.enc` — untracked (`git rm --cached`) and added to `.gitignore`. It is a
  build artifact, which `brandbook/README.md` already said; committing ciphertext whose
  password is in the same repo is what made finding #2 exploitable.
- `brandbook/README.md` now states plainly that rotating the code does not retroactively
  protect a `content.enc` someone already has.

**How to verify it yourself, in a browser:**

1. `python3 brandbook/build.py` → refuses, with an error telling you to set `ALSAFRAN_CODE`.
2. `ALSAFRAN_CODE="pick-your-own-code" python3 brandbook/build.py` → builds.
3. `python3 -m http.server 8080` from the repo root, open `http://localhost:8080/brandbook/`.
4. Type **`goldroute`** → *"That access code is not right."* The gate stays up.
5. Type your new code → the book opens, all 11 sections, contents and search intact.

**Verified here:** the rebuilt `content.enc` rejects `goldroute` and accepts only the
build-time code; the gate rejected `goldroute` in Chromium and opened on the new code with all
11 sections rendering.

### Fix 2 — stop storing the access code on the device by default (finding #3)

**What changed:**

- `brandbook/index.html:50` — the "Keep me signed in" checkbox is no longer `checked` by
  default, and the label now says what it actually does: *"stores the access code in this
  browser."*
- `brandbook/assets/book.js:86` — the viewer's email now follows the same opt-in. Previously
  it was written to `localStorage` unconditionally, even when the reader declined to be
  remembered.

The feature still works; it is now opt-in rather than opt-out. Nothing was redesigned.

**How to verify it yourself, in a browser:**

1. Open the brandbook, note the checkbox is **unchecked**, and sign in with your code.
2. DevTools → Application → Local Storage → confirm `als_bb_code` and `als_bb_viewer` are
   **absent**. Check Session Storage: the code is there, and only there.
3. Open the same URL in a **new tab** → you get the gate again, not the book.
4. Close the browser entirely, reopen → still the gate.
5. Now tick the box and sign in → `als_bb_code` appears in Local Storage, and the next tab
   opens straight into the book. The convenience is intact when you ask for it.

**Verified here:** all ten checks above passed in Chromium, including the second-tab case,
and a smoke test of all six storefront pages plus the cart showed no regressions and no
JavaScript errors.

---

## 5. What is NOT fixed, and is yours to do

**These two matter more than either fix above. Neither is a code change.**

1. **Make the repository private** — `github.com/mubarakalsafran/Alsafran-cases` → Settings →
   General → Danger Zone → Change visibility. This is the only thing that addresses finding
   #1, and no commit can do it for you. I have deliberately not changed it myself: it affects
   who can reach your work, and that is your call to make, not mine.
2. **Treat the current blueprint as already disclosed** (finding #4). It was public in
   plaintext, and the old ciphertext with its published code remains in git history. If the
   pricing and budget genuinely must stay confidential, the numbers need to change — not the
   password.

Also not done: the 2FA screenshot for the deliverable. Turn on two-factor at
`github.com/settings/security` and screenshot it — I cannot do that from here, and you
should not want me to.

---

## 6. C, I or A?

**Confidentiality** — by a distance. This product is currently a document whose entire value
is that nobody outside your circle has read it yet; there is no user data to corrupt and no
service to keep up, so a breach of confidentiality is the *only* failure that costs anything
today, and the one that already happened.

*(That changes the day the real store takes orders: the moment money and addresses are
involved, Integrity moves to the front — a wrong price or a tampered order is worse than a
slow site.)*
