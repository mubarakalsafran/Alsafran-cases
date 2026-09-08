# ALSAFRAN — Brand, Product & Commerce Blueprint

A complete build-out for **ALSAFRAN** (الصفران) — a premium, youth-driven phone case and
tech-accessories brand launching in Kuwait, designed from day one to scale across the GCC
and read as an international lifestyle label.

> **Positioning line:** Protection is the minimum. We make the case part of the outfit.

---

## What's in this repository

### `docs/` — the strategy
| File | Contents |
|---|---|
| [`01-brand-identity.md`](docs/01-brand-identity.md) | Naming, slogan, story, mission, audience, personality, tone, visual identity, logo direction, type, colour, social handles |
| [`02-product-concept.md`](docs/02-product-concept.md) | Product architecture, all 8 style families, materials, finishes, MagSafe, protection specs, model roadmap |
| [`03-usp.md`](docs/03-usp.md) | 5 defensible differentiators + why each is hard to copy |
| [`04-kuwait-gcc-market.md`](docs/04-kuwait-gcc-market.md) | Kuwait market reality, buying behaviour, calendar, then a country-by-country GCC expansion sequence |
| [`05-pricing.md`](docs/05-pricing.md) | Full unit economics in KWD, three positioning tiers, bundles, personalisation, limited editions |
| [`06-packaging-unboxing.md`](docs/06-packaging-unboxing.md) | Packaging system, costed BOM, unboxing choreography, UGC triggers |
| [`07-online-store.md`](docs/07-online-store.md) | Site architecture, every page wireframed, product page spec, tech stack, payments, performance budget |
| [`08-launch-strategy.md`](docs/08-launch-strategy.md) | 14-stage launch plan, week-by-week, with named content ideas for TikTok / Reels / Stories |
| [`09-first-collection.md`](docs/09-first-collection.md) | DROP 01 — "GOLD ROUTE": 11 cases, fully specified |
| [`10-long-term-vision.md`](docs/10-long-term-vision.md) | Category roadmap from cases to a lifestyle house, Year 0 → Year 5 |
| [`11-recommendation-and-budget.md`](docs/11-recommendation-and-budget.md) | **Final recommendation, startup budget in KWD, what to launch with, first 10 actions** |

### `brandbook/` — the strategy as a private, gated website
The same eleven documents as a login-protected reader: contents, search, progress, a
confidential watermark, and print-to-PDF. The book is AES-256-GCM encrypted, so the login
page is real protection rather than a hidden `<div>` — see
[`brandbook/README.md`](brandbook/README.md).

```bash
python3 -m http.server 8080   # from the repo root, then open /brandbook/
```
Default access code **`goldroute`** — change it with
`ALSAFRAN_CODE="…" python3 brandbook/build.py` before sharing.

### `site/` — a working storefront prototype
A mobile-first, dependency-free static prototype of the full store: 11 pages, live cart,
model/colour/MagSafe selection, and a working case customiser with live preview.

```bash
cd site && python3 -m http.server 8080   # then open http://localhost:8080
```

Pages: `index` · `shop` · `product` · `drops` · `best-sellers` · `customize` ·
`collections` · `about` · `faq` · `track-order` · `contact`

It is a **design and UX reference**, not the production store — see
[`07-online-store.md`](docs/07-online-store.md) for the recommended production stack
(Shopify + custom theme) and how this prototype maps onto it.

---

## Start here
If you read one file, read [`11-recommendation-and-budget.md`](docs/11-recommendation-and-budget.md).

If you want to *send* this to someone — a designer, a manufacturer, an investor — send them
the `brandbook/` site with the access code, not the raw markdown.
