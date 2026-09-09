/* ============================================================
   KUWAIT SCHOOLS GUIDE — page controllers
   Each public page calls one Pages.* entry point from an inline
   script at the bottom of its HTML.
   ============================================================ */
(function(global){
'use strict';

const {
  $, $$, esc, t, lbl, Lang, schoolName, I, starsHTML, logoHTML, curBadge,
  kwd, feeHeadline, feeBadge, fmtDate, initials, mapsUrl, mapEmbed, igUrl,
  Data, Auth, Favs, Compare, toast, renderCards, bindCardActions, attachTypeahead,
  Query, Route, applyQuery, paintChrome, store, K
} = global.KSG;

/* ============================ shared bits ============================ */

/* The banner counts the catalogue live, so it always states how much of the
   directory is actually sourced rather than making a vague disclaimer. */
function noticeHTML(){
  const all = Data.all();
  const confirmed = all.filter(s => feesConfirmed(s)).length;
  const msg = Lang.isAr()
    ? confirmed + ' من ' + all.length + ' مدرسة رسومها من مصدر منشور؛ الباقي تقديري في انتظار التأكيد. أكّد الرسوم مع المدرسة دائماً.'
    : confirmed + ' of ' + all.length + ' schools have fees from a published source; the rest are estimates pending confirmation. Always confirm fees with the school.';
  return '<div class="notice"><div class="wrap notice-in">' + I.info +
    '<span>' + esc(msg) + ' <a href="about.html#data" style="color:inherit;text-decoration:underline">' +
    esc(Lang.isAr()?'كيف نتحقق':'How we source this') + '</a></span></div></div>';
}

function searchbarHTML(q,action){
  const curOpts = ['<option value="">' + esc(t('allCurricula')) + '</option>']
    .concat(CURRICULA.map(c => '<option value="' + c.id + '"' +
      (q.cur.length === 1 && q.cur[0] === c.id ? ' selected' : '') + '>' + esc(lbl(c)) + '</option>')).join('');
  const distOpts = ['<option value="">' + esc(t('allDistricts')) + '</option>']
    .concat(DISTRICTS.map(d => '<option value="' + esc(d) + '"' +
      (q.dist.length === 1 && q.dist[0] === d ? ' selected' : '') + '>' + esc(d) + '</option>')).join('');
  const feeOpts = [['', t('anyFee')],['700','< 700'],['1500','< 1,500'],['2500','< 2,500'],
                   ['4000','< 4,000'],['6000','< 6,000'],['8000','< 8,000']]
    .map(([v,label]) => '<option value="' + v + '"' + (String(q.max||'') === v ? ' selected' : '') + '>' +
      esc(v ? label + ' ' + t('kwd') : label) + '</option>').join('');

  return '<form class="searchbar" id="heroSearch" action="' + action + '" method="get" role="search">' +
    '<label class="sb-field">' + I.search +
      '<input type="search" name="q" value="' + esc(q.q) + '" placeholder="' + esc(t('searchPlace')) +
      '" aria-label="' + esc(t('search')) + '"></label>' +
    '<span class="sb-div"></span>' +
    '<select name="cur" aria-label="' + esc(t('curriculum')) + '">' + curOpts + '</select>' +
    '<span class="sb-div"></span>' +
    '<select name="dist" aria-label="' + esc(t('district')) + '">' + distOpts + '</select>' +
    '<span class="sb-div"></span>' +
    '<select name="max" aria-label="' + esc(t('feeRange')) + '">' + feeOpts + '</select>' +
    '<button class="btn btn-pri" type="submit">' + I.search + esc(t('search')) + '</button>' +
  '</form>';
}

/* ============================ homepage ============================ */

const QUICK = [
  { href:'american.html',     en:'American Schools',      ar:'المدارس الأمريكية',
    sub:['US curriculum, AP & diploma','منهج أمريكي وبرنامج AP'], cur:'American', theme:['#1e3a8a','#3b82f6'], ico:'layers' },
  { href:'british.html',      en:'British Schools',       ar:'المدارس البريطانية',
    sub:['EYFS, IGCSE & A-Level','مراحل EYFS و IGCSE و A-Level'], cur:'British', theme:['#581c87','#a855f7'], ico:'building' },
  { href:'kindergarten.html', en:'Pre-K & Kindergartens', ar:'رياض الأطفال والحضانات',
    sub:['Nurseries and early years','حضانات ومراحل مبكرة'], cur:'Early', theme:['#9d174d','#ec4899'], ico:'cal' },
  { href:'directory.html',    en:'All Schools',           ar:'كل المدارس',
    sub:['Every curriculum, every area','كل المناهج وكل المناطق'], cur:null, theme:['#0f766e','#14b8a6'], ico:'search' }
];

function quickCardsHTML(){
  const all = Data.all();
  return QUICK.map(c => {
    const n = c.cur ? all.filter(s => s.curriculum === c.cur ||
                (c.cur === 'American' && s.curriculum === 'IB' && (s.extras||[]).indexOf('American') >= 0)).length
              : all.length;
    return '<a class="qcard" href="' + c.href + '" style="background:linear-gradient(140deg,' +
      c.theme[0] + ',' + c.theme[1] + ')">' +
      '<span class="qc-ico">' + I[c.ico] + '</span>' +
      '<b>' + esc(Lang.isAr() ? c.ar : c.en) + '</b>' +
      '<span>' + esc(Lang.isAr() ? c.sub[1] : c.sub[0]) + ' · ' + n + ' ' + esc(t('results')) + '</span>' +
    '</a>';
  }).join('');
}

const Pages = {};

Pages.home = function(){
  const all = Data.all();
  const q = Query.read();

  /* hero */
  $('#heroMount').innerHTML =
    '<div class="hero"><div class="wrap hero-in">' +
      '<span class="eyebrow" style="color:var(--sky)">' + esc(t('brandSub')) + '</span>' +
      '<h1>' + esc(Lang.isAr()
        ? 'كل مدارس الكويت في مكان واحد — المناهج والرسوم والتقييمات'
        : 'Every school in Kuwait — curricula, fees and honest parent reviews') + '</h1>' +
      '<p class="hero-sub">' + esc(Lang.isAr()
        ? 'ابحث بالاسم أو المنطقة أو المنهج أو الرسوم، وقارن بين المدارس قبل أن تقرر.'
        : 'Search by name, area, curriculum or fee range. Compare side by side before you decide.') + '</p>' +
      searchbarHTML(q,'directory.html') +
      '<div class="hero-hints"><span>' + esc(Lang.isAr()?'الأكثر بحثاً:':'Popular:') + '</span>' +
        '<a href="directory.html?cur=American">' + esc(Lang.isAr()?'أمريكي':'American') + '</a>' +
        '<a href="directory.html?cur=British">' + esc(Lang.isAr()?'بريطاني':'British') + '</a>' +
        '<a href="directory.html?cur=IB">IB</a>' +
        '<a href="directory.html?grp=early">' + esc(Lang.isAr()?'رياض أطفال':'Kindergarten') + '</a>' +
        '<a href="directory.html?max=1500">' + esc(Lang.isAr()?'أقل من ١٥٠٠ د.ك':'Under 1,500 KWD') + '</a>' +
      '</div>' +
      '<div class="hero-stats">' +
        '<span class="hero-stat"><b>' + all.length + '</b><span>' + esc(t('schoolsCount')) + '</span></span>' +
        '<span class="hero-stat"><b>' + CURRICULA.length + '</b><span>' + esc(t('curriculaCount')) + '</span></span>' +
        '<span class="hero-stat"><b>' + DISTRICTS.length + '</b><span>' + esc(t('areasCount')) + '</span></span>' +
        '<span class="hero-stat"><b>' +
          all.reduce((n,s)=> n + Data.rating(s.id).count, 0) + '</b><span>' + esc(t('reviewsCount')) + '</span></span>' +
      '</div>' +
    '</div></div>' + noticeHTML();

  /* suggestions as the visitor types in the hero search */
  attachTypeahead($('#heroSearch input[name="q"]'));

  /* quick access */
  $('#quickMount').innerHTML = quickCardsHTML();

  /* Top rated needs at least 2 reviews per school, so one glowing review
     cannot put a school at the top of the homepage. Nothing is seeded, so
     until parents have actually reviewed, this invites them to instead of
     printing an empty grid. */
  const top = all
    .filter(s => Data.rating(s.id).count >= 2)
    .sort((a,b)=>{
      const ra = Data.rating(a.id), rb = Data.rating(b.id);
      return (rb.avg - ra.avg) || (rb.count - ra.count);
    }).slice(0,6);

  const anyReviews = all.some(s => Data.rating(s.id).count > 0);
  if(top.length){
    renderCards($('#topMount'), top, { gridClass:'grid grid-wide' });
  }else{
    $('#topMount').className = '';
    $('#topMount').innerHTML =
      '<div class="empty">' + I.star.replace('<svg','<svg style="stroke:var(--gold);fill:none"') +
      '<h3>' + esc(Lang.isAr()
        ? 'لا توجد تقييمات بعد — كن أول من يكتب'
        : 'No parent reviews yet — be the first') + '</h3>' +
      '<p>' + esc(Lang.isAr()
        ? (anyReviews
            ? 'التقييمات الأولى في انتظار المراجعة. تحتاج المدرسة إلى تقييمين منشورين لتظهر هنا.'
            : 'لم نكتب أي تقييم بأنفسنا. كل تقييم على هذا الموقع يكتبه ولي أمر مسجّل، لذلك تبدأ هذه القائمة فارغة حتى يشاركك الأهل تجاربهم.')
        : (anyReviews
            ? 'The first reviews are awaiting moderation. A school needs two published reviews to appear here.'
            : 'We have not written a single review ourselves. Every review here comes from a signed-in parent, so this list starts empty until families share what they know.')) + '</p>' +
      '<p><a class="btn btn-pri" href="directory.html">' + esc(Lang.isAr()
        ? 'اختر مدرسة وقيّمها'
        : 'Pick a school and review it') + '</a>' +
      ' <a class="btn btn-ghost" href="login.html">' + esc(t('login')) + '</a></p>' +
      '</div>';
  }

  /* featured */
  const feat = all.filter(s => s.featured).slice(0,6);
  renderCards($('#featMount'), feat, { gridClass:'grid grid-wide' });

  /* curriculum breakdown strip */
  $('#curMount').innerHTML = CURRICULA.map(c => {
    const list = all.filter(s => s.curriculum === c.id);
    if(!list.length) return '';
    const priced = list.map(s => feeRange(s)).filter(r => r.known);
    const lo = priced.length ? Math.min.apply(null, priced.map(r => r.min)) : null;
    return '<a class="card" href="directory.html?cur=' + c.id + '" style="padding:var(--s-4);text-decoration:none">' +
      '<span class="badge badge-cur" style="background:' + c.color + ';align-self:flex-start">' + esc(lbl(c)) + '</span>' +
      '<b style="display:block;font-family:var(--f-head);font-size:var(--t-2);color:var(--navy);margin-top:var(--s-3)">' +
        list.length + ' ' + esc(t('results')) + '</b>' +
      '<span style="color:var(--muted);font-size:var(--t--1)">' +
        (lo != null ? esc(t('feesFrom')) + ' ' + esc(kwd(lo)) + ' ' + esc(t('perYear'))
                    : esc(t('feesOnRequest'))) + '</span>' +
    '</a>';
  }).join('');
};

/* ============================ directory + sections ============================ */

/* opts.pool      – restrict the catalogue (section pages)
   opts.lockCur   – hide the curriculum filter because the page implies it
   opts.showAges  – surface the accepted-ages line on cards */
Pages.directory = function(opts){
  opts = opts || {};
  const pool = opts.pool ? opts.pool() : Data.all();
  let q = Query.read();
  if(opts.forceGroup && !q.grp.length) q.grp = [opts.forceGroup];

  const searchHost = $('#searchMount');
  if(searchHost) searchHost.innerHTML = searchbarHTML(q,Route.page());

  function counts(list){
    const m = {};
    list.forEach(s => { m[s.curriculum] = (m[s.curriculum]||0)+1; });
    return m;
  }

  function renderFilters(){
    const cnt = counts(pool);
    const max = q.max == null ? FEE_CEILING : q.max;
    $('#filterMount').innerHTML =
      '<div class="filters">' +
        '<h3>' + esc(t('filters')) +
          '<button class="btn btn-quiet btn-sm" id="fReset">' + esc(t('reset')) + '</button></h3>' +

        (opts.lockCur ? '' :
        '<div class="fgroup"><b>' + esc(t('curriculum')) + '</b>' +
          CURRICULA.filter(c => cnt[c.id]).map(c =>
            '<label class="check"><input type="checkbox" data-f="cur" value="' + c.id + '"' +
            (q.cur.indexOf(c.id) >= 0 ? ' checked' : '') + '>' +
            '<span class="dot" style="background:' + c.color + '"></span>' +
            '<span>' + esc(lbl(c)) + '</span><span class="cnt">' + cnt[c.id] + '</span></label>').join('') +
        '</div>') +

        '<div class="fgroup"><b>' + esc(t('feeRange')) + '</b>' +
          '<input type="range" id="fMax" min="300" max="' + FEE_CEILING + '" step="100" value="' + max + '">' +
          '<div class="range-out"><span>300 ' + esc(t('kwd')) + '</span>' +
            '<span id="fMaxOut">' + esc(kwd(max)) + '</span></div>' +
        '</div>' +

        '<div class="fgroup"><b>' + esc(t('gradeLevels')) + '</b>' +
          GRADE_GROUPS.map(g =>
            '<label class="check"><input type="checkbox" data-f="grp" value="' + g.id + '"' +
            (q.grp.indexOf(g.id) >= 0 ? ' checked' : '') + '>' +
            '<span>' + esc(lbl(g)) + '</span><span class="cnt">' +
            pool.filter(s => coversGroup(s,g)).length + '</span></label>').join('') +
        '</div>' +

        '<div class="fgroup"><b>' + esc(t('location')) + '</b>' +
          '<label class="field"><span>' + esc(Lang.isAr()?'المحافظة':'Governorate') + '</span>' +
          '<select class="inp" id="fGov"><option value="">' + esc(Lang.isAr()?'كل المحافظات':'All governorates') + '</option>' +
            GOVERNORATES.filter(g => pool.some(s => s.governorate === g.id)).map(g =>
              '<option value="' + g.id + '"' + (q.gov.indexOf(g.id) >= 0 ? ' selected' : '') + '>' +
              esc(lbl(g)) + '</option>').join('') +
          '</select></label>' +
          '<label class="field"><span>' + esc(t('district')) + '</span>' +
          '<select class="inp" id="fDist"><option value="">' + esc(t('allDistricts')) + '</option>' +
            Array.from(new Set(pool.map(s => s.district))).sort().map(d =>
              '<option value="' + esc(d) + '"' + (q.dist.indexOf(d) >= 0 ? ' selected' : '') + '>' +
              esc(d) + '</option>').join('') +
          '</select></label>' +
        '</div>' +
      '</div>';

    $$('[data-f]').forEach(el => el.addEventListener('change', ()=>{
      const f = el.dataset.f;
      const list = q[f];
      const i = list.indexOf(el.value);
      if(el.checked && i < 0) list.push(el.value);
      if(!el.checked && i >= 0) list.splice(i,1);
      commit();
    }));
    const slider = $('#fMax');
    slider.addEventListener('input', ()=> $('#fMaxOut').textContent = kwd(Number(slider.value)));
    slider.addEventListener('change', ()=>{
      q.max = Number(slider.value) >= FEE_CEILING ? null : Number(slider.value);
      commit();
    });
    $('#fGov').addEventListener('change', e => { q.gov  = e.target.value ? [e.target.value] : []; commit(); });
    $('#fDist').addEventListener('change', e => { q.dist = e.target.value ? [e.target.value] : []; commit(); });
    $('#fReset').addEventListener('click', ()=>{
      q = { q:'', cur:[], dist:[], gov:[], grp:opts.forceGroup ? [opts.forceGroup] : [], max:null, sort:q.sort };
      commit(); renderFilters();
      if(searchHost) searchHost.innerHTML = searchbarHTML(q,Route.page());
      bindSearch();
    });
  }

  function activeChips(){
    const chips = [];
    if(q.q) chips.push(['q', '"' + q.q + '"']);
    q.cur.forEach(c  => chips.push(['cur:'+c,  lbl(CURRICULUM_BY_ID[c]) ]));
    q.grp.forEach(g  => { const G = GRADE_GROUPS.find(x=>x.id===g); if(G) chips.push(['grp:'+g, lbl(G)]); });
    q.gov.forEach(g  => { const G = GOV_BY_ID[g]; if(G) chips.push(['gov:'+g, lbl(G)]); });
    q.dist.forEach(d => chips.push(['dist:'+d, d]));
    if(q.max != null) chips.push(['max', t('feeRange') + ' ≤ ' + kwd(q.max)]);
    if(!chips.length) return '';
    return chips.map(([key,label]) =>
      '<span class="chip">' + esc(label) +
      '<button data-chip="' + esc(key) + '" aria-label="Remove filter">&times;</button></span>').join('') +
      '<button class="btn btn-quiet btn-sm" id="chipClear">' + esc(t('reset')) + '</button>';
  }

  function commit(){
    Query.write(q,true);
    render();
  }

  function render(){
    const list = applyQuery(q,pool);

    $('#toolMount').innerHTML =
      '<div class="toolbar">' +
        '<span class="count"><b>' + list.length + '</b> ' + esc(t('results')) + '</span>' +
        '<span class="spacer"></span>' +
        '<label style="display:flex;align-items:center;gap:var(--s-2);font-size:var(--t--1);color:var(--muted)">' +
          esc(t('sortBy')) +
          '<select class="inp" id="sortSel" style="width:auto;padding:var(--s-2) var(--s-3)">' +
            [['rating',t('sortRating')],['feeLow',t('sortFeeLow')],['feeHigh',t('sortFeeHigh')],['name',t('sortName')]]
              .map(([v,l]) => '<option value="' + v + '"' + (q.sort===v?' selected':'') + '>' + esc(l) + '</option>').join('') +
          '</select></label>' +
      '</div>' +
      '<div class="chips">' + activeChips() + '</div>';

    $('#sortSel').addEventListener('change', e => { q.sort = e.target.value; commit(); });
    $$('[data-chip]').forEach(b => b.addEventListener('click', ()=>{
      const [kind,val] = b.dataset.chip.split(/:(.+)/);
      if(kind === 'q')   q.q = '';
      else if(kind === 'max') q.max = null;
      else if(q[kind])   q[kind] = q[kind].filter(v => v !== val);
      commit(); renderFilters();
    }));
    const cc = $('#chipClear');
    if(cc) cc.addEventListener('click', ()=> $('#fReset').click());

    renderCards($('#resultMount'), list, { ages:opts.showAges, feeRows:opts.feeRows });
  }

  function bindSearch(){
    const form = $('#heroSearch');
    if(!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      q.q    = (fd.get('q') || '').trim();
      q.cur  = fd.get('cur')  ? [fd.get('cur')]  : (opts.lockCur ? q.cur : []);
      q.dist = fd.get('dist') ? [fd.get('dist')] : [];
      q.max  = fd.get('max')  ? Number(fd.get('max')) : null;
      commit(); renderFilters();
    });

    /* Suggestions while typing, and the grid below filters live so the
       visitor never has to press Search to see the effect. Only the results
       are repainted, not the filter rail, so the input keeps focus. */
    attachTypeahead(form.querySelector('input[name="q"]'), {
      onType(value){
        const next = value.trim();
        if(next === q.q) return;
        q.q = next;
        commit();
      }
    });
  }

  renderFilters();
  bindSearch();
  render();

  /* Back/forward has to re-read the query and repaint. On the multi-page site
     this listener dies with the document; in the single-file build the page is
     entered many times in one document, so the previous visit's listener would
     survive and write into a filter rail that no longer exists. Tear the old
     one down first, and bail out if the mount has since gone. */
  if(Pages.directory._detach) Pages.directory._detach();
  const onPop = ()=>{
    if(!$('#filterMount')){ Pages.directory._detach(); return; }
    q = Query.read(); renderFilters(); render();
  };
  window.addEventListener('popstate', onPop);
  Pages.directory._detach = ()=>{
    window.removeEventListener('popstate', onPop);
    Pages.directory._detach = null;
  };
};

/* Schools that run their own kindergarten but are not early-years providers —
   rendered as a plain grid under the Pre-K page's filtered nursery results. */
Pages.kgDivisions = function(sel){
  const host = $(sel);
  if(!host) return;
  const list = Data.all()
    .filter(s => s.curriculum !== 'Early' && coversGroup(s, GRADE_GROUPS[0]))
    .sort((a,b)=>{
      const ra = Data.rating(a.id), rb = Data.rating(b.id);
      return (rb.avg - ra.avg) || (rb.count - ra.count);
    });
  renderCards(host,list,{ ages:true, feeRows:2 });
};

/* ============================ school profile ============================ */

Pages.school = function(){
  const id = Route.params().get('id');
  const s = id ? Data.byId(id) : null;

  if(!s){
    $('#profMount').innerHTML =
      '<div class="wrap sec"><div class="empty"><h3>' +
      esc(Lang.isAr()?'لم نجد هذه المدرسة':'We could not find that school') + '</h3>' +
      '<p><a class="btn btn-pri" href="directory.html">' + esc(t('backToDir')) + '</a></p></div></div>';
    return;
  }

  Data.countView(s.id);

  /* SEO: title, description, canonical and JSON-LD are set per school */
  const r = Data.rating(s.id);
  const fr = feeRange(s);
  document.title = schoolName(s) + ' — ' + s.district + ', Kuwait | Kuwait Schools Guide';
  setMeta('description', s.blurb + ' ' + t('grades') + ': ' + s.from + '–' + s.to + '. ' +
    (fr.known ? t('feesFrom') + ' ' + kwd(fr.min) + '.' : t('feesOnRequest') + '.'));
  setLink('canonical', location.origin + location.pathname + '?id=' + encodeURIComponent(s.id));
  injectJSONLD(s,r);

  const cur = CURRICULUM_BY_ID[s.curriculum];

  /* --- hero --- */
  $('#profHero').innerHTML =
    '<div class="prof-hero"><div class="wrap">' +
      '<nav class="crumbs" aria-label="Breadcrumb">' +
        '<a href="index.html">' + esc(t('brandSub')) + '</a><span>›</span>' +
        '<a href="directory.html">' + esc(t('backToDir')) + '</a><span>›</span>' +
        '<a href="directory.html?cur=' + s.curriculum + '">' + esc(lbl(cur)) + '</a><span>›</span>' +
        '<span>' + esc(schoolName(s)) + '</span>' +
      '</nav>' +
      '<div class="prof-top">' + logoHTML(s,true) +
        '<div class="prof-id">' +
          '<h1>' + esc(s.name) + '</h1>' +
          (s.nameAr ? '<div class="ar-name" dir="rtl">' + esc(s.nameAr) + '</div>' : '') +
          '<div class="prof-meta">' + curBadge(s) +
            (s.featured ? '<span class="badge badge-gold">' + esc(t('featured')) + '</span>' : '') +
            feeBadge(s) +
            '<span class="dot-sep">·</span><span>' + I.pin.replace('<svg','<svg style="width:14px;height:14px;display:inline;vertical-align:-2px;stroke:currentColor"') +
              ' ' + esc(s.district) + '</span>' +
            '<span class="dot-sep">·</span><span>' + esc(s.from + ' – ' + s.to) + '</span>' +
            '<span class="dot-sep">·</span>' +
            '<span class="rate">' + starsHTML(r.avg) +
              (r.count ? '<b style="color:#fff">' + r.avg.toFixed(1) + '</b><span style="color:var(--sky)">(' +
                r.count + ' ' + esc(t('reviews')) + ')</span>'
                       : '<span style="color:var(--sky)">' + esc(t('noReviews')) + '</span>') +
            '</span>' +
          '</div>' +
        '</div>' +
        '<div class="prof-acts">' +
          '<button class="btn btn-ghost" id="pFav">' + I.heart + '<span>' + esc(t('favourites')) + '</span></button>' +
          '<button class="btn btn-ghost" id="pCmp">' + I.scales + '<span>' + esc(t('compareAdd')) + '</span></button>' +
          '<a class="btn btn-blue" href="' + igUrl(s) + '" target="_blank" rel="noopener noreferrer">' +
            I.ig + '<span>' + esc(t('instagram')) + '</span></a>' +
        '</div>' +
      '</div>' +
    '</div></div>' + noticeHTML();

  const fav = $('#pFav'), cmp = $('#pCmp');
  const syncBtns = ()=>{
    fav.classList.toggle('btn-pri', Favs.has(s.id));
    cmp.classList.toggle('btn-pri', Compare.has(s.id));
  };
  fav.addEventListener('click', ()=>{ Favs.toggle(s.id); syncBtns(); });
  cmp.addEventListener('click', ()=>{ Compare.toggle(s.id); syncBtns(); });
  syncBtns();

  /* --- main column --- */
  const feeRows = (s.fees||[]).map(f =>
    '<tr><td>' + esc(f.band) + '</td>' +
    '<td class="amt' + (f.amount===0?'" style="color:var(--green)':'') + '">' + esc(kwd(f.amount)) + '</td></tr>').join('');

  /* Provenance line under the fee table: which academic year, where it came
     from, and — when the school publishes nothing — say so plainly rather
     than printing a number we invented. */
  const feeProv =
    '<p class="photo-note" style="display:flex;flex-wrap:wrap;gap:var(--s-2);align-items:center">' +
      feeBadge(s) +
      (s.feeYear ? '<span>' + esc(t('feeYearLabel')) + ': <b>' + esc(s.feeYear) + '</b></span>' : '') +
      (s.feeSource
        ? '<span>' + esc(t('feeSourceLabel')) + ': <a href="' + esc(s.feeSource) +
          '" target="_blank" rel="noopener noreferrer">' +
          esc(s.feeSource.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]) + '</a></span>'
        : '') +
    '</p>' +
    (s.feeNote ? '<p class="photo-note"><b>' + esc(t('feeExtras')) + ':</b> ' + esc(s.feeNote) + '</p>' : '') +
    '<p class="photo-note">' + esc(t('moeNote')) + '</p>';

  const feesPanel = fr.banded
    ? '<div class="tbl-scroll"><table class="feetable">' +
        '<thead><tr><th>' + esc(t('gradeBand')) + '</th><th style="text-align:end">' +
          esc(t('annualFee')) + ' (' + esc(t('kwd')) + ')</th></tr></thead>' +
        '<tbody>' + feeRows + '</tbody>' +
        '<tfoot><tr><td>' + esc(Lang.isAr()?'النطاق':'Range') + '</td>' +
          '<td class="amt">' + esc(kwd(fr.min)) + ' – ' + esc(kwd(fr.max)) + '</td></tr></tfoot>' +
      '</table></div>' + feeProv
    : fr.known
    ? '<p style="font-family:var(--f-num);font-size:var(--t-3);color:var(--navy);margin-bottom:var(--s-2)">' +
        esc(kwd(fr.min)) + ' – ' + esc(kwd(fr.max)) + ' <span style="font-size:var(--t-0);color:var(--muted)">' +
        esc(t('perYear')) + '</span></p>' +
      '<p>' + esc(t('feeRangeOnly')) + '</p>' + feeProv
    : '<div class="gate" style="text-align:start">' +
        '<h4 style="margin-bottom:var(--s-2)">' + esc(t('feesNotPublic')) + '</h4>' +
        '<p style="margin-bottom:var(--s-3)">' + esc(t('feesAskSchool')) + '</p>' +
        (s.feeNote ? '<p style="margin-bottom:var(--s-3)">' + esc(s.feeNote) + '</p>' : '') +
        (s.website
          ? '<a class="btn btn-pri btn-sm" href="' + esc(s.website) +
            '" target="_blank" rel="noopener noreferrer">' + esc(t('website')) + '</a> '
          : '') +
        (s.email
          ? '<a class="btn btn-ghost btn-sm" href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a>'
          : '') +
      '</div>' + feeProv;

  const photoTiles = [
    ['building', Lang.isAr()?'المبنى':'Campus'],
    ['layers',   Lang.isAr()?'الفصول':'Classrooms'],
    ['star',     Lang.isAr()?'المرافق':'Facilities'],
    ['users',    Lang.isAr()?'الأنشطة':'Activities'],
    ['bus',      Lang.isAr()?'النقل':'Transport'],
    ['cap',      Lang.isAr()?'التخرج':'Graduation']
  ].map((p,i) => {
    const th = s.theme || ['#0B2545','#1B6CA8'];
    const shade = i % 2 ? th[1] : th[0];
    return '<div class="photo" style="background:linear-gradient(' + (120 + i*24) + 'deg,' + shade + ',' + th[i%2] + ')">' +
      I[p[0]] + '<b>' + esc(p[1]) + '</b></div>';
  }).join('');

  $('#profMain').innerHTML =
    '<section class="panel"><h2>' + esc(t('about')) + '</h2>' +
      '<p>' + esc(s.about) + '</p>' +
      '<div class="pills">' + (s.extras||[]).map(x => '<span class="pill pill-blue">' + esc(x) + '</span>').join('') + '</div>' +
    '</section>' +

    '<section class="panel" id="fees"><h2>' + esc(t('feesTable')) + '</h2>' +
      feesPanel +
    '</section>' +

    '<section class="panel"><h2>' + esc(t('facilities')) + '</h2>' +
      '<div class="pills">' + (s.facilities||[]).map(f => '<span class="pill">' + esc(f) + '</span>').join('') + '</div>' +
    '</section>' +

    '<section class="panel"><h2>' + esc(t('photos')) + '</h2>' +
      '<div class="photos">' + photoTiles + '</div>' +
      '<p class="photo-note">' + esc(Lang.isAr()
        ? 'صور توضيحية. تُستبدل بصور المدرسة الرسمية من لوحة الإدارة.'
        : 'Placeholder tiles. Real campus photography is uploaded per school from the admin dashboard.') + '</p>' +
    '</section>' +

    '<section class="panel" id="reviews"><h2>' + esc(t('parentReviews')) + '</h2>' +
      '<div id="revMount"></div></section>';

  /* --- rail --- */
  const glance = [
    [t('curriculum'),   lbl(cur) + ((s.extras||[]).length ? ' · ' + s.extras.join(', ') : '')],
    [t('grades'),       s.from + ' – ' + s.to],
    [t('ages'),         s.ages],
    [t('fees'),         fr.known ? feeHeadline(s) + ' ' + t('perYear') : t('feesOnRequest')],
    [t('gender'),       s.gender],
    [t('founded'),      s.founded],
    [t('languages'),    (s.languages||[]).join(', ')],
    [t('accreditation'),(s.accreditation||[]).join(', ')],
    [t('transport'),    s.transport ? t('yes') : t('no')]
  ].map(([k,v]) => '<div class="defrow"><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>').join('');

  const contactRows = [
    s.website ? ['globe', t('website'), '<a href="' + esc(s.website) + '" target="_blank" rel="noopener noreferrer">' +
      esc(s.website.replace(/^https?:\/\//,'')) + '</a>'] : null,
    ['ig', t('instagram'), '<a href="' + igUrl(s) + '" target="_blank" rel="noopener noreferrer">' +
      (s.ig ? '@' + esc(s.ig) : esc(Lang.isAr()?'ابحث في إنستغرام':'Search on Instagram')) + '</a>'],
    ['pin', t('location'), esc(s.address)],
    /* Only ever show a number we actually confirmed — never a plausible
       placeholder, which could route a parent to a stranger. */
    ['phone', t('phone'), s.phone
      ? '<a href="tel:' + esc(s.phone.replace(/\s+/g,'')) + '">' + esc(s.phone) + '</a>'
      : '<span style="color:var(--muted)">' +
        esc(Lang.isAr()?'يُضاف بعد تأكيد المدرسة':'Added once the school confirms') + '</span>'],
    s.email ? ['mail', t('email'),
      '<a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a>'] : null
  ].filter(Boolean).map(([ico,k,v]) =>
    '<div class="defrow"><dt>' + esc(k) + '</dt><dd>' + v + '</dd></div>').join('');

  $('#profRail').innerHTML =
    '<section class="panel"><h2>' + esc(t('atAGlance')) + '</h2>' +
      '<dl class="deftable">' + glance + '</dl></section>' +

    '<section class="panel"><h2>' + esc(t('location')) + '</h2>' +
      '<div class="mapbox" id="mapBox">' +
        '<button type="button" class="map-fallback map-poster" id="mapPoster">' +
          '<span class="map-pin">' + I.pin + '</span>' +
          '<b>' + esc(s.address) + '</b>' +
          '<span>' + esc(Lang.isAr()?'اضغط لتحميل الخريطة التفاعلية':'Tap to load the interactive map') + '</span>' +
        '</button>' +
      '</div>' +
      '<p style="margin:var(--s-3) 0 0"><a class="btn btn-ghost btn-block btn-sm" href="' + mapsUrl(s) +
        '" target="_blank" rel="noopener noreferrer">' + I.pin + esc(t('map')) + '</a></p>' +
    '</section>' +

    '<section class="panel"><h2>' + esc(t('contact')) + '</h2>' +
      '<dl class="deftable">' + contactRows + '</dl>' +
      '<p style="margin:var(--s-4) 0 0"><a class="btn btn-quiet btn-sm btn-block" href="about.html#data">' +
        esc(t('suggestEdit')) + '</a></p>' +
    '</section>';

  wireMapFallback(s);
  renderReviews(s);
};

/* The map is click-to-load rather than an iframe on every page view. A blocked
   or slow Google embed would otherwise leave an empty grey box, and this way no
   request reaches Google until the visitor actually asks for the map. */
function wireMapFallback(school){
  const poster = $('#mapPoster'), box = $('#mapBox');
  if(!poster || !box) return;
  poster.addEventListener('click', ()=>{
    /* A sandboxed host (the single-file build published as an artifact) blocks
       third-party frames, so there the pin opens Google Maps in a new tab
       instead of embedding a frame that would silently stay blank. */
    if(Route.spa()){
      window.open(mapsUrl(school),'_blank','noopener');
      return;
    }
    box.innerHTML = '<iframe id="mapFrame" title="' + esc(schoolName(school)) + ' — map" ' +
      'referrerpolicy="no-referrer-when-downgrade" src="' + esc(mapEmbed(school)) + '"></iframe>';
  });
}

/* ---- reviews block ---- */

function renderReviews(s){
  const host = $('#revMount');
  const list = Data.reviewsForViewer(s.id);
  const published = list.filter(r => r.status !== 'pending');
  const avg = published.length ? published.reduce((n,r)=>n+r.rating,0) / published.length : 0;

  /* distribution bars */
  const dist = [5,4,3,2,1].map(n => {
    const c = published.filter(r => Math.round(r.rating) === n).length;
    const pct = published.length ? Math.round(c / published.length * 100) : 0;
    return '<div class="rev-bar"><span class="lbl">' + n + ' ★</span>' +
      '<span class="track"><span class="fill" style="width:' + pct + '%"></span></span>' +
      '<span class="n">' + c + '</span></div>';
  }).join('');

  const items = list.map(r => {
    const tags = (r.tags||[]).map(id => {
      const T2 = REVIEW_TAGS.find(x => x.id === id);
      return T2 ? '<span class="pill">' + esc(lbl(T2)) + '</span>' : '';
    }).join('');
    return '<article class="review">' +
      '<div class="rev-head">' +
        '<span class="avatar">' + esc((r.name||'?').trim()[0].toUpperCase()) + '</span>' +
        '<span class="rev-who"><b>' + esc(r.name) + '</b>' +
          '<time datetime="' + esc(r.date) + '">' + esc(fmtDate(r.date)) + '</time></span>' +
        (r.status === 'pending' ? '<span class="badge badge-pend">' + esc(t('pendingOwn')) + '</span>' : '') +
        starsHTML(r.rating) +
      '</div>' +
      '<p>' + esc(r.text) + '</p>' +
      (tags ? '<div class="rev-tags">' + tags + '</div>' : '') +
    '</article>';
  }).join('');

  const me = Auth.current();
  const alreadyPosted = me && store.get(K.reviews,[])
    .some(r => r.schoolId === s.id && r.userId === me.id);

  const form = !me
    ? '<div class="gate">' + I.lock + '<h4>' + esc(t('reviewGate')) + '</h4>' +
      '<p>' + esc(t('reviewGateWhy')) + '</p>' +
      '<a class="btn btn-pri" href="login.html?next=' +
        encodeURIComponent('school.html?id=' + s.id) + '">' + esc(t('login')) + '</a></div>'
    : alreadyPosted
    ? '<div class="gate">' + I.check + '<p>' + esc(Lang.isAr()
        ? 'لقد أرسلت تقييماً لهذه المدرسة. شكراً لك.'
        : 'You have already reviewed this school. Thank you.') + '</p></div>'
    : '<form id="revForm">' +
        '<label class="field"><span>' + esc(t('yourRating')) + ' *</span>' +
          '<span class="star-input" id="starIn" role="radiogroup" aria-label="' + esc(t('yourRating')) + '">' +
            [1,2,3,4,5].map(n => '<button type="button" data-v="' + n + '" role="radio" aria-checked="false" ' +
              'aria-label="' + n + '"><svg viewBox="0 0 24 24"><path d="' +
              'm12 3.6 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9L12 3.6Z' +
              '"/></svg></button>').join('') +
          '</span></label>' +
        '<label class="field"><span>' + esc(t('whatStood')) + '</span>' +
          '<span class="pills" id="tagIn">' + REVIEW_TAGS.map(tg =>
            '<label class="pill" style="cursor:pointer;display:inline-flex;gap:6px;align-items:center">' +
            '<input type="checkbox" value="' + tg.id + '" style="accent-color:var(--blue)">' +
            esc(lbl(tg)) + '</label>').join('') + '</span></label>' +
        '<label class="field"><span>' + esc(t('yourReview')) + ' *</span>' +
          '<textarea class="inp" id="revText" maxlength="1200" placeholder="' + esc(t('reviewPlace')) + '"></textarea></label>' +
        '<div id="revMsg"></div>' +
        '<button class="btn btn-pri" type="submit">' + esc(t('submitReview')) + '</button>' +
      '</form>';

  host.innerHTML =
    (published.length
      ? '<div class="rev-summary">' +
          '<div class="rev-score"><b>' + avg.toFixed(1) + '</b>' + starsHTML(avg,true) +
            '<span>' + esc(t('basedOn')) + ' ' + published.length + ' ' + esc(t('reviews')) + '</span></div>' +
          '<div class="rev-bars">' + dist + '</div>' +
        '</div>'
      : '<p style="color:var(--muted)">' + esc(t('noReviews')) + '</p>') +
    '<div style="margin-bottom:var(--s-5)">' + items + '</div>' +
    '<h3 style="padding-top:var(--s-4);border-top:1px solid var(--line)">' + esc(t('writeReview')) + '</h3>' +
    form;

  if(!$('#revForm')) return;

  /* star picker */
  let chosen = 0;
  const btns = $$('#starIn button');
  const lightUp = n => btns.forEach((b,i) => {
    b.classList.toggle('lit', i < n);
    b.setAttribute('aria-checked', i === n-1 ? 'true' : 'false');
  });
  btns.forEach((b,i) => {
    b.addEventListener('mouseenter', ()=> lightUp(i+1));
    b.addEventListener('click', ()=>{ chosen = i+1; lightUp(chosen); });
  });
  $('#starIn').addEventListener('mouseleave', ()=> lightUp(chosen));

  $('#revForm').addEventListener('submit', e => {
    e.preventDefault();
    const msg = $('#revMsg');
    const text = $('#revText').value.trim();
    if(!chosen){ msg.innerHTML = '<div class="msg msg-err">' + esc(t('needRating')) + '</div>'; return; }
    if(text.length < 20){ msg.innerHTML = '<div class="msg msg-err">' + esc(t('needText')) + '</div>'; return; }

    const all = store.get(K.reviews,[]);
    all.push({
      id:'r_' + Date.now().toString(36),
      schoolId:s.id, userId:me.id, name:me.name,
      rating:chosen,
      tags:$$('#tagIn input:checked').map(i => i.value),
      text:text,
      date:new Date().toISOString().slice(0,10),
      status:'pending'
    });
    store.set(K.reviews,all);
    toast(t('reviewThanks'));
    renderReviews(s);
    $('#reviews').scrollIntoView({ behavior:'smooth', block:'start' });
  });
}

/* ============================ favourites ============================ */

Pages.favorites = function(){
  const me = Auth.current();
  const host = $('#favMount');
  if(!me){
    host.innerHTML = '<div class="gate">' + I.lock + '<h3>' + esc(t('favNeedsLogin')) + '</h3>' +
      '<a class="btn btn-pri" href="login.html?next=favorites.html">' + esc(t('login')) + '</a></div>';
    return;
  }
  const list = Favs.all().map(id => Data.byId(id)).filter(Boolean);
  if(!list.length){
    host.innerHTML = '<div class="empty">' + I.heart.replace('<svg','<svg style="stroke:var(--line-2)"') +
      '<h3>' + esc(t('emptyFavs')) + '</h3><p>' + esc(t('emptyFavsHint')) + '</p>' +
      '<a class="btn btn-pri" href="directory.html">' + esc(t('backToDir')) + '</a></div>';
    return;
  }
  renderCards(host,list,{});
  /* Un-hearting a card here should drop it from the list, and removing the last
     one should reveal the empty state. The listener sits on the container, which
     survives re-render — so bind it once, not on every pass. */
  if(!host.dataset.bound){
    host.dataset.bound = '1';
    host.addEventListener('click', e => {
      if(e.target.closest('.mini.fav')) setTimeout(()=> Pages.favorites(),10);
    });
  }
};

/* ============================ compare ============================ */

Pages.compare = function(){
  const host = $('#cmpMount');
  const ids = Compare.all();

  if(!ids.length){
    host.innerHTML = '<div class="empty cmp-empty">' +
      I.scales.replace('<svg','<svg style="stroke:var(--line-2)"') +
      '<h3>' + esc(t('emptyCmp')) + '</h3><p>' + esc(t('emptyCmpHint')) + '</p>' +
      '<a class="btn btn-pri" href="directory.html">' + esc(t('backToDir')) + '</a></div>';
    return;
  }

  const list = ids.map(id => Data.byId(id));
  const ranges = list.map(s => feeRange(s));
  const rates  = list.map(s => Data.rating(s.id));
  const priced = ranges.filter(r => r.known);
  const cheapest = priced.length ? Math.min.apply(null, priced.map(r => r.min)) : null;
  const best     = Math.max.apply(null, rates.map(r => r.avg));

  /* every fee band label across the compared schools, in ladder order */
  const bandKeys = [];
  list.forEach(s => (s.fees||[]).forEach(f => {
    if(!bandKeys.some(b => b.from === f.from && b.to === f.to)) bandKeys.push({ from:f.from, to:f.to });
  }));
  bandKeys.sort((a,b)=> GRADE_LADDER.indexOf(a.from) - GRADE_LADDER.indexOf(b.from));

  const head = '<tr><th>' + esc(Lang.isAr()?'المقارنة':'Comparing') + '</th>' +
    list.map(s => '<th>' +
      '<div style="display:flex;gap:var(--s-3);align-items:flex-start;margin-bottom:var(--s-2)">' + logoHTML(s) +
      '<div><a href="school.html?id=' + encodeURIComponent(s.id) + '" style="font-weight:650;color:var(--navy)">' +
        esc(schoolName(s)) + '</a><br>' + curBadge(s) + '</div></div>' +
      '<button class="btn btn-quiet btn-sm" data-drop="' + esc(s.id) + '">' +
        esc(Lang.isAr()?'إزالة':'Remove') + '</button></th>').join('') + '</tr>';

  function row(label,cells,cls){
    return '<tr><th>' + esc(label) + '</th>' +
      cells.map(c => '<td class="' + (cls||'') + '">' + c + '</td>').join('') + '</tr>';
  }

  const bandRows = bandKeys.map(bk => {
    const cells = list.map(s => {
      const f = (s.fees||[]).find(x => x.from === bk.from && x.to === bk.to);
      if(!f) return '<span style="color:var(--muted)">—</span>';
      const isLow = f.amount === Math.min.apply(null, list.map(x => {
        const y = (x.fees||[]).find(z => z.from === bk.from && z.to === bk.to);
        return y ? y.amount : Infinity;
      }));
      return '<span class="kwd" style="font-family:var(--f-num);font-weight:650;color:' +
        (isLow ? 'var(--green)' : 'var(--navy)') + '">' + esc(kwd(f.amount)) + '</span>';
    });
    const label = (bandKeys.length && bk.from === bk.to) ? bk.from : bk.from + ' – ' + bk.to;
    return row(label,cells);
  }).join('');

  host.innerHTML =
    '<div class="card-flat"><div class="tbl-scroll"><table class="cmptable">' +
      '<thead>' + head + '</thead><tbody>' +
        row(t('curriculum'), list.map(s => esc(lbl(CURRICULUM_BY_ID[s.curriculum])))) +
        row(t('rating'), list.map((s,i) => rates[i].count
          ? '<span class="rate">' + starsHTML(rates[i].avg) + '<b>' + rates[i].avg.toFixed(1) +
            '</b><span>(' + rates[i].count + ')</span></span>' +
            (rates[i].avg === best ? ' <span class="badge badge-green">' + esc(t('highestRated')) + '</span>' : '')
          : '<span style="color:var(--muted)">' + esc(t('noReviews')) + '</span>')) +
        row(t('feesFrom'), list.map((s,i) =>
          ranges[i].known
            ? '<span class="kwd" style="font-family:var(--f-num);font-weight:650;color:var(--navy)">' +
              esc(kwd(ranges[i].min)) + '</span>' +
              (ranges[i].min === cheapest ? ' <span class="badge badge-green">' + esc(t('lowestFee')) + '</span>' : '')
            : '<span class="badge badge-soft">' + esc(t('feesOnRequest')) + '</span>')) +
        row(t('feeSourceLabel'), list.map(s => feeBadge(s) +
          (s.feeYear ? '<br><span style="font-size:var(--t--1);color:var(--muted)">' + esc(s.feeYear) + '</span>' : ''))) +
        row(t('grades'), list.map(s => esc(s.from + ' – ' + s.to))) +
        row(t('ages'), list.map(s => esc(s.ages))) +
        row(t('location'), list.map(s => esc(s.district) + '<br><a href="' + mapsUrl(s) +
          '" target="_blank" rel="noopener noreferrer" style="font-size:var(--t--1)">' + esc(t('map')) + '</a>')) +
        row(t('gender'), list.map(s => esc(s.gender))) +
        row(t('founded'), list.map(s => esc(String(s.founded)))) +
        row(t('transport'), list.map(s => s.transport
          ? '<span class="badge badge-green">' + esc(t('yes')) + '</span>'
          : '<span class="badge badge-soft">' + esc(t('no')) + '</span>')) +
        row(t('accreditation'), list.map(s => esc((s.accreditation||[]).join(', ')))) +
        '<tr><th colspan="' + (list.length+1) + '" style="background:var(--blue-soft);color:var(--navy)">' +
          esc(t('feesTable')) + ' (' + esc(t('kwd')) + ')</th></tr>' +
        bandRows +
        row(t('instagram'), list.map(s => '<a href="' + igUrl(s) +
          '" target="_blank" rel="noopener noreferrer">' + (s.ig ? '@' + esc(s.ig) : esc(Lang.isAr()?'بحث':'Search')) + '</a>')) +
        row('', list.map(s => '<a class="btn btn-pri btn-sm" href="school.html?id=' +
          encodeURIComponent(s.id) + '">' + esc(t('viewProfile')) + '</a>')) +
      '</tbody></table></div></div>' +
    '<p style="margin-top:var(--s-4)"><a class="btn btn-ghost" href="directory.html">' + I.plus +
      esc(Lang.isAr()?'أضف مدرسة أخرى':'Add another school') + '</a>' +
      ' <button class="btn btn-quiet" id="cmpWipe">' + esc(t('compareClear')) + '</button></p>';

  $$('[data-drop]',host).forEach(b => b.addEventListener('click', ()=>{
    Compare.toggle(b.dataset.drop); Pages.compare();
  }));
  $('#cmpWipe').addEventListener('click', ()=>{ Compare.clear(); Pages.compare(); });
};

/* ============================ login / signup ============================ */

Pages.login = function(){
  const host = $('#authMount');
  const next = Route.params().get('next') || 'index.html';
  /* signup is selected with ?mode=signup rather than #signup: in the
     single-file build the hash belongs to the router. */
  let mode = Route.params().get('mode') === 'signup' ? 'signup' : 'login';

  const me = Auth.current();
  if(me){
    host.innerHTML = '<div class="auth-card"><div class="auth-head">' +
      '<h1>' + esc(Lang.isAr()?'أنت مسجل الدخول':'You are signed in') + '</h1>' +
      '<p>' + esc(me.name) + ' · ' + esc(me.email) + '</p></div>' +
      '<a class="btn btn-pri btn-block" href="account.html">' + esc(t('account')) + '</a>' +
      '<p style="margin-top:var(--s-3)"><button class="btn btn-quiet btn-block" id="lo">' +
        esc(t('logout')) + '</button></p></div>';
    $('#lo').addEventListener('click', ()=>{ Auth.logout(); location.reload(); });
    return;
  }

  function draw(){
    host.innerHTML =
      '<div class="auth-card">' +
        '<div class="auth-head">' +
          '<h1>' + esc(mode === 'login'
            ? (Lang.isAr()?'تسجيل الدخول':'Welcome back')
            : (Lang.isAr()?'إنشاء حساب':'Create your account')) + '</h1>' +
          '<p>' + esc(mode === 'login'
            ? (Lang.isAr()?'سجّل الدخول لكتابة التقييمات وحفظ المدارس':'Sign in to review schools and save favourites')
            : (Lang.isAr()?'مجاني — لكتابة التقييمات وحفظ المدارس':'Free — to write reviews and save favourites')) + '</p>' +
        '</div>' +
        '<div class="tabs" role="tablist">' +
          '<button role="tab" aria-selected="' + (mode==='login') + '" data-mode="login">' + esc(t('login')) + '</button>' +
          '<button role="tab" aria-selected="' + (mode==='signup') + '" data-mode="signup">' + esc(t('signup')) + '</button>' +
        '</div>' +
        '<div id="authMsg"></div>' +
        '<form id="authForm">' +
          (mode === 'signup'
            ? '<label class="field"><span>' + esc(Lang.isAr()?'الاسم الكامل':'Full name') + '</span>' +
              '<input class="inp" name="name" autocomplete="name" required></label>' : '') +
          '<label class="field"><span>' + esc(t('email')) + '</span>' +
            '<input class="inp" type="email" name="email" autocomplete="email" required></label>' +
          '<label class="field"><span>' + esc(Lang.isAr()?'كلمة المرور':'Password') + '</span>' +
            '<input class="inp" type="password" name="pass" autocomplete="' +
              (mode==='login'?'current-password':'new-password') + '" required minlength="8"></label>' +
          '<button class="btn btn-pri btn-block btn-lg" type="submit">' +
            esc(mode === 'login' ? t('login') : t('signup')) + '</button>' +
        '</form>' +
        '<div class="divider">' + esc(Lang.isAr()?'أو':'or') + '</div>' +
        '<div class="social">' +
          '<button class="btn" data-social="google">' + I.google +
            esc(Lang.isAr()?'المتابعة بحساب جوجل':'Continue with Google') + '</button>' +
          '<button class="btn" data-social="apple">' + I.apple +
            esc(Lang.isAr()?'المتابعة بحساب آبل':'Continue with Apple') + '</button>' +
        '</div>' +
        '<p class="note">' + esc(Lang.isAr()
          ? 'الدخول الاجتماعي هنا للعرض فقط — يحتاج إلى خدمة OAuth في النسخة النهائية.'
          : 'Social sign-in is simulated in this static build — it needs a real OAuth backend in production.') + '</p>' +
        '<p class="note">' + esc(Lang.isAr()?'حساب تجريبي:':'Demo parent account:') +
          ' noura@example.com / parent123</p>' +
      '</div>';

    $$('[data-mode]').forEach(b => b.addEventListener('click', ()=>{
      mode = b.dataset.mode;
      Route.set('login.html', mode === 'signup' ? 'mode=signup' : '', true);
      draw();
    }));

    $('#authForm').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const res = mode === 'login'
        ? Auth.login(fd.get('email'), fd.get('pass'))
        : Auth.signup(fd.get('name'), fd.get('email'), fd.get('pass'));
      if(res.err){
        $('#authMsg').innerHTML = '<div class="msg msg-err">' + esc(res.err) + '</div>';
        return;
      }
      Route.go(next);
    });

    $$('[data-social]').forEach(b => b.addEventListener('click', ()=>{
      const res = Auth.social(b.dataset.social);
      if(res.err){ $('#authMsg').innerHTML = '<div class="msg msg-err">' + esc(res.err) + '</div>'; return; }
      Route.go(next);
    }));
  }
  draw();
};

/* ============================ account ============================ */

Pages.account = function(){
  const me = Auth.current();
  const host = $('#accMount');
  if(!me){ Route.go('login.html?next=account.html'); return; }

  const favs = Favs.all().map(id => Data.byId(id)).filter(Boolean);
  const mine = store.get(K.reviews,[]).filter(r => r.userId === me.id);

  host.innerHTML =
    '<section class="panel"><h2>' + esc(t('account')) + '</h2>' +
      '<dl class="deftable">' +
        '<div class="defrow"><dt>' + esc(Lang.isAr()?'الاسم':'Name') + '</dt><dd>' + esc(me.name) + '</dd></div>' +
        '<div class="defrow"><dt>' + esc(t('email')) + '</dt><dd>' + esc(me.email) + '</dd></div>' +
        '<div class="defrow"><dt>' + esc(Lang.isAr()?'طريقة الدخول':'Sign-in method') + '</dt><dd>' +
          esc(me.provider) + '</dd></div>' +
        '<div class="defrow"><dt>' + esc(Lang.isAr()?'تاريخ الانضمام':'Member since') + '</dt><dd>' +
          esc(fmtDate(me.created)) + '</dd></div>' +
      '</dl>' +
      '<p style="margin:var(--s-4) 0 0"><button class="btn btn-ghost" id="accOut">' + I.out +
        esc(t('logout')) + '</button></p>' +
    '</section>' +

    '<section class="panel"><h2>' + esc(t('favourites')) + ' (' + favs.length + ')</h2>' +
      (favs.length
        ? '<div class="grid" id="accFavs">' + favs.map(s => KSG.cardHTML(s,{})).join('') + '</div>'
        : '<p style="color:var(--muted)">' + esc(t('emptyFavs')) + '</p>') +
    '</section>' +

    '<section class="panel"><h2>' + esc(Lang.isAr()?'تقييماتي':'My reviews') + ' (' + mine.length + ')</h2>' +
      (mine.length
        ? mine.map(r => {
            const s = Data.byId(r.schoolId);
            return '<article class="review"><div class="rev-head">' +
              '<span class="rev-who"><b>' + esc(s ? schoolName(s) : r.schoolId) + '</b>' +
              '<time>' + esc(fmtDate(r.date)) + '</time></span>' +
              '<span class="badge ' + (r.status === 'approved' ? 'badge-green' : 'badge-pend') + '">' +
                esc(r.status === 'approved'
                  ? (Lang.isAr()?'منشور':'Published')
                  : t('pendingOwn')) + '</span>' +
              starsHTML(r.rating) + '</div><p>' + esc(r.text) + '</p></article>';
          }).join('')
        : '<p style="color:var(--muted)">' + esc(Lang.isAr()?'لم تكتب أي تقييم بعد.':'You have not written any reviews yet.') + '</p>') +
    '</section>';

  $('#accOut').addEventListener('click', ()=>{ Auth.logout(); Route.go('index.html'); });
  const af = $('#accFavs');
  if(af) bindCardActions(af);
};

/* ============================ SEO helpers ============================ */

function setMeta(name,content){
  let el = document.querySelector('meta[name="' + name + '"]');
  if(!el){ el = document.createElement('meta'); el.setAttribute('name',name); document.head.appendChild(el); }
  el.setAttribute('content',content);
}
function setLink(rel,href){
  let el = document.querySelector('link[rel="' + rel + '"]');
  if(!el){ el = document.createElement('link'); el.setAttribute('rel',rel); document.head.appendChild(el); }
  el.setAttribute('href',href);
}
/* schema.org School — gives the profile page a rich result with fees,
   address and the aggregate parent rating */
function injectJSONLD(s,r){
  const fr = feeRange(s);
  const node = {
    '@context':'https://schema.org',
    '@type':'School',
    name:s.name,
    alternateName:s.nameAr || undefined,
    description:s.blurb,
    url:location.href,
    sameAs:[s.website, s.ig ? 'https://www.instagram.com/' + s.ig + '/' : null].filter(Boolean),
    foundingDate:String(s.founded),
    address:{ '@type':'PostalAddress', streetAddress:s.address,
              addressLocality:s.district, addressRegion:s.governorate, addressCountry:'KW' },
    geo:(s.lat && s.lng) ? { '@type':'GeoCoordinates', latitude:s.lat, longitude:s.lng } : undefined,
    knowsLanguage:s.languages,
    slogan:s.blurb,
    /* only publish fees in structured data when we actually have them —
       a school that keeps its fees private must not appear priced */
    offers:(s.fees && s.fees.length) ? s.fees.map(f => ({
      '@type':'Offer',
      name:f.band,
      price:f.amount,
      priceCurrency:'KWD',
      category:'Annual tuition (' + (s.feeYear || 'current year') + ')'
    })) : undefined,
    priceRange:fr.known ? (kwd(fr.min) + ' – ' + kwd(fr.max)) : undefined
  };
  if(r.count){
    node.aggregateRating = {
      '@type':'AggregateRating',
      ratingValue:Number(r.avg.toFixed(1)),
      reviewCount:r.count,
      bestRating:5, worstRating:1
    };
  }
  let tag = document.getElementById('ldjson');
  if(!tag){
    tag = document.createElement('script');
    tag.type = 'application/ld+json'; tag.id = 'ldjson';
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(node,(k,v)=> v === undefined ? undefined : v, 2);
}

global.Pages = Pages;

})(window);
