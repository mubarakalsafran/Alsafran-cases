/* ============================================================
   ALSAFRAN — catalogue + case renderer (prototype data layer)
   ============================================================ */

const MODELS = [
  { id:'17pm', label:'iPhone 17 Pro Max' },
  { id:'17p',  label:'iPhone 17 Pro' },
  { id:'16pm', label:'iPhone 16 Pro Max' },
  { id:'16p',  label:'iPhone 16 Pro' },
  { id:'17',   label:'iPhone 17',        soon:true },
  { id:'16',   label:'iPhone 16',        soon:true },
  { id:'15pm', label:'iPhone 15 Pro Max', soon:true },
  { id:'s25u', label:'Galaxy S25 Ultra',  soon:true }
];

const TIERS = {
  core:      { name:'Core',      price:5.900,  magsafe:'Clear SKUs only', drop:'1.5 m' },
  signature: { name:'Signature', price:8.900,  magsafe:'12× N42, every SKU', drop:'2.0 m' },
  atelier:   { name:'Atelier',   price:13.500, magsafe:'16× N52 + alignment', drop:'2.0 m' },
  limited:   { name:'Limited',   price:16.900, magsafe:'16× N52 + alignment', drop:'2.0 m' }
};

const SPECS = {
  protection:[
    '1.4 mm raised camera lip, chamfered inner wall',
    '1.1 mm raised screen lip — rests face-down safely',
    'Four internal air-cushion corners',
    'Drop tested to 2.0 m on concrete (1.5 m on Core)',
    'Micro-textured side rails so it does not slide off a dashboard'
  ],
  materials:[
    'Soft-touch coated polycarbonate back, reinforced TPU frame',
    'Anodised 6063 aluminium buttons, 200-cycle tested click',
    'Oleophobic top coat — resists fingerprints, stays matte',
    'Oversized chamfered charging cutout, fits braided cables',
    'Monogram debossed inside the bottom edge'
  ],
  shipping:[
    'Kuwait: 1–3 days · free over 15.000 KD, otherwise 1.500 KD',
    'GCC: 3–6 days via Aramex · from 4.500 KD',
    'International: 5–10 days via DHL',
    'Personalised cases ship in 3 working days',
    'Same-day dispatch on orders before 2 PM inside Kuwait'
  ],
  returns:[
    '14-day returns on unused cases in original packaging',
    '12-month warranty against manufacturing defects',
    'Defects replaced immediately — no proof-of-purchase theatre',
    'Personalised cases are not returnable unless faulty'
  ]
};

/* ---------------- the catalogue ---------------- */
const PRODUCTS = [
  {
    id:'ink', name:'INK', tier:'signature', family:'Minimal', collection:'Gold Route',
    badge:'BEST SELLER', rank:1, rating:4.9, reviews:64, claimed:171, total:200,
    blurb:'Matte black that stays matte.',
    desc:'Matte black that stays matte. No gloss corners after a Kuwaiti summer, no fingerprints on show, one gold thread on the back. It goes with everything you own, which is exactly the point.',
    colors:[
      { name:'Ink',   hex:'#0B0B0C', art:'thread' },
      { name:'Qahwa', hex:'#5B3A29', art:'thread' },
      { name:'Sand',  hex:'#D8C3A5', art:'thread' }
    ],
    sold:['16p']
  },
  {
    id:'bone', name:'BONE', tier:'signature', family:'Minimal', collection:'Gold Route',
    badge:'BEST SELLER', rank:2, rating:4.9, reviews:51, claimed:158, total:200,
    blurb:'Off-white, soft-touch, and almost nothing else.',
    desc:'Off-white, soft-touch, and almost nothing else. Bone is the case you stop noticing and then can’t go back from — 1.4 mm camera lip, anodised buttons, MagSafe in a gold ring. The monogram is inside the bottom edge. You’ll know it’s there.',
    colors:[
      { name:'Bone',  hex:'#F4F1EA', art:'thread' },
      { name:'Sand',  hex:'#D8C3A5', art:'thread' },
      { name:'Pearl', hex:'#EDE9E3', art:'thread' }
    ]
  },
  {
    id:'crystal', name:'CRYSTAL', tier:'core', family:'Clear', collection:'Gold Route',
    badge:'GATEWAY', rank:3, rating:4.8, reviews:88, claimed:243, total:340,
    blurb:'Still clear in a year.',
    desc:'Still clear in a year. Bayer-grade polycarbonate, edge-bonded with no visible seam, and a gold MagSafe ring you can see straight through the back. The cheapest way into the drop, and the one people ask about most.',
    colors:[
      { name:'Clear',        hex:'#DCE3E6', art:'clear' },
      { name:'Frosted Bone', hex:'#E8E4DA', art:'clear' }
    ]
  },
  {
    id:'safran', name:'SAFRAN', tier:'signature', family:'Clear', collection:'Gold Route',
    badge:'THE NAMESAKE', rank:4, rating:5.0, reviews:37, claimed:186, total:200,
    blurb:'Saffron in water.',
    desc:'Saffron in water. A translucent amber gradient that catches light from the side, three gold threads in the corner, and the wordmark foiled down the edge. This is the one the brand is named after.',
    colors:[
      { name:'Safran', hex:'#C9922E', art:'gradient' },
      { name:'Qahwa Fade', hex:'#8A5A32', art:'gradient' }
    ]
  },
  {
    id:'qahwa', name:'QAHWA', arabic:'قهوة', tier:'signature', family:'Arabic Type', collection:'Gold Route',
    badge:'ARABIC TYPE', rank:5, rating:4.9, reviews:42, claimed:149, total:200,
    blurb:'قهوة, set properly, in the same colour as the case.',
    desc:'قهوة, set properly, in the same colour as the case — you only see it when the light catches it. A deep coffee matte with a sand-lined interior. Made for people whose first question in the morning is where the qahwa is.',
    colors:[
      { name:'Qahwa', hex:'#5B3A29', art:'deboss' },
      { name:'Sand',  hex:'#D8C3A5', art:'deboss' },
      { name:'Ink',   hex:'#0B0B0C', art:'deboss' }
    ]
  },
  {
    id:'yalla', name:'YALLA', arabic:'يلا', tier:'core', family:'Street', collection:'Gold Route',
    badge:'MOST POSTED', rank:6, rating:4.7, reviews:96, claimed:291, total:340,
    blurb:'One word, printed big enough to read across a table.',
    desc:'يلا. One word, printed big enough to read across a table. Athletic stencil Arabic cropped off both edges, with the Latin underneath for everyone else. The most-photographed case in the drop.',
    colors:[
      { name:'Ink',    hex:'#0B0B0C', art:'type' },
      { name:'Cobalt', hex:'#2D4EA8', art:'type' },
      { name:'Sadu Red', hex:'#A32B2B', art:'type' }
    ]
  },
  {
    id:'sadu', name:'SADU', tier:'signature', family:'Heritage', collection:'Gold Route',
    badge:'PART TWO', rank:9, rating:4.9, reviews:18, claimed:64, total:200, wave2:true,
    blurb:'The sadu weave, redrawn line by line.',
    desc:'The sadu weave, redrawn line by line and used on one third of the case instead of all of it. Woven patterns as geometry, not as a souvenir. Our National Day case, twelve months a year.',
    colors:[
      { name:'Sand',  hex:'#D8C3A5', art:'stripes' },
      { name:'Bone',  hex:'#F4F1EA', art:'stripes' },
      { name:'Ink',   hex:'#0B0B0C', art:'stripes' }
    ]
  },
  {
    id:'pitch', name:'PITCH 09', tier:'signature', family:'Sport', collection:'Gold Route',
    badge:'NAME + NUMBER', rank:7, rating:4.8, reviews:29, claimed:112, total:200, wave2:true,
    personalisable:true,
    blurb:'Kit language on a phone case.',
    desc:'Kit language on a phone case: sleeve stripes, a mesh panel and a number big enough to see from the stands. Put your own name and number on it in three days. No club, no crest — your colours.',
    colors:[
      { name:'Pitch Green', hex:'#1B4D3E', art:'pitch' },
      { name:'Cobalt',      hex:'#2D4EA8', art:'pitch' },
      { name:'Ink',         hex:'#0B0B0C', art:'pitch' }
    ]
  },
  {
    id:'lulu', name:'LULU', tier:'atelier', family:'Minimal', collection:'Gold Route',
    badge:'ATELIER', rank:8, rating:5.0, reviews:22, claimed:31, total:40,
    blurb:'The softest thing we make.',
    desc:'Named after what this coast used to trade. Lined liquid silicone with a real iridescent shift — gold in the sun, grey in the shade — over a microfibre interior and a 16-magnet MagSafe array. The softest thing we make.',
    colors:[ { name:'Pearl', hex:'#EDE9E3', art:'pearl' } ]
  },
  {
    id:'dhow', name:'DHOW', tier:'atelier', family:'Heritage', collection:'Gold Route',
    badge:'PART TWO', rank:10, rating:4.9, reviews:11, claimed:18, total:50, wave2:true,
    blurb:'Full-grain leather, edge-painted in gold.',
    desc:'Full-grain leather, edge-painted in gold, with a dhow sail blind-debossed into the back — no ink, just shadow. It’ll darken where your fingers sit. That’s the idea.',
    colors:[
      { name:'Tan',  hex:'#A9703F', art:'sail' },
      { name:'Ink',  hex:'#171412', art:'sail' }
    ]
  },
  {
    id:'965', name:'965', tier:'limited', family:'Limited', collection:'Gold Route',
    badge:'100 NUMBERED', rank:11, rating:5.0, reviews:14, claimed:87, total:100,
    blurb:'One hundred exist. Then never again.',
    desc:'965, in real gold foil on Ink Alcantara, numbered by hand. One hundred exist in drop 01. When they’re gone they move to the archive and we never make them again — that’s not a marketing line, it’s the whole promise.',
    colors:[ { name:'Ink Alcantara', hex:'#0B0B0C', art:'foil' } ]
  }
];

const COLLECTIONS = [
  { id:'gold-route', name:'Gold Route', arabic:'طريق الذهب', hex:'#C9922E',
    copy:'Drop 01. Eleven cases about the most precious cargo that ever crossed this water.' },
  { id:'arabic-type', name:'Arabic Type', arabic:'الحروف', hex:'#5B3A29',
    copy:'Letterforms drawn and kerned by hand, reviewed by someone who reads them.' },
  { id:'pitch', name:'Pitch', arabic:'الملعب', hex:'#1B4D3E',
    copy:'Kit language, matchday drops, your name and number. No crests.' },
  { id:'minimal', name:'Minimal', arabic:'البسيط', hex:'#D8C3A5',
    copy:'One colour, no graphics, the monogram hidden inside the bottom edge.' },
  { id:'clear', name:'Clear', arabic:'الشفاف', hex:'#9FB3BC',
    copy:'Bayer-grade, edge-bonded, gold ring showing through the back.' },
  { id:'archive', name:'The Archive', arabic:'الأرشيف', hex:'#0B0B0C',
    copy:'Every drop that has sold out. Nothing here comes back.' }
];

const REVIEWS = [
  { n:'Dana A.', l:'Salmiya', p:'QAHWA · Signature', t:'The Arabic is actually right. I’ve bought three cases with قهوة on them and this is the first one where the letters connect properly.', s:5 },
  { n:'Yousef M.', l:'Jabriya', p:'PITCH 09 · name + number', t:'Ordered on Sunday with my name on it, had it Wednesday. My whole five-a-side team ordered after.', s:5 },
  { n:'Latifa H.', l:'Kuwait City', p:'LULU · Atelier', t:'Bought it as a gift and almost kept it. The box is nicer than the last thing I bought at the mall.', s:5 },
  { n:'Abdullah S.', l:'Hawally', p:'CRYSTAL · Core', t:'Four months in the car in July and still clear. My last clear case was yellow in three weeks.', s:5 },
  { n:'Sara N.', l:'Mishref', p:'INK · Signature', t:'Still matte. That’s all I wanted and nobody else managed it.', s:4 }
];

const ARCHIVE = [
  { name:'965 · DROP 01', total:100, note:'Sold out in 3 days' },
  { name:'SAFRAN · DROP 01', total:200, note:'Sold out in 9 days' }
];

/* ============================================================
   Case renderer — every product image on this site is drawn
   from these primitives, so the prototype needs no photography.
   ============================================================ */
function caseSVG(p, ci, opt){
  opt = opt || {};
  const c = p.colors[ci || 0] || p.colors[0];
  const art = c.art || 'plain';
  const uid = (p.id + '-' + (ci||0) + '-' + Math.random().toString(36).slice(2,7));
  const dark = ['#0B0B0C','#171412','#5B3A29','#1B4D3E','#2D4EA8','#A32B2B'].indexOf(c.hex) > -1;
  const fg = dark ? '#F4F1EA' : '#0B0B0C';
  const gold = '#C9922E';
  const txt = opt.text || '';
  const num = opt.number || '09';
  const isAr = /[؀-ۿ]/.test(txt);

  let body = `<rect x="8" y="8" width="184" height="364" rx="34" fill="${c.hex}"/>`;
  let overlay = '';
  let defs = '';

  if (art === 'clear'){
    defs += `<linearGradient id="g${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".55"/>
      <stop offset=".5" stop-color="${c.hex}" stop-opacity=".38"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity=".22"/></linearGradient>`;
    body = `<rect x="8" y="8" width="184" height="364" rx="34" fill="#B9C4CA" opacity=".30"/>
            <rect x="8" y="8" width="184" height="364" rx="34" fill="url(#g${uid})"/>
            <rect x="14" y="14" width="172" height="352" rx="30" fill="none" stroke="#ffffff" stroke-opacity=".5"/>`;
  }
  if (art === 'gradient'){
    defs += `<linearGradient id="g${uid}" x1=".1" y1="0" x2=".9" y2="1">
      <stop offset="0" stop-color="#E9C87E"/><stop offset=".45" stop-color="${c.hex}" stop-opacity=".82"/>
      <stop offset="1" stop-color="#EFEAE0" stop-opacity=".5"/></linearGradient>`;
    body = `<rect x="8" y="8" width="184" height="364" rx="34" fill="url(#g${uid})"/>`;
    overlay += `<g opacity=".85">
      <path d="M42 336 l16 -10" stroke="${gold}" stroke-width="2" stroke-linecap="round"/>
      <path d="M44 344 l18 -6" stroke="${gold}" stroke-width="2" stroke-linecap="round"/>
      <path d="M42 352 l16 2" stroke="${gold}" stroke-width="2" stroke-linecap="round"/></g>
      <text x="176" y="200" fill="#7A5A1E" font-family="Space Grotesk,sans-serif" font-size="12"
        letter-spacing="5" text-anchor="middle" transform="rotate(90 176 200)">ALSAFRAN</text>`;
  }
  if (art === 'pearl'){
    defs += `<linearGradient id="g${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFF8EC"/><stop offset=".35" stop-color="#EDE9E3"/>
      <stop offset=".62" stop-color="#E4E7EA"/><stop offset="1" stop-color="#F7E9D2"/></linearGradient>`;
    body = `<rect x="8" y="8" width="184" height="364" rx="34" fill="url(#g${uid})"/>`;
  }
  if (art === 'sail'){
    defs += `<linearGradient id="g${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c.hex}"/><stop offset="1" stop-color="#00000055"/></linearGradient>`;
    body = `<rect x="8" y="8" width="184" height="364" rx="34" fill="url(#g${uid})"/>
            <rect x="8" y="8" width="184" height="364" rx="34" fill="none" stroke="${gold}" stroke-width="2" stroke-opacity=".85"/>`;
    overlay += `<g opacity=".42" stroke="${dark?'#F4F1EA':'#3A2413'}" fill="none" stroke-width="1.5">
      <path d="M100 150 L100 300"/><path d="M100 158 L156 300 L100 300 Z"/></g>`;
  }
  if (art === 'stripes'){
    let s = '';
    for (let i=0;i<9;i++){
      const y = 96 + i*22;
      s += `<rect x="118" y="${y}" width="66" height="${i%3===0?7:3}" fill="${i%2?'#A32B2B':fg}" opacity="${i%2?.92:.72}"/>`;
      if (i%3===1) s += `<path d="M124 ${y+12} l10 -9 l10 9 l-10 9 z M148 ${y+12} l10 -9 l10 9 l-10 9 z" fill="#A32B2B" opacity=".8"/>`;
    }
    overlay += s;
  }
  if (art === 'pitch'){
    overlay += `<rect x="8" y="8" width="184" height="96" rx="34" fill="#F4F1EA" opacity=".07"/>
      <g opacity=".18" stroke="#F4F1EA" stroke-width="1">
        ${Array.from({length:9},(_,i)=>`<path d="M${20+i*20} 12 L${20+i*20} 100"/>`).join('')}
      </g>
      <rect x="8" y="120" width="184" height="9" fill="#F4F1EA" opacity=".92"/>
      <rect x="8" y="136" width="184" height="9" fill="#F4F1EA" opacity=".92"/>
      <text x="100" y="288" fill="#F4F1EA" font-family="Archivo,Space Grotesk,sans-serif" font-weight="700"
        font-size="120" text-anchor="middle" opacity=".96">${num}</text>
      ${txt?`<text x="100" y="322" fill="#F4F1EA" font-family="Archivo,sans-serif" font-size="19"
        letter-spacing="4" text-anchor="middle" opacity=".9">${esc(txt.toUpperCase())}</text>`:''}`;
  }
  if (art === 'type'){
    overlay += `<text x="100" y="252" fill="${fg}" font-family="IBM Plex Sans Arabic,Noto Sans Arabic,sans-serif"
        font-weight="700" font-size="150" text-anchor="middle" opacity=".97">${p.arabic||'يلا'}</text>
      <text x="100" y="298" fill="${fg}" font-family="Space Grotesk,sans-serif" font-size="15"
        letter-spacing="9" text-anchor="middle" opacity=".7">${esc(p.name)}</text>`;
  }
  if (art === 'deboss'){
    overlay += `<g opacity=".55">
      <text x="100" y="238" fill="none" stroke="${fg}" stroke-width="1.2"
        font-family="IBM Plex Sans Arabic,Noto Sans Arabic,sans-serif" font-weight="700"
        font-size="86" text-anchor="middle">${p.arabic||'قهوة'}</text></g>
      <text x="100" y="238" fill="${fg}" opacity=".14"
        font-family="IBM Plex Sans Arabic,Noto Sans Arabic,sans-serif" font-weight="700"
        font-size="86" text-anchor="middle">${p.arabic||'قهوة'}</text>`;
  }
  if (art === 'foil'){
    defs += `<linearGradient id="g${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F4D68A"/><stop offset=".45" stop-color="${gold}"/>
      <stop offset="1" stop-color="#8A6019"/></linearGradient>`;
    overlay += `<text x="100" y="266" fill="url(#g${uid})" font-family="Archivo,Space Grotesk,sans-serif"
        font-weight="700" font-size="132" letter-spacing="-6" text-anchor="middle">965</text>
      <text x="100" y="322" fill="${gold}" font-family="Archivo,sans-serif" font-size="12"
        letter-spacing="4" text-anchor="middle" opacity=".9">No. 041 / 100</text>`;
  }
  if (art === 'custom' || opt.custom){
    const fin = opt.finish || gold;
    const fam = isAr ? 'IBM Plex Sans Arabic,Noto Sans Arabic,sans-serif' : 'Space Grotesk,sans-serif';
    const size = isAr ? 62 : Math.max(22, 74 - Math.max(0, txt.length-4)*5.5);
    const pos = opt.place === 'back' ? 230 : (opt.place === 'left' ? 200 : 326);
    const t = esc(isAr ? txt : txt.toUpperCase());
    if (opt.place === 'left'){
      overlay += `<text x="46" y="${pos}" fill="${fin}" font-family="${fam}" font-weight="700"
        font-size="30" letter-spacing="6" text-anchor="middle" transform="rotate(-90 46 ${pos})">${t}</text>`;
    } else {
      overlay += `<text x="100" y="${pos}" fill="${fin}" font-family="${fam}" font-weight="700"
        font-size="${size}" letter-spacing="${isAr?0:2}" text-anchor="middle">${t}</text>`;
    }
  }

  // shared furniture: camera module, MagSafe ring, saffron thread, buttons
  const camera = `
    <rect x="22" y="22" width="88" height="88" rx="24" fill="#000" opacity="${art==='clear'?.10:.16}"/>
    <circle cx="46" cy="46" r="15" fill="#111" stroke="#3A3A3D"/><circle cx="46" cy="46" r="6" fill="#2B3A4A"/>
    <circle cx="86" cy="46" r="15" fill="#111" stroke="#3A3A3D"/><circle cx="86" cy="46" r="6" fill="#2B3A4A"/>
    <circle cx="46" cy="86" r="15" fill="#111" stroke="#3A3A3D"/><circle cx="46" cy="86" r="6" fill="#2B3A4A"/>
    <circle cx="88" cy="88" r="7" fill="#1B1B1E"/>`;
  const ring = (p.tier === 'core' && art !== 'clear') ? '' :
    `<circle cx="100" cy="204" r="41" fill="none" stroke="${gold}" stroke-width="2" stroke-opacity="${art==='clear'?.95:.34}"/>
     <circle cx="100" cy="204" r="34" fill="none" stroke="${gold}" stroke-width="1" stroke-opacity="${art==='clear'?.55:.18}"/>`;
  // the Saffron Thread: one hairline stroke with three strands, on every product we make
  const thread = `<g opacity=".85" stroke="${gold}" stroke-width="1.5" stroke-linecap="round" fill="none">
      <path d="M78 356 h30"/>
      <path d="M108 356 c5 -1 8 -4 10 -8"/>
      <path d="M108 356 c6 0 10 1 13 3"/>
      <path d="M108 356 c5 2 7 5 8 9"/></g>`;
  const buttons = `<g fill="${dark?'#F4F1EA':'#7A7A7E'}" opacity=".5">
      <rect x="4" y="112" width="5" height="26" rx="2.5"/>
      <rect x="4" y="152" width="5" height="42" rx="2.5"/>
      <rect x="4" y="202" width="5" height="42" rx="2.5"/>
      <rect x="191" y="150" width="5" height="58" rx="2.5"/></g>`;

  return `<svg viewBox="0 0 200 380" xmlns="http://www.w3.org/2000/svg" role="img"
    aria-label="${esc(p.name)} case in ${esc(c.name)}">
    <defs>${defs}</defs>
    ${body}${overlay}${camera}${ring}${thread}${buttons}
    <rect x="8" y="8" width="184" height="364" rx="34" fill="none" stroke="#000" stroke-opacity=".10"/>
  </svg>`;
}

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}
function kd(n){ return Number(n).toFixed(3) + ' KD'; }
function priceOf(p){ return TIERS[p.tier].price; }
