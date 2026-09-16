# Kuwait Orders Data Lab — AIFC Day 8

**Status: waiting on the raw dataset.**

Drop the practice file at:

    data-lab/data/raw/kuwait-orders-dirty.csv

This copy is the immutable original and is never written to by any script here.

## Stage 1 — audit before cleaning

    node data-lab/scripts/audit.mjs data-lab/data/raw/kuwait-orders-dirty.csv

`audit.mjs` is read-only. It infers the schema from the header rather than
assuming one, and reports an exact count for every issue in the Day 8 brief:
row/column counts, per-column types, missing values, duplicate rows, duplicate
and case-variant IDs, spelling-variant clusters for every categorical column,
number and currency formats, date formats, impossible calendar dates, negative
values, unexpected zeros, non-numeric text in numeric columns, outliers, and
whitespace/encoding problems.

Cleaning only begins after this audit has been read.
