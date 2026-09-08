/* ============================================================
   ALSAFRAN — storefront prototype behaviour
   Vanilla JS, no dependencies. Cart + model choice persist.
   ============================================================ */
(function(){
'use strict';

const $  = (s,r)=> (r||document).querySelector(s);
const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
const store = {
  get(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
};

const NAV = [
  ['index.html','Home','الرئيسية'],
  ['shop.html','Shop','المتجر'],
  ['drops.html','New Drops','الدروب'],
  ['best-sellers.html','Best Sellers','الأكثر مبيعاً'],
  ['customize.html','Customize','خصص كفرك'],
  ['collections.html','Collections','المجموعات'],
  ['about.html','About Us','عن العلامة'],
  ['faq.html','FAQ','الأسئلة'],
  ['track-order.html','Track Order','تتبع الطلب'],
  ['contact.html','Contact','تواصل']
];
const FREE_SHIP = 15;
const here = location.pathname.split('/').pop() || 'index.html';

/* ---------------- cart ---------------- */
const Cart = {
  items(){ return store.get('als_cart',[]); },
  save(v){ store.set('als_cart',v); paint(); },
  count(){ return this.items().reduce((n,i)=>n+i.qty,0); },
  total(){ return this.items().reduce((n,i)=>n+i.price*i.qty,0); },
  add(item){
    const c = this.items();
    const key = i => [i.pid,i.color,i.model,i.custom||'',i.finish||''].join('|');
    const found = c.find(i=>key(i)===key(item));
    if (found) found.qty += item.qty||1; else c.push(Object.assign({qty:1},item));
    this.save(c);
    toast(item.name + ' added');
    openPanel('#cartPanel');
  },
  bump(idx,d){
    const c = this.items();
    if(!c[idx]) return;
    c[idx].qty += d;
    if (c[idx].qty < 1) c.splice(idx,1);
    this.save(c);
  }
};

function toast(msg){
  let t = $('#toast');
  if(!t){ t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(()=>t.classList.remove('on'),2200);
}

/* ---------------- chrome ---------------- */
const ICON = {
  menu:'<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  bag:'<svg viewBox="0 0 24 24"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  close:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  home:'<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8Z"/></svg>',
  drop:'<svg viewBox="0 0 24 24"><path d="M12 3s6 6.4 6 10a6 6 0 0 1-12 0c0-3.6 6-10 6-10Z"/></svg>',
  spark:'<svg viewBox="0 0 24 24"><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/></svg>',
  wa:'<svg viewBox="0 0 24 24"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.9.54 3.68 1.48 5.2L2 22l5.1-1.62a9.8 9.8 0 0 0 4.94 1.34c5.44 0 9.84-4.4 9.84-9.84S17.48 2 12.04 2Zm5.7 13.9c-.24.68-1.4 1.3-1.94 1.34-.54.04-1.02.24-3.46-.9-2.44-1.14-3.96-3.72-4.08-3.9-.12-.18-.96-1.32-.9-2.5.06-1.18.7-1.74.94-1.98.24-.24.5-.28.68-.28h.48c.16 0 .38-.06.58.44s.68 1.72.74 1.84c.06.12.1.26.02.42-.08.16-.16.26-.32.44-.16.18-.34.4-.24.58.1.18.44.86 1.02 1.4.74.68 1.36.9 1.54.98.18.08.3.06.42-.06.12-.12.5-.58.64-.78.14-.2.28-.16.46-.1.18.06 1.16.56 1.36.66.2.1.34.14.38.22.04.08.04.46-.2 1.14Z"/></svg>'
};

function chrome(){
  const t = $('#alsTicker'), h = $('#alsHeader'), f = $('#alsFooter');
  if (t) t.innerHTML =
    `<div class="ticker" id="tickerLine"><b>DROP 01 — GOLD ROUTE</b> · LIVE NOW · 87/100 CLAIMED ON 965</div>`;
  if (h) h.innerHTML = `
    <header class="hdr">
      <div class="wrap hdr__bar">
        <div class="hdr__l">
          <button class="iconbtn" id="navBtn" aria-label="Open menu">${ICON.menu}</button>
          <button class="iconbtn" aria-label="Search">${ICON.search}</button>
        </div>
        <a class="hdr__mark" href="index.html">Alsafran</a>
        <div class="hdr__r">
          <button class="lang" aria-label="Switch language">EN&nbsp;|&nbsp;<span class="ar">ع</span></button>
          <button class="iconbtn" id="cartBtn" aria-label="Open cart">${ICON.bag}<span class="badge" id="cartBadge" hidden>0</span></button>
        </div>
      </div>
    </header>`;

  const panels = document.createElement('div');
  panels.innerHTML = `
    <div class="scrim" id="scrim"></div>
    <nav class="panel panel--l" id="navPanel" aria-label="Main">
      <div class="panel__top"><strong>Menu</strong>
        <button class="iconbtn" data-close aria-label="Close">${ICON.close}</button></div>
      <ul class="navlist">${NAV.map(([href,en,ar])=>
        `<li><a href="${href}" class="${href===here?'on':''}">${en}<span class="ar">${ar}</span></a></li>`).join('')}</ul>
      <div class="panel__foot">
        <p class="muted" style="font-size:.75rem;margin-bottom:.5rem">Drops, not stock · Kuwait 🇰🇼</p>
        <a class="btn btn--gold btn--block btn--sm" href="drops.html">Join the drop pass</a>
      </div>
    </nav>
    <aside class="panel panel--r" id="cartPanel" aria-label="Cart">
      <div class="panel__top"><strong>Your bag</strong>
        <button class="iconbtn" data-close aria-label="Close">${ICON.close}</button></div>
      <div style="padding:0 1rem 1rem" id="cartBody"></div>
    </aside>`;
  document.body.appendChild(panels);

  const tabs = document.createElement('nav');
  tabs.className = 'tabbar';
  tabs.innerHTML = [
    ['index.html','Home',ICON.home],['shop.html','Shop',ICON.bag],
    ['customize.html','Custom',ICON.spark],['drops.html','Drops',ICON.drop]
  ].map(([href,label,ic])=>
    `<a href="${href}" class="${href===here?'on':''}">${ic}<span>${label}</span></a>`).join('') +
    `<a href="#" id="tabCart" class="tb-badge"><span class="tb-badge">${ICON.bag}<b id="tabBadge" hidden>0</b></span><span>Bag</span></a>`;
  tabs.style.gridTemplateColumns = 'repeat(5,1fr)';
  document.body.appendChild(tabs);

  const fab = document.createElement('a');
  fab.className = 'fab'; fab.href = 'contact.html'; fab.setAttribute('aria-label','WhatsApp us');
  fab.innerHTML = ICON.wa;
  document.body.appendChild(fab);

  if (f) f.innerHTML = `
    <footer class="ftr">
      <div class="wrap">
        <div class="ftr__grid">
          <div>
            <div class="ftr__mark">Alsafran</div>
            <p class="ar" style="color:var(--gold);margin-top:.5rem">البسه ، لا تخبيه</p>
            <p class="muted" style="font-size:.8rem;max-width:34ch">A Kuwait-born carry label. Numbered drops, Arabic typography drawn properly, your name on it in three days.</p>
            <span class="thread"><i></i><s></s><s></s><s></s></span>
          </div>
          <div><h4>Shop</h4><ul>
            <li><a href="shop.html">All cases</a></li><li><a href="drops.html">New drops</a></li>
            <li><a href="best-sellers.html">Best sellers</a></li><li><a href="customize.html">Customize</a></li>
            <li><a href="collections.html">Collections</a></li></ul></div>
          <div><h4>Help</h4><ul>
            <li><a href="faq.html">FAQ</a></li><li><a href="track-order.html">Track order</a></li>
            <li><a href="contact.html">Contact</a></li><li><a href="faq.html">Shipping &amp; returns</a></li>
            <li><a href="faq.html">12-month warranty</a></li></ul></div>
          <div><h4>The drop pass</h4>
            <p class="muted" style="font-size:.8rem">Every drop, 30 minutes early. WhatsApp only, 3 messages a month.</p>
            <form class="inline" onsubmit="event.preventDefault();this.reset();ALS.toast('You\\'re on the list');">
              <input class="input" type="tel" placeholder="9XXX XXXX" required aria-label="Phone number">
              <button class="btn btn--gold btn--sm" type="submit">Join</button>
            </form>
            <div class="paybadges"><span>KNET</span><span>Apple Pay</span><span>Visa</span><span>Tabby</span></div>
          </div>
        </div>
        <div class="ftr__base">
          <span>© ${new Date().getFullYear()} ALSAFRAN · Made in Kuwait. Built to travel.</span>
          <span>Prototype — design reference, not a live store</span>
        </div>
      </div>
    </footer>`;

  $('#navBtn') && $('#navBtn').addEventListener('click',()=>openPanel('#navPanel'));
  $('#cartBtn') && $('#cartBtn').addEventListener('click',()=>openPanel('#cartPanel'));
  $('#tabCart') && $('#tabCart').addEventListener('click',e=>{e.preventDefault();openPanel('#cartPanel');});
  $('#scrim').addEventListener('click',closePanels);
  $$('[data-close]').forEach(b=>b.addEventListener('click',closePanels));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closePanels(); });
}

function openPanel(sel){
  closePanels();
  const p = $(sel); if(!p) return;
  p.classList.add('on'); $('#scrim').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closePanels(){
  $$('.panel').forEach(p=>p.classList.remove('on'));
  const s = $('#scrim'); s && s.classList.remove('on');
  document.body.style.overflow = '';
}

/* ---------------- painters ---------------- */
function paint(){
  const n = Cart.count();
  [['#cartBadge',n],['#tabBadge',n]].forEach(([sel,v])=>{
    const el = $(sel); if(!el) return;
    el.textContent = v; el.hidden = v === 0;
  });
  const body = $('#cartBody'); if(!body) return;
  const items = Cart.items();
  if(!items.length){
    body.innerHTML = `<p class="muted" style="padding-top:1.5rem">Your bag is empty.</p>
      <a class="btn btn--block" href="shop.html">Shop drop 01</a>`;
    return;
  }
  const total = Cart.total();
  const left = Math.max(0, FREE_SHIP-total);
  body.innerHTML = `
    <div class="freeship">
      ${left>0 ? `Add <b>${kd(left)}</b> for free delivery`
               : `<b>Free delivery unlocked.</b> Ships today if you order before 2 PM.`}
      <div class="meter"><i style="width:${Math.min(100,total/FREE_SHIP*100)}%"></i></div>
    </div>
    ${items.map((i,idx)=>{
      const p = PRODUCTS.find(x=>x.id===i.pid);
      return `<div class="citem">
        <div class="citem__art">${p?caseSVG(p,i.ci,{custom:!!i.custom,text:i.custom,number:i.number,finish:i.finish}):''}</div>
        <div>
          <b>${esc(i.name)}</b>
          <small>${esc(i.color)} · ${esc(i.modelLabel)}</small>
          ${i.custom?`<small class="gold">“${esc(i.custom)}” · ${esc(i.finishName||'')}</small>`:''}
          <span class="qty">
            <button data-q="${idx}" data-d="-1" aria-label="Decrease">−</button>
            <span class="num">${i.qty}</span>
            <button data-q="${idx}" data-d="1" aria-label="Increase">+</button>
          </span>
        </div>
        <div class="num">${kd(i.price*i.qty)}</div>
      </div>`;}).join('')}
    <div style="display:flex;justify-content:space-between;padding:1rem 0;font-family:var(--f-display);text-transform:uppercase;letter-spacing:.08em">
      <span>Subtotal</span><b class="num">${kd(total)}</b></div>
    <button class="btn btn--block" onclick="ALS.toast('Prototype — checkout is not connected')">Checkout</button>
    <button class="applepay" style="width:100%;justify-content:center;margin-top:.5rem"
      onclick="ALS.toast('Prototype — Apple Pay is not connected')"> Pay</button>
    <div class="paybadges"><span>KNET</span><span>Apple Pay</span><span>Tabby</span><span>COD +1.500</span></div>`;
  $$('[data-q]',body).forEach(b=>b.addEventListener('click',()=>
    Cart.bump(+b.dataset.q,+b.dataset.d)));
}

/* ---------------- cards ---------------- */
function card(p,opt){
  opt = opt||{};
  const price = priceOf(p);
  const tags = [];
  if (opt.rank) tags.push(`<span class="rank num">${String(opt.rank).padStart(2,'0')}</span>`);
  let badge = '';
  if (p.badge) badge = `<span class="tag ${p.tier==='limited'?'tag--gold':''}">${esc(p.badge)}</span>`;
  if (p.wave2) badge += `<span class="tag tag--out">Part two</span>`;
  return `<article class="card">
    <a href="product.html?id=${p.id}" class="card__media">
      ${caseSVG(p,0)}
      <span class="card__tags">${badge}</span>
      ${tags.join('')}
      <span class="card__quick" data-add="${p.id}" role="button" aria-label="Quick add ${esc(p.name)}">+</span>
    </a>
    <div class="card__body">
      <a href="product.html?id=${p.id}">
        <div class="card__name">${esc(p.name)}${p.arabic?` <span class="ar muted" style="font-size:.8em">${p.arabic}</span>`:''}</div>
        <div class="card__meta">${TIERS[p.tier].name} · ${esc(p.family)}</div>
        <div class="card__price">${kd(price)}</div>
        <div class="dots">${p.colors.map(c=>`<i style="background:${c.hex}" title="${esc(c.name)}"></i>`).join('')}</div>
      </a>
    </div>
  </article>`;
}
function wireQuickAdd(root){
  $$('[data-add]',root||document).forEach(el=>el.addEventListener('click',e=>{
    e.preventDefault(); e.stopPropagation();
    const p = PRODUCTS.find(x=>x.id===el.dataset.add);
    const m = MODELS.find(x=>x.id===(store.get('als_model','17pm'))) || MODELS[0];
    Cart.add({ pid:p.id, ci:0, name:p.name, color:p.colors[0].name,
      model:m.id, modelLabel:m.label, price:priceOf(p) });
  }));
}

/* ---------------- accordions ---------------- */
function wireAcc(root){
  $$('.acc__h',root||document).forEach(h=>{
    if (h.dataset.wired) return;          // never bind the same header twice
    h.dataset.wired = '1';
    h.addEventListener('click',()=>{
      const c = h.nextElementSibling;
      const open = !c.hidden;
      c.hidden = open;
      h.querySelector('i').textContent = open ? '+' : '−';
    });
  });
}

/* ============================================================
   page controllers
   ============================================================ */
const Pages = {

  home(){
    $('#heroCase').innerHTML = caseSVG(PRODUCTS.find(p=>p.id==='safran'),0);
    const featured = ['ink','bone','safran','qahwa','crystal','yalla']
      .map(id=>PRODUCTS.find(p=>p.id===id));
    $('#featured').innerHTML = featured.map(p=>card(p)).join('');
    $('#newdrops').innerHTML = ['965','lulu','sadu','dhow']
      .map(id=>card(PRODUCTS.find(p=>p.id===id))).join('');
    $('#best').innerHTML = PRODUCTS.slice().sort((a,b)=>a.rank-b.rank).slice(0,4)
      .map((p,i)=>card(p,{rank:i+1})).join('');
    $('#czPreview').innerHTML = caseSVG(PRODUCTS.find(p=>p.id==='bone'),0,
      {custom:true,text:'مبارك',finish:'#C9922E',place:'bottom'});
    $('#reviews').innerHTML = REVIEWS.slice(0,3).map(r=>`
      <div class="review">
        <div class="stars">${'★'.repeat(r.s)}${'☆'.repeat(5-r.s)}</div>
        <p>“${esc(r.t)}”</p>
        <cite>${esc(r.n)} · ${esc(r.l)} · ${esc(r.p)}</cite>
      </div>`).join('');
    $('#ugc').innerHTML = ['yalla','pitch','965','safran','qahwa','sadu'].map((id,i)=>{
      const p = PRODUCTS.find(x=>x.id===id);
      return `<a href="#" aria-label="Customer post">${caseSVG(p,i%p.colors.length)}<span>${i%2?'TikTok':'IG'}</span></a>`;
    }).join('');
    wireQuickAdd();
  },

  shop(){
    const state = { family:'all', tier:'all' };
    const fams = ['all',...new Set(PRODUCTS.map(p=>p.family))];
    $('#famFilter').innerHTML = fams.map(f=>
      `<button class="chip ${f==='all'?'on':''}" data-fam="${f}">${f==='all'?'All':esc(f)}</button>`).join('');
    $('#tierFilter').innerHTML = ['all','core','signature','atelier','limited'].map(t=>
      `<button class="chip ${t==='all'?'on':''}" data-tier="${t}">${t==='all'?'All tiers':TIERS[t].name}</button>`).join('');
    function draw(){
      const list = PRODUCTS.filter(p=>
        (state.family==='all'||p.family===state.family) &&
        (state.tier==='all'||p.tier===state.tier));
      $('#count').textContent = list.length + (list.length===1?' case':' cases');
      $('#shopGrid').innerHTML = list.length ? list.map(p=>card(p)).join('')
        : `<p class="muted">Nothing in that combination yet — more models and families are on the roadmap.</p>`;
      wireQuickAdd($('#shopGrid'));
    }
    $('#famFilter').addEventListener('click',e=>{
      const b = e.target.closest('[data-fam]'); if(!b) return;
      state.family = b.dataset.fam;
      $$('#famFilter .chip').forEach(c=>c.classList.toggle('on',c===b)); draw();
    });
    $('#tierFilter').addEventListener('click',e=>{
      const b = e.target.closest('[data-tier]'); if(!b) return;
      state.tier = b.dataset.tier;
      $$('#tierFilter .chip').forEach(c=>c.classList.toggle('on',c===b)); draw();
    });
    draw();
  },

  drops(){
    $('#dropHero').innerHTML = caseSVG(PRODUCTS.find(p=>p.id==='965'),0);
    const live = PRODUCTS.filter(p=>!p.wave2);
    $('#dropGrid').innerHTML = live.map(p=>card(p)).join('');
    $('#waveGrid').innerHTML = PRODUCTS.filter(p=>p.wave2).map(p=>card(p)).join('');
    $('#archive').innerHTML = ARCHIVE.map(a=>`
      <div class="review" style="text-align:center">
        <div class="eyebrow" style="margin:0">${esc(a.name)}</div>
        <b class="num" style="font-size:1.4rem;display:block;margin:.25rem 0">SOLD OUT</b>
        <span class="muted" style="font-size:.75rem">${a.total}/${a.total} · ${esc(a.note)}</span>
      </div>`).join('');
    wireQuickAdd();
  },

  best(){
    const list = PRODUCTS.slice().sort((a,b)=>a.rank-b.rank);
    $('#bestGrid').innerHTML = list.map((p,i)=>card(p,{rank:i+1})).join('');
    wireQuickAdd();
  },

  collections(){
    $('#collGrid').innerHTML = COLLECTIONS.map(c=>`
      <a class="collcard" href="shop.html">
        <span class="collcard__bg" style="background:
          radial-gradient(120% 90% at 80% 10%, ${c.hex}88, transparent 60%),
          linear-gradient(180deg,#141416,#0B0B0C)"></span>
        <span class="collcard__in">
          <h3>${esc(c.name)}</h3>
          <p class="ar" style="color:${c.hex}">${c.arabic}</p>
          <p>${esc(c.copy)}</p>
        </span>
      </a>`).join('');
  },

  product(){
    const id = new URLSearchParams(location.search).get('id') || 'ink';
    const p = PRODUCTS.find(x=>x.id===id) || PRODUCTS[0];
    const st = {
      ci:0,
      model: store.get('als_model','17pm'),
      custom:false, text:'', number:'09',
      finish:'#C9922E', finishName:'Gold foil'
    };
    document.title = p.name + ' — ALSAFRAN';

    function price(){ return priceOf(p) + (st.custom ? 3 : 0); }
    function sold(m){ return (p.sold||[]).indexOf(m) > -1; }

    function drawArt(){
      const opt = { custom:st.custom, text:st.text, number:st.number, finish:st.finish, place:'bottom' };
      $('#pdpArt').innerHTML = caseSVG(p,st.ci,opt);
      $('#pdpThumbs').innerHTML = p.colors.map((c,i)=>
        `<button data-ci="${i}" class="${i===st.ci?'on':''}" aria-label="${esc(c.name)}">${caseSVG(p,i)}</button>`).join('');
      $$('#pdpThumbs [data-ci]').forEach(b=>b.addEventListener('click',()=>{ st.ci=+b.dataset.ci; drawArt(); drawMeta(); }));
    }
    function drawMeta(){
      $('#colorName').textContent = p.colors[st.ci].name;
      $('#pdpPrice').textContent = kd(price());
      $('#tabbyLine').textContent = 'or 3 × ' + (price()/3).toFixed(3) + ' KD with Tabby';
      $('#addBtn').textContent = 'Add to cart — ' + kd(price());
      const m = MODELS.find(x=>x.id===st.model);
      $('#addBtn').disabled = !m || m.soon || sold(st.model);
    }

    $('#pdpEyebrow').textContent = p.collection.toUpperCase() + ' · ' + TIERS[p.tier].name.toUpperCase();
    $('#pdpName').innerHTML = esc(p.name) + (p.arabic?` <span class="ar gold">${p.arabic}</span>`:'');
    $('#pdpRating').textContent = '★ ' + p.rating.toFixed(1) + ' (' + p.reviews + ')';
    $('#pdpDesc').textContent = p.desc;
    $('#claimed').innerHTML = `<div class="dropstrip__row" style="color:var(--ink)">
        <span class="eyebrow" style="margin:0">${p.claimed} / ${p.total} claimed</span>
        <span class="muted" style="font-size:.75rem">${p.tier==='limited'?'Numbered · never restocked':'One run only'}</span>
      </div>
      <div class="meter" style="background:rgba(11,11,12,.12);max-width:none">
        <i style="width:${p.claimed/p.total*100}%"></i></div>`;

    $('#swatches').innerHTML = p.colors.map((c,i)=>
      `<button class="swatch ${i===st.ci?'on':''}" data-ci="${i}" style="background:${c.hex}" aria-label="${esc(c.name)}"></button>`).join('');
    $('#swatches').addEventListener('click',e=>{
      const b = e.target.closest('[data-ci]'); if(!b) return;
      st.ci = +b.dataset.ci;
      $$('#swatches .swatch').forEach(s=>s.classList.toggle('on',s===b));
      drawArt(); drawMeta();
    });

    $('#models').innerHTML = MODELS.map(m=>
      `<button class="chip ${m.id===st.model?'on':''}" data-m="${m.id}"
        ${m.soon||sold(m.id)?'disabled':''}>${esc(m.label)}${m.soon?' · soon':''}${sold(m.id)?' · sold out':''}</button>`).join('');
    $('#models').addEventListener('click',e=>{
      const b = e.target.closest('[data-m]'); if(!b||b.disabled) return;
      st.model = b.dataset.m; store.set('als_model',st.model);
      $$('#models .chip').forEach(c=>c.classList.toggle('on',c===b));
      drawMeta();
    });

    $('#magRow').innerHTML = p.tier==='core' && p.family!=='Clear'
      ? `<div class="note">MagSafe is included on every Signature and Atelier case. This Core case is not MagSafe — <a href="shop.html" style="border-bottom:1px solid">see Signature</a>.</div>`
      : `<div class="toggle on"><span class="box">✓</span>
          <span><b>MagSafe</b><small>${esc(TIERS[p.tier].magsafe)} — included, no upsell</small></span></div>`;

    const canCustom = p.tier!=='core' && p.tier!=='limited';
    $('#customRow').innerHTML = canCustom ? `
      <button class="toggle" id="czToggle"><span class="box">✓</span>
        <span><b>Add your name</b><small>Arabic or Latin, set properly · ships in 3 days</small></span>
        <span class="price">+3.000</span></button>
      <div id="czFields" hidden style="margin-top:.75rem">
        <div class="field"><label>Your text</label>
          <input class="input" id="czText" maxlength="12" placeholder="مبارك / MUBARAK"></div>
        ${p.personalisable?`<div class="field"><label>Number</label>
          <input class="input" id="czNum" maxlength="2" value="09" inputmode="numeric"></div>`:''}
        <div class="field"><label>Finish</label><div class="chips" id="czFin">
          <button class="chip on" data-f="#C9922E" data-n="Gold foil">Gold foil</button>
          <button class="chip" data-f="#F4F1EA" data-n="White">White</button>
          <button class="chip" data-f="#0B0B0C" data-n="Black">Black</button>
        </div></div>
        <p class="muted" style="font-size:.75rem">We check every Arabic lockup by hand before printing and message you if anything looks off.</p>
      </div>` : '';

    if (canCustom){
      $('#czToggle').addEventListener('click',()=>{
        st.custom = !st.custom;
        $('#czToggle').classList.toggle('on',st.custom);
        $('#czFields').hidden = !st.custom;
        if(!st.custom) st.text='';
        drawArt(); drawMeta();
      });
      $('#czText').addEventListener('input',e=>{ st.text = e.target.value; drawArt(); });
      const nEl = $('#czNum');
      nEl && nEl.addEventListener('input',e=>{ st.number = e.target.value||'09'; drawArt(); });
      $('#czFin').addEventListener('click',e=>{
        const b = e.target.closest('[data-f]'); if(!b) return;
        st.finish = b.dataset.f; st.finishName = b.dataset.n;
        $$('#czFin .chip').forEach(c=>c.classList.toggle('on',c===b));
        drawArt();
      });
    }

    $('#specs').innerHTML = [
      ['Protection & specs',SPECS.protection],['Materials & finish',SPECS.materials],
      ['Shipping & delivery',SPECS.shipping],['Returns & 12-month warranty',SPECS.returns]
    ].map(([t,rows])=>`
      <div class="acc"><button class="acc__h">${t}<i>+</i></button>
        <div class="acc__c" hidden><ul>${rows.map(r=>`<li>${r}</li>`).join('')}</ul></div></div>`).join('');
    wireAcc($('#specs'));

    $('#related').innerHTML = PRODUCTS.filter(x=>x.id!==p.id).slice(0,4).map(x=>card(x)).join('');
    $('#pdpReviews').innerHTML = REVIEWS.slice(0,2).map(r=>`
      <div class="review"><div class="stars">${'★'.repeat(r.s)}</div>
        <p>“${esc(r.t)}”</p><cite>${esc(r.n)} · ${esc(r.l)}</cite></div>`).join('');

    $('#addBtn').addEventListener('click',()=>{
      const m = MODELS.find(x=>x.id===st.model);
      Cart.add({ pid:p.id, ci:st.ci, name:p.name, color:p.colors[st.ci].name,
        model:m.id, modelLabel:m.label, price:price(),
        custom: st.custom ? (st.text||'—') : '', number:st.number,
        finish:st.finish, finishName: st.custom ? st.finishName : '' });
    });

    drawArt(); drawMeta(); wireQuickAdd($('#related'));
  },

  customize(){
    const bases = PRODUCTS.filter(p=>p.tier!=='core' && p.tier!=='limited');
    const st = { p:bases[0], ci:0, text:'مبارك', script:'ar',
      style:'kufi', finish:'#C9922E', finishName:'Gold foil',
      place:'bottom', model:store.get('als_model','17pm') };

    function total(){ return priceOf(st.p) + 3; }
    function draw(){
      $('#czStage').innerHTML = caseSVG(st.p,st.ci,
        { custom:true, text:st.text, finish:st.finish, place:st.place });
      $('#czTotal').textContent = kd(total());
      $('#czAdd').textContent = 'Add to cart — ' + kd(total());
      $('#czAddBar').textContent = 'Add to cart — ' + kd(total());
      $('#czSummary').textContent =
        `${st.p.name} · ${st.p.colors[st.ci].name} · ${st.finishName} · ${st.place}`;
    }

    $('#czBase').innerHTML = bases.map((p,i)=>`
      <button class="chip ${i===0?'on':''}" data-b="${p.id}">${esc(p.name)} · ${kd(priceOf(p))}</button>`).join('');
    $('#czBase').addEventListener('click',e=>{
      const b = e.target.closest('[data-b]'); if(!b) return;
      st.p = PRODUCTS.find(x=>x.id===b.dataset.b); st.ci = 0;
      $$('#czBase .chip').forEach(c=>c.classList.toggle('on',c===b));
      drawColors(); draw();
    });
    function drawColors(){
      $('#czColors').innerHTML = st.p.colors.map((c,i)=>
        `<button class="swatch ${i===0?'on':''}" data-ci="${i}" style="background:${c.hex}" aria-label="${esc(c.name)}"></button>`).join('');
      $$('#czColors .swatch').forEach(b=>b.addEventListener('click',()=>{
        st.ci = +b.dataset.ci;
        $$('#czColors .swatch').forEach(s=>s.classList.toggle('on',s===b));
        draw();
      }));
    }
    $('#czScript').addEventListener('click',e=>{
      const b = e.target.closest('[data-s]'); if(!b) return;
      st.script = b.dataset.s;
      $$('#czScript .chip').forEach(c=>c.classList.toggle('on',c===b));
      st.text = st.script==='ar' ? 'مبارك' : 'MUBARAK';
      $('#czText').value = st.text; draw();
    });
    $('#czText').addEventListener('input',e=>{
      st.text = e.target.value; draw();
    });
    $('#czStyle').addEventListener('click',e=>{
      const b = e.target.closest('[data-st]'); if(!b) return;
      st.style = b.dataset.st;
      $$('#czStyle .chip').forEach(c=>c.classList.toggle('on',c===b));
    });
    $('#czFinish').addEventListener('click',e=>{
      const b = e.target.closest('[data-f]'); if(!b) return;
      st.finish = b.dataset.f; st.finishName = b.dataset.n;
      $$('#czFinish .chip').forEach(c=>c.classList.toggle('on',c===b)); draw();
    });
    $('#czPlace').addEventListener('click',e=>{
      const b = e.target.closest('[data-p]'); if(!b) return;
      st.place = b.dataset.p;
      $$('#czPlace .chip').forEach(c=>c.classList.toggle('on',c===b)); draw();
    });
    $('#czModel').innerHTML = MODELS.map(m=>
      `<button class="chip ${m.id===st.model?'on':''}" data-m="${m.id}" ${m.soon?'disabled':''}>${esc(m.label)}${m.soon?' · soon':''}</button>`).join('');
    $('#czModel').addEventListener('click',e=>{
      const b = e.target.closest('[data-m]'); if(!b||b.disabled) return;
      st.model = b.dataset.m; store.set('als_model',st.model);
      $$('#czModel .chip').forEach(c=>c.classList.toggle('on',c===b));
    });
    function addCustom(){
      if(!$('#czConfirm').checked){
        toast('Confirm your preview first');
        $('#czConfirm').scrollIntoView({behavior:'smooth',block:'center'});
        return;
      }
      const m = MODELS.find(x=>x.id===st.model);
      Cart.add({ pid:st.p.id, ci:st.ci, name:st.p.name+' · custom',
        color:st.p.colors[st.ci].name, model:m.id, modelLabel:m.label,
        price:total(), custom:st.text, finish:st.finish, finishName:st.finishName });
    }
    $('#czAdd').addEventListener('click',addCustom);
    $('#czAddBar').addEventListener('click',addCustom);

    // on a phone the preview shrinks to a thumbnail as soon as you scroll into the steps
    const stage = $('#czStage');
    const onScroll = () => {
      if (window.matchMedia('(min-width:760px)').matches){ stage.classList.remove('mini'); return; }
      stage.classList.toggle('mini', window.scrollY > 260);
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onScroll);
    onScroll();

    drawColors(); draw();
  },

  track(){
    $('#trackForm').addEventListener('submit',e=>{
      e.preventDefault();
      $('#trackResult').hidden = false;
      $('#trackResult').scrollIntoView({behavior:'smooth',block:'center'});
    });
  },

  faq(){ wireAcc(); }
};

/* ---------------- boot ---------------- */
document.addEventListener('DOMContentLoaded',()=>{
  chrome(); paint();
  const fn = Pages[document.body.dataset.page];
  if (fn) try{ fn(); }catch(err){ console.error('page init failed',err); }
  wireAcc();
});

window.ALS = { Cart, toast, card, caseSVG, PRODUCTS, openPanel };
})();
