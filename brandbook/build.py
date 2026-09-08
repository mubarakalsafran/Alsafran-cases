#!/usr/bin/env python3
"""
Build the ALSAFRAN brand book site from docs/*.md.

The site is static, so a login page that merely hides a <div> would be theatre —
anyone could read the content in "view source". Instead this script ENCRYPTS the
whole book with AES-256-GCM using a key derived from the access code, and the
login page decrypts it in the browser. Without the code, content.enc is noise.

    python3 brandbook/build.py                      # uses the default code
    ALSAFRAN_CODE="your-code" python3 brandbook/build.py

Outputs brandbook/content.enc (base64 of salt | iv | ciphertext).
"""
import base64, io, json, os, re, sys, datetime, hashlib
from pathlib import Path

import markdown
from Crypto.Cipher import AES

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
OUT = ROOT / "brandbook" / "content.enc"

DEFAULT_CODE = "goldroute"
PBKDF2_ITERS = 310_000

# section id, source file, short nav label, one-line summary for the contents page
SECTIONS = [
    ("identity",   "01-brand-identity.md",           "Brand Identity",   "Naming, tagline, story, audience, voice, visual identity, handles"),
    ("product",    "02-product-concept.md",          "Product",          "Three tiers, eight style families, materials, protection, model roadmap"),
    ("usp",        "03-usp.md",                      "The Moat",         "Five differentiators, ranked by how hard they are to copy"),
    ("market",     "04-kuwait-gcc-market.md",        "Kuwait & GCC",     "How this market buys, the calendar, and the expansion sequence"),
    ("pricing",    "05-pricing.md",                  "Pricing",          "Unit economics in KWD, three positioning options, bundles"),
    ("packaging",  "06-packaging-unboxing.md",       "Packaging",        "The box, costed to the fils, and the unboxing choreography"),
    ("store",      "07-online-store.md",             "Online Store",     "Every page specified, plus the production tech stack"),
    ("launch",     "08-launch-strategy.md",          "Launch",           "Fourteen stages, week by week, with named content ideas"),
    ("collection", "09-first-collection.md",         "Drop 01",          "Gold Route: eleven cases, fully specified, and two buy plans"),
    ("vision",     "10-long-term-vision.md",         "Long-Term",        "Cases to Mag system to daily carry to a lifestyle house"),
    ("verdict",    "11-recommendation-and-budget.md","The Verdict",      "Final direction, startup budget, what to launch with, first 10 actions"),
]

MD = markdown.Markdown(extensions=["tables", "fenced_code", "attr_list", "sane_lists", "md_in_html"])


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def convert(md_text, sec_id):
    """Markdown -> HTML, then fix up what the book layout needs."""
    # cross-document links (docs/05-pricing.md#anchor) become in-book jumps
    for other_id, fname, _, _ in SECTIONS:
        md_text = re.sub(r"\(" + re.escape(fname) + r"(#[a-z0-9\-]*)?\)",
                         lambda m, o=other_id: "(#" + o + ")", md_text)
    md_text = re.sub(r"\((?:\.\./)?docs/([0-9]{2})-[a-z\-]+\.md(#[a-z0-9\-]*)?\)",
                     lambda m: "(#" + SECTIONS[int(m.group(1)) - 1][0] + ")", md_text)

    MD.reset()
    html = MD.convert(md_text)

    # the first h1 becomes the section title in the header, not body copy
    html = re.sub(r"^\s*<h1>.*?</h1>", "", html, count=1, flags=re.S)

    # every h2 gets an anchor so the sidebar can deep-link inside a section
    def anchor_h2(m):
        inner = m.group(1)
        text = re.sub(r"<[^>]+>", "", inner)
        return f'<h2 id="{sec_id}--{slug(text)}">{inner}</h2>'
    html = re.sub(r"<h2>(.*?)</h2>", anchor_h2, html, flags=re.S)

    # wide tables must scroll in their own box, never the page
    html = re.sub(r"<table>", '<div class="tw"><table>', html)
    html = re.sub(r"</table>", "</table></div>", html)

    # checklists read better as real list markers than "[ ]"
    html = html.replace("<li>[ ] ", '<li class="tick">').replace("<li>[x] ", '<li class="tick done">')
    return html


def h2s(html, sec_id):
    out = []
    for m in re.finditer(r'<h2 id="([^"]+)">(.*?)</h2>', html, flags=re.S):
        text = re.sub(r"<[^>]+>", "", m.group(2)).strip()
        text = re.sub(r"^[0-9]+\.[0-9]+\s*", "", text)          # drop "5.3 " numbering
        out.append({"id": m.group(1), "t": text})
    return out


def main():
    code = os.environ.get("ALSAFRAN_CODE", DEFAULT_CODE)
    sections, total_words = [], 0
    for sec_id, fname, label, summary in SECTIONS:
        path = DOCS / fname
        if not path.exists():
            sys.exit(f"missing {path}")
        raw = io.open(path, encoding="utf-8").read()
        title = re.search(r"^#\s+(.*)$", raw, flags=re.M).group(1)
        title = re.sub(r"^[0-9]+\.\s*", "", title)
        words = len(raw.split())
        total_words += words
        sections.append({
            "id": sec_id, "label": label, "title": title, "summary": summary,
            "words": words, "mins": max(1, round(words / 220)),
            "html": convert(raw, sec_id),
        })
        sections[-1]["subs"] = h2s(sections[-1]["html"], sec_id)

    payload = json.dumps({
        "brand": "ALSAFRAN",
        "subtitle": "Brand, Product & Commerce Blueprint",
        "built": datetime.date.today().isoformat(),
        "words": total_words,
        "mins": max(1, round(total_words / 220)),
        "sections": sections,
    }, ensure_ascii=False, separators=(",", ":")).encode("utf-8")

    salt = os.urandom(16)
    iv = os.urandom(12)
    key = hashlib.pbkdf2_hmac("sha256", code.encode("utf-8"), salt, PBKDF2_ITERS, 32)
    cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
    ct, tag = cipher.encrypt_and_digest(payload)
    blob = salt + iv + ct + tag          # WebCrypto expects the tag appended to the ciphertext
    OUT.write_text(base64.b64encode(blob).decode("ascii"))

    print(f"built {len(sections)} sections · {total_words:,} words · {payload.__len__()/1024:.0f} KB plain "
          f"-> {OUT.stat().st_size/1024:.0f} KB encrypted")
    print(f"access code: {code!r}" + ("  (default — set ALSAFRAN_CODE to change it)" if code == DEFAULT_CODE else ""))


if __name__ == "__main__":
    main()
