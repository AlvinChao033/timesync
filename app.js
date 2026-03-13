/* ─── TimeSync App ──────────────────────────────────────────────────── */

// ── Default zones (always shown, cannot be removed) ─────────────────
const DEFAULT_ZONES = [
  { id: 'Europe/Brussels',      city: 'Brussels',        flag: '🇧🇪' },
  { id: 'America/New_York',     city: 'Washington, DC',  flag: '🇺🇸' },
  { id: 'America/Denver',       city: 'Mountain Time',   flag: '🏔' },
  { id: 'Asia/Taipei',          city: 'Taipei',          flag: '🇹🇼' },
];

// ── Full list for the "Add" dropdown ────────────────────────────────
const ALL_ZONES = [
  { id: 'Pacific/Honolulu',       city: 'Honolulu',           flag: '🌺' },
  { id: 'America/Anchorage',      city: 'Anchorage',          flag: '🐻' },
  { id: 'America/Los_Angeles',    city: 'Los Angeles',        flag: '🎬' },
  { id: 'America/Phoenix',        city: 'Phoenix',            flag: '🌵' },
  { id: 'America/Denver',         city: 'Mountain Time',      flag: '🏔' },
  { id: 'America/Chicago',        city: 'Chicago',            flag: '🌆' },
  { id: 'America/New_York',       city: 'New York',           flag: '🗽' },
  { id: 'America/New_York',       city: 'Washington, DC',     flag: '🇺🇸' },
  { id: 'America/Toronto',        city: 'Toronto',            flag: '🍁' },
  { id: 'America/Sao_Paulo',      city: 'São Paulo',          flag: '🇧🇷' },
  { id: 'Atlantic/Reykjavik',     city: 'Reykjavik',          flag: '🇮🇸' },
  { id: 'Europe/London',          city: 'London',             flag: '🇬🇧' },
  { id: 'Europe/Paris',           city: 'Paris',              flag: '🇫🇷' },
  { id: 'Europe/Brussels',        city: 'Brussels',           flag: '🇧🇪' },
  { id: 'Europe/Berlin',          city: 'Berlin',             flag: '🇩🇪' },
  { id: 'Europe/Amsterdam',       city: 'Amsterdam',          flag: '🇳🇱' },
  { id: 'Europe/Zurich',          city: 'Zurich',             flag: '🇨🇭' },
  { id: 'Europe/Rome',            city: 'Rome',               flag: '🇮🇹' },
  { id: 'Europe/Madrid',          city: 'Madrid',             flag: '🇪🇸' },
  { id: 'Europe/Warsaw',          city: 'Warsaw',             flag: '🇵🇱' },
  { id: 'Europe/Helsinki',        city: 'Helsinki',           flag: '🇫🇮' },
  { id: 'Europe/Moscow',          city: 'Moscow',             flag: '🇷🇺' },
  { id: 'Asia/Dubai',             city: 'Dubai',              flag: '🇦🇪' },
  { id: 'Asia/Karachi',           city: 'Karachi',            flag: '🇵🇰' },
  { id: 'Asia/Kolkata',           city: 'Mumbai',             flag: '🇮🇳' },
  { id: 'Asia/Dhaka',             city: 'Dhaka',              flag: '🇧🇩' },
  { id: 'Asia/Bangkok',           city: 'Bangkok',            flag: '🇹🇭' },
  { id: 'Asia/Singapore',         city: 'Singapore',          flag: '🇸🇬' },
  { id: 'Asia/Hong_Kong',         city: 'Hong Kong',          flag: '🇭🇰' },
  { id: 'Asia/Shanghai',          city: 'Shanghai',           flag: '🇨🇳' },
  { id: 'Asia/Taipei',            city: 'Taipei',             flag: '🇹🇼' },
  { id: 'Asia/Tokyo',             city: 'Tokyo',              flag: '🇯🇵' },
  { id: 'Asia/Seoul',             city: 'Seoul',              flag: '🇰🇷' },
  { id: 'Australia/Sydney',       city: 'Sydney',             flag: '🇦🇺' },
  { id: 'Pacific/Auckland',       city: 'Auckland',           flag: '🇳🇿' },
];

// ── State ────────────────────────────────────────────────────────────
let activeZones = [];
let darkMode = false;
let localTzId = '';   // '' = auto-detect from browser
let tickInterval = null;

// ── DOM refs ─────────────────────────────────────────────────────────
const localTimeEl   = document.getElementById('local-time');
const localMetaEl   = document.getElementById('local-meta');
const clocksGrid    = document.getElementById('clocks-grid');
const tzSelect      = document.getElementById('tz-select');
const addBtn        = document.getElementById('add-tz-btn');
const themeBtn      = document.getElementById('theme-btn');
const collabBtn     = document.getElementById('collab-btn');
const feedbackBtn   = document.getElementById('feedback-btn');
const collabModal   = document.getElementById('collab-modal');
const feedbackModal = document.getElementById('feedback-modal');

// ── Init ─────────────────────────────────────────────────────────────
function init() {
  // Load saved state
  loadState();

  // Populate "Add" dropdown (exclude already-active)
  populateSelect();

  // Populate local timezone selector
  populateLocalTzSelect();

  // Start tick
  tick();
  tickInterval = setInterval(tick, 1000);

  // Dark mode
  updateTheme();
}

// ── Persist state ────────────────────────────────────────────────────
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('timesync-zones') || 'null');
    if (saved && Array.isArray(saved) && saved.length) {
      activeZones = saved;
    } else {
      activeZones = [...DEFAULT_ZONES];
    }
  } catch { activeZones = [...DEFAULT_ZONES]; }

  darkMode = localStorage.getItem('timesync-dark') === 'true';
  localTzId = localStorage.getItem('timesync-local-tz') || '';
}

function saveState() {
  localStorage.setItem('timesync-zones',    JSON.stringify(activeZones));
  localStorage.setItem('timesync-dark',     darkMode);
  localStorage.setItem('timesync-local-tz', localTzId);
}

// ── Populate dropdown ────────────────────────────────────────────────
function populateSelect() {
  // Remove all but placeholder
  while (tzSelect.options.length > 1) tzSelect.remove(1);

  const activeIds = new Set(activeZones.map(z => z.id + z.city));
  ALL_ZONES.forEach(z => {
    if (activeIds.has(z.id + z.city)) return;
    const opt = document.createElement('option');
    opt.value = ALL_ZONES.indexOf(z);
    opt.textContent = `${z.flag} ${z.city}`;
    tzSelect.appendChild(opt);
  });
}

// ── Local timezone selector ───────────────────────────────────────────
function populateLocalTzSelect() {
  const sel = document.getElementById('local-tz-select');
  sel.innerHTML = '';

  // Auto-detect option
  const auto = document.createElement('option');
  auto.value = '';
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  auto.textContent = `Auto: ${detected}`;
  sel.appendChild(auto);

  // Deduplicated list from all zones
  const seen = new Set();
  [...DEFAULT_ZONES, ...ALL_ZONES].forEach(z => {
    if (seen.has(z.id)) return;
    seen.add(z.id);
    const opt = document.createElement('option');
    opt.value = z.id;
    opt.textContent = `${z.flag} ${z.city}`;
    sel.appendChild(opt);
  });

  sel.value = localTzId;
}

document.getElementById('local-tz-select').addEventListener('change', e => {
  localTzId = e.target.value;
  saveState();
  tick();
  if (!document.getElementById('planner-body').classList.contains('hidden')) {
    setPlannerToNow();
    renderPlanner();
  }
});

// ── DST-safe helpers ──────────────────────────────────────────────────

// Extract date/time components from `now` expressed in `tz`
function getLocalDateParts(now, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: false
  }).formatToParts(now);
  const get = type => parseInt(parts.find(p => p.type === type)?.value || '0');
  const h = get('hour');
  return { year: get('year'), month: get('month'), day: get('day'),
           hour: h === 24 ? 0 : h, minute: get('minute') };
}

// Build a Date representing (year, month, day, hour, minute) in `localTzId`.
// If no local tz is selected, uses the browser's local time as before.
// Uses an iterative correction loop that is DST-safe.
function makeLocalDate(year, month, day, hour, minute) {
  if (!localTzId) return new Date(year, month - 1, day, hour, minute, 0);
  let utcMs = Date.UTC(year, month - 1, day, hour, minute);
  for (let i = 0; i < 3; i++) {
    const d = new Date(utcMs);
    const { year: dy, month: dm, day: dd, hour: dh, minute: dmi } = getLocalDateParts(d, localTzId);
    const dispMs   = Date.UTC(dy, dm - 1, dd, dh, dmi);
    const targetMs = Date.UTC(year, month - 1, day, hour, minute);
    if (dispMs === targetMs) break;
    utcMs -= (dispMs - targetMs);
  }
  return new Date(utcMs);
}

// ── Main tick ────────────────────────────────────────────────────────
function tick() {
  const now = new Date();
  updateLocalHero(now);
  updateCards(now);
}

// ── Local hero ───────────────────────────────────────────────────────
function updateLocalHero(now) {
  const tz = localTzId || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const opts = { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  localTimeEl.textContent = now.toLocaleTimeString('en-US', opts);

  const dateStr = now.toLocaleDateString('en-US', {
    timeZone: tz, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
  localMetaEl.textContent = `${tz} · ${dateStr}`;
}

// ── Cards ────────────────────────────────────────────────────────────
function updateCards(now) {
  if (!clocksGrid.children.length || clocksGrid.children.length !== activeZones.length) {
    renderCards(now);
    return;
  }
  activeZones.forEach((z, i) => {
    const card = clocksGrid.children[i];
    if (!card) return;
    const { timeStr, dateStr, offsetStr, hour } = zoneInfo(now, z.id);
    card.querySelector('.card-time').textContent = timeStr;
    card.querySelector('.card-date').textContent = dateStr;
    card.querySelector('.card-offset').textContent = offsetStr;
    const statusEl = card.querySelector('.card-status');
    const { cls, label } = workStatus(hour);
    statusEl.className = 'card-status ' + cls;
    statusEl.textContent = label;
  });
}

function renderCards(now) {
  clocksGrid.innerHTML = '';
  activeZones.forEach((z, i) => {
    const { timeStr, dateStr, offsetStr, hour } = zoneInfo(now, z.id);
    const isDefault = DEFAULT_ZONES.some(d => d.id === z.id && d.city === z.city);
    const { cls, label } = workStatus(hour);

    const card = document.createElement('div');
    card.className = 'clock-card';
    card.innerHTML = `
      ${!isDefault ? `<button class="card-remove" title="Remove" data-i="${i}">✕</button>` : ''}
      <div class="card-city">${z.flag} ${z.city}</div>
      <div class="card-tz-id">${z.id}</div>
      <div class="card-time">${timeStr}</div>
      <div class="card-date">${dateStr}</div>
      <div class="card-offset">${offsetStr}</div>
      <span class="card-status ${cls}">${label}</span>
    `;
    clocksGrid.appendChild(card);
  });

  // Remove buttons
  clocksGrid.querySelectorAll('.card-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.i);
      activeZones.splice(idx, 1);
      saveState();
      populateSelect();
      renderCards(new Date());
    });
  });
}

// ── Helpers ──────────────────────────────────────────────────────────

// DST-safe UTC offset string — reads the offset directly from the Intl API
// rather than computing it from Date arithmetic, so it's always correct
// even during DST transitions (e.g. "UTC +02:00" in CEST, "UTC +01:00" in CET).
function getUtcOffsetStr(date, tzId) {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: tzId,
      timeZoneName: 'shortOffset'   // "GMT+2", "GMT-6", "GMT+5:30"
    }).formatToParts(date);
    const raw = (parts.find(p => p.type === 'timeZoneName') || {}).value || 'GMT';
    if (raw === 'GMT') return 'UTC ±00:00';
    const m = raw.match(/GMT([+-])(\d+)(?::(\d+))?/);
    if (!m) return raw.replace('GMT', 'UTC');
    const hh = m[2].padStart(2, '0');
    const mm = (m[3] || '00').padStart(2, '0');
    return `UTC ${m[1]}${hh}:${mm}`;
  } catch {
    return 'UTC';
  }
}

function zoneInfo(now, tzId) {
  const opts = { timeZone: tzId, hour:'2-digit', minute:'2-digit', second:'2-digit', hour12: false };
  const timeStr = now.toLocaleTimeString('en-US', opts);

  const dateStr = now.toLocaleDateString('en-US', {
    timeZone: tzId, weekday:'short', month:'short', day:'numeric'
  });

  // DST-aware offset via Intl API
  const offsetStr = getUtcOffsetStr(now, tzId);

  const hour = parseInt(now.toLocaleString('en-US', { timeZone: tzId, hour:'numeric', hour12: false }));

  return { timeStr, dateStr, offsetStr, hour };
}

function workStatus(hour) {
  if (hour >= 9 && hour < 18) return { cls: 'status-work',  label: 'Business hours' };
  if ((hour >= 7 && hour < 9) || (hour >= 18 && hour < 21)) return { cls: 'status-early', label: 'Early / Late' };
  return { cls: 'status-off', label: 'Off hours' };
}

// ── Add Zone ─────────────────────────────────────────────────────────
addBtn.addEventListener('click', () => {
  const idx = parseInt(tzSelect.value);
  if (isNaN(idx)) return;
  const zone = ALL_ZONES[idx];
  activeZones.push({ ...zone });
  saveState();
  populateSelect();
  renderCards(new Date());
  tzSelect.value = '';
});

// ── Dark Mode ─────────────────────────────────────────────────────────
themeBtn.addEventListener('click', () => {
  darkMode = !darkMode;
  updateTheme();
  saveState();
});

function updateTheme() {
  document.body.classList.toggle('dark', darkMode);
  themeBtn.textContent = darkMode ? '○' : '◐';
  themeBtn.title = darkMode ? 'Switch to light mode' : 'Switch to dark mode';
}

// ── Collaboration Modal ──────────────────────────────────────────────
collabBtn.addEventListener('click', () => {
  buildCollabView();
  collabModal.classList.remove('hidden');
});
document.getElementById('collab-close').addEventListener('click', () => {
  collabModal.classList.add('hidden');
});
collabModal.addEventListener('click', e => {
  if (e.target === collabModal) collabModal.classList.add('hidden');
});

function buildCollabView() {
  const now = new Date();
  const resultEl   = document.getElementById('collab-result');
  const timelineEl = document.getElementById('collab-timeline');

  const tz = localTzId || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localLabel = localTzId
    ? ([...DEFAULT_ZONES, ...ALL_ZONES].find(z => z.id === localTzId)?.city || localTzId)
    : 'local';

  // Today's date components in the selected local tz
  const { year: nowYear, month: nowMonth, day: nowDay,
          hour: nowHour, minute: nowMin } = getLocalDateParts(now, tz);

  const fmtH = h => {
    const ampm = h < 12 ? 'AM' : 'PM';
    const disp = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${disp}:00 ${ampm}`;
  };

  // Score each local hour: count how many zones are in business hours (9-18)
  const scored = [];
  for (let h = 0; h < 24; h++) {
    const probe = makeLocalDate(nowYear, nowMonth, nowDay, h, 0);

    let score = 0;
    const zoneHours = activeZones.map(z => {
      const hr = parseInt(probe.toLocaleString('en-US', { timeZone: z.id, hour:'numeric', hour12: false }));
      if (hr >= 9 && hr < 18) score++;
      return hr;
    });
    scored.push({ localHour: h, score, zoneHours });
  }

  const maxScore = activeZones.length;

  // Group consecutive hours by score tier, pick best runs
  const fullOverlap = scored.filter(s => s.score === maxScore);
  const goodOverlap = scored.filter(s => s.score >= Math.ceil(maxScore * 0.75) && s.score < maxScore);
  const okOverlap   = scored.filter(s => s.score >= Math.ceil(maxScore * 0.5)  && s.score < Math.ceil(maxScore * 0.75));

  // Build consecutive runs
  function getRuns(hours) {
    if (!hours.length) return [];
    const runs = [];
    let s = hours[0].localHour, e = hours[0].localHour;
    for (let i = 1; i < hours.length; i++) {
      if (hours[i].localHour === e + 1) { e = hours[i].localHour; }
      else { runs.push([s, e]); s = e = hours[i].localHour; }
    }
    runs.push([s, e]);
    return runs;
  }

  // Render result
  resultEl.innerHTML = '';

  const addHeader = (text, color) => {
    const h = document.createElement('div');
    h.style.cssText = `font-size:.72rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${color};margin-top:12px;margin-bottom:4px`;
    h.textContent = text;
    resultEl.appendChild(h);
  };

  const addWindow = (s, e, tier) => {
    // For each zone, show what time it will be
    const probe = makeLocalDate(nowYear, nowMonth, nowDay, s, 0);
    const zoneTimes = activeZones.map(z => {
      const t = probe.toLocaleString('en-US', { timeZone: z.id, hour:'numeric', minute:'2-digit', hour12: true });
      return `${z.flag} ${z.city}: ${t}`;
    }).join(' &nbsp;·&nbsp; ');

    const div = document.createElement('div');
    div.className = 'collab-window' + (tier === 'best' ? ' best' : '');
    div.innerHTML = `
      <div style="flex:1">
        <div class="collab-time">${fmtH(s)} – ${fmtH(e + 1)} <span style="font-size:.75rem;color:var(--text-3)">${localLabel}</span></div>
        <div style="font-size:.72rem;color:var(--text-3);margin-top:4px;line-height:1.5">${zoneTimes}</div>
      </div>
      <span class="collab-label ${tier === 'best' ? 'label-best' : tier === 'good' ? 'label-good' : 'label-ok'}" style="align-self:flex-start;white-space:nowrap">
        ${tier === 'best' ? '★ Best' : tier === 'good' ? '✓ Good' : '~ Fair'}
      </span>
    `;
    div.style.flexDirection = 'column';
    div.style.alignItems = 'stretch';
    div.style.gap = '0';
    resultEl.appendChild(div);
  };

  const bestRuns = getRuns(fullOverlap);
  const goodRuns = getRuns(goodOverlap);
  const okRuns   = getRuns(okOverlap);

  let trackBest = [];
  if (bestRuns.length) {
    addHeader('All zones in business hours', 'var(--green)');
    bestRuns.forEach(([s,e]) => { addWindow(s, e, 'best'); trackBest.push([s,e]); });
  }
  if (goodRuns.length) {
    addHeader(`${Math.ceil(maxScore * 0.75)}+ zones in business hours`, 'var(--accent)');
    goodRuns.forEach(([s,e]) => addWindow(s, e, 'good'));
  }
  if (okRuns.length) {
    addHeader(`${Math.ceil(maxScore * 0.5)}+ zones in business hours`, 'var(--amber)');
    okRuns.forEach(([s,e]) => addWindow(s, e, 'ok'));
  }
  if (!bestRuns.length && !goodRuns.length && !okRuns.length) {
    resultEl.innerHTML = `<div style="color:var(--text-2);font-size:.9rem;padding:12px 0">
      No workable overlap windows found. All zones are outside business hours simultaneously.
    </div>`;
  }

  // Build timeline bars
  timelineEl.innerHTML = `<div class="timeline-title">24-hour overlap view</div>`;
  const nowFrac = (nowHour + nowMin / 60) / 24 * 100;

  activeZones.forEach(z => {
    const wrapper = document.createElement('div');
    wrapper.className = 'timeline-zone';

    const label = document.createElement('div');
    label.className = 'tz-name';
    label.textContent = `${z.flag} ${z.city}`;

    const bar = document.createElement('div');
    bar.className = 'tz-bar';

    // DST-safe: probe each local hour to find which ones fall inside
    // 09:00–18:00 in this zone. Uses makeLocalDate so the x-axis reflects
    // the user's selected local tz rather than the browser tz.
    const workLocalHours = [];
    for (let h = 0; h < 24; h++) {
      const probe = makeLocalDate(nowYear, nowMonth, nowDay, h, 0);
      const zHour = parseInt(
        probe.toLocaleString('en-US', { timeZone: z.id, hour: 'numeric', hour12: false })
      );
      if (zHour >= 9 && zHour < 18) workLocalHours.push(h);
    }

    // Build consecutive run segments (handles wrap-around or split blocks)
    const segments = [];
    if (workLocalHours.length) {
      let segStart = workLocalHours[0];
      let prev = workLocalHours[0];
      for (let i = 1; i < workLocalHours.length; i++) {
        if (workLocalHours[i] !== prev + 1) {
          segments.push([segStart, prev + 1]); // [startH, endH exclusive]
          segStart = workLocalHours[i];
        }
        prev = workLocalHours[i];
      }
      segments.push([segStart, prev + 1]);
    }

    segments.forEach(([sh, eh]) => {
      const fill = document.createElement('div');
      fill.className = 'tz-bar-fill';
      fill.style.left  = (sh / 24 * 100) + '%';
      fill.style.width = ((eh - sh) / 24 * 100) + '%';
      bar.appendChild(fill);
    });

    // Now marker
    const nowMarker = document.createElement('div');
    nowMarker.className = 'tz-bar-now';
    nowMarker.style.left = nowFrac + '%';

    bar.appendChild(nowMarker);
    wrapper.appendChild(label);
    wrapper.appendChild(bar);
    timelineEl.appendChild(wrapper);
  });

  // Highlight overlap region across all bars
  const highlightRuns = bestRuns.length ? bestRuns : goodRuns.length ? goodRuns : okRuns;
  if (highlightRuns.length > 0) {
    const [s, e] = highlightRuns[0];
    const overlapStart = s / 24 * 100;
    const overlapWidth = (e - s + 1) / 24 * 100;
    timelineEl.querySelectorAll('.tz-bar-fill').forEach(f => {
      const fLeft  = parseFloat(f.style.left);
      const fRight = fLeft + parseFloat(f.style.width);
      const oRight = overlapStart + overlapWidth;
      const iLeft  = Math.max(fLeft, overlapStart);
      const iRight = Math.min(fRight, oRight);
      if (iRight > iLeft) {
        const ov = document.createElement('div');
        ov.className = 'tz-bar-fill overlap';
        ov.style.left  = iLeft  + '%';
        ov.style.width = (iRight - iLeft) + '%';
        f.parentElement.appendChild(ov);
      }
    });
  }
}

// ── Feedback Modal ───────────────────────────────────────────────────
feedbackBtn.addEventListener('click', () => {
  document.getElementById('feedback-thanks').classList.add('hidden');
  document.getElementById('feedback-form').classList.remove('hidden');
  feedbackModal.classList.remove('hidden');
});
document.getElementById('feedback-close').addEventListener('click', () => {
  feedbackModal.classList.add('hidden');
});
feedbackModal.addEventListener('click', e => {
  if (e.target === feedbackModal) feedbackModal.classList.add('hidden');
});

// Star rating
let feedbackRating = 0;
document.getElementById('rating-row').addEventListener('click', e => {
  const star = e.target.closest('.star');
  if (!star) return;
  feedbackRating = parseInt(star.dataset.v);
  document.querySelectorAll('.star').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.v) <= feedbackRating);
  });
});

document.getElementById('feedback-form').addEventListener('submit', e => {
  e.preventDefault();
  const type = document.getElementById('feedback-type').value;
  const msg  = document.getElementById('feedback-msg').value.trim();
  // Store locally
  const entry = { rating: feedbackRating, type, msg, ts: new Date().toISOString() };
  const all = JSON.parse(localStorage.getItem('timesync-feedback') || '[]');
  all.push(entry);
  localStorage.setItem('timesync-feedback', JSON.stringify(all));

  document.getElementById('feedback-form').classList.add('hidden');
  document.getElementById('feedback-thanks').classList.remove('hidden');
});

// ── Meeting Planner ──────────────────────────────────────────────────
const plannerToggle  = document.getElementById('planner-toggle');
const plannerBody    = document.getElementById('planner-body');
const plannerChevron = document.getElementById('planner-chevron');
const plannerDateEl  = document.getElementById('planner-date');
const plannerTimeEl  = document.getElementById('planner-time');
const plannerNowBtn  = document.getElementById('planner-now-btn');
const plannerSummary = document.getElementById('planner-summary');
const plannerGrid    = document.getElementById('planner-grid');

// Toggle open/close
plannerToggle.addEventListener('click', () => {
  const open = plannerBody.classList.toggle('hidden') === false;
  plannerToggle.setAttribute('aria-expanded', open);
  plannerChevron.classList.toggle('open', open);
  if (open) {
    setPlannerToNow();
    renderPlanner();
  }
});

// Set inputs to current moment (in the selected local tz)
function setPlannerToNow() {
  const now = new Date();
  const tz = localTzId || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { year, month, day, hour, minute } = getLocalDateParts(now, tz);
  plannerDateEl.value = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  plannerTimeEl.value = `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
}

plannerNowBtn.addEventListener('click', () => { setPlannerToNow(); renderPlanner(); });
plannerDateEl.addEventListener('change', renderPlanner);
plannerTimeEl.addEventListener('change', renderPlanner);
plannerTimeEl.addEventListener('input',  renderPlanner);

function renderPlanner() {
  const dateVal = plannerDateEl.value;
  const timeVal = plannerTimeEl.value;
  if (!dateVal || !timeVal) return;

  // Build a Date from picker values interpreted in the selected local tz
  const [year, month, day] = dateVal.split('-').map(Number);
  const [hour, minute]     = timeVal.split(':').map(Number);
  const selected = makeLocalDate(year, month, day, hour, minute);

  // Summary counts
  let workCount = 0, earlyCount = 0, offCount = 0;

  // Render rows
  plannerGrid.innerHTML = '';
  activeZones.forEach(z => {
    const { timeStr, hour: zHour, dayLabel } = plannerZoneInfo(selected, z.id);
    const { rowCls, badgeCls, badgeLabel } = plannerStatus(zHour);
    if (badgeCls === 'badge-work')  workCount++;
    else if (badgeCls === 'badge-early') earlyCount++;
    else offCount++;

    const row = document.createElement('div');
    row.className = `planner-row ${rowCls}`;
    row.innerHTML = `
      <span class="planner-row-flag">${z.flag}</span>
      <span class="planner-row-city">${z.city}</span>
      <span class="planner-row-time">${timeStr}</span>
      <span class="planner-row-day">${dayLabel}</span>
      <span class="planner-row-badge ${badgeCls}">${badgeLabel}</span>
    `;
    plannerGrid.appendChild(row);
  });

  // Summary text
  const total = activeZones.length;
  const parts = [];
  if (workCount)  parts.push(`<span class="s-green">${workCount} in business hours</span>`);
  if (earlyCount) parts.push(`<span class="s-amber">${earlyCount} early/late</span>`);
  if (offCount)   parts.push(`<span class="s-red">${offCount} off hours</span>`);

  const localTzLabel = localTzId
    ? ([...DEFAULT_ZONES, ...ALL_ZONES].find(z => z.id === localTzId)?.city || localTzId)
    : Intl.DateTimeFormat().resolvedOptions().timeZone;

  const fmtSelected = selected.toLocaleString('en-US', {
    timeZone: localTzId || Intl.DateTimeFormat().resolvedOptions().timeZone,
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  plannerSummary.innerHTML = `
    <strong>${fmtSelected}</strong> <span style="color:var(--text-3)">(${localTzLabel})</span> &nbsp;·&nbsp; ${parts.join(', &nbsp;')}
  `;
}

function plannerZoneInfo(date, tzId) {
  const timeStr = date.toLocaleTimeString('en-US', {
    timeZone: tzId, hour: 'numeric', minute: '2-digit', hour12: true
  });

  const hour = parseInt(date.toLocaleString('en-US', {
    timeZone: tzId, hour: 'numeric', hour12: false
  }));

  // Day label: compare date in zone vs selected local tz date
  const zDate = date.toLocaleDateString('en-CA', { timeZone: tzId });
  const lDate = date.toLocaleDateString('en-CA', {
    timeZone: localTzId || Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  let dayLabel = '';
  if (zDate > lDate)      dayLabel = '+1 day';
  else if (zDate < lDate) dayLabel = '−1 day';
  else                    dayLabel = 'same day';

  return { timeStr, hour, dayLabel };
}

function plannerStatus(hour) {
  if (hour >= 9 && hour < 18)
    return { rowCls: 'row-work',  badgeCls: 'badge-work',  badgeLabel: 'Business hours' };
  if ((hour >= 7 && hour < 9) || (hour >= 18 && hour < 21))
    return { rowCls: 'row-early', badgeCls: 'badge-early', badgeLabel: 'Early / Late' };
  return   { rowCls: 'row-off',  badgeCls: 'badge-off',   badgeLabel: 'Off hours' };
}

// ── Start ────────────────────────────────────────────────────────────
init();
