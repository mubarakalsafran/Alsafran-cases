#!/usr/bin/env python3
"""Bundle the whole site into one self-contained HTML file.

The multi-page site stays the source of truth. This packs every page's <main>
markup plus the stylesheet and the four scripts into a single document that
routes on the hash, so the guide can be viewed from anywhere a single file can
be opened or published.

    python3 bundle.py [out.html]
"""
import re, sys, pathlib, html, base64, json

ROOT = pathlib.Path(__file__).parent
OUT  = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist" / "kuwait-schools-guide.html"

PAGES = ["index.html","directory.html","american.html","british.html","kindergarten.html",
         "school.html","compare.html","favorites.html","login.html","account.html",
         "about.html","admin.html"]

def read(p): return (ROOT / p).read_text(encoding="utf-8")

def main_of(page):
    """The <main> inner markup, plus the inline <script> that drives the page."""
    src = read(page)
    m = re.search(r"<main id=\"main\">(.*?)</main>", src, re.S)
    body = m.group(1) if m else ""
    if page == "admin.html":                      # admin has no <main>
        body = '<div id="adminMount"></div>'
    calls = re.findall(r"<script>\s*(.*?)\s*</script>", src, re.S)
    return body, "\n".join(calls)

shells, inits = {}, {}
for pg in PAGES:
    body, call = main_of(pg)
    shells[pg] = body
    inits[pg]  = call

def js_str(t):
    return ("`" + t.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${") + "`")

def logo_data_uris():
    """Every school logo as a data: URI, keyed by school id.

    The bundle is a single file with no sibling assets, so the <img> src has
    to travel inside it. KSG.LOGO_DATA is consulted before the relative path,
    which is why the same logoHTML() serves both builds.
    """
    out = {}
    for f in sorted((ROOT / "assets/img/logos").glob("*.png")):
        out[f.stem] = "data:image/png;base64," + base64.b64encode(f.read_bytes()).decode()
    return out

css   = read("assets/css/style.css")
datajs= read("assets/js/data.js")
appjs = read("assets/js/app.js")
pagesjs=read("assets/js/pages.js")
adminjs=read("assets/js/admin.js")

shell_js = ",\n".join("  %r: %s" % (k, js_str(v)) for k, v in shells.items())
init_js  = ",\n".join("  %r: function(){ %s }" % (k, v or "") for k, v in inits.items())

ROUTER = """
/* ============================================================
   single-file router
   The multi-page site is the source of truth; this bundle carries
   each page's <main> markup and swaps it on hash change, so every
   controller runs exactly as it does on the real site.
   ============================================================ */
(function(){
'use strict';
const SHELLS = {
%(shells)s
};
const INITS = {
%(inits)s
};

const main = document.getElementById('main');

/* The admin page removes the public header and footer, since its sidebar is
   the only chrome there. In a single document those nodes would then be gone
   for every later route, so they are re-created on demand. */
function ensureChrome(){
  if(!document.getElementById('hdr')){
    const h = document.createElement('header');
    h.id = 'hdr';
    main.parentNode.insertBefore(h, main);
  }
  if(!document.getElementById('ftr')){
    const f = document.createElement('footer');
    f.id = 'ftr';
    main.parentNode.insertBefore(f, main.nextSibling);
  }
}

function render(){
  const page = KSG.Route.page();
  const shell = SHELLS[page] || SHELLS['index.html'];
  main.innerHTML = shell;
  ensureChrome();
  /* the header/footer are rebuilt so the active nav item and the
     favourites/compare pips follow the route */
  KSG.boot();
  try{
    (INITS[page] || INITS['index.html'])();
  }catch(e){
    main.innerHTML = '<div class="wrap sec"><div class="empty"><h3>Something went wrong on this page</h3>' +
      '<p>' + String(e && e.message || e) + '</p>' +
      '<p><a class="btn btn-pri" href="#/index.html">Back to the homepage</a></p></div></div>';
    console.error(e);
  }
  window.scrollTo(0,0);
}

/* Internal links keep their real filenames in the markup, which keeps the
   multi-page site semantic. Here they are intercepted and turned into hash
   routes instead of page loads. */
document.addEventListener('click', function(e){
  const a = e.target.closest && e.target.closest('a[href]');
  if(!a) return;
  const raw = a.getAttribute('href');
  if(!raw || /^(https?:|mailto:|tel:|#)/.test(raw)) return;
  const page = raw.split('?')[0].split('#')[0];
  if(!SHELLS[page]) return;
  e.preventDefault();
  const target = '#/' + raw;
  if(location.hash === target) render(); else location.hash = target;
});

window.addEventListener('hashchange', render);
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
else render();
})();
"""

page_html = """<title>Kuwait Schools Guide</title>
<style>
%(css)s
/* the bundle is one document, so the page shells stack inside a single main */
#main{ display:block }
</style>

<a class="skip" href="#main">Skip to content</a>
<header id="hdr"></header>
<main id="main"></main>
<footer id="ftr"></footer>

<script>
/* mark this document as the single-file build so KSG.Route uses hash routing */
document.documentElement.setAttribute('data-spa','');
</script>
<script>
%(data)s
</script>
<script>
%(app)s
</script>
<script>
/* logos, inlined — see logo_data_uris() */
Object.assign(KSG.LOGO_DATA, %(logos)s);
</script>
<script>
%(pages)s
</script>
<script>
%(admin)s
</script>
<script>
%(router)s
</script>
""" % dict(
    css=css, data=datajs, app=appjs, pages=pagesjs, admin=adminjs,
    logos=json.dumps(logo_data_uris()),
    router=ROUTER % dict(shells=shell_js, inits=init_js),
)

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(page_html, encoding="utf-8")
kb = len(page_html.encode()) / 1024
print("wrote %s (%.0f KB, %d pages, %d logos inlined)"
      % (OUT, kb, len(PAGES), len(logo_data_uris())))
