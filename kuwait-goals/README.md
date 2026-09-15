# Kuwait's Recycling Goals

> **Where Kuwait Wants to Be — and Are Companies Helping Us Get There?**

A self-contained website section on Kuwait's official recycling and waste-management
targets, the data behind them, and what the private sector is actually doing.

```bash
cd kuwait-goals && python3 -m http.server 8080   # then open http://localhost:8080
```

No build step, no dependencies, no framework. Three files do the work.

---

## What's in it

| Part | What it shows |
|---|---|
| **At a glance** | The whole argument in one screen — four target rings against four measured figures, before a single paragraph |
| **Official Kuwait waste strategy** | The KNWMS 2040 — its vision in full, the five-step waste hierarchy, the 5 objectives and all 25 targets with the authority responsible for each |
| **Kuwait 2040 targets dashboard** | The four headline commitments — 30% MSW recycling, 15% C&D recycling, 50% WEEE collection, 80% sludge to soil — each with target, category, deadline and source |
| **Kuwait's Waste Management Targets** | A 100% stacked bar of the 2040 treatment split for every stream, with a table twin |
| **Waste separation · landfills · waste data** | The three strategy themes that have no single headline number |
| **Kuwait and UN SDG 12** | Responsible Consumption and Production as Kuwait's own CSB states it, its targets, and Kuwait's 28.9% self-assessed achievement |
| **Kuwait National Recycling Indicator Over Time** | Every year CSB publishes for indicator 12.5.1, unmodified, with an explainer on what it does and does not measure |
| **Goals vs Reality** | Targets against latest measured data — with progress bars drawn *only* where the definitions match, and a list of the comparisons this page refuses to draw |
| **Are Companies Helping?** | 14 researched Kuwaiti companies scored on seven practices, with a full evidence matrix |
| **How Much Waste Will Kuwait Produce?** | The one projected section — municipal waste generation to 2040, with the model, its inputs, its measured back-test error and adjustable assumptions |
| **Kuwait's Road Toward Better Waste Management** | An interactive timeline, 2015 → 2060, sourced milestone by milestone |
| **Can Kuwait Reach Its Recycling Goals?** | The answer, assembled only from the evidence above |

---

## The rules this section was built under

1. **No invented numbers.** Every target and statistic is traceable to an official
   State of Kuwait or UN publication. [`RESEARCH.md`](RESEARCH.md) lists every one.
2. **Absence is reported, not filled.** Where Kuwait publishes no figure — a WEEE
   collection baseline, a current municipal recycling rate, a count of companies
   reporting on sustainability — the page says so.
3. **No comparison across definitions.** A progress bar is drawn only when the current
   statistic and the target use the same definition, waste category and measurement
   method. Two pairs qualify. The five that don't are listed as *not comparable*, with
   the reason.
4. **Company practice is not credited with national progress.** These practices
   *support the direction of* Kuwait's goals; no official source attributes any national
   percentage to them, and the page does not either.
5. **The company sample describes itself.** 14 firms chosen *because they publish*,
   so "100% publish a sustainability report" is a fact about the sample, not Kuwait.
6. **Projections are fenced, tested and never dressed as data.** Exactly one section
   contains modelled numbers. It sits behind a standing banner, states its formula, runs
   the method against a year Kuwait has already published, and prints the resulting
   **−6.8% error uncorrected**. Its assumptions are controls the reader can change. Where
   the data cannot support a forecast — the recycling rate, whose trend line reaches zero
   in 2023 — the page says so and forecasts nothing.

---

## Navigating it

A sticky jump bar appears once the hero scrolls away and marks the section you are in.
The page also carries a print stylesheet: printing expands every collapsed table, drops the
nav and hover cards, and prints link URLs after their text, so a paper copy keeps its sources.

Illustrations are inline SVG rather than emoji or photography — emoji render differently on
every platform and carry no stroke weight, and stock photographs would mean hotlinking assets
this page cannot licence or guarantee.

## Files

```
kuwait-goals/
├── index.html              the section, top to bottom
├── assets/css/goals.css    design system; light and dark are both selected, not flipped
├── assets/js/data.js       every figure, each carrying its source — edit data here, not markup
├── assets/js/app.js        rendering, SVG charts, tooltips, table twins, timeline
├── RESEARCH.md             source log: what was used, what was corrected, what was excluded
└── README.md
```

`data.js` is the single point of truth. The company percentages are counted from it at
runtime, so the headline figures can never drift from the matrix underneath them.

## Accessibility and verification

Charts are hand-built SVG and HTML with a hover/focus layer, `aria-label`s on every
mark, and a table view behind every chart — no value is reachable only by tooltip.
The three-colour series palette was validated with a CVD/contrast validator against
each theme's actual surface rather than chosen by eye; see the last section of
[`RESEARCH.md`](RESEARCH.md).

Rendered and checked in Chromium at 1280px and 390px, in both themes: no horizontal
overflow, no console errors, all dynamic values verified against the source data.
