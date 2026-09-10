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
            to an Instagram keyword search so we never link a wrong account.
   lat/lng: present ONLY where the school published a map link that resolves
            to coordinates. Everywhere else they are null and the map link is
            built from the verified address, which Google geocodes correctly.
            District-centre coordinates were invented and have been removed.
   locationBasis: 'school'      – address taken from the school's own website
                  'unverified'  – district only, not yet confirmed
   reviews: intentionally empty. Every review on this site is written by a
            signed-in parent through the profile page and published only after
            moderation — nothing is seeded, so a school's star rating is only
            ever what real parents gave it. */

const SCHOOLS = [
/* ===== AMERICAN ===== */
{
  id:'ask', name:'American School of Kuwait', nameAr:'المدرسة الأمريكية بالكويت', abbr:'ASK',
  curriculum:'American', extras:['AP'], gender:'Mixed', founded:1964, verified:true, featured:true,
  district:'Hawalli', governorate:'Hawalli', address:'Al Muthanna Street, Hawally (P.O. Box 6735, Hawalli 32042)',
  lat:null, lng:null, website:'https://www.ask.edu.kw', ig:'americanschoolofkuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic','French'], accreditation:['NEASC','CIS','College Board (AP)'],
  locationBasis:'school',
  locationSource:'https://www.ask.edu.kw/about/contact-us/',
  transport:true, theme:['#1e3a8a','#3b82f6'],
  blurb:'One of the oldest American-curriculum schools in Kuwait, with a full AP programme and a large Hawalli campus.',
  about:'Founded in 1964, ASK follows a US college-preparatory programme from kindergarten through Grade 12, with Advanced Placement courses in the upper school. The campus sits in Hawalli and serves a broad international community alongside Kuwaiti families.',
  facilities:['Two swimming pools','Full-size gymnasium','Auditorium (600 seats)','Science and robotics labs','Library and media centre','Outdoor athletics track'],
  fees:[
    { band:'KG1 – KG2', from:'KG1', to:'KG2', amount:3314 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5', amount:4306 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8', amount:4636 },
    { band:'Grade 9 – Grade 12', from:'Grade 9', to:'Grade 12', amount:5191 }
  ],
  feeBasis:'school',
  feeYear:'2026/27',
  feeSource:'https://www.ask.edu.kw/admissions/tuition-fees/',
  feeNote:'Enrolment deposit KD 100. Extended day care KD 250.',
  phone:'+965 2266 4341',
  email:'ask@ask.edu.kw',
  reviews:[]
},
{
  id:'ais', name:'American International School', nameAr:'المدرسة الأمريكية العالمية', abbr:'AIS',
  curriculum:'American', extras:['AP'], gender:'Mixed', founded:1994, verified:true, featured:true,
  district:'Maidan Hawalli', governorate:'Hawalli', address:'Hamood Al-Naser Street, Maidan Hawalli (P.O. Box 3267, Salmiya 22033)',
  lat:null, lng:null, website:'https://ais.edu.kw', ig:'aiskuwait',
  from:'Pre-KG', to:'Grade 12', ages:'3 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC','College Board (AP)'],
  locationBasis:'school',
  locationSource:'https://ais.edu.kw/about/contact-us',
  transport:true, theme:['#0f766e','#14b8a6'],
  blurb:'Large American-curriculum school with an early-years division and a well-established AP track.',
  about:'AIS delivers a US standards-based curriculum from Pre-KG to Grade 12 across a purpose-built campus in Maidan Hawalli. The school is known for a wide activities programme and a sizeable secondary school.',
  facilities:['Indoor swimming pool','Two gymnasiums','Theatre','Design and technology workshop','Cafeteria','Dedicated early-years playground'],
  fees:[
    { band:'KG1', from:'KG1', to:'KG1', amount:2650 },
    { band:'KG2', from:'KG2', to:'KG2', amount:2871 },
    { band:'Grade 1 – Grade 4', from:'Grade 1', to:'Grade 4', amount:3917 },
    { band:'Grade 5 – Grade 8', from:'Grade 5', to:'Grade 8', amount:4136 },
    { band:'Grade 9 – Grade 12', from:'Grade 9', to:'Grade 12', amount:4581 }
  ],
  feeBasis:'school',
  feeYear:'2026/27',
  feeSource:'https://ais.edu.kw/admissions/tuition-fees',
  feeNote:'Registration KD 100. Optional book fee KD 50 (Grades 1–12). Bus KD 200–375.',
  reviews:[]
},
{
  id:'uas', name:'Universal American School', nameAr:'المدرسة الأمريكية العالمية الجامعة', abbr:'UAS',
  curriculum:'IB', extras:['American','IB PYP','IB MYP','IB DP'], gender:'Mixed', founded:1976, verified:false, featured:true,
  district:'Bayan', governorate:'Hawalli', address:'Block 12, Bayan',
  lat:null, lng:null, website:'https://www.uas.edu.kw', ig:'uaskuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic','French'], accreditation:['IB World School','NEASC','CIS'],
  locationBasis:'unverified',
  transport:true, theme:['#0d9488','#2dd4bf'],
  blurb:'An IB World School running PYP, MYP and the Diploma Programme alongside a US high-school diploma.',
  about:'UAS is one of the longest-standing IB World Schools in Kuwait, offering the Primary Years, Middle Years and Diploma Programmes on a Bayan campus. Students graduate with both an American high-school diploma and, optionally, the IB Diploma.',
  facilities:['Two swimming pools','Sports hall and fitness centre','Black-box theatre','Maker space','IB resource library','Cafeteria'],
  fees:[
    { band:'KG1 – KG2', from:'KG1', to:'KG2', amount:2265 },
    { band:'KG3 / Pre-Grade 1', from:'Pre-KG', to:'Pre-KG', amount:2636 },
    { band:'Grade 1 – Grade 4', from:'Grade 1', to:'Grade 4', amount:3527 },
    { band:'Grade 5 – Grade 8', from:'Grade 5', to:'Grade 8', amount:3738 },
    { band:'Grade 9 – Grade 12', from:'Grade 9', to:'Grade 12', amount:3954 }
  ],
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait/the-universal-american-school-kuwait-city/fees',
  feeNote:'One-time application fee KD 65. Seat deposit KD 350.',
  reviews:[]
},
{
  id:'bbs', name:'Al-Bayan Bilingual School', nameAr:'مدرسة البيان ثنائية اللغة', abbr:'BBS',
  curriculum:'IB', extras:['American','IB DP','Bilingual'], gender:'Mixed', founded:1977, verified:true, featured:true,
  district:'Hawalli', governorate:'Hawalli', address:'Block 5, Hawalli',
  lat:null, lng:null, website:'https://www.bbs.edu.kw', ig:'bbskuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['IB World School','NEASC','CIS'],
  locationBasis:'unverified',
  transport:true, theme:['#166534','#22c55e'],
  blurb:'A genuinely bilingual American/IB school with a strong Arabic programme and an IB Diploma in the high school.',
  about:'BBS was established to give Kuwaiti students a rigorous English-medium education without giving up Arabic and Islamic studies. Instruction is bilingual through the elementary years, and the high school offers the IB Diploma Programme.',
  facilities:['Swimming pool','Two sports halls','Arabic library','Science research labs','Theatre','Art studios'],
  fees:[
    { band:'KG1', from:'KG1', to:'KG1', amount:2434 },
    { band:'KG2', from:'KG2', to:'KG2', amount:2650 },
    { band:'Grade 1 – Grade 5', from:'Grade 1', to:'Grade 5', amount:4086 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8', amount:4306 },
    { band:'Grade 9 – Grade 12', from:'Grade 9', to:'Grade 12', amount:4505 }
  ],
  feeBasis:'school',
  feeYear:'2026/27',
  feeSource:'https://www.bbs.edu.kw/page.dropdown.php?id=237&menu=2',
  feeNote:'Registration deposit KD 100. Paid in three instalments (40/30/30).',
  reviews:[]
},
{
  id:'aca', name:'American Creativity Academy', nameAr:'أكاديمية الإبداع الأمريكية', abbr:'ACA',
  curriculum:'American', extras:['AP','Islamic Studies'], gender:'Separate campuses', founded:1997, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Hawalli and Salmiya campuses',
  lat:null, lng:null, website:'https://www.aca.edu.kw', ig:'aca_kuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC','College Board (AP)'],
  locationBasis:'unverified',
  transport:true, theme:['#1d4ed8','#60a5fa'],
  blurb:'American curriculum with an Islamic ethos, running separate boys’ and girls’ campuses from Grade 5 upward.',
  about:'ACA combines a US standards-based curriculum with Arabic and Islamic studies, and separates boys and girls from the upper elementary years. It is one of the larger private school groups in Kuwait by enrolment.',
  facilities:['Sports halls on both campuses','Swimming pool','Prayer halls','Computer and science labs','Libraries','Bus fleet'],
  fees:[],
  feeRange:{ min:2427, max:4516 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  feeNote:'Registration KD 100. Staff children receive tuition discounts.',
  reviews:[]
},
{
  id:'aus', name:'American United School', nameAr:'المدرسة الأمريكية المتحدة', abbr:'AUS',
  curriculum:'American', extras:['AP','STEAM'], gender:'Mixed', founded:2007, verified:false, featured:false,
  district:'Salmiya', governorate:'Hawalli', address:'Block 12, Salmiya',
  lat:null, lng:null, website:'https://www.aus.edu.kw', ig:'auskuwait',
  from:'Pre-KG', to:'Grade 12', ages:'3 – 18 years',
  languages:['English','Arabic','French'], accreditation:['NEASC','College Board (AP)'],
  locationBasis:'unverified',
  transport:true, theme:['#b91c1c','#f87171'],
  blurb:'Modern purpose-built Salmiya campus with a STEAM focus and a growing AP programme.',
  about:'AUS opened in 2007 on a new campus in Salmiya and has grown quickly. The school leans into STEAM, with dedicated engineering and design spaces, alongside a conventional US college-preparatory pathway.',
  facilities:['Indoor pool','Engineering and robotics labs','Rooftop play areas','Auditorium','Art and music suites','Cafeteria'],
  fees:[
    { band:'KG2', from:'KG2', to:'KG2', amount:4700 },
    { band:'Pre-Grade 1', from:'Pre-KG', to:'Pre-KG', amount:5000 },
    { band:'Grade 1 – Grade 3', from:'Grade 1', to:'Grade 3', amount:5650 },
    { band:'Grade 4 – Grade 5', from:'Grade 4', to:'Grade 5', amount:6000 },
    { band:'Grade 6 – Grade 8', from:'Grade 6', to:'Grade 8', amount:6750 },
    { band:'Grade 9 – Grade 10', from:'Grade 9', to:'Grade 10', amount:7850 },
    { band:'Grade 11 – Grade 12', from:'Grade 11', to:'Grade 12', amount:7950 }
  ],
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait/american-united-school-kuwait-city/fees',
  feeNote:'One-time assessment fee KD 125.',
  reviews:[]
},
{
  id:'fsis', name:'Fawzia Sultan International School', nameAr:'مدرسة فوزية السلطان العالمية', abbr:'FSIS',
  curriculum:'American', extras:['Learning support','Small classes'], gender:'Mixed', founded:2010, verified:false, featured:false,
  district:'Rumaithiya', governorate:'Hawalli', address:'Block 11, Rumaithiya',
  lat:null, lng:null, website:'', ig:'fsiskuwait',
  from:'Pre-KG', to:'Grade 12', ages:'3 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC'],
  locationBasis:'unverified',
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
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'dbs', name:'Dasman Bilingual School', nameAr:'مدرسة دسمان ثنائية اللغة', abbr:'DBS',
  curriculum:'American', extras:['Bilingual','AP'], gender:'Mixed', founded:1996, verified:false, featured:false,
  district:'Kuwait City', governorate:'Capital', address:'Bin Misbah Street, Kuwait City',
  lat:29.3877836, lng:47.9914584, website:'https://www.dbs.edu.kw', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC'],
  phone:'+965 2227 7377',
  email:'info@dasmanschool.com.kw',
  locationBasis:'school',
  locationSource:'https://www.dbs.edu.kw/contact-us/',
  locationNote:'Coordinates from the school’s own Google Maps link. Corrected from Hawalli.',
  transport:true, theme:['#155e75','#22d3ee'],
  blurb:'Bilingual American school with a strong Arabic stream and a compact, well-run campus.',
  about:'Dasman Bilingual School teaches a US curriculum in English while maintaining a full Arabic and Islamic studies programme, aimed primarily at Kuwaiti families who want both without compromise.',
  facilities:['Sports hall','Swimming pool','Science labs','Arabic and English libraries','Music room','Prayer hall'],
  fees:[],
  feeRange:{ min:1786, max:3101 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  reviews:[]
},
{
  id:'kbs', name:'Kuwait Bilingual School', nameAr:'المدرسة الكويتية ثنائية اللغة', abbr:'KBS',
  curriculum:'American', extras:['Bilingual'], gender:'Mixed', founded:2003, verified:false, featured:false,
  district:'Mishref', governorate:'Hawalli', address:'Block 4, Mishref',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC (candidate)'],
  locationBasis:'unverified',
  transport:true, theme:['#3730a3','#818cf8'],
  blurb:'Mid-market bilingual American school serving Mishref and the surrounding suburbs.',
  about:'KBS offers an English-medium American curriculum with Arabic and Islamic studies, positioned as an affordable bilingual option for families in the southern Hawalli suburbs.',
  facilities:['Sports courts','Computer labs','Library','Science labs','Cafeteria','Bus service'],
  fees:[],
  feeRange:{ min:3760, max:5665 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  reviews:[]
},
{
  id:'gas', name:'Gulf American School', nameAr:'مدرسة الخليج الأمريكية', abbr:'GAS',
  curriculum:'American', extras:['AP'], gender:'Mixed', founded:2005, verified:false, featured:false,
  district:'Rumaithiya', governorate:'Hawalli', address:'Block 9, Rumaithiya',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC'],
  locationBasis:'unverified',
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
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'aag', name:'American Academy for Girls', nameAr:'الأكاديمية الأمريكية للبنات', abbr:'AAG',
  curriculum:'American', extras:['Girls only','AP'], gender:'Girls', founded:2000, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Block 4, Hawalli',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC'],
  locationBasis:'unverified',
  transport:true, theme:['#9d174d','#f472b6'],
  blurb:'All-girls American curriculum school from kindergarten through Grade 12.',
  about:'AAG serves girls only across all grades, pairing a US curriculum with Arabic and Islamic studies. It appeals to families who want a single-sex environment through the secondary years.',
  facilities:['Girls-only sports hall','Swimming pool','Science labs','Library','Art studio','Prayer hall'],
  fees:[],
  feeRange:{ min:1648, max:4200 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  reviews:[]
},
{
  id:'kas', name:'Kuwait American School', nameAr:'المدرسة الكويتية الأمريكية', abbr:'KAS',
  curriculum:'American', extras:['AP'], gender:'Mixed', founded:1998, verified:false, featured:false,
  district:'Salmiya', governorate:'Hawalli', address:'Block 10, Salmiya',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC'],
  locationBasis:'unverified',
  transport:true, theme:['#0f172a','#64748b'],
  blurb:'Established American-curriculum school in the heart of Salmiya.',
  about:'Kuwait American School delivers a US curriculum from KG1 to Grade 12 on a central Salmiya site, with a long-standing local reputation and a mixed international intake.',
  facilities:['Multi-purpose hall','Science labs','Computer suites','Library','Rooftop courts','Cafeteria'],
  fees:[],
  feeRange:{ min:1756, max:3488 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  reviews:[]
},
{
  id:'alrowad', name:'Al Rowad American School', nameAr:'مدرسة الرواد الأمريكية', abbr:'ARAS',
  curriculum:'American', extras:['Bilingual'], gender:'Mixed', founded:2008, verified:false, featured:false,
  district:'Farwaniya', governorate:'Farwaniya', address:'Block 3, Farwaniya',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['NEASC (candidate)'],
  locationBasis:'unverified',
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
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},

/* ===== BRITISH ===== */
{
  id:'bsk', name:'The British School of Kuwait', nameAr:'المدرسة البريطانية بالكويت', abbr:'BSK',
  curriculum:'British', extras:['IGCSE','A-Level','EYFS'], gender:'Mixed', founded:1978, verified:false, featured:true,
  district:'Salwa', governorate:'Hawalli', address:'Street 1, Area 1, Salwa — visible from the Fahaheel Expressway (Road 30)',
  lat:null, lng:null, website:'https://www.bsk.edu.kw', ig:'bskkuwait',
  from:'Nursery', to:'Grade 12', ages:'3 – 18 years',
  languages:['English','Arabic','French'], accreditation:['BSO','COBIS','Cambridge International','Edexcel'],
  locationBasis:'school',
  locationSource:'https://www.bsk.edu.kw/contact-us',
  transport:true, theme:['#581c87','#a855f7'],
  blurb:'The best-known British school in Kuwait — EYFS through IGCSE and A-Level on a large Salwa campus.',
  about:'BSK follows the National Curriculum for England from Early Years to Year 13, leading to IGCSEs and A-Levels. It is a British Schools Overseas inspected school and a member of COBIS, with a substantial expatriate and Kuwaiti intake.',
  facilities:['Two swimming pools','Sports fields and courts','Theatre','Sixth-form centre','Design technology suite','Libraries in each school'],
  fees:[],
  feeBasis:'on-request',
  feeYear:'2026/27',
  feeSource:'https://www.bsk.edu.kw/admissions/tuition-fees',
  feeNote:'BSK does not publish fees. Its Accounts Team quotes per year group on request.',
  phone:'+965 1830456',
  email:'admissions@bsk.edu.kw',
  reviews:[]
},
{
  id:'kes', name:'Kuwait English School', nameAr:'المدرسة الإنجليزية الكويتية', abbr:'KES',
  curriculum:'British', extras:['IGCSE','A-Level'], gender:'Mixed', founded:1978, verified:false, featured:true,
  district:'Salwa', governorate:'Hawalli', address:'Block 4, Salwa',
  lat:null, lng:null, website:'https://www.kes.edu.kw', ig:'keskuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic','French'], accreditation:['BSO','COBIS','Cambridge International'],
  locationBasis:'unverified',
  transport:true, theme:['#1e40af','#93c5fd'],
  blurb:'Long-established British school in Salwa with a strong IGCSE and A-Level record.',
  about:'KES teaches the English National Curriculum through to A-Level, with a reputation built on academic results and a stable, largely British teaching staff.',
  facilities:['Swimming pool','Sports hall','Astroturf pitch','Science labs','Sixth-form study centre','Auditorium'],
  fees:[],
  feeRange:{ min:1778, max:4800 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  feeNote:'Registration / re-enrolment KD 100, set under Ministry of Education rules.',
  reviews:[]
},
{
  id:'tes', name:'The English School Kuwait', nameAr:'المدرسة الإنجليزية بالكويت', abbr:'TES',
  curriculum:'British', extras:['IGCSE','EYFS'], gender:'Mixed', founded:1953, verified:false, featured:false,
  district:'Salmiya', governorate:'Hawalli', address:'Mousaed Al-Azmi Street, Block 12, Salmiya',
  lat:null, lng:null, website:'https://tes.edu.kw', ig:null,
  from:'Nursery', to:'Grade 11', ages:'3 – 16 years',
  languages:['English','Arabic','French'], accreditation:['BSO','COBIS'],
  locationBasis:'school',
  locationSource:'https://tes.edu.kw/contact-us/',
  locationNote:'Corrected from Shamiya / Capital.',
  transport:true, theme:['#7f1d1d','#ef4444'],
  blurb:'The oldest English-medium school in Kuwait, running from Nursery to IGCSE in Shamiya.',
  about:'Founded in 1953, The English School is the longest-established British school in Kuwait. It runs the English National Curriculum from Early Years to Year 11, finishing with IGCSEs.',
  facilities:['Swimming pool','Playing fields','Library','Science labs','Music and drama rooms','Early Years garden'],
  fees:[],
  feeRange:{ min:1841, max:3535 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  reviews:[]
},
{
  id:'nes', name:'The New English School', nameAr:'المدرسة الإنجليزية الجديدة', abbr:'NES',
  curriculum:'British', extras:['IGCSE','A-Level'], gender:'Mixed', founded:1969, verified:true, featured:true,
  district:'Jabriya', governorate:'Hawalli', address:'Block 12, Jabriya (P.O. Box 6156, Hawalli 32036)',
  lat:null, lng:null, website:'https://www.neskt.com', ig:'nes_kuwait',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic','French'], accreditation:['BSO','COBIS','Cambridge International'],
  locationBasis:'school',
  locationSource:'https://www.neskt.com',
  transport:true, theme:['#065f46','#34d399'],
  blurb:'Large, academically selective British school in Jabriya with a well-known A-Level programme.',
  about:'NES has run the English National Curriculum in Jabriya since 1969, with entry assessments and a strong record at IGCSE and A-Level. It is one of the largest British schools in the country by enrolment.',
  facilities:['Two swimming pools','Sports halls','Auditorium','Sixth-form block','Science and IT labs','Libraries'],
  fees:[
    { band:'Kindergarten', from:'KG1', to:'KG2', amount:1733 },
    { band:'Reception – Year 2', from:'Grade 1', to:'Grade 2', amount:2678 },
    { band:'Years 3 – 6', from:'Grade 3', to:'Grade 6', amount:2977 },
    { band:'Years 7 – 9', from:'Grade 7', to:'Grade 9', amount:3510 },
    { band:'Years 10 – 11', from:'Grade 10', to:'Grade 11', amount:3510 },
    { band:'Years 12 – 13 (A Level)', from:'Grade 12', to:'Grade 12', amount:4430 }
  ],
  feeBasis:'school',
  feeYear:'2024/25',
  feeSource:'https://www.neskt.com',
  feeNote:'Resources & technology fee KD 25–180 by year group. No sibling discount.',
  phone:'+965 2531 8060',
  email:'admin@neskt.org',
  reviews:[]
},
{
  id:'ges', name:'Gulf English School', nameAr:'مدرسة الخليج الإنجليزية', abbr:'GES',
  curriculum:'British', extras:['IGCSE','A-Level'], gender:'Mixed', founded:1978, verified:false, featured:false,
  district:'Salmiya', governorate:'Hawalli', address:'Al Dimnah Street, Block 4, Salmiya (P.O. Box 33106)',
  lat:null, lng:null, website:'https://www.ges.edu.kw', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic'], accreditation:['BSO','Cambridge International'],
  phone:'+965 2575 7022',
  email:'info@ges.edu.kw',
  locationBasis:'school',
  locationSource:'https://www.ges.edu.kw/contact-us/',
  locationNote:'Corrected from Hawalli.',
  transport:true, theme:['#134e4a','#5eead4'],
  blurb:'British curriculum school in Hawalli covering KG1 to A-Level.',
  about:'Gulf English School follows the English National Curriculum with IGCSE and A-Level examinations, serving a mixed Kuwaiti and expatriate community in central Hawalli.',
  facilities:['Sports hall','Swimming pool','Science labs','Library','ICT suites','Cafeteria'],
  fees:[],
  feeRange:{ min:1692, max:3893 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  reviews:[]
},
{
  id:'knes', name:'Kuwait National English School', nameAr:'المدرسة الوطنية الإنجليزية', abbr:'KNES',
  curriculum:'British', extras:['IGCSE','A-Level'], gender:'Mixed', founded:1996, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Block 11, Hawalli',
  lat:null, lng:null, website:'https://www.knes.edu.kw', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Arabic','French'], accreditation:['BSO','Cambridge International'],
  locationBasis:'unverified',
  transport:true, theme:['#312e81','#a5b4fc'],
  blurb:'British curriculum with a strong languages offer and a compact Hawalli campus.',
  about:'KNES teaches the English National Curriculum to A-Level, with French from the primary years and a well-regarded music programme.',
  facilities:['Sports hall','Music suite','Science labs','Library','Language rooms','Rooftop play area'],
  fees:[
    { band:'KG1', from:'KG1', to:'KG1', amount:1494 },
    { band:'KG2', from:'KG2', to:'KG2', amount:2289 },
    { band:'Grade 1 – Grade 4', from:'Grade 1', to:'Grade 4', amount:2765 },
    { band:'Grade 5 – Grade 10', from:'Grade 5', to:'Grade 10', amount:2926 },
    { band:'Grade 11', from:'Grade 11', to:'Grade 11', amount:4630 },
    { band:'Grade 12', from:'Grade 12', to:'Grade 12', amount:4862 }
  ],
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait/kuwait-national-english-school/fees',
  reviews:[]
},
{
  id:'ces', name:'Cambridge English School', nameAr:'مدرسة كامبريدج الإنجليزية', abbr:'CES',
  curriculum:'British', extras:['IGCSE'], gender:'Mixed', founded:1997, verified:false, featured:false,
  district:'Mangaf', governorate:'Ahmadi', address:'Block 4, Mangaf',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 11', ages:'4 – 16 years',
  languages:['English','Arabic'], accreditation:['Cambridge International'],
  locationBasis:'unverified',
  transport:true, theme:['#164e63','#67e8f9'],
  blurb:'British curriculum school serving Mangaf, Fahaheel and the Ahmadi governorate.',
  about:'Cambridge English School delivers the English National Curriculum through to IGCSE in the south of Kuwait, where British options are thinner on the ground.',
  facilities:['Sports courts','Science labs','Library','ICT lab','Cafeteria','Bus fleet'],
  fees:[],
  feeBasis:'on-request',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  feeNote:'Cambridge English School does not publish its fees.',
  reviews:[]
},
{
  id:'kies', name:'Kuwait International English School', nameAr:'المدرسة الإنجليزية الدولية الكويتية', abbr:'KIES',
  curriculum:'British', extras:['IGCSE'], gender:'Mixed', founded:2001, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Block 2, Hawalli',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 11', ages:'4 – 16 years',
  languages:['English','Arabic'], accreditation:['Cambridge International'],
  locationBasis:'unverified',
  transport:true, theme:['#4c1d95','#c4b5fd'],
  blurb:'Affordable British curriculum school in Hawalli through to IGCSE.',
  about:'KIES offers the English National Curriculum at accessible fees, with a mixed intake drawn largely from Hawalli and Salmiya.',
  facilities:['Multi-purpose hall','Science labs','Library','Computer lab','Prayer room','Cafeteria'],
  fees:[],
  feeRange:{ min:1389, max:3689 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  reviews:[]
},
{
  id:'sabahalsalem-british', name:'Sabah Al Salem British Academy', nameAr:'أكاديمية صباح السالم البريطانية', abbr:'SSBA',
  curriculum:'British', extras:['IGCSE','EYFS'], gender:'Mixed', founded:2014, verified:false, featured:false,
  district:'Sabah Al-Salem', governorate:'Mubarak', address:'Block 5, Sabah Al-Salem',
  lat:null, lng:null, website:'', ig:null,
  from:'Nursery', to:'Grade 9', ages:'3 – 14 years',
  languages:['English','Arabic'], accreditation:['Cambridge International (candidate)'],
  locationBasis:'unverified',
  transport:true, theme:['#831843','#f9a8d4'],
  blurb:'Newer British-curriculum school growing year by year, currently to Year 10.',
  about:'A newer entrant in Mubarak Al-Kabeer governorate, adding a year group annually as its first cohort progresses. Currently teaching Early Years to Year 10.',
  facilities:['Early Years garden','Sports hall','Science lab','Library','ICT room','Shaded play areas'],
  fees:[
    { band:'Nursery – KG2', from:'Nursery',  to:'KG2',     amount:1650 },
    { band:'Years 1 – 6',   from:'Grade 1',  to:'Grade 5', amount:2100 },
    { band:'Years 7 – 10',  from:'Grade 6',  to:'Grade 9', amount:2450 }
  ],
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},

/* ===== INDIAN ===== */
{
  id:'icsk', name:'Indian Community School Kuwait', nameAr:'المدرسة الهندية الكويتية', abbr:'ICSK',
  curriculum:'Indian', extras:['CBSE','Multiple branches'], gender:'Mixed', founded:1964, verified:false, featured:true,
  district:'Salmiya', governorate:'Hawalli', address:'ICSK Senior: Essa Al Qatami Street, Jiddha-8, Block 10, Salmiya',
  lat:null, lng:null, website:'https://www.icsk-kw.com', ig:'icsk_official',
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic','Malayalam'], accreditation:['CBSE (New Delhi)'],
  phone:'+965 2562 9583',
  email:'icsksenior@icsk-kw.com',
  locationBasis:'school',
  locationSource:'https://www.icsk-kw.com/contact.php',
  locationNote:'Several branches (Senior, Junior, Khaitan, Amman); the Senior campus address is the one published. Corrected from Khaitan.',
  transport:true, theme:['#c2410c','#fdba74'],
  blurb:'The largest Indian school group in Kuwait, CBSE affiliated, across several branches.',
  about:'ICSK has served the Indian community in Kuwait since 1964 and now operates multiple branches under CBSE affiliation, offering Science, Commerce and Humanities streams in the senior secondary years.',
  facilities:['Auditoriums','Sports grounds','Science and computer labs','Libraries','Medical rooms','Large bus fleet'],
  fees:[],
  feeRange:{ min:378, max:561 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  feeNote:'Varies by branch. One-time admission fee KD 10; three instalments.',
  reviews:[]
},
{
  id:'faips', name:'FAIPS – DPS Kuwait', nameAr:'مدرسة الفحيحيل الوطنية الهندية', abbr:'FAIPS',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:1996, verified:false, featured:false,
  district:'Fahaheel', governorate:'Ahmadi', address:'Block 8, Fahaheel',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic'], accreditation:['CBSE (New Delhi)'],
  locationBasis:'unverified',
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
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'bhavans', name:'Bhavans SIS – Smart Indian School', nameAr:'مدرسة بهافانز الهندية', abbr:'Bhavans',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:2003, verified:false, featured:false,
  district:'Jleeb Al Shuyoukh', governorate:'Farwaniya', address:'Street 22, Abdulla Mubarak, Jleeb Al Shuyoukh (P.O. Box 417)',
  lat:null, lng:null, website:'https://www.bhavanskuwait.com', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic','Malayalam'], accreditation:['CBSE (New Delhi)'],
  phone:'+965 2434 2388',
  locationBasis:'school',
  locationSource:'https://www.bhavanskuwait.com/contact-us',
  locationNote:'Corrected from Abbassiya.',
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
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'uis', name:'United Indian School', nameAr:'المدرسة الهندية المتحدة', abbr:'UIS',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:1994, verified:false, featured:false,
  district:'Abbassiya', governorate:'Farwaniya', address:'Block 6, Abbassiya',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic'], accreditation:['CBSE (New Delhi)'],
  locationBasis:'unverified',
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
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'iis', name:'Integrated Indian School', nameAr:'المدرسة الهندية المتكاملة', abbr:'IIS',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:1996, verified:false, featured:false,
  district:'Abbassiya', governorate:'Farwaniya', address:'Block 8, Abbassiya',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic','Malayalam'], accreditation:['CBSE (New Delhi)'],
  locationBasis:'unverified',
  transport:true, theme:['#065f46','#6ee7b7'],
  blurb:'CBSE school in Abbassiya known for consistent Grade 10 and 12 board results.',
  about:'Integrated Indian School runs the CBSE curriculum with Science and Commerce streams, and a track record of solid board examination performance relative to its fee level.',
  facilities:['Science labs','Computer labs','Library','Assembly hall','Sports courts','Bus fleet'],
  fees:[],
  feeRange:{ min:340, max:488 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  reviews:[]
},
{
  id:'carmel', name:'Carmel School Kuwait', nameAr:'مدرسة الكرمل', abbr:'Carmel',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:1994, verified:false, featured:false,
  district:'Khaitan', governorate:'Farwaniya', address:'Block 4, Khaitan',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic','Malayalam'], accreditation:['CBSE (New Delhi)'],
  locationBasis:'unverified',
  transport:true, theme:['#155e75','#a5f3fc'],
  blurb:'CBSE school in Khaitan with a strong pastoral reputation.',
  about:'Carmel School offers CBSE education from KG1 to Grade 12, with a values-led pastoral programme and a long-standing presence in Khaitan.',
  facilities:['Assembly hall','Science labs','Library','Computer lab','Playground','Bus service'],
  fees:[],
  feeBasis:'on-request',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  feeNote:'Carmel School does not publish its fees.',
  reviews:[]
},
{
  id:'ies', name:'Indian Educational School', nameAr:'المدرسة الهندية التعليمية', abbr:'IES',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:1998, verified:false, featured:false,
  district:'Jleeb Al Shuyoukh', governorate:'Farwaniya', address:'School Street, Jleeb Al Shuyoukh, opposite the old fire station',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic'], accreditation:['CBSE (New Delhi)'],
  phone:'+965 2434 0882',
  locationBasis:'school',
  locationSource:'https://www.bhavanskuwait.com/contact-us',
  locationNote:'Corrected from Salmiya.',
  transport:true, theme:['#3f6212','#bef264'],
  blurb:'CBSE school with a Salmiya location convenient for Hawalli families.',
  about:'Indian Educational School serves the Indian community in Salmiya and Hawalli with a CBSE curriculum and a shorter commute than the Abbassiya cluster.',
  facilities:['Science labs','Computer lab','Library','Indoor hall','Rooftop play area','Bus service'],
  fees:[],
  feeRange:{ min:715, max:1320 },
  feeBasis:'directory',
  feeYear:'2026/27',
  feeSource:'https://www.international-schools-database.com/in/kuwait',
  reviews:[]
},
{
  id:'gis', name:'Gulf Indian School', nameAr:'مدرسة الخليج الهندية', abbr:'GIS',
  curriculum:'Indian', extras:['CBSE'], gender:'Mixed', founded:2001, verified:false, featured:false,
  district:'Farwaniya', governorate:'Farwaniya', address:'Block 1, Farwaniya',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['English','Hindi','Arabic','Malayalam'], accreditation:['CBSE (New Delhi)'],
  locationBasis:'unverified',
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
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},

/* ===== ARABIC / PUBLIC ===== */
{
  id:'moe-public', name:'Ministry of Education Public Schools', nameAr:'المدارس الحكومية — وزارة التربية', abbr:'MOE',
  curriculum:'Arabic', extras:['Government','Free for citizens'], gender:'Separate from Grade 5', founded:1936, verified:false, featured:false,
  district:'All governorates', governorate:'Capital', address:'Ministry of Education, Al Asimah',
  lat:null, lng:null, website:'https://www.moe.edu.kw', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['Arabic','English'], accreditation:['Ministry of Education, Kuwait'],
  locationBasis:'unverified',
  transport:false, theme:['#0369a1','#7dd3fc'],
  blurb:'The national Arabic-curriculum school system — free for Kuwaiti citizens, organised by governorate.',
  about:'Kuwait’s public schools follow the national Arabic curriculum set by the Ministry of Education, from kindergarten through Grade 12, with boys and girls separated from the intermediate stage. Tuition is free for Kuwaiti citizens; enrolment is by residential catchment. Non-citizens are admitted only in limited circumstances.',
  facilities:['Governorate-wide network','Sports halls','Science labs','Libraries','Prayer halls','Free textbooks'],
  fees:[
    { band:'KG1 – Grade 12 (Kuwaiti citizens)', from:'KG1', to:'Grade 12', amount:0 }
  ],
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'najat', name:'Al-Najat Bilingual School', nameAr:'مدرسة النجاة ثنائية اللغة', abbr:'Najat',
  curriculum:'Arabic', extras:['Bilingual','Islamic Studies'], gender:'Separate campuses', founded:1994, verified:false, featured:false,
  district:'Hawalli', governorate:'Hawalli', address:'Block 9, Hawalli',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['Arabic','English'], accreditation:['Ministry of Education, Kuwait'],
  locationBasis:'unverified',
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
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'maali', name:'Al-Maali Bilingual School', nameAr:'مدرسة المعالي ثنائية اللغة', abbr:'Maali',
  curriculum:'Arabic', extras:['Bilingual'], gender:'Separate campuses', founded:2002, verified:false, featured:false,
  district:'Qurtuba', governorate:'Capital', address:'Block 3, Qurtuba',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['Arabic','English'], accreditation:['Ministry of Education, Kuwait'],
  locationBasis:'unverified',
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
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'rawdat', name:'Rawdat Al-Uloom Bilingual School', nameAr:'مدرسة روضة العلوم ثنائية اللغة', abbr:'RUS',
  curriculum:'Arabic', extras:['Bilingual','Islamic Studies'], gender:'Separate campuses', founded:1999, verified:false, featured:false,
  district:'Jabriya', governorate:'Hawalli', address:'Block 7, Jabriya',
  lat:null, lng:null, website:'', ig:null,
  from:'KG1', to:'Grade 12', ages:'4 – 18 years',
  languages:['Arabic','English'], accreditation:['Ministry of Education, Kuwait'],
  locationBasis:'unverified',
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
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},

/* ===== PRE-K & KINDERGARTEN / NURSERIES ===== */
{
  id:'english-playgroup', name:'The English Playgroup', nameAr:'الروضة الإنجليزية', abbr:'TEP',
  curriculum:'Early', extras:['EYFS','Multiple branches'], gender:'Mixed', founded:1978, verified:false, featured:true,
  district:'Multiple branches', governorate:'Hawalli', address:'Branches across Salmiya, Hawalli, Jabriya, Mishref and Fahaheel',
  lat:null, lng:null, website:'https://www.englishplaygroup.com', ig:'englishplaygroup',
  from:'Nursery', to:'KG2', ages:'2 – 6 years',
  languages:['English','Arabic'], accreditation:['EYFS (England)'],
  locationBasis:'unverified',
  transport:true, theme:['#be185d','#fbcfe8'],
  blurb:'Kuwait’s largest early-years group — EYFS across a dozen branches, 2 to 6 years.',
  about:'The English Playgroup has been running early-years education in Kuwait since 1978 and now operates branches across most residential areas. It follows the English Early Years Foundation Stage, and feeds into the main British and American primary schools.',
  facilities:['Indoor soft-play halls','Shaded outdoor gardens','Water-play areas','Music rooms','Nap rooms','Nurse on site'],
  fees:[
    { band:'Nursery (2 – 3 yrs)', from:'Nursery', to:'Nursery', amount:1450 },
    { band:'Pre-KG (3 – 4 yrs)',  from:'Pre-KG',  to:'Pre-KG',  amount:1650 },
    { band:'KG1 – KG2 (4 – 6 yrs)',from:'KG1',    to:'KG2',     amount:1900 }
  ],
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'little-hearts', name:'Little Hearts Nursery', nameAr:'حضانة القلوب الصغيرة', abbr:'LHN',
  curriculum:'Early', extras:['EYFS','Montessori elements'], gender:'Mixed', founded:2010, verified:false, featured:false,
  district:'Salmiya', governorate:'Hawalli', address:'Block 6, Salmiya',
  lat:null, lng:null, website:'', ig:null,
  from:'Nursery', to:'KG1', ages:'1.5 – 4 years',
  languages:['English','Arabic'], accreditation:['Ministry of Social Affairs licence'],
  locationBasis:'unverified',
  transport:false, theme:['#c026d3','#f5d0fe'],
  blurb:'Small Salmiya nursery for 18 months to 4 years, with Montessori-influenced rooms.',
  about:'Little Hearts takes children from 18 months and blends EYFS goals with Montessori materials and free-flow play. Deliberately small, with high staff ratios in the youngest rooms.',
  facilities:['Montessori materials','Indoor gym','Shaded garden','Sensory room','Nap rooms','Low staff ratios'],
  fees:[
    { band:'Toddlers (1.5 – 2.5 yrs)', from:'Nursery', to:'Nursery', amount:1250 },
    { band:'Pre-KG (2.5 – 3.5 yrs)',   from:'Pre-KG',  to:'Pre-KG',  amount:1400 },
    { band:'KG1 (3.5 – 4 yrs)',        from:'KG1',     to:'KG1',     amount:1550 }
  ],
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'kangaroo', name:'Kangaroo Kids Nursery', nameAr:'حضانة كانجرو كيدز', abbr:'KKN',
  curriculum:'Early', extras:['EYFS'], gender:'Mixed', founded:2013, verified:false, featured:false,
  district:'Jabriya', governorate:'Hawalli', address:'Block 6, Jabriya',
  lat:null, lng:null, website:'', ig:null,
  from:'Nursery', to:'KG2', ages:'2 – 5 years',
  languages:['English','Arabic'], accreditation:['Ministry of Social Affairs licence'],
  locationBasis:'unverified',
  transport:false, theme:['#0d9488','#99f6e4'],
  blurb:'Jabriya nursery running EYFS from 2 to 5 years with a large outdoor garden.',
  about:'Kangaroo Kids focuses on outdoor and physical play, with a garden that is unusually large for a Jabriya villa conversion, plus a structured EYFS programme in the KG rooms.',
  facilities:['Large shaded garden','Climbing frames','Water play','Art studio','Nap rooms','Nurse on call'],
  fees:[
    { band:'Nursery (2 – 3 yrs)', from:'Nursery', to:'Nursery', amount:1150 },
    { band:'Pre-KG (3 – 4 yrs)',  from:'Pre-KG',  to:'Pre-KG',  amount:1300 },
    { band:'KG1 – KG2 (4 – 5 yrs)',from:'KG1',    to:'KG2',     amount:1450 }
  ],
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'sunflower', name:'Sunflower Bilingual Nursery', nameAr:'حضانة عين الشمس ثنائية اللغة', abbr:'SBN',
  curriculum:'Early', extras:['Bilingual','EYFS'], gender:'Mixed', founded:2015, verified:false, featured:false,
  district:'Mishref', governorate:'Hawalli', address:'Block 6, Mishref',
  lat:null, lng:null, website:'', ig:null,
  from:'Nursery', to:'KG2', ages:'2 – 5 years',
  languages:['Arabic','English'], accreditation:['Ministry of Social Affairs licence'],
  locationBasis:'unverified',
  transport:false, theme:['#ca8a04','#fef08a'],
  blurb:'Genuinely bilingual nursery — half the day in Arabic, half in English.',
  about:'Sunflower splits the day between Arabic-medium and English-medium rooms so children build both languages from the start. Popular with Kuwaiti families heading into bilingual primary schools.',
  facilities:['Arabic and English rooms','Shaded garden','Library corner','Music room','Nap rooms','Healthy meals provided'],
  fees:[
    { band:'Nursery (2 – 3 yrs)', from:'Nursery', to:'Nursery', amount:1300 },
    { band:'Pre-KG (3 – 4 yrs)',  from:'Pre-KG',  to:'Pre-KG',  amount:1450 },
    { band:'KG1 – KG2 (4 – 5 yrs)',from:'KG1',    to:'KG2',     amount:1600 }
  ],
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'bright-start', name:'Bright Start Early Learning Centre', nameAr:'مركز البداية المشرقة للتعلم المبكر', abbr:'BSELC',
  curriculum:'Early', extras:['EYFS','Learning support'], gender:'Mixed', founded:2017, verified:false, featured:false,
  district:'Rumaithiya', governorate:'Hawalli', address:'Block 4, Rumaithiya',
  lat:null, lng:null, website:'', ig:null,
  from:'Nursery', to:'KG2', ages:'2 – 6 years',
  languages:['English','Arabic'], accreditation:['Ministry of Social Affairs licence'],
  locationBasis:'unverified',
  transport:false, theme:['#4338ca','#c7d2fe'],
  blurb:'Early-years centre with an on-site speech and occupational therapy team.',
  about:'Bright Start pairs a mainstream EYFS nursery with in-house speech-and-language and occupational therapists, so children needing early intervention stay with their peers rather than being sent elsewhere.',
  facilities:['Speech therapy rooms','Occupational therapy gym','Sensory room','Shaded garden','Small group rooms','Parent training sessions'],
  fees:[
    { band:'Nursery (2 – 3 yrs)',  from:'Nursery', to:'Nursery', amount:1500 },
    { band:'Pre-KG (3 – 4 yrs)',   from:'Pre-KG',  to:'Pre-KG',  amount:1700 },
    { band:'KG1 – KG2 (4 – 6 yrs)',from:'KG1',     to:'KG2',     amount:1850 }
  ],
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'tiny-steps', name:'Tiny Steps Nursery', nameAr:'حضانة الخطوات الصغيرة', abbr:'TSN',
  curriculum:'Early', extras:['EYFS'], gender:'Mixed', founded:2012, verified:false, featured:false,
  district:'Fahaheel', governorate:'Ahmadi', address:'Block 6, Fahaheel',
  lat:null, lng:null, website:'', ig:null,
  from:'Nursery', to:'KG1', ages:'1.5 – 4 years',
  languages:['English','Arabic'], accreditation:['Ministry of Social Affairs licence'],
  locationBasis:'unverified',
  transport:false, theme:['#ea580c','#fed7aa'],
  blurb:'Nursery for the Ahmadi governorate, taking children from 18 months.',
  about:'Tiny Steps serves families in Fahaheel, Mangaf and Abu Halifa, where nursery provision is scarcer than in Hawalli, with an EYFS-aligned programme and long opening hours for working parents.',
  facilities:['Extended hours (7am – 5pm)','Indoor play hall','Shaded yard','Nap rooms','Meals provided','Nurse on site'],
  fees:[
    { band:'Toddlers (1.5 – 2.5 yrs)', from:'Nursery', to:'Nursery', amount:1050 },
    { band:'Pre-KG (2.5 – 3.5 yrs)',   from:'Pre-KG',  to:'Pre-KG',  amount:1180 },
    { band:'KG1 (3.5 – 4 yrs)',        from:'KG1',     to:'KG1',     amount:1300 }
  ],
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
},
{
  id:'discovery-kg', name:'Discovery Kindergarten', nameAr:'روضة الاستكشاف', abbr:'DKG',
  curriculum:'Early', extras:['Reggio Emilia','EYFS'], gender:'Mixed', founded:2019, verified:false, featured:false,
  district:'Bayan', governorate:'Hawalli', address:'Block 8, Bayan',
  lat:null, lng:null, website:'', ig:null,
  from:'Pre-KG', to:'KG2', ages:'3 – 6 years',
  languages:['English','Arabic'], accreditation:['Ministry of Social Affairs licence'],
  locationBasis:'unverified',
  transport:false, theme:['#059669','#a7f3d0'],
  blurb:'Reggio Emilia inspired kindergarten in Bayan for 3 to 6 year olds.',
  about:'Discovery Kindergarten runs a Reggio Emilia inspired, project-led programme where children’s own questions drive the curriculum, documented in portfolios shared with parents each term.',
  facilities:['Atelier art studio','Natural materials play','Outdoor classroom','Documentation walls','Library','Cooking corner'],
  fees:[
    { band:'Pre-KG (3 – 4 yrs)',   from:'Pre-KG', to:'Pre-KG', amount:1600 },
    { band:'KG1 – KG2 (4 – 6 yrs)',from:'KG1',    to:'KG2',    amount:1750 }
  ],
  feeBasis:'estimate',
  feeYear:'',
  feeSource:'',
  feeNote:'Not published online — these figures are unconfirmed estimates.',
  reviews:[]
}
];

/* ---------------- derived helpers ---------------- */

/* Fee floor / ceiling in KWD per academic year.
   Three shapes exist, so callers must check `known`:
     - per-band fees[]        → min/max across the bands
     - feeRange only          → the school publishes a range, not a breakdown
     - neither ('on-request') → the school publishes nothing at all */
function feeRange(s){
  const amounts = (s.fees || []).map(f => f.amount);
  if(amounts.length){
    return { min:Math.min.apply(null, amounts), max:Math.max.apply(null, amounts), known:true, banded:true };
  }
  if(s.feeRange){
    return { min:s.feeRange.min, max:s.feeRange.max, known:true, banded:false };
  }
  return { min:0, max:0, known:false, banded:false };
}

/* has this school's fee data been confirmed against a real source? */
function feesConfirmed(s){ return s.feeBasis === 'school' || s.feeBasis === 'directory'; }

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

/* the widest published fee in the catalogue, for the slider bounds */
const FEE_CEILING = SCHOOLS.reduce((n,s)=>{
  const r = feeRange(s);
  return r.known ? Math.max(n, r.max) : n;
}, 0);
