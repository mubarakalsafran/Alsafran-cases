#!/usr/bin/env python3
"""
Assemble the four source files into one self-contained page for publishing as
a Claude Artifact.

Artifacts wrap what you publish in their own <!doctype>/<head>/<body>, serve
under a strict CSP (external stylesheets only from Google Fonts), and control
the viewer's theme themselves. So this build:

  · emits only the page content — no <!doctype>, <html>, <head> or <body>
  · inlines goals.css, data.js and app.js, leaving the Google Fonts <link>
  · drops the theme toggle, since the artifact host owns the theme
  · keeps the <title> in the first 8KB, where the platform scans for it

The four files under assets/ stay the source of truth; this is a build output.
Run:  python3 build-artifact.py
"""
import re
import pathlib

HERE = pathlib.Path(__file__).parent
OUT = HERE / "artifact" / "kuwait-recycling-goals.html"

html = (HERE / "index.html").read_text(encoding="utf-8")
css = (HERE / "assets/css/goals.css").read_text(encoding="utf-8")
data_js = (HERE / "assets/js/data.js").read_text(encoding="utf-8")
app_js = (HERE / "assets/js/app.js").read_text(encoding="utf-8")

# body content only — the artifact platform supplies the document skeleton
body = re.search(r"<body[^>]*>(.*)</body>", html, re.S).group(1)

# the host owns the theme, so the page ships without its own toggle
body = re.sub(r'<button class="themebtn".*?</button>\s*', "", body, flags=re.S)

# local stylesheet and scripts are inlined below; strip their tags
body = re.sub(r'<script src="assets/js/[^"]+"></script>\s*', "", body)

fonts = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
         'family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&'
         'family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap">')

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(
    "<title>Kuwait's Recycling Goals</title>\n"
    f"{fonts}\n"
    f"<style>\n{css}\n</style>\n"
    f"{body.strip()}\n"
    f"<script>\n{data_js}\n{app_js}\n</script>\n",
    encoding="utf-8",
)

size = OUT.stat().st_size
print(f"built {OUT.relative_to(HERE)}  {size:,} bytes ({size / 1024 / 1024:.2f} MB of the 16 MB budget)")
built = OUT.read_text(encoding="utf-8").lower()
# match whole tags — "<head" alone would also hit the page's own <header>
for bad in (r"<!doctype", r"<html\b", r"<head\s*>", r"<body\b", r'src="assets/'):
    assert not re.search(bad, built), f"leaked into the build: {bad}"
print("checks passed: no document skeleton, no local asset references")
