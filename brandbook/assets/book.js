/* ============================================================
   ALSAFRAN brand book — gate + reader
   The book is AES-256-GCM encrypted (see build.py). The access code
   derives the key; a wrong code fails decryption, so there is nothing
   readable in this page or in content.enc without it.
   ============================================================ */
(function(){
'use strict';

const $  = (s,r)=>(r||document).querySelector(s);
const $$ = (s,r)=>Array.from((r||document).querySelectorAll(s));
const ITERS = 310000;
const KEY_SESSION = 'als_bb_code';
const KEY_VIEWER  = 'als_bb_viewer';
const KEY_READ    = 'als_bb_read';

let BOOK = null;      // decrypted payload
let INDEX = [];       // plain-text search index
let current = null;

/* ---------------- crypto ---------------- */
function b64ToBytes(b64){
  const bin = atob(b64.replace(/\s+/g,''));
  const out = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function decryptBook(code){
  const res = await fetch('content.enc', { cache:'no-store' });
  if (!res.ok) throw new Error('content.enc could not be loaded (HTTP '+res.status+')');
  const blob = b64ToBytes(await res.text());
  const salt = blob.slice(0,16), iv = blob.slice(16,28), data = blob.slice(28);
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name:'PBKDF2', salt, iterations:ITERS, hash:'SHA-256' },
    base, { name:'AES-GCM', length:256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name:'AES-GCM', iv }, key, data);
  return JSON.parse(new TextDecoder().decode(plain));
}

/* ---------------- storage helpers ---------------- */
const store = {
  get(k){ try{ return sessionStorage.getItem(k) ?? localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v,persist){ try{ (persist?localStorage:sessionStorage).setItem(k,v); }catch(e){} },
  clear(k){ try{ sessionStorage.removeItem(k); localStorage.removeItem(k); }catch(e){} },
  read(){ try{ return JSON.parse(localStorage.getItem(KEY_READ)||'[]'); }catch(e){ return []; } },
  markRead(id){
    try{
      const r = store.read();
      if (r.indexOf(id) < 0){ r.push(id); localStorage.setItem(KEY_READ, JSON.stringify(r)); }
    }catch(e){}
  }
};

function toast(msg){
  let t = $('#toast');
  if(!t){ t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(()=>t.classList.remove('on'), 2400);
}
function esc(s){
  return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* ---------------- the gate ---------------- */
function initGate(){
  const form = $('#gateForm'), btn = $('#gateBtn'), err = $('#gateErr');
  const emailEl = $('#gateEmail'), codeEl = $('#gateCode'), keepEl = $('#gateKeep');

  const saved = store.get(KEY_VIEWER);
  if (saved) emailEl.value = saved;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    err.hidden = true;
    const code = codeEl.value.trim();
    const email = emailEl.value.trim();
    if (!code) return;
    btn.disabled = true;
    btn.innerHTML = '<span class="spin"></span>Unlocking';
    try{
      const book = await open(code);
      store.set(KEY_VIEWER, email, true);
      store.set(KEY_SESSION, code, keepEl.checked);
      enter(book, email);
    }catch(ex){
      const wrong = /operation-specific reason|decrypt|OperationError/i.test(ex.name+' '+ex.message)
        || ex.name === 'OperationError';
      err.textContent = wrong
        ? 'That access code is not right. Codes are case-sensitive.'
        : ex.message;
      err.hidden = false;
      codeEl.value = ''; codeEl.focus();
    }finally{
      btn.disabled = false;
      btn.textContent = 'Open the brand book';
    }
  });
}
async function open(code){ return decryptBook(code); }

function enter(book, email){
  BOOK = book;
  buildIndex();
  $('#gate').remove();
  $('#shell').hidden = false;
  document.body.style.overflow = '';
  watermark(email || 'confidential');
  $('#viewer').textContent = email ? email : 'Confidential';
  $('#built').textContent = 'Built ' + book.built;
  renderNav();
  route();
  wireShell();
}

/* auto-enter when a code is already remembered from this session/device */
async function tryResume(){
  const code = store.get(KEY_SESSION);
  if (!code) return false;
  try{
    const book = await open(code);
    enter(book, store.get(KEY_VIEWER) || '');
    return true;
  }catch(e){
    store.clear(KEY_SESSION);
    return false;
  }
}

/* ---------------- watermark ---------------- */
function watermark(text){
  const wm = $('#wm');
  const line = (text + ' · ' + new Date().toISOString().slice(0,10) + ' · ALSAFRAN CONFIDENTIAL').toUpperCase();
  let html = '';
  for (let r=0;r<9;r++)
    for (let c=0;c<3;c++)
      html += `<span style="top:${r*13}%;left:${c*42-8}%">${esc(line)}</span>`;
  wm.innerHTML = html;
}

/* ---------------- search index ---------------- */
function buildIndex(){
  const strip = document.createElement('div');
  INDEX = BOOK.sections.map(s=>{
    strip.innerHTML = s.html;
    const text = (strip.textContent || '').replace(/\s+/g,' ');
    return { id:s.id, label:s.label, title:s.title, text };
  });
  strip.innerHTML = '';
}
function search(q){
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  const hits = [];
  BOOK.sections.forEach((s,i)=>{
    // heading matches rank first
    s.subs.forEach(sub=>{
      if (sub.t.toLowerCase().includes(needle))
        hits.push({ href:'#'+sub.id, sec:s.label, title:sub.t, snip:'', w:0 });
    });
    if (s.label.toLowerCase().includes(needle) || s.title.toLowerCase().includes(needle))
      hits.push({ href:'#'+s.id, sec:'Section '+(i+1), title:s.title, snip:s.summary, w:1 });
    const txt = INDEX[i].text, at = txt.toLowerCase().indexOf(needle);
    if (at > -1){
      const from = Math.max(0, at-70), to = Math.min(txt.length, at+needle.length+90);
      const snip = (from?'…':'') + txt.slice(from,to) + (to<txt.length?'…':'');
      hits.push({ href:'#'+s.id, sec:s.label, title:s.title, snip, w:2, mark:needle });
    }
  });
  return hits.sort((a,b)=>a.w-b.w).slice(0,24);
}

/* ---------------- nav ---------------- */
function renderNav(){
  const read = store.read();
  $('#nav').innerHTML = BOOK.sections.map((s,i)=>`
    <div>
      <a class="navsec ${read.indexOf(s.id)>-1?'read':''}" href="#${s.id}" data-sec="${s.id}">
        <b><em>${String(i+1).padStart(2,'0')}</em>${esc(s.label)}</b>
        <span>${s.mins} min read</span>
      </a>
      <ul class="navsub" id="subs-${s.id}" hidden>
        ${s.subs.map(x=>`<li><a href="#${x.id}">${esc(x.t)}</a></li>`).join('')}
      </ul>
    </div>`).join('');
  $('#navMeta').textContent = BOOK.sections.length + ' sections · ' +
    BOOK.words.toLocaleString() + ' words · ~' + BOOK.mins + ' min';
  paintProgress();
}
function paintProgress(){
  const read = store.read().filter(id=>BOOK.sections.some(s=>s.id===id));
  const pct = Math.round(read.length / BOOK.sections.length * 100);
  $('#progBar').style.width = pct + '%';
  $('#progTxt').textContent = read.length + ' of ' + BOOK.sections.length + ' sections read';
}

/* ---------------- render ---------------- */
function renderCover(){
  const b = BOOK;
  $('#reader').innerHTML = `
    <div class="cover">
      <div class="cover__hero">
        <span class="thread"><i></i><s></s><s></s><s></s></span>
        <h1>${esc(b.brand)}<br><span class="k">Blueprint</span></h1>
        <p>${esc(b.subtitle)} — the full brand, product, pricing and launch plan for a
        Kuwait-born carry label. ${b.sections.length} sections, ${b.words.toLocaleString()} words,
        about ${b.mins} minutes end to end.</p>
      </div>
      <div class="toc">
        ${b.sections.map((s,i)=>`
          <a href="#${s.id}">
            <em>${String(i+1).padStart(2,'0')}</em>
            <span><b>${esc(s.label)}</b><span>${esc(s.summary)}</span></span>
            <i>${s.mins} min</i>
          </a>`).join('')}
      </div>
      <p style="margin-top:26px;font-size:.78rem;color:var(--ash)">
        Short on time? Read <a href="#verdict">11 — The Verdict</a> on its own: the recommended
        direction, the startup budget, what to launch with and the first ten actions.
      </p>
    </div>`;
  document.title = 'ALSAFRAN — Brand Blueprint';
  $$('.navsec').forEach(a=>a.classList.remove('on'));
  $$('.navsub').forEach(u=>u.hidden = true);
}

function renderSection(id){
  const i = BOOK.sections.findIndex(s=>s.id===id);
  if (i < 0) return renderCover();
  const s = BOOK.sections[i];
  const prev = BOOK.sections[i-1], next = BOOK.sections[i+1];
  $('#reader').innerHTML = `
    <article class="doc">
      <header class="doc__head">
        <p class="doc__eyebrow">Section ${String(i+1).padStart(2,'0')} of ${BOOK.sections.length}</p>
        <h1>${esc(s.title)}</h1>
        <p class="doc__meta">${s.words.toLocaleString()} words · ~${s.mins} min read</p>
      </header>
      ${s.html}
    </article>
    <nav class="pager">
      ${prev ? `<a href="#${prev.id}"><span>← Previous</span><b>${esc(prev.label)}</b></a>`
             : `<a class="ghost" href="#"><span>-</span><b>-</b></a>`}
      ${next ? `<a class="next" href="#${next.id}"><span>Next →</span><b>${esc(next.label)}</b></a>`
             : `<a class="next" href="#contents"><span>Back to</span><b>Contents</b></a>`}
    </nav>`;
  document.title = s.label + ' — ALSAFRAN Blueprint';
  current = id;
  store.markRead(id);

  $$('.navsec').forEach(a=>a.classList.toggle('on', a.dataset.sec===id));
  $$('.navsub').forEach(u=>u.hidden = (u.id !== 'subs-'+id));
  const active = $('.navsec.on');
  if (active) active.classList.add('read');
  paintProgress();
}

function renderResults(q){
  const hits = search(q);
  $('#reader').innerHTML = `
    <div class="results">
      <h2>${hits.length} result${hits.length===1?'':'s'} for “${esc(q)}”</h2>
      ${hits.length ? hits.map(h=>{
        let snip = esc(h.snip);
        if (h.mark){
          const re = new RegExp('('+h.mark.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');
          snip = snip.replace(re,'<mark>$1</mark>');
        }
        return `<a class="hit" href="${h.href}"><em>${esc(h.sec)}</em><b>${esc(h.title)}</b>
                ${snip?`<p>${snip}</p>`:''}</a>`;
      }).join('')
      : `<p style="color:var(--ash)">Nothing matched. Try “magsafe”, “budget”, “tabby”, “sadu”, “drop pass” or “packaging”.</p>`}
    </div>`;
  document.title = 'Search — ALSAFRAN Blueprint';
}

/* ---------------- routing ---------------- */
function renderCurrent(){                 // restore the view without touching the drawer
  const hash = decodeURIComponent(location.hash.replace(/^#/,''));
  if (!hash || hash === 'contents') renderCover();
  else renderSection(hash.split('--')[0]);
}
function route(){
  const hash = decodeURIComponent(location.hash.replace(/^#/,''));
  closeSide();
  if (!hash || hash === 'contents'){ renderCover(); window.scrollTo(0,0); return; }
  if (hash.indexOf('--') > -1){                        // a sub-heading inside a section
    const sec = hash.split('--')[0];
    if (sec !== current) renderSection(sec);
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ block:'start' });
    else window.scrollTo(0,0);
    return;
  }
  renderSection(hash);
  window.scrollTo(0,0);
}

/* ---------------- shell wiring ---------------- */
function openSide(){ $('#side').classList.add('on'); $('#scrim').classList.add('on'); }
function closeSide(){ $('#side').classList.remove('on'); $('#scrim').classList.remove('on'); }

function wireShell(){
  window.addEventListener('hashchange', route);
  $('#menuBtn').addEventListener('click', openSide);
  $('#sideClose').addEventListener('click', closeSide);
  $('#scrim').addEventListener('click', closeSide);
  document.addEventListener('keydown', e=>{
    if (e.key === 'Escape'){ closeSide(); }
    if (e.key === '/' && document.activeElement !== $('#q')){ e.preventDefault(); $('#q').focus(); }
    if (e.key === 'ArrowRight' && e.altKey) step(1);
    if (e.key === 'ArrowLeft'  && e.altKey) step(-1);
  });

  let t;
  const q = $('#q');
  q.addEventListener('input', e=>{
    clearTimeout(t);
    const v = e.target.value;
    t = setTimeout(()=>{
      if (v.trim().length < 2){ renderCurrent(); return; }
      renderResults(v);
      window.scrollTo(0,0);
    }, 180);
  });
  // the search box lives in the drawer, so on a phone the results render behind it —
  // Enter (or the keyboard's search key) closes the drawer to reveal them
  q.addEventListener('keydown', e=>{
    if (e.key === 'Enter'){ e.preventDefault(); q.blur(); closeSide(); }
  });
  q.addEventListener('search', ()=>{ if (q.value.trim().length >= 2) closeSide(); });

  $('#printBtn').addEventListener('click', ()=>{
    // print the whole book, not just the open section — this is the "PDF" escape hatch
    const holder = document.createElement('div');
    holder.id = 'printHolder';
    holder.innerHTML = BOOK.sections.map((s,i)=>`
      <article class="doc">
        <header class="doc__head">
          <p class="doc__eyebrow">Section ${String(i+1).padStart(2,'0')}</p>
          <h1>${esc(s.title)}</h1>
        </header>${s.html}
      </article>`).join('');
    $('#reader').appendChild(holder);
    document.body.classList.add('print-all');
    const done = ()=>{
      document.body.classList.remove('print-all');
      const h = $('#printHolder'); if (h) h.remove();
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    setTimeout(()=>window.print(), 60);
  });

  $('#lockBtn').addEventListener('click', ()=>{
    store.clear(KEY_SESSION);
    location.reload();
  });

  $('#copyBtn') && $('#copyBtn').addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(location.href); toast('Link copied'); }
    catch(e){ toast('Copy the URL from the address bar'); }
  });
}
function step(d){
  const i = BOOK.sections.findIndex(s=>s.id===current);
  const t = BOOK.sections[i+d];
  if (t) location.hash = '#'+t.id;
}

/* ---------------- boot ---------------- */
document.addEventListener('DOMContentLoaded', async ()=>{
  if (!(window.crypto && crypto.subtle)){
    $('#gateErr').textContent = 'This browser cannot decrypt the book (Web Crypto unavailable). Use a current browser over https:// or localhost.';
    $('#gateErr').hidden = false;
    return;
  }
  initGate();
  if (!(await tryResume())) $('#gateCode').focus();
});
})();
