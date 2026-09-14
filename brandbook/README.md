# ALSAFRAN — Brand Blueprint (gated website)

The strategy in `../docs/` as a private, password-gated website instead of a PDF:
a login page, then a reader with contents, search, per-section progress, a confidential
watermark, and a print-to-PDF escape hatch.

```bash
ALSAFRAN_CODE="your-code" python3 brandbook/build.py   # writes content.enc
python3 -m http.server 8080          # from the REPO ROOT, not this folder
# open http://localhost:8080/brandbook/
```

**There is no default access code, by design.** You set one at build time; it is never
stored in this repository. `content.enc` is gitignored for the same reason — a public repo
must not carry the ciphertext next to anything that could name its key.

> Web Crypto only runs in a secure context, so open the site over `https://` or on
> `localhost`. Opening `index.html` as a `file://` path will not decrypt.

---

## How the login actually protects it

A static site can't check a password on a server, so the usual "login page" is theatre —
the content sits in the HTML and anyone can read it with *View Source*.

This one doesn't work that way. `build.py` **encrypts the entire book with AES-256-GCM**,
with the key derived from the access code (PBKDF2-HMAC-SHA256, 310,000 iterations). The
browser derives the same key from what you type and decrypts in memory. So:

- `content.enc` on the server is ciphertext. Without the code it is noise.
- A wrong code doesn't "fail a check" — decryption itself fails.
- Nothing readable is ever in the page source before unlock.

**What it is not:** it is one shared code, so it can't revoke a single person, it can't tell
you who opened it, and anyone with the code can pass it on. The watermark (the viewer's email
across every page and every print) is a social deterrent, not enforcement.

**If you need real access control** — per-person accounts, revocation, an audit log — put a
host-level gate in front of the whole folder and keep the encryption as a second layer:

| Host | How |
|---|---|
| **Cloudflare Pages + Access** | Free for small teams. Named emails or one-time email PINs, real logs, instant revocation. **Best option here.** |
| **Vercel** | Project → Settings → Deployment Protection → Password Protection (Pro) |
| **Netlify** | Site → Access control → Password protection, or role-based with Identity |
| **Any Nginx/Apache host** | HTTP basic auth over TLS (`htpasswd`) — crude but effective |

## Choosing and changing the access code

```bash
ALSAFRAN_CODE="your-new-code" python3 brandbook/build.py
```

That re-encrypts `content.enc` with a fresh random salt and IV. Anyone holding the old code
is locked out immediately. Rebuild after every edit to `docs/*.md` too — the site reads only
`content.enc`, never the markdown.

Rules for the code, because there is no server to stop guessing:

- **At least 12 characters** — the build refuses anything shorter. Anyone who downloads
  `content.enc` can grind guesses against it offline, as fast as their hardware allows, with
  no login page and no rate limit in the way.
- **Never commit it, and never put it in a README.** Write it down where you keep passwords
  and send it to people separately from the link.
- Rotate it whenever someone who had it should no longer have it.

Requirements: `pip install markdown pycryptodome`.

## What the reader does
- **Contents cover** — all 11 sections with summaries and read times
- **Sidebar** — sections, sub-headings for the open section, read-progress bar
- **Search** — over headings *and* full body text, with highlighted snippets
  (`/` focuses it; on a phone press Enter to reveal the results)
- **Deep links** — `#pricing`, or `#pricing--5-3-bundle-pricing` for a specific heading,
  so you can send someone straight to one table
- **PDF** — the topbar button stages all 11 sections and opens the print dialogue, so you
  still get a PDF when someone insists on one
- **Watermark** — the signed-in email plus the date, on screen and in print
- **Sign out** — forgets the code on this device
- **Alt+←/→** — previous/next section

## Files
| File | Contents |
|---|---|
| `build.py` | `docs/*.md` → HTML → one JSON payload → AES-256-GCM → `content.enc` |
| `index.html` | The login page and the reader shell |
| `assets/book.css` | Reader styling, on the same brand tokens as the storefront, plus print styles |
| `assets/book.js` | Key derivation, decryption, routing, search, watermark, print |
| `content.enc` | The encrypted book — the only content file the site loads |

`content.enc` is generated. The readable source of truth is always `../docs/*.md`.
