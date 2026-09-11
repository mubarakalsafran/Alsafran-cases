#!/usr/bin/env python3
"""Regenerate sitemap.xml from the school ids in assets/js/data.js.

Run this after adding or removing schools so search engines get every
profile URL:  python3 build.py [https://your-domain.example]
"""
import re, sys, datetime, pathlib

ROOT = pathlib.Path(__file__).parent
SITE = (sys.argv[1] if len(sys.argv) > 1 else "https://kuwaitschoolsguide.example").rstrip("/")

STATIC = [
    ("index.html",        "1.0", "daily"),
    ("directory.html",    "0.9", "daily"),
    ("american.html",     "0.8", "weekly"),
    ("british.html",      "0.8", "weekly"),
    ("kindergarten.html", "0.8", "weekly"),
    ("compare.html",      "0.5", "monthly"),
    ("about.html",        "0.4", "monthly"),
]

data = (ROOT / "assets/js/data.js").read_text(encoding="utf-8")
# school records start each object with `id:'slug',` at two-space indent
ids = re.findall(r"^  id:'([^']+)'", data, re.M)
if not ids:
    sys.exit("no school ids found in data.js — did the record format change?")

today = datetime.date.today().isoformat()
rows = [
    f"  <url><loc>{SITE}/{path}</loc><lastmod>{today}</lastmod>"
    f"<changefreq>{freq}</changefreq><priority>{pri}</priority></url>"
    for path, pri, freq in STATIC
]
rows += [
    f"  <url><loc>{SITE}/school.html?id={sid}</loc><lastmod>{today}</lastmod>"
    f"<changefreq>weekly</changefreq><priority>0.7</priority></url>"
    for sid in ids
]

(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + "\n".join(rows)
    + "\n</urlset>\n", encoding="utf-8")

(ROOT / "robots.txt").write_text(
    "User-agent: *\n"
    "Allow: /\n"
    "Disallow: /admin.html\n"
    "Disallow: /account.html\n"
    "Disallow: /favorites.html\n"
    "Disallow: /login.html\n\n"
    f"Sitemap: {SITE}/sitemap.xml\n", encoding="utf-8")

print(f"sitemap.xml: {len(rows)} urls ({len(ids)} schools)")
print("robots.txt: written")
