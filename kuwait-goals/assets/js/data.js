/* ============================================================================
   KUWAIT'S RECYCLING GOALS — verified data layer
   ----------------------------------------------------------------------------
   RULE OF THIS FILE: every number carries its source. Nothing is estimated,
   interpolated or rounded into existence. If a figure is not in an official
   document, it is not in here — it is recorded as `null` with a `gap` note.

   Primary sources
   S1  Kuwait Environment Public Authority (KEPA) — "Waste Management Atlas of
       Kuwait", incl. the Kuwait National Waste Management Strategy 2040
       (KNWMS 2040): 5 Objectives and 25 Targets, pp. 22–25.
       https://epa.gov.kw/Portals/0/PDF/Atlas_En.pdf
   S2  Kuwait Central Statistical Bureau (CSB) — SDG portal, Goal 12,
       indicator 12.5.1. https://sdg.csb.gov.kw/G12_Idicator_EN?id=122
   S3  State of Kuwait — The Second Voluntary National Review Report on the
       SDGs (VNR2), 2023. https://kuwait.un.org/sites/default/files/2023-09/VNR2_English_Final.pdf
   S4  Kuwait CSB — SDG portal, Goal 12 overview. https://sdg.csb.gov.kw/g12_EN
   ========================================================================== */

const SOURCES = {
  S1: {
    id:'S1',
    org:'Kuwait Environment Public Authority (KEPA)',
    title:'Waste Management Atlas of Kuwait — Kuwait National Waste Management Strategy 2040',
    url:'https://epa.gov.kw/Portals/0/PDF/Atlas_En.pdf',
    note:'Official EPA publication of the KNWMS 2040. Targets appear on pp. 24–25 ("5 Objectives and 25 Targets"). Strategy developed with the Fraunhofer Institute UMSICHT under the eMISKWaste project; waste reference years 2018–2020.'
  },
  S2: {
    id:'S2',
    org:'Kuwait Central Statistical Bureau (CSB)',
    title:'SDG portal — Goal 12, indicator 12.5.1 "National recycling rate, tons of material recycled"',
    url:'https://sdg.csb.gov.kw/G12_Idicator_EN?id=122',
    note:'Kuwait’s official SDG database. The published table has two columns only — Year and Data — with no unit column.'
  },
  S3: {
    id:'S3',
    org:'State of Kuwait — Permanent National Steering Committee for Agenda 2030',
    title:'The Second Voluntary National Review Report on the SDGs (VNR2), 2023',
    url:'https://kuwait.un.org/sites/default/files/2023-09/VNR2_English_Final.pdf',
    note:'Kuwait’s own report to the United Nations. p. 73 states the unit of indicator 12.5.1; Table 2 (p. 5) gives SDG achievement percentages for 2019.'
  },
  S4: {
    id:'S4',
    org:'Kuwait Central Statistical Bureau (CSB)',
    title:'SDG portal — Goal 12: Ensure sustainable consumption and production patterns',
    url:'https://sdg.csb.gov.kw/g12_EN',
    note:'Official Kuwaiti statement of what SDG 12 and its targets mean for Kuwait.'
  },
  S5: {
    id:'S5',
    org:'Kuwait Central Statistical Bureau (CSB)',
    title:'SDG portal — Goal 12, indicator 12.6.1 "Number of companies reporting sustainability"',
    url:'https://sdg.csb.gov.kw/G12_Idicator_EN?id=123',
    note:'The portal renders this indicator with a single row carrying no year and a value of 0 — i.e. no national figure has been published.'
  }
};

/* ---------------------------------------------------------------------------
   1. THE KNWMS 2040 — vision, hierarchy, objectives
   ------------------------------------------------------------------------- */

const KNWMS = {
  name:'Kuwait National Waste Management Strategy 2040',
  short:'KNWMS 2040',
  owner:'Kuwait Environment Public Authority (KEPA)',
  structure:'5 objectives · 25 targets · 25 action plans',
  horizon:[2022, 2030, 2040],
  source:'S1',
  vision:'The vision of the National Waste Management Strategy Kuwait is developing an effective waste management system which minimizes the adverse effects of waste generation and management on human health and the environment while enabling the effective application of the five-step waste hierarchy to ensure efficient, safe and environmentally sound utilization of waste streams as resources.',
  hierarchy:[
    { step:'Prevention',          rank:'Most preferred' },
    { step:'Preparing for re-use', rank:'' },
    { step:'Recycling',           rank:'' },
    { step:'Recovery',            rank:'' },
    { step:'Disposal',            rank:'Least preferred' }
  ],
  objectives:[
    { n:1, short:'Move towards environmentally sound waste management technologies',
      long:'Moving towards environmentally sound waste management technologies in order to mitigate negative effects on human health and the environment.' },
    { n:2, short:'Implement the five-step waste hierarchy',
      long:'Moving towards a waste management system which implements the five-step waste hierarchy in order to stimulate resource efficiency.' },
    { n:3, short:'Set clear responsibilities and legislation',
      long:'Clearly defining public and private responsibilities and adopting legislation which is comprehensive and coherent and, after adoption, enforcing legislation.' },
    { n:4, short:'Build up sufficient capabilities among actors in waste management',
      long:'Ensuring that all actors in the waste management system have sufficient knowledge, skills, and equipment to fulfil their roles and responsibilities.' },
    { n:5, short:'Make available all necessary information',
      long:'Set up and implement a data provision plan to distribute relevant waste data to other authorities and public by EPA by 31st of December 2026.' }
  ],
  financing:[
    'Involvement of private sector through public-private partnerships',
    'Adjustment of gate fees',
    'Extended producer responsibility',
    'Gradual adjustment of waste charges',
    'Generation of financing through increased recycling and utilisation of refuse derived fuel (RDF)'
  ],
  /* Verbatim from S1, p. 25 */
  separationPlan:'What is most relevant for the citizens is that the success of the strategy depends on a better separation of waste at the sources. In order to achieve that, Kuwait will provide infrastructure to separate paper and other dry recyclables, but also hazardous components such as waste electronics or batteries from household waste.',
  separationStreams:[
    { icon:'📄', label:'Paper',                    detail:'Named in the strategy text as a stream Kuwait will provide separation infrastructure for.' },
    { icon:'♻️', label:'Other dry recyclables',    detail:'Named in the strategy text alongside paper.' },
    { icon:'🔌', label:'Waste electronics (WEEE)', detail:'Named as a hazardous component to be separated from household waste.' },
    { icon:'🔋', label:'Batteries',                detail:'Named as a hazardous component to be separated from household waste.' },
    { icon:'☣️', label:'Hazardous household waste', detail:'Target 20 of the 25: "Separate collection of hazardous household waste".' }
  ]
};

/* ---------------------------------------------------------------------------
   2. THE 2040 TARGETS — treatment splits per waste stream
   Every percentage below is printed in S1, pp. 24–25.
   ------------------------------------------------------------------------- */

const TARGETS = [
  {
    id:'msw',
    icon:'🗑️',
    stream:'Municipal Solid Waste',
    headline:30,
    headlineLabel:'recycling target',
    deadline:2040,
    split:[
      { key:'recycling', label:'Recycling',      value:30 },
      { key:'recovery',  label:'Other recovery', value:35 },
      { key:'disposal',  label:'Disposal',       value:35 }
    ],
    targetText:'Waste hierarchy for municipal solid waste (30% recycling, 35% recovery)',
    responsible:'KEPA, Kuwait Municipality, PAI',
    source:'S1',
    note:'Municipal solid waste is household waste plus household-like waste from companies. Kuwait generates 1.6 kg of it per person per day — above the GCC average of 1.5 kg and more than twice the global average of 0.74 kg.'
  },
  {
    id:'cd',
    icon:'🏗️',
    stream:'Construction & Demolition Waste',
    headline:15,
    headlineLabel:'recycling target',
    deadline:2040,
    split:[
      { key:'recycling', label:'Recycling',      value:15 },
      { key:'recovery',  label:'Other recovery', value:30 },
      { key:'disposal',  label:'Disposal',       value:55 }
    ],
    targetText:'Construction & Demolition waste: 15 % recycling, 30 % recovery',
    responsible:'KEPA, Kuwait Municipality, PAI',
    source:'S1',
    note:'The single largest waste stream in Kuwait: 22,500 thousand tonnes a year, 53% of all non-household waste. The recycling target is the lowest of the four because the volumes are so large.'
  },
  {
    id:'weee',
    icon:'🔌',
    stream:'Electronic Waste (WEEE)',
    headline:50,
    headlineLabel:'collection rate target',
    deadline:2040,
    split:[
      { key:'recycling', label:'Recycling',      value:50 },
      { key:'recovery',  label:'Other recovery', value:30 },
      { key:'disposal',  label:'Disposal',       value:20 }
    ],
    targetText:'Safe disposal of WEEE (50 % collection rate)',
    responsible:'KEPA',
    source:'S1',
    note:'The atlas states this target twice and in two forms. The written target reads "Safe disposal of WEEE (50 % collection rate)". The accompanying infographic splits the same stream 50% recycling / 30% other recovery / 20% disposal. Both are reproduced here exactly as published; the card headline uses the written target.',
    caution:true
  },
  {
    id:'sludge',
    icon:'🌱',
    stream:'Sewage Sludge',
    headline:80,
    headlineLabel:'soil application / recycling target',
    deadline:2040,
    split:[
      { key:'recycling', label:'Soil application (recycling)', value:80 },
      { key:'recovery',  label:'Energy recovery',              value:20 }
    ],
    targetText:'Sewage sludge: 80 % soil application (recycling), 20 % energy recovery',
    responsible:'KEPA, MPW, PAAFR',
    source:'S1',
    note:'The only stream where the strategy sends the large majority back into productive use. No share at all is allocated to disposal.'
  }
];

/* The 25 targets, grouped under the objective each one serves (S1, p. 25).   */
const TARGET_LIST = [
  { objective:1, text:'Prohibit landfilling of waste with high organic content', who:'KM, MoH, KEPA, MPW, PAI' },
  { objective:1, text:'Rehabilitate authorised landfills', who:'KEPA, KM' },
  { objective:1, text:'Rehabilitate harmful unauthorised dumpsites', who:'KEPA, KM' },
  { objective:1, text:'Prevent further unauthorised waste dumping', who:'KEPA' },
  { objective:1, text:'Industrial hazardous waste: safe disposal, <1% export, 45% landfill', who:'KEPA, PAI' },
  { objective:1, text:'Safe disposal of asbestos and other hazardous construction waste', who:'KEPA, KM, PAI' },
  { objective:1, text:'100% incineration of medical hazardous waste', who:'KEPA, MoH' },
  { objective:1, text:'Safe disposal of WEEE (50 % collection rate)', who:'KEPA' },
  { objective:1, text:'Separate collection of hazardous household waste', who:'KM' },
  { objective:2, text:'Waste hierarchy for municipal solid waste (30% recycling, 35% recovery)', who:'KEPA, KM, PAI' },
  { objective:2, text:'Construction & Demolition waste: 15 % recycling, 30 % recovery', who:'KEPA, KM, PAI' },
  { objective:2, text:'Sewage sludge: 80 % soil application (recycling), 20 % energy recovery', who:'KEPA, MPW, PAAFR' },
  { objective:3, text:'Strengthen Environmental Protection Law', who:'KEPA' },
  { objective:3, text:'Adapt Executive Regulations for relevant waste streams', who:'KEPA' },
  { objective:3, text:'Allocate responsibilities of public authorities', who:'KEPA' },
  { objective:3, text:'Develop enforcement system', who:'KEPA' },
  { objective:4, text:'Capacity building: public sector', who:'KEPA, KM, MoH, MPW, PAI, KGAC' },
  { objective:4, text:'Capacity building: non-household waste generators', who:'KEPA, waste producers' },
  { objective:4, text:'Capacity building: waste management sector', who:'KM, MoH, MPW, PAI, KGAC' },
  { objective:4, text:'Launch citizen’s awareness campaign', who:'KM' },
  { objective:4, text:'Implement work safety regulations', who:'KEPA, MoH, (PAI)' },
  { objective:5, text:'Provide waste data to KEPA', who:'KEPA, waste producers' },
  { objective:5, text:'Implement waste monitoring system by KEPA', who:'KEPA' },
  { objective:5, text:'Acquire monitoring equipment', who:'KEPA' },
  { objective:5, text:'Distribute and publish waste data', who:'KEPA' }
];

/* Landfill targets get their own block — four of the 25 targets are about     */
/* landfills and dumpsites, and they are the ones with a measurable baseline.  */
const LANDFILL_GOALS = [
  { icon:'🏚️', goal:'Rehabilitate authorised landfills',
    detail:'Kuwait has 19 major landfill sites. Six are still in operation, and most are not properly engineered — no protective liner beneath the waste body and no landfill gas collection.', source:'S1' },
  { icon:'⚠️', goal:'Rehabilitate harmful unauthorised dumpsites',
    detail:'Unauthorised dumping sites are to be identified and remediated, not merely closed.', source:'S1' },
  { icon:'🚫', goal:'Prevent further unauthorised waste dumping',
    detail:'An enforcement system is one of the 25 targets in its own right, under objective 3.', source:'S1' },
  { icon:'🔥', goal:'Prohibit landfilling of waste with high organic content',
    detail:'Three municipal landfills — Al-Jahra, South of 7th Ring Road and Mina Abdullah — emit 96% of Kuwait’s landfill gas (45,500 m³ per hour of a national 47,500 m³ per hour). The ban targets exactly this.', source:'S1' }
];

/* ---------------------------------------------------------------------------
   3. WHERE KUWAIT ACTUALLY IS — measured, published figures
   ------------------------------------------------------------------------- */

/* Treatment of all waste in Kuwait, 2018 (S1). Total 44,654 thousand t = 100% */
const TREATMENT_2018 = {
  year:2018,
  unit:'thousand tonnes per year',
  total:44654,
  source:'S1',
  rows:[
    { label:'Municipal landfills',                    value:20995, pct:47 },
    { label:'Clay used for backfilling',              value:14476, pct:32 },
    { label:'Recycling',                              value:4822,  pct:11 },
    { label:'Sand used for landfill construction',    value:4195,  pct:9  },
    { label:'Solid industrial waste treatment centre',value:114,   pct:null, pctText:'<1' },
    { label:'End-of-life vehicle treatment',          value:78,    pct:null, pctText:'<1' },
    { label:'Medical waste incinerators',             value:5,     pct:null, pctText:'<1' }
  ],
  headline:'The estimated amount of recycled waste in Kuwait is 4.8 million tons per year. That is equivalent to an overall recycling rate of 11 % of the generated waste. For comparison, countries with high rates like Germany or South Korea recycle around 50 % of their waste.'
};

/* What actually gets recycled, by material, 2018 (S1) */
const RECYCLED_BY_MATERIAL = {
  year:2018, unit:'thousand tonnes per year', total:4822, source:'S1',
  rows:[
    { label:'Minerals',          value:3372 },
    { label:'Metal',             value:1144 },
    { label:'Paper',             value:118  },
    { label:'Glass',             value:60   },
    { label:'Used mineral oil',  value:44   },
    { label:'Plastic',           value:35   },
    { label:'End-of-life vehicles', value:35 },
    { label:'Cardboard',         value:9    },
    { label:'Batteries',         value:3    },
    { label:'Others (WEEE, wood, cartridges, used cooking oil)', value:1 }
  ],
  note:'Two materials — minerals and metal — are 94% of everything Kuwait recycles. WEEE is not even reported on its own line; it sits inside a combined "others" category of 1 thousand tonnes a year.'
};

/* Landfill estate, 2020 (S1) */
const LANDFILL_STATE = {
  year:2020, source:'S1',
  totalAreaKm2:19.8,
  sites:19, inOperation:6,
  volumeMillionM3:214.3,
  gasM3PerHour:47500,
  areaSplit:[
    { label:'Closed',        km2:9.6, pct:48 },
    { label:'In operation',  km2:8.3, pct:42 },
    { label:'Rehabilitated', km2:2.0, pct:10 }
  ],
  note:'19.8 km² of Kuwait contains landfilled waste — 0.1% of the land area, or 2,800 football pitches.'
};

/* Household waste composition, 2018 (S1) */
const HOUSEHOLD_COMPOSITION = {
  year:2018, source:'S1',
  totalKt:1439,
  perCapitaKgDayHousehold:0.85,
  perCapitaKgDayMSW:1.6,
  benchmarkGlobal:0.74,
  benchmarkGCC:1.5,
  rows:[
    { label:'Others',                  pct:26.2 },
    { label:'Organic material',        pct:25.8 },
    { label:'Plastics',                pct:16.7 },
    { label:'Paper and cardboard',     pct:12.1 },
    { label:'Fine fraction (<10 mm)',  pct:6.7  },
    { label:'Compounds',               pct:5.9  },
    { label:'Metals',                  pct:2.9  }
  ]
};

/* ---------------------------------------------------------------------------
   4. SDG 12 — indicator 12.5.1 over time
   Values exactly as published by CSB (S2). Unit confirmed by Kuwait's own VNR2
   (S3, p. 73). No year is interpolated; these are all the years CSB publishes.
   ------------------------------------------------------------------------- */

const INDICATOR_1251 = {
  code:'12.5.1',
  name:'National recycling rate, tons of material recycled',
  publisher:'Kuwait Central Statistical Bureau',
  columnHeader:'Data',
  unitPublished:null,
  unitClarified:'per cent of the total solid waste generated',
  unitEvidence:'CSB publishes this series under two column headings only — "Year" and "Data" — with no unit. Kuwait’s Second Voluntary National Review (2023) states the unit directly: "In 2015, Kuwait recorded a good performance in terms of recycling solid wastes indicator 12.5.1, achieving recycling of 2.94 per cent of the total solid waste generated. This effort however, requires further boosting, as the percentage went down to 0.76 per cent in 2021, the lowest rate recorded."',
  sources:['S2','S3'],
  series:[
    { year:2015, value:2.94 },
    { year:2016, value:1.24 },
    { year:2017, value:1.05 },
    { year:2018, value:1.50 },
    { year:2019, value:1.10 },
    { year:2020, value:0.81 },
    { year:2021, value:0.76 }
  ],
  whatItMeasures:'The share of all solid waste generated in Kuwait in a given year that was recycled. It is a whole-country figure covering every waste stream at once — household, commercial, industrial, construction and demolition. It is NOT the recycling rate of household bins, and it is NOT the same measurement as the 30% municipal-solid-waste target or the 15% construction-and-demolition target, each of which applies to one stream only.',
  misreadWarning:'Do not read this line as "Kuwait is at 0.76% on the way to 30%". The two numbers count different things. The 30% target is a share of one stream (municipal solid waste); 0.76% is a share of all solid waste generated in the country.'
};

const SDG12 = {
  goal:'Goal 12: Ensure sustainable consumption and production patterns',
  csbSummary:'Using environmentally friendly production methods and reducing the amount of waste we generate are targets for Goal 12. National recycling rates should increase by 2030, measured in tons of recycled material. In addition, companies should adopt sustainable practices and publish sustainability reports.',
  applicableIndicators:9,
  totalIndicators:13,
  numberOfTargets:11,
  source:'S4',
  targets:[
    { id:'12.1', icon:'📋', text:'Implementation of the 10-year framework of programs on sustainable consumption and production patterns, with all countries taking action and taking the lead of developed countries, taking into account the level of development and capacity of developing countries' },
    { id:'12.2', icon:'⛏️', text:'Achieve sustainable management and efficient use of natural resources by 2030' },
    { id:'12.3', icon:'🍽️', text:'Halving global food waste per retail and consumer space, reducing food losses in production and supply chains, including post-harvest losses by 2030' },
    { id:'12.4', icon:'☣️', text:'To achieve the environmentally sound management of chemicals and all wastes throughout their lifecycle, in accordance with agreed international frameworks, and to significantly reduce their release into air, water and soil in order to minimize their adverse effects on human health and the environment by 2020' },
    { id:'12.5', icon:'♻️', text:'Reduce waste production, through prevention, reduction, recycling and reuse, by 2030', highlight:true },
    { id:'12.6', icon:'🏢', text:'Encourage companies, particularly large and transnational corporations, to adopt sustainable practices and incorporate sustainability information into their reporting cycle', highlight:true },
    { id:'12.7', icon:'🧾', text:'Promote sustainable public procurement practices, in accordance with national policies and priorities' },
    { id:'12.8', icon:'🎓', text:'Ensure that people everywhere have relevant information and awareness of sustainable development and lifestyles in harmony with nature by 2030' }
  ],
  pillars:[
    { icon:'🚯', label:'Reducing waste',   text:'Target 12.5 asks Kuwait to reduce waste production by 2030 — reduction first, not recycling first.' },
    { icon:'🛑', label:'Prevention',       text:'Prevention is the top step of the KNWMS 2040 waste hierarchy and the first word of target 12.5.' },
    { icon:'🔁', label:'Reuse',            text:'"Preparing for re-use" sits second in the national hierarchy, above recycling.' },
    { icon:'♻️', label:'Recycling',        text:'CSB: "National recycling rates should increase by 2030, measured in tons of recycled material."' },
    { icon:'🏭', label:'Sustainable production', text:'Target 12.2 — sustainable management and efficient use of natural resources by 2030.' },
    { icon:'🏢', label:'Sustainable business practice', text:'Target 12.6 — companies are encouraged to adopt sustainable practices and to publish sustainability information in their reporting cycle.' }
  ],
  achievement2019:{ value:28.9, year:2019, source:'S3',
    note:'Kuwait’s own VNR2 puts SDG 12 achievement at 28.9% as of 2019 — the second-lowest of the 17 goals it scores.' },
  indicator1261:{ name:'Number of companies reporting sustainability', code:'12.6.1', source:'S5',
    published:false,
    note:'Kuwait’s official SDG database carries this indicator but publishes no figure for it: the table renders one row with a blank year and a value of 0. There is no national count of how many Kuwaiti companies report on sustainability.' }
};

/* ---------------------------------------------------------------------------
   5. GOALS VS REALITY — only like-for-like pairs become progress bars
   ------------------------------------------------------------------------- */

const COMPARISONS = [
  {
    comparable:true,
    title:'Landfill area rehabilitated',
    category:'Landfill estate (km² of land containing waste)',
    currentLabel:'Rehabilitated by 2020',
    currentValue:10,
    currentDetail:'2.0 km² of the 19.8 km² that contains landfilled waste. A further 48% is closed but not rehabilitated, and 42% is still in operation.',
    targetLabel:'KNWMS 2040 target',
    targetValue:100,
    targetDetail:'The strategy target is to rehabilitate authorised landfills and harmful unauthorised dumpsites. It sets no percentage, so 100% is drawn as the stated intent — every site, not a share of them.',
    targetIsStated:false,
    sources:['S1'],
    why:'Both numbers are measured the same way — share of landfill area — and come from the same EPA publication.'
  },
  {
    comparable:true,
    title:'National recycling rate against its own best year',
    category:'All solid waste generated in Kuwait (SDG indicator 12.5.1)',
    currentLabel:'2021 (latest published)',
    currentValue:0.76,
    scaleMax:3,
    currentDetail:'0.76% — the lowest rate Kuwait has recorded in the published series.',
    targetLabel:'2015 (best published year)',
    targetValue:2.94,
    targetDetail:'2.94% — Kuwait’s own high-water mark, six years before the latest reading.',
    targetIsStated:true,
    sources:['S2','S3'],
    why:'This compares one indicator against itself across years — identical definition, identical publisher, identical method. It is the only fully like-for-like recycling comparison available, and the direction of travel is downward.'
  }
];

/* Pairs that look comparable and are not. Shown deliberately, not hidden.     */
const NON_COMPARISONS = [
  {
    a:'30% municipal solid waste recycling (2040 target, KEPA)',
    b:'0.76% national recycling rate (2021, CSB)',
    why:'Different denominators. The target is a share of one stream — municipal solid waste. The indicator is a share of all solid waste generated in the country, a total dominated by construction, demolition and mining waste. Dividing one by the other produces a number that means nothing.'
  },
  {
    a:'30% municipal solid waste recycling (2040 target, KEPA)',
    b:'11% overall recycling rate (2018, KEPA)',
    why:'Same publisher, still different scope. The 11% covers all waste Kuwait generates; the 30% covers municipal solid waste only. Kuwait does not publish a current recycling rate for municipal solid waste on its own.'
  },
  {
    a:'15% construction & demolition recycling (2040 target, KEPA)',
    b:'3,372 thousand tonnes of minerals recycled (2018, KEPA)',
    why:'The recycled "minerals" line is not published as a percentage of construction and demolition waste, and the two categories are not defined identically. Turning them into a rate would mean doing arithmetic the source did not do.'
  },
  {
    a:'50% WEEE collection rate (2040 target, KEPA)',
    b:'— no baseline exists —',
    why:'Kuwait publishes no e-waste collection rate. In the 2018 recycling figures, WEEE is not given its own line at all: it is folded into a combined "others" category totalling 1 thousand tonnes a year. There is nothing to compare the target to.'
  },
  {
    a:'80% sewage sludge soil application (2040 target, KEPA)',
    b:'— no baseline exists —',
    why:'No current split of sewage sludge between soil application and energy recovery is published in the atlas, so the 2040 target has no measured starting point in the public record.'
  }
];

/* ---------------------------------------------------------------------------
   6. THE COMPANY DATASET
   ----------------------------------------------------------------------------
   HOW THIS WAS BUILT, AND WHAT IT IS NOT.

   This is a hand-researched sample of 14 large companies operating in Kuwait,
   selected because they publish environmental disclosures that can be checked.
   That selection is the whole caveat: it is not a random sample, not a survey,
   and not representative of Kuwaiti business as a whole. Small and unlisted
   firms — most of the economy — are absent by construction. Read every
   percentage below as "of these 14 researched companies", never as
   "of companies in Kuwait".

   A flag is set true ONLY where a specific published claim supports it. Where
   a company simply does not disclose, the flag is false — false here means
   "not found in published disclosure", not "the company does not do this".
   ------------------------------------------------------------------------- */

const PRACTICE_DEFS = [
  { key:'recyclingProgram',  icon:'♻️', label:'Recycling programme',
    test:'A named, operating programme that collects material from the company’s own operations for recycling.' },
  { key:'plasticReduction',  icon:'🧴', label:'Plastic reduction',
    test:'A published initiative that cuts virgin plastic use or diverts plastic from disposal.' },
  { key:'paperRecycling',    icon:'📄', label:'Paper recycling',
    test:'Paper specifically collected and sent for recycling, with a figure or a stated rate.' },
  { key:'eWasteRecycling',   icon:'🔌', label:'Electronic-waste recycling',
    test:'Electronic waste specifically collected and sent for recycling or refurbishment.' },
  { key:'wasteSeparation',   icon:'🗑️', label:'Waste separation',
    test:'Waste separated into distinct streams at the company’s own premises.' },
  { key:'sustainabilityTargets', icon:'🌱', label:'Sustainability targets',
    test:'A quantified or dated environmental target, not merely an activity.' },
  { key:'sustainabilityReport',  icon:'📑', label:'Sustainability report',
    test:'A published sustainability or ESG report.' }
];

const COMPANIES = [
  {
    name:'National Bank of Kuwait (NBK)', sector:'Banking',
    recyclingProgram:true, plasticReduction:true, paperRecycling:true,
    eWasteRecycling:false, wasteSeparation:false, sustainabilityTargets:true,
    sustainabilityReport:true,
    evidence:[
      'Recycled approximately 86% of its total paper consumption in 2024.',
      'Renewed its waste removal and management partnership with Omniya, associated with a reduction of 462.5 tonnes of CO₂.',
      'Cut total greenhouse gas emissions 28.30% against a 2021 baseline, passing its interim 2025 target early.',
      'Kuwait’s VNR2 records NBK achieving 100% paper recycling and a 64% cut in plastic consumption in its 2021 reporting.'
    ],
    links:[
      { label:'NBK 2024 Sustainability Report (announcement)', url:'https://www.nbk.com/news-and-insights/Media-Relations/news.html?news=nbk-issues-2024-sustainability-report' },
      { label:'Kuwait VNR2 2023, p. 88', url:'https://kuwait.un.org/sites/default/files/2023-09/VNR2_English_Final.pdf' }
    ]
  },
  {
    name:'Kuwait Finance House (KFH)', sector:'Banking',
    recyclingProgram:true, plasticReduction:true, paperRecycling:true,
    eWasteRecycling:false, wasteSeparation:false, sustainabilityTargets:true,
    sustainabilityReport:true,
    evidence:[
      'Recycled 67,515 kg of paper, which it estimates preserved about 1,147 mature trees.',
      '85% of credit cards issued in 2025 were made from recycled plastic, up 66.67% year on year.',
      'Ran a plastic-bottle recycling campaign ("Keep it Green") at Assima Mall.',
      'Publishes principles for reducing energy, paper and water consumption; sixth annual sustainability report.'
    ],
    links:[
      { label:'KFH Sustainability Report 2024 (PDF)', url:'https://www.kfh.com/dam/jcr:c938b7d5-506e-4c8e-b05f-5f2da9f9cc5d/KFH%20Sustainability%20Report%202024.pdf' }
    ]
  },
  {
    name:'Gulf Bank', sector:'Banking',
    recyclingProgram:true, plasticReduction:true, paperRecycling:false,
    eWasteRecycling:true, wasteSeparation:false, sustainabilityTargets:true,
    sustainabilityReport:true,
    evidence:[
      'Recycled over 22.3 tonnes of electronic waste across two years with a specialist partner (18 tonnes reported by February 2023).',
      'Distributed over 100,000 reusable bags with cooperative societies, and repurposes expired street advertising material into reusable bags.',
      'Published an ESG strategy covering 2024–2030, overseen by a board-chaired sustainability committee.',
      'Paper: reported reducing paper waste by one million sheets — a reduction, not a recycling figure, so the paper-recycling flag is left false.'
    ],
    links:[
      { label:'Gulf Bank recycles 18 tons of electronic waste', url:'https://www.e-gulfbank.com/en/about-us/media/press-releases/2023/02/gulf-bank-recycles-18-tons-of-electronic-waste/' },
      { label:'Gulf Bank — "A Step Towards Change"', url:'https://www.e-gulfbank.com/en/about-us/media/press-releases/2024/01/gulf-bank-launches-a-step-towards-change-environmental-sustainability-initiative/' }
    ]
  },
  {
    name:'Boubyan Bank', sector:'Banking',
    recyclingProgram:true, plasticReduction:false, paperRecycling:true,
    eWasteRecycling:true, wasteSeparation:false, sustainabilityTargets:false,
    sustainabilityReport:true,
    evidence:[
      'Recycled 100% of paper waste in its 2024 report; about 1,500 kg of paper in 2025, avoiding an estimated 1,739.7 kg CO₂e.',
      'Recycles 100% of the electronic waste generated by its operations.',
      'Publishes an annual sustainability report; 2025 edition titled "Embedding ESG: Driving Responsible Growth".',
      'No quantified, dated environmental target was found in the published summaries, so that flag is left false.'
    ],
    links:[
      { label:'Boubyan Bank 2025 Sustainability Report (announcement)', url:'https://www.zawya.com/en/press-release/companies-news/boubyan-bank-releases-its-2025-annual-sustainability-report-titled-embedding-esg-driving-responsible-growth-typntqbc' }
    ]
  },
  {
    name:'Burgan Bank', sector:'Banking',
    recyclingProgram:true, plasticReduction:true, paperRecycling:true,
    eWasteRecycling:true, wasteSeparation:true, sustainabilityTargets:true,
    sustainabilityReport:true,
    evidence:[
      'Head-office waste management and recycling programme with Tadwire covering cardboard, paper, plastic, wood and electronic waste — separated on site.',
      'Recycled waste rose from 4 tonnes in 2024 to 91 tonnes in 2025; total waste generation fell about 12%.',
      'Headquarters certified LEED Gold (O+M v4.1).',
      'Sixth annual sustainability report; first bank in Kuwait to publish its 2024 report. Publishes a standalone ESG policy.'
    ],
    links:[
      { label:'Burgan Bank 2023 Sustainability Report (PDF)', url:'https://www.burgan.com/Reports%20Framework%20and%20Policies/BurganBank2023SustainabilityReport.pdf' },
      { label:'Burgan Bank & Tadwire waste initiative', url:'https://kuwaittimes.com/article/23778/kuwait/other-news/burgan-bank-tadwire-launch-responsible-waste-management-initiative/' }
    ]
  },
  {
    name:'Zain', sector:'Telecom',
    recyclingProgram:true, plasticReduction:true, paperRecycling:true,
    eWasteRecycling:true, wasteSeparation:true, sustainabilityTargets:true,
    sustainabilityReport:true,
    evidence:[
      'Waste Management Policy developed in 2023 "with the goal of eliminating all forms of waste, including e-waste, plastic waste, and wood and paper waste, by 2030".',
      'Zain Kuwait works with TadwiRe, described in the report as the first recycling facility of its kind in Kuwait, and is installing internal e-waste bins.',
      'Zain Kuwait collected, over Q2–Q3 2024: 20,946 kg paper, 1,086.5 kg plastic, 326 kg wood and 107 kg e-waste — separated by stream.',
      'The clearest company-level waste target found in this sample, because it names a year and a scope.'
    ],
    links:[
      { label:'Zain Sustainability Report 2024 — Sustainability Agenda', url:'https://zain.com/SR2024/18-sustainability-agenda/' }
    ]
  },
  {
    name:'stc Kuwait', sector:'Telecom',
    recyclingProgram:true, plasticReduction:false, paperRecycling:false,
    eWasteRecycling:true, wasteSeparation:false, sustainabilityTargets:false,
    sustainabilityReport:true,
    evidence:[
      'Signed a partnership with Tadwire to recycle e-waste and other waste generated by its operations.',
      'Publishes a sustainability review in its annual report and a standalone 2025 sustainability report.'
    ],
    links:[
      { label:'stc Kuwait Sustainability Report 2025 (PDF)', url:'https://cws.stc.com.kw/DigitalStatic/AnnualReport2025/pdfs/sections/en/Sustainability%20Report.pdf' }
    ]
  },
  {
    name:'Ooredoo Kuwait', sector:'Telecom',
    recyclingProgram:true, plasticReduction:false, paperRecycling:false,
    eWasteRecycling:true, wasteSeparation:false, sustainabilityTargets:false,
    sustainabilityReport:true,
    evidence:[
      'Publishes an Environmental, Social & Governance report for Kuwait (2022 edition).',
      'Applies circular-economy principles to electronic devices and equipment and supports efforts to reduce electronic waste.',
      'Monitors energy use, carbon footprint and electronic waste through dashboards aligned with GSMA and CITRA reporting.'
    ],
    links:[
      { label:'Ooredoo Kuwait 2022 ESG Report (PDF)', url:'https://www.ooredoo.com.kw/assets/portal/Frontend/Reports/ESG2022.pdf' }
    ]
  },
  {
    name:'Boursa Kuwait', sector:'Financial markets',
    recyclingProgram:true, plasticReduction:true, paperRecycling:true,
    eWasteRecycling:false, wasteSeparation:true, sustainabilityTargets:false,
    sustainabilityReport:true,
    evidence:[
      'Strategic partnership with Omniya Plastic Collection Company since March 2019; 1,241 tonnes of plastic collected to date, 471 tonnes in 2025 alone — explicitly aligned by Boursa to UN SDG 12.',
      'In 2025 processed about 1,972 kg of its own waste, separated into 472 kg plastic and 1,500 kg paper.',
      'Fifth standalone sustainability report.',
      'Also publishes the ESG Reporting Guide that sets disclosure expectations for every listed issuer in Kuwait.'
    ],
    links:[
      { label:'Boursa Kuwait Sustainability Report (PDF)', url:'https://www.boursakuwait.com.kw/api/documents/boursa/1649054880123.pdf' },
      { label:'Boursa Kuwait ESG Reporting Guide for Listed Companies (PDF)', url:'https://www.boursakuwait.com.kw/api/documents/boursa/1684840404216.pdf' }
    ]
  },
  {
    name:'Agility', sector:'Logistics',
    recyclingProgram:true, plasticReduction:false, paperRecycling:false,
    eWasteRecycling:false, wasteSeparation:false, sustainabilityTargets:true,
    sustainabilityReport:true,
    evidence:[
      'Menzies Aviation, an Agility company, has set a target of zero cargo waste to landfill by end 2026.',
      'Tristar, also in the group, diverted waste through recycling in 2024; 93% of that diversion was waste oil, followed by plastic.',
      'Note: the zero-waste-to-landfill target belongs to a group company, not to Agility’s Kuwait operations specifically.'
    ],
    links:[
      { label:'Agility — Environmental Progress', url:'https://www.agility.com/en/sustainability/environmental-progress/' }
    ]
  },
  {
    name:'Jazeera Airways', sector:'Aviation',
    recyclingProgram:false, plasticReduction:true, paperRecycling:false,
    eWasteRecycling:false, wasteSeparation:false, sustainabilityTargets:true,
    sustainabilityReport:true,
    evidence:[
      'Switched to 100% biodegradable spoons, forks, knives and napkins, avoiding about 300 kg of plastic on flights each month; wooden stirrers replaced plastic ones.',
      'Committed to net-zero emissions by 2050.',
      'Published its first standalone ESG report in 2023 ("Flying Green — a Step towards Sustainable Aviation").'
    ],
    links:[
      { label:'Jazeera Airways ESG Report 2023 (PDF)', url:'https://investorrelations.jazeeraairways.com/media/1351/j9-esg-report-2023-design-english.pdf' }
    ]
  },
  {
    name:'Mezzan Holding', sector:'Food & industrials',
    recyclingProgram:true, plasticReduction:true, paperRecycling:false,
    eWasteRecycling:false, wasteSeparation:false, sustainabilityTargets:false,
    sustainabilityReport:true,
    evidence:[
      'ThinkGreen initiative reduced the use of small plastic bottles and moved employees to reusable bottles.',
      'Kuwait Lube Oil Company, a Mezzan subsidiary, operates a refinery that recycles used oils, converting hazardous material into reusable product.',
      'Published its first standalone sustainability report for 2025.'
    ],
    links:[
      { label:'Mezzan Sustainability Report 2025 (PDF)', url:'https://www.mezzan.com/wp-content/uploads/2026/06/Mezzan_Sustainability-Report-2025_English_compressed.pdf' },
      { label:'Mezzan — Commitment to the Environment', url:'https://www.mezzan.com/commitment-to-environment/' }
    ]
  },
  {
    name:'Kuwait Petroleum Corporation (KPC)', sector:'Oil & gas',
    recyclingProgram:true, plasticReduction:false, paperRecycling:false,
    eWasteRecycling:false, wasteSeparation:false, sustainabilityTargets:true,
    sustainabilityReport:true,
    evidence:[
      'Energy transition strategy includes petrochemical recycling — reprocessing waste plastic materials into usable products.',
      'Reduced operated upstream Scope 1 emission intensity 26% in FY 2023/24 against FY 2021/22, to 8.54 kg/BOE.',
      'Publishes a corporate sustainability report (2023–25 edition).'
    ],
    links:[
      { label:'KPC Sustainability Report 2023-25 (PDF)', url:'https://www.kpc.com.kw/uploads/SustainabiltyReport/KPC%202023-5%20Sustainability%20Report.pdf' }
    ]
  },
  {
    name:'EQUATE Petrochemical Company', sector:'Petrochemicals',
    recyclingProgram:true, plasticReduction:false, paperRecycling:false,
    eWasteRecycling:false, wasteSeparation:false, sustainabilityTargets:true,
    sustainabilityReport:true,
    evidence:[
      'Closed-loop recycling programmes aimed at recapturing and reusing high-value polymer waste.',
      'Targets a 20% reduction in industrial emissions by 2026.',
      'Has published sustainability reports since 2011.'
    ],
    links:[
      { label:'EQUATE — Reporting', url:'https://www.equate.com/reporting-2/' }
    ]
  }
];

/* ---------------------------------------------------------------------------
   7. TIMELINE — only milestones with a source
   ------------------------------------------------------------------------- */

const TIMELINE = [
  { year:2015, icon:'🇰🇼', kind:'past',
    goal:'Agenda 2030 folded into Kuwait Vision 2035',
    target:'National recycling rate reaches 2.94% — the highest in the published record',
    detail:'Kuwait integrated the UN 2030 Agenda into Vision 2035 in 2015. In the same year the national recycling rate (indicator 12.5.1) recorded its best published value.',
    source:'S3' },
  { year:2016, icon:'📋', kind:'past',
    goal:'Sustainable consumption and production enter national policy',
    target:'Action plans prioritised in national policies (indicator 12.1.1)',
    detail:'Kuwait reports having implemented and prioritised action plans for sustainable consumption and production in its national policies since 2016.',
    source:'S3' },
  { year:2018, icon:'📊', kind:'past',
    goal:'The baseline year of the national waste survey',
    target:'11% of all waste recycled; 47% to municipal landfills',
    detail:'The reference year behind the EPA Waste Management Atlas. Kuwait generated 37–43 million tonnes of waste; 4.8 million tonnes were recycled.',
    source:'S1' },
  { year:2019, icon:'🛞', kind:'past',
    goal:'Al-Rheyya tyre dumps closed',
    target:'Waste tyres moved to a treatment centre for recycling',
    detail:'EPA closed the damaged-tyre dumps and transferred the material to Salmi for recycling into plastic, rubber and road-surfacing uses. More than 42 million tyres were moved.',
    source:'S3' },
  { year:2021, icon:'📉', kind:'past',
    goal:'Export of recyclable waste regulated',
    target:'Ministerial Decree No. 20 of 2021; recycling rate falls to 0.76%',
    detail:'The Ministry of Commerce and Industry issued Decree No. 20 of 2021 regulating the export of recyclable waste, in line with the Basel Convention. The same year, the national recycling rate hit its lowest recorded value.',
    source:'S3' },
  { year:2022, icon:'📘', kind:'past',
    goal:'KNWMS 2040 published',
    target:'5 objectives, 25 targets, 25 action plans',
    detail:'The strategy and its targets were published in the EPA Waste Management Atlas of Kuwait. 2022 is the first column of the strategy’s own implementation timeline.',
    source:'S1' },
  { year:2026, icon:'🗂️', kind:'near',
    goal:'EPA waste data becomes public',
    target:'Data provision plan implemented by 31 December 2026',
    detail:'Objective 5 of the strategy, with a hard date: set up and implement a plan to distribute relevant waste data to other authorities and to the public.',
    source:'S1' },
  { year:2030, icon:'🎯', kind:'near',
    goal:'SDG 12 deadline — and the strategy’s midpoint',
    target:'Reduce waste production through prevention, reduction, recycling and reuse',
    detail:'2030 is the deadline for UN target 12.5 and the middle column of the KNWMS 2040 implementation timeline.',
    source:'S4' },
  { year:2040, icon:'♻️', kind:'goal',
    goal:'The KNWMS 2040 targets fall due',
    target:'MSW 30% recycling · C&D 15% · WEEE 50% collection · sludge 80% to soil',
    detail:'The full set of waste-stream targets, plus the landfill ban on high-organic-content waste and the rehabilitation of authorised landfills and harmful dumpsites.',
    source:'S1' }
];
