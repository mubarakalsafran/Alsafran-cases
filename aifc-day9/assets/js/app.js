/* ==========================================================================
   JAHRA SHOP STOCK AGENT — page behaviour
   No dependencies. Everything here is a simulation; nothing leaves the page.
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var MAX_ALERTS = 10;          // stop condition: 10 low-stock alerts per run
  var MAX_SPEND_KD = 0;         // the agent may never spend

  /* ---------------------------------------------------------- reveal --- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }
  /* Safety net: if anything stops the observer firing, show the content anyway. */
  window.addEventListener('load', function () {
    setTimeout(function () {
      revealables.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.2) el.classList.add('is-in');
      });
    }, 1200);
  });

  /* ------------------------------------------------- stat count-up ----- */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var start = null, dur = 900;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); io2.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io2.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* --------------------------------------------- stock progress bars --- */
  var bars = document.querySelectorAll('.inv__fill');
  function fillBar(el) { el.style.width = (el.getAttribute('data-w') || '0') + '%'; }
  if ('IntersectionObserver' in window) {
    var io3 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fillBar(e.target); io3.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    bars.forEach(function (el) { io3.observe(el); });
  } else {
    bars.forEach(fillBar);
  }

  /* ------------------------------------------------------ scroll spy --- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function spy() {
    var y = window.scrollY + (document.getElementById('nav').offsetHeight || 58) + 24;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= y) current = s; });
    links.forEach(function (a) {
      a.classList.toggle('is-active', current && a.getAttribute('href') === '#' + current.id);
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { spy(); ticking = false; });
  }, { passive: true });
  spy();

  /* =========================================================== DEMO ==== */
  var form    = document.getElementById('demoForm');
  if (!form) return;

  var elName  = document.getElementById('pName');
  var elQty   = document.getElementById('pQty');
  var elMin   = document.getElementById('pMin');
  var box     = document.getElementById('resultBox');
  var logList = document.getElementById('logList');
  var counter = document.getElementById('counter');
  var countEl = document.getElementById('alertCount');
  var resetBt = document.getElementById('resetBtn');

  var alertsThisRun = 0;
  var alertedProducts = [];   // stands in for the agent's 7-day memory

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* A value counts as a number only if it is present and genuinely numeric.
     Blank, spaces, "N/A" and similar are NOT zero — they are missing. */
  function readNumber(raw) {
    var v = (raw || '').trim();
    if (v === '') return { ok: false, reason: 'missing' };
    if (!/^-?\d+(\.\d+)?$/.test(v)) return { ok: false, reason: 'invalid' };
    var n = Number(v);
    if (!isFinite(n)) return { ok: false, reason: 'invalid' };
    if (n < 0) return { ok: false, reason: 'invalid' };
    return { ok: true, value: n };
  }

  function stamp() {
    var d = new Date();
    function p(n) { return n < 10 ? '0' + n : '' + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
           ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function render(kind, title, math, why, action) {
    box.innerHTML =
      '<div class="result result--' + kind + '">' +
        '<div class="result__verdict">' + title + '</div>' +
        (math ? '<div class="result__math">' + math + '</div>' : '') +
        '<p class="result__why">' + why + '</p>' +
        '<div class="result__action">' + action + '</div>' +
      '</div>';
  }

  function addLog(product, status, cls) {
    if (logList.getAttribute('data-empty') !== 'no') {
      logList.innerHTML = '';
      logList.setAttribute('data-empty', 'no');
    }
    var row = document.createElement('div');
    row.className = 'logline';
    row.innerHTML = '<span><span class="badge badge--' + cls + '">' + status + '</span> ' +
                    esc(product) + '</span><span class="t">' + stamp() + '</span>';
    logList.insertBefore(row, logList.firstChild);
  }

  function updateCounter() {
    countEl.textContent = String(alertsThisRun);
    counter.classList.toggle('is-max', alertsThisRun >= MAX_ALERTS);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = (elName.value || '').trim();
    var qty  = readNumber(elQty.value);
    var min  = readNumber(elMin.value);

    /* STOP CONDITION — 10 alerts per run, 0 KD spend */
    if (alertsThisRun >= MAX_ALERTS) {
      render('warn', '🛑 STOP — ALERT LIMIT REACHED',
        'alerts this run = ' + MAX_ALERTS + ' (maximum) · spend = ' + MAX_SPEND_KD + ' KD',
        'The workflow stops after ' + MAX_ALERTS + ' low-stock alerts in one run. A human must ' +
        'review the remaining products before any more alerts are created.',
        'Action: hand over to a human · press Reset Run to start a new run');
      return;
    }

    /* STOP AND ASK — missing product name */
    if (name === '') {
      render('warn', '🛑 STOP — HUMAN REVIEW REQUIRED', null,
        'The product name is missing. The agent must never guess which product a record ' +
        'belongs to.',
        'Action: no alert created · no inventory changed');
      addLog('(no product name)', 'Human review', 'warn');
      return;
    }

    /* STOP AND ASK — missing or invalid numbers (Rule 3, after the change) */
    if (!qty.ok || !min.ok) {
      var bits = [];
      if (!qty.ok) bits.push('current quantity is ' + qty.reason);
      if (!min.ok) bits.push('minimum stock is ' + min.reason);
      render('warn', '🛑 STOP — HUMAN REVIEW REQUIRED',
        'current quantity = ' + esc(elQty.value.trim() || 'BLANK') +
        '  ·  minimum stock = ' + esc(elMin.value.trim() || 'BLANK'),
        'For ' + esc(name) + ', ' + bits.join(' and ') + '. Rule 3 says that if either value is ' +
        'missing or invalid the agent must STOP and ask a human. Missing information is never ' +
        'treated as zero.',
        'Action: no alert created · no inventory changed');
      addLog(name, 'Human review', 'warn');
      return;
    }

    /* THE COMPARISON */
    if (qty.value <= min.value) {
      var seen = alertedProducts.indexOf(name.toLowerCase()) !== -1;
      if (seen) {
        render('alert', '🔔 LOW STOCK — ALREADY ALERTED',
          qty.value + ' &lt;= ' + min.value + '  →  LOW STOCK',
          esc(name) + ' is low, but an alert for this product was already recorded. The agent\'s ' +
          '7-day memory stops it from writing the same alert twice.',
          'Action: duplicate alert skipped · no inventory changed');
        addLog(name, 'Duplicate', 'mute');
        return;
      }
      alertedProducts.push(name.toLowerCase());
      alertsThisRun += 1;
      updateCounter();
      render('alert', '🔔 LOW STOCK ALERT',
        qty.value + ' &lt;= ' + min.value + '  →  LOW STOCK',
        esc(name) + ' has ' + qty.value + ' units left and the minimum stock level is ' +
        min.value + '. The agent records a low-stock alert so a human can decide whether to order more.',
        'Action: alert written to the test log only · nothing purchased · 0 KD spent');
      addLog(name, 'Low stock', 'alert');
    } else {
      render('safe', '✅ NO ACTION — STOCK LEVEL SAFE',
        qty.value + ' &gt; ' + min.value + '  →  NO ACTION',
        esc(name) + ' has ' + qty.value + ' units, which is above the minimum stock level of ' +
        min.value + '. Doing nothing is the correct answer here.',
        'Action: no alert created · no inventory changed');
      addLog(name, 'No action', 'safe');
    }
  });

  /* presets */
  document.querySelectorAll('.preset').forEach(function (b) {
    b.addEventListener('click', function () {
      elName.value = b.getAttribute('data-p');
      elQty.value  = b.getAttribute('data-q');
      elMin.value  = b.getAttribute('data-m');
      elName.focus();
    });
  });

  /* reset run — clears the simulated run, not any real system */
  resetBt.addEventListener('click', function () {
    alertsThisRun = 0;
    alertedProducts = [];
    updateCounter();
    form.reset();
    logList.setAttribute('data-empty', 'yes');
    logList.innerHTML = '<div class="logline"><span>No checks yet</span><span class="t">—</span></div>';
    box.innerHTML =
      '<div class="result">' +
        '<div class="result__verdict" style="color:var(--ink-2)">⏳ Waiting for input</div>' +
        '<p class="result__why">Enter a product, a current quantity and a minimum stock level, ' +
        'then press Check Stock.</p>' +
      '</div>';
  });

  logList.setAttribute('data-empty', 'yes');
  updateCounter();
})();
