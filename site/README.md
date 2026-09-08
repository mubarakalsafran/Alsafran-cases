# ALSAFRAN — storefront prototype

A dependency-free, mobile-first prototype of the full ALSAFRAN store. No build step, no
framework, no external JS. Every product image is drawn as inline SVG by
`assets/js/data.js`, so the prototype works before a single photo has been shot.

```bash
python3 -m http.server 8080     # from this directory, then open http://localhost:8080
```

## Pages
`index.html` · `shop.html` · `product.html?id=<id>` · `drops.html` · `best-sellers.html` ·
`customize.html` · `collections.html` · `about.html` · `faq.html` · `track-order.html` ·
`contact.html`

## What actually works
- **Cart** — add, quantity +/−, subtotal, free-shipping progress bar, persists in `localStorage`
- **Product page** — colourway switching, model chips (with sold-out and coming-soon states),
  MagSafe state per tier, inline personalisation that re-prices and re-renders the case,
  spec accordions, related products
- **Chosen phone model persists site-wide** — pick it once on any product page
- **Customiser** — 7 steps, live SVG preview, Arabic/Latin script toggle, finish and placement,
  a confirmation gate before adding to the bag, and a preview that shrinks as you scroll
- **Shop filters** — style family × tier, combinable
- **Track order** — reveals a status timeline
- **Nav drawer, cart drawer, bottom tab bar, WhatsApp FAB, toasts**

## Files
| File | Contents |
|---|---|
| `assets/css/style.css` | The whole design system as CSS custom properties — colours, type scale, spacing, radii, components. **This is the build brief for the Shopify theme.** |
| `assets/js/data.js` | Catalogue (11 cases, tiers, models, specs, reviews) + the SVG case renderer |
| `assets/js/app.js` | Chrome injection, cart, and one controller per page |

## What it deliberately is not
Checkout, payments, real inventory, accounts, search and the language toggle are stubs — this
is a design and UX reference, not the production store. See
[`../docs/07-online-store.md`](../docs/07-online-store.md) for the recommended production
stack (Shopify Basic + a custom theme, KNET/Apple Pay/Tabby, Judge.me, Klaviyo) and how this
prototype maps onto it.

## Fonts
Loaded from Google Fonts (Space Grotesk, Inter, IBM Plex Sans Arabic, Archivo) with real
fallback stacks, so the layout holds up if the fonts are blocked or slow. The paid
alternatives are listed in [`../docs/01-brand-identity.md`](../docs/01-brand-identity.md#typography).
