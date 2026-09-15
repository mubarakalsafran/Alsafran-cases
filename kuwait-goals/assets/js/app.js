/* ============================================================================
   KUWAIT'S RECYCLING GOALS — rendering layer
   Dependency-free. Every figure rendered here is read from data.js, which
   carries the source for each one. Nothing is computed into existence except
   the company percentages, which are counted from the dataset at runtime so
   the printed percentage can never drift from the table beneath it.
   ========================================================================== */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
const src = id => SOURCES[id];
const srcLink = id => `<a href="${src(id).url}" target="_blank" rel="noopener">${esc(src(id).org)} — ${esc(src(id).title)}</a>`;

const SERIES_VAR = { recycling:'--series-recycling', recovery:'--series-recovery', disposal:'--series-disposal' };

/* =========================================================================
   0. ILLUSTRATION SET
   Inline SVG rather than emoji or photographs. Emoji render differently on
   every platform and carry no stroke weight; stock photography would mean
   hotlinking assets this page cannot licence or guarantee. These scale, they
   inherit currentColor, and they read the same everywhere.
   ======================================================================= */
const ART = {
  recycle:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path d="M24 7l6.5 11.3"/><path d="M30.5 18.3l4.6-2"/><path d="M35.1 16.3l-1.2 4.9"/>
    <path d="M38.6 25.6L32.1 37"/><path d="M32.1 37l.5-5"/><path d="M32.6 32l4.7 1.8"/>
    <path d="M15.9 37H9.4"/><path d="M9.4 37l4-3"/><path d="M13.4 34l-3.6-3.5"/>
    <path d="M24 7l-6.5 11.3M9.4 25.6L15.9 37M38.6 25.6H24"/></svg>`,
  bottle:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path d="M20 5h8v5h-8z"/><path d="M20 10c0 3-4 4-4 9v20a4 4 0 004 4h8a4 4 0 004-4V19c0-5-4-6-4-9"/>
    <path d="M16 24h16"/><path d="M16 30h16"/></svg>`,
  bin:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path d="M9 13h30"/><path d="M19 13V8h10v5"/><path d="M12 13l2.5 28h19L36 13"/>
    <path d="M20 21v13M28 21v13"/></svg>`,
  sprout:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path d="M24 42V22"/><path d="M24 26c0-7-5-11-12-11 0 7 5 11 12 11z"/>
    <path d="M24 22c0-7 5-11 12-11 0 7-5 11-12 11z"/><path d="M14 42h20"/></svg>`,
  crane:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path d="M10 42V10h4v32"/><path d="M6 42h12"/><path d="M12 12h26"/><path d="M12 12l10 8"/>
    <path d="M32 12v10"/><path d="M28 22h8v7h-8z"/></svg>`,
  plug:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path d="M18 6v10M30 6v10"/><path d="M13 16h22v7a11 11 0 01-11 11 11 11 0 01-11-11z"/>
    <path d="M24 34v8"/></svg>`,
  towers:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path d="M26 44V10"/><ellipse cx="26" cy="15" rx="9" ry="4.5"/><ellipse cx="26" cy="26" rx="5" ry="2.6"/>
    <path d="M15 44V22"/><ellipse cx="15" cy="24" rx="6" ry="3"/>
    <path d="M37 44V31"/><circle cx="37" cy="32" r="2.6"/><path d="M8 44h34"/></svg>`
};
const STREAM_ART = { msw:'bin', cd:'crane', weee:'plug', sludge:'sprout' };

/* =========================================================================
   0b. AT A GLANCE — the whole argument before any paragraph
   ======================================================================= */
function renderGlance(){
  const R = 34, C = 2 * Math.PI * R;
  $('#glanceRings').innerHTML = TARGETS.map(t => `
    <div class="gring">
      <svg viewBox="0 0 88 88" aria-hidden="true">
        <circle class="ring__track" cx="44" cy="44" r="${R}" stroke-width="6"></circle>
        <circle class="ring__bar" cx="44" cy="44" r="${R}" stroke-width="6" transform="rotate(-90 44 44)"
                stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}"
                data-circ="${C.toFixed(1)}" data-target="${t.headline}"></circle>
      </svg>
      <span class="gring__art">${ART[STREAM_ART[t.id]]}</span>
      <b class="gring__n">${t.headline}%</b>
      <span class="gring__l">${esc(t.short)}</span>
      <span class="gring__k">${esc(t.headlineLabel.replace(' target',''))} by ${t.deadline}</span>
    </div>`).join('');
  observeOnce($('#glanceRings'), () => $$('#glanceRings .ring__bar').forEach(r => {
    const c = parseFloat(r.dataset.circ), pct = parseFloat(r.dataset.target);
    r.style.strokeDashoffset = (c - c * pct / 100).toFixed(1);
  }));

  const now = [
    { n:'0.76%', l:'of all solid waste recycled', y:'2021 · Kuwait CSB', bad:true },
    { n:'11%',   l:'overall recycling rate',      y:'2018 · Kuwait EPA', bad:true },
    { n:'47%',   l:'sent to municipal landfills', y:'2018 · Kuwait EPA', bad:true },
    { n:'10%',   l:'of landfill area rehabilitated', y:'2020 · Kuwait EPA', bad:true }
  ];
  $('#glanceNow').innerHTML = now.map(x => `
    <div class="gnow">
      <b class="gnow__n">${x.n}</b>
      <span class="gnow__l">${esc(x.l)}</span>
      <span class="gnow__y">${esc(x.y)}</span>
    </div>`).join('');

  const keys = [
    { art:'recycle', t:'The targets are real and dated',
      d:'25 targets, a named authority for each, and a 2040 horizon — published, not aspirational.' },
    { art:'bottle', t:'The trend is going the wrong way',
      d:'The one indicator Kuwait publishes over time fell from 2.94% in 2015 to 0.76% in 2021.' },
    { art:'towers', t:'Most targets have no baseline yet',
      d:'Kuwait has committed to publish national waste data by 31 December 2026. Until then, progress on most targets cannot be checked.' }
  ];
  $('#glanceKeys').innerHTML = keys.map(k => `
    <li class="gkey">
      <span class="gkey__art">${ART[k.art]}</span>
      <div><b>${esc(k.t)}</b><span>${esc(k.d)}</span></div>
    </li>`).join('');
}

/* =========================================================================
   0c. JUMP NAV — appears past the hero, marks the section you are in
   ======================================================================= */
function initJumpNav(){
  const nav = $('#jump'), hero = $('.hero');
  const links = $$('#jump a');
  const targets = links.map(a => $(a.getAttribute('href'))).filter(Boolean);

  if ('IntersectionObserver' in window) {
    // show the bar only once the hero has scrolled away
    new IntersectionObserver(([e]) => nav.classList.toggle('is-on', !e.isIntersecting),
      { rootMargin:'-60px 0px 0px 0px' }).observe(hero);

    // mark the section currently occupying the upper third of the viewport
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.toggle('is-here', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin:'-15% 0px -70% 0px' });
    targets.forEach(t => spy.observe(t));
  } else {
    nav.classList.add('is-on');
  }
}

/* -------------------------------------------------------------- theme ---- */
function initTheme(){
  const btn = $('#themeBtn');
  // The artifact build ships without a toggle — the host controls the theme there.
  if (!btn) return;
  const stored = (() => { try { return localStorage.getItem('kwg-theme'); } catch { return null; } })();
  if (stored) document.documentElement.setAttribute('data-theme', stored);
  const paint = () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark'
      || (!document.documentElement.getAttribute('data-theme')
          && matchMedia('(prefers-color-scheme: dark)').matches);
    btn.textContent = dark ? '☀' : '☾';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  };
  btn.addEventListener('click', () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark'
      || (!document.documentElement.getAttribute('data-theme')
          && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('kwg-theme', next); } catch {}
    paint();
    redrawCharts();
  });
  paint();
}

/* ------------------------------------------------------- shared tooltip -- */
function makeTip(host){
  const el = document.createElement('div');
  el.className = 'tip';
  el.setAttribute('role', 'status');
  host.appendChild(el);
  return {
    show(html, x, y){ el.innerHTML = html; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.opacity = '1'; },
    hide(){ el.style.opacity = '0'; }
  };
}

/* =========================================================================
   1. THE STRATEGY — vision, hierarchy, objectives, the 25 targets
   ======================================================================= */
function renderStrategy(){
  $('#knwmsVision').textContent = KNWMS.vision;
  $('#knwmsMeta').innerHTML =
    `<span class="flag">${esc(KNWMS.owner)}</span> <span class="flag">${esc(KNWMS.structure)}</span>
     <span class="flag">Timeline ${KNWMS.horizon.join(' → ')}</span>`;

  $('#hierarchy').innerHTML = KNWMS.hierarchy.map((h, i) => `
    <li class="gvr__item">
      <span class="gvr__n" style="color:var(--kw-green)">${i + 1}</span>
      <p class="gvr__t"><b>${esc(h.step)}</b>${h.rank ? esc(h.rank) : 'Preferred over every step below it.'}</p>
    </li>`).join('');

  $('#objectives').innerHTML = KNWMS.objectives.map(o => `
    <div class="card">
      <p class="tcard__label">Objective ${o.n}</p>
      <h3 style="font-size:var(--step-1);margin:.35rem 0 .6rem">${esc(o.short)}</h3>
      <p class="tcard__note">${esc(o.long)}</p>
    </div>`).join('');

  const byObj = n => TARGET_LIST.filter(t => t.objective === n);
  $('#targetList').innerHTML = KNWMS.objectives.map(o => `
    <details class="co">
      <summary>Objective ${o.n} — ${esc(o.short)}
        <span class="co__sector">${byObj(o.n).length} targets</span></summary>
      <div class="co__body">
        <ul>${byObj(o.n).map(t => `<li>${esc(t.text)} <span style="color:var(--ink-3)">— ${esc(t.who)}</span></li>`).join('')}</ul>
      </div>
    </details>`).join('');

  $('#separationText').textContent = KNWMS.separationPlan;
  $('#separationStreams').innerHTML = KNWMS.separationStreams.map(s => `
    <div class="pcard">
      <span class="pcard__icon">${s.icon}</span>
      <b style="font-family:var(--f-display);font-size:var(--step-0)">${esc(s.label)}</b>
      <span class="pcard__lab">${esc(s.detail)}</span>
    </div>`).join('');

  $('#landfillGoals').innerHTML = LANDFILL_GOALS.map(g => `
    <div class="card">
      <span style="font-size:1.5rem">${g.icon}</span>
      <h3 style="font-size:var(--step-1);margin:.5rem 0 .5rem">${esc(g.goal)}</h3>
      <p class="tcard__note">${esc(g.detail)}</p>
    </div>`).join('');

  $('#dataGoal').innerHTML = `
    <p><b>Target 25 of 25 — "Distribute and publish waste data."</b> Objective 5 of the strategy is
    entirely about information, and it is the only objective carrying a hard calendar date:
    <b>set up and implement a data provision plan to distribute relevant waste data to other
    authorities and the public by EPA by 31st of December 2026.</b></p>
    <p class="tcard__note">Its four targets are: provide waste data to KEPA · implement a waste monitoring
    system by KEPA · acquire monitoring equipment · distribute and publish waste data. The atlas is
    candid about why this matters — Kuwait's own total waste figure is a range, 37 to 43 million
    tonnes, because parts of it are estimated. "The improvement of weighing and recording of waste
    amounts is one of the major goals of the KNWMS 2040."</p>`;
}

/* =========================================================================
   2. THE 2040 DASHBOARD
   ======================================================================= */
function renderDashboard(){
  const R = 52, C = 2 * Math.PI * R;
  $('#dashboard').innerHTML = TARGETS.map(t => `
    <article class="tcard">
      <div class="tcard__top">
        <div>
          <span class="tcard__art">${ART[STREAM_ART[t.id]] || ''}</span>
          <p class="tcard__big">${t.headline}<sup>%</sup></p>
          <p class="tcard__label">${esc(t.headlineLabel)}</p>
        </div>
        <svg class="tcard__ring" width="96" height="96" viewBox="0 0 128 128" aria-hidden="true">
          <circle class="ring__track" cx="64" cy="64" r="${R}"></circle>
          <circle class="ring__bar" cx="64" cy="64" r="${R}" transform="rotate(-90 64 64)"
                  stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}"
                  data-target="${t.headline}" data-circ="${C.toFixed(1)}"></circle>
        </svg>
      </div>
      <p class="tcard__cat">${esc(t.stream)}</p>
      <p class="tcard__note">${esc(t.note)}</p>
      ${t.caution ? `<p class="flag" style="color:var(--gold);border-color:var(--gold)">⚠ Read the note — published two ways</p>` : ''}
      <dl class="tcard__meta">
        <dt>Target</dt><dd>“${esc(t.targetText)}”</dd>
        <dt>Category</dt><dd>${esc(t.stream)}</dd>
        <dt>Deadline</dt><dd>${t.deadline}</dd>
        <dt>Responsible</dt><dd>${esc(t.responsible)}</dd>
        <dt>Source</dt><dd>${srcLink(t.source)}</dd>
      </dl>
    </article>`).join('');

  // animate the rings into place when the dashboard scrolls into view
  const rings = $$('#dashboard .ring__bar');
  const fill = () => rings.forEach(r => {
    const c = parseFloat(r.dataset.circ), pct = parseFloat(r.dataset.target);
    r.style.strokeDashoffset = (c - c * pct / 100).toFixed(1);
  });
  observeOnce($('#dashboard'), fill);
}

/* Reveal helper. The rule here is that the page must be CORRECT at rest: a
   ring or a bar may animate into place, but it must never sit at zero because
   an observer did not fire. Embeds, thumbnail capture and odd viewport
   geometry all break scroll observers, so the observer is only allowed to make
   the reveal prettier — a frame-based fallback always runs it. */
function observeOnce(el, fn){
  if (!el) return;
  let done = false;
  const run = () => { if (done) return; done = true; fn(); };

  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    requestAnimationFrame(run);
    return;
  }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(); io.disconnect(); } }), { threshold:.25 });
  io.observe(el);
  // paint once at the start value so the transition has something to run from,
  // then commit the real value whether or not the observer ever fired
  requestAnimationFrame(() => requestAnimationFrame(run));
}

/* =========================================================================
   3. 100% STACKED BAR — Kuwait's Waste Management Targets
   Labels are rendered inside a segment only when the segment is wide enough
   to hold them; every value is also in the table view below.
   ======================================================================= */
function renderStackedChart(){
  const host = $('#stackChart');
  const tip  = makeTip($('#stackWrap'));

  host.innerHTML = TARGETS.map(t => {
    const total = t.split.reduce((s, x) => s + x.value, 0);
    return `
    <div class="stack__row">
      <div class="stack__head">
        <span class="stack__name">${t.icon} ${esc(t.stream)}</span>
      </div>
      <div class="stack__bar" role="img"
           aria-label="${esc(t.stream)}: ${t.split.map(s => `${s.label} ${s.value} per cent`).join(', ')}">
        ${t.split.map(s => `
          <div class="stack__seg" data-stream="${esc(t.stream)}" data-label="${esc(s.label)}" data-value="${s.value}"
               style="flex:0 0 calc(${(s.value / total * 100).toFixed(2)}% - 2px);background:var(${SERIES_VAR[s.key]})"></div>`).join('')}
      </div>
      <ul class="stack__vals">
        ${t.split.map(s => `
          <li><i style="background:var(${SERIES_VAR[s.key]})"></i><b>${s.value}%</b> ${esc(s.label)}</li>`).join('')}
      </ul>
    </div>`;
  }).join('') + `
    <div class="stack__axis"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span></div>`;

  // hover / focus layer
  $$('.stack__seg', host).forEach(seg => {
    const show = e => {
      const r = seg.getBoundingClientRect(), h = $('#stackWrap').getBoundingClientRect();
      tip.show(`<b>${seg.dataset.value}%</b> ${esc(seg.dataset.label)}<br>${esc(seg.dataset.stream)}`,
               r.left - h.left + r.width / 2, r.top - h.top);
    };
    seg.addEventListener('mouseenter', show);
    seg.addEventListener('mousemove', show);
    seg.addEventListener('mouseleave', tip.hide);
  });

  $('#stackTable').innerHTML = `
    <caption>Kuwait National Waste Management Strategy 2040 — treatment targets by waste stream, per cent. Sewage sludge has no disposal share; the strategy allocates none.</caption>
    <thead><tr><th>Waste stream</th><th class="num">Recycling</th><th class="num">Other recovery</th><th class="num">Disposal</th><th>Deadline</th></tr></thead>
    <tbody>${TARGETS.map(t => {
      const g = k => { const f = t.split.find(s => s.key === k); return f ? f.value + '%' : '—'; };
      return `<tr><th scope="row">${esc(t.stream)}</th>
        <td class="num">${g('recycling')}</td><td class="num">${g('recovery')}</td>
        <td class="num">${g('disposal')}</td><td>${t.deadline}</td></tr>`;
    }).join('')}</tbody>`;
}

/* =========================================================================
   4. LINE CHART — indicator 12.5.1 over time
   ======================================================================= */
function renderLineChart(){
  const host = $('#lineChart');
  const data = INDICATOR_1251.series;
  const W = 760, H = 320, P = { t:26, r:26, b:44, l:50 };
  const maxY = 3, minY = 0;
  const x = i => P.l + (W - P.l - P.r) * (i / (data.length - 1));
  const y = v => P.t + (H - P.t - P.b) * (1 - (v - minY) / (maxY - minY));

  const ticks = [0, 0.5, 1, 1.5, 2, 2.5, 3];
  const path  = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area  = `${path} L${x(data.length - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z`;

  host.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" role="img"
       aria-label="Kuwait national recycling indicator 12.5.1, ${data[0].year} to ${data[data.length-1].year}: falls from ${data[0].value} per cent to ${data[data.length-1].value} per cent.">
    ${ticks.map(t => `
      <line class="line__grid" x1="${P.l}" x2="${W - P.r}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"></line>
      <text class="line__txt" x="${P.l - 10}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${t.toFixed(1)}</text>`).join('')}
    <path class="line__area" d="${area}"></path>
    <path class="line__path" d="${path}"></path>
    ${data.map((d, i) => `
      <circle class="line__dot" cx="${x(i).toFixed(1)}" cy="${y(d.value).toFixed(1)}" r="4.5"></circle>
      <text class="line__txt" x="${x(i).toFixed(1)}" y="${H - P.b + 20}" text-anchor="middle">${d.year}</text>`).join('')}
    <!-- direct labels: the peak and the latest reading only -->
    <text class="line__lab" x="${x(0).toFixed(1)}" y="${(y(data[0].value) - 14).toFixed(1)}" text-anchor="start">${data[0].value}%</text>
    <text class="line__lab" x="${x(data.length - 1).toFixed(1)}" y="${(y(data[data.length-1].value) - 14).toFixed(1)}" text-anchor="end">${data[data.length-1].value}%</text>
    <text class="line__txt" x="${P.l - 10}" y="${P.t - 10}" text-anchor="end">%</text>
    ${data.map((d, i) => `
      <rect class="line__hit" x="${(x(i) - 26).toFixed(1)}" y="${P.t}" width="52" height="${H - P.t - P.b}"
            data-i="${i}" tabindex="0" role="button"
            aria-label="${d.year}: ${d.value} per cent"></rect>`).join('')}
  </svg>`;

  const tip = makeTip($('#lineWrap'));
  const at = i => {
    const d = data[i];
    const box = host.getBoundingClientRect(), wrap = $('#lineWrap').getBoundingClientRect();
    const sx = box.left - wrap.left + (x(i) / W) * box.width;
    const sy = box.top - wrap.top + (y(d.value) / H) * box.height;
    tip.show(`<b>${d.value}%</b> of all solid waste recycled<br>${d.year} · Kuwait CSB, indicator 12.5.1`, sx, sy);
  };
  $$('.line__hit', host).forEach(r => {
    r.addEventListener('mouseenter', () => at(+r.dataset.i));
    r.addEventListener('focus',      () => at(+r.dataset.i));
    r.addEventListener('mouseleave', tip.hide);
    r.addEventListener('blur',       tip.hide);
  });

  $('#lineTable').innerHTML = `
    <caption>Indicator ${INDICATOR_1251.code} — “${esc(INDICATOR_1251.name)}”, as published by ${esc(INDICATOR_1251.publisher)}.
    The published table has two columns, “Year” and “Data”, and states no unit; the unit shown here is the one Kuwait’s own
    Voluntary National Review gives for the same series.</caption>
    <thead><tr><th>Year</th><th class="num">Reported value</th><th>Unit as published by CSB</th><th>Unit per Kuwait VNR2 (2023)</th></tr></thead>
    <tbody>${data.map(d => `
      <tr><th scope="row">${d.year}</th><td class="num">${d.value.toFixed(2)}</td>
      <td style="color:var(--ink-3)">none stated (column header: “Data”)</td>
      <td>${esc(INDICATOR_1251.unitClarified)}</td></tr>`).join('')}</tbody>`;

  $('#indicatorMeaning').innerHTML = `
    <h3>What this indicator actually measures</h3>
    <p>${esc(INDICATOR_1251.whatItMeasures)}</p>
    <p><b>How to avoid misreading it.</b> ${esc(INDICATOR_1251.misreadWarning)}</p>
    <p class="tcard__note"><b>On the unit.</b> ${esc(INDICATOR_1251.unitEvidence)}</p>`;
}

/* =========================================================================
   5. SDG 12
   ======================================================================= */
function renderSDG12(){
  $('#sdgSummary').textContent = SDG12.csbSummary;
  $('#sdgMeta').innerHTML = `
    <span class="flag">${SDG12.numberOfTargets} targets</span>
    <span class="flag">${SDG12.totalIndicators} indicators</span>
    <span class="flag">${SDG12.applicableIndicators} applicable in Kuwait</span>`;

  $('#sdgPillars').innerHTML = SDG12.pillars.map(p => `
    <div class="card">
      <span style="font-size:1.5rem">${p.icon}</span>
      <h3 style="font-size:var(--step-1);margin:.5rem 0 .5rem">${esc(p.label)}</h3>
      <p class="tcard__note">${esc(p.text)}</p>
    </div>`).join('');

  $('#sdgTargets').innerHTML = SDG12.targets.map(t => `
    <li class="gvr__item" ${t.highlight ? 'style="border-color:var(--kw-green)"' : ''}>
      <span class="gvr__n" style="font-size:var(--step-1);${t.highlight ? 'color:var(--kw-green)' : 'color:var(--ink-3)'}">${t.icon}<br>${t.id}</span>
      <p class="gvr__t">${esc(t.text)}</p>
    </li>`).join('');

  $('#sdgCompanies').innerHTML = `
    <h3>Target 12.6 — and the number Kuwait does not publish</h3>
    <p>SDG 12 does not stop at government. Target 12.6 asks countries to
    <b>“encourage companies, particularly large and transnational corporations, to adopt sustainable
    practices and incorporate sustainability information into their reporting cycle”</b>, and Kuwait’s
    own statistical bureau spells out the expectation plainly: <b>“companies should adopt sustainable
    practices and publish sustainability reports.”</b></p>
    <p>The indicator that would measure this is
    <b>${SDG12.indicator1261.code} — “${esc(SDG12.indicator1261.name)}”</b>.
    ${esc(SDG12.indicator1261.note)}</p>
    <p class="tcard__note">Source: ${srcLink('S5')} · ${srcLink('S4')}</p>`;

  $('#sdgAchievement').innerHTML = `
    <span class="leadfig" style="color:var(--series-disposal)">${SDG12.achievement2019.value}%</span>
    <p class="tcard__label" style="margin-top:.75rem">SDG 12 achievement, ${SDG12.achievement2019.year}</p>
    <p class="tcard__note">${esc(SDG12.achievement2019.note)} Source: ${srcLink('S3')}</p>`;
}

/* =========================================================================
   6. GOALS VS REALITY
   ======================================================================= */
function renderReality(){
  $('#kwTargets').innerHTML = TARGETS.map(t => `
    <li class="gvr__item">
      <span class="gvr__n" style="color:var(--series-recycling)">${t.headline}%</span>
      <p class="gvr__t"><b>${t.icon} ${esc(t.stream)}</b>${esc(t.headlineLabel)} · by ${t.deadline} · KEPA, KNWMS 2040</p>
    </li>`).join('');

  const r = [
    { n:'0.76%', t:'National recycling rate, 2021',
      d:'Share of all solid waste generated that was recycled — the lowest value in the published series. CSB indicator 12.5.1.' },
    { n:'11%',   t:'Overall recycling rate, 2018',
      d:'4.8 million of 44.7 million tonnes treated. Germany and South Korea recycle around 50%. KEPA atlas.' },
    { n:'47%',   t:'Sent to municipal landfills, 2018',
      d:'20,995 thousand tonnes. A further 32% was clay used for backfilling and 9% sand for landfill construction. KEPA atlas.' },
    { n:'10%',   t:'Landfill area rehabilitated, 2020',
      d:'2.0 km² of 19.8 km². 48% is closed but not rehabilitated; 42% is still in operation. KEPA atlas.' },
    { n:'28.9%', t:'SDG 12 achievement, 2019',
      d:'Kuwait’s own score for Responsible Consumption and Production in its Voluntary National Review.' },
    { n:'none',  t:'Companies reporting sustainability',
      d:'Indicator 12.6.1 exists in Kuwait’s SDG database but carries no published figure.' }
  ];
  $('#kwReality').innerHTML = r.map(x => `
    <li class="gvr__item">
      <span class="gvr__n" style="color:var(--series-disposal);font-size:${x.n === 'none' ? 'var(--step-1)' : 'var(--step-3)'}">${x.n}</span>
      <p class="gvr__t"><b>${esc(x.t)}</b>${esc(x.d)}</p>
    </li>`).join('');

  $('#progressBars').innerHTML = COMPARISONS.map(c => {
    const max = c.scaleMax || 100;
    const w = v => Math.max(1.5, v / max * 100);
    return `
    <div class="chartcard" style="margin-bottom:var(--sp-4)">
      <h3 style="font-size:var(--step-1)">${esc(c.title)}</h3>
      <p class="chart__sub">${esc(c.category)}</p>
      <div class="pbar">
        <div class="pbar__row">
          <div class="pbar__head"><span>CURRENT — ${esc(c.currentLabel)}</span><b>${c.currentValue}%</b></div>
          <div class="pbar__track"><div class="pbar__fill pbar__fill--now" style="width:0" data-w="${w(c.currentValue).toFixed(1)}"></div></div>
          <p class="pbar__note">${esc(c.currentDetail)}</p>
        </div>
        <div class="pbar__row">
          <div class="pbar__head"><span>${esc(c.targetLabel).toUpperCase()}</span><b>${c.targetValue}%</b></div>
          <div class="pbar__track"><div class="pbar__fill pbar__fill--goal" style="width:0" data-w="${w(c.targetValue).toFixed(1)}"></div></div>
          <p class="pbar__note">${esc(c.targetDetail)}</p>
        </div>
      </div>
      <p class="srcline">
        <b>Bar scale:</b> ${c.scaleMax
          ? `both bars are drawn on a 0–${c.scaleMax}% scale, not 0–100%, so that values under 3% are visible at all. A full bar means ${c.scaleMax}%, never 100%.`
          : `both bars are drawn on a 0–100% scale.`}<br>
        <b>Why this comparison is allowed:</b> ${esc(c.why)}<br>
        ${c.sources.map(s => srcLink(s)).join(' · ')}</p>
    </div>`;
  }).join('');
  observeOnce($('#progressBars'), () => $$('#progressBars .pbar__fill').forEach(f => f.style.width = f.dataset.w + '%'));

  $('#noCompare').innerHTML = NON_COMPARISONS.map(n => `
    <li>
      <span class="pair">${esc(n.a)} <span class="vs">✕ NOT COMPARABLE ✕</span> ${esc(n.b)}</span>
      <p>${esc(n.why)}</p>
    </li>`).join('');
}

/* =========================================================================
   7. COMPANIES — percentages counted from the dataset, never hardcoded
   ======================================================================= */
function renderCompanies(){
  const n = COMPANIES.length;
  $$('.js-n').forEach(el => el.textContent = n);

  const stats = PRACTICE_DEFS.map(p => {
    const count = COMPANIES.filter(c => c[p.key]).length;
    return { ...p, count, pct: Math.round(count / n * 1000) / 10 };
  });

  $('#practiceCards').innerHTML = stats.map(s => `
    <div class="pcard">
      <span class="pcard__icon">${s.icon}</span>
      <span class="pcard__pct">${s.pct % 1 === 0 ? s.pct : s.pct.toFixed(1)}%</span>
      <span class="pcard__n">${s.count} of ${n}</span>
      <span class="pcard__lab">${esc(s.label)}</span>
      <div class="pcard__meter"><i style="width:0" data-w="${s.pct}"></i></div>
    </div>`).join('');
  observeOnce($('#practiceCards'), () => $$('#practiceCards .pcard__meter i').forEach(i => i.style.width = i.dataset.w + '%'));

  $('#practiceDefs').innerHTML = PRACTICE_DEFS.map(p =>
    `<li><b>${p.icon} ${esc(p.label)}</b> — ${esc(p.test)}</li>`).join('');

  $('#companyMatrix').innerHTML = `
    <caption>Every cell is a published claim or the absence of one. A blank means the practice was not found in that company’s published disclosure — not that the company does not do it.</caption>
    <thead><tr><th>Company</th><th>Sector</th>${PRACTICE_DEFS.map(p => `<th>${p.icon}<br>${esc(p.label)}</th>`).join('')}</tr></thead>
    <tbody>${COMPANIES.map(c => `
      <tr><th scope="row">${esc(c.name)}</th><td style="text-align:left;color:var(--ink-3)">${esc(c.sector)}</td>
      ${PRACTICE_DEFS.map(p => c[p.key]
        ? `<td class="yes" aria-label="yes">●<span class="sr-only">yes</span></td>`
        : `<td class="no" aria-label="not found">–<span class="sr-only">not found in published disclosure</span></td>`).join('')}
      </tr>`).join('')}
    </tbody>
    <tfoot><tr><th scope="row">Total of ${n}</th><td></td>
      ${stats.map(s => `<td class="num" style="font-weight:700">${s.count}</td>`).join('')}</tr></tfoot>`;

  $('#companyList').innerHTML = COMPANIES.map(c => `
    <details class="co">
      <summary>${esc(c.name)}<span class="co__sector">${esc(c.sector)}</span></summary>
      <div class="co__body">
        <ul>${c.evidence.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
        <div class="co__links">${c.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>
      </div>
    </details>`).join('');

  /* Link the company findings back to the national targets — carefully. */
  const find = k => stats.find(s => s.key === k);
  $('#companyLink').innerHTML = `
    <h3>How this connects to Kuwait’s national goals</h3>
    <p>The KNWMS 2040 is explicit that it cannot be delivered by government alone: <b>“a joint effort
    from state authorities, private companies and the general public is necessary.”</b> Its financing
    instruments name the private sector first — public-private partnerships, extended producer
    responsibility, gate fees. So company practice is not decoration around the national goals; it is
    one of the mechanisms the strategy names.</p>
    <p>Read against that, the pattern in these ${n} companies lines up with some parts of the national
    plan and not others:</p>
    <ul style="color:var(--ink-2);font-size:var(--step--1);padding-left:1.1rem">
      <li><b>Separation at source</b> is the thing the strategy says its success depends on, and it is
      the <b>weakest</b> practice in this sample — ${find('wasteSeparation').count} of ${n}
      (${find('wasteSeparation').pct}%) describe separating waste into streams on their own premises.</li>
      <li><b>Electronic waste</b> carries a 50% national collection target and no published baseline.
      ${find('eWasteRecycling').count} of ${n} companies here report collecting e-waste, several
      through the same local facility — which is how a baseline could start to exist.</li>
      <li><b>Paper and plastic</b> — the two materials most visible in household waste (12.1% and 16.7%
      of it) — are where company action clusters: ${find('paperRecycling').count} and
      ${find('plasticReduction').count} of ${n} respectively.</li>
      <li><b>Reporting</b> is the outlier: all ${n} publish a sustainability report, while Kuwait’s
      national indicator for exactly this (12.6.1) publishes no figure at all. That gap is a
      measurement gap, not necessarily a performance gap.</li>
    </ul>
    <p class="warnbox" style="margin-top:var(--sp-5)"><b>What this does not show.</b> These company
    practices support the direction of Kuwait’s national waste-management goals. They do not
    demonstrate that the companies are delivering any national percentage target, and no official
    source attributes progress on the 30%, 15%, 50% or 80% targets to them. Corporate tonnages are
    reported in kilograms and tonnes against a national picture measured in millions of tonnes;
    the two are not additive, and nothing here should be read as a national contribution figure.</p>`;

  $('#companyCaveat').innerHTML = `
    <h3>How this dataset was built — read this before the percentages</h3>
    <p>${n} large companies operating in Kuwait were researched by hand and checked against their own
    published disclosures. They were <b>selected because they publish</b>, which makes this a sample
    of disclosing companies, not a survey of Kuwaiti business. Small, unlisted and family-held firms —
    most of the economy — are absent by construction.</p>
    <p>That selection shows up immediately in the results: <b>100% publish a sustainability report</b>
    is a property of how the sample was chosen, not a finding about Kuwait. Every other percentage
    should be read as “of these ${n} researched companies”, and never as “of companies in Kuwait”.</p>
    <p class="tcard__note">A practice is marked present only where a specific published claim supports it.
    Where a company simply does not disclose, it is marked absent — absent here means
    <b>“not found in published disclosure”</b>, not “does not happen”. Each company’s evidence and
    source links are listed below the table, so any cell can be checked.</p>`;
}

/* =========================================================================
   8. TIMELINE
   ======================================================================= */
function renderTimeline(){
  $('#timeline').innerHTML = TIMELINE.map(t => `
    <div class="tl__node" data-kind="${t.kind}" tabindex="0" role="group"
         aria-label="${t.year}: ${esc(t.goal)}. Target: ${esc(t.target)}.">
      <span class="tl__dot">${t.icon}</span>
      <span class="tl__year">${t.year}</span>
      <span class="tl__goal">${esc(t.goal)}</span>
      <div class="tl__card">
        <b>${t.year} — ${esc(t.goal)}</b>
        <span class="t">🎯 ${esc(t.target)}</span>
        ${esc(t.detail)}
        <span class="s">Source: ${esc(src(t.source).org)} — ${esc(src(t.source).title)}</span>
      </div>
    </div>`).join('');
}

/* =========================================================================
   8b. PROJECTIONS — the only modelled numbers on the page
   Every figure produced here is computed in the browser from the official
   inputs in data.js, so a reader can change an assumption and watch the
   result move rather than take a single number on trust.
   ======================================================================= */

const PROJ_STATE = { popPath:'un', scenario:'flat' };

/* population(year) under the selected path */
function projPopulation(){
  const base = PROJECTION.population;
  if (PROJ_STATE.popPath === 'un') return base;
  // CSB-anchored: rescale the whole UN curve so it meets Kuwait's own 2025 estimate
  const un2025 = base.find(p => p.year === PROJECTION.csbAnchor.year).value;
  const k = PROJECTION.csbAnchor.value / un2025;
  return base.map(p => ({ year:p.year, value:Math.round(p.value * k) }));
}

/* municipal solid waste, tonnes per year, for one per-capita drift */
function projSeries(drift){
  const pop = projPopulation();
  let rate = PROJECTION.perCapitaKgDay;
  return pop.map((p, i) => {
    if (i > 0) rate *= (1 + drift);
    return { year:p.year, population:p.value, rate, tonnes: p.value * rate * 365 / 1000 };
  });
}

const fmtT  = t => t >= 1e6 ? (t / 1e6).toFixed(2) + ' Mt' : Math.round(t).toLocaleString('en') + ' t';
const fmtN  = n => Math.round(n).toLocaleString('en');

function renderProjection(){
  $('#projMethod').innerHTML = `
    <h3>How these numbers are made — read this first</h3>
    <p>Everything above this point on the page is a figure some official body has
    published. <b>Nothing below it is.</b> This section is a projection, and it is the only
    place on this page carrying numbers nobody has published.</p>
    <p>The model is deliberately the simplest one that can be checked by hand:</p>
    <p class="formula">municipal solid waste in year Y &nbsp;=&nbsp; population(Y) × kg per person per day × 365</p>
    <p>Both inputs are official and neither is invented. Population comes from the
    <b>UN World Population Prospects 2024, medium variant</b>. The waste rate is the
    <b>1.6 kg per person per day</b> that Kuwait's own EPA atlas records for municipal
    solid waste. Everything else is multiplication.</p>
    <p class="tcard__note">Sources: ${srcLink('S6')} · ${srcLink('S1')}</p>`;

  const bt = PROJECTION.backtest;
  $('#projBacktest').innerHTML = `
    <h3>Does the method work? Test it on a year Kuwait has already published</h3>
    <p>A projection nobody has checked is a guess with a chart around it. So the same
    arithmetic was run on <b>${bt.year}</b>, the year the EPA atlas reports real measured
    figures for, using the atlas's own household rate of ${bt.rateKgDay} kg per resident per day.</p>
    <div class="bt">
      <div class="bt__cell"><span class="bt__n">${fmtT(bt.modelled)}</span><span class="bt__l">What the model predicts for ${bt.year}</span></div>
      <div class="bt__cell"><span class="bt__n">${fmtT(bt.official)}</span><span class="bt__l">${esc(bt.officialLabel)}</span></div>
      <div class="bt__cell bt__cell--err"><span class="bt__n">${bt.errorPct}%</span><span class="bt__l">Error, reported and left uncorrected</span></div>
    </div>
    <p class="tcard__note">${esc(bt.verdict)}</p>`;

  // ---- controls -------------------------------------------------------
  $('#projControls').innerHTML = `
    <div class="ctl">
      <span class="ctl__lab" id="popLab">Population path</span>
      <div class="ctl__row" role="radiogroup" aria-labelledby="popLab">
        <button type="button" class="chip" data-k="popPath" data-v="un" aria-checked="true" role="radio">UN medium variant</button>
        <button type="button" class="chip" data-k="popPath" data-v="csb" aria-checked="false" role="radio">Kuwait CSB-anchored (−2.9%)</button>
      </div>
    </div>
    <div class="ctl">
      <span class="ctl__lab" id="scLab">Waste per person</span>
      <div class="ctl__row" role="radiogroup" aria-labelledby="scLab">
        ${PROJECTION.scenarios.map(sc => `
          <button type="button" class="chip" data-k="scenario" data-v="${sc.key}"
                  role="radio" aria-checked="${sc.key === 'flat'}">${esc(sc.label)}</button>`).join('')}
      </div>
    </div>`;

  $$('#projControls .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      PROJ_STATE[btn.dataset.k] = btn.dataset.v;
      $$(`#projControls .chip[data-k="${btn.dataset.k}"]`).forEach(o =>
        o.setAttribute('aria-checked', String(o === btn)));
      drawProjection();
    });
  });
  $$('#projControls .chip[aria-checked="true"]').forEach(b => b.classList.add('is-on'));

  $('#projLimits').innerHTML = `
    <h3>What this projection cannot tell you</h3>
    <ul>${PROJECTION.limits.map(l => `<li>${esc(l)}</li>`).join('')}</ul>`;

  const nf = PROJECTION.noRateForecast;
  $('#projNoRate').innerHTML = `
    <h3>${esc(nf.headline)}</h3>
    <p>${esc(nf.body)}</p>
    <p class="formula">least-squares fit, 2015–2021 &nbsp;→&nbsp; ${nf.fit.intercept} ${nf.fit.slope} × (year − 2015) &nbsp;→&nbsp; reaches 0% in ${nf.fit.zeroYear}</p>
    <p class="tcard__note">${esc(nf.reinforce)}</p>`;

  $('#projOfficial').innerHTML = PROJECTION.officialFuture.map(f => `
    <li class="gvr__item">
      <span class="gvr__n" style="color:var(--kw-green);font-size:var(--step-2)">${f.year}</span>
      <p class="gvr__t"><b>${f.icon} ${esc(f.title)}</b>${esc(f.detail)}
        <a href="${src(f.source).url}" target="_blank" rel="noopener" style="color:var(--kw-green)">Source ↗</a></p>
    </li>`).join('');

  const hz = HAZARDOUS_TREATED;
  $('#projHazard').innerHTML = `
    <caption>${esc(src(hz.source).title)}. ${esc(hz.note)}</caption>
    <thead><tr><th>Waste type</th><th>Unit</th>${hz.years.map(y => `<th class="num">${y}</th>`).join('')}</tr></thead>
    <tbody>${hz.rows.map(r => `
      <tr><th scope="row">${esc(r.label)}</th><td style="color:var(--ink-3)">${esc(r.unit)}</td>
      ${r.values.map(v => `<td class="num">${fmtN(v)}</td>`).join('')}</tr>`).join('')}</tbody>`;

  drawProjection();
}

/* ---- the projection chart ------------------------------------------- */
function drawProjection(){
  const all = PROJECTION.scenarios.map(sc => ({ sc, data: projSeries(sc.drift) }));
  const sel = all.find(a => a.sc.key === PROJ_STATE.scenario);
  const years = sel.data.map(d => d.year);
  const lo = years.map((_, i) => Math.min(...all.map(a => a.data[i].tonnes)));
  const hi = years.map((_, i) => Math.max(...all.map(a => a.data[i].tonnes)));

  const W = 760, H = 340, P = { t:28, r:30, b:46, l:62 };
  const maxY = 4.5e6, minY = 0;
  const x = i => P.l + (W - P.l - P.r) * (i / (years.length - 1));
  const y = v => P.t + (H - P.t - P.b) * (1 - (v - minY) / (maxY - minY));
  const ticks = [0, 1e6, 2e6, 3e6, 4e6];

  const line = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const band = `${line(hi)} ` + lo.map((v, i) => `L${x(lo.length - 1 - i).toFixed(1)},${y(lo[lo.length - 1 - i]).toFixed(1)}`).join(' ') + ' Z';
  const selV = sel.data.map(d => d.tonnes);
  const last = selV.length - 1;

  $('#projChart').innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" role="img"
       aria-label="Projected municipal solid waste generated in Kuwait, ${years[0]} to ${years[last]}, rising from ${fmtT(selV[0])} to ${fmtT(selV[last])} per year under the selected scenario.">
    ${ticks.map(t => `
      <line class="line__grid" x1="${P.l}" x2="${W - P.r}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"></line>
      <text class="line__txt" x="${P.l - 10}" y="${(y(t) + 4).toFixed(1)}" text-anchor="end">${(t / 1e6).toFixed(1)}</text>`).join('')}
    <text class="line__txt" x="${P.l - 10}" y="${P.t - 12}" text-anchor="end">Mt / yr</text>
    <path class="proj__band" d="${band}"></path>
    <path class="proj__line" d="${line(selV)}"></path>
    ${years.map((yr, i) => (yr % 4 === 0 || i === last) ? `
      <text class="line__txt" x="${x(i).toFixed(1)}" y="${H - P.b + 20}" text-anchor="middle">${yr}</text>` : '').join('')}
    <circle class="proj__dot" cx="${x(last).toFixed(1)}" cy="${y(selV[last]).toFixed(1)}" r="5"></circle>
    <text class="line__lab" x="${x(last).toFixed(1)}" y="${(y(selV[last]) - 15).toFixed(1)}" text-anchor="end">${fmtT(selV[last])}</text>
    ${years.map((yr, i) => `
      <rect class="line__hit" x="${(x(i) - 22).toFixed(1)}" y="${P.t}" width="44" height="${H - P.t - P.b}"
            data-i="${i}" tabindex="0" role="button"
            aria-label="${yr}: projected ${fmtT(selV[i])}"></rect>`).join('')}
  </svg>`;

  const host = $('#projChart');
  if (!host._tip) host._tip = makeTip($('#projWrap'));
  const tip = host._tip;
  const at = i => {
    const d = sel.data[i];
    const box = host.getBoundingClientRect(), wrap = $('#projWrap').getBoundingClientRect();
    tip.show(`<b>${fmtT(d.tonnes)}</b> projected municipal waste<br>${d.year} · population ${fmtN(d.population)} · ${d.rate.toFixed(2)} kg/person/day<br><span style="opacity:.75">range ${fmtT(lo[i])} – ${fmtT(hi[i])}</span>`,
             box.left - wrap.left + (x(i) / W) * box.width,
             box.top - wrap.top + (y(d.tonnes) / H) * box.height);
  };
  $$('.line__hit', host).forEach(r => {
    r.addEventListener('mouseenter', () => at(+r.dataset.i));
    r.addEventListener('focus',      () => at(+r.dataset.i));
    r.addEventListener('mouseleave', tip.hide);
    r.addEventListener('blur',       tip.hide);
  });

  // headline figures under the chart
  const cum = sel.data.filter(d => d.year >= 2025).reduce((s, d) => s + d.tonnes, 0);
  const t40 = selV[last];
  const cmp = PROJECTION.targetsInTonnes;
  $('#projHeadline').innerHTML = `
    <div class="pcard"><span class="pcard__icon">🗑️</span>
      <span class="pcard__pct">${(t40 / 1e6).toFixed(2)}</span>
      <span class="pcard__n">Mt per year</span>
      <span class="pcard__lab">Municipal solid waste Kuwait would generate in 2040 on this path</span></div>
    <div class="pcard"><span class="pcard__icon">📦</span>
      <span class="pcard__pct">${(cum / 1e6).toFixed(0)}</span>
      <span class="pcard__n">Mt, 2025–2040</span>
      <span class="pcard__lab">Cumulative municipal solid waste over the strategy's remaining run</span></div>
    <div class="pcard"><span class="pcard__icon">♻️</span>
      <span class="pcard__pct">${(t40 * 0.30 / 1e6).toFixed(2)}</span>
      <span class="pcard__n">Mt per year</span>
      <span class="pcard__lab">What the 30% recycling target means in tonnes at that volume</span></div>
    <div class="pcard"><span class="pcard__icon">📈</span>
      <span class="pcard__pct">${(t40 * 0.30 / cmp.compareValue).toFixed(1)}×</span>
      <span class="pcard__n">multiple</span>
      <span class="pcard__lab">That tonnage against the ${fmtN(cmp.compareValue / 1000)} thousand tonnes of paper, glass, plastic and cardboard Kuwait recycled from all sources in 2018</span></div>`;

  $('#projScenarioNote').innerHTML = `
    <b>${esc(sel.sc.label)}:</b> ${esc(sel.sc.blurb)}
    ${PROJ_STATE.popPath === 'csb'
      ? ` Population path rescaled to Kuwait CSB's own 2025 estimate — ${esc(PROJECTION.csbAnchor.note)}`
      : ''}
    The shaded band on the chart is the full range across all three waste-per-person scenarios.`;

  $('#projTable').innerHTML = `
    <caption>Projected municipal solid waste, ${years[0]}–${years[last]}, under the selected scenario.
    <b>These are projections, not official figures.</b> Population is UN World Population Prospects 2024 medium variant${PROJ_STATE.popPath === 'csb' ? ', rescaled to Kuwait CSB’s 2025 estimate' : ''}; the waste rate starts at Kuwait EPA’s 1.6 kg per person per day.</caption>
    <thead><tr><th>Year</th><th class="num">Population</th><th class="num">kg/person/day</th><th class="num">Projected MSW (tonnes/yr)</th><th class="num">Scenario range (tonnes/yr)</th></tr></thead>
    <tbody>${sel.data.map((d, i) => `
      <tr><th scope="row">${d.year}</th><td class="num">${fmtN(d.population)}</td>
      <td class="num">${d.rate.toFixed(2)}</td><td class="num">${fmtN(d.tonnes)}</td>
      <td class="num">${fmtN(lo[i])} – ${fmtN(hi[i])}</td></tr>`).join('')}</tbody>`;
}

/* =========================================================================
   9. SOURCES + table toggles
   ======================================================================= */
function renderSources(){
  $('#sourceList').innerHTML = Object.values(SOURCES).map(s => `
    <li>
      <b>${esc(s.org)}</b>
      <span>${esc(s.title)}</span>
      <span>${esc(s.note)}</span>
      <a href="${s.url}" target="_blank" rel="noopener">${esc(s.url)}</a>
    </li>`).join('');
}

function initTableToggles(){
  $$('.tabletoggle').forEach(btn => {
    const target = $('#' + btn.dataset.target);
    const wrapper = target.closest('.scrollx') || target;
    btn.addEventListener('click', () => {
      const open = !wrapper.hasAttribute('hidden');
      wrapper.toggleAttribute('hidden', open);
      btn.setAttribute('aria-expanded', String(!open));
      btn.textContent = open ? btn.dataset.show : btn.dataset.hide;
    });
  });
}

function redrawCharts(){ /* charts read colours from CSS vars, so a theme flip needs no redraw */ }

/* ------------------------------------------------------------------ boot - */
function boot(){
  initTheme();
  initJumpNav();
  renderGlance();
  renderStrategy();
  renderDashboard();
  renderStackedChart();
  renderLineChart();
  renderSDG12();
  renderReality();
  renderCompanies();
  renderTimeline();
  renderProjection();
  renderSources();
  initTableToggles();
}

/* DOMContentLoaded only fires once. When this page is embedded — an artifact
   host, an iframe, anything that injects the markup into a document that has
   already loaded — that event is long gone and a listener never runs, leaving
   every JS-rendered section blank. Check the state instead of assuming. */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
