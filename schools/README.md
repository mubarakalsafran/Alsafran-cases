# Kuwait Schools Guide — دليل مدارس الكويت

A complete, dependency-free directory platform that helps parents in Kuwait find, compare and
choose a school: curricula, annual tuition per grade level, years offered, locations, official
Instagram accounts and moderated parent reviews — with a full admin dashboard behind it.

```bash
cd schools && python3 -m http.server 8080   # then open http://localhost:8080
```

No build step, no npm install, no framework. Twelve HTML pages, one stylesheet, four scripts.

---

## Nine records were removed because they could not be verified

The seed catalogue I first shipped contained **nine schools that appear not to exist.** They were
cross-checked against the International Schools Database listing of 46 Kuwait schools and against
targeted searches; none of them appears in either:

| Removed | What the search actually found |
|---|---|
| Gulf American School | Nothing. Searches surface *Gulf English* School |
| Al Rowad American School | No Kuwait school of that name |
| Sabah Al Salem British Academy | Nothing; the school in that area is American United School |
| Little Hearts Nursery | Only exists in the UAE |
| Kangaroo Kids Nursery | A Dubai nursery, since renamed Yellow Kite |
| Sunflower Bilingual Nursery | Nothing |
| Bright Start Early Learning Centre | Only match is in Australia |
| Tiny Steps Nursery | Nothing |
| Discovery Kindergarten | Nothing |

A parent could have tried to enrol at a school that was never there. Fees and phone numbers were
flagged as unverified from the start, but the *names* were presented as real, and for these nine
they were not.

Six **real** early-years providers replace them — The Sunshine Kindergarten, Little Me Preschool,
Busy Bodies Montessori, Bubbles Montessori, Lollipops English Nursery and J's Preschool — each
with a source recorded, and each carrying deliberately thin data. Thin and true beats rich and
invented. They use a fourth `feeBasis`, `unknown`: no figure at all, which is a different claim
from *the school does not publish its fees* and from *this is an estimate*.

**34 schools** now: American 9 · British 8 · Indian 8 · Early Years 7 · IB 2.

## Fee data and where it comes from

Fees were gathered from the schools' own websites and a cross-checked fee directory. Every school
carries a `feeBasis` and a badge in the UI saying how good its numbers are:

| `feeBasis` | Badge | Meaning | Count |
|---|---|---|---|
| `school` | Fees from the school's website | Taken from the school's own official site, with the source URL and academic year | 4 |
| `directory` | Published fee data | From the International Schools Database, cross-checked against schools' own figures | 15 |
| `on-request` | Fees on request | The school publishes no fees; the profile says so and gives the contact route | 3 |
| `estimate` | Estimate — not confirmed | No source found. **The figure is a guess and must not be relied on.** | 18 |

The cross-check matters: for the American School of Kuwait (3,314–5,191 KWD) and Al-Bayan
Bilingual School (2,434–4,505 KWD) the directory matches the schools' own published figures
exactly, which is why the `directory` tier is trusted — but it is still not the school, so it is
badged differently.

**The remaining `estimate` schools still need real numbers.** They are mostly nurseries and
Indian-curriculum schools that do not publish fees online. Enter them from the admin
dashboard, which records the source URL and academic year alongside each figure.

### Locations

Coordinates were the worst data in this directory: every school had a lat/lng I had invented from
its district centre. A pin in the wrong street is worse for a parent driving there than no pin at
all, so they are gone. Only **Dasman Bilingual School** carries coordinates, because it is the
only school that publishes a Google Maps link of its own — and that link resolves 4.6 km from
where the invented value sat, in a different governorate.

Each school now carries a `locationBasis`:

| `locationBasis` | Meaning | Count |
|---|---|---|
| `school` | Street address taken from the school's own website, with the source URL | 10 |
| `directory` | Street address from a published listing, cross-checked where possible | 8 |
| `unverified` | District only. The profile says so and asks you to confirm with the school | 16 |

Map links are built from the most precise thing actually known — published coordinates, else the
verified address (which Google geocodes correctly), else the school's name and district as a
search rather than a false pin.

Checking the websites also corrected **six districts that were simply wrong**:

| School | Was | Actually |
|---|---|---|
| The English School | Shamiya, Capital | Salmiya, Hawalli |
| Dasman Bilingual School | Hawalli | Kuwait City, Capital |
| Gulf English School | Hawalli | Al Dimnah St, Block 4, Salmiya |
| Indian Community School | Khaitan, Farwaniya | Salmiya (Senior campus) |
| Bhavans SIS | Abbassiya | Jleeb Al Shuyoukh, Farwaniya |
| Indian Educational School | Salmiya | Jleeb Al Shuyoukh, Farwaniya |

Two website URLs in the seed data did not resolve at all (`fsis.edu.kw`, `faips.edu.kw`) and have
been cleared rather than left as dead links; `ais-kuwait.org` and `icsk.edu.kw` were redirected to
their current domains.

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

### Search

The search box suggests as you type, on the homepage and on every listing page:

- **Schools** ranked so the useful match wins — an abbreviation people actually
  use (`BSK`, `ICSK`) beats a stray substring buried in someone else's description. Each row
  carries the logo, curriculum, district, years offered, fee and rating, so the suggestion often
  answers the question without opening the profile.
- **Curricula and areas** as one-tap filters, with a count of how many schools each holds.
- **See all results for "…"** as an escape hatch to the full filtered list.
- An empty box offers the curricula, so the search is useful before anything is typed.
- Arabic school names match too, so typing `البيان` finds Al-Bayan.

It is a proper combobox: `↑`/`↓` move and wrap, `Enter` opens the highlighted row, the first
`Escape` closes the list while keeping what was typed, and a second `Escape` clears the box.
`role`/`aria-expanded`/`aria-activedescendant` are set throughout.

On the directory and section pages the grid also **filters live as you type** (debounced), so
nothing needs the Search button. Only the results repaint, not the filter rail, so the input
keeps focus — and the query lands in the URL, so a search stays shareable.

### Campuses

A school group is not one dot on a map. Where a school teaches at more than one site, every
campus is listed under its name — on the card, in the profile, and in the comparison — each with
its own address, its own provenance badge and its own map link:

| School | Campuses | Areas |
|---|---|---|
| The English Playgroup (EPG) | 4 school campuses | Salwa · Salmiya · Sabah Al-Salem · Fahaheel |
| Indian Community School (ICSK) | 4 branches | Salmiya (Senior, Junior, Amman) · Khaitan |
| American Creativity Academy | 3 campuses | Hawally (boys, kindergarten) · **Salmiya** (girls) |
| Cambridge English School | 2 campuses | Mangaf (primary) · Hawally (secondary) |

ACA's third campus is the one worth calling out: its Salmiya Girls Campus on Al Muthana Street is
the original ACA site, and the directory had the school pinned to Hawalli alone.

This matters for finding a school, not just for describing it: **a school is matched by any of its
campus districts.** Filtering to Fahaheel surfaces The English Playgroup because it has a campus
there, and searching "khaitan" suggests ICSK because one branch is in Khaitan — neither of which
worked when a school was reduced to a single district.

The card de-duplicates areas (ICSK reads *"4 campuses: Salmiya · Khaitan"*, not Salmiya three
times) because the count already says how many there are. Provenance is per campus, since a group
typically publishes one address properly and the rest not at all — ICSK's Senior address comes
from its own site and is badged accordingly, while the other three branches are not.

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

### Viewing it as a single file

`bundle.py` packs all twelve pages, the stylesheet and the four scripts into one
self-contained HTML file that routes on the hash — useful for sharing, or for opening the guide
where a folder of files is awkward:

```bash
python3 bundle.py                      # → dist/kuwait-schools-guide.html (~262 KB)
python3 bundle.py /tmp/preview.html    # or anywhere you like
```

The multi-page site stays the source of truth; the bundle is generated from it and is
git-ignored, so it can never drift out of sync in the repository. `KSG.Route` is what lets the
same controllers serve both builds: page plus query string comes from the URL on the multi-page
site and from the hash in the bundle.

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
