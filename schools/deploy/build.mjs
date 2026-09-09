/* Vercel build step for Kuwait Schools Guide.
 *
 * The site is a dependency-free static directory that lives in schools/ of a
 * public repository. This pulls that directory at build time and writes it to
 * public/, then rewrites the sitemap and robots.txt to whatever host Vercel is
 * actually serving, so the absolute URLs in them are never stale.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const REPO = 'mubarakalsafran/Alsafran-cases';
const REF  = process.env.SITE_REF  || 'claude/kuwait-schools-guide-nn8d5y';
const SUB  = process.env.SITE_DIR  || 'schools';
const OUT  = 'public';

const FILES = [
  'index.html','directory.html','american.html','british.html','kindergarten.html',
  'school.html','compare.html','favorites.html','login.html','account.html',
  'about.html','admin.html','robots.txt','sitemap.xml',
  'assets/css/style.css',
  'assets/js/data.js','assets/js/app.js','assets/js/pages.js','assets/js/admin.js',
];

/* Whatever host this deployment answers on. Vercel exposes the stable
   production domain separately from the per-deployment URL; prefer the stable
   one so the sitemap does not point at a throwaway preview host. */
const host =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  'kuwait-schools-guide.vercel.app';
const ORIGIN = 'https://' + host;

const raw = f => `https://raw.githubusercontent.com/${REPO}/${REF}/${SUB}/${f}`;

async function get(f){
  const res = await fetch(raw(f));
  if(!res.ok) throw new Error(`${f} → HTTP ${res.status} from ${raw(f)}`);
  return res.text();
}

const results = await Promise.all(FILES.map(async f => [f, await get(f)]));

let bytes = 0;
for(let [f, body] of results){
  /* the checked-in files carry a placeholder origin; point them at this host */
  if(f === 'sitemap.xml' || f === 'robots.txt'){
    body = body.replace(/https:\/\/[a-z0-9.-]*(?:kuwaitschoolsguide\.example|kuwait-schools-guide\.vercel\.app)/g, ORIGIN);
  }
  const dest = join(OUT, f);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, body, 'utf8');
  bytes += Buffer.byteLength(body);
}

/* A silent partial build would publish a broken directory, so fail loudly. */
if(results.length !== FILES.length) throw new Error('missing files in build');

console.log(`built ${results.length} files (${Math.round(bytes/1024)} KB) from ${REPO}@${REF}/${SUB}`);
console.log(`absolute URLs point at ${ORIGIN}`);
