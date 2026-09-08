# 7. Online Store

## 7.1 Principles

1. **Mobile-first is not a style, it's the spec.** 85–90%+ of this audience's traffic is a
   phone, held in one hand, often on mobile data. Design every screen at 390 × 844 first and
   treat desktop as the adaptation.
2. **Thumb-zone rules.** Primary actions (Add to Cart, drop notify, model select) sit in the
   bottom third. A **sticky Add-to-Cart bar** is permanent on product pages.
3. **Three taps to buy.** Home → product → add → pay. Anything that adds a tap costs money.
4. **Speed is a design feature.** Target LCP < 2.0 s on 4G. A 5-second homepage is worse than
   an ugly one.
5. **Guest checkout, always.** Account creation is offered *after* purchase, never before.
6. **Arabic is a first-class layout**, not a translated afterthought — full RTL mirroring,
   proper Arabic typeface, Arabic numerals where appropriate.
7. **Editorial over catalogue.** Big imagery, generous whitespace, few words. The site should
   feel closer to a fashion lookbook than a marketplace listing.

## 7.2 Site architecture

```
HOME
├── SHOP ──────────── filter: model · style family · colour · tier · price
│     └── PRODUCT (PDP)
├── NEW DROPS ─────── live drop · countdown · archive of sold-out drops
├── BEST SELLERS
├── CUSTOMIZE ─────── live-preview builder (name / number / Arabic / Latin)
├── COLLECTIONS ───── Gold Route · Pitch · Arabic Type · Minimal · Clear · Archive
├── ABOUT US ──────── story · how we make it · the drop promise · founder
├── FAQ ───────────── shipping · sizing/models · MagSafe · custom · warranty · returns
├── TRACK ORDER ───── order no. + email/phone → status timeline
└── CONTACT ───────── WhatsApp (primary) · form · socials · response-time promise
```

**Persistent chrome**
- **Header:** hamburger (left) · wordmark (centre) · search + cart (right). Height 56 px. On
  scroll it collapses to just wordmark + cart.
- **Announcement bar:** one rotating line — `DROP 01 LIVE · 147/200 CLAIMED` /
  `FREE DELIVERY OVER 15 KD` / `KNET · APPLE PAY · TABBY`.
- **Language toggle:** `EN | ع` top-right of the menu, persistent choice.
- **Sticky bottom bar (mobile):** Shop · Drops · Customize · Cart. Native-app feel, and it
  keeps the two money pages one tap away everywhere.
- **Floating WhatsApp button** bottom-right — in this market it converts.

## 7.3 Homepage, section by section

| # | Section | Spec |
|---|---|---|
| 1 | **Hero** | Full-viewport (100 svh) autoplaying muted vertical video or a single hero image of a case *in a hand*. Overlay: `WEAR YOUR PHONE` + `البسه، لا تخبيه`, one primary CTA `SHOP DROP 01`, one ghost CTA `WATCH THE FILM`. Ink scrim at 35% for legibility. |
| 2 | **Live drop strip** | Thin Ink band: drop name, a real sell-through counter `147 / 200 CLAIMED`, and a countdown if pre-launch. Real numbers only. |
| 3 | **Featured collection** | "DROP 01 — GOLD ROUTE" — horizontal snap-scroll carousel of 4–6 cases, big 4:5 images, name + price, quick-add. Editorial title block on the left. |
| 4 | **New drops** | 2-up grid, `NEW` tag, colourway dots visible on the card so people see variety without tapping. |
| 5 | **Best sellers** | "MOST CARRIED" — 4 products with a light social-proof line (`★ 4.9 · 212 sold`). |
| 6 | **Customize block** | Full-width, dark, with a live-looking mock preview: a case with a name appearing on it and an Arabic/Latin toggle. Headline: *Your name belongs on it.* CTA `MAKE YOURS`. This is the highest-margin page — link to it from the homepage, not just the nav. |
| 7 | **The brand strip** | Four icons + four short proofs: `1.5 m drop tested` · `MagSafe native` · `Arabic type, drawn properly` · `Numbered, never restocked`. Sells the premium without a paragraph. |
| 8 | **Reviews** | 3 real reviews with photos, a `4.9 ★ from 212 customers` aggregate, and a link to all reviews. Photo reviews only — text-only reviews look fake. |
| 9 | **Instagram / TikTok wall** | 6-tile UGC grid pulling from `#ALSAFRAN`, each tile linking out. Headline: *Seen in Kuwait.* |
| 10 | **Drop Pass CTA** | Ink section, gold hairline: *Get the next drop 30 minutes early.* Phone-number field (WhatsApp/SMS), one button. Phone first, email second — this audience opens WhatsApp, not inboxes. |
| 11 | **Footer** | Shop links · help links · language/currency · payment badges (KNET, Apple Pay, Visa, Mastercard, Tabby) · socials · `Made in Kuwait. Built to travel.` |

## 7.4 Product page (PDP) — the money page

```
┌──────────────────────────────────┐
│  ← back            wordmark   🛒 │
├──────────────────────────────────┤
│                                  │
│   [ 4:5 IMAGE GALLERY, swipe ]   │  6–8 images: on-phone front, in-hand,
│   ● ○ ○ ○ ○   [ ▷ video ]        │  camera-lip macro, MagSafe snap GIF,
│                                  │  all colourways, lifestyle, box shot
├──────────────────────────────────┤
│  GOLD ROUTE · SIGNATURE          │  ← collection + tier eyebrow
│  QAHWA                           │  ← product name (big)
│  8.900 KD    ★ 4.9 (38)          │  ← price + rating, side by side
│  or 3 × 2.967 KD with Tabby      │  ← BNPL line lifts AOV visibly
├──────────────────────────────────┤
│  COLOUR — Qahwa                  │
│  ● ● ● ●                         │  ← swatches show real material photos
├──────────────────────────────────┤
│  YOUR PHONE                      │
│  [17 Pro Max][17 Pro][16 Pro Max]│  ← chips, sold-out states greyed with
│  [16 Pro]  ▸ more models         │     "notify me"
├──────────────────────────────────┤
│  ☑ MagSafe  (included)           │  ← informational on Signature+
│  ☐ Add your name        +3.000   │  ← opens inline customiser drawer
├──────────────────────────────────┤
│  147 / 200 claimed  ▓▓▓▓▓▓▓░░░   │  ← scarcity, honest
├──────────────────────────────────┤
│  ▸ Protection & specs            │  accordions, closed by default:
│  ▸ Materials & finish            │  1.4 mm lip, 12× N42, 2 m drop,
│  ▸ Shipping & delivery           │  free over 15 KD, 1–3 days Kuwait,
│  ▸ Returns & 12-month warranty   │  GCC 3–6 days
├──────────────────────────────────┤
│  Complete the look — Mag wallet, │  ← cross-sell, colour-matched only
│  strap, AirPods case             │
├──────────────────────────────────┤
│  Reviews (38) + customer photos  │
│  You might also like — 4 items   │
└──────────────────────────────────┘
▓ STICKY: [ ADD TO CART — 8.900 KD ]  ▓  ← always visible
▓         [  Pay ]                    ▓  ← Apple Pay express, one tap
```

**PDP requirements checklist**
- [ ] Model selector **remembers the choice** across the whole site (localStorage) — pick your
      phone once, never again. Single biggest UX win in this category.
- [ ] Sold-out model = `NOTIFY ME` capture, not a dead end.
- [ ] Apple Pay / KNET express button **above** the fold on mobile.
- [ ] Colour change updates the gallery **and** the URL (shareable variant links).
- [ ] Free-shipping progress in the cart: `Add 6.100 KD for free delivery`.
- [ ] Delivery estimate as a real date ("arrives Tue 12"), not a range in days.
- [ ] Every image with dimensions set to prevent layout shift; WebP/AVIF; lazy-load below fold.
- [ ] Photo reviews surfaced first; reviews requested by WhatsApp 4 days after delivery.

## 7.5 The Customize page
The highest-margin experience on the site, so it gets its own build quality.

1. **Step 1 — pick a base:** case style + colourway (visual grid).
2. **Step 2 — your text:** name / initials / number / date. **Script toggle: `ABC | أبج`.**
   Live character counter and a live-updating preview *on the actual case render*.
3. **Step 3 — type style:** five curated options (Geometric Kufi, Soft Naskh, Athletic Stencil,
   Grotesque Caps, Monogram). Show each rendered with *their* text, not with "Sample".
4. **Step 4 — finish:** White · Black · Gold Foil · Tonal Deboss (with a price delta shown for
   foil if any).
5. **Step 5 — placement:** bottom-centre · back-centre · vertical-left. Tap to move.
6. **Step 6 — phone model**, then price, lead time (`ships in 3 working days`), and Add to Cart.
7. **Guardrails:** profanity filter (Arabic + English + transliteration), a "we'll check your
   Arabic and message you if something looks off" note, and a mandatory preview confirmation
   checkbox — this kills 90% of custom-order disputes.
8. **Share the preview** button — a customer sharing their mock-up before buying is free
   marketing *and* a proven conversion lift.

## 7.6 Remaining pages

**Shop** — sticky filter bar (Model · Style · Colour · Tier · Price), 2-up mobile grid, sort by
Newest / Best selling / Price. Cards show colour dots and an `ADD` quick button. Infinite scroll
with a "Load more" fallback.

**New Drops** — the live drop with a hero, countdown/counter and lookbook; below it the
**Archive**: every past drop with `SOLD OUT — 200/200` stamped on it. The archive is the single
most persuasive page on the site — build it from day one, even with one entry.

**Best Sellers** — ranked `01 → 08` with badges (`#1 most carried`) and review counts. Ranking
is itself social proof.

**Collections** — full-bleed editorial cards for Gold Route, Pitch, Arabic Type, Minimal, Clear
and Archive. Each collection page opens with a lookbook image and a paragraph of story, then
the products. This page is what makes the brand look like a fashion label.

**About Us** — the Gold Route story, a "how we make it" section (materials, drop tests, the
Arabic-type review process), the drop promise ("200 units, never restocked"), the founder with
a real photo and a line about why, and a closing `من الكويت. للعالم.`

**FAQ** — accordion, grouped: Orders & delivery · Phone models & fit · MagSafe · Custom cases ·
Returns & warranty · Payment. Write real answers to the real DM questions, including "will it
yellow?", "does it work with a screen protector?", "can you do my name in Arabic?" and "do you
ship to Saudi?".

**Track Order** — order number + email or phone, no login. Visual timeline: Confirmed →
Printed/Packed → With courier → Delivered. Plus a WhatsApp button on the same screen, because
half of these people will want to ask a human anyway.

**Contact** — WhatsApp first and biggest (with a response-time promise: *we reply within an hour,
10 AM–10 PM*), then a short form, then socials. Never bury WhatsApp behind a form in this market.

## 7.7 Recommended tech stack

**Launch (months 0–12): Shopify Basic + a custom-built theme.**

| Need | Choice | Why / cost |
|---|---|---|
| Platform | **Shopify Basic** (~12 KD/mo) | Payments, inventory, variants, abandoned carts, taxes and multi-currency solved. Do not build a custom store for a launch — spend that money on product and content |
| Theme | Custom-built on **Dawn** (or Shopify's Horizon), not a marketplace theme | A bought theme looks like a bought theme; the prototype in `/site` is the design reference |
| Payments | **Tap Payments** or **MyFatoorah** for **KNET** + **Shopify Payments/Apple Pay** | KNET is non-negotiable in Kuwait |
| BNPL | **Tabby** and/or **Tamara** | Lifts bundle and Atelier conversion across the Gulf; essential before KSA |
| Customiser | **Kickflip** or **Zakeke**, or a custom Shopify app section | A custom build gives better Arabic type control — worth doing in-house by month 4 |
| Reviews with photos | **Judge.me** or **Loox** | Photo reviews are the trust engine |
| WhatsApp | Official WhatsApp Business API or a Shopify app | Order updates + support in one thread |
| Drops / scarcity | Native inventory + a countdown section + **Klaviyo/SMS** for the Drop Pass | Real inventory numbers, never fake timers |
| Shipping | Local courier (Armada / Zajil / Posta Plus) + **Aramex/DHL** for GCC | Same/next-day inside Kuwait is a genuine advantage |
| Analytics | GA4 + Meta & TikTok pixels + Shopify analytics | Set up **before** launch day, not after |
| Language | **Shopify Markets + Translate & Adapt** or Weglot | Human-review the Arabic; never ship machine translation |

**Year 2+, only if you outgrow it:** headless **Next.js + Shopify Storefront API** on Vercel.
This buys real performance and total design freedom — and costs real engineering. Do not do it
before you're doing 500+ orders/month.

**Performance budget (enforce it):** LCP < 2.0 s on 4G · total JS < 200 KB · hero image < 200 KB
(AVIF) · no third-party script that isn't earning money · Lighthouse mobile ≥ 90.

## 7.8 The prototype in this repo
`/site` is a dependency-free, mobile-first implementation of every page above — 11 pages,
working cart, model/colour/MagSafe selection, a live customiser preview, and the full design
system in CSS variables.

```bash
cd site && python3 -m http.server 8080
```

Use it three ways: to **agree the design** before paying anyone, as a **build brief** for the
Shopify theme (`site/assets/css/style.css` holds the exact tokens — colours, type scale,
spacing, radii), and as a **screenshot source** for the pre-launch teasers.
