# Standalone page — Kuwait Orders Data Lab

A single self-contained HTML page carrying the whole Day 8 hand-in: the audit,
the cleaning log, the exclusions, the six analysis tabs and the five-beat story.

    python3 build.py        # reads ../data/*, writes index.html

`build.py` injects the data; nothing is retyped by hand. It reads the cleaned
CSV, `metrics.json`, `cleaning-log.json`, `excluded-rows.json` and `audit.json`,
rebuilds the before/after spelling groups from the **raw** file using the same
canonical maps `scripts/clean.py` used, and refuses to write the page unless:

* every retained row still satisfies `amount_kd = unit_price_kd × quantity`,
* the row count matches `metrics.json`, and
* delivered revenue matches `metrics.json` to the fils.

`template.html` is the page with a `__DATA__` placeholder. Edit the template,
never `index.html`.
