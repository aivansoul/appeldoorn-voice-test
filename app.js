// ═══════════════════════════════════════════════════════════
// Appeldoorn Voice Agent · Feedback App
// Vanilla JS · localStorage + Supabase REST · Power BI dashboard
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  const QUESTIONS = window.QUESTIONS || [];
  const PERSONAS  = window.PERSONAS  || [];
  const CFG       = window.SUPABASE_CONFIG || {};
  const SHARED    = !!(CFG.url && CFG.anonKey);

  // ───── Linear SVG icons (blue/grey, stroke only) ─────
  const ICONS = {
    chart:    '<path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/>',
    user:     '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users:    '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M22 19a5 5 0 0 0-5-5"/>',
    list:     '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    phone:    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/>',
    mail:     '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>',
    check:    '<path d="m5 12 5 5L20 7"/>',
    alert:    '<path d="m12 2 11 19H1z"/><path d="M12 9v4"/><circle cx="12" cy="17" r=".5" fill="currentColor" stroke="none"/>',
    plug:     '<path d="M9 7V3M15 7V3M6 11h12v3a6 6 0 0 1-12 0z M12 17v4"/>',
    minus:    '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    help:     '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4"/><circle cx="12" cy="17" r=".5" fill="currentColor" stroke="none"/>',
    x:        '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    pulse:    '<path d="M2 12h4l3-9 4 18 3-9h6"/>'
  };

  function svgIcon(key, classes) {
    return '<svg class="ic ' + (classes || 'ic-azure') + '" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[key] + '</svg>';
  }
  function svgIconNode(key, classes) {
    const n = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    n.setAttribute('viewBox', '0 0 24 24');
    n.setAttribute('class', 'ic ' + (classes || 'ic-azure'));
    n.setAttribute('aria-hidden', 'true');
    // ICONS strings are static, no user input → safe
    n.innerHTML = ICONS[key]; // eslint-disable-line
    return n;
  }

  const RATINGS = [
    { key: 'good',      icon: 'check', label: 'Bien' },
    { key: 'medium',    icon: 'minus', label: 'Moyen' },
    { key: 'missing',   icon: 'help',  label: "Pas d'info" },
    { key: 'halluc',    icon: 'alert', label: 'Hallucine' },
    { key: 'tech',      icon: 'plug',  label: 'Pb tech.' },
    { key: 'not_asked', icon: 'x',     label: 'Pas posée' }
  ];

  const CATS = {
    appeldoorn:  { label: 'Appeldoorn',          color: 'cat-appeldoorn',  icon: 'chart' },
    crelan_part: { label: 'Crelan part.',        color: 'cat-crelan_part', icon: 'user' },
    crelan_pro:  { label: 'Crelan pro',          color: 'cat-crelan_pro',  icon: 'users' },
    crelan_coop: { label: 'Coopérateurs',        color: 'cat-crelan_coop', icon: 'users' },
    assurance:   { label: 'Assurance',           color: 'cat-assurance',   icon: 'check' },
    trick:       { label: 'Trick',               color: 'cat-trick',       icon: 'alert' }
  };

  // ───── Color class per category (used by category bars) ─────
  const CAT_COLOR_CLASS = {
    appeldoorn:  'cat-color-appeldoorn',
    crelan_part: 'cat-color-crelan_part',
    crelan_pro:  'cat-color-crelan_pro',
    crelan_coop: 'cat-color-crelan_coop',
    assurance:   'cat-color-assurance',
    trick:       'cat-color-trick'
  };

  // ───── State ─────
  const state = {
    tester: localStorage.getItem('appeldoorn_tester') || '',
    channel: localStorage.getItem('appeldoorn_channel') || 'web',
    activeFilter: 'all',
    activeSub: null,
    search: '',
    expandedInPersona: {}, // {personaId: Set<qid>}
    localFeedback: JSON.parse(localStorage.getItem('appeldoorn_local_feedback') || '{}'),
    aggregate: { rows: [], byTester: {}, total: 0 }
  };

  // ───── DOM helpers ─────
  const $  = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  function el(tag, attrs, kids) {
    const n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(k => {
      const v = attrs[k];
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    if (kids != null) {
      const arr = Array.isArray(kids) ? kids : [kids];
      arr.forEach(c => {
        if (c == null) return;
        n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return n;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function banner(msg) {
    const b = $('#banner');
    b.textContent = msg;
    b.classList.add('visible');
    clearTimeout(banner._t);
    banner._t = setTimeout(() => b.classList.remove('visible'), 1800);
  }

  // ───── Supabase REST ─────
  async function supaPost(payload) {
    if (!SHARED) return null;
    const url = CFG.url + '/rest/v1/' + CFG.table;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': CFG.anonKey,
        'Authorization': 'Bearer ' + CFG.anonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Supabase POST ' + res.status);
  }
  async function supaFetchAll() {
    if (!SHARED) return [];
    const url = CFG.url + '/rest/v1/' + CFG.table + '?select=*&order=created_at.asc&limit=10000';
    const res = await fetch(url, {
      headers: { 'apikey': CFG.anonKey, 'Authorization': 'Bearer ' + CFG.anonKey }
    });
    if (!res.ok) throw new Error('Supabase GET ' + res.status);
    return res.json();
  }

  // ───── Inject card-head icons ─────
  function injectCardIcons() {
    const map = [
      ['#head-tester',    'user'],
      ['#head-personas',  'users'],
      ['#head-questions', 'list'],
      ['#head-actions',   'settings'],
      ['#dash-title-block', 'pulse']
    ];
    map.forEach(item => {
      const node = $(item[0]);
      if (node && !node.querySelector('.ic')) node.insertBefore(svgIconNode(item[1]), node.firstChild);
    });
  }

  // ───── Tester block ─────
  function bindTester() {
    const nameInput = $('#tester-name');
    const chanSel = $('#tester-channel');
    nameInput.value = state.tester;
    chanSel.value = state.channel;
    nameInput.addEventListener('input', e => {
      state.tester = e.target.value.trim();
      localStorage.setItem('appeldoorn_tester', state.tester);
    });
    chanSel.addEventListener('change', e => {
      state.channel = e.target.value;
      localStorage.setItem('appeldoorn_channel', state.channel);
    });
  }

  // ───── Personas ─────
  function renderPersonas() {
    const grid = $('#persona-grid');
    clear(grid);
    PERSONAS.forEach(p => grid.appendChild(renderPersona(p)));
  }

  function diffClass(d) {
    const c = String(d || '').toLowerCase();
    if (c === 'facile') return 'diff-facile';
    if (c === 'moyen')  return 'diff-moyen';
    if (c === 'difficile') return 'diff-difficile';
    if (c === 'très difficile') return 'diff-très';
    if (c === 'extrême') return 'diff-extrême';
    return 'diff-na';
  }

  function renderPersona(p) {
    const node = el('div', { class: 'persona', 'data-pid': p.id });

    node.appendChild(el('div', { class: 'persona-name', text: p.name }));
    node.appendChild(el('div', { class: 'persona-desc', text: p.desc }));

    // contact block
    const ph = p.phone || {};
    const em = p.email || {};
    const contact = el('div', { class: 'persona-contact' });
    contact.appendChild(el('div', { class: 'item' }, [
      svgIconNode('phone', 'ic-sm ic-grey'),
      el('span', { class: 'v', text: ph.value || '—' }),
      el('span', { class: 'diff-tag ' + diffClass(ph.difficulty), text: ph.difficulty || '—' })
    ]));
    contact.appendChild(el('div', { class: 'item' }, [
      svgIconNode('mail', 'ic-sm ic-grey'),
      el('span', { class: 'v', text: em.value || '—' }),
      el('span', { class: 'diff-tag ' + diffClass(em.difficulty), text: em.difficulty || '—' })
    ]));
    if (em.note || ph.note) {
      contact.appendChild(el('div', { class: 'note', text: '↳ ' + (em.note || ph.note) }));
    }
    node.appendChild(contact);

    // suggested chips (clickable)
    if (p.suggested && p.suggested.length) {
      const chips = el('div', { class: 'persona-suggested' }, [
        el('span', { class: 'label-mini', text: 'Q. suggérées :' })
      ]);
      const expanded = state.expandedInPersona[p.id] || new Set();
      p.suggested.forEach(qid => {
        const isOpen = expanded.has(qid);
        const chip = el('button', {
          class: 'q-chip' + (isOpen ? ' expanded' : ''),
          'data-qid': qid,
          'aria-pressed': isOpen ? 'true' : 'false'
        }, [document.createTextNode('#' + qid)]);
        chip.addEventListener('click', () => togglePersonaQuestion(p.id, qid));
        chips.appendChild(chip);
      });
      node.appendChild(chips);
    }

    // inline area for expanded questions
    const inline = el('div', { class: 'persona-inline' });
    const expanded = state.expandedInPersona[p.id] || new Set();
    if (expanded.size > 0) {
      node.classList.add('has-expanded');
      inline.appendChild(el('div', { class: 'persona-inline-title', text: 'Questions ouvertes :' }));
      Array.from(expanded).forEach(qid => {
        const q = QUESTIONS.find(x => x.id === qid);
        if (q) inline.appendChild(renderQuestion(q, true));
      });
    }
    node.appendChild(inline);

    return node;
  }

  function togglePersonaQuestion(personaId, qid) {
    const set = state.expandedInPersona[personaId] || new Set();
    if (set.has(qid)) set.delete(qid); else set.add(qid);
    state.expandedInPersona[personaId] = set;
    renderPersonas();
  }

  // ───── Theme pills (sticky) ─────
  function renderPills() {
    const pills = $('#pills');
    clear(pills);
    const counts = { all: QUESTIONS.length };
    QUESTIONS.forEach(q => counts[q.cat] = (counts[q.cat] || 0) + 1);

    const items = [
      ['all',         'Toutes',        'list',    counts.all],
      ['appeldoorn',  'Appeldoorn',    'chart',   counts.appeldoorn || 0],
      ['crelan_part', 'Particuliers',  'user',    counts.crelan_part || 0],
      ['crelan_pro',  'Pro',           'users',   counts.crelan_pro || 0],
      ['crelan_coop', 'Coopérateurs',  'users',   counts.crelan_coop || 0],
      ['assurance',   'Assurance',     'check',   counts.assurance || 0],
      ['trick',       'Trick',         'alert',   counts.trick || 0]
    ];

    items.forEach(it => {
      const key = it[0], label = it[1], icon = it[2], count = it[3];
      const pill = el('button', {
        class: 'pill' + (state.activeFilter === key ? ' active' : ''),
        'aria-pressed': state.activeFilter === key ? 'true' : 'false'
      }, [
        svgIconNode(icon, 'ic-sm ic-grey'),
        document.createTextNode(label),
        el('span', { class: 'count', text: count })
      ]);
      pill.addEventListener('click', () => {
        state.activeFilter = key;
        state.activeSub = null;
        renderPills();
        renderSubcatBar();
        renderQuestions();
        scrollToQuestionsCard();
      });
      pills.appendChild(pill);
    });
  }

  function scrollToQuestionsCard() {
    const card = $('#question-list');
    if (card) card.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ───── Subcategory bar ─────
  function renderSubcatBar() {
    const bar = $('#subcat-bar');
    clear(bar);
    if (state.activeFilter === 'all') {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = '';
    const subs = {};
    QUESTIONS.forEach(q => {
      if (q.cat !== state.activeFilter) return;
      const s = q.sub || '—';
      subs[s] = (subs[s] || 0) + 1;
    });

    const allBtn = el('button', {
      class: 'subcat-pill' + (!state.activeSub ? ' active' : '')
    }, ['Tous', el('span', { text: ' ' + (counts(state.activeFilter)) })]);
    allBtn.addEventListener('click', () => { state.activeSub = null; renderSubcatBar(); renderQuestions(); });
    bar.appendChild(allBtn);

    Object.keys(subs).sort().forEach(s => {
      const btn = el('button', {
        class: 'subcat-pill' + (state.activeSub === s ? ' active' : '')
      }, [s, el('span', { text: ' ' + subs[s] })]);
      btn.addEventListener('click', () => { state.activeSub = s; renderSubcatBar(); renderQuestions(); });
      bar.appendChild(btn);
    });
  }

  function counts(catKey) {
    return QUESTIONS.filter(q => q.cat === catKey).length;
  }

  // ───── Questions list ─────
  function renderQuestions() {
    const wrap = $('#question-list');
    clear(wrap);
    const search = state.search.toLowerCase().trim();
    const filtered = QUESTIONS.filter(q => {
      if (state.activeFilter !== 'all' && q.cat !== state.activeFilter) return false;
      if (state.activeSub && q.sub !== state.activeSub) return false;
      if (search && q.q.toLowerCase().indexOf(search) === -1 && String(q.id).indexOf(search) === -1) return false;
      return true;
    });
    if (filtered.length === 0) {
      wrap.appendChild(el('div', { class: 'question', text: 'Aucune question ne correspond à ce filtre.' }));
      return;
    }
    filtered.forEach(q => wrap.appendChild(renderQuestion(q, false)));
  }

  function renderQuestion(q, compact) {
    const myRating = state.localFeedback[q.id];
    const cat = CATS[q.cat] || { label: q.cat, color: '' };
    const node = el('div', { class: 'question' + (compact ? ' compact' : ''), 'data-qid': q.id });

    const head = el('div', { class: 'question-head' });
    head.appendChild(el('span', { class: 'question-id', text: '#' + q.id }));
    head.appendChild(el('span', { class: 'question-cat ' + cat.color, text: cat.label }));
    if (q.sub) head.appendChild(el('span', { class: 'question-sub', text: '· ' + q.sub }));
    node.appendChild(head);

    node.appendChild(el('div', { class: 'question-text', text: q.q }));
    if (q.hint) node.appendChild(el('div', { class: 'question-hint', text: '↳ Attendu : ' + q.hint }));

    const ratings = el('div', { class: 'ratings' });
    RATINGS.forEach(r => {
      const btn = el('button', {
        class: 'rate-btn' + (myRating === r.key ? ' selected' : ''),
        'data-r': r.key,
        'aria-label': r.label
      }, [
        svgIconNode(r.icon, 'ic-grey'),
        document.createTextNode(r.label)
      ]);
      btn.addEventListener('click', () => onRate(q, r.key, btn));
      ratings.appendChild(btn);
    });
    node.appendChild(ratings);
    return node;
  }

  // ───── On rate ─────
  async function onRate(q, ratingKey, btnEl) {
    if (!state.tester) {
      banner('Indique ton prénom en haut avant de noter');
      $('#tester-name').focus();
      $('#tester-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    state.localFeedback[q.id] = ratingKey;
    localStorage.setItem('appeldoorn_local_feedback', JSON.stringify(state.localFeedback));

    // Visual selection update on all clones of this question
    $$('.question[data-qid="' + q.id + '"] .rate-btn').forEach(b => b.classList.remove('selected'));
    $$('.question[data-qid="' + q.id + '"] .rate-btn[data-r="' + ratingKey + '"]').forEach(b => b.classList.add('selected'));

    const payload = {
      tester: state.tester,
      channel: state.channel,
      question_id: q.id,
      category: q.cat,
      rating: ratingKey,
      created_at: new Date().toISOString()
    };

    if (SHARED) {
      try {
        await supaPost(payload);
        banner('✓ Q' + q.id + ' → ' + ratingLabel(ratingKey));
        await refreshAggregate();
      } catch (e) {
        console.error(e);
        banner('⚠ Sauvegarde KO — local OK');
        recomputeLocalAggregate();
      }
    } else {
      const events = JSON.parse(localStorage.getItem('appeldoorn_events') || '[]');
      events.push(payload);
      localStorage.setItem('appeldoorn_events', JSON.stringify(events));
      banner('✓ Q' + q.id + ' → ' + ratingLabel(ratingKey) + ' (local)');
      recomputeLocalAggregate();
    }
    renderDashboard();
    renderHeaderStats();
  }

  function ratingLabel(k) {
    const r = RATINGS.find(x => x.key === k);
    return r ? r.label : k;
  }

  // ───── Aggregate ─────
  function buildAggregate(rows) {
    const byKey = {}, byTester = {};
    rows.forEach(r => {
      const k = (r.tester || 'anonyme') + '||' + r.question_id;
      byKey[k] = r; // keep latest
      const tname = r.tester || 'anonyme';
      byTester[tname] = (byTester[tname] || 0) + 1;
    });
    const dedup = Object.keys(byKey).map(k => byKey[k]);
    return { rows: dedup, byTester: byTester, total: dedup.length };
  }
  function recomputeLocalAggregate() {
    const events = JSON.parse(localStorage.getItem('appeldoorn_events') || '[]');
    state.aggregate = buildAggregate(events);
  }
  async function refreshAggregate() {
    if (!SHARED) { recomputeLocalAggregate(); return; }
    try {
      const rows = await supaFetchAll();
      state.aggregate = buildAggregate(rows);
    } catch (e) {
      console.error(e);
      $('#dash-status-text').textContent = 'Erreur fetch — fallback local';
    }
  }

  // ───── Dashboard render (Glassmorphic bento) ─────
  function renderDashboard() {
    const grid = $('#dash-grid');
    clear(grid);

    const all = state.aggregate.rows;
    const rows = all.filter(r => r.rating !== 'not_asked');
    const total = rows.length;

    const counts = { good: 0, medium: 0, missing: 0, halluc: 0, tech: 0, not_asked: 0 };
    all.forEach(r => { counts[r.rating] = (counts[r.rating] || 0) + 1; });

    const testers = Object.keys(state.aggregate.byTester).length;

    // ───── 1. DISTRIBUTION HERO (3 anneaux concentriques style Apple Watch) ─────
    grid.appendChild(distributionHeroTile(counts, total, testers));

    // ───── 2. BENTO 2x2 KPIs (sous la distribution) ─────
    grid.appendChild(kpiTile('list',  'azure',  'Q. testées', total, total ? 'sur ' + QUESTIONS.length : 'aucune encore'));
    grid.appendChild(kpiTile('user',  'azure',  'Testeurs',   testers, testers > 1 ? 'actifs' : (testers === 1 ? 'actif' : '—')));
    grid.appendChild(kpiTile('help',  'orange', "Pas d'info", counts.missing, 'aurait dû savoir'));
    grid.appendChild(kpiTile('alert', 'red',    'Pb sérieux', counts.halluc + counts.tech, counts.halluc + ' halluc. · ' + counts.tech + ' tech'));

    // ───── 3. Bars catégories (style image 2 — chaque thème sa couleur) ─────
    grid.appendChild(qualityBarTile(rows));
    grid.appendChild(coverageBarTile(rows));
    grid.appendChild(testersTile());

    // Status
    if (SHARED) {
      $('#dash-status').classList.remove('local');
      $('#dash-status-text').textContent = 'Mode partagé · ' + testers + ' testeurs';
    } else {
      $('#dash-status').classList.add('local');
      $('#dash-status-text').textContent = 'Mode local · ' + testers + ' testeur(s)';
    }
  }

  // ═══════════════════════════════════════════════════════════
  // DISTRIBUTION HERO — 3 anneaux concentriques (Apple Watch style)
  // ═══════════════════════════════════════════════════════════
  function distributionHeroTile(counts, total, testers) {
    const goodN    = counts.good || 0;
    const mediumN  = counts.medium || 0;
    const badN     = (counts.missing || 0) + (counts.halluc || 0) + (counts.tech || 0);
    const goodPct  = total ? Math.round(goodN / total * 100) : 0;
    const medPct   = total ? Math.round(mediumN / total * 100) : 0;
    const badPct   = total ? Math.round(badN / total * 100) : 0;

    const tile = el('div', { class: 'dash-tile dist-hero span-4' });

    // Head : « TODAY » pill + total
    const head = el('div', { class: 'dist-head' });
    head.appendChild(el('div', { class: 'dist-pill', text: 'DISTRIBUTION' }));
    const totalWrap = el('div', { class: 'dist-total' });
    totalWrap.appendChild(svgIconNode('list', 'ic-sm'));
    totalWrap.appendChild(document.createTextNode('Notées '));
    totalWrap.appendChild(el('span', { class: 'num', text: String(total) }));
    head.appendChild(totalWrap);
    tile.appendChild(head);

    // Body : stats à gauche + 3 rings à droite
    const body = el('div', { class: 'dist-body' });

    // Left: 3 stacked stats
    const stats = el('div', { class: 'dist-stats' });
    stats.appendChild(makeDistStat('good',   goodN,   goodPct, 'Bien répondu'));
    stats.appendChild(makeDistStat('medium', mediumN, medPct,  'Moyen'));
    stats.appendChild(makeDistStat('bad',    badN,    badPct,  'Pb sérieux'));
    body.appendChild(stats);

    // Right: 3 SVG concentric rings
    const rings = el('div', { class: 'dist-rings' });
    rings.innerHTML = buildRingsSVG(goodPct, medPct, badPct, total);
    body.appendChild(rings);

    tile.appendChild(body);
    return tile;
  }

  function makeDistStat(kind, n, pct, label) {
    const stat = el('div', { class: 'dist-stat ' + kind });
    const v = el('div', { class: 'v' });
    v.appendChild(document.createTextNode(String(n)));
    if (n > 0) v.appendChild(el('span', { class: 'pct', text: ' · ' + pct + '%' }));
    stat.appendChild(v);
    const l = el('div', { class: 'l' });
    l.appendChild(el('span', { class: 'swatch' }));
    l.appendChild(document.createTextNode(label));
    stat.appendChild(l);
    return stat;
  }

  function buildRingsSVG(goodPct, medPct, badPct, total) {
    // 3 concentric rings (outer = good/green, middle = medium/orange, inner = bad/red)
    const config = [
      { r: 70, sw: 16, color: 'var(--green)',  pct: goodPct, key: 'good'   },
      { r: 50, sw: 16, color: 'var(--orange)', pct: medPct,  key: 'medium' },
      { r: 30, sw: 16, color: 'var(--red)',    pct: badPct,  key: 'bad'    }
    ];
    let svg = '<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">';
    config.forEach(c => {
      const circ = 2 * Math.PI * c.r;
      const dash = total ? circ * (c.pct / 100) : 0;
      const off  = total ? circ - dash : circ;
      // Track
      svg += '<circle class="dist-ring-track" cx="90" cy="90" r="' + c.r +
             '" stroke="' + c.color + '" stroke-opacity="0.18" stroke-width="' + c.sw + '" />';
      // Fill (only render if there's a value)
      if (total > 0 && c.pct > 0) {
        svg += '<circle class="dist-ring-fill" cx="90" cy="90" r="' + c.r +
               '" stroke="' + c.color + '" stroke-width="' + c.sw +
               '" stroke-dasharray="' + circ.toFixed(1) +
               '" stroke-dashoffset="' + off.toFixed(1) + '" />';
      }
    });
    svg += '</svg>';
    return svg;
  }

  function kpiTile(icon, color, label, value, sub) {
    return el('div', { class: 'dash-tile kpi-tile span-2 ' + color }, [
      el('div', { class: 'label' }, [svgIconNode(icon, 'ic-sm'), document.createTextNode(label)]),
      el('div', { class: 'value', text: String(value) }),
      el('div', { class: 'sub', text: sub })
    ]);
  }

  // ═══════════════════════════════════════════════════════════
  // CATEGORY BARS (style image 2 — icone + bar coloré + count)
  // ═══════════════════════════════════════════════════════════
  function qualityBarTile(rows) {
    const tile = el('div', { class: 'dash-tile dash-chart span-2' }, [
      el('div', { class: 'dash-chart-title', text: 'Qualité par thème' }),
      el('div', { class: 'dash-chart-sub',   text: '% « BIEN » SUR LES QUESTIONS NOTÉES' })
    ]);
    const list = el('div', { class: 'cat-list' });
    Object.keys(CATS).forEach(catKey => {
      const inCat = rows.filter(r => r.category === catKey);
      const goodCat = inCat.filter(r => r.rating === 'good').length;
      const pct = inCat.length ? Math.round(goodCat / inCat.length * 100) : 0;
      list.appendChild(catBarRow({
        catKey,
        label: CATS[catKey].label,
        valueLabel: inCat.length === 0 ? '—' : (pct + '%'),
        widthPct: inCat.length === 0 ? 14 : Math.max(20, pct), // min visible width
        empty: inCat.length === 0
      }));
    });
    tile.appendChild(list);
    return tile;
  }

  function coverageBarTile(rows) {
    const tile = el('div', { class: 'dash-tile dash-chart span-2' }, [
      el('div', { class: 'dash-chart-title', text: 'Couverture par thème' }),
      el('div', { class: 'dash-chart-sub',   text: 'QUESTIONS TESTÉES / DISPONIBLES' })
    ]);
    const list = el('div', { class: 'cat-list' });
    Object.keys(CATS).forEach(catKey => {
      const totalCat = QUESTIONS.filter(q => q.cat === catKey).length;
      const askedSet = {};
      rows.forEach(r => { if (r.category === catKey) askedSet[r.question_id] = true; });
      const askedCat = Object.keys(askedSet).length;
      const pct = totalCat ? Math.round(askedCat / totalCat * 100) : 0;
      list.appendChild(catBarRow({
        catKey,
        label: CATS[catKey].label,
        valueLabel: askedCat + ' / ' + totalCat,
        widthPct: askedCat === 0 ? 14 : Math.max(20, pct),
        empty: askedCat === 0
      }));
    });
    tile.appendChild(list);
    return tile;
  }

  // Single category bar row (image 2 style)
  function catBarRow(opts) {
    const cat = CATS[opts.catKey] || { label: opts.label, icon: 'list' };
    const colorClass = CAT_COLOR_CLASS[opts.catKey] || '';
    const wrap = el('div', { class: 'cat-row ' + (opts.empty ? 'empty' : '') });
    wrap.appendChild(el('div', { class: 'cat-label', text: cat.label.toUpperCase() }));
    const barWrap = el('div', { class: 'cat-bar-wrap' });
    const fill = el('div', {
      class: 'cat-bar-fill ' + colorClass,
      style: 'width:' + opts.widthPct + '%'
    });
    const iconBubble = el('div', { class: 'cat-icon' });
    iconBubble.appendChild(svgIconNode(cat.icon, 'ic-sm'));
    fill.appendChild(iconBubble);
    barWrap.appendChild(fill);
    barWrap.appendChild(el('span', { class: 'cat-count', text: opts.valueLabel }));
    wrap.appendChild(barWrap);
    return wrap;
  }

  function testersTile() {
    const tile = el('div', { class: 'dash-tile dash-chart span-4' }, [
      el('div', { class: 'dash-chart-title', text: 'Top testeurs' })
    ]);
    const list = el('div', { class: 'testers-list' });
    const sorted = Object.keys(state.aggregate.byTester)
      .map(name => [name, state.aggregate.byTester[name]])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    if (sorted.length === 0) {
      list.appendChild(el('div', { class: 'row', text: 'Aucun retour pour l\'instant.' }));
    } else {
      sorted.forEach(item => {
        list.appendChild(el('div', { class: 'row' }, [
          svgIconNode('user', 'ic-sm ic-grey'),
          el('strong', { text: item[0] }),
          el('span', { class: 'count', text: item[1] })
        ]));
      });
    }
    tile.appendChild(list);
    return tile;
  }

  function _legacy_barRow_unused(label, pct, valueLabel, colorClass) {
    return el('div', { class: 'bar-row' }, [
      el('span', { class: 'bar-label', text: label }),
      el('div', { class: 'bar-track' }, [
        el('div', { class: 'bar-fill ' + (colorClass || ''), style: 'width:' + pct + '%' })
      ]),
      el('span', { class: 'bar-value', text: valueLabel })
    ]);
  }

  function renderHeaderStats() {
    $('#hs-tests').textContent = Object.keys(state.aggregate.byTester).length;
    $('#hs-questions').textContent = state.aggregate.rows.length;
    $('#mode-pill').textContent = SHARED ? 'partagé' : 'local';
    $('#mode-pill').classList.toggle('shared', SHARED);
  }

  // ───── Mode warning ─────
  function renderModeStatus() {
    if (SHARED) return;
    const main = document.querySelector('main');
    if (!document.querySelector('.warning-banner')) {
      const w = el('div', { class: 'warning-banner' }, [
        svgIconNode('alert', 'ic-sm ic-orange'),
        el('span', null, [
          document.createTextNode('Mode '),
          el('strong', { text: 'local seulement' }),
          document.createTextNode(' — tes retours restent sur ce navigateur. Pour un dashboard partagé entre testeurs, voir '),
          el('code', { text: 'README.md' }),
          document.createTextNode('.')
        ])
      ]);
      main.insertBefore(w, main.firstChild);
    }
  }

  // ───── Export / reset ─────
  function exportCSV() {
    const rows = state.aggregate.rows;
    if (rows.length === 0) { banner('Pas de données à exporter'); return; }
    const headers = ['tester', 'channel', 'question_id', 'category', 'rating', 'created_at'];
    const lines = [headers.join(',')];
    rows.forEach(r => {
      lines.push(headers.map(h => '"' + String(r[h] == null ? '' : r[h]).replace(/"/g, '""') + '"').join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: 'appeldoorn_feedback_' + new Date().toISOString().slice(0, 10) + '.csv' });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    banner('CSV téléchargé');
  }

  function resetLocal() {
    if (!confirm('Réinitialiser tes retours locaux ? Cela ne supprime pas les données déjà partagées.')) return;
    state.localFeedback = {};
    state.expandedInPersona = {};
    localStorage.removeItem('appeldoorn_local_feedback');
    if (!SHARED) localStorage.removeItem('appeldoorn_events');
    recomputeLocalAggregate();
    renderPersonas();
    renderQuestions();
    renderDashboard();
    renderHeaderStats();
    banner('Reset effectué');
  }

  // ───── Init ─────
  async function init() {
    injectCardIcons();
    bindTester();
    renderPills();
    renderSubcatBar();
    renderPersonas();
    renderQuestions();
    renderModeStatus();

    $('#search').addEventListener('input', e => {
      state.search = e.target.value;
      renderQuestions();
    });
    $('#btn-export').addEventListener('click', exportCSV);
    $('#btn-reset').addEventListener('click', resetLocal);

    await refreshAggregate();
    renderDashboard();
    renderHeaderStats();

    if (SHARED) {
      setInterval(async () => {
        await refreshAggregate();
        renderDashboard();
        renderHeaderStats();
      }, 30000);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
