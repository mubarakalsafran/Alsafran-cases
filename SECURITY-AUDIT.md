# ALSAFRAN — Day 6 Security Audit

**Project:** `mubarakalsafran/Alsafran-cases` — brand blueprint (gated site) + storefront prototype
**Audited:** 14 Sep 2026, at commit `0afd33f`
**Line numbers below are as of `0afd33f`** — i.e. before the two fixes at the bottom of this file.

---

## First: what this project actually is

The audit prompt assumed a Supabase database with row level security, email-and-password
accounts, and a Vercel deployment. **None of those exist in this repository.** Auditing it
against a stack it does not have would have produced a page of confident fiction, so here is
the real inventory, taken from the files:

| Assumed | Reality |
|---|---|
| Supabase database + RLS | No database. No Supabase client, no SQL, no migrations, no API calls anywhere. |
| Email + password accounts | No accounts. One shared access code on `brandbook/`; the storefront has no login at all. |
| A back end | None. Every page is static. The contact and track-order forms have no `action` and never transmit anything. |
| Vercel deployment | No `vercel.json` and no deploy config in the repo. The repo itself is **public on GitHub**. |

So categories 2 (database rules) and 4 (accounts, in the multi-user sense) are not "clean" —
they are **not applicable**, which is a different and more useful answer.

---

## Stage 1 — Findings

| # | What I found | Where | Severity | Why it matters |
|---|---|---|---|---|
| 1 | **The entire "confidential" brand book is committed in plain text in a public repo.** `docs/01-…md` through `docs/11-…md` are the exact source the encrypted book is built from. | `docs/*.md` (all 11, tracked); repo visibility = **public** | **CRITICAL** | The AES-256-GCM gate protects a copy of content that is already readable by anyone, with no code, from the repo's own file list. Pricing, unit economics, margins, supplier plan and launch calendar are public right now. |
| 2 | **The access code is published in the repo, beside the ciphertext it decrypts.** `goldroute` appears in the build script and in both READMEs. | `brandbook/build.py:25`, `README.md:37`, `brandbook/README.md:12` | **CRITICAL** | I downloaded the committed `content.enc`, derived the key from the README's own code, and decrypted all 11 sections — 198,392 bytes of plaintext. A lock with the key taped to it is not a lock. |
| 3 | **The plaintext access code was written to `localStorage` and kept forever.** "Keep me signed in on this device" was checked by default, and that branch chose `localStorage` over `sessionStorage`. | `brandbook/assets/book.js:84`, `brandbook/index.html:50` | **HIGH** | The code is the decryption key for the whole book. Anyone who borrows the laptop, or any browser extension, reads `als_bb_code` in one line of DevTools and can forward the key to anyone. It survived reboots. |
| 4 | **One shared code, no identities, no revocation, no log.** Re-encrypting is the only way to remove one person's access, and it removes everyone's. | `brandbook/build.py` design (whole file) | **HIGH** | You cannot answer "who opened this and when", or cut off one recipient. `brandbook/README.md` is honest about this — it is a known limit, not a bug, but it is still the ceiling on how much this gate is worth. |
| 5 | **The book can be brute-forced offline with no rate limit.** There is no server, so an attacker downloads `content.enc` once and guesses at their own hardware's speed. | `brandbook/build.py:120`, `brandbook/assets/book.js:34-37` | **MEDIUM** | PBKDF2-SHA256 at 310k iterations is a sound choice and buys real time — but only against a *long* code. `goldroute` is two dictionary words; that falls in minutes. The code's length is doing the work, not the crypto. |
| 6 | **The email on the gate is never verified, and is the only thing the watermark asserts.** Any string that passes `type="email"` is accepted and stamped across every page and every print. | `brandbook/index.html:41-42`, `brandbook/assets/book.js:83,108` | **MEDIUM** | The watermark looks like attribution and isn't. Someone leaking the book types `someone.else@example.com` and the leaked PDF blames them. Treat it as a deterrent, never as evidence. |
| 7 | **No security headers anywhere** — no CSP, no `X-Frame-Options`/`frame-ancestors`, no `Referrer-Policy`, no `X-Content-Type-Options`. No `vercel.json` or host config exists. | repo-wide (no config file) | **MEDIUM** | The gate page can be framed by any site, so a clickjacking overlay can harvest the code. A CSP would also cap the damage of any future script injection. Cheap to add, nothing to break. |
| 8 | **Cart prices live in `localStorage` and are trusted on read.** `price` is stored per item and summed straight back into the subtotal. | `site/assets/js/app.js:11-12,37-44`, `paint()` at `:183-229` | **MEDIUM** *(today: LOW)* | Harmless in a prototype with no checkout — you can only cheat yourself. It becomes critical the moment a real payment step reads that number. **Price must be recomputed server-side at checkout in the Shopify build.** |
| 9 | **Google Fonts loaded from a third party with no SRI and no CSP.** | every page, line 11-12 (e.g. `site/index.html:11`, `brandbook/index.html:12`) | **LOW** | A compromise of the font CDN could inject CSS into the gate page. Low likelihood, and stylesheets can't be pinned with SRI the way scripts can — it's a reason to have a CSP, not to drop the fonts. |
| 10 | **Track-order shows an order timeline to anyone, regardless of what is typed.** | `site/track-order.html:24-29`, `site/assets/js/app.js:591-596` | **LOW** *(design debt, not a live hole)* | The timeline is hardcoded and no real order data exists, so nothing leaks today. Flagged because the production version must bind the order number to the buyer's email or phone before it displays anything. |
| 11 | **SVG `fill` attributes are interpolated without escaping.** `fill="${fin}"` takes `opt.finish`, which for cart items comes from `localStorage`. | `site/assets/js/data.js:304,307` | **LOW** | Not reachable by an attacker: the only writers are hardcoded `data-f` chips in the page. It is self-XSS at worst — you'd have to edit your own `localStorage` to exploit your own browser. Worth tightening for hygiene, not urgent. |

### Categories that are genuinely clean

- **Secrets (cat. 1):** no API keys, tokens, private keys or `.env` files anywhere in the tree
  or in the two-commit history. I grepped every diff. The only secret is the access code —
  finding #2 — and there is nothing *publishable vs. secret* to classify, because there is no
  third-party service integrated at all.
- **Input handling (cat. 3):** **clean.** Every visitor-supplied string that reaches the DOM
  goes through `esc()` first — `site/assets/js/data.js:302` for the customiser text,
  `app.js:209-211` for the cart, `book.js:262` for search queries. See the rejected finding
  below; I tried to break this and could not.
- **Personal data collected (cat. 5):** **almost nothing, and nothing is transmitted.** The
  contact and track-order forms have no `action` and are cancelled with `preventDefault()`
  (`site/contact.html:32`, `app.js:592`) — what you type never leaves the browser. The only
  personal datum stored anywhere is the brandbook email, held in your own `localStorage` to
  draw the watermark. **You need it** (it's the deterrent) and it is the right amount: no
  name, no phone, no address, no analytics, no third-party trackers.
- **Exposure (cat. 6):** the storefront is *meant* to be public, and is. The brandbook is the
  only thing that was meant to be private — findings #1 and #2 are that story.

---

## The finding I believe is WRONG

> **Claimed:** "The customiser writes visitor input into the DOM via `innerHTML`
> (`site/assets/js/app.js:506`) with no escaping — stored XSS: the payload persists in the
> cart's `localStorage` and re-executes on every page that renders the bag."

**It is wrong.** The chain looks exactly like a real stored-XSS — user input → `innerHTML` →
persisted → re-rendered — and `app.js:506` really does hand raw `st.text` to `caseSVG`.
But **`site/assets/js/data.js:302`** escapes it one function later, before it is interpolated:

```js
const t = esc(isAr ? txt : txt.toUpperCase());
```

I checked the line, then tested it in a browser rather than trusting the read. I removed the
`maxlength="12"` guard first, so the payload could not be blamed on truncation, and set
`#czText` to `"><img src=x onerror=window.__xss=1>`:

```
SVG <text> content   : "\"&gt;&lt;IMG SRC=X ONERROR=WINDOW.__XSS=1&gt;"
injected <img> nodes : 0
window.__xss set     : false
alert dialogs fired  : 0
```

The payload renders as visible text on the case. Two independent controls hold: `esc()` at
`data.js:302`, and `maxlength="12"` at `customize.html:43` capping it at 12 characters anyway.

*(The audit prompt's own premise — "row level security may not be enabled on every table" —
is the second wrong finding: there are no tables. Any audit that answers that question with a
policy list has invented one.)*

---

## Stage 2 — Two fixes, verified by hand

### Fix 1 — Kill the published access code (finding #2)

**What changed**

- `brandbook/build.py` — deleted `DEFAULT_CODE = "goldroute"`. `ALSAFRAN_CODE` is now
  required; the build exits with an explanation if it is missing, and refuses codes shorter
  than 12 characters (finding #5: there is no server to slow a guesser down, so length is the
  only defence). It no longer prints the code on success.
- `README.md`, `brandbook/README.md` — the code is gone from both, replaced with the rule that
  it is never written into the repo.
- `.gitignore` + `git rm --cached` — `brandbook/content.enc` is no longer tracked. A public
  repo should not carry the ciphertext next to anything that could name its key.

**How I verified it**

```
$ python3 brandbook/build.py
ALSAFRAN_CODE is not set. … this script will not invent one.       exit 1
$ ALSAFRAN_CODE="short" python3 brandbook/build.py
ALSAFRAN_CODE is too short (5 chars). Use at least 12 …            exit 1
$ ALSAFRAN_CODE="<a long one>" python3 brandbook/build.py
built 11 sections · 24,090 words                                   exit 0
$ grep -rn "goldroute" .      → nothing outside .git
```

Then I re-ran the attack that proved the finding: derive the key from `goldroute`, try to
decrypt the freshly built `content.enc` → **`goldroute` REJECTED — decryption fails**.
In the browser, typing `goldroute` at the gate now gives *"That access code is not right."*

**What you must do yourself — this fix is not finished without it:**

1. `ALSAFRAN_CODE="a long code of your own" python3 brandbook/build.py`
   (the `content.enc` sitting in your folder right now was built with a throwaway code and
   will not open — that is deliberate.)
2. **Make the repo private, or delete `docs/` from it.** This is finding #1 and I could not
   fix it from the code: the plaintext is public, and *old commits keep the old ciphertext and
   the old code forever* — rotating a code never un-publishes history. GitHub → Settings →
   General → Danger Zone → Change visibility. Thirty seconds, and it is the single highest-value
   action on this list.

### Fix 2 — Stop storing the access code on the device (finding #3)

**What changed**

- `brandbook/assets/book.js` — added `store.setCode()`, which writes the code to
  `sessionStorage` only and clears any `localStorage` copy. The gate now calls it instead of
  `store.set(KEY_SESSION, code, keepEl.checked)`.
- On every page load, `localStorage.removeItem('als_bb_code')` runs — so a device that
  already had the code saved from the old version is cleaned the next time it opens the page.
- `brandbook/index.html` — removed the "Keep me signed in on this device" checkbox it
  replaced, and corrected the gate's own promise to say the code is not saved.

**How I verified it** — driven in a real Chromium browser, not by reading the diff:

```
1. stale localStorage code after reload : null          ← the purge works
2. unlocked, book visible               : 11 sections
3. localStorage["als_bb_code"]          : null          ← the fix
4. sessionStorage["als_bb_code"]        : <tab-scoped>
5. all localStorage keys                : [ 'als_bb_viewer' ]
6. same-tab reload auto-resumes         : yes           ← convenience kept
7. section opens                        : PRICING STRATEGY (KWD)
8. watermark shows viewer               : AUDITOR@EXAMPLE.COM · 2026-09-14 ·
9. fresh session sees gate              : yes — asks for the code again
10. old "goldroute" code                : "That access code is not right."
```

Line 9 is the one that matters: a second browser session — the equivalent of a private window,
or of closing the browser — has to type the code again. Lines 2, 6, 7 and 8 are the check that
I did not break the thing while locking it: unlock, resume, navigation, search and watermark
all still work. I also smoke-tested the storefront, which these fixes do not touch: add-to-bag
still works, cart badge reads 1, zero JS errors.

**Check it yourself in the browser:** open `/brandbook/`, unlock, then DevTools → Application →
Local Storage. `als_bb_code` should not be there; only `als_bb_viewer` and `als_bb_read`.
Now open a private window on the same URL — it must ask for the code.

---

## Not fixed tonight, and why

- **#1 repo visibility** — needs your GitHub account, not a code change. Do it first.
- **#4 one shared code** — real per-person access needs a host-level gate. `brandbook/README.md`
  already recommends Cloudflare Pages + Access, which is free and correct for this.
- **#7 security headers** — needs a `vercel.json` (or equivalent) and a CSP that accounts for
  the inline `onsubmit` on `site/contact.html:32`. Worth one clean session, not a rushed one.
- **#8 cart prices** — correct to leave in a prototype with no checkout; it is a **blocking
  requirement** for the production build, not a bug in this one.

---

## C, I or A?

**Confidentiality** — a phone-case storefront going down for an hour costs one afternoon of
sales, but the blueprint in `docs/` is the whole competitive position: margins, supplier
costs, the launch calendar and the moat. Availability and integrity can be rebuilt; a
competitor reading the pricing model before launch cannot be undone.

---

## Blast radius of the worst finding (#1 + #2)

The hole is one fact: **the repo is public, and it contains both the plaintext blueprint and
the key to the encrypted copy.** Following the arrows outward:

```
PUBLIC REPO  mubarakalsafran/Alsafran-cases
  │
  ├─ docs/*.md — 11 sections, 24,090 words, in the clear, no code needed
  ├─ brandbook/content.enc — the same book, encrypted
  └─ README.md:37 + brandbook/README.md:12 + build.py:25 — the code that opens it
        │
        ▼
  THE WHOLE BLUEPRINT IS READABLE BY ANYONE
        │
        ├─ 05-pricing.md — unit economics, margins, tier pricing in KWD
        │     ├─ a competitor prices just under you, deliberately, before you launch
        │     └─ a supplier sees your cost model *before* you negotiate
        │           └─ every future BOM quote you get is worse — permanently
        │
        ├─ 06-packaging-unboxing.md — the box, costed to the fils
        │     └─ same loss of negotiating position with the printer
        │
        ├─ 08-launch-strategy.md + 09-first-collection.md — the 14-stage calendar,
        │   DROP 01 contents, named content ideas
        │     ├─ someone runs your launch beats before you do
        │     └─ "numbered drop, never restocked" stops being a surprise
        │
        ├─ 01-brand-identity.md — name, slogan, logo direction, social handles
        │     ├─ handles registered before you register them
        │     └─ domain squatted on a name you have not filed yet
        │
        ├─ 03-usp.md — the five differentiators, ranked by how hard they are to copy
        │     └─ hands a copier the shopping list *and* tells them which items are cheap
        │
        └─ 04 + 10 — GCC expansion sequence, 5-year category roadmap
              └─ your second and third moves, to anyone who wants to be there first

  AND SEPARATELY, THE GATE ITSELF
        │
        ├─ anyone who ever read the README holds the code — you cannot know who
        ├─ anyone who downloaded content.enc keeps the plaintext FOREVER,
        │   whatever you change today
        ├─ git history at 0afd33f keeps the old ciphertext AND the old code:
        │   rotating a code does not un-publish a commit
        └─ the watermark that would name a leaker is unverified (finding #6)
              └─ so even after a leak, you cannot tell who did it,
                 and therefore cannot stop the second one

  WHERE IT STOPS BEING ABOUT THIS PROJECT
        └─ if "goldroute" is a code you reuse anywhere else, it is now
           a public word attached to your name on GitHub
```

**The part that does not reverse.** Making the repo private closes the front door, but it does
not reach forks, clones, search-engine caches, or anyone's local copy. Rotating the access
code locks out future readers, not past ones. That asymmetry is the whole lesson: confidentiality
is the one property you cannot restore after it breaks, which is exactly why it is the answer to
the C/I/A question above.

**So the order of operations tonight is:** make the repo private *first* (it stops the bleeding),
rebuild `content.enc` with a long code of your own *second*, and treat everything in `docs/`
as already seen when you plan the launch — because you cannot prove it wasn't.

---

## On the 🌶️ extra — auditing the Day 5 Locker

I did not run it. This session can reach exactly one repository —
`mubarakalsafran/Alsafran-cases` — and the Locker is not in it or beside it. Producing a
findings table for a codebase I cannot open would be the precise failure this whole exercise
is built to teach, so it is not here. Point a session at that repo and the Stage 1 prompt
works unchanged.
