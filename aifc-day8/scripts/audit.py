#!/usr/bin/env python3
"""
STAGE 1 — DATA AUDIT.  Reads the raw CSV and changes NOTHING.
Every problem is reported with an exact count and the real variants.
Pure stdlib: no pandas, so nothing is silently coerced on load.
"""
import csv, json, re, sys
from collections import Counter, defaultdict
from pathlib import Path

RAW = Path(__file__).resolve().parents[1] / "data/raw/kuwait-orders-dirty.csv"
rows, report = [], {}

with RAW.open(newline="", encoding="utf-8-sig") as fh:
    reader = csv.DictReader(fh)
    header = reader.fieldnames
    for r in reader:
        rows.append(r)

report["file"] = str(RAW.name)
report["total_rows"] = len(rows)
report["total_columns"] = len(header)
report["columns"] = header

# ---- 1. per-column emptiness + inferred type ------------------------------
INT_RE   = re.compile(r"^-?\d+$")
DEC_RE   = re.compile(r"^-?\d+(\.\d+)?$")
def classify(v):
    s = v.strip()
    if s == "": return "empty"
    if INT_RE.match(s): return "integer"
    if DEC_RE.match(s): return "decimal"
    return "text"

cols = {}
for c in header:
    vals = [r[c] if r[c] is not None else "" for r in rows]
    kinds = Counter(classify(v) for v in vals)
    blank = sum(1 for v in vals if v.strip() == "")
    ws    = sum(1 for v in vals if v != v.strip() and v.strip() != "")
    cols[c] = {
        "blank_or_missing": blank,
        "leading_trailing_whitespace": ws,
        "distinct_raw_values": len(set(vals)),
        "value_kinds": dict(kinds),
        "inferred_type": kinds.most_common(1)[0][0],
    }
report["columns_detail"] = cols

# ---- 2. duplicates --------------------------------------------------------
whole = Counter(tuple(r[c] for c in header) for r in rows)
report["duplicate_rows_identical"] = {
    "extra_copies": sum(n - 1 for n in whole.values() if n > 1),
    "groups": sum(1 for n in whole.values() if n > 1),
}
ids = Counter(r["order_id"].strip() for r in rows)
dup_ids = {k: v for k, v in ids.items() if v > 1}
report["order_id"] = {
    "distinct": len(ids),
    "ids_appearing_more_than_once": len(dup_ids),
    "rows_involved": sum(dup_ids.values()),
    "extra_rows_beyond_first": sum(v - 1 for v in dup_ids.values()),
    "examples": dict(sorted(dup_ids.items())[:10]),
    "blank_ids": sum(1 for r in rows if r["order_id"].strip() == ""),
}

# ---- 3. categorical variant spellings -------------------------------------
def variants(col):
    raw = Counter(r[col] for r in rows)
    groups = defaultdict(list)
    for v, n in raw.items():
        key = re.sub(r"[^a-z]", "", v.lower())      # crude fold for grouping only
        groups[key].append((v, n))
    out = {}
    for key, vs in groups.items():
        out[key] = {"variants": sorted(vs, key=lambda t: -t[1]),
                    "n_variants": len(vs),
                    "rows": sum(n for _, n in vs)}
    return raw, out

for col in ("area", "status", "item", "payment_method"):
    raw, grouped = variants(col)
    multi = {k: v for k, v in grouped.items() if v["n_variants"] > 1}
    report[f"{col}_variants"] = {
        "distinct_raw_strings": len(raw),
        "canonical_groups": len(grouped),
        "groups_with_multiple_spellings": len(multi),
        "rows_in_nonprimary_spellings": sum(
            g["rows"] - g["variants"][0][1] for g in multi.values()),
        "detail": {k: v for k, v in sorted(multi.items(), key=lambda kv: -kv[1]["rows"])},
        "all_raw_counts": dict(sorted(raw.items(), key=lambda kv: -kv[1])),
    }

# ---- 4. date formats ------------------------------------------------------
DATE_PATTERNS = [
    ("ISO yyyy-mm-dd",      re.compile(r"^\d{4}-\d{2}-\d{2}$")),
    ("dd/mm/yyyy",          re.compile(r"^\d{2}/\d{2}/\d{4}$")),
    ("d Mon yyyy",          re.compile(r"^\d{1,2} [A-Za-z]{3,9} \d{4}$")),
]
dfmt, dbad = Counter(), []
for i, r in enumerate(rows):
    v = r["order_date"].strip()
    if v == "":
        dfmt["(blank)"] += 1; continue
    for name, pat in DATE_PATTERNS:
        if pat.match(v): dfmt[name] += 1; break
    else:
        dfmt["UNRECOGNISED"] += 1; dbad.append((i + 2, r["order_date"]))
report["date_formats"] = {"counts": dict(dfmt), "unrecognised_examples": dbad[:20]}

# ---- 5. amount formats ----------------------------------------------------
AMT_PATTERNS = [
    ("plain decimal e.g. 13.000",  re.compile(r"^-?\d+\.\d+$")),
    ("suffixed ' KD' e.g. 6.500 KD", re.compile(r"^-?\d+(\.\d+)? ?KD$", re.I)),
    ("bare integer e.g. 3",        re.compile(r"^-?\d+$")),
]
afmt, abad = Counter(), []
for i, r in enumerate(rows):
    v = r["amount_kd"].strip()
    if v == "":
        afmt["(blank)"] += 1; continue
    for name, pat in AMT_PATTERNS:
        if pat.match(v): afmt[name] += 1; break
    else:
        afmt["UNRECOGNISED"] += 1; abad.append((i + 2, r["amount_kd"]))
report["amount_formats"] = {"counts": dict(afmt), "unrecognised_examples": abad[:20]}

# decimal places actually used (reveals 0.2 vs 0.200 style drift)
dp = Counter()
for r in rows:
    s = re.sub(r"\s*KD$", "", r["amount_kd"].strip(), flags=re.I)
    dp[len(s.split(".")[1]) if "." in s else 0] += 1
report["amount_decimal_places"] = dict(sorted(dp.items()))

# ---- 6. impossible / suspicious values ------------------------------------
def num(s):
    s = re.sub(r"\s*KD$", "", (s or "").strip(), flags=re.I)
    try: return float(s)
    except ValueError: return None

neg_amt = [(i+2, r["order_id"], r["amount_kd"]) for i, r in enumerate(rows)
           if (n := num(r["amount_kd"])) is not None and n < 0]
zero_amt = [(i+2, r["order_id"], r["amount_kd"]) for i, r in enumerate(rows)
            if (n := num(r["amount_kd"])) is not None and n == 0]
blank_amt = [(i+2, r["order_id"]) for i, r in enumerate(rows) if r["amount_kd"].strip() == ""]

qn = [(i+2, r["order_id"], r["quantity"]) for i, r in enumerate(rows)]
neg_qty  = [t for t in qn if (n := num(t[2])) is not None and n < 0]
zero_qty = [t for t in qn if (n := num(t[2])) is not None and n == 0]
blank_qty= [t for t in qn if t[2].strip() == ""]
nonint_qty=[t for t in qn if t[2].strip() != "" and not INT_RE.match(t[2].strip())]
big_qty  = [t for t in qn if (n := num(t[2])) is not None and n > 20]

report["impossible_values"] = {
    "negative_amount_kd": {"count": len(neg_amt), "rows": neg_amt},
    "zero_amount_kd":     {"count": len(zero_amt), "rows": zero_amt[:20]},
    "blank_amount_kd":    {"count": len(blank_amt), "rows": blank_amt[:20]},
    "negative_quantity":  {"count": len(neg_qty), "rows": neg_qty},
    "zero_quantity":      {"count": len(zero_qty), "rows": zero_qty},
    "blank_quantity":     {"count": len(blank_qty), "rows": blank_qty},
    "non_integer_quantity": {"count": len(nonint_qty), "rows": nonint_qty},
    "quantity_over_20":   {"count": len(big_qty), "rows": big_qty},
}

# ---- 7. phone / email shape (reported, not cleaned) -----------------------
phone_shapes = Counter()
for r in rows:
    v = r["phone"].strip()
    if v == "": phone_shapes["(blank)"] += 1
    elif re.match(r"^\+965 \d{4} \d{4}$", v): phone_shapes["+965 #### ####"] += 1
    elif re.match(r"^965-\d{4}-\d{4}$", v):   phone_shapes["965-####-####"] += 1
    elif re.match(r"^\d{8}$", v):             phone_shapes["8 digits, no code"] += 1
    else:                                      phone_shapes["other"] += 1
report["phone_formats"] = dict(phone_shapes)
report["email_missing"] = sum(1 for r in rows if r["email"].strip() == "")

json.dump(report, open(Path(__file__).resolve().parents[1] / "data/audit.json", "w"),
          indent=1, ensure_ascii=False)
print(json.dumps({k: v for k, v in report.items()
                  if k not in ("columns_detail",) and not k.endswith("_variants")}, indent=1))
