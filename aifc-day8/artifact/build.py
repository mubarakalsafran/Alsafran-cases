#!/usr/bin/env python3
"""Build the standalone Kuwait Orders Data Lab page.

Reads the cleaned dataset and the Stage 1/2 outputs and injects them into
template.html. Nothing is retyped by hand: every number on the page comes
from these files, which in turn come from kuwait-orders-dirty.csv.
"""
import csv, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
COMMIT = "9a3ff1c"
REPO = "https://github.com/mubarakalsafran/Alsafran-cases/blob/" + COMMIT + "/aifc-day8/data/"

def jload(name):
    with open(os.path.join(DATA, name)) as fh:
        return json.load(fh)

orders = []
with open(os.path.join(DATA, "kuwait-orders-clean.csv")) as fh:
    for r in csv.DictReader(fh):
        orders.append({
            "id": r["order_id"],
            "area": r["area"],
            "date": r["order_date"],
            "dated": r["date_valid"] == "yes",
            "item": r["item"],
            "qty": int(r["quantity"]),
            "kd": float(r["amount_kd"]),
            "unit": float(r["unit_price_kd"]),
            "pay": r["payment_method"],
            "status": r["status"],
        })

metrics = jload("metrics.json")
log = jload("cleaning-log.json")
excluded = jload("excluded-rows.json")
a = jload("audit.json")
audit = {
    "email_missing": a["email_missing"],
    "columns_detail": {"area": {"blank_or_missing": a["columns_detail"]["area"]["blank_or_missing"]}},
    "date_formats": a["date_formats"],
    "amount_formats": a["amount_formats"],
    "variants": {
        "area": {"distinct_raw_strings": a["area_variants"]["distinct_raw_strings"]},
        "status": {"distinct_raw_strings": a["status_variants"]["distinct_raw_strings"]},
        "item": {"distinct_raw_strings": a["item_variants"]["distinct_raw_strings"]},
        "payment_method": {"distinct_raw_strings": a["payment_method_variants"]["distinct_raw_strings"]},
    },
}

# ---------------------------------------------------------------- before / after
# Rebuilt from the RAW file using the same canonical maps the cleaning script
# used, so the chips on the Quality tab are the file's own spellings and counts.
import ast, re

def const(name):
    """Lift a literal map out of scripts/clean.py without running the script."""
    src = open(os.path.join(HERE, "..", "scripts", "clean.py")).read()
    for node in ast.parse(src).body:
        if isinstance(node, ast.Assign):
            for t in node.targets:
                if isinstance(t, ast.Name) and t.id == name:
                    return ast.literal_eval(node.value)
    raise KeyError(name)

AREA_CANON, STATUS_CANON, PAY_CANON = const("AREA_CANON"), const("STATUS_CANON"), const("PAY_CANON")
fold = lambda s: re.sub(r"[^a-z]", "", s.lower())

def show(v):
    """Render a raw value so invisible whitespace is visible."""
    return "'%s'" % v if v != v.strip() else v

def groups(column, canon):
    counts = {}
    with open(os.path.join(DATA, "raw", "kuwait-orders-dirty.csv")) as fh:
        for row in csv.DictReader(fh):
            raw = row[column]
            key = canon.get(fold(raw.strip()))
            if not key:
                continue
            counts.setdefault(key, {}).setdefault(show(raw), 0)
            counts[key][show(raw)] += 1
    out = []
    for name, spellings in counts.items():
        if len(spellings) < 2:
            continue
        rows = sum(spellings.values())
        out.append({
            "after": name,
            "column": column,
            "before": sorted(spellings.items(), key=lambda kv: (-kv[1], kv[0])),
            "rows": rows,
            "note": "%d spellings in the raw file → one %s of %d rows" % (len(spellings), name, rows),
        })
    return sorted(out, key=lambda g: -g["rows"])

before_after = groups("area", AREA_CANON) + groups("status", STATUS_CANON) + groups("payment_method", PAY_CANON)

# every retained row must still satisfy amount = unit price x quantity
bad = [o["id"] for o in orders if round(o["unit"] * o["qty"], 3) != round(o["kd"], 3)]
assert not bad, "amount != unit price x quantity for: %s" % bad
assert len(orders) == metrics["clean_rows"], "row count disagrees with metrics.json"
delivered = [o for o in orders if o["status"] == "Delivered"]
assert round(sum(o["kd"] for o in delivered), 3) == metrics["delivered_revenue_kd"], "revenue disagrees with metrics.json"

payload = {
    "orders": orders, "metrics": metrics, "log": log, "excluded": excluded, "audit": audit,
    "before_after": before_after,
    "links": {"clean": REPO + "kuwait-orders-clean.csv", "raw": REPO + "raw/kuwait-orders-dirty.csv"},
}

with open(os.path.join(HERE, "template.html")) as fh:
    html = fh.read()
assert "__DATA__" in html
html = html.replace("__DATA__", json.dumps(payload, separators=(",", ":"), ensure_ascii=False))
out = os.path.join(HERE, "index.html")
with open(out, "w") as fh:
    fh.write(html)
print("wrote %s (%d bytes) — %d orders, %d log entries, %d exclusions"
      % (out, len(html), len(orders), len(log), len(excluded)))
print("before/after groups derived from raw file: %d" % len(before_after))
print("checks: amount=price*qty on all %d rows; delivered revenue %.3f KD" %
      (len(orders), sum(o["kd"] for o in delivered)))
