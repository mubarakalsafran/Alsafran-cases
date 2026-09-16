# Kuwait Orders Data Lab — AIFC Day 8

**Clean It · Tell It · Show It.** 195 raw rows audited before anything was changed,
cleaned to 189 with every decision logged, and turned into an interactive hub.

```
data/raw/kuwait-orders-dirty.csv   the original file, never written to (chmod 444)
                                   sha256 1a428b5d3e52f7c44094f26e4f1faaf887c4b8f92b6753be0336d1672ce82426
data/kuwait-orders-clean.csv       189 retained rows
data/audit.json                    Stage 1 — every problem, with an exact count
data/cleaning-log.json             13 decisions: what / did / why / rows affected
data/excluded-rows.json            all 6 excluded rows, by line number
data/metrics.json                  every figure the dashboard renders
scripts/audit.py                   Stage 1, reads only
scripts/clean.py                   Stage 2, writes the four files above
scripts/gen_app_data.py            bakes the results into the app
app/                               Next.js 16 · TypeScript · Tailwind 4 · Recharts 3
```

## Reproduce

```bash
python3 scripts/audit.py && python3 scripts/clean.py && python3 scripts/gen_app_data.py
cd app && npm install && npm run build
```

## The numbers

| | |
|---|---|
| Raw rows | 195 |
| Retained | 189 (= 189 unique order IDs) |
| Excluded | 6 — 5 duplicates, 1 row whose amount contradicted its quantity |
| Delivered | 153 orders · 707.850 KD · 4.626 KD average |
| Period | 1–14 Sep 2026, 14 trading days, 8 areas, 10 items |

Two rows are retained but partly excluded from charts, and both are named on the page:
2 orders have no area (22.000 KD sits in the headline but in no area bar), and 2 have an
unusable date (`31/09/2026` — no such day; `2027-09-03` — outside the period), so they are
absent from time charts only. Neither date was guessed.

## The finding

Delivered orders rose **51.7%** between the two weeks (60 → 91) while delivered revenue moved
**+0.1%** (351.800 → 352.300 KD). Average order value fell **34%**. The mix explains it: the two
premium dishes are 26.1% of orders but 57.4% of revenue, and premium orders *fell* from 22 to 18
while cheap orders doubled.

## Verification

`scripts/` derives every figure from the raw file. A separate independent re-derivation confirms
row counts, revenue, AOV, per-area and per-item totals, and both weekly splits. All 189 retained
rows satisfy `amount_kd = unit_price × quantity`, and item revenue reconciles exactly to the
headline.
