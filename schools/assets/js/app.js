/* ============================================================
   KUWAIT SCHOOLS GUIDE — application core
   دليل مدارس الكويت

   Vanilla JS, no dependencies, no build step. Everything that a
   real deployment would put behind an API lives in localStorage
   here (users, sessions, reviews, favourites, admin edits) so the
   whole platform is demonstrable from a static host.

   ⚠ The auth in this file is a PROTOTYPE. Passwords are hashed
   with a non-cryptographic hash and never leave the browser, which
   is fine for a demo and is NOT fine for production — see README.
   ============================================================ */
(function(global){
'use strict';

const $  = (s,r)=> (r||document).querySelector(s);
const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => (
  {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
));

const store = {
  get(k,d){ try{ const v = localStorage.getItem(k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};

const K = {
  users:'ksg_users', session:'ksg_session', admin:'ksg_admin',
  reviews:'ksg_reviews', favs:'ksg_favs', compare:'ksg_compare',
  views:'ksg_views', edits:'ksg_edits', added:'ksg_added',
  removed:'ksg_removed', lang:'ksg_lang'
};

/* ============================ i18n ============================ */

const NAV = [
  ['index.html',        'Home',                'الرئيسية'],
  ['directory.html',    'Schools',             'المدارس'],
  ['american.html',     'American',            'أمريكي'],
  ['british.html',      'British',             'بريطاني'],
  ['kindergarten.html', 'Pre-K & Kindergarten','رياض الأطفال'],
  ['compare.html',      'Compare',             'مقارنة']
];

const T = {
  tagline:        ['Find the right school in Kuwait','اختر المدرسة المناسبة في الكويت'],
  brandSub:       ['Kuwait Schools Guide','دليل مدارس الكويت'],
  login:          ['Login','تسجيل الدخول'],
  logout:         ['Log out','تسجيل الخروج'],
  signup:         ['Sign up','حساب جديد'],
  account:        ['My account','حسابي'],
  favourites:     ['Favourites','المفضلة'],
  favSaved:       ['Saved to your favourites','تم الحفظ في المفضلة'],
  favRemoved:     ['Removed from favourites','تم الحذف من المفضلة'],
  favNeedsLogin:  ['Log in to save favourite schools','سجّل الدخول لحفظ المدارس المفضلة'],
  compare:        ['Compare','مقارنة'],
  compareAdd:     ['Add to compare','أضف للمقارنة'],
  compareFull:    ['You can compare up to 3 schools','يمكنك مقارنة ٣ مدارس كحد أقصى'],
  compareAdded:   ['Added to compare','تمت الإضافة للمقارنة'],
  compareView:    ['Compare now','قارن الآن'],
  compareClear:   ['Clear','مسح'],
  viewProfile:    ['View school','عرض المدرسة'],
  curriculum:     ['Curriculum','المنهج'],
  fees:           ['Annual fees','الرسوم السنوية'],
  feesFrom:       ['Fees from','الرسوم من'],
  grades:         ['Years offered','الصفوف'],
  ages:           ['Ages','الأعمار'],
  location:       ['Location','الموقع'],
  district:       ['District','المنطقة'],
  rating:         ['Parent rating','تقييم أولياء الأمور'],
  reviews:        ['reviews','تقييم'],
  noReviews:      ['No reviews yet','لا توجد تقييمات بعد'],
  perYear:        ['/ year','/ سنوياً'],
  kwd:            ['KWD','د.ك'],
  free:           ['Free','مجاني'],
  map:            ['Open in Google Maps','افتح في خرائط جوجل'],
  locVerified:    ['Address from the school’s website','العنوان من موقع المدرسة'],
  locUnverified:  ['Area only — address not confirmed','المنطقة فقط — العنوان غير مؤكد'],
  locDirectory:   ['Address from a published listing','العنوان من دليل منشور'],
  locAskSchool:   ['We list the district; confirm the exact address with the school.','نعرض المنطقة فقط؛ تأكد من العنوان الدقيق مع المدرسة.'],
  locSource:      ['Source','المصدر'],
  campuses:       ['Campuses','الفروع'],
  campusOne:      ['Campus','الفرع'],
  campusesCount:  ['campuses','فروع'],
  allCampuses:    ['All campuses','كل الفروع'],
  instagram:      ['Instagram','إنستغرام'],
  website:        ['Website','الموقع الإلكتروني'],
  phone:          ['Phone','الهاتف'],
  email:          ['Email','البريد الإلكتروني'],
  searchPlace:    ['School name, district, or curriculum…','اسم المدرسة أو المنطقة أو المنهج…'],
  allCurricula:   ['All curricula','جميع المناهج'],
  allDistricts:   ['All areas','جميع المناطق'],
  anyFee:         ['Any fee','أي رسوم'],
  search:         ['Search','بحث'],
  acSchools:      ['Schools','مدارس'],
  acCurricula:    ['Curricula','مناهج'],
  acAreas:        ['Areas','مناطق'],
  acBrowse:       ['Browse by curriculum','تصفح حسب المنهج'],
  acAllFor:       ['See all results for','كل النتائج عن'],
  acNothing:      ['No school matches that','لا توجد مدرسة مطابقة'],
  acNothingHint:  ['Try a district, a curriculum, or part of the name.','جرّب اسم منطقة أو منهج أو جزءاً من الاسم.'],
  acHint:         ['Use ↑ ↓ to move, Enter to open','استخدم ↑ ↓ للتنقل و Enter للفتح'],
  filters:        ['Filters','التصفية'],
  reset:          ['Reset','إعادة تعيين'],
  results:        ['schools','مدرسة'],
  sortBy:         ['Sort by','ترتيب حسب'],
  sortRating:     ['Highest rated','الأعلى تقييماً'],
  sortFeeLow:     ['Fees: low to high','الرسوم: من الأقل'],
  sortFeeHigh:    ['Fees: high to low','الرسوم: من الأعلى'],
  sortName:       ['Name (A–Z)','الاسم (أ–ي)'],
  noResults:      ['No schools match your filters','لا توجد مدارس تطابق البحث'],
  noResultsHint:  ['Try widening the fee range or clearing a filter.','جرّب توسيع نطاق الرسوم أو إزالة أحد الفلاتر.'],
  feeRange:       ['Maximum annual fee','الحد الأعلى للرسوم السنوية'],
  gradeLevels:    ['Grade levels','المراحل الدراسية'],
  verifyPending:  ['Details pending school confirmation','بيانات في انتظار تأكيد المدرسة'],
  verified:       ['Fees from the school’s website','الرسوم من موقع المدرسة'],
  feesOnRequest:  ['Fees on request','الرسوم عند الطلب'],
  feesNotPublic:  ['This school does not publish its fees','هذه المدرسة لا تنشر رسومها'],
  feesAskSchool:  ['Contact the school for a quote per year group','تواصل مع المدرسة لمعرفة الرسوم لكل صف'],
  feesEstimate:   ['Estimate — not confirmed','تقديري — غير مؤكد'],
  feesUnknown:    ['Fees not found','لم نجد الرسوم'],
  feesUnknownWhy: ['We have not found published fees for this one. Ask them directly.','لم نجد رسوماً منشورة لهذه المدرسة. تواصل معها مباشرة.'],
  feesDirectory:  ['Published fee data','بيانات رسوم منشورة'],
  feeRangeOnly:   ['Published as a range — no per-grade breakdown','منشورة كنطاق — بدون تفصيل لكل صف'],
  feeYearLabel:   ['Academic year','العام الدراسي'],
  feeSourceLabel: ['Source','المصدر'],
  feeExtras:      ['Also payable','مبالغ إضافية'],
  moeNote:        ['Private school fees in Kuwait are set and approved by the Ministry of Education, so they can change year to year.','رسوم المدارس الخاصة في الكويت تُحدَّد وتُعتمد من وزارة التربية، وقد تتغير من سنة إلى أخرى.'],
  featured:       ['Featured','مميزة'],
  topRated:       ['Top rated','الأعلى تقييماً'],
  about:          ['About the school','عن المدرسة'],
  facilities:     ['Facilities','المرافق'],
  photos:         ['Photos','الصور'],
  contact:        ['Contact','التواصل'],
  atAGlance:      ['At a glance','نظرة سريعة'],
  feesTable:      ['Fees by grade level','الرسوم حسب المرحلة'],
  gradeBand:      ['Grade level','المرحلة'],
  annualFee:      ['Annual fee','الرسوم السنوية'],
  founded:        ['Founded','سنة التأسيس'],
  gender:         ['Intake','نوع القبول'],
  languages:      ['Languages','اللغات'],
  accreditation:  ['Accreditation','الاعتماد'],
  transport:      ['School bus','النقل المدرسي'],
  yes:            ['Available','متوفر'],
  no:             ['Not available','غير متوفر'],
  writeReview:    ['Write a review','اكتب تقييماً'],
  yourRating:     ['Your rating','تقييمك'],
  yourReview:     ['Your review','تقييمك المكتوب'],
  reviewPlace:    ['What should other parents know about teaching, facilities, safety and communication?','ما الذي يجب أن يعرفه أولياء الأمور عن التعليم والمرافق والأمان والتواصل؟'],
  whatStood:      ['What stood out?','ما أبرز ما لاحظته؟'],
  submitReview:   ['Submit review','إرسال التقييم'],
  reviewThanks:   ['Thank you — your review is awaiting moderation','شكراً لك — تقييمك في انتظار المراجعة'],
  reviewGate:     ['Log in to write a review','سجّل الدخول لكتابة تقييم'],
  reviewGateWhy:  ['We only publish reviews from signed-in parents. It keeps this directory honest.','ننشر التقييمات من الحسابات المسجلة فقط، للحفاظ على مصداقية الدليل.'],
  needRating:     ['Please choose a star rating','يرجى اختيار تقييم بالنجوم'],
  needText:       ['Please write at least 20 characters','يرجى كتابة ٢٠ حرفاً على الأقل'],
  pendingOwn:     ['Awaiting moderation','في انتظار المراجعة'],
  parentReviews:  ['Parent reviews','تقييمات أولياء الأمور'],
  basedOn:        ['based on','بناءً على'],
  suggestEdit:    ['Suggest a correction','اقترح تصحيحاً'],
  backToDir:      ['All schools','كل المدارس'],
  emptyFavs:      ['You have not saved any schools yet','لم تحفظ أي مدرسة بعد'],
  emptyFavsHint:  ['Tap the heart on any school card to save it here.','اضغط على القلب في أي مدرسة لحفظها هنا.'],
  emptyCmp:       ['Pick schools to compare','اختر مدارس للمقارنة'],
  emptyCmpHint:   ['Add up to 3 schools from the directory and see their fees, curriculum and ratings side by side.','أضف حتى ٣ مدارس من الدليل وقارن الرسوم والمنهج والتقييم جنباً إلى جنب.'],
  lowestFee:      ['Lowest fees','أقل رسوم'],
  highestRated:   ['Highest rated','أعلى تقييم'],
  dataNotice:     [DATA_NOTICE.en, DATA_NOTICE.ar],
  footerAbout:    ['An independent directory of private schools in Kuwait — curricula, fees, locations and honest parent reviews, in one place.','دليل مستقل للمدارس الخاصة في الكويت — المناهج والرسوم والمواقع وتقييمات أولياء الأمور في مكان واحد.'],
  browse:         ['Browse','تصفح'],
  account2:       ['Account','الحساب'],
  info:           ['Information','معلومات'],
  admin:          ['Admin','الإدارة'],
  allRights:      ['Not affiliated with the Ministry of Education. Fees and details must be confirmed with each school.','غير تابع لوزارة التربية. يجب تأكيد الرسوم والبيانات مع كل مدرسة.'],
  schoolsCount:   ['Schools listed','مدرسة في الدليل'],
  curriculaCount: ['Curricula','منهج دراسي'],
  areasCount:     ['Areas covered','منطقة'],
  reviewsCount:   ['Parent reviews','تقييم من أولياء الأمور']
};

const Lang = {
  get(){ return store.get(K.lang,'en') === 'ar' ? 'ar' : 'en'; },
  isAr(){ return this.get() === 'ar'; },
  set(v){ store.set(K.lang, v === 'ar' ? 'ar' : 'en'); location.reload(); },
  toggle(){ this.set(this.isAr() ? 'en' : 'ar'); }
};

/* t('key') → the string in the active language */
function t(key){
  const pair = T[key];
  if(!pair) return key;
  return Lang.isAr() ? pair[1] : pair[0];
}
/* label for a data object carrying {en, ar} */
function lbl(o){ return o ? (Lang.isAr() ? (o.ar || o.en) : o.en) : ''; }
/* a school's display name in the active language */
function schoolName(s){ return Lang.isAr() && s.nameAr ? s.nameAr : s.name; }

/* ============================ icons ============================ */

const I = {
  cap:'<svg viewBox="0 0 24 24"><path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M6 11.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5"/><path d="M22 9v6"/></svg>',
  menu:'<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  pin:'<svg viewBox="0 0 24 24"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  heart:'<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.6 12 20 12 20Z"/></svg>',
  scales:'<svg viewBox="0 0 24 24"><path d="M12 4v16M7 20h10M5 8h14M5 8l-3 6h6L5 8Zm14 0-3 6h6l-3-6Z"/></svg>',
  user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.4 3.1-5.6 7-5.6s7 2.2 7 5.6"/></svg>',
  ig:'<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4.6"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none"/></svg>',
  globe:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5S14.4 19.7 12 20.5c-2.4-.8-3.6-3.7-3.6-8.5S9.6 5.8 12 3.5Z"/></svg>',
  phone:'<svg viewBox="0 0 24 24"><path d="M5 3h3.5l1.8 4.4-2.2 1.6a11.5 11.5 0 0 0 5.9 5.9l1.6-2.2L20 14.5V18a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 6.2 2 2 0 0 1 5 3Z"/></svg>',
  mail:'<svg viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="m4 7 8 5.5L20 7"/></svg>',
  cal:'<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2.4"/><path d="M3.5 10h17M8 3.5V6M16 3.5V6"/></svg>',
  wallet:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2.4"/><path d="M3 10h18M16.5 14.5h1.5"/></svg>',
  layers:'<svg viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5 9-5Zm9 9-9 5-9-5"/></svg>',
  bus:'<svg viewBox="0 0 24 24"><rect x="4" y="4.5" width="16" height="12" rx="2.2"/><path d="M4 11h16M8 20v-1.5M16 20v-1.5"/><circle cx="8" cy="18" r="1.4"/><circle cx="16" cy="18" r="1.4"/></svg>',
  star:'<svg viewBox="0 0 24 24"><path d="m12 3.6 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9L12 3.6Z"/></svg>',
  lock:'<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg>',
  info:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.6"/></svg>',
  building:'<svg viewBox="0 0 24 24"><rect x="4.5" y="3.5" width="15" height="17" rx="1.8"/><path d="M8.5 8h2M13.5 8h2M8.5 12h2M13.5 12h2M10.5 20.5v-4h3v4"/></svg>',
  users:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 5.5a3.2 3.2 0 0 1 0 6.4M18 19c0-2-.7-3.6-2-4.6"/></svg>',
  chat:'<svg viewBox="0 0 24 24"><path d="M4 5.5h16v10H9l-5 4v-14Z"/></svg>',
  eye:'<svg viewBox="0 0 24 24"><path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  chart:'<svg viewBox="0 0 24 24"><path d="M4 20V4M4 20h16M8 20v-6M13 20v-10M18 20v-4"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  edit:'<svg viewBox="0 0 24 24"><path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="m14 6 4 4"/></svg>',
  trash:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>',
  ban:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="m6 18 12-12"/></svg>',
  out:'<svg viewBox="0 0 24 24"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 8l-4 4 4 4M6 12h9"/></svg>',
  google:'<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.36-.18-2H12v3.79h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.22c1.88-1.73 2.96-4.28 2.96-7.31Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.6-2.43l-3.22-2.5c-.9.6-2.04.95-3.38.95a5.94 5.94 0 0 1-5.58-4.1H3.08v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.42 13.92a6 6 0 0 1 0-3.84V7.49H3.08a10 10 0 0 0 0 9.02l3.34-2.59Z"/><path fill="#EA4335" d="M12 6.06c1.47 0 2.79.5 3.83 1.5l2.85-2.85A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.92 5.49l3.34 2.59A5.94 5.94 0 0 1 12 6.06Z"/></svg>',
  apple:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.4 12.7c0-2.3 1.87-3.4 1.95-3.45-1.06-1.56-2.71-1.77-3.3-1.8-1.4-.14-2.73.82-3.44.82-.72 0-1.81-.8-2.98-.78-1.53.02-2.95.89-3.74 2.26-1.6 2.78-.41 6.89 1.14 9.15.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.02-1.12 2.77-2.23.87-1.27 1.23-2.5 1.25-2.57-.03-.01-2.4-.92-2.46-3.68ZM14.2 5.9c.63-.76 1.05-1.82.94-2.87-.93.04-2.05.62-2.7 1.38-.59.67-1.09 1.75-.95 2.78 1.03.08 2.09-.52 2.71-1.29Z"/></svg>'
};

/* ============================ ratings ============================ */

/* Half-star fills need an SVG gradient in the document. Injected once. */
function ensureStarDefs(){
  if($('#ksgDefs')) return;
  const d = document.createElement('div');
  d.id = 'ksgDefs';
  d.setAttribute('aria-hidden','true');
  d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = '<svg><defs><linearGradient id="halfGrad">' +
    '<stop offset="50%" stop-color="#E0A93B"/><stop offset="50%" stop-color="#DDE6EE"/>' +
    '</linearGradient></defs></svg>';
  document.body.appendChild(d);
}

const STAR_PATH = 'm12 3.6 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9L12 3.6Z';

function starsHTML(value, big){
  let out = '<span class="stars' + (big ? ' stars-lg' : '') + '" aria-hidden="true">';
  for(let i=1;i<=5;i++){
    const cls = value >= i - 0.25 ? 's-full' : (value >= i - 0.75 ? 's-half' : 's-none');
    out += '<svg viewBox="0 0 24 24"><path class="' + cls + '" d="' + STAR_PATH + '"/></svg>';
  }
  return out + '</span>';
}

/* ============================ data access ============================ */
/* Seed catalogue + admin overrides. Admin edits never mutate data.js;
   they are stored as a patch layer so the seed stays reproducible. */

const Data = {
  edits(){ return store.get(K.edits,{}); },
  added(){ return store.get(K.added,[]); },
  removed(){ return store.get(K.removed,[]); },

  all(){
    const edits = this.edits(), removed = this.removed();
    const seed = SCHOOLS
      .filter(s => removed.indexOf(s.id) < 0)
      .map(s => edits[s.id] ? Object.assign({},s,edits[s.id]) : s);
    return seed.concat(this.added().filter(s => removed.indexOf(s.id) < 0));
  },
  byId(id){ return this.all().find(s => s.id === id) || null; },

  /* Published reviews are approved parent submissions only. The seed array is
     empty on every school by design and is folded in purely so an imported
     catalogue that does carry reviews would still render. */
  reviewsFor(id){
    const s = this.byId(id);
    const seed = (s && s.reviews ? s.reviews : []).map(r => Object.assign({ seed:true, status:'approved' }, r));
    const user = store.get(K.reviews,[])
      .filter(r => r.schoolId === id && r.status === 'approved');
    return seed.concat(user).sort((a,b) => (b.date||'').localeCompare(a.date||''));
  },
  /* including the signed-in user's own pending review, so they can see it */
  reviewsForViewer(id){
    const published = this.reviewsFor(id);
    const me = Auth.current();
    if(!me) return published;
    const mine = store.get(K.reviews,[])
      .filter(r => r.schoolId === id && r.status === 'pending' && r.userId === me.id);
    return mine.concat(published);
  },
  rating(id){
    const r = this.reviewsFor(id);
    if(!r.length) return { avg:0, count:0 };
    return { avg: r.reduce((n,x)=>n+x.rating,0) / r.length, count:r.length };
  },

  /* view counter — drives "most viewed" in the admin dashboard */
  countView(id){
    const v = store.get(K.views,{});
    v[id] = (v[id] || 0) + 1;
    store.set(K.views,v);
  },
  views(){ return store.get(K.views,{}); }
};

/* ============================ auth ============================ */

/* Non-cryptographic hash (FNV-1a, 64-bit-ish via two rounds). The point is
   only that plaintext is not sitting in localStorage; it is NOT security.
   Replace with a server + bcrypt/argon2 before launch. */
function hash(str){
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for(let i=0;i<str.length;i++){
    const c = str.charCodeAt(i);
    h1 = ((h1 ^ c) * 0x01000193) >>> 0;
    h2 = ((h2 + c) * 0x85ebca6b) >>> 0;
  }
  return h1.toString(16) + h2.toString(16);
}

const ADMIN_SEED = { email:'admin@kuwaitschools.kw', pass:'admin1234', name:'Site Administrator' };

const Auth = {
  users(){ return store.get(K.users,[]); },
  saveUsers(v){ store.set(K.users,v); },

  /* seed the administrator account and two demo parents on first run */
  init(){
    let u = this.users();
    if(!u.length){
      u = [
        { id:'u_admin', name:ADMIN_SEED.name, email:ADMIN_SEED.email, pass:hash(ADMIN_SEED.pass),
          role:'admin', blocked:false, provider:'email', created:'2026-01-01' },
        { id:'u_demo1', name:'Noura Al-Sabah', email:'noura@example.com', pass:hash('parent123'),
          role:'parent', blocked:false, provider:'email', created:'2026-02-14' },
        { id:'u_demo2', name:'David Whitfield', email:'david@example.com', pass:hash('parent123'),
          role:'parent', blocked:false, provider:'google', created:'2026-03-08' }
      ];
      this.saveUsers(u);
    }
    return u;
  },

  current(){
    const s = store.get(K.session,null);
    if(!s) return null;
    const u = this.users().find(x => x.id === s.userId);
    if(!u || u.blocked){ store.del(K.session); return null; }
    return u;
  },
  isAdmin(){ return !!store.get(K.admin,null) },

  signup(name,email,pass){
    name = String(name||'').trim();
    email = String(email||'').trim().toLowerCase();
    if(name.length < 2)                     return { err:'Please enter your name.' };
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { err:'Please enter a valid email address.' };
    if(String(pass||'').length < 8)         return { err:'Password must be at least 8 characters.' };
    const users = this.users();
    if(users.some(u => u.email === email))  return { err:'An account with that email already exists.' };
    const u = {
      id:'u_' + Date.now().toString(36), name:name, email:email, pass:hash(pass),
      role:'parent', blocked:false, provider:'email', created:new Date().toISOString().slice(0,10)
    };
    users.push(u); this.saveUsers(users);
    store.set(K.session,{ userId:u.id });
    return { user:u };
  },

  login(email,pass){
    email = String(email||'').trim().toLowerCase();
    const u = this.users().find(x => x.email === email);
    if(!u || u.pass !== hash(String(pass||''))) return { err:'Email or password is incorrect.' };
    if(u.blocked) return { err:'This account has been suspended. Contact support.' };
    store.set(K.session,{ userId:u.id });
    return { user:u };
  },

  /* Social sign-in is SIMULATED — there is no OAuth backend in a static
     build. It creates or reuses a local account for a fixed demo identity. */
  social(provider){
    const demo = provider === 'google'
      ? { name:'David Whitfield', email:'david@example.com' }
      : { name:'Apple Parent',    email:'parent@icloud.example' };
    const users = this.users();
    let u = users.find(x => x.email === demo.email);
    if(!u){
      u = { id:'u_' + Date.now().toString(36), name:demo.name, email:demo.email, pass:hash(Math.random()+''),
            role:'parent', blocked:false, provider:provider, created:new Date().toISOString().slice(0,10) };
      users.push(u); this.saveUsers(users);
    }
    if(u.blocked) return { err:'This account has been suspended.' };
    store.set(K.session,{ userId:u.id });
    return { user:u, demo:true };
  },

  logout(){ store.del(K.session); },
  adminLogin(email,pass){
    const u = this.users().find(x => x.email === String(email||'').trim().toLowerCase());
    if(!u || u.role !== 'admin' || u.pass !== hash(String(pass||''))) {
      return { err:'Those administrator credentials are not recognised.' };
    }
    store.set(K.admin,{ userId:u.id, at:Date.now() });
    return { user:u };
  },
  adminLogout(){ store.del(K.admin); }
};

/* ============================ favourites & compare ============================ */

const Favs = {
  key(){ const u = Auth.current(); return u ? u.id : null; },
  all(){ const k = this.key(); if(!k) return []; return (store.get(K.favs,{})[k]) || []; },
  has(id){ return this.all().indexOf(id) >= 0; },
  toggle(id){
    const k = this.key();
    if(!k){ toast(t('favNeedsLogin')); return null; }
    const map = store.get(K.favs,{});
    const list = map[k] || [];
    const i = list.indexOf(id);
    if(i >= 0) list.splice(i,1); else list.push(id);
    map[k] = list; store.set(K.favs,map);
    toast(i >= 0 ? t('favRemoved') : t('favSaved'));
    paintChrome();
    return i < 0;
  }
};

const Compare = {
  MAX:3,
  all(){ return store.get(K.compare,[]).filter(id => !!Data.byId(id)) },
  has(id){ return this.all().indexOf(id) >= 0 },
  toggle(id){
    const list = this.all();
    const i = list.indexOf(id);
    if(i >= 0){ list.splice(i,1); }
    else{
      if(list.length >= this.MAX){ toast(t('compareFull')); return false; }
      list.push(id); toast(t('compareAdded'));
    }
    store.set(K.compare,list);
    paintChrome(); paintCompareBar();
    return i < 0;
  },
  clear(){ store.set(K.compare,[]); paintChrome(); paintCompareBar(); }
};

/* ============================ small UI helpers ============================ */

function toast(msg){
  let el = $('#toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'toast'; el.className = 'toast'; el.setAttribute('role','status');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> el.classList.remove('on'), 2600);
}

function kwd(n){
  if(n === 0) return t('free');
  return Number(n).toLocaleString('en-US') + ' ' + t('kwd');
}
/* one place decides how a school's fee headline reads, whatever shape its
   data is in — per-band, range-only, or not published at all */
function feeHeadline(s){
  const r = feeRange(s);
  if(!r.known) return s.feeBasis === 'unknown' ? t('feesUnknown') : t('feesOnRequest');
  if(r.min === r.max) return kwd(r.min);
  return kwd(r.min) + ' – ' + kwd(r.max);
}
/* how well do we know where this school actually is? */
function locBadge(s){
  /* Three states, not two: an address from the school itself, one from a
     published listing that names a street, and a bare district. Collapsing
     the middle one into "not confirmed" would understate what we know. */
  if(s.locationBasis === 'school')
    return '<span class="badge badge-green">' + esc(t('locVerified')) + '</span>';
  if(s.locationBasis === 'directory')
    return '<span class="badge badge-soft">' + esc(t('locDirectory')) + '</span>';
  return '<span class="badge badge-pend">' + esc(t('locUnverified')) + '</span>';
}

/* the provenance chip shown on cards and profiles */
function feeBadge(s){
  if(s.feeBasis === 'school')     return '<span class="badge badge-green">' + esc(t('verified')) + '</span>';
  if(s.feeBasis === 'on-request') return '<span class="badge badge-soft">' + esc(t('feesOnRequest')) + '</span>';
  if(s.feeBasis === 'directory')  return '<span class="badge badge-soft">' + esc(t('feesDirectory')) + '</span>';
  /* 'unknown' is distinct from 'estimate': there is no figure at all, rather
     than a figure we invented. Saying so is the honest option. */
  if(s.feeBasis === 'unknown')    return '<span class="badge badge-pend">' + esc(t('feesUnknown')) + '</span>';
  return '<span class="badge badge-pend">' + esc(t('feesEstimate')) + '</span>';
}
function fmtDate(iso){
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  if(isNaN(d)) return iso;
  return d.toLocaleDateString(Lang.isAr() ? 'ar-KW' : 'en-GB', { year:'numeric', month:'short', day:'numeric' });
}
function initials(s){
  if(s.abbr) return s.abbr.slice(0,5);
  return s.name.split(/\s+/).filter(w=>w.length>2).slice(0,3).map(w=>w[0]).join('').toUpperCase();
}
function logoHTML(s,big){
  const th = s.theme || ['#0B2545','#1B6CA8'];
  return '<div class="logo' + (big?' logo-lg':'') + '" style="background:linear-gradient(135deg,' +
    th[0] + ',' + th[1] + ')" role="img" aria-label="' + esc(s.name) + ' logo">' +
    esc(initials(s)) + '</div>';
}
function curBadge(s){
  const c = CURRICULUM_BY_ID[s.curriculum];
  if(!c) return '';
  return '<span class="badge badge-cur" style="background:' + c.color + '">' + esc(lbl(c)) + '</span>';
}
/* The most precise thing we actually know, in order:
     1. coordinates the school itself published
     2. the address from the school's own website, which Google geocodes well
     3. the school's name and district — a search, not a false pin
   Inventing coordinates from a district centre would put the pin in the wrong
   street, which is worse for a parent driving there than no pin at all. */
function mapsQuery(s){
  if(s.lat && s.lng) return s.lat + ',' + s.lng;
  if((s.locationBasis === 'school' || s.locationBasis === 'directory') && s.address)
    return s.name + ', ' + s.address + ', Kuwait';
  return s.name + ', ' + s.district + ', Kuwait';
}
function mapsUrl(s){
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapsQuery(s));
}
/* the same ordering of precision, for one campus of a multi-site school */
function campusMapsUrl(s,c){
  const q = (c.lat && c.lng) ? (c.lat + ',' + c.lng)
          : (c.basis === 'school' && c.address) ? (s.name + ', ' + c.address + ', Kuwait')
          : (s.name + (c.name ? ' ' + c.name : '') + ', ' + c.district + ', Kuwait');
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
}
function mapEmbed(s){
  /* Google's keyless embed endpoint — no API key, no tracking script. */
  return 'https://maps.google.com/maps?q=' + encodeURIComponent(mapsQuery(s)) +
         '&z=' + ((s.lat && s.lng) ? 16 : 14) + '&output=embed';
}
function igUrl(s){
  return s.ig
    ? 'https://www.instagram.com/' + encodeURIComponent(s.ig) + '/'
    : 'https://www.instagram.com/explore/search/keyword/?q=' + encodeURIComponent(s.name);
}

/* ============================ chrome ============================ */

function brandHTML(href){
  return '<a class="brand" href="' + href + '">' +
    '<span class="brand-mark">' + I.cap + '</span>' +
    '<span class="brand-txt"><b>' + (Lang.isAr() ? 'دليل مدارس الكويت' : 'Kuwait Schools') + '</b>' +
    '<span>' + (Lang.isAr() ? 'دليل الأهل' : 'Guide for parents') + '</span></span></a>';
}

function renderHeader(){
  const host = $('#hdr');
  if(!host) return;
  const here = Route.page();
  const user = Auth.current();
  const navLinks = NAV.map(([href,en,ar]) =>
    '<a href="' + href + '"' + (href === here ? ' aria-current="page"' : '') + '>' +
    esc(Lang.isAr() ? ar : en) + '</a>').join('');

  host.className = 'hdr';
  host.innerHTML =
    '<div class="wrap hdr-in">' +
      brandHTML('index.html') +
      '<nav class="nav" aria-label="' + esc(Lang.isAr()?'القائمة الرئيسية':'Main menu') + '">' + navLinks + '</nav>' +
      '<div class="hdr-act">' +
        '<button class="icon-btn lang-btn" id="langBtn" title="' +
          esc(Lang.isAr()?'English':'العربية') + '">' + (Lang.isAr() ? 'EN' : 'ع') + '</button>' +
        '<a class="icon-btn" href="favorites.html" id="favBtn" title="' + esc(t('favourites')) + '">' +
          I.heart + '<span class="pip" id="favPip" hidden></span></a>' +
        '<a class="icon-btn" href="compare.html" id="cmpBtn" title="' + esc(t('compare')) + '">' +
          I.scales + '<span class="pip" id="cmpPip" hidden></span></a>' +
        (user
          ? '<a class="btn btn-ghost btn-sm" href="account.html">' + I.user + '<span>' + esc(user.name.split(' ')[0]) + '</span></a>'
          : '<a class="btn btn-pri btn-sm" href="login.html">' + esc(t('login')) + '</a>') +
        '<button class="icon-btn nav-toggle" id="navToggle" aria-label="' +
          esc(Lang.isAr()?'القائمة':'Menu') + '" aria-expanded="false">' + I.menu + '</button>' +
      '</div>' +
    '</div>';

  /* drawer */
  let dr = $('#drawer');
  if(!dr){
    dr = document.createElement('div');
    dr.id = 'drawer'; dr.className = 'drawer';
    document.body.appendChild(dr);
  }
  dr.innerHTML =
    '<div class="drawer-veil" data-close></div>' +
    '<div class="drawer-panel" role="dialog" aria-modal="true" aria-label="' + esc(Lang.isAr()?'القائمة':'Menu') + '">' +
      '<div class="drawer-head">' + brandHTML('index.html') +
        '<button class="icon-btn" data-close aria-label="' + esc(Lang.isAr()?'إغلاق':'Close') + '">' + I.close + '</button></div>' +
      NAV.map(([href,en,ar]) => '<a href="' + href + '"' + (href === here ? ' aria-current="page"' : '') + '>' +
        esc(Lang.isAr() ? ar : en) + '</a>').join('') +
      '<div class="drawer-sep"></div>' +
      '<a href="favorites.html">' + esc(t('favourites')) + '</a>' +
      (user
        ? '<a href="account.html">' + esc(t('account')) + '</a><a href="#" id="drLogout">' + esc(t('logout')) + '</a>'
        : '<a href="login.html">' + esc(t('login')) + '</a>') +
      '<div class="drawer-sep"></div>' +
      '<a href="admin.html">' + esc(t('admin')) + '</a>' +
    '</div>';

  $('#navToggle').addEventListener('click', ()=>{
    dr.classList.add('on');
    $('#navToggle').setAttribute('aria-expanded','true');
  });
  $$('[data-close]',dr).forEach(el => el.addEventListener('click', ()=>{
    dr.classList.remove('on');
    $('#navToggle').setAttribute('aria-expanded','false');
  }));
  const dl = $('#drLogout');
  if(dl) dl.addEventListener('click', e => { e.preventDefault(); Auth.logout(); Route.go('index.html'); });
  $('#langBtn').addEventListener('click', ()=> Lang.toggle());

  paintChrome();
}

function renderFooter(){
  const host = $('#ftr');
  if(!host) return;
  host.className = 'ftr';
  host.innerHTML =
    '<div class="wrap">' +
      '<div class="ftr-cols">' +
        '<div>' + brandHTML('index.html') +
          '<p style="max-width:34ch">' + esc(t('footerAbout')) + '</p></div>' +
        '<div><h4>' + esc(t('browse')) + '</h4><ul>' +
          '<li><a href="directory.html">' + esc(Lang.isAr()?'كل المدارس':'All schools') + '</a></li>' +
          '<li><a href="american.html">' + esc(Lang.isAr()?'مدارس أمريكية':'American schools') + '</a></li>' +
          '<li><a href="british.html">' + esc(Lang.isAr()?'مدارس بريطانية':'British schools') + '</a></li>' +
          '<li><a href="kindergarten.html">' + esc(Lang.isAr()?'رياض الأطفال':'Pre-K & Kindergarten') + '</a></li>' +
          '<li><a href="compare.html">' + esc(t('compare')) + '</a></li>' +
        '</ul></div>' +
        '<div><h4>' + esc(t('account2')) + '</h4><ul>' +
          '<li><a href="login.html">' + esc(t('login')) + '</a></li>' +
          '<li><a href="login.html?mode=signup">' + esc(t('signup')) + '</a></li>' +
          '<li><a href="favorites.html">' + esc(t('favourites')) + '</a></li>' +
          '<li><a href="account.html">' + esc(t('account')) + '</a></li>' +
        '</ul></div>' +
        '<div><h4>' + esc(t('info')) + '</h4><ul>' +
          '<li><a href="about.html">' + esc(Lang.isAr()?'عن الدليل':'About this guide') + '</a></li>' +
          '<li><a href="about.html#data">' + esc(Lang.isAr()?'مصادر البيانات':'Data & accuracy') + '</a></li>' +
          '<li><a href="admin.html">' + esc(t('admin')) + '</a></li>' +
        '</ul></div>' +
      '</div>' +
      '<div class="ftr-btm"><span>© ' + new Date().getFullYear() + ' Kuwait Schools Guide</span>' +
        '<span style="max-width:60ch">' + esc(t('allRights')) + '</span></div>' +
    '</div>';
}

function paintChrome(){
  const f = Favs.all().length, c = Compare.all().length;
  const fp = $('#favPip'), cp = $('#cmpPip');
  if(fp){ fp.textContent = f; fp.hidden = !f; }
  if(cp){ cp.textContent = c; cp.hidden = !c; }
  /* keep every visible card's heart/scales state in sync */
  $$('.mini.fav').forEach(b => b.classList.toggle('on', Favs.has(b.dataset.id)));
  $$('.mini.cmp').forEach(b => b.classList.toggle('on', Compare.has(b.dataset.id)));
}

/* sticky compare bar, shown on any page once something is selected */
function paintCompareBar(){
  let bar = $('#cmpBar');
  const ids = Compare.all();
  if(!bar){
    bar = document.createElement('div');
    bar.id = 'cmpBar'; bar.className = 'cmp-bar';
    document.body.appendChild(bar);
  }
  if(!ids.length){
    bar.classList.remove('on');
    document.body.classList.remove('body-cmp');
    bar.innerHTML = '';
    return;
  }
  const slots = ids.map(id => {
    const s = Data.byId(id);
    return '<span class="cmp-slot"><span>' + esc(schoolName(s)) + '</span>' +
      '<button data-drop="' + esc(id) + '" aria-label="Remove">&times;</button></span>';
  }).join('');
  const ghosts = Array(Math.max(0,Compare.MAX - ids.length)).fill(
    '<span class="cmp-slot ghost"><span>' + esc(Lang.isAr()?'مدرسة أخرى…':'Add another…') + '</span></span>').join('');

  bar.innerHTML =
    '<div class="wrap cmp-in">' +
      '<div class="cmp-slots">' + slots + ghosts + '</div>' +
      '<a class="btn btn-blue btn-sm" href="compare.html">' + I.scales + esc(t('compareView')) + '</a>' +
      '<button class="btn btn-quiet btn-sm" id="cmpClear" style="color:#B8DCF0">' + esc(t('compareClear')) + '</button>' +
    '</div>';
  bar.classList.add('on');
  document.body.classList.add('body-cmp');
  $$('[data-drop]',bar).forEach(b => b.addEventListener('click', ()=> Compare.toggle(b.dataset.drop)));
  $('#cmpClear').addEventListener('click', ()=> Compare.clear());
}

/* ============================ school card ============================ */

function cardHTML(s,opts){
  opts = opts || {};
  const r  = Data.rating(s.id);
  const fr = feeRange(s);
  const cur = CURRICULUM_BY_ID[s.curriculum];
  const showAges = opts.ages || s.curriculum === 'Early';

  /* Up to three fee bands on the card; the profile shows the full table.
     Schools that publish only a range, or nothing at all, say so instead. */
  const rows = opts.feeRows || 3;
  let bands, more = '';
  if(fr.banded){
    bands = s.fees.slice(0, rows).map(f =>
      '<span class="fee-row' + (f.amount === 0 ? ' free' : '') + '">' +
        '<span>' + esc(f.band) + '</span><span class="amt">' + esc(kwd(f.amount)) + '</span></span>').join('');
    more = s.fees.length > rows
      ? '<span class="fee-row" style="color:var(--muted)"><span>+ ' +
        ((s.fees.length - rows) + (Lang.isAr() ? ' مراحل أخرى' : ' more bands')) + '</span><span></span></span>'
      : '';
  }else if(fr.known){
    bands = '<span class="fee-row"><span>' + esc(s.from + ' – ' + s.to) + '</span>' +
            '<span class="amt">' + esc(kwd(fr.min)) + ' – ' + esc(kwd(fr.max)) + '</span></span>' +
            '<span class="fee-row" style="color:var(--muted)"><span>' + esc(t('feeRangeOnly')) + '</span><span></span></span>';
  }else{
    bands = '<span class="fee-row"><span>' +
      esc(s.feeBasis === 'unknown' ? t('feesUnknownWhy') : t('feesNotPublic')) +
      '</span><span></span></span>';
  }

  return '' +
  '<article class="card" data-school="' + esc(s.id) + '">' +
    '<div class="card-top">' + logoHTML(s) +
      '<div class="card-id">' +
        '<h3><a href="school.html?id=' + encodeURIComponent(s.id) + '">' + esc(schoolName(s)) + '</a></h3>' +
        '<div class="sub">' + curBadge(s) +
          (s.featured ? '<span class="badge badge-gold">' + esc(t('featured')) + '</span>' : '') +
        '</div>' +
        '<div class="rate" style="margin-top:6px">' +
          (r.count
            ? starsHTML(r.avg) + '<b>' + r.avg.toFixed(1) + '</b><span>(' + r.count + ' ' + esc(t('reviews')) + ')</span>'
            : starsHTML(0) + '<span>' + esc(t('noReviews')) + '</span>') +
        '</div>' +
      '</div>' +
    '</div>' +
    '<p class="card-blurb">' + esc(s.blurb) + '</p>' +
    '<div class="card-facts">' +
      '<span class="fact">' + I.layers + '<span>' + esc(t('grades')) + ': <b>' +
        esc(s.from + ' – ' + s.to) + '</b></span></span>' +
      (showAges ? '<span class="fact">' + I.cal + '<span>' + esc(t('ages')) + ': <b>' + esc(s.ages) + '</b></span></span>' : '') +
      '<span class="fact">' + I.pin + '<span>' +
        (campusesOf(s).length > 1
          /* Four branches in three of the same district should read
             "Salmiya · Khaitan", not "Salmiya · Salmiya · Salmiya · Khaitan" —
             the count already says how many there are. */
          ? '<b>' + campusesOf(s).length + ' ' + esc(t('campusesCount')) + '</b>: ' +
            districtsOf(s).map(d => {
              const c = campusesOf(s).find(x => x.district === d);
              return '<a href="' + campusMapsUrl(s,c) + '" target="_blank" rel="noopener noreferrer">' +
                     esc(d) + '</a>';
            }).join(' · ')
          : esc(s.district) + ' · <a href="' + mapsUrl(s) +
            '" target="_blank" rel="noopener noreferrer">' + esc(t('map')) + '</a>') +
        '</span></span>' +
      '<span class="fact">' + I.wallet + '<span>' +
        (fr.known
          ? esc(t('feesFrom')) + ' <b class="kwd">' + esc(kwd(fr.min)) + '</b> ' + esc(t('perYear'))
          : '<b>' + esc(t('feesOnRequest')) + '</b>') +
        '</span></span>' +
    '</div>' +
    '<div class="fee-strip">' +
      '<b style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">' +
        esc(t('fees')) + (s.feeYear ? ' ' + esc(s.feeYear) : '') + ' — ' + esc(t('kwd')) +
        feeBadge(s) +
      '</b>' + bands + more + '</div>' +
    '<div class="card-foot">' +
      '<a class="btn btn-ghost btn-sm" href="school.html?id=' + encodeURIComponent(s.id) + '">' +
        esc(t('viewProfile')) + '</a>' +
      '<span class="cf-links">' +
        '<a class="mini ig" href="' + igUrl(s) + '" target="_blank" rel="noopener noreferrer" title="' +
          esc(t('instagram')) + (s.ig ? ' @' + s.ig : ' — ' + (Lang.isAr()?'بحث':'search')) + '">' + I.ig + '</a>' +
        '<a class="mini" href="' + mapsUrl(s) + '" target="_blank" rel="noopener noreferrer" title="' +
          esc(t('map')) + '">' + I.pin + '</a>' +
        '<button class="mini fav" data-id="' + esc(s.id) + '" title="' + esc(t('favourites')) + '" aria-label="' +
          esc(t('favourites')) + '">' + I.heart + '</button>' +
        '<button class="mini cmp" data-id="' + esc(s.id) + '" title="' + esc(t('compareAdd')) + '" aria-label="' +
          esc(t('compareAdd')) + '">' + I.scales + '</button>' +
      '</span>' +
    '</div>' +
  '</article>';
}

function renderCards(host,list,opts){
  if(!host) return;
  if(!list.length){
    host.className = '';
    host.innerHTML =
      '<div class="empty">' + I.search.replace('<svg','<svg style="stroke:var(--line-2)"') +
      '<h3>' + esc(t('noResults')) + '</h3><p>' + esc(t('noResultsHint')) + '</p></div>';
    return;
  }
  host.className = (opts && opts.gridClass) || 'grid';
  host.innerHTML = list.map(s => cardHTML(s,opts)).join('');
  bindCardActions(host);
}

function bindCardActions(root){
  $$('.mini.fav',root).forEach(b => b.addEventListener('click', ()=> Favs.toggle(b.dataset.id)));
  $$('.mini.cmp',root).forEach(b => b.addEventListener('click', ()=> Compare.toggle(b.dataset.id)));
  paintChrome();
}

/* ============================ search suggestions ============================ */

const AC_MAX = { schools:6, facets:3 };

function acNorm(v){ return String(v == null ? '' : v).toLowerCase().trim(); }

/* How well one school answers what has been typed. Higher wins; 0 excludes.
   The tiers matter more than the numbers: an abbreviation people actually use
   ("BSK") should beat a stray substring match inside somebody else's blurb. */
function scoreSchool(s, q){
  const name = acNorm(s.name), abbr = acNorm(s.abbr), ar = String(s.nameAr || '');
  const dists = districtsOf(s).map(acNorm);
  const dist = dists.join(' '), cur = acNorm(s.curriculum);
  if(abbr && abbr === q)                              return 100;
  if(name.indexOf(q) === 0)                           return 92;
  if(abbr && abbr.indexOf(q) === 0)                   return 88;
  if(name.split(/\s+/).some(w => w.indexOf(q) === 0)) return 80;
  if(name.indexOf(q) >= 0)                            return 70;
  if(ar.indexOf(q) >= 0)                              return 66;
  if(dists.some(d => d.indexOf(q) === 0))             return 55;
  if(dist.indexOf(q) >= 0)                            return 50;
  if(cur.indexOf(q) === 0)                            return 45;
  if((s.extras || []).some(x => acNorm(x).indexOf(q) >= 0)) return 30;
  if(acNorm(s.blurb).indexOf(q) >= 0)                 return 20;
  return 0;
}

/* Suggestions for what has been typed: matching schools first, then the
   curricula and areas that match, as one-tap filters, then an escape hatch
   to the full result list. An empty box offers the curricula instead. */
function suggest(raw){
  const q = acNorm(raw);
  const pool = Data.all();

  if(!q){
    return CURRICULA
      .filter(c => pool.some(x => x.curriculum === c.id))
      .map(c => ({ kind:'curriculum', cur:c, count:pool.filter(x => x.curriculum === c.id).length }));
  }

  const schools = pool
    .map(s => ({ s:s, score:scoreSchool(s,q) }))
    .filter(x => x.score > 0)
    .sort((a,b) =>
      b.score - a.score ||
      Data.rating(b.s.id).count - Data.rating(a.s.id).count ||
      (b.s.featured ? 1 : 0) - (a.s.featured ? 1 : 0) ||
      schoolName(a.s).localeCompare(schoolName(b.s)))
    .slice(0, AC_MAX.schools)
    .map(x => ({ kind:'school', school:x.s }));

  const curricula = CURRICULA
    .filter(c => pool.some(x => x.curriculum === c.id))
    .filter(c => acNorm(c.en).indexOf(q) >= 0 || String(c.ar).indexOf(q) >= 0 || acNorm(c.id).indexOf(q) >= 0)
    .slice(0, AC_MAX.facets)
    .map(c => ({ kind:'curriculum', cur:c, count:pool.filter(x => x.curriculum === c.id).length }));

  const areas = DISTRICTS
    .filter(d => acNorm(d).indexOf(q) >= 0)
    .slice(0, AC_MAX.facets)
    .map(d => ({ kind:'area', value:d,
                 count:pool.filter(x => districtsOf(x).indexOf(d) >= 0).length }));

  const hits = pool.filter(x => matches(x, { q:raw, cur:[], dist:[], gov:[], grp:[], max:null })).length;
  const out = schools.concat(curricula, areas);
  if(hits > schools.length) out.push({ kind:'all', q:raw, count:hits });
  return out;
}

/* highlight the typed run inside a label */
function acMark(text,q){
  const hay = acNorm(text), needle = acNorm(q);
  const i = needle ? hay.indexOf(needle) : -1;
  if(i < 0) return esc(text);
  return esc(text.slice(0,i)) + '<mark>' + esc(text.slice(i, i + needle.length)) +
         '</mark>' + esc(text.slice(i + needle.length));
}

function acRowHTML(item,i,q){
  const id = 'acOpt' + i;
  if(item.kind === 'school'){
    const s = item.school, r = Data.rating(s.id), fr = feeRange(s);
    return '<div class="ac-row" role="option" id="' + id + '" data-i="' + i + '" aria-selected="false">' +
      logoHTML(s) +
      '<span class="ac-main">' +
        '<b>' + acMark(schoolName(s),q) + '</b>' +
        '<span class="ac-sub">' + esc(lbl(CURRICULUM_BY_ID[s.curriculum])) + ' · ' +
          districtsOf(s).map(d => acMark(d,q)).join(' · ') + ' · ' + esc(s.from + ' – ' + s.to) + '</span>' +
      '</span>' +
      '<span class="ac-meta">' +
        (fr.known ? '<span class="ac-fee">' + esc(kwd(fr.min)) + '</span>' : '') +
        (r.count ? '<span class="ac-rate">' + starsHTML(r.avg) + '</span>' : '') +
      '</span>' +
    '</div>';
  }
  if(item.kind === 'curriculum'){
    return '<div class="ac-row" role="option" id="' + id + '" data-i="' + i + '" aria-selected="false">' +
      '<span class="ac-ico" style="background:' + item.cur.color + '">' + I.layers + '</span>' +
      '<span class="ac-main"><b>' + acMark(lbl(item.cur),q) + '</b>' +
        '<span class="ac-sub">' + esc(t('curriculum')) + '</span></span>' +
      '<span class="ac-meta"><span class="ac-count">' + item.count + '</span></span>' +
    '</div>';
  }
  if(item.kind === 'area'){
    return '<div class="ac-row" role="option" id="' + id + '" data-i="' + i + '" aria-selected="false">' +
      '<span class="ac-ico" style="background:var(--blue)">' + I.pin + '</span>' +
      '<span class="ac-main"><b>' + acMark(item.value,q) + '</b>' +
        '<span class="ac-sub">' + esc(t('district')) + '</span></span>' +
      '<span class="ac-meta"><span class="ac-count">' + item.count + '</span></span>' +
    '</div>';
  }
  return '<div class="ac-row ac-all" role="option" id="' + id + '" data-i="' + i + '" aria-selected="false">' +
    '<span class="ac-ico" style="background:var(--navy)">' + I.search + '</span>' +
    '<span class="ac-main"><b>' + esc(t('acAllFor')) + ' “' + esc(item.q) + '”</b></span>' +
    '<span class="ac-meta"><span class="ac-count">' + item.count + '</span></span>' +
  '</div>';
}

/* where selecting a suggestion takes you */
function acTarget(item){
  if(item.kind === 'school')     return 'school.html?id=' + encodeURIComponent(item.school.id);
  if(item.kind === 'curriculum') return 'directory.html?cur=' + encodeURIComponent(item.cur.id);
  if(item.kind === 'area')       return 'directory.html?dist=' + encodeURIComponent(item.value);
  return 'directory.html?q=' + encodeURIComponent(item.q);
}

/* Wire a search input up to a suggestion list.
   opts.onType(value) — optional; called debounced so a results grid on the
   same page can filter live as the visitor types. */
function attachTypeahead(input,opts){
  opts = opts || {};
  if(!input || input.dataset.ac) return;
  input.dataset.ac = '1';

  const panel = document.createElement('div');
  panel.className = 'ac';
  panel.id = 'acPanel';
  panel.setAttribute('role','listbox');
  panel.hidden = true;
  (input.closest('.sb-field') || input.parentNode).appendChild(panel);

  input.setAttribute('role','combobox');
  input.setAttribute('aria-autocomplete','list');
  input.setAttribute('aria-expanded','false');
  input.setAttribute('aria-controls','acPanel');
  input.setAttribute('autocomplete','off');

  let items = [], active = -1;

  function close(){
    panel.hidden = true;
    input.setAttribute('aria-expanded','false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }

  function paint(){
    $$('.ac-row',panel).forEach((row,i) => {
      const on = i === active;
      row.classList.toggle('on',on);
      row.setAttribute('aria-selected', on ? 'true' : 'false');
      if(on){
        input.setAttribute('aria-activedescendant',row.id);
        row.scrollIntoView({ block:'nearest' });
      }
    });
  }

  function open(){
    const q = input.value;
    items = suggest(q);
    if(!items.length){
      panel.innerHTML = '<div class="ac-empty"><b>' + esc(t('acNothing')) + '</b>' +
        '<span>' + esc(t('acNothingHint')) + '</span></div>';
      panel.hidden = false;
      input.setAttribute('aria-expanded','true');
      active = -1;
      return;
    }
    /* group headers, but only where a group actually starts */
    let html = '', last = '';
    items.forEach((item,i) => {
      const group = item.kind === 'school' ? 'acSchools'
                  : item.kind === 'curriculum' ? (acNorm(q) ? 'acCurricula' : 'acBrowse')
                  : item.kind === 'area' ? 'acAreas' : '';
      if(group && group !== last){ html += '<div class="ac-head">' + esc(t(group)) + '</div>'; last = group; }
      html += acRowHTML(item,i,q);
    });
    panel.innerHTML = html + '<div class="ac-foot">' + esc(t('acHint')) + '</div>';
    panel.hidden = false;
    input.setAttribute('aria-expanded','true');
    active = -1;
    $$('.ac-row',panel).forEach(row => {
      row.addEventListener('mouseenter', ()=>{ active = Number(row.dataset.i); paint(); });
      /* mousedown, not click: the input's blur would close the panel first */
      row.addEventListener('mousedown', e => { e.preventDefault(); choose(Number(row.dataset.i)); });
    });
  }

  function choose(i){
    const item = items[i];
    if(!item) return;
    close();
    Route.go(acTarget(item));
  }

  let timer = null;
  input.addEventListener('input', ()=>{
    open();
    if(opts.onType){
      clearTimeout(timer);
      timer = setTimeout(()=> opts.onType(input.value), 220);
    }
  });
  input.addEventListener('focus', open);
  input.addEventListener('blur', ()=> setTimeout(close,140));
  input.addEventListener('keydown', e => {
    if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
      if(panel.hidden){ open(); return; }
      e.preventDefault();
      const n = items.length;
      if(!n) return;
      active = e.key === 'ArrowDown'
        ? (active + 1) % n
        : (active <= 0 ? n - 1 : active - 1);
      paint();
      return;
    }
    if(e.key === 'Enter'){
      if(!panel.hidden && active >= 0){ e.preventDefault(); choose(active); }
      return;
    }
    if(e.key === 'Escape'){
      /* A type="search" input clears itself on Escape, and that fires `input`,
         which would immediately reopen the panel. So follow the usual combobox
         behaviour instead: the first Escape closes the list and keeps what was
         typed, a second Escape clears the box. */
      if(!panel.hidden){
        e.preventDefault();
        e.stopPropagation();
        close();
      }else if(input.value){
        e.preventDefault();
        input.value = '';
        if(opts.onType) opts.onType('');
      }
    }
  });
}

/* ============================ routing ============================ */

/* The multi-page site addresses a page by filename plus query string. The
   single-file bundle serves every page from one document, so the same route
   lives behind the hash instead. Route hides that difference so no page
   controller has to care which build it is running in. */
const Route = {
  spa(){ return document.documentElement.hasAttribute('data-spa'); },
  read(){
    if(this.spa()){
      const h = location.hash.replace(/^#\/?/,'');
      const cut = h.indexOf('?');
      return {
        page:   (cut < 0 ? h : h.slice(0,cut)) || 'index.html',
        params: new URLSearchParams(cut < 0 ? '' : h.slice(cut+1))
      };
    }
    return {
      page:   location.pathname.split('/').pop() || 'index.html',
      params: new URLSearchParams(location.search)
    };
  },
  page(){   return this.read().page; },
  params(){ return this.read().params; },
  /* an href that works in whichever build is running */
  href(target){ return this.spa() ? '#/' + target : target; },
  /* follow a route from script */
  go(target){
    if(this.spa()) location.hash = '#/' + target;
    else location.href = target;
  },
  /* update the address bar in place, without navigating */
  set(page, qs, replace){
    const tail = qs ? '?' + qs : '';
    const url = this.spa() ? '#/' + page + tail : page + tail;
    history[replace ? 'replaceState' : 'pushState']({},'',url);
  }
};

/* ============================ filter engine ============================ */

/* A single query object drives the homepage search, the directory and every
   section page, so the behaviour is identical everywhere. */
const Query = {
  read(){
    const p = Route.params();
    return {
      q:    (p.get('q') || '').trim(),
      cur:  (p.get('cur') || '').split(',').filter(Boolean),
      dist: (p.get('dist') || '').split(',').filter(Boolean),
      gov:  (p.get('gov') || '').split(',').filter(Boolean),
      grp:  (p.get('grp') || '').split(',').filter(Boolean),
      max:  p.get('max') ? Number(p.get('max')) : null,
      sort: p.get('sort') || 'rating'
    };
  },
  write(q,replace){
    const p = new URLSearchParams();
    if(q.q) p.set('q',q.q);
    if(q.cur.length)  p.set('cur',q.cur.join(','));
    if(q.dist.length) p.set('dist',q.dist.join(','));
    if(q.gov.length)  p.set('gov',q.gov.join(','));
    if(q.grp.length)  p.set('grp',q.grp.join(','));
    if(q.max != null && q.max < FEE_CEILING) p.set('max',q.max);
    if(q.sort && q.sort !== 'rating') p.set('sort',q.sort);
    Route.set(Route.page(), p.toString(), replace);
  }
};

function matches(s,q){
  if(q.q){
    const needle = q.q.toLowerCase();
    const hay = [s.name, s.nameAr, s.abbr, s.curriculum, s.blurb,
                 (s.extras||[]).join(' '),
                 campusesOf(s).map(c => c.name + ' ' + c.district + ' ' + c.governorate).join(' ')
                ].join(' ').toLowerCase();
    if(hay.indexOf(needle) < 0) return false;
  }
  if(q.cur.length  && q.cur.indexOf(s.curriculum) < 0) return false;
  /* A school with four campuses should be findable under any of their
     districts, not only whichever one happens to be listed first. */
  if(q.dist.length && !districtsOf(s).some(d => q.dist.indexOf(d) >= 0)) return false;
  if(q.gov.length  && !governoratesOf(s).some(g => q.gov.indexOf(g) >= 0)) return false;
  /* A school that publishes no fees has nothing to compare against, so it is
     excluded once a fee ceiling is set rather than being treated as free. */
  if(q.max != null){
    const r = feeRange(s);
    if(!r.known || r.min > q.max) return false;
  }
  if(q.grp.length){
    const groups = GRADE_GROUPS.filter(g => q.grp.indexOf(g.id) >= 0);
    if(!groups.some(g => coversGroup(s,g))) return false;
  }
  return true;
}

function sortList(list,how){
  const arr = list.slice();
  /* schools with no published fees have no place on a price ladder — park
     them at the end of both directions rather than letting 0 win "cheapest" */
  const lo = s => { const r = feeRange(s); return r.known ? r.min : Infinity; };
  if(how === 'feeLow')  return arr.sort((a,b)=> lo(a) - lo(b));
  if(how === 'feeHigh') return arr.sort((a,b)=>
    (lo(b) === Infinity ? -1 : lo(b)) - (lo(a) === Infinity ? -1 : lo(a)));
  if(how === 'name')    return arr.sort((a,b)=> schoolName(a).localeCompare(schoolName(b)));
  /* default: rating desc, then review count, then featured */
  return arr.sort((a,b)=>{
    const ra = Data.rating(a.id), rb = Data.rating(b.id);
    return (rb.avg - ra.avg) || (rb.count - ra.count) || (b.featured?1:0) - (a.featured?1:0);
  });
}

function applyQuery(q,pool){
  return sortList((pool || Data.all()).filter(s => matches(s,q)), q.sort);
}

/* ============================ boot ============================ */

/* The pages ship with a placeholder origin in their canonical and og:url, so
   the markup does not hard-code one host. Point them at wherever the site is
   actually being served from — the same files go to more than one place. */
function fixCanonical(){
  if(!/^https?:$/.test(location.protocol)) return;
  const here = location.origin + location.pathname;
  const link = document.querySelector('link[rel="canonical"]');
  if(link) link.setAttribute('href', here);
  const og = document.querySelector('meta[property="og:url"]');
  if(og) og.setAttribute('content', here);
}

function boot(){
  Auth.init();
  fixCanonical();
  const l = Lang.get();
  document.documentElement.lang = l;
  document.documentElement.dir  = l === 'ar' ? 'rtl' : 'ltr';
  document.body.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
  ensureStarDefs();
  /* The admin dashboard owns the whole viewport and has its own sidebar, so it
     gets none of the public chrome — not the header, footer or compare bar.
     (Its inline script runs before DOMContentLoaded, so it cannot simply
     remove what this function would otherwise add afterwards.) */
  if(document.getElementById('adminMount')) return;
  translateStatic();
  renderHeader();
  renderFooter();
  paintCompareBar();
}

/* Static page copy carries its Arabic in a data-ar attribute, so the markup
   stays readable and the English is what a crawler sees by default. */
function translateStatic(){
  if(!Lang.isAr()) return;
  $$('[data-ar]').forEach(el => { el.innerHTML = el.getAttribute('data-ar'); });
}

/* public surface used by the page scripts */
global.KSG = {
  $:$, $$:$$, esc:esc, store:store, K:K,
  t:t, lbl:lbl, Lang:Lang, schoolName:schoolName,
  I:I, starsHTML:starsHTML, logoHTML:logoHTML, curBadge:curBadge,
  kwd:kwd, feeHeadline:feeHeadline, feeBadge:feeBadge, fmtDate:fmtDate, initials:initials,
  mapsUrl:mapsUrl, campusMapsUrl:campusMapsUrl, mapsQuery:mapsQuery, mapEmbed:mapEmbed,
  igUrl:igUrl, locBadge:locBadge,
  Data:Data, Auth:Auth, Favs:Favs, Compare:Compare, hash:hash,
  toast:toast, cardHTML:cardHTML, renderCards:renderCards, bindCardActions:bindCardActions,
  suggest:suggest, attachTypeahead:attachTypeahead,
  Query:Query, Route:Route, matches:matches, sortList:sortList, applyQuery:applyQuery,
  paintChrome:paintChrome, paintCompareBar:paintCompareBar, boot:boot,
  ADMIN_SEED:ADMIN_SEED
};

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot);
else boot();

})(window);
