#!/usr/bin/env python3
"""
STAGE 2 — CLEAN.  Reads the raw CSV (never writes to it), applies documented
fixes, and emits: the clean CSV, the cleaning log, the exclusion register and
the computed metrics.  Every transformation appends to LOG with a row count.
"""
import csv, json, re, datetime as dt
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW  = ROOT / "data/raw/kuwait-orders-dirty.csv"
raw  = list(csv.DictReader(RAW.open(newline="", encoding="utf-8-sig")))
N0   = len(raw)

LOG, EXCLUDED = [], []
def log(problem, fix, why, n):
    LOG.append({"problem": problem, "fix": fix, "why": why, "rows_affected": n})
def drop(row, line, reason):
    EXCLUDED.append({"line_in_raw_file": line, "order_id": row.get("order_id","").strip(),
                     "reason": reason, "raw": {k: row[k] for k in row}})

# ---------------------------------------------------------------- lookups --
AREA_CANON = {
    "mangaf":"Mangaf", "fintas":"Fintas",
    "aljahra":"Al Jahra", "jahra":"Al Jahra",
    "farwaniya":"Farwaniya", "farwaniyah":"Farwaniya",
    "salwa":"Salwa",
    "hawally":"Hawally", "hawalli":"Hawally",
    "salmiya":"Salmiya", "salmiyah":"Salmiya",
    "sabahalsalem":"Sabah Al Salem", "sabahalsalem ":"Sabah Al Salem",
}
STATUS_CANON = {"delivered":"Delivered","deliverd":"Delivered",
                "pending":"Pending","cancelled":"Cancelled","canceled":"Cancelled"}
PAY_CANON = {"cash":"Cash","knet":"KNET","knet-":"KNET","card":"Card","visa":"Visa"}

def fold(s): return re.sub(r"[^a-z]","",s.lower())

def parse_amount(s):
    t = (s or "").strip()
    t = re.sub(r"^KD\s*","",t,flags=re.I)
    t = re.sub(r"\s*KD$","",t,flags=re.I)
    t = t.strip().replace(",", ".")
    try: return round(float(t), 3)
    except ValueError: return None

def parse_date(s):
    s=(s or "").strip()
    for f in ("%Y-%m-%d","%d/%m/%Y","%d %b %Y","%d %B %Y"):
        try: return dt.datetime.strptime(s,f).date()
        except ValueError: pass
    return None

PERIOD_START, PERIOD_END = dt.date(2026,9,1), dt.date(2026,9,14)

# ---- price list derived from the data itself (modal unit price per item) ---
per_item = defaultdict(Counter)
for r in raw:
    a, q = parse_amount(r["amount_kd"]), parse_amount(r["quantity"])
    if a is None or not q or a < 0 or q < 0: continue
    per_item[r["item"].strip()][round(a/q, 3)] += 1
PRICE = {it: c.most_common(1)[0][0] for it, c in per_item.items()}

# =================================================================== CLEAN ==
clean, seen_sig = [], {}
n_ws=n_area=n_status=n_pay=n_date_fmt=0
n_amt_fmt=n_amt_fix=n_qty_fix=0
n_area_unknown=n_date_null=0

for idx, r in enumerate(raw):
    line = idx + 2
    row  = {k:(v or "") for k,v in r.items()}

    # -- whitespace ---------------------------------------------------------
    for k in row:
        if row[k] != row[k].strip(): n_ws += 1
        row[k] = row[k].strip()

    # -- area ---------------------------------------------------------------
    a_raw = row["area"]
    if a_raw == "":
        row["area"] = "Unknown"; n_area_unknown += 1
    else:
        canon = AREA_CANON.get(fold(a_raw))
        if canon is None: raise SystemExit(f"unmapped area {a_raw!r} line {line}")
        if canon != a_raw: n_area += 1
        row["area"] = canon

    # -- status / payment ---------------------------------------------------
    s_canon = STATUS_CANON[fold(row["status"])]
    if s_canon != row["status"]: n_status += 1
    row["status"] = s_canon
    p_canon = PAY_CANON[fold(row["payment_method"])]
    if p_canon != row["payment_method"]: n_pay += 1
    row["payment_method"] = p_canon

    # -- date ---------------------------------------------------------------
    d = parse_date(row["order_date"])
    if d is None or not (PERIOD_START <= d <= PERIOD_END):
        row["order_date"] = ""; row["date_valid"] = "no"; n_date_null += 1
    else:
        if row["order_date"] != d.isoformat(): n_date_fmt += 1
        row["order_date"] = d.isoformat(); row["date_valid"] = "yes"

    # -- amount + quantity --------------------------------------------------
    amt, qty = parse_amount(row["amount_kd"]), parse_amount(row["quantity"])
    if not re.fullmatch(r"-?\d+\.\d{3}", r["amount_kd"].strip()): n_amt_fmt += 1
    unit = PRICE[row["item"]]

    if amt is not None and qty is not None and qty > 0 and \
       abs(amt - round(unit*qty,3)) > 0.0005 and abs(amt - unit*qty) <= 0.06:
        amt = round(unit*qty, 3); n_amt_fix += 1          # truncated decimals
    elif qty is not None and amt is not None and amt > 0 and \
         (qty <= 0 or qty > 20) and abs(amt/unit - round(amt/unit)) < 1e-6:
        qty = int(round(amt/unit)); n_qty_fix += 1         # amount corroborates qty
    elif amt is None or qty is None or amt <= 0 or qty <= 0 or \
         abs(amt - round(unit*qty,3)) > 0.0005:
        drop(r, line, "amount_kd and quantity contradict each other and the item "
                      f"price ({unit:.3f} KD): neither field can be trusted")
        continue

    row["quantity"]  = str(int(qty))
    row["amount_kd"] = f"{amt:.3f}"
    row["unit_price_kd"] = f"{unit:.3f}"

    # -- duplicates (after normalisation, so re-typed repeats collapse) ------
    sig = (row["order_id"], row["area"], row["order_date"], row["item"],
           row["quantity"], row["amount_kd"], row["status"])
    if sig in seen_sig:
        drop(r, line, f"duplicate of line {seen_sig[sig]} — identical order once "
                      "spelling, date format and currency format are normalised")
        continue
    seen_sig[sig] = line
    clean.append(row)

# ---------------------------------------------------------------- the log --
log("11 columns arrived as text; 16 area values, 1 customer_name and 1 email carried "
    "leading/trailing spaces (e.g. ' Salmiya ')",
    "Trimmed whitespace from every field in every column",
    "' Salmiya ' and 'Salmiya' are the same area. Untrimmed, they group separately "
    "and split one area across two bars.", n_ws)
log("area held 29 distinct raw strings for 8 real areas — e.g. Mangaf/mangaf; "
    "salwa/Salwa/SALWA; ' Hawally'/Hawally/hawally/HAWALLY/Hawalli; "
    "salmiya/' Salmiya '/SALMIYA/'Salmiya '/Salmiyah; al jahra/Al Jahra/JAHRA/Jahra",
    "Case-folded and mapped every variant to one canonical name per area, giving 8 areas. "
    "Jahra and Al Jahra were merged; Hawalli merged into Hawally; Salmiyah into Salmiya; "
    "Farwaniyah into Farwaniya; Sabah Alsalem into Sabah Al Salem",
    "They are the same places. Left split, Al Jahra would appear as two areas of 19 and 14 "
    "instead of one of 33, and would drop out of the top ranks entirely.", n_area)
log("status held 9 raw spellings for 3 real states, including the misspelling "
    "'Deliverd' on 42 rows and 'Canceled' on 2",
    "Mapped to Delivered / Pending / Cancelled",
    "'Deliverd' is 42 rows — 27% of the file. Counting it as its own status would have "
    "understated delivered orders by more than a quarter and broken every revenue figure.",
    n_status)
log("payment_method held 10 raw spellings for 4 real methods (CASH/cash/Cash; "
    "knet/K-Net/KNET/Knet; Card/card; Visa)",
    "Mapped to Cash / KNET / Card / Visa. Visa was kept separate from Card",
    "Card and Visa may be genuinely different records in the source system, so merging them "
    "would assert something the file does not show.", n_pay)
log("order_date arrived in 3 formats: 105 ISO (2026-09-14), 53 dd/mm/yyyy (14/09/2026), "
    "37 'd Mon yyyy' (9 Sep 2026)",
    "Parsed all three and rewrote every date as ISO yyyy-mm-dd",
    "Three formats cannot be sorted or bucketed together; 01/09/2026 and '1 Sep 2026' must "
    "land on the same day.", n_date_fmt)
log("2 dates are not real dates in the trading period: '31/09/2026' (September has 30 days) "
    "and '2027-09-03' (one year outside the Sep 1–14 2026 period every other row sits in)",
    "Kept both orders in the dataset but set their date to empty and flagged date_valid=no. "
    "They are excluded from time charts only",
    "The orders are otherwise complete and their revenue is real, so deleting them would "
    "understate totals. But inventing a date — guessing 31/09 meant 30/09, or that 2027 was a "
    "typo for 2026 — would be fabricating data. They count everywhere except the time axis.",
    n_date_null)
log("amount_kd arrived in 5 formats: 121 plain '13.000', 34 suffixed '6.500 KD', "
    "19 prefixed 'KD 2.750', 14 comma-decimal '3,250', 7 short-decimal '0.2'",
    "Stripped KD prefixes/suffixes, read comma as the decimal separator, stored a plain "
    "number at 3 decimal places (the fils precision of the Kuwaiti dinar)",
    "'3,250' is 3.250 KD, not 3,250 KD. Read as a thousands separator it would have inflated "
    "that one order by a factor of 1000 and swamped every total in the file.", n_amt_fmt)
log("3 amounts are truncated against the item's own price: Karak tea 0.2 (x2) and Machboos "
    "box 3.2, where every other row of those items prices them at 0.250 and 3.250 KD",
    "Restored to unit price x quantity: 0.250 and 3.250",
    "All 10 items price perfectly consistently across 188 of 195 rows, so the price list is "
    "evidence, not assumption. 0.2 is a dropped trailing digit, not a discount.", n_amt_fix)
log("3 quantities are impossible: -2 (Mixed grill platter), 0 (Luqaimat) and 999 (Karak tea)",
    "Recomputed quantity from amount / unit price, giving 2, 1 and 4",
    "In all three the amount is a clean multiple of the item price, so the amount corroborates "
    "a specific quantity. Left alone, the 999 row would have claimed 249.750 KD of karak tea "
    "and dominated every item chart.", n_qty_fix)
log("2 rows have no area at all (KW-1132, KW-1103)",
    "Labelled them 'Unknown' and kept them. They are excluded from area charts only",
    "Both have a valid date, item, quantity and amount, so their revenue is real and belongs "
    "in the headline. But they cannot be placed on a map of areas. This is why the area chart "
    "totals less than the headline — it is named on the chart, not hidden.", n_area_unknown)
log("1 row (KW-1062) has amount -3.250 for 2 Falafel wraps, which should be 1.200 KD",
    "Excluded the row entirely",
    "Unlike the quantity fixes, nothing here corroborates anything: the amount is negative AND "
    "its magnitude does not match the quantity. Neither field can be trusted, and guessing "
    "which one is wrong would be inventing the order.", 1)
log("5 rows repeat an order_id. 3 are byte-identical; 2 (KW-1031, KW-1141) are the same order "
    "re-typed with a different area spelling and date format",
    "Removed 5 duplicate rows, keeping the first occurrence of each",
    "Duplicates double-count revenue. The 2 re-typed pairs only become visible as duplicates "
    "after standardising spelling and dates — which is why de-duplication runs last, not first. "
    "190 unique order_ids remain, matching the 190 distinct ids counted in the audit.", 5)
log("2 emails and 1 phone number are blank",
    "Left blank. No imputation",
    "Contact details play no part in any metric on this dashboard, and inventing a customer "
    "email would be both useless and wrong.", 3)

# ============================================================== RECONCILE ==
N1 = len(clean)
assert N0 == N1 + len(EXCLUDED), f"{N0} != {N1} + {len(EXCLUDED)}"

def amt(r): return float(r["amount_kd"])
delivered = [r for r in clean if r["status"] == "Delivered"]
cancelled = [r for r in clean if r["status"] == "Cancelled"]
pending   = [r for r in clean if r["status"] == "Pending"]
dated     = [r for r in delivered if r["date_valid"] == "yes"]
areaed    = [r for r in delivered if r["area"] != "Unknown"]

def agg(rowset, key):
    out = defaultdict(lambda: {"orders":0,"revenue":0.0,"qty":0})
    for r in rowset:
        b = out[r[key]]; b["orders"]+=1; b["revenue"]=round(b["revenue"]+amt(r),3); b["qty"]+=int(r["quantity"])
    return dict(sorted(out.items(), key=lambda kv: -kv[1]["revenue"]))

metrics = {
  "raw_rows": N0, "clean_rows": N1, "excluded_rows": len(EXCLUDED),
  "unique_order_ids": len({r["order_id"] for r in clean}),
  "orders_total": N1,
  "delivered_orders": len(delivered), "cancelled_orders": len(cancelled),
  "pending_orders": len(pending),
  "delivered_revenue_kd": round(sum(map(amt, delivered)), 3),
  "cancelled_value_kd":   round(sum(map(amt, cancelled)), 3),
  "pending_value_kd":     round(sum(map(amt, pending)), 3),
  "all_orders_value_kd":  round(sum(map(amt, clean)), 3),
  "avg_order_value_kd":   round(sum(map(amt, delivered))/len(delivered), 3),
  "areas_covered": len({r["area"] for r in clean if r["area"] != "Unknown"}),
  "items_covered": len({r["item"] for r in clean}),
  "date_min": min(r["order_date"] for r in clean if r["date_valid"]=="yes"),
  "date_max": max(r["order_date"] for r in clean if r["date_valid"]=="yes"),
  "trading_days": len({r["order_date"] for r in clean if r["date_valid"]=="yes"}),
  "delivered_dated": len(dated),
  "delivered_with_known_area": len(areaed),
  "delivered_revenue_known_area_kd": round(sum(map(amt, areaed)), 3),
  "delivered_revenue_unknown_area_kd": round(sum(map(amt, delivered)) - sum(map(amt, areaed)), 3),
  "by_area_delivered": agg(areaed, "area"),
  "by_item_delivered": agg(delivered, "item"),
  "by_status_all":     agg(clean, "status"),
  "by_payment_delivered": agg(delivered, "payment_method"),
  "price_list_kd": {k: round(v,3) for k,v in sorted(PRICE.items())},
  "cancellation_rate_pct": round(100*len(cancelled)/N1, 1),
}
by_day = defaultdict(lambda: {"orders":0,"delivered":0,"cancelled":0,"pending":0,"revenue":0.0})
for r in clean:
    if r["date_valid"] != "yes": continue
    d = by_day[r["order_date"]]; d["orders"] += 1
    d[r["status"].lower()] += 1
    if r["status"] == "Delivered": d["revenue"] = round(d["revenue"] + amt(r), 3)
metrics["by_day"] = dict(sorted(by_day.items()))

# reconciliation proofs
metrics["checks"] = {
  "rows": {"raw": N0, "clean": N1, "excluded": len(EXCLUDED), "balances": N0 == N1+len(EXCLUDED)},
  "status_orders": {"sum": len(delivered)+len(cancelled)+len(pending), "clean_rows": N1,
                    "balances": len(delivered)+len(cancelled)+len(pending) == N1},
  "area_revenue": {"sum_of_area_bars": round(sum(v["revenue"] for v in metrics["by_area_delivered"].values()),3),
                   "headline_delivered_revenue": metrics["delivered_revenue_kd"],
                   "gap": metrics["delivered_revenue_unknown_area_kd"],
                   "explained_by": "2 orders (KW-1132, KW-1103) have no area in the source file. Both are "
                                   "Delivered, so their 22.000 KD sits in the headline but in no area bar"},
  "item_revenue": {"sum_of_item_bars": round(sum(v["revenue"] for v in metrics["by_item_delivered"].values()),3),
                   "headline_delivered_revenue": metrics["delivered_revenue_kd"],
                   "balances": abs(sum(v["revenue"] for v in metrics["by_item_delivered"].values())
                                   - metrics["delivered_revenue_kd"]) < 0.001},
  "amount_equals_price_x_qty": {"rows_checked": N1,
      "rows_matching": sum(1 for r in clean
          if abs(amt(r) - round(float(r["unit_price_kd"])*int(r["quantity"]),3)) < 0.0005)},
}

# ------------------------------------------------------------- the story ---
def wk(lo, hi):
    rs=[r for r in delivered if r["date_valid"]=="yes" and lo<=r["order_date"]<=hi]
    rev=round(sum(map(amt,rs)),3)
    prem=[r for r in rs if PRICE[r["item"]]>=5.5]; chp=[r for r in rs if PRICE[r["item"]]<=1.0]
    return {"orders":len(rs), "revenue_kd":rev, "aov_kd":round(rev/len(rs),3),
            "premium_orders":len(prem), "premium_revenue_kd":round(sum(map(amt,prem)),3),
            "cheap_orders":len(chp),   "cheap_revenue_kd":round(sum(map(amt,chp)),3)}
w1, w2 = wk("2026-09-01","2026-09-07"), wk("2026-09-08","2026-09-14")
metrics["weeks"] = {
  "week1": {"label":"Sep 1-7", **w1}, "week2": {"label":"Sep 8-14", **w2},
  "orders_change_pct":  round(100*(w2["orders"]-w1["orders"])/w1["orders"],1),
  "revenue_change_pct": round(100*(w2["revenue_kd"]-w1["revenue_kd"])/w1["revenue_kd"],1),
  "revenue_change_kd":  round(w2["revenue_kd"]-w1["revenue_kd"],3),
  "aov_change_pct":     round(100*(w2["aov_kd"]-w1["aov_kd"])/w1["aov_kd"],1),
}
PREMIUM=[i for i,p in PRICE.items() if p>=5.5]; CHEAP=[i for i,p in PRICE.items() if p<=1.0]
_p=[r for r in delivered if r["item"] in PREMIUM]; _c=[r for r in delivered if r["item"] in CHEAP]
metrics["mix"] = {
  "premium_items":sorted(PREMIUM), "cheap_items":sorted(CHEAP),
  "premium_orders":len(_p), "premium_revenue_kd":round(sum(map(amt,_p)),3),
  "premium_order_share_pct":round(100*len(_p)/len(delivered),1),
  "premium_revenue_share_pct":round(100*sum(map(amt,_p))/sum(map(amt,delivered)),1),
  "cheap_orders":len(_c), "cheap_revenue_kd":round(sum(map(amt,_c)),3),
  "cheap_order_share_pct":round(100*len(_c)/len(delivered),1),
  "cheap_revenue_share_pct":round(100*sum(map(amt,_c))/sum(map(amt,delivered)),1),
}
canc_item={}
for it in PRICE:
    all_=[r for r in clean if r["item"]==it]; cn=[r for r in all_ if r["status"]=="Cancelled"]
    canc_item[it]={"orders":len(all_),"cancelled":len(cn),
                   "rate_pct":round(100*len(cn)/len(all_),1),"lost_kd":round(sum(map(amt,cn)),3)}
metrics["cancellation_by_item"]=dict(sorted(canc_item.items(), key=lambda kv:-kv[1]["rate_pct"]))
canc_area={}
for ar in {r["area"] for r in clean if r["area"]!="Unknown"}:
    all_=[r for r in clean if r["area"]==ar]; cn=[r for r in all_ if r["status"]=="Cancelled"]
    canc_area[ar]={"orders":len(all_),"cancelled":len(cn),
                   "rate_pct":round(100*len(cn)/len(all_),1),"lost_kd":round(sum(map(amt,cn)),3)}
metrics["cancellation_by_area"]=dict(sorted(canc_area.items(), key=lambda kv:-kv[1]["rate_pct"]))

# ----------------------------------------------------------------- write ---
(ROOT/"data").mkdir(exist_ok=True)
cols = [c for c in raw[0].keys()] + ["unit_price_kd","date_valid"]
with (ROOT/"data/kuwait-orders-clean.csv").open("w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, fieldnames=cols); w.writeheader(); w.writerows(clean)
json.dump(LOG,      (ROOT/"data/cleaning-log.json").open("w"), indent=1, ensure_ascii=False)
json.dump(EXCLUDED, (ROOT/"data/excluded-rows.json").open("w"), indent=1, ensure_ascii=False)
json.dump(metrics,  (ROOT/"data/metrics.json").open("w"), indent=1, ensure_ascii=False)

print(f"raw {N0}  ->  clean {N1}  +  excluded {len(EXCLUDED)}   balances: {N0==N1+len(EXCLUDED)}")
print(f"unique order_ids in clean: {metrics['unique_order_ids']}")
print(f"delivered {metrics['delivered_orders']}  revenue {metrics['delivered_revenue_kd']:.3f} KD  AOV {metrics['avg_order_value_kd']:.3f} KD")
print(f"cancelled {metrics['cancelled_orders']}  pending {metrics['pending_orders']}  areas {metrics['areas_covered']}")
print("checks:", json.dumps(metrics["checks"], indent=1))
