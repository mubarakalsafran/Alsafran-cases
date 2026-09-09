# Kuwait Schools Guide — دليل مدارس الكويت

A complete, dependency-free directory platform that helps parents in Kuwait find, compare and
choose a school: curricula, annual tuition per grade level, years offered, locations, official
Instagram accounts and moderated parent reviews — with a full admin dashboard behind it.

```bash
cd schools && python3 -m http.server 8080   # then open http://localhost:8080
```

No build step, no npm install, no framework. Twelve HTML pages, one stylesheet, four scripts.

---

## Fee data and where it comes from

Fees were gathered from the schools' own websites and a cross-checked fee directory. Every school
carries a `feeBasis` and a badge in the UI saying how good its numbers are:

| `feeBasis` | Badge | Meaning | Count |
|---|---|---|---|
| `school` | Fees from the school's website | Taken from the school's own official site, with the source URL and academic year | 4 |
| `directory` | Published fee data | From the International Schools Database, cross-checked against schools' own figures | 15 |
| `on-request` | Fees on request | The school publishes no fees; the profile says so and gives the contact route | 3 |
| `estimate` | Estimate — not confirmed | No source found. **The figure is a guess and must not be relied on.** | 19 |

The cross-check matters: for the American School of Kuwait (3,314–5,191 KWD) and Al-Bayan
Bilingual School (2,434–4,505 KWD) the directory matches the schools' own published figures
exactly, which is why the `directory` tier is trusted — but it is still not the school, so it is
badged differently.

**The 19 `estimate` schools still need real numbers.** They are mostly nurseries, Indian-curriculum
schools and Arabic-curriculum schools that do not publish fees online. Enter them from the admin
dashboard, which records the source URL and academic year alongside each figure.

Two deliberate choices remain:

- **Phone numbers are not invented.** Only confirmed numbers are stored (ASK, NES, BSK so far);
  everything else shows *"Added once the school confirms"* rather than a plausible-looking Kuwaiti
  landline that might reach a real person.
- **Unknown Instagram handles resolve to a search, not a guess.** Where `ig` is `null`, the icon
  opens an Instagram keyword search, so the directory never links parents to an account that might
  belong to someone else.

Also worth knowing, and stated on the site: **private school fees in Kuwait are set and approved by
the Ministry of Education**, so they move year to year. Every figure is shown with its academic year.

---

## What is in it

### Public site

| Page | What it does |
|---|---|
| `index.html` | Hero search (name / area / curriculum / fee), quick-access cards, top-rated, curriculum breakdown, featured schools |
| `directory.html` | All 41 schools, card grid, full filter rail, sorting, shareable filter URLs |
| `american.html` | American-curriculum schools, including IB schools that also award a US diploma |
| `british.html` | British-curriculum schools — EYFS through IGCSE and A-Level |
| `kindergarten.html` | Nurseries and early-years centres with ages accepted and fees per age band, plus a second section for schools that run their own kindergarten |
| `school.html?id=…` | Full profile: about, fees by grade, facilities, photos, map, contact, reviews, review form |
| `compare.html` | Up to 3 schools side by side — fees per band, curriculum, ratings, accreditation |
| `favorites.html` | The signed-in parent's saved shortlist |
| `login.html` | Login / sign-up tabs, email + password, Google and Apple buttons |
| `account.html` | Profile, saved schools, own reviews and their moderation status |
| `about.html` | What the directory is, data accuracy, how review moderation works |

Menu: **Home · Schools · American · British · Pre-K & Kindergarten · Compare**, plus language,
favourites, compare and login in the header.

### Each school card shows

Logo (generated monogram, no image requests) · name · curriculum badge · star rating and review
count · years offered (e.g. `KG1 – Grade 12`) · ages accepted · district with a Google Maps pin ·
annual tuition per grade band in KWD · Instagram · save · add-to-compare.

### Reviews

**No reviews are seeded.** Every school ships with an empty comment section: the ratings on this
site are only ever what real parents wrote. Nothing was pre-written to make the directory look
busy, so the homepage's top-rated list starts as an invitation to review rather than a leaderboard.

- 1–5 stars, free text, and optional tags for teaching quality, facilities, safety,
  communication and value.
- **Only signed-in accounts can post**, one review per school per account.
- Every submission is held `pending` and is invisible to the public until a moderator approves
  it. The author sees their own pending review marked as such.
- A school's rating is the mean of its published reviews. The homepage only ranks schools with
  **at least two** reviews, so one glowing review cannot top the chart.

### Admin dashboard — `admin.html`

Separate sign-in from parent accounts (its own `ksg_admin` session key).

- **Overview** — total schools, users, published reviews, profile views; most-viewed schools;
  schools by curriculum.
- **Schools** — add, edit and delete. Full form: names (EN/AR), curriculum, grade range, ages,
  district and governorate, coordinates, website, Instagram handle, languages, accreditation,
  facilities, logo colours, featured flag, and a fee editor (`Label | From | To | Amount`).
- **Reviews** — approve, reject or delete every submission, with a pending count badge.
- **Users** — view, block/unblock and delete accounts. The administrator account is protected
  from both, so the dashboard cannot lock itself out.
- **Data & reset** — restore deleted schools, export the live catalogue as JSON, reset edits,
  reviews or everything.

Each school also carries a **verified** flag. Until an administrator ticks *"Fees and contact
details confirmed with the school"*, the profile is badged *Details pending school confirmation*;
once ticked it shows *Verified by the school*. Every seed record ships unverified.

Edits are stored as a **patch layer** over the seed catalogue rather than mutating `data.js`, so
the original data is always recoverable and "Reset" genuinely restores it.

Demo credentials, seeded on first load:

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@kuwaitschools.kw` | `admin1234` |
| Parent | `noura@example.com` | `parent123` |

---

## Design

Calm and trustworthy: navy `#0B2545` → blue `#1B6CA8` on white and near-white, with one warm gold
accent reserved for ratings and one green reserved for "best value" in comparisons. Curriculum
colours are fixed per curriculum and used consistently on badges, filters and charts.

- **Mobile-first and verified**: no horizontal overflow at any width from 300 px to 1600 px,
  checked across all twelve pages with the compare bar active.
- **Full RTL Arabic**: a header toggle flips `dir`, swaps the navigation, all interface strings
  and every static heading and paragraph (carried in `data-ar` attributes), and switches to
  Arabic school names. The stylesheet uses logical properties throughout, so RTL is one attribute
  flip rather than a second stylesheet. School blurbs remain English pending translation.
- **Fast**: no webfonts, no libraries, no image files. Logos and photo tiles are CSS gradients
  and inline SVG, so there is nothing to wait on. The Google map is click-to-load, so no request
  reaches Google until a visitor asks for the map.
- **SEO**: per-page titles, meta descriptions, canonicals, Open Graph and Twitter cards;
  `WebSite` + `SearchAction` structured data on the homepage; `School` structured data on every
  profile with `PostalAddress`, `GeoCoordinates`, fee `Offer`s and `AggregateRating`; a generated
  `sitemap.xml` covering all 41 profiles; `robots.txt` excluding the private pages.

---

## Files

```
schools/
├── index.html directory.html american.html british.html kindergarten.html
├── school.html compare.html favorites.html login.html account.html about.html admin.html
├── assets/css/style.css     design system + every layout
├── assets/js/data.js        41 schools (no seeded reviews), curricula, districts, grade ladder
├── assets/js/app.js         i18n/RTL, auth, favourites, compare, cards, filter engine, chrome
├── assets/js/pages.js       one controller per public page + SEO/JSON-LD injection
├── assets/js/admin.js       dashboard: overview, schools CRUD, moderation, users, data
├── build.py                 regenerates sitemap.xml + robots.txt from data.js
├── sitemap.xml robots.txt
└── README.md
```

Adding or removing schools:

```bash
python3 build.py https://your-real-domain.com   # rewrites sitemap.xml and robots.txt
```

The placeholder origin `https://kuwaitschoolsguide.example` also appears in the `<link rel="canonical">`
and `og:url` tags of each page — search and replace it at deploy time.

---

## What a production deployment must replace

This is a complete front end. Everything a server would normally own is in `localStorage`, which
is what makes the whole platform demonstrable from static hosting — and is exactly what has to
change before real parents use it:

1. **Authentication.** `hash()` in `app.js` is FNV-1a, not a password hash. It only keeps
   plaintext out of `localStorage`; it is not security. Move accounts to a server with
   bcrypt/argon2, HTTP-only session cookies, email verification and rate limiting.
2. **Social sign-in is simulated.** The Google and Apple buttons create a local demo account.
   They need real OAuth.
3. **Shared data.** Reviews, favourites, view counts and admin edits live in one browser, so
   nothing is shared between devices or visitors. These need a database and an API.
4. **Moderation and abuse.** Server-side moderation, spam and duplicate-account detection, and
   an audit trail of who approved what.
5. **Admin authorisation.** The dashboard is client-gated. Real authorisation has to be enforced
   on the server — a client-side check protects nothing.
6. **Verified school data.** Confirmed fees, phone numbers and Instagram handles, plus real
   photography, and ideally a claim-your-listing flow for schools.

The data layer is deliberately shaped for this: `Data.all()` is the single read path and
`Data.reviewsFor()` the single review path, so swapping `localStorage` for `fetch()` is a change
in two functions rather than across twelve pages.
