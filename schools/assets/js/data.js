/* ============================================================
   KUWAIT SCHOOLS GUIDE — data layer
   دليل مدارس الكويت

   Dependency-free. This file is the seed catalogue that ships with
   the platform; the admin dashboard writes its edits to localStorage
   and those overrides win at render time (see Store.schools()).

   ⚠ DATA STATUS
   Every record below is SEED data. School names, districts and
   curricula are real; fee figures, phone numbers and some Instagram
   handles are INDICATIVE and must be confirmed with each school
   before this directory is published. Records carry verified:false
   until an administrator confirms them in the dashboard.
   ============================================================ */

const DATA_NOTICE = {
  en: 'Fees and contact details are indicative seed data pending confirmation from each school.',
  ar: 'الرسوم وبيانات التواصل بيانات أولية إرشادية في انتظار تأكيدها من كل مدرسة.'
};

const CURRICULA = [
  { id:'American',  en:'American',        ar:'أمريكي',  color:'#2563eb' },
  { id:'British',   en:'British',         ar:'بريطاني', color:'#7c3aed' },
  { id:'IB',        en:'IB',              ar:'دولي IB', color:'#0d9488' },
  { id:'Indian',    en:'Indian',          ar:'هندي',    color:'#ea580c' },
  { id:'Arabic',    en:'Arabic / Public', ar:'عربي / حكومي', color:'#0369a1' },
  { id:'Early',     en:'Early Years',     ar:'الطفولة المبكرة', color:'#db2777' }
];

const GOVERNORATES = [
  { id:'Capital',   en:'Al Asimah (Capital)', ar:'العاصمة' },
  { id:'Hawalli',   en:'Hawalli',             ar:'حولي' },
  { id:'Farwaniya', en:'Al Farwaniya',        ar:'الفروانية' },
  { id:'Mubarak',   en:'Mubarak Al-Kabeer',   ar:'مبارك الكبير' },
  { id:'Ahmadi',    en:'Al Ahmadi',           ar:'الأحمدي' },
  { id:'Jahra',     en:'Al Jahra',            ar:'الجهراء' }
];

/* Grade ladder — used for the "grades offered" filter and for sorting
   fee bands. Index order matters. */
const GRADE_LADDER = [
  'Nursery','Pre-KG','KG1','KG2',
  'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5',
  'Grade 6','Grade 7','Grade 8','Grade 9',
  'Grade 10','Grade 11','Grade 12'
];

const GRADE_GROUPS = [
  { id:'early',   en:'Pre-K & Kindergarten', ar:'حضانة ورياض أطفال', from:'Nursery',  to:'KG2' },
  { id:'primary', en:'Primary (G1–G5)',      ar:'ابتدائي',            from:'Grade 1',  to:'Grade 5' },
  { id:'middle',  en:'Middle (G6–G8)',       ar:'متوسط',              from:'Grade 6',  to:'Grade 8' },
  { id:'high',    en:'High (G9–G12)',        ar:'ثانوي',              from:'Grade 9',  to:'Grade 12' }
];

const REVIEW_TAGS = [
  { id:'teaching',      en:'Teaching quality', ar:'جودة التعليم' },
  { id:'facilities',    en:'Facilities',       ar:'المرافق' },
  { id:'safety',        en:'Safety',           ar:'الأمان' },
  { id:'communication', en:'Communication',    ar:'التواصل مع الأهل' },
  { id:'value',         en:'Value for fees',   ar:'مقابل الرسوم' }
];

/* ---------------- the catalogue ---------------- */
/* fees[] : { band, from, to, amount }  — amount is KWD per academic year
   ig     : Instagram handle when known, otherwise null → the UI falls back
            to an Instagram keyword search so we never link a wrong account. */

const SCHOOLS = [
/* ===== AMERICAN ===== */
{
  id:'ask', name:'American School of Kuwait', nameAr:'المدرسة الأمريكية بالكويت', abbr:'ASK',
  curriculum:'American', extras:['AP'], gender:'Mixed', founded:1964, verified:false, featured:true,
  district:'Hawalli', governorate:'Hawalli', address:'Block 8, Al-Othman Street, Hawalli',
  lat:29.3320, lng:48.0295, website:'https://www.ask.edu.kw', ig:'americanschoolofkuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic','French'], accreditation:['NEASC','CIS','College Board (AP)'],
  transport:true, theme:['#1e3a8a','#3b82f6'],
  blurb:'One of the oldest American-curriculum schools in Kuwait, with a full AP programme and a large Hawalli campus.',
  about:'Founded in 1964, ASK follows a US college-preparatory programme from kindergarten through Grade 12, with Advanced Placement courses in the upper school. The campus sits in Hawalli and serves a broad international community alongside Kuwaiti families.',
  facilities:['Two swimming pools','Full-size gymnasium','Auditorium (600 seats)','Science and robotics labs','Library and media centre','Outdoor athletics track'],
  fees:[
    { band:'KG1 – KG2',        from:'KG1',      to:'KG2',      amount:3450 },
    { band:'Grade 1 – Grade 5',from:'Grade 1',  to:'Grade 5',  amount:4300 },
    { band:'Grade 6 – Grade 8',from:'Grade 6',  to:'Grade 8',  amount:4850 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:5600 }
  ],
  reviews:[
    { name:'Noura A.', date:'2026-04-18', rating:5, tags:['teaching','facilities'], text:'Our two boys have been here since KG1. The teaching in the elementary school is genuinely strong and the AP options in high school opened up university choices we did not expect. Facilities are the best we have seen in Kuwait.' },
    { name:'Mark T.',  date:'2026-03-02', rating:4, tags:['communication','value'], text:'Excellent academics and a real sense of community. Communication from the front office can be slow during admissions season, and the fees are at the top of the market — but the outcomes justify it for us.' },
    { name:'Dana K.',  date:'2026-01-27', rating:4, tags:['safety','teaching'], text:'Very safe and well-run campus. Pick-up traffic in Hawalli is the one real headache, so budget time for it.' }
  ]
},
{
  id:'ais', name:'American International School', nameAr:'المدرسة الأمريكية العالمية', abbr:'AIS',
  curriculum:'American', extras:['AP'], gender:'Mixed', founded:1994, verified:false, featured:true,
  district:'Maidan Hawalli', governorate:'Hawalli', address:'Maidan Hawalli, Block 2',
  lat:29.3208, lng:48.0247, website:'https://www.ais-kuwait.org', ig:'aiskuwait',
  from:'Pre-KG', to:'Grade 12', ages:'3 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC','College Board (AP)'],
  transport:true, theme:['#0f766e','#14b8a6'],
  blurb:'Large American-curriculum school with an early-years division and a well-established AP track.',
  about:'AIS delivers a US standards-based curriculum from Pre-KG to Grade 12 across a purpose-built campus in Maidan Hawalli. The school is known for a wide activities programme and a sizeable secondary school.',
  facilities:['Indoor swimming pool','Two gymnasiums','Theatre','Design and technology workshop','Cafeteria','Dedicated early-years playground'],
  fees:[
    { band:'Pre-KG – KG2',      from:'Pre-KG',  to:'KG2',      amount:2850 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:3600 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:4100 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:4700 }
  ],
  reviews:[
    { name:'Hessa M.', date:'2026-05-06', rating:5, tags:['teaching','communication'], text:'The homeroom teachers actually know my daughter as a person. Weekly updates through the parent portal mean I am never guessing about how she is doing.' },
    { name:'Ravi S.',  date:'2026-02-14', rating:4, tags:['facilities','value'], text:'Good value compared with the very top tier. The pool and the theatre get real use — my son has been in three productions.' }
  ]
},
{
  id:'uas', name:'Universal American School', nameAr:'المدرسة الأمريكية العالمية الجامعة', abbr:'UAS',
  curriculum:'IB', extras:['American','IB PYP','IB MYP','IB DP'], gender:'Mixed', founded:1976, verified:false, featured:true,
  district:'Bayan', governorate:'Hawalli', address:'Block 12, Bayan',
  lat:29.3037, lng:48.0413, website:'https://www.uas.edu.kw', ig:'uaskuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic','French'], accreditation:['IB World School','NEASC','CIS'],
  transport:true, theme:['#0d9488','#2dd4bf'],
  blurb:'An IB World School running PYP, MYP and the Diploma Programme alongside a US high-school diploma.',
  about:'UAS is one of the longest-standing IB World Schools in Kuwait, offering the Primary Years, Middle Years and Diploma Programmes on a Bayan campus. Students graduate with both an American high-school diploma and, optionally, the IB Diploma.',
  facilities:['Two swimming pools','Sports hall and fitness centre','Black-box theatre','Maker space','IB resource library','Cafeteria'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:3600 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:4500 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:5200 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:6300 }
  ],
  reviews:[
    { name:'Layla F.',  date:'2026-06-01', rating:5, tags:['teaching','value'], text:'The IB Diploma here is the real thing, not a badge. My eldest went into a UK university with credit and, more importantly, she knows how to write and how to argue.' },
    { name:'Ahmed Q.',  date:'2026-03-21', rating:4, tags:['facilities','safety'], text:'Strong campus and very organised. IB workload in DP1 hit hard — worth talking to the counsellors early about subject choices.' },
    { name:'Sara B.',   date:'2025-12-09', rating:5, tags:['communication'], text:'Parent–teacher conferences are properly structured and you leave with an actual plan.' }
  ]
},
{
  id:'bbs', name:'Al-Bayan Bilingual School', nameAr:'مدرسة البيان ثنائية اللغة', abbr:'BBS',
  curriculum:'IB', extras:['American','IB DP','Bilingual'], gender:'Mixed', founded:1977, verified:false, featured:true,
  district:'Hawalli', governorate:'Hawalli', address:'Block 5, Hawalli',
  lat:29.3345, lng:48.0221, website:'https://www.bbs.edu.kw', ig:'bbskuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['IB World School','NEASC','CIS'],
  transport:true, theme:['#166534','#22c55e'],
  blurb:'A genuinely bilingual American/IB school with a strong Arabic programme and an IB Diploma in the high school.',
  about:'BBS was established to give Kuwaiti students a rigorous English-medium education without giving up Arabic and Islamic studies. Instruction is bilingual through the elementary years, and the high school offers the IB Diploma Programme.',
  facilities:['Swimming pool','Two sports halls','Arabic library','Science research labs','Theatre','Art studios'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:3200 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:4100 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:4800 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:5900 }
  ],
  reviews:[
    { name:'Abdullah S.', date:'2026-05-19', rating:5, tags:['teaching','communication'], text:'The only school we found where our children are truly fluent and literate in both languages. Arabic is taught as a serious subject, not an afterthought.' },
    { name:'Maryam H.',   date:'2026-02-02', rating:4, tags:['value','facilities'], text:'Waiting lists are long and admission is competitive. Once you are in, the academic culture is excellent.' }
  ]
},
{
  id:'aca', name:'American Creativity Academy', nameAr:'أكاديمية الإبداع الأمريكية', abbr:'ACA',
  curriculum:'American', extras:['AP','Islamic Studies'], gender:'Separate campuses', founded:1997, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Hawalli and Salmiya campuses',
  lat:29.3286, lng:48.0304, website:'https://www.aca.edu.kw', ig:'aca_kuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC','College Board (AP)'],
  transport:true, theme:['#1d4ed8','#60a5fa'],
  blurb:'American curriculum with an Islamic ethos, running separate boys’ and girls’ campuses from Grade 5 upward.',
  about:'ACA combines a US standards-based curriculum with Arabic and Islamic studies, and separates boys and girls from the upper elementary years. It is one of the larger private school groups in Kuwait by enrolment.',
  facilities:['Sports halls on both campuses','Swimming pool','Prayer halls','Computer and science labs','Libraries','Bus fleet'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:2200 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:2800 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:3200 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:3700 }
  ],
  reviews:[
    { name:'Fatima R.', date:'2026-04-04', rating:4, tags:['teaching','safety'], text:'We chose it for the balance — proper American academics with Quran and Arabic taken seriously. Class sizes in the middle school are on the large side.' },
    { name:'Yousef A.', date:'2025-11-16', rating:4, tags:['value'], text:'Good value for an American curriculum. The bus service is reliable, which matters more than people admit.' }
  ]
},
{
  id:'aus', name:'American United School', nameAr:'المدرسة الأمريكية المتحدة', abbr:'AUS',
  curriculum:'American', extras:['AP','STEAM'], gender:'Mixed', founded:2007, verified:false, featured:false,
  district:'Salmiya', governorate:'Hawalli', address:'Block 12, Salmiya',
  lat:29.3382, lng:48.0704, website:'https://www.aus.edu.kw', ig:'auskuwait',
  from:'Pre-KG', to:'Grade 12', ages:'3 – 18 years',
  languages:['English','Arabic','French'], accreditation:['NEASC','College Board (AP)'],
  transport:true, theme:['#b91c1c','#f87171'],
  blurb:'Modern purpose-built Salmiya campus with a STEAM focus and a growing AP programme.',
  about:'AUS opened in 2007 on a new campus in Salmiya and has grown quickly. The school leans into STEAM, with dedicated engineering and design spaces, alongside a conventional US college-preparatory pathway.',
  facilities:['Indoor pool','Engineering and robotics labs','Rooftop play areas','Auditorium','Art and music suites','Cafeteria'],
  fees:[
    { band:'Pre-KG – KG2',      from:'Pre-KG',  to:'KG2',      amount:2700 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:3400 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:3900 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:4500 }
  ],
  reviews:[
    { name:'Nadia J.', date:'2026-05-28', rating:5, tags:['facilities','teaching'], text:'The robotics and design labs are not decoration — my son is in there every week and came home able to explain a CAD model to me.' },
    { name:'Omar D.',  date:'2026-01-11', rating:3, tags:['communication'], text:'Facilities and teaching are good. Staff turnover in the middle school has been noticeable and we have had three different maths teachers in two years.' }
  ]
},
{
  id:'fsis', name:'Fawzia Sultan International School', nameAr:'مدرسة فوزية السلطان العالمية', abbr:'FSIS',
  curriculum:'American', extras:['Learning support','Small classes'], gender:'Mixed', founded:2010, verified:false, featured:false,
  district:'Rumaithiya', governorate:'Hawalli', address:'Block 11, Rumaithiya',
  lat:29.3095, lng:48.0641, website:'https://www.fsis.edu.kw', ig:'fsiskuwait',
  from:'Pre-KG', to:'Grade 12', ages:'3 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC'],
  transport:true, theme:['#7c2d12','#fb923c'],
  blurb:'Small-by-design American school known for inclusion and structured learning support.',
  about:'FSIS runs deliberately small classes and an integrated learning-support model, making it one of the few schools in Kuwait equipped to serve students with mild to moderate learning differences alongside mainstream peers.',
  facilities:['Learning support centre','Occupational therapy room','Small-group classrooms','Sports hall','Library','Sensory room'],
  fees:[
    { band:'Pre-KG – KG2',      from:'Pre-KG',  to:'KG2',      amount:3100 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:3900 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:4300 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:4800 }
  ],
  reviews:[
    { name:'Huda M.',   date:'2026-06-12', rating:5, tags:['teaching','safety','communication'], text:'After two schools that could not cope with my son’s dyslexia, this one built an actual plan and reviews it with us every term. It changed his relationship with school.' },
    { name:'Peter L.',  date:'2026-03-08', rating:4, tags:['value'], text:'Expensive per child, but you are paying for a 12-to-1 class and specialists on staff.' }
  ]
},
{
  id:'dbs', name:'Dasman Bilingual School', nameAr:'مدرسة دسمان ثنائية اللغة', abbr:'DBS',
  curriculum:'American', extras:['Bilingual','AP'], gender:'Mixed', founded:1996, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Block 6, Hawalli',
  lat:29.3361, lng:48.0192, website:'https://www.dbs.edu.kw', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC'],
  transport:true, theme:['#155e75','#22d3ee'],
  blurb:'Bilingual American school with a strong Arabic stream and a compact, well-run campus.',
  about:'Dasman Bilingual School teaches a US curriculum in English while maintaining a full Arabic and Islamic studies programme, aimed primarily at Kuwaiti families who want both without compromise.',
  facilities:['Sports hall','Swimming pool','Science labs','Arabic and English libraries','Music room','Prayer hall'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:2600 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:3300 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:3700 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:4200 }
  ],
  reviews:[
    { name:'Bader K.', date:'2026-02-25', rating:4, tags:['teaching','communication'], text:'Solid bilingual programme and teachers who reply to emails. Facilities are good but not lavish.' }
  ]
},
{
  id:'kbs', name:'Kuwait Bilingual School', nameAr:'المدرسة الكويتية ثنائية اللغة', abbr:'KBS',
  curriculum:'American', extras:['Bilingual'], gender:'Mixed', founded:2003, verified:false, featured:false,
  district:'Mishref', governorate:'Hawalli', address:'Block 4, Mishref',
  lat:29.2749, lng:48.0672, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC (candidate)'],
  transport:true, theme:['#3730a3','#818cf8'],
  blurb:'Mid-market bilingual American school serving Mishref and the surrounding suburbs.',
  about:'KBS offers an English-medium American curriculum with Arabic and Islamic studies, positioned as an affordable bilingual option for families in the southern Hawalli suburbs.',
  facilities:['Sports courts','Computer labs','Library','Science labs','Cafeteria','Bus service'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:1750 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:2200 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:2500 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:2900 }
  ],
  reviews:[
    { name:'Shaikha N.', date:'2026-04-30', rating:4, tags:['value'], text:'Genuinely affordable for a bilingual school and the teachers care. Do not expect a swimming pool.' },
    { name:'Talal E.',   date:'2025-10-22', rating:3, tags:['facilities','communication'], text:'Academics are fine. The building is tight and the yard gets crowded at break.' }
  ]
},
{
  id:'gas', name:'Gulf American School', nameAr:'مدرسة الخليج الأمريكية', abbr:'GAS',
  curriculum:'American', extras:['AP'], gender:'Mixed', founded:2005, verified:false, featured:false,
  district:'Rumaithiya', governorate:'Hawalli', address:'Block 9, Rumaithiya',
  lat:29.3121, lng:48.0693, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC'],
  transport:true, theme:['#0c4a6e','#38bdf8'],
  blurb:'American curriculum school in Rumaithiya with a focus on university placement.',
  about:'Gulf American School runs a US college-preparatory programme with a dedicated counselling team that works on North American and UK university applications from Grade 10 onward.',
  facilities:['Gymnasium','University counselling centre','Science labs','Library','Art rooms','Cafeteria'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:2100 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:2650 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:3000 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:3500 }
  ],
  reviews:[
    { name:'Reem A.', date:'2026-01-19', rating:4, tags:['teaching','communication'], text:'The college counsellor was the deciding factor for us. She knew exactly which universities would take our transcript seriously.' }
  ]
},
{
  id:'aag', name:'American Academy for Girls', nameAr:'الأكاديمية الأمريكية للبنات', abbr:'AAG',
  curriculum:'American', extras:['Girls only','AP'], gender:'Girls', founded:2000, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Block 4, Hawalli',
  lat:29.3372, lng:48.0268, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC'],
  transport:true, theme:['#9d174d','#f472b6'],
  blurb:'All-girls American curriculum school from kindergarten through Grade 12.',
  about:'AAG serves girls only across all grades, pairing a US curriculum with Arabic and Islamic studies. It appeals to families who want a single-sex environment through the secondary years.',
  facilities:['Girls-only sports hall','Swimming pool','Science labs','Library','Art studio','Prayer hall'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:2050 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:2600 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:2950 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:3400 }
  ],
  reviews:[
    { name:'Amal S.', date:'2026-03-15', rating:5, tags:['safety','teaching'], text:'My daughters are confident here in a way they were not in a mixed school. Strong on Arabic too.' }
  ]
},
{
  id:'kas', name:'Kuwait American School', nameAr:'المدرسة الكويتية الأمريكية', abbr:'KAS',
  curriculum:'American', extras:['AP'], gender:'Mixed', founded:1998, verified:false, featured:false,
  district:'Salmiya', governorate:'Hawalli', address:'Block 10, Salmiya',
  lat:29.3416, lng:48.0781, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC'],
  transport:true, theme:['#0f172a','#64748b'],
  blurb:'Established American-curriculum school in the heart of Salmiya.',
  about:'Kuwait American School delivers a US curriculum from KG1 to Grade 12 on a central Salmiya site, with a long-standing local reputation and a mixed international intake.',
  facilities:['Multi-purpose hall','Science labs','Computer suites','Library','Rooftop courts','Cafeteria'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:1900 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:2400 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:2750 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:3150 }
  ],
  reviews:[
    { name:'Jassim W.', date:'2025-12-18', rating:3, tags:['value','facilities'], text:'Reasonable fees and a convenient location. The campus is showing its age.' }
  ]
},
{
  id:'alrowad', name:'Al Rowad American School', nameAr:'مدرسة الرواد الأمريكية', abbr:'ARAS',
  curriculum:'American', extras:['Bilingual'], gender:'Mixed', founded:2008, verified:false, featured:false,
  district:'Farwaniya', governorate:'Farwaniya', address:'Block 3, Farwaniya',
  lat:29.2775, lng:47.9587, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC (candidate)'],
  transport:true, theme:['#854d0e','#facc15'],
  blurb:'Affordable American curriculum option serving the Farwaniya governorate.',
  about:'Al Rowad American School provides an English-medium US curriculum with Arabic and Islamic studies at fees pitched well below the Hawalli schools, serving families across Farwaniya and Khaitan.',
  facilities:['Sports courts','Science labs','Library','Computer lab','Prayer hall','Bus fleet'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:1350 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:1700 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:1950 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:2250 }
  ],
  reviews:[
    { name:'Mona I.', date:'2026-02-08', rating:4, tags:['value','teaching'], text:'For the price, the teaching is better than I expected. Large classes, but my daughter is happy and reading well.' }
  ]
},

/* ===== BRITISH ===== */
{
  id:'bsk', name:'The British School of Kuwait', nameAr:'المدرسة البريطانية بالكويت', abbr:'BSK',
  curriculum:'British', extras:['IGCSE','A-Level','EYFS'], gender:'Mixed', founded:1978, verified:false, featured:true,
  district:'Salwa', governorate:'Hawalli', address:'Block 10, Salwa',
  lat:29.2879, lng:48.0776, website:'https://www.bsk.edu.kw', ig:'bskkuwait',
  from:'Nursery', to:'Grade 12', ages:'3 – 18 years',
  languages:['English','Arabic','French'], accreditation:['BSO','COBIS','Cambridge International','Edexcel'],
  transport:true, theme:['#581c87','#a855f7'],
  blurb:'The best-known British school in Kuwait — EYFS through IGCSE and A-Level on a large Salwa campus.',
  about:'BSK follows the National Curriculum for England from Early Years to Year 13, leading to IGCSEs and A-Levels. It is a British Schools Overseas inspected school and a member of COBIS, with a substantial expatriate and Kuwaiti intake.',
  facilities:['Two swimming pools','Sports fields and courts','Theatre','Sixth-form centre','Design technology suite','Libraries in each school'],
  fees:[
    { band:'Nursery – KG2 (FS1–FS2)', from:'Nursery',  to:'KG2',      amount:3300 },
    { band:'Years 1 – 6',             from:'Grade 1',  to:'Grade 5',  amount:4400 },
    { band:'Years 7 – 9',             from:'Grade 6',  to:'Grade 8',  amount:5100 },
    { band:'Years 10 – 13',           from:'Grade 9',  to:'Grade 12', amount:6200 }
  ],
  reviews:[
    { name:'Claire D.', date:'2026-05-11', rating:5, tags:['teaching','facilities'], text:'We moved from London and the transition was seamless — same curriculum, same expectations. A-Level results speak for themselves.' },
    { name:'Faisal A.', date:'2026-04-02', rating:4, tags:['communication','value'], text:'Excellent school, top of the fee range. The sixth form is where it really shows its quality.' },
    { name:'Ines P.',   date:'2026-01-08', rating:4, tags:['safety'], text:'Very secure site and well-organised drop-off. Early Years staff are wonderful with settling new starters.' }
  ]
},
{
  id:'kes', name:'Kuwait English School', nameAr:'المدرسة الإنجليزية الكويتية', abbr:'KES',
  curriculum:'British', extras:['IGCSE','A-Level'], gender:'Mixed', founded:1978, verified:false, featured:true,
  district:'Salwa', governorate:'Hawalli', address:'Block 4, Salwa',
  lat:29.2921, lng:48.0698, website:'https://www.kes.edu.kw', ig:'keskuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic','French'], accreditation:['BSO','COBIS','Cambridge International'],
  transport:true, theme:['#1e40af','#93c5fd'],
  blurb:'Long-established British school in Salwa with a strong IGCSE and A-Level record.',
  about:'KES teaches the English National Curriculum through to A-Level, with a reputation built on academic results and a stable, largely British teaching staff.',
  facilities:['Swimming pool','Sports hall','Astroturf pitch','Science labs','Sixth-form study centre','Auditorium'],
  fees:[
    { band:'KG1 – KG2',      from:'KG1',     to:'KG2',      amount:2900 },
    { band:'Years 1 – 6',    from:'Grade 1', to:'Grade 5',  amount:3800 },
    { band:'Years 7 – 9',    from:'Grade 6', to:'Grade 8',  amount:4400 },
    { band:'Years 10 – 13',  from:'Grade 9', to:'Grade 12', amount:5300 }
  ],
  reviews:[
    { name:'Salem G.',  date:'2026-03-27', rating:5, tags:['teaching'], text:'Rigorous in the best sense. My son was pushed hard for his IGCSEs and came out with the grades he needed.' },
    { name:'Emma R.',   date:'2025-11-30', rating:4, tags:['facilities','communication'], text:'Good teaching, slightly dated buildings in the primary block. Reports are detailed and honest.' }
  ]
},
{
  id:'tes', name:'The English School Kuwait', nameAr:'المدرسة الإنجليزية بالكويت', abbr:'TES',
  curriculum:'British', extras:['IGCSE','EYFS'], gender:'Mixed', founded:1953, verified:false, featured:false,
  district:'Shamiya', governorate:'Capital', address:'Block 8, Shamiya',
  lat:29.3466, lng:47.9787, website:'https://www.tes.edu.kw', ig:null,
  from:'Nursery', to:'Grade 11', ages:'3 – 16 years',
  languages:['English','Arabic','French'], accreditation:['BSO','COBIS'],
  transport:true, theme:['#7f1d1d','#ef4444'],
  blurb:'The oldest English-medium school in Kuwait, running from Nursery to IGCSE in Shamiya.',
  about:'Founded in 1953, The English School is the longest-established British school in Kuwait. It runs the English National Curriculum from Early Years to Year 11, finishing with IGCSEs.',
  facilities:['Swimming pool','Playing fields','Library','Science labs','Music and drama rooms','Early Years garden'],
  fees:[
    { band:'Nursery – KG2', from:'Nursery',  to:'KG2',      amount:2500 },
    { band:'Years 1 – 6',   from:'Grade 1',  to:'Grade 5',  amount:3300 },
    { band:'Years 7 – 9',   from:'Grade 6',  to:'Grade 8',  amount:3900 },
    { band:'Years 10 – 11', from:'Grade 9',  to:'Grade 11', amount:4400 }
  ],
  reviews:[
    { name:'Helen M.', date:'2026-02-19', rating:4, tags:['teaching','safety'], text:'Small, personal and kind. The trade-off is no sixth form, so plan the A-Level move in Year 10.' }
  ]
},
{
  id:'nes', name:'The New English School', nameAr:'المدرسة الإنجليزية الجديدة', abbr:'NES',
  curriculum:'British', extras:['IGCSE','A-Level'], gender:'Mixed', founded:1969, verified:false, featured:true,
  district:'Jabriya', governorate:'Hawalli', address:'Block 3, Jabriya',
  lat:29.3172, lng:48.0246, website:'https://www.neskt.com', ig:'nes_kuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic','French'], accreditation:['BSO','COBIS','Cambridge International'],
  transport:true, theme:['#065f46','#34d399'],
  blurb:'Large, academically selective British school in Jabriya with a well-known A-Level programme.',
  about:'NES has run the English National Curriculum in Jabriya since 1969, with entry assessments and a strong record at IGCSE and A-Level. It is one of the largest British schools in the country by enrolment.',
  facilities:['Two swimming pools','Sports halls','Auditorium','Sixth-form block','Science and IT labs','Libraries'],
  fees:[
    { band:'KG1 – KG2',     from:'KG1',     to:'KG2',      amount:2750 },
    { band:'Years 1 – 6',   from:'Grade 1', to:'Grade 5',  amount:3600 },
    { band:'Years 7 – 9',   from:'Grade 6', to:'Grade 8',  amount:4200 },
    { band:'Years 10 – 13', from:'Grade 9', to:'Grade 12', amount:5000 }
  ],
  reviews:[
    { name:'Ghanim T.', date:'2026-06-05', rating:5, tags:['teaching','value'], text:'Academically the strongest value in Kuwait in my view. Entrance test is real — prepare for it.' },
    { name:'Priya N.',  date:'2026-03-12', rating:4, tags:['communication','facilities'], text:'Big school, so you have to be proactive with communication. Once you know the right people it runs well.' }
  ]
},
{
  id:'ges', name:'Gulf English School', nameAr:'مدرسة الخليج الإنجليزية', abbr:'GES',
  curriculum:'British', extras:['IGCSE','A-Level'], gender:'Mixed', founded:1978, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Block 6, Hawalli',
  lat:29.3298, lng:48.0349, website:'https://www.ges.edu.kw', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['BSO','Cambridge International'],
  transport:true, theme:['#134e4a','#5eead4'],
  blurb:'British curriculum school in Hawalli covering KG1 to A-Level.',
  about:'Gulf English School follows the English National Curriculum with IGCSE and A-Level examinations, serving a mixed Kuwaiti and expatriate community in central Hawalli.',
  facilities:['Sports hall','Swimming pool','Science labs','Library','ICT suites','Cafeteria'],
  fees:[
    { band:'KG1 – KG2',     from:'KG1',     to:'KG2',      amount:2200 },
    { band:'Years 1 – 6',   from:'Grade 1', to:'Grade 5',  amount:2900 },
    { band:'Years 7 – 9',   from:'Grade 6', to:'Grade 8',  amount:3300 },
    { band:'Years 10 – 13', from:'Grade 9', to:'Grade 12', amount:3900 }
  ],
  reviews:[
    { name:'Zainab O.', date:'2026-01-24', rating:4, tags:['value','teaching'], text:'Good middle option — proper British curriculum without the top-tier fees.' }
  ]
},
{
  id:'knes', name:'Kuwait National English School', nameAr:'المدرسة الوطنية الإنجليزية', abbr:'KNES',
  curriculum:'British', extras:['IGCSE','A-Level'], gender:'Mixed', founded:1996, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Block 11, Hawalli',
  lat:29.3255, lng:48.0201, website:'https://www.knes.edu.kw', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic','French'], accreditation:['BSO','Cambridge International'],
  transport:true, theme:['#312e81','#a5b4fc'],
  blurb:'British curriculum with a strong languages offer and a compact Hawalli campus.',
  about:'KNES teaches the English National Curriculum to A-Level, with French from the primary years and a well-regarded music programme.',
  facilities:['Sports hall','Music suite','Science labs','Library','Language rooms','Rooftop play area'],
  fees:[
    { band:'KG1 – KG2',     from:'KG1',     to:'KG2',      amount:2000 },
    { band:'Years 1 – 6',   from:'Grade 1', to:'Grade 5',  amount:2600 },
    { band:'Years 7 – 9',   from:'Grade 6', to:'Grade 8',  amount:3000 },
    { band:'Years 10 – 13', from:'Grade 9', to:'Grade 12', amount:3550 }
  ],
  reviews:[
    { name:'Latifa B.', date:'2025-12-02', rating:4, tags:['teaching','communication'], text:'Warm school. My daughter picked up French properly here, which we did not find elsewhere at this price.' }
  ]
},
{
  id:'ces', name:'Cambridge English School', nameAr:'مدرسة كامبريدج الإنجليزية', abbr:'CES',
  curriculum:'British', extras:['IGCSE'], gender:'Mixed', founded:1997, verified:false, featured:false,
  district:'Mangaf', governorate:'Ahmadi', address:'Block 4, Mangaf',
  lat:29.1013, lng:48.1327, website:'', ig:null,
  from:'KG1', to:'Grade 11', ages:'4 – 16 years',
  languages:['English','Arabic'], accreditation:['Cambridge International'],
  transport:true, theme:['#164e63','#67e8f9'],
  blurb:'British curriculum school serving Mangaf, Fahaheel and the Ahmadi governorate.',
  about:'Cambridge English School delivers the English National Curriculum through to IGCSE in the south of Kuwait, where British options are thinner on the ground.',
  facilities:['Sports courts','Science labs','Library','ICT lab','Cafeteria','Bus fleet'],
  fees:[
    { band:'KG1 – KG2',     from:'KG1',     to:'KG2',      amount:1400 },
    { band:'Years 1 – 6',   from:'Grade 1', to:'Grade 5',  amount:1800 },
    { band:'Years 7 – 9',   from:'Grade 6', to:'Grade 8',  amount:2100 },
    { band:'Years 10 – 11', from:'Grade 9', to:'Grade 11', amount:2450 }
  ],
  reviews:[
    { name:'Hamad Y.', date:'2026-04-21', rating:4, tags:['value','safety'], text:'A real relief not to drive to Salwa every morning. Solid school for the money.' }
  ]
},
{
  id:'kies', name:'Kuwait International English School', nameAr:'المدرسة الإنجليزية الدولية الكويتية', abbr:'KIES',
  curriculum:'British', extras:['IGCSE'], gender:'Mixed', founded:2001, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Block 2, Hawalli',
  lat:29.3389, lng:48.0311, website:'', ig:null,
  from:'KG1', to:'Grade 11', ages:'4 – 16 years',
  languages:['English','Arabic'], accreditation:['Cambridge International'],
  transport:true, theme:['#4c1d95','#c4b5fd'],
  blurb:'Affordable British curriculum school in Hawalli through to IGCSE.',
  about:'KIES offers the English National Curriculum at accessible fees, with a mixed intake drawn largely from Hawalli and Salmiya.',
  facilities:['Multi-purpose hall','Science labs','Library','Computer lab','Prayer room','Cafeteria'],
  fees:[
    { band:'KG1 – KG2',     from:'KG1',     to:'KG2',      amount:1250 },
    { band:'Years 1 – 6',   from:'Grade 1', to:'Grade 5',  amount:1600 },
    { band:'Years 7 – 9',   from:'Grade 6', to:'Grade 8',  amount:1850 },
    { band:'Years 10 – 11', from:'Grade 9', to:'Grade 11', amount:2150 }
  ],
  reviews:[
    { name:'Sundus A.', date:'2026-02-27', rating:3, tags:['value','facilities'], text:'Affordable and the staff try hard. Facilities are basic and the classes are full.' }
  ]
},
{
  id:'sabahalsalem-british', name:'Sabah Al Salem British Academy', nameAr:'أكاديمية صباح السالم البريطانية', abbr:'SSBA',
  curriculum:'British', extras:['IGCSE','EYFS'], gender:'Mixed', founded:2014, verified:false, featured:false,
  district:'Sabah Al-Salem', governorate:'Mubarak', address:'Block 5, Sabah Al-Salem',
  lat:29.2564, lng:48.0629, website:'', ig:null,
  from:'Nursery', to:'Grade 9', ages:'3 – 14 years',
  languages:['English','Arabic'], accreditation:['Cambridge International (candidate)'],
  transport:true, theme:['#831843','#f9a8d4'],
  blurb:'Newer British-curriculum school growing year by year, currently to Year 10.',
  about:'A newer entrant in Mubarak Al-Kabeer governorate, adding a year group annually as its first cohort progresses. Currently teaching Early Years to Year 10.',
  facilities:['Early Years garden','Sports hall','Science lab','Library','ICT room','Shaded play areas'],
  fees:[
    { band:'Nursery – KG2', from:'Nursery',  to:'KG2',     amount:1650 },
    { band:'Years 1 – 6',   from:'Grade 1',  to:'Grade 5', amount:2100 },
    { band:'Years 7 – 10',  from:'Grade 6',  to:'Grade 9', amount:2450 }
  ],
  reviews:[
    { name:'Wafa D.', date:'2026-05-02', rating:4, tags:['communication','safety'], text:'Small enough that the head knows every child by name. Being a new school, some things are still being built out.' }
  ]
},

/* ===== INDIAN ===== */
{
  id:'icsk', name:'Indian Community School Kuwait', nameAr:'المدرسة الهندية الكويتية', abbr:'ICSK',
  curriculum:'Indian', extras:['CBSE','Multiple branches'], gender:'Mixed', founded:1964, verified:false, featured:true,
  district:'Khaitan', governorate:'Farwaniya', address:'Khaitan, Amman and Senior branches',
  lat:29.2837, lng:47.9721, website:'https://www.icsk.edu.kw', ig:'icsk_official',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic','Malayalam'], accreditation:['CBSE (New Delhi)'],
  transport:true, theme:['#c2410c','#fdba74'],
  blurb:'The largest Indian school group in Kuwait, CBSE affiliated, across several branches.',
  about:'ICSK has served the Indian community in Kuwait since 1964 and now operates multiple branches under CBSE affiliation, offering Science, Commerce and Humanities streams in the senior secondary years.',
  facilities:['Auditoriums','Sports grounds','Science and computer labs','Libraries','Medical rooms','Large bus fleet'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:620 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:760 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:890 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:1150 }
  ],
  reviews:[
    { name:'Anil V.',    date:'2026-04-09', rating:5, tags:['value','teaching'], text:'Outstanding value. CBSE board results are consistently strong and the maths and science teaching is serious.' },
    { name:'Deepa R.',   date:'2026-02-11', rating:4, tags:['communication'], text:'Large classes, so individual attention depends on the teacher. The parent app works well for circulars and fees.' },
    { name:'Suresh N.',  date:'2025-10-30', rating:4, tags:['safety','facilities'], text:'Well-managed and safe. Sports facilities are shared across a lot of students.' }
  ]
},
{
  id:'faips', name:'FAIPS – DPS Kuwait', nameAr:'مدرسة الفحيحيل الوطنية الهندية', abbr:'FAIPS',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:1996, verified:false, featured:false,
  district:'Fahaheel', governorate:'Ahmadi', address:'Block 8, Fahaheel',
  lat:29.0824, lng:48.1284, website:'https://www.faips.edu.kw', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic'], accreditation:['CBSE (New Delhi)'],
  transport:true, theme:['#9a3412','#fb923c'],
  blurb:'Delhi Public School affiliated CBSE school serving Fahaheel and the south.',
  about:'FAIPS operates under the Delhi Public School Society banner, offering CBSE education from kindergarten to Grade 12 with Science and Commerce streams at senior level.',
  facilities:['Auditorium','Sports ground','Science labs','Computer labs','Library','Bus service'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:580 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:720 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:850 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:1090 }
  ],
  reviews:[
    { name:'Kavita J.', date:'2026-03-05', rating:4, tags:['teaching','value'], text:'Strong CBSE school. My son got into an Indian engineering college straight from here.' }
  ]
},
{
  id:'bhavans', name:'Bhavans SIS – Smart Indian School', nameAr:'مدرسة بهافانز الهندية', abbr:'Bhavans',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:2003, verified:false, featured:false,
  district:'Abbassiya', governorate:'Farwaniya', address:'Block 4, Abbassiya',
  lat:29.2646, lng:47.9603, website:'https://www.bhavanskuwait.com', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic','Malayalam'], accreditation:['CBSE (New Delhi)'],
  transport:true, theme:['#a16207','#fde047'],
  blurb:'Bharatiya Vidya Bhavan affiliated CBSE school in Abbassiya.',
  about:'Bhavans SIS follows the CBSE curriculum with a strong emphasis on Indian cultural programmes, music and classical dance alongside academics.',
  facilities:['Auditorium','Music and dance studios','Science labs','Library','Sports courts','Bus fleet'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:600 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:740 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:870 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:1120 }
  ],
  reviews:[
    { name:'Meera K.', date:'2026-01-30', rating:5, tags:['teaching','facilities'], text:'The cultural programme is what sets it apart — my daughter learned Bharatanatyam here and still topped her class.' }
  ]
},
{
  id:'uis', name:'United Indian School', nameAr:'المدرسة الهندية المتحدة', abbr:'UIS',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:1994, verified:false, featured:false,
  district:'Abbassiya', governorate:'Farwaniya', address:'Block 6, Abbassiya',
  lat:29.2681, lng:47.9648, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic'], accreditation:['CBSE (New Delhi)'],
  transport:true, theme:['#7c2d12','#fdba74'],
  blurb:'Established CBSE school in Abbassiya with low fees and a large student body.',
  about:'United Indian School offers CBSE education from kindergarten to Grade 12 at some of the most accessible fees in Kuwait, serving the working Indian expatriate community.',
  facilities:['Assembly hall','Science labs','Computer lab','Library','Playground','Bus service'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:470 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:580 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:690 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:880 }
  ],
  reviews:[
    { name:'Rajesh P.', date:'2025-11-08', rating:4, tags:['value'], text:'Hard to beat on price and the board results are respectable. Do not expect much in the way of facilities.' }
  ]
},
{
  id:'iis', name:'Integrated Indian School', nameAr:'المدرسة الهندية المتكاملة', abbr:'IIS',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:1996, verified:false, featured:false,
  district:'Abbassiya', governorate:'Farwaniya', address:'Block 8, Abbassiya',
  lat:29.2702, lng:47.9584, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic','Malayalam'], accreditation:['CBSE (New Delhi)'],
  transport:true, theme:['#065f46','#6ee7b7'],
  blurb:'CBSE school in Abbassiya known for consistent Grade 10 and 12 board results.',
  about:'Integrated Indian School runs the CBSE curriculum with Science and Commerce streams, and a track record of solid board examination performance relative to its fee level.',
  facilities:['Science labs','Computer labs','Library','Assembly hall','Sports courts','Bus fleet'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:490 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:610 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:720 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:920 }
  ],
  reviews:[
    { name:'Nisha T.', date:'2026-02-20', rating:4, tags:['teaching','value'], text:'The Grade 12 teachers here are excellent and available after hours. Worth the commute for us.' }
  ]
},
{
  id:'carmel', name:'Carmel School Kuwait', nameAr:'مدرسة الكرمل', abbr:'Carmel',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:1994, verified:false, featured:false,
  district:'Khaitan', governorate:'Farwaniya', address:'Block 4, Khaitan',
  lat:29.2879, lng:47.9756, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic','Malayalam'], accreditation:['CBSE (New Delhi)'],
  transport:true, theme:['#155e75','#a5f3fc'],
  blurb:'CBSE school in Khaitan with a strong pastoral reputation.',
  about:'Carmel School offers CBSE education from KG1 to Grade 12, with a values-led pastoral programme and a long-standing presence in Khaitan.',
  facilities:['Assembly hall','Science labs','Library','Computer lab','Playground','Bus service'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:520 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:640 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:750 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:960 }
  ],
  reviews:[
    { name:'Joseph M.', date:'2026-03-18', rating:5, tags:['safety','communication'], text:'The class teachers call you before a small problem becomes a big one. That is rare.' }
  ]
},
{
  id:'ies', name:'Indian Educational School', nameAr:'المدرسة الهندية التعليمية', abbr:'IES',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:1998, verified:false, featured:false,
  district:'Salmiya', governorate:'Hawalli', address:'Block 3, Salmiya',
  lat:29.3352, lng:48.0663, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic'], accreditation:['CBSE (New Delhi)'],
  transport:true, theme:['#3f6212','#bef264'],
  blurb:'CBSE school with a Salmiya location convenient for Hawalli families.',
  about:'Indian Educational School serves the Indian community in Salmiya and Hawalli with a CBSE curriculum and a shorter commute than the Abbassiya cluster.',
  facilities:['Science labs','Computer lab','Library','Indoor hall','Rooftop play area','Bus service'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:560 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:690 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:810 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:1020 }
  ],
  reviews:[
    { name:'Vinod S.', date:'2026-01-15', rating:4, tags:['value','communication'], text:'Convenient and reasonably priced. The building is cramped but the teaching is fine.' }
  ]
},
{
  id:'gis', name:'Gulf Indian School', nameAr:'مدرسة الخليج الهندية', abbr:'GIS',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:2001, verified:false, featured:false,
  district:'Farwaniya', governorate:'Farwaniya', address:'Block 1, Farwaniya',
  lat:29.2794, lng:47.9558, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic','Malayalam'], accreditation:['CBSE (New Delhi)'],
  transport:true, theme:['#701a75','#f0abfc'],
  blurb:'CBSE school in Farwaniya with a broad Indian-community intake.',
  about:'Gulf Indian School provides CBSE education across all grades with Science and Commerce streams at senior secondary level.',
  facilities:['Assembly hall','Science labs','Computer labs','Library','Sports courts','Bus fleet'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:500 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:620 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:730 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:940 }
  ],
  reviews:[
    { name:'Asha D.', date:'2025-12-27', rating:3, tags:['facilities','value'], text:'Fees are manageable. Classes are very large — 35 plus in my daughter’s section.' }
  ]
},

/* ===== ARABIC / PUBLIC ===== */
{
  id:'moe-public', name:'Ministry of Education Public Schools', nameAr:'المدارس الحكومية — وزارة التربية', abbr:'MOE',
  curriculum:'Arabic', extras:['Government','Free for citizens'], gender:'Separate from Grade 5', founded:1936, verified:false, featured:false,
  district:'All governorates', governorate:'Capital', address:'Ministry of Education, Al Asimah',
  lat:29.3759, lng:47.9774, website:'https://www.moe.edu.kw', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['Arabic','English'], accreditation:['Ministry of Education, Kuwait'],
  transport:false, theme:['#0369a1','#7dd3fc'],
  blurb:'The national Arabic-curriculum school system — free for Kuwaiti citizens, organised by governorate.',
  about:'Kuwait’s public schools follow the national Arabic curriculum set by the Ministry of Education, from kindergarten through Grade 12, with boys and girls separated from the intermediate stage. Tuition is free for Kuwaiti citizens; enrolment is by residential catchment. Non-citizens are admitted only in limited circumstances.',
  facilities:['Governorate-wide network','Sports halls','Science labs','Libraries','Prayer halls','Free textbooks'],
  fees:[
    { band:'KG1 – Grade 12 (Kuwaiti citizens)', from:'KG1', to:'Grade 12', amount:0 }
  ],
  reviews:[
    { name:'Mohammed A.', date:'2026-02-05', rating:4, tags:['value','teaching'], text:'Free, close to home, and the Arabic and Islamic studies are far stronger than any private school. English is the weak point — we top it up privately.' },
    { name:'Sheikha F.',  date:'2025-11-19', rating:3, tags:['facilities','communication'], text:'Varies enormously by school and by principal. Ask other parents about the specific school, not the system.' }
  ]
},
{
  id:'najat', name:'Al-Najat Bilingual School', nameAr:'مدرسة النجاة ثنائية اللغة', abbr:'Najat',
  curriculum:'Arabic', extras:['Bilingual','Islamic Studies'], gender:'Separate campuses', founded:1994, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Block 9, Hawalli',
  lat:29.3312, lng:48.0158, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['Arabic','English'], accreditation:['Ministry of Education, Kuwait'],
  transport:true, theme:['#14532d','#86efac'],
  blurb:'Arabic-curriculum bilingual school with a strong Quran and Islamic studies programme.',
  about:'Al-Najat teaches the Kuwaiti national curriculum with substantially strengthened English, and runs separate boys’ and girls’ sections in the upper grades. Quran memorisation is a formal part of the programme.',
  facilities:['Prayer halls','Quran memorisation centre','Sports halls','Science labs','Libraries','Bus fleet'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:900 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:1150 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:1300 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:1500 }
  ],
  reviews:[
    { name:'Abdulrahman K.', date:'2026-04-14', rating:5, tags:['teaching','safety'], text:'For a family that wants the national curriculum done properly with real Quran teaching, this is the one. English is decent, not brilliant.' }
  ]
},
{
  id:'maali', name:'Al-Maali Bilingual School', nameAr:'مدرسة المعالي ثنائية اللغة', abbr:'Maali',
  curriculum:'Arabic', extras:['Bilingual'], gender:'Separate campuses', founded:2002, verified:false, featured:false,
  district:'Qurtuba', governorate:'Capital', address:'Block 3, Qurtuba',
  lat:29.3283, lng:47.9459, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['Arabic','English'], accreditation:['Ministry of Education, Kuwait'],
  transport:true, theme:['#0e7490','#a5f3fc'],
  blurb:'Bilingual Arabic-curriculum school in Qurtuba serving Capital governorate families.',
  about:'Al-Maali follows the Kuwaiti national curriculum with an enhanced English stream, aimed at Kuwaiti families in the Capital suburbs who want bilingual competence without moving to an international curriculum.',
  facilities:['Sports halls','Science labs','Prayer halls','Libraries','Computer labs','Bus service'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:1000 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:1250 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:1400 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:1650 }
  ],
  reviews:[
    { name:'Dalal H.', date:'2026-01-06', rating:4, tags:['communication','value'], text:'Well organised and the Arabic is strong. Reasonable fees for what you get.' }
  ]
},
{
  id:'rawdat', name:'Rawdat Al-Uloom Bilingual School', nameAr:'مدرسة روضة العلوم ثنائية اللغة', abbr:'RUS',
  curriculum:'Arabic', extras:['Bilingual','Islamic Studies'], gender:'Separate campuses', founded:1999, verified:false, featured:false,
  district:'Jabriya', governorate:'Hawalli', address:'Block 7, Jabriya',
  lat:29.3131, lng:48.0187, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['Arabic','English'], accreditation:['Ministry of Education, Kuwait'],
  transport:true, theme:['#78350f','#fcd34d'],
  blurb:'National-curriculum school in Jabriya with bilingual streams and Quran programmes.',
  about:'Rawdat Al-Uloom teaches the Kuwaiti national curriculum with strengthened English and Quran study, with separate sections for boys and girls in the intermediate and secondary stages.',
  facilities:['Quran centre','Prayer halls','Sports halls','Science labs','Libraries','Bus fleet'],
  fees:[
    { band:'KG1 – KG2',         from:'KG1',     to:'KG2',      amount:850 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5',  amount:1080 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8',  amount:1220 },
    { band:'Grade 9 – Grade 12',from:'Grade 9', to:'Grade 12', amount:1420 }
  ],
  reviews:[
    { name:'Nawal Z.', date:'2025-12-14', rating:4, tags:['teaching'], text:'Good balance of religious studies and academics. English is improving year on year.' }
  ]
},

/* ===== PRE-K & KINDERGARTEN / NURSERIES ===== */
{
  id:'english-playgroup', name:'The English Playgroup', nameAr:'الروضة الإنجليزية', abbr:'TEP',
  curriculum:'Early', extras:['EYFS','Multiple branches'], gender:'Mixed', founded:1978, verified:false, featured:true,
  district:'Multiple branches', governorate:'Hawalli', address:'Branches across Salmiya, Hawalli, Jabriya, Mishref and Fahaheel',
  lat:29.3339, lng:48.0688, website:'https://www.englishplaygroup.com', ig:'englishplaygroup',
  from:'Nursery', to:'KG2', ages:'2 – 6 years',
  languages:['English','Arabic'], accreditation:['EYFS (England)'],
  transport:true, theme:['#be185d','#fbcfe8'],
  blurb:'Kuwait’s largest early-years group — EYFS across a dozen branches, 2 to 6 years.',
  about:'The English Playgroup has been running early-years education in Kuwait since 1978 and now operates branches across most residential areas. It follows the English Early Years Foundation Stage, and feeds into the main British and American primary schools.',
  facilities:['Indoor soft-play halls','Shaded outdoor gardens','Water-play areas','Music rooms','Nap rooms','Nurse on site'],
  fees:[
    { band:'Nursery (2 – 3 yrs)', from:'Nursery', to:'Nursery', amount:1450 },
    { band:'Pre-KG (3 – 4 yrs)',  from:'Pre-KG',  to:'Pre-KG',  amount:1650 },
    { band:'KG1 – KG2 (4 – 6 yrs)',from:'KG1',    to:'KG2',     amount:1900 }
  ],
  reviews:[
    { name:'Rana E.',   date:'2026-05-22', rating:5, tags:['safety','communication'], text:'Both my children started here at two and a half. The staff send photos through the day, which as a first-time mother I needed more than I expected.' },
    { name:'Hussain M.',date:'2026-03-30', rating:4, tags:['facilities','value'], text:'Branch quality varies — visit the specific branch, not the brand. Ours in Mishref is excellent.' }
  ]
},
{
  id:'little-hearts', name:'Little Hearts Nursery', nameAr:'حضانة القلوب الصغيرة', abbr:'LHN',
  curriculum:'Early', extras:['EYFS','Montessori elements'], gender:'Mixed', founded:2010, verified:false, featured:false,
  district:'Salmiya', governorate:'Hawalli', address:'Block 6, Salmiya',
  lat:29.3391, lng:48.0722, website:'', ig:null,
  from:'Nursery', to:'KG1', ages:'1.5 – 4 years',
  languages:['English','Arabic'], accreditation:['Ministry of Social Affairs licence'],
  transport:false, theme:['#c026d3','#f5d0fe'],
  blurb:'Small Salmiya nursery for 18 months to 4 years, with Montessori-influenced rooms.',
  about:'Little Hearts takes children from 18 months and blends EYFS goals with Montessori materials and free-flow play. Deliberately small, with high staff ratios in the youngest rooms.',
  facilities:['Montessori materials','Indoor gym','Shaded garden','Sensory room','Nap rooms','Low staff ratios'],
  fees:[
    { band:'Toddlers (1.5 – 2.5 yrs)', from:'Nursery', to:'Nursery', amount:1250 },
    { band:'Pre-KG (2.5 – 3.5 yrs)',   from:'Pre-KG',  to:'Pre-KG',  amount:1400 },
    { band:'KG1 (3.5 – 4 yrs)',        from:'KG1',     to:'KG1',     amount:1550 }
  ],
  reviews:[
    { name:'Farah A.', date:'2026-04-25', rating:5, tags:['safety','teaching'], text:'One carer for every four toddlers, and they actually know my son’s routine. Worth every dinar at this age.' }
  ]
},
{
  id:'kangaroo', name:'Kangaroo Kids Nursery', nameAr:'حضانة كانجرو كيدز', abbr:'KKN',
  curriculum:'Early', extras:['EYFS'], gender:'Mixed', founded:2013, verified:false, featured:false,
  district:'Jabriya', governorate:'Hawalli', address:'Block 6, Jabriya',
  lat:29.3155, lng:48.0223, website:'', ig:null,
  from:'Nursery', to:'KG2', ages:'2 – 5 years',
  languages:['English','Arabic'], accreditation:['Ministry of Social Affairs licence'],
  transport:false, theme:['#0d9488','#99f6e4'],
  blurb:'Jabriya nursery running EYFS from 2 to 5 years with a large outdoor garden.',
  about:'Kangaroo Kids focuses on outdoor and physical play, with a garden that is unusually large for a Jabriya villa conversion, plus a structured EYFS programme in the KG rooms.',
  facilities:['Large shaded garden','Climbing frames','Water play','Art studio','Nap rooms','Nurse on call'],
  fees:[
    { band:'Nursery (2 – 3 yrs)', from:'Nursery', to:'Nursery', amount:1150 },
    { band:'Pre-KG (3 – 4 yrs)',  from:'Pre-KG',  to:'Pre-KG',  amount:1300 },
    { band:'KG1 – KG2 (4 – 5 yrs)',from:'KG1',    to:'KG2',     amount:1450 }
  ],
  reviews:[
    { name:'Yasmin S.', date:'2026-02-16', rating:4, tags:['facilities','communication'], text:'The garden is the reason we chose it — my daughter is outside twice a day even in spring.' }
  ]
},
{
  id:'sunflower', name:'Sunflower Bilingual Nursery', nameAr:'حضانة عين الشمس ثنائية اللغة', abbr:'SBN',
  curriculum:'Early', extras:['Bilingual','EYFS'], gender:'Mixed', founded:2015, verified:false, featured:false,
  district:'Mishref', governorate:'Hawalli', address:'Block 6, Mishref',
  lat:29.2762, lng:48.0705, website:'', ig:null,
  from:'Nursery', to:'KG2', ages:'2 – 5 years',
  languages:['Arabic','English'], accreditation:['Ministry of Social Affairs licence'],
  transport:false, theme:['#ca8a04','#fef08a'],
  blurb:'Genuinely bilingual nursery — half the day in Arabic, half in English.',
  about:'Sunflower splits the day between Arabic-medium and English-medium rooms so children build both languages from the start. Popular with Kuwaiti families heading into bilingual primary schools.',
  facilities:['Arabic and English rooms','Shaded garden','Library corner','Music room','Nap rooms','Healthy meals provided'],
  fees:[
    { band:'Nursery (2 – 3 yrs)', from:'Nursery', to:'Nursery', amount:1300 },
    { band:'Pre-KG (3 – 4 yrs)',  from:'Pre-KG',  to:'Pre-KG',  amount:1450 },
    { band:'KG1 – KG2 (4 – 5 yrs)',from:'KG1',    to:'KG2',     amount:1600 }
  ],
  reviews:[
    { name:'Munira A.', date:'2026-05-15', rating:5, tags:['teaching','value'], text:'My son switches between Arabic and English without thinking about it. That was the whole point and they delivered it.' }
  ]
},
{
  id:'bright-start', name:'Bright Start Early Learning Centre', nameAr:'مركز البداية المشرقة للتعلم المبكر', abbr:'BSELC',
  curriculum:'Early', extras:['EYFS','Learning support'], gender:'Mixed', founded:2017, verified:false, featured:false,
  district:'Rumaithiya', governorate:'Hawalli', address:'Block 4, Rumaithiya',
  lat:29.3078, lng:48.0672, website:'', ig:null,
  from:'Nursery', to:'KG2', ages:'2 – 6 years',
  languages:['English','Arabic'], accreditation:['Ministry of Social Affairs licence'],
  transport:false, theme:['#4338ca','#c7d2fe'],
  blurb:'Early-years centre with an on-site speech and occupational therapy team.',
  about:'Bright Start pairs a mainstream EYFS nursery with in-house speech-and-language and occupational therapists, so children needing early intervention stay with their peers rather than being sent elsewhere.',
  facilities:['Speech therapy rooms','Occupational therapy gym','Sensory room','Shaded garden','Small group rooms','Parent training sessions'],
  fees:[
    { band:'Nursery (2 – 3 yrs)',  from:'Nursery', to:'Nursery', amount:1500 },
    { band:'Pre-KG (3 – 4 yrs)',   from:'Pre-KG',  to:'Pre-KG',  amount:1700 },
    { band:'KG1 – KG2 (4 – 6 yrs)',from:'KG1',     to:'KG2',     amount:1850 }
  ],
  reviews:[
    { name:'Tareq B.', date:'2026-06-08', rating:5, tags:['teaching','communication'], text:'Our son was not talking at three. Eighteen months here with the speech team and he is chatting away. They kept us in the loop every single week.' }
  ]
},
{
  id:'tiny-steps', name:'Tiny Steps Nursery', nameAr:'حضانة الخطوات الصغيرة', abbr:'TSN',
  curriculum:'Early', extras:['EYFS'], gender:'Mixed', founded:2012, verified:false, featured:false,
  district:'Fahaheel', governorate:'Ahmadi', address:'Block 6, Fahaheel',
  lat:29.0857, lng:48.1301, website:'', ig:null,
  from:'Nursery', to:'KG1', ages:'1.5 – 4 years',
  languages:['English','Arabic'], accreditation:['Ministry of Social Affairs licence'],
  transport:false, theme:['#ea580c','#fed7aa'],
  blurb:'Nursery for the Ahmadi governorate, taking children from 18 months.',
  about:'Tiny Steps serves families in Fahaheel, Mangaf and Abu Halifa, where nursery provision is scarcer than in Hawalli, with an EYFS-aligned programme and long opening hours for working parents.',
  facilities:['Extended hours (7am – 5pm)','Indoor play hall','Shaded yard','Nap rooms','Meals provided','Nurse on site'],
  fees:[
    { band:'Toddlers (1.5 – 2.5 yrs)', from:'Nursery', to:'Nursery', amount:1050 },
    { band:'Pre-KG (2.5 – 3.5 yrs)',   from:'Pre-KG',  to:'Pre-KG',  amount:1180 },
    { band:'KG1 (3.5 – 4 yrs)',        from:'KG1',     to:'KG1',     amount:1300 }
  ],
  reviews:[
    { name:'Amira K.', date:'2026-03-24', rating:4, tags:['value','safety'], text:'The long hours saved us. Very few options this far south and this one is clean and well staffed.' }
  ]
},
{
  id:'discovery-kg', name:'Discovery Kindergarten', nameAr:'روضة الاستكشاف', abbr:'DKG',
  curriculum:'Early', extras:['Reggio Emilia','EYFS'], gender:'Mixed', founded:2019, verified:false, featured:false,
  district:'Bayan', governorate:'Hawalli', address:'Block 8, Bayan',
  lat:29.3016, lng:48.0447, website:'', ig:null,
  from:'Pre-KG', to:'KG2', ages:'3 – 6 years',
  languages:['English','Arabic'], accreditation:['Ministry of Social Affairs licence'],
  transport:false, theme:['#059669','#a7f3d0'],
  blurb:'Reggio Emilia inspired kindergarten in Bayan for 3 to 6 year olds.',
  about:'Discovery Kindergarten runs a Reggio Emilia inspired, project-led programme where children’s own questions drive the curriculum, documented in portfolios shared with parents each term.',
  facilities:['Atelier art studio','Natural materials play','Outdoor classroom','Documentation walls','Library','Cooking corner'],
  fees:[
    { band:'Pre-KG (3 – 4 yrs)',   from:'Pre-KG', to:'Pre-KG', amount:1600 },
    { band:'KG1 – KG2 (4 – 6 yrs)',from:'KG1',    to:'KG2',    amount:1750 }
  ],
  reviews:[
    { name:'Lulwa M.', date:'2026-04-11', rating:5, tags:['teaching','facilities'], text:'Completely different from the worksheet nurseries. My daughter spent a month on a project about ants and can tell you more about them than I can.' }
  ]
}
];

/* ---------------- derived helpers ---------------- */

/* fee floor / ceiling across all bands, in KWD per year */
function feeRange(s){
  const amounts = (s.fees || []).map(f => f.amount);
  if(!amounts.length) return { min:0, max:0 };
  return { min:Math.min.apply(null, amounts), max:Math.max.apply(null, amounts) };
}

function gradeIndex(g){ return GRADE_LADDER.indexOf(g); }

/* does the school teach anywhere inside the group's grade span? */
function coversGroup(s, group){
  const gFrom = gradeIndex(group.from), gTo = gradeIndex(group.to);
  const sFrom = gradeIndex(s.from),     sTo = gradeIndex(s.to);
  if([gFrom,gTo,sFrom,sTo].some(i => i < 0)) return false;
  return sFrom <= gTo && sTo >= gFrom;
}

const CURRICULUM_BY_ID = CURRICULA.reduce((m,c)=>{ m[c.id]=c; return m; },{});
const GOV_BY_ID        = GOVERNORATES.reduce((m,g)=>{ m[g.id]=g; return m; },{});

/* districts, de-duplicated, for the location filter */
const DISTRICTS = Array.from(new Set(SCHOOLS.map(s=>s.district))).sort();

/* the widest fee band in the catalogue, for the slider bounds */
const FEE_CEILING = SCHOOLS.reduce((n,s)=>Math.max(n, feeRange(s).max), 0);
