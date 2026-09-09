/* ============================================================
   KUWAIT SCHOOLS GUIDE — admin dashboard
   لوحة الإدارة

   Separate login from the parent accounts (a distinct ksg_admin
   session key), five views: overview, schools, reviews, users,
   data. Edits are written as a patch layer over the seed
   catalogue so data.js is never mutated.
   ============================================================ */
(function(global){
'use strict';

const {
  $, $$, esc, t, lbl, Lang, schoolName, I, starsHTML, logoHTML, curBadge,
  kwd, feeHeadline, feeBadge, fmtDate, Data, Auth, toast, store, K, ADMIN_SEED
} = global.KSG;

const A = {};
let view = 'overview';

/* ============================ gate ============================ */

A.boot = function(){
  /* app.js skips the public header, footer and compare bar on this page
     because #adminMount is present — the sidebar is the only chrome here. */
  const hdr = document.getElementById('hdr'), ftr = document.getElementById('ftr');
  if(hdr) hdr.remove();
  if(ftr) ftr.remove();

  if(!Auth.isAdmin()){ A.loginScreen(); return; }
  A.shell();
};

A.loginScreen = function(){
  const host = $('#adminMount');
  host.innerHTML =
    '<div class="auth-wrap"><div class="auth-card">' +
      '<div class="auth-head">' +
        '<span class="brand-mark" style="width:46px;height:46px;margin:0 auto var(--s-4)">' + I.lock + '</span>' +
        '<h1>' + esc(Lang.isAr()?'دخول الإدارة':'Administrator sign-in') + '</h1>' +
        '<p>' + esc(Lang.isAr()
          ? 'هذه اللوحة منفصلة عن حسابات أولياء الأمور.'
          : 'This dashboard is separate from parent accounts.') + '</p>' +
      '</div>' +
      '<div id="admMsg"></div>' +
      '<form id="admForm">' +
        '<label class="field"><span>' + esc(Lang.isAr()?'البريد الإلكتروني':'Email') + '</span>' +
          '<input class="inp" type="email" name="email" autocomplete="username" required></label>' +
        '<label class="field"><span>' + esc(Lang.isAr()?'كلمة المرور':'Password') + '</span>' +
          '<input class="inp" type="password" name="pass" autocomplete="current-password" required></label>' +
        '<button class="btn btn-pri btn-block btn-lg" type="submit">' +
          esc(Lang.isAr()?'دخول':'Sign in') + '</button>' +
      '</form>' +
      '<p class="note">' + esc(Lang.isAr()?'بيانات العرض:':'Demo credentials:') + '<br>' +
        esc(ADMIN_SEED.email) + ' / ' + esc(ADMIN_SEED.pass) + '</p>' +
      '<p class="note"><a href="index.html">← ' + esc(Lang.isAr()?'الموقع':'Back to the site') + '</a></p>' +
    '</div></div>';

  $('#admForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const res = Auth.adminLogin(fd.get('email'), fd.get('pass'));
    if(res.err){ $('#admMsg').innerHTML = '<div class="msg msg-err">' + esc(res.err) + '</div>'; return; }
    A.shell();
  });
};

/* ============================ shell ============================ */

const VIEWS = [
  ['overview','chart',   'Overview',      'نظرة عامة'],
  ['schools', 'building','Schools',       'المدارس'],
  ['reviews', 'chat',    'Reviews',       'التقييمات'],
  ['users',   'users',   'Users',         'المستخدمون'],
  ['data',    'layers',  'Data & reset',  'البيانات']
];

A.shell = function(){
  const pending = store.get(K.reviews,[]).filter(r => r.status === 'pending').length;
  $('#adminMount').innerHTML =
    '<div class="admin-shell">' +
      '<aside class="side">' +
        '<a class="brand" href="index.html">' +
          '<span class="brand-mark">' + I.cap + '</span>' +
          '<span class="brand-txt"><b>' + esc(Lang.isAr()?'لوحة الإدارة':'Admin') + '</b>' +
          '<span>Kuwait Schools Guide</span></span></a>' +
        '<nav>' + VIEWS.map(([id,ico,en,ar]) =>
          '<button data-view="' + id + '"' + (view===id?' aria-current="true"':'') + '>' + I[ico] +
          '<span>' + esc(Lang.isAr()?ar:en) + '</span>' +
          (id === 'reviews' && pending ? '<span class="pip">' + pending + '</span>' : '') +
          '</button>').join('') + '</nav>' +
        '<div class="side-foot">' +
          '<p style="margin-bottom:var(--s-3)">' + esc(Lang.isAr()?'مسجل كمدير':'Signed in as admin') + '</p>' +
          '<button class="btn btn-ghost btn-sm btn-block" id="admOut">' + I.out +
            esc(Lang.isAr()?'خروج':'Sign out') + '</button>' +
          '<p style="margin:var(--s-3) 0 0"><a href="index.html" style="color:var(--sky)">← ' +
            esc(Lang.isAr()?'الموقع':'View site') + '</a></p>' +
        '</div>' +
      '</aside>' +
      '<main class="admin-main" id="admBody"></main>' +
    '</div>' +
    '<div class="modal" id="admModal"><div class="modal-veil" data-mclose></div>' +
      '<div class="modal-box" id="admModalBox" role="dialog" aria-modal="true"></div></div>';

  $$('[data-view]').forEach(b => b.addEventListener('click', ()=>{
    view = b.dataset.view; A.shell();
  }));
  $('#admOut').addEventListener('click', ()=>{ Auth.adminLogout(); A.loginScreen(); });
  $$('[data-mclose]').forEach(el => el.addEventListener('click', closeModal));

  ({ overview:A.overview, schools:A.schools, reviews:A.reviews, users:A.users, data:A.dataView }[view])();
};

function head(title,actions){
  return '<div class="admin-head"><h1>' + esc(title) + '</h1>' +
    '<span class="spacer"></span>' + (actions||'') + '</div>';
}

/* ============================ overview ============================ */

A.overview = function(){
  const schools = Data.all();
  const users   = Auth.users();
  const revs    = store.get(K.reviews,[]);
  const views   = Data.views();
  /* zero by design — nothing is seeded — but still summed so the count stays
     correct if a future import ever ships reviews alongside a school */
  const seedRevCount = schools.reduce((n,s)=> n + (s.reviews ? s.reviews.length : 0), 0);
  const pending = revs.filter(r => r.status === 'pending');

  const mostViewed = Object.keys(views)
    .map(id => ({ s:Data.byId(id), n:views[id] }))
    .filter(x => x.s)
    .sort((a,b)=> b.n - a.n)
    .slice(0,8);

  const byCur = CURRICULA.map(c => ({ c:c, n:schools.filter(s => s.curriculum === c.id).length }))
    .filter(x => x.n);
  const maxCur = Math.max.apply(null, byCur.map(x => x.n));

  $('#admBody').innerHTML =
    head(Lang.isAr()?'نظرة عامة':'Overview') +

    '<div class="stats">' +
      stat('building', schools.length, Lang.isAr()?'مدرسة':'Schools listed') +
      stat('users',    users.length,   Lang.isAr()?'مستخدم':'Registered users') +
      stat('chat',     seedRevCount + revs.filter(r=>r.status==='approved').length,
                       Lang.isAr()?'تقييم منشور':'Published reviews') +
      stat('eye',      Object.keys(views).reduce((n,k)=>n+views[k],0),
                       Lang.isAr()?'مشاهدة صفحة':'Profile views') +
    '</div>' +

    (pending.length
      ? '<div class="msg msg-info" style="display:flex;align-items:center;gap:var(--s-3)">' +
        '<span>' + esc(Lang.isAr()
          ? pending.length + ' تقييم في انتظار المراجعة'
          : pending.length + ' review' + (pending.length>1?'s':'') + ' awaiting moderation') + '</span>' +
        '<button class="btn btn-pri btn-sm" id="goMod">' +
          esc(Lang.isAr()?'راجع الآن':'Moderate now') + '</button></div>'
      : '') +

    '<div style="display:grid;gap:var(--s-4);grid-template-columns:1fr">' +
      '<div class="card-flat"><header><h2>' + esc(Lang.isAr()?'الأكثر مشاهدة':'Most-viewed schools') + '</h2></header>' +
        (mostViewed.length
          ? '<div class="tbl-scroll"><table class="dtable"><thead><tr>' +
            '<th>#</th><th>' + esc(Lang.isAr()?'المدرسة':'School') + '</th>' +
            '<th>' + esc(t('curriculum')) + '</th><th>' + esc(t('rating')) + '</th>' +
            '<th>' + esc(Lang.isAr()?'مشاهدات':'Views') + '</th></tr></thead><tbody>' +
            mostViewed.map((x,i) => {
              const r = Data.rating(x.s.id);
              return '<tr><td>' + (i+1) + '</td>' +
                '<td><a href="school.html?id=' + encodeURIComponent(x.s.id) + '">' + esc(schoolName(x.s)) + '</a></td>' +
                '<td>' + curBadge(x.s) + '</td>' +
                '<td>' + (r.count ? starsHTML(r.avg) + ' ' + r.avg.toFixed(1) : '—') + '</td>' +
                '<td style="font-family:var(--f-num)">' + x.n + '</td></tr>';
            }).join('') + '</tbody></table></div>'
          : '<p style="padding:var(--s-4);color:var(--muted)">' + esc(Lang.isAr()
              ? 'لا توجد مشاهدات بعد — تُحتسب عند زيارة صفحات المدارس.'
              : 'No views recorded yet — these accumulate as visitors open school profiles.') + '</p>') +
      '</div>' +

      '<div class="card-flat"><header><h2>' + esc(Lang.isAr()?'التوزيع حسب المنهج':'Schools by curriculum') + '</h2></header>' +
        '<div style="padding:var(--s-4);display:grid;gap:var(--s-3)">' +
          byCur.map(x =>
            '<div class="rev-bar"><span class="lbl" style="width:110px">' + esc(lbl(x.c)) + '</span>' +
            '<span class="track"><span class="fill" style="width:' + Math.round(x.n/maxCur*100) +
              '%;background:' + x.c.color + '"></span></span>' +
            '<span class="n">' + x.n + '</span></div>').join('') +
        '</div>' +
      '</div>' +
    '</div>';

  const gm = $('#goMod');
  if(gm) gm.addEventListener('click', ()=>{ view = 'reviews'; A.shell(); });
};

function stat(ico,n,label){
  return '<div class="stat"><span class="ico">' + I[ico] + '</span>' +
    '<b>' + Number(n).toLocaleString('en-US') + '</b><span>' + esc(label) + '</span></div>';
}

/* ============================ schools CRUD ============================ */

A.schools = function(){
  const list = Data.all().slice().sort((a,b)=> a.name.localeCompare(b.name));

  $('#admBody').innerHTML =
    head(Lang.isAr()?'إدارة المدارس':'Manage schools',
      '<button class="btn btn-pri" id="addSchool">' + I.plus +
      esc(Lang.isAr()?'أضف مدرسة':'Add school') + '</button>') +

    '<div class="card-flat"><header>' +
      '<h2>' + list.length + ' ' + esc(Lang.isAr()?'مدرسة':'schools') + '</h2>' +
      '<span class="spacer"></span>' +
      '<input class="inp" id="schFind" style="width:auto;min-width:220px" placeholder="' +
        esc(Lang.isAr()?'ابحث…':'Filter by name or district…') + '">' +
    '</header>' +
    '<div class="tbl-scroll"><table class="dtable"><thead><tr>' +
      '<th>' + esc(Lang.isAr()?'المدرسة':'School') + '</th>' +
      '<th>' + esc(t('curriculum')) + '</th>' +
      '<th>' + esc(t('grades')) + '</th>' +
      '<th>' + esc(t('district')) + '</th>' +
      '<th>' + esc(t('fees')) + '</th>' +
      '<th>' + esc(t('instagram')) + '</th>' +
      '<th></th></tr></thead><tbody id="schRows"></tbody></table></div></div>';

  function rows(filter){
    const f = (filter||'').toLowerCase();
    const shown = list.filter(s => !f ||
      (s.name + ' ' + (s.nameAr||'') + ' ' + s.district + ' ' + s.curriculum).toLowerCase().indexOf(f) >= 0);
    $('#schRows').innerHTML = shown.map(s => {
      const fr = feeRange(s);
      const custom = !!Data.edits()[s.id] || Data.added().some(x => x.id === s.id);
      return '<tr><td><div style="display:flex;gap:var(--s-3);align-items:center">' + logoHTML(s) +
          '<div><a href="school.html?id=' + encodeURIComponent(s.id) + '" style="font-weight:600">' +
          esc(s.name) + '</a>' + (custom
            ? '<br><span class="badge badge-green">' + esc(Lang.isAr()?'معدّلة':'edited') + '</span>' : '') +
          '</div></div></td>' +
        '<td>' + curBadge(s) + '</td>' +
        '<td>' + esc(s.from + ' – ' + s.to) + '</td>' +
        '<td>' + esc(s.district) + '</td>' +
        '<td style="white-space:nowrap"><span style="font-family:var(--f-num)">' +
          esc(feeHeadline(s)) + '</span><br>' + feeBadge(s) + '</td>' +
        '<td>' + (s.ig ? '@' + esc(s.ig) : '<span style="color:var(--muted)">—</span>') + '</td>' +
        '<td><span class="acts">' +
          '<button class="btn btn-ghost btn-sm" data-edit="' + esc(s.id) + '">' + I.edit +
            esc(Lang.isAr()?'تعديل':'Edit') + '</button>' +
          '<button class="btn btn-danger btn-sm" data-del="' + esc(s.id) + '">' + I.trash + '</button>' +
        '</span></td></tr>';
    }).join('') || '<tr><td colspan="7" style="color:var(--muted)">' +
      esc(Lang.isAr()?'لا نتائج':'No matches') + '</td></tr>';

    $$('[data-edit]').forEach(b => b.addEventListener('click', ()=> A.schoolForm(b.dataset.edit)));
    $$('[data-del]').forEach(b => b.addEventListener('click', ()=> A.deleteSchool(b.dataset.del)));
  }

  rows('');
  $('#schFind').addEventListener('input', e => rows(e.target.value));
  $('#addSchool').addEventListener('click', ()=> A.schoolForm(null));
};

A.schoolForm = function(id){
  const s = id ? Data.byId(id) : null;
  const isNew = !s;
  const v = s || {
    id:'', name:'', nameAr:'', abbr:'', curriculum:'American', extras:[], gender:'Mixed',
    founded:new Date().getFullYear(), district:'', governorate:'Hawalli', address:'',
    lat:'', lng:'', website:'', ig:'', from:'KG1', to:'Grade 12', ages:'',
    languages:['English','Arabic'], accreditation:[], transport:true, theme:['#0B2545','#1B6CA8'],
    blurb:'', about:'', facilities:[], fees:[], reviews:[], featured:false, verified:false,
    feeBasis:'estimate', feeYear:'', feeSource:'', feeNote:'', feeRange:null
  };

  const gradeOpts = sel => GRADE_LADDER.map(g =>
    '<option value="' + esc(g) + '"' + (g === sel ? ' selected' : '') + '>' + esc(g) + '</option>').join('');

  openModal(
    (isNew ? (Lang.isAr()?'إضافة مدرسة':'Add a school') : (Lang.isAr()?'تعديل المدرسة':'Edit school')),
    '<form id="schForm">' +
      '<div class="form-grid">' +
        f('name',  Lang.isAr()?'اسم المدرسة (إنجليزي)':'School name (English)', v.name, 'span2', true) +
        f('nameAr',Lang.isAr()?'اسم المدرسة (عربي)':'School name (Arabic)', v.nameAr, 'span2') +
        f('abbr',  Lang.isAr()?'الاختصار (للشعار)':'Abbreviation (used as the logo)', v.abbr) +
        '<label class="field"><span>' + esc(t('curriculum')) + ' *</span>' +
          '<select class="inp" name="curriculum">' + CURRICULA.map(c =>
            '<option value="' + c.id + '"' + (c.id === v.curriculum ? ' selected' : '') + '>' +
            esc(c.en) + '</option>').join('') + '</select></label>' +

        '<label class="field"><span>' + esc(Lang.isAr()?'من صف':'From grade') + ' *</span>' +
          '<select class="inp" name="from">' + gradeOpts(v.from) + '</select></label>' +
        '<label class="field"><span>' + esc(Lang.isAr()?'إلى صف':'To grade') + ' *</span>' +
          '<select class="inp" name="to">' + gradeOpts(v.to) + '</select></label>' +

        f('ages', t('ages') + ' (e.g. 4 – 18 years)', v.ages) +
        f('gender', t('gender'), v.gender) +

        f('district', t('district') + ' *', v.district, '', true) +
        '<label class="field"><span>' + esc(Lang.isAr()?'المحافظة':'Governorate') + '</span>' +
          '<select class="inp" name="governorate">' + GOVERNORATES.map(g =>
            '<option value="' + g.id + '"' + (g.id === v.governorate ? ' selected' : '') + '>' +
            esc(g.en) + '</option>').join('') + '</select></label>' +

        f('address', Lang.isAr()?'العنوان':'Address', v.address, 'span2') +
        f('lat', 'Latitude', v.lat) +
        f('lng', 'Longitude', v.lng) +

        f('website', t('website'), v.website) +
        f('ig', t('instagram') + ' (' + (Lang.isAr()?'المعرّف بدون @':'handle without @') + ')', v.ig) +

        f('founded', t('founded'), v.founded) +
        '<label class="field"><span>' + esc(t('transport')) + '</span>' +
          '<select class="inp" name="transport">' +
            '<option value="1"' + (v.transport?' selected':'') + '>' + esc(t('yes')) + '</option>' +
            '<option value="0"' + (!v.transport?' selected':'') + '>' + esc(t('no')) + '</option>' +
          '</select></label>' +

        f('languages', t('languages') + ' (' + (Lang.isAr()?'مفصولة بفاصلة':'comma separated') + ')',
          (v.languages||[]).join(', '), 'span2') +
        f('accreditation', t('accreditation') + ' (' + (Lang.isAr()?'مفصولة بفاصلة':'comma separated') + ')',
          (v.accreditation||[]).join(', '), 'span2') +
        f('extras', (Lang.isAr()?'برامج إضافية':'Programmes / tags') + ' (' +
          (Lang.isAr()?'مفصولة بفاصلة':'comma separated') + ')', (v.extras||[]).join(', '), 'span2') +
        f('facilities', t('facilities') + ' (' + (Lang.isAr()?'مفصولة بفاصلة':'comma separated') + ')',
          (v.facilities||[]).join(', '), 'span2') +

        '<label class="field span2"><span>' + esc(Lang.isAr()?'وصف قصير (للكرت)':'Short blurb (shown on cards)') +
          ' *</span><textarea class="inp" name="blurb" style="min-height:70px" required>' +
          esc(v.blurb) + '</textarea></label>' +
        '<label class="field span2"><span>' + esc(t('about')) + '</span>' +
          '<textarea class="inp" name="about">' + esc(v.about) + '</textarea></label>' +

        '<label class="field span2"><span>' + esc(t('feesTable')) + ' — ' +
          esc(Lang.isAr()?'سطر لكل مرحلة: التسمية | من | إلى | المبلغ':'one line per band: Label | From | To | Amount') +
          '</span><textarea class="inp" name="fees" style="min-height:120px;font-family:var(--f-num)">' +
          esc((v.fees||[]).map(x => [x.band,x.from,x.to,x.amount].join(' | ')).join('\n')) +
          '</textarea></label>' +

        '<label class="field"><span>' + esc(Lang.isAr()?'مصدر الرسوم':'Where the fees came from') + '</span>' +
          '<select class="inp" name="feeBasis">' +
            [['school',   Lang.isAr()?'موقع المدرسة (مؤكد)':'The school\u2019s own website (verified)'],
             ['directory',Lang.isAr()?'دليل رسوم منشور':'A published fee directory'],
             ['on-request',Lang.isAr()?'المدرسة لا تنشر رسومها':'The school does not publish fees'],
             ['estimate', Lang.isAr()?'تقدير غير مؤكد':'Unconfirmed estimate']]
            .map(([val,label]) => '<option value="' + val + '"' +
              ((v.feeBasis||'estimate') === val ? ' selected' : '') + '>' + esc(label) + '</option>').join('') +
          '</select></label>' +
        f('feeYear', Lang.isAr()?'العام الدراسي للرسوم':'Fee academic year (e.g. 2026/27)', v.feeYear) +
        f('feeSource', Lang.isAr()?'رابط مصدر الرسوم':'Fee source URL', v.feeSource, 'span2') +
        f('feeNote', Lang.isAr()?'مبالغ إضافية / ملاحظات':'Other payable amounts / notes', v.feeNote, 'span2') +
        f('feeRangeMin', Lang.isAr()?'أدنى رسوم (إن لم تُفصّل)':'Fee range minimum (if no bands)',
          v.feeRange ? v.feeRange.min : '') +
        f('feeRangeMax', Lang.isAr()?'أعلى رسوم (إن لم تُفصّل)':'Fee range maximum (if no bands)',
          v.feeRange ? v.feeRange.max : '') +

        '<label class="field"><span>' + esc(Lang.isAr()?'لون الشعار ١':'Logo colour 1') + '</span>' +
          '<input class="inp" type="color" name="c1" value="' + esc(v.theme[0]) + '"></label>' +
        '<label class="field"><span>' + esc(Lang.isAr()?'لون الشعار ٢':'Logo colour 2') + '</span>' +
          '<input class="inp" type="color" name="c2" value="' + esc(v.theme[1]) + '"></label>' +

        '<label class="check span2"><input type="checkbox" name="featured"' + (v.featured?' checked':'') + '>' +
          '<span>' + esc(Lang.isAr()?'إظهار في المدارس المميزة على الرئيسية':'Show in Featured schools on the homepage') +
          '</span></label>' +

      '</div>' +
      '<div id="schMsg"></div>' +
      '<div class="modal-foot">' +
        '<button class="btn btn-quiet" type="button" data-mclose>' + esc(Lang.isAr()?'إلغاء':'Cancel') + '</button>' +
        '<button class="btn btn-pri" type="submit">' + I.check +
          esc(Lang.isAr()?'حفظ':'Save school') + '</button>' +
      '</div>' +
    '</form>');

  $$('[data-mclose]').forEach(el => el.addEventListener('click', closeModal));

  $('#schForm').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const get = k => String(fd.get(k) || '').trim();
    const csv = k => get(k).split(',').map(x => x.trim()).filter(Boolean);

    /* fee lines: "Label | From | To | Amount" */
    const fees = [];
    get('fees').split('\n').map(l => l.trim()).filter(Boolean).forEach(line => {
      const p = line.split('|').map(x => x.trim());
      if(p.length < 4) return;
      const amt = Number(p[3].replace(/[^\d.]/g,''));
      if(GRADE_LADDER.indexOf(p[1]) < 0 || GRADE_LADDER.indexOf(p[2]) < 0 || isNaN(amt)) return;
      fees.push({ band:p[0], from:p[1], to:p[2], amount:amt });
    });
    const basis = get('feeBasis') || 'estimate';
    const rMin = Number(get('feeRangeMin')), rMax = Number(get('feeRangeMax'));
    const hasRange = !isNaN(rMin) && !isNaN(rMax) && rMin > 0 && rMax >= rMin;
    /* Bands are optional: a school may publish only a range, or nothing at
       all. But anything other than "does not publish" needs some figure. */
    if(!fees.length && !hasRange && basis !== 'on-request'){
      $('#schMsg').innerHTML = '<div class="msg msg-err">' + esc(Lang.isAr()
        ? 'أضف مراحل رسوم أو نطاقاً، أو اختر «المدرسة لا تنشر رسومها».'
        : 'Add fee bands or a fee range — or set the source to “The school does not publish fees”.') + '</div>';
      return;
    }
    if(GRADE_LADDER.indexOf(get('from')) > GRADE_LADDER.indexOf(get('to'))){
      $('#schMsg').innerHTML = '<div class="msg msg-err">' + esc(Lang.isAr()
        ? '"من صف" يجب أن يكون قبل "إلى صف".'
        : '"From grade" must come before "To grade".') + '</div>';
      return;
    }

    const patch = {
      name:get('name'), nameAr:get('nameAr'), abbr:get('abbr'),
      curriculum:get('curriculum'), gender:get('gender'),
      founded:Number(get('founded')) || v.founded,
      district:get('district'), governorate:get('governorate'), address:get('address'),
      lat:Number(get('lat')) || null, lng:Number(get('lng')) || null,
      website:get('website'), ig:get('ig') ? get('ig').replace(/^@/,'') : null,
      from:get('from'), to:get('to'), ages:get('ages'),
      languages:csv('languages'), accreditation:csv('accreditation'),
      extras:csv('extras'), facilities:csv('facilities'),
      transport:get('transport') === '1',
      blurb:get('blurb'), about:get('about') || get('blurb'),
      fees:fees,
      feeRange:(!fees.length && hasRange) ? { min:rMin, max:rMax } : null,
      feeBasis:basis,
      feeYear:get('feeYear'),
      feeSource:get('feeSource'),
      feeNote:get('feeNote'),
      theme:[get('c1'), get('c2')],
      featured:!!fd.get('featured'),
      /* "verified" means the figures came from the school itself */
      verified:basis === 'school'
    };

    if(isNew){
      const slug = (patch.abbr || patch.name).toLowerCase()
        .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40) || ('school-' + Date.now().toString(36));
      const added = Data.added();
      if(Data.byId(slug)){
        $('#schMsg').innerHTML = '<div class="msg msg-err">' + esc(Lang.isAr()
          ? 'يوجد مدرسة بنفس المعرّف. غيّر الاسم أو الاختصار.'
          : 'A school with that generated id already exists — change the name or abbreviation.') + '</div>';
        return;
      }
      added.push(Object.assign({ id:slug, reviews:[] }, patch));
      store.set(K.added,added);
      toast(Lang.isAr()?'تمت إضافة المدرسة':'School added');
    }else{
      /* schools that live in the "added" list are edited in place;
         seed schools get an entry in the patch layer instead */
      const added = Data.added();
      const i = added.findIndex(x => x.id === id);
      if(i >= 0){ added[i] = Object.assign(added[i],patch); store.set(K.added,added); }
      else{
        const edits = Data.edits();
        edits[id] = Object.assign(edits[id] || {}, patch);
        store.set(K.edits,edits);
      }
      toast(Lang.isAr()?'تم حفظ التعديلات':'Changes saved');
    }
    closeModal();
    A.shell();
  });

  function f(name,label,val,cls,req){
    return '<label class="field ' + (cls||'') + '"><span>' + esc(label) + '</span>' +
      '<input class="inp" name="' + name + '" value="' + esc(val == null ? '' : val) + '"' +
      (req?' required':'') + '></label>';
  }
};

A.deleteSchool = function(id){
  const s = Data.byId(id);
  if(!s) return;
  openModal(Lang.isAr()?'حذف المدرسة':'Delete school',
    '<p>' + esc(Lang.isAr()
      ? 'سيتم إخفاء "' + s.name + '" من الموقع. يمكن استرجاعها من قسم البيانات.'
      : 'This removes “' + s.name + '” from the public site. You can restore it from Data & reset.') + '</p>' +
    '<div class="modal-foot">' +
      '<button class="btn btn-quiet" data-mclose>' + esc(Lang.isAr()?'إلغاء':'Cancel') + '</button>' +
      '<button class="btn btn-danger" id="delYes">' + I.trash +
        esc(Lang.isAr()?'حذف':'Delete') + '</button></div>');
  $$('[data-mclose]').forEach(el => el.addEventListener('click', closeModal));
  $('#delYes').addEventListener('click', ()=>{
    const added = Data.added();
    const i = added.findIndex(x => x.id === id);
    if(i >= 0){ added.splice(i,1); store.set(K.added,added); }
    else{ const rm = Data.removed(); rm.push(id); store.set(K.removed,rm); }
    toast(Lang.isAr()?'تم الحذف':'School removed');
    closeModal(); A.shell();
  });
};

/* ============================ review moderation ============================ */

A.reviews = function(){
  const all = store.get(K.reviews,[]);
  const order = { pending:0, approved:1, rejected:2 };
  const list = all.slice().sort((a,b)=>
    (order[a.status] - order[b.status]) || (b.date||'').localeCompare(a.date||''));

  const counts = {
    pending:  all.filter(r => r.status==='pending').length,
    approved: all.filter(r => r.status==='approved').length,
    rejected: all.filter(r => r.status==='rejected').length
  };

  $('#admBody').innerHTML =
    head(Lang.isAr()?'مراجعة التقييمات':'Review moderation') +

    '<div class="stats" style="grid-template-columns:repeat(3,1fr)">' +
      stat('chat',  counts.pending,  Lang.isAr()?'في الانتظار':'Awaiting moderation') +
      stat('check', counts.approved, Lang.isAr()?'منشور':'Approved') +
      stat('ban',   counts.rejected, Lang.isAr()?'مرفوض':'Rejected') +
    '</div>' +

    '<div class="msg msg-info">' + esc(Lang.isAr()
      ? 'كل تقييم على الموقع يكتبه ولي أمر مسجّل ولا يُنشر قبل موافقتك — لا توجد تقييمات جاهزة في ملف البيانات.'
      : 'Every review on the site is written by a signed-in parent and stays unpublished until you approve it — no reviews are seeded in data.js.') +
    '</div>' +

    '<div class="card-flat"><header><h2>' + list.length + ' ' +
      esc(Lang.isAr()?'تقييم مُرسل':'submitted reviews') + '</h2></header>' +
      (list.length
        ? '<div class="tbl-scroll"><table class="dtable"><thead><tr>' +
          '<th>' + esc(Lang.isAr()?'المدرسة':'School') + '</th>' +
          '<th>' + esc(Lang.isAr()?'الكاتب':'Author') + '</th>' +
          '<th>' + esc(t('rating')) + '</th>' +
          '<th>' + esc(Lang.isAr()?'النص':'Review') + '</th>' +
          '<th>' + esc(Lang.isAr()?'الحالة':'Status') + '</th>' +
          '<th></th></tr></thead><tbody>' +
          list.map(r => {
            const s = Data.byId(r.schoolId);
            return '<tr><td>' + (s
                ? '<a href="school.html?id=' + encodeURIComponent(s.id) + '">' + esc(schoolName(s)) + '</a>'
                : '<span style="color:var(--muted)">' + esc(r.schoolId) + '</span>') + '</td>' +
              '<td>' + esc(r.name) + '<br><span style="color:var(--muted);font-size:var(--t--1)">' +
                esc(fmtDate(r.date)) + '</span></td>' +
              '<td>' + starsHTML(r.rating) + '</td>' +
              '<td class="trunc">' + esc(r.text.length > 180 ? r.text.slice(0,180) + '…' : r.text) + '</td>' +
              '<td><span class="badge ' +
                (r.status==='approved'?'badge-green':r.status==='rejected'?'badge-red':'badge-pend') + '">' +
                esc(r.status) + '</span></td>' +
              '<td><span class="acts">' +
                (r.status !== 'approved'
                  ? '<button class="btn btn-ghost btn-sm" data-ok="' + esc(r.id) + '">' + I.check +
                    esc(Lang.isAr()?'موافقة':'Approve') + '</button>' : '') +
                (r.status !== 'rejected'
                  ? '<button class="btn btn-ghost btn-sm" data-no="' + esc(r.id) + '">' + I.ban +
                    esc(Lang.isAr()?'رفض':'Reject') + '</button>' : '') +
                '<button class="btn btn-danger btn-sm" data-rm="' + esc(r.id) + '">' + I.trash + '</button>' +
              '</span></td></tr>';
          }).join('') + '</tbody></table></div>'
        : '<p style="padding:var(--s-4);color:var(--muted)">' + esc(Lang.isAr()
            ? 'لا توجد تقييمات مرسلة بعد. سجّل الدخول كولي أمر واكتب تقييماً لتجربة المراجعة.'
            : 'No parent submissions yet. Sign in as a parent and post a review to see moderation in action.') + '</p>') +
    '</div>';

  const setStatus = (id,status)=>{
    const arr = store.get(K.reviews,[]);
    const r = arr.find(x => x.id === id);
    if(r){ r.status = status; store.set(K.reviews,arr); }
    A.shell();
  };
  $$('[data-ok]').forEach(b => b.addEventListener('click', ()=>{
    setStatus(b.dataset.ok,'approved'); toast(Lang.isAr()?'تم النشر':'Review published');
  }));
  $$('[data-no]').forEach(b => b.addEventListener('click', ()=>{
    setStatus(b.dataset.no,'rejected'); toast(Lang.isAr()?'تم الرفض':'Review rejected');
  }));
  $$('[data-rm]').forEach(b => b.addEventListener('click', ()=>{
    const arr = store.get(K.reviews,[]).filter(x => x.id !== b.dataset.rm);
    store.set(K.reviews,arr);
    toast(Lang.isAr()?'تم الحذف':'Review deleted');
    A.shell();
  }));
};

/* ============================ users ============================ */

A.users = function(){
  const users = Auth.users();
  const revs  = store.get(K.reviews,[]);
  const favMap = store.get(K.favs,{});

  $('#admBody').innerHTML =
    head(Lang.isAr()?'المستخدمون':'User accounts') +
    '<div class="card-flat"><header><h2>' + users.length + ' ' +
      esc(Lang.isAr()?'حساب':'accounts') + '</h2></header>' +
      '<div class="tbl-scroll"><table class="dtable"><thead><tr>' +
        '<th>' + esc(Lang.isAr()?'الاسم':'Name') + '</th>' +
        '<th>' + esc(Lang.isAr()?'البريد':'Email') + '</th>' +
        '<th>' + esc(Lang.isAr()?'الدور':'Role') + '</th>' +
        '<th>' + esc(Lang.isAr()?'الدخول':'Provider') + '</th>' +
        '<th>' + esc(Lang.isAr()?'تقييمات':'Reviews') + '</th>' +
        '<th>' + esc(t('favourites')) + '</th>' +
        '<th>' + esc(Lang.isAr()?'الحالة':'Status') + '</th>' +
        '<th></th></tr></thead><tbody>' +
        users.map(u => {
          const mine = revs.filter(r => r.userId === u.id).length;
          const favs = (favMap[u.id] || []).length;
          return '<tr><td><div style="display:flex;gap:var(--s-3);align-items:center">' +
              '<span class="avatar">' + esc(u.name[0].toUpperCase()) + '</span>' + esc(u.name) + '</div></td>' +
            '<td>' + esc(u.email) + '</td>' +
            '<td><span class="badge ' + (u.role==='admin'?'badge-gold':'badge-soft') + '">' + esc(u.role) + '</span></td>' +
            '<td>' + esc(u.provider) + '</td>' +
            '<td style="font-family:var(--f-num)">' + mine + '</td>' +
            '<td style="font-family:var(--f-num)">' + favs + '</td>' +
            '<td>' + (u.blocked
              ? '<span class="badge badge-red">' + esc(Lang.isAr()?'محجوب':'blocked') + '</span>'
              : '<span class="badge badge-green">' + esc(Lang.isAr()?'نشط':'active') + '</span>') + '</td>' +
            '<td><span class="acts">' +
              (u.role === 'admin'
                ? '<span style="color:var(--muted);font-size:var(--t--1)">' +
                  esc(Lang.isAr()?'محمي':'protected') + '</span>'
                : '<button class="btn btn-ghost btn-sm" data-block="' + esc(u.id) + '">' +
                  (u.blocked ? I.check + esc(Lang.isAr()?'إلغاء الحجب':'Unblock')
                             : I.ban + esc(Lang.isAr()?'حجب':'Block')) + '</button>' +
                  '<button class="btn btn-danger btn-sm" data-udel="' + esc(u.id) + '">' + I.trash + '</button>') +
            '</span></td></tr>';
        }).join('') + '</tbody></table></div></div>' +
    '<p class="note" style="text-align:start;margin-top:var(--s-4)">' + esc(Lang.isAr()
      ? 'حساب المدير محمي من الحجب والحذف حتى لا تُقفل اللوحة على نفسها.'
      : 'The administrator account cannot be blocked or deleted — that would lock you out of this dashboard.') + '</p>';

  $$('[data-block]').forEach(b => b.addEventListener('click', ()=>{
    const arr = Auth.users();
    const u = arr.find(x => x.id === b.dataset.block);
    if(u && u.role !== 'admin'){ u.blocked = !u.blocked; Auth.saveUsers(arr); }
    toast(u.blocked ? (Lang.isAr()?'تم الحجب':'User blocked') : (Lang.isAr()?'تم إلغاء الحجب':'User unblocked'));
    A.shell();
  }));

  $$('[data-udel]').forEach(b => b.addEventListener('click', ()=>{
    const id = b.dataset.udel;
    const u = Auth.users().find(x => x.id === id);
    if(!u) return;
    openModal(Lang.isAr()?'حذف الحساب':'Delete account',
      '<p>' + esc(Lang.isAr()
        ? 'سيتم حذف حساب "' + u.name + '" وتقييماته ومفضلاته نهائياً.'
        : 'This permanently deletes “' + u.name + '”, their reviews and their saved favourites.') + '</p>' +
      '<div class="modal-foot">' +
        '<button class="btn btn-quiet" data-mclose>' + esc(Lang.isAr()?'إلغاء':'Cancel') + '</button>' +
        '<button class="btn btn-danger" id="udelYes">' + I.trash +
          esc(Lang.isAr()?'حذف':'Delete') + '</button></div>');
    $$('[data-mclose]').forEach(el => el.addEventListener('click', closeModal));
    $('#udelYes').addEventListener('click', ()=>{
      Auth.saveUsers(Auth.users().filter(x => x.id !== id));
      store.set(K.reviews, store.get(K.reviews,[]).filter(r => r.userId !== id));
      const fm = store.get(K.favs,{}); delete fm[id]; store.set(K.favs,fm);
      toast(Lang.isAr()?'تم حذف الحساب':'Account deleted');
      closeModal(); A.shell();
    });
  }));
};

/* ============================ data & reset ============================ */

A.dataView = function(){
  const edits = Data.edits(), added = Data.added(), removed = Data.removed();
  const revs = store.get(K.reviews,[]);

  $('#admBody').innerHTML =
    head(Lang.isAr()?'البيانات وإعادة التعيين':'Data & reset') +

    '<div class="msg msg-info">' + esc(Lang.isAr()
      ? 'التعديلات تُخزّن كطبقة فوق البيانات الأساسية في data.js، لذلك يمكن دائماً الرجوع للأصل.'
      : 'Dashboard edits are stored as a patch layer over the seed catalogue in data.js, so the original is always recoverable.') +
    '</div>' +

    '<div class="stats" style="grid-template-columns:repeat(3,1fr)">' +
      stat('edit',  Object.keys(edits).length, Lang.isAr()?'مدرسة معدّلة':'Schools edited') +
      stat('plus',  added.length,              Lang.isAr()?'مدرسة مضافة':'Schools added') +
      stat('trash', removed.length,            Lang.isAr()?'مدرسة محذوفة':'Schools removed') +
    '</div>' +

    (removed.length
      ? '<div class="card-flat" style="margin-bottom:var(--s-4)"><header><h2>' +
        esc(Lang.isAr()?'المدارس المحذوفة':'Removed schools') + '</h2></header>' +
        '<div class="tbl-scroll"><table class="dtable"><tbody>' +
        removed.map(id => {
          const seed = SCHOOLS.find(s => s.id === id);
          return '<tr><td>' + esc(seed ? seed.name : id) + '</td>' +
            '<td style="text-align:end"><button class="btn btn-ghost btn-sm" data-restore="' + esc(id) + '">' +
            I.check + esc(Lang.isAr()?'استرجاع':'Restore') + '</button></td></tr>';
        }).join('') + '</tbody></table></div></div>'
      : '') +

    '<div class="card-flat"><header><h2>' + esc(Lang.isAr()?'التصدير والاستيراد':'Export & reset') + '</h2></header>' +
      '<div style="padding:var(--s-4);display:grid;gap:var(--s-4)">' +
        '<div><h4>' + esc(Lang.isAr()?'تصدير الكتالوج':'Export the live catalogue') + '</h4>' +
          '<p style="color:var(--muted)">' + esc(Lang.isAr()
            ? 'انسخ الكتالوج الحالي بصيغة JSON — استخدمه لتحديث data.js في النسخة النهائية.'
            : 'Copy the current catalogue as JSON — use it to update data.js for a real deployment.') + '</p>' +
          '<button class="btn btn-ghost" id="expBtn">' + I.layers +
            esc(Lang.isAr()?'إظهار JSON':'Show JSON') + '</button>' +
          '<textarea class="inp" id="expOut" hidden style="margin-top:var(--s-3);min-height:180px;' +
            'font-family:var(--f-num);font-size:var(--t--1)" readonly></textarea></div>' +

        '<div style="border-top:1px solid var(--line);padding-top:var(--s-4)">' +
          '<h4>' + esc(Lang.isAr()?'إعادة التعيين':'Reset stored data') + '</h4>' +
          '<p style="color:var(--muted)">' + esc(Lang.isAr()
            ? 'يمسح التعديلات والتقييمات والحسابات المخزّنة في هذا المتصفح ويعيد البيانات الأساسية.'
            : 'Clears edits, submitted reviews and accounts stored in this browser and restores the seed data.') + '</p>' +
          '<div class="acts">' +
            '<button class="btn btn-danger" data-reset="schools">' +
              esc(Lang.isAr()?'إعادة تعيين المدارس':'Reset school edits') + '</button>' +
            '<button class="btn btn-danger" data-reset="reviews">' +
              esc(Lang.isAr()?'حذف كل التقييمات':'Delete all submitted reviews') +
              ' (' + revs.length + ')</button>' +
            '<button class="btn btn-danger" data-reset="all">' +
              esc(Lang.isAr()?'إعادة تعيين كل شيء':'Reset everything') + '</button>' +
          '</div></div>' +
      '</div></div>';

  $$('[data-restore]').forEach(b => b.addEventListener('click', ()=>{
    store.set(K.removed, Data.removed().filter(x => x !== b.dataset.restore));
    toast(Lang.isAr()?'تم الاسترجاع':'School restored');
    A.shell();
  }));

  $('#expBtn').addEventListener('click', ()=>{
    const out = $('#expOut');
    out.hidden = false;
    out.value = JSON.stringify(Data.all(),null,2);
    out.select();
  });

  $$('[data-reset]').forEach(b => b.addEventListener('click', ()=>{
    const what = b.dataset.reset;
    openModal(Lang.isAr()?'تأكيد':'Are you sure?',
      '<p>' + esc(Lang.isAr()?'لا يمكن التراجع عن هذه العملية.':'This cannot be undone.') + '</p>' +
      '<div class="modal-foot">' +
        '<button class="btn btn-quiet" data-mclose>' + esc(Lang.isAr()?'إلغاء':'Cancel') + '</button>' +
        '<button class="btn btn-danger" id="resYes">' + esc(Lang.isAr()?'تأكيد':'Confirm') + '</button></div>');
    $$('[data-mclose]').forEach(el => el.addEventListener('click', closeModal));
    $('#resYes').addEventListener('click', ()=>{
      if(what === 'schools' || what === 'all'){
        store.del(K.edits); store.del(K.added); store.del(K.removed);
      }
      if(what === 'reviews' || what === 'all') store.del(K.reviews);
      if(what === 'all'){
        store.del(K.users); store.del(K.session); store.del(K.favs);
        store.del(K.compare); store.del(K.views);
        Auth.init();
      }
      toast(Lang.isAr()?'تم إعادة التعيين':'Reset complete');
      closeModal(); A.shell();
    });
  }));
};

/* ============================ modal plumbing ============================ */

function openModal(title,body){
  const m = $('#admModal');
  $('#admModalBox').innerHTML =
    '<header><h2>' + esc(title) + '</h2>' +
    '<button class="icon-btn" data-mclose aria-label="Close">' + I.close + '</button></header>' + body;
  m.classList.add('on');
  $$('[data-mclose]',m).forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', escClose);
}
function closeModal(){
  const m = $('#admModal');
  if(m) m.classList.remove('on');
  document.removeEventListener('keydown', escClose);
}
function escClose(e){ if(e.key === 'Escape') closeModal(); }

global.Admin = A;

})(window);
