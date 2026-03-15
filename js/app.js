// js/app.js — Nourish Phoenix main application

// ── MAP SETUP ──────────────────────────────────────────────────────
const map = L.map('map', {
  center: [33.458, -112.065],
  zoom: 11,
  zoomControl: false,
  attributionControl: true,
});

// Dark tile layer (CartoDB Voyager Dark Matter)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a> | Food data: USDA ERS',
  subdomains: 'abcd',
  maxZoom: 19,
}).addTo(map);

// Zoom control bottom-right
L.control.zoom({ position: 'bottomright' }).addTo(map);

// ── LAYER GROUPS ───────────────────────────────────────────────────
const layers = {
  desert:  L.layerGroup().addTo(map),
  grocery: L.layerGroup().addTo(map),
  clinic:  L.layerGroup().addTo(map),
  pantry:  L.layerGroup().addTo(map),
  transit: L.layerGroup(), // off by default
};

// ── FOOD APARTHEID ZONES ───────────────────────────────────────────
const SEVERITY_COLOR = {
  1: { fill: '#C4623A', opacity: 0.22 },
  2: { fill: '#C4623A', opacity: 0.38 },
  3: { fill: '#8B3E22', opacity: 0.60 },
};
const SEVERITY_LABEL = { 1: 'Moderate', 2: 'High', 3: 'Severe' };

FOOD_APARTHEID_ZONES.forEach(zone => {
  const { fill, opacity } = SEVERITY_COLOR[zone.severity];
  const rect = L.rectangle(zone.bounds, {
    color: fill,
    weight: 1,
    fillColor: fill,
    fillOpacity: opacity,
  });

  rect.bindPopup(`
    <div class="popup-type">Food Apartheid Zone — ${SEVERITY_LABEL[zone.severity]}</div>
    <div class="popup-name">${zone.name}</div>
    <div class="popup-desc">${zone.notes}</div>
    <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
      <div style="background:rgba(196,98,58,0.15);border-radius:6px;padding:7px 9px;">
        <div style="font-size:16px;font-weight:600;color:#E8845E;font-family:'Playfair Display',serif;">${zone.nearestGrocery}mi</div>
        <div style="font-size:10px;color:#7A6E62;">nearest SNAP store</div>
      </div>
      <div style="background:rgba(196,98,58,0.15);border-radius:6px;padding:7px 9px;">
        <div style="font-size:16px;font-weight:600;color:#E8845E;font-family:'Playfair Display',serif;">${zone.snapEligible}%</div>
        <div style="font-size:10px;color:#7A6E62;">SNAP eligible</div>
      </div>
    </div>
    ${zone.nativePopPct > 5 ? `<div style="margin-top:8px;padding:6px 9px;background:rgba(139,62,34,0.2);border-radius:6px;font-size:11px;color:#E8845E;">
      ▲ ${zone.nativePopPct}% Native American population — above average
    </div>` : ''}
    <button class="popup-btn" onclick="showNearbyResources(${(zone.bounds[0][0]+zone.bounds[1][0])/2}, ${(zone.bounds[0][1]+zone.bounds[1][1])/2})">
      Find nearby resources →
    </button>
  `, { maxWidth: 260 });

  rect.on('mouseover', function() { this.setStyle({ fillOpacity: opacity + 0.15 }); });
  rect.on('mouseout',  function() { this.setStyle({ fillOpacity: opacity }); });

  layers.desert.addLayer(rect);
});

// ── CUSTOM MARKER ICONS ────────────────────────────────────────────
function makeIcon(emoji, color, size = 32) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:${size/2}px ${size/2}px ${size/2}px 2px;
      display:flex;align-items:center;justify-content:center;
      font-size:${size * 0.5}px;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
      border:1.5px solid rgba(255,255,255,0.2);
      transform:translateY(-${size/2}px);
      cursor:pointer;
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const ICONS = {
  clinic:  makeIcon('🏥', '#C9973A', 30),
  pantry:  makeIcon('📦', '#4A7FA5', 28),
  grocery: makeIcon('🛒', '#6B8C6B', 28),
};

// ── PLACE RESOURCE MARKERS ─────────────────────────────────────────
function tagHtml(tags) {
  return tags.map(t => {
    const map = {
      snap:    ['ctag-snap',    'SNAP/EBT'],
      native:  ['ctag-native',  'Native focus'],
      free:    ['ctag-free',    'Free services'],
      transit: ['ctag-transit', 'Transit access'],
    };
    if (!map[t]) return '';
    return `<span class="ctag ${map[t][0]}">${map[t][1]}</span>`;
  }).join('');
}

RESOURCES.forEach(r => {
  const marker = L.marker([r.lat, r.lng], { icon: ICONS[r.type] });

  const typeLabel = { clinic: '🏥 Health Clinic', pantry: '📦 Food Pantry', grocery: '🛒 Grocery Store' }[r.type];

  marker.bindPopup(`
    <div class="popup-type">${typeLabel}</div>
    <div class="popup-name">${r.name}</div>
    <div class="popup-desc">${r.desc}</div>
    ${r.addr  ? `<div class="popup-addr">📍 ${r.addr}</div>` : ''}
    ${r.phone ? `<div class="popup-phone">📞 <a href="tel:${r.phone}" style="color:#8FBDD3;">${r.phone}</a></div>` : ''}
    <div class="popup-tags">${tagHtml(r.tags)}</div>
    ${r.url ? `<a class="popup-btn" href="${r.url}" target="_blank" rel="noopener">Visit website ↗</a>` : ''}
  `, { maxWidth: 280 });

  // Highlight sidebar card on marker click
  marker.on('click', () => {
    switchTab('resources');
    renderCards(currentFilter);
    setTimeout(() => {
      const card = document.getElementById('card-' + r.id);
      if (card) {
        document.querySelectorAll('.detail-card').forEach(c => c.classList.remove('highlighted'));
        card.classList.add('highlighted');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 60);
  });

  layers[r.type].addLayer(marker);
});

// Update layer counts
function updateCounts() {
  const counts = { desert: FOOD_APARTHEID_ZONES.length };
  ['clinic','pantry','grocery'].forEach(t => {
    counts[t] = RESOURCES.filter(r => r.type === t).length;
  });
  counts.transit = 4;
  Object.entries(counts).forEach(([k, v]) => {
    const el = document.getElementById('cnt-' + k);
    if (el) el.textContent = v;
  });
}
updateCounts();

// ── TRANSIT LAYER (Valley Metro Light Rail) ────────────────────────
const transitLines = [
  // East–West line (approximate)
  [[33.4528, -112.0740], [33.4528, -112.0400], [33.4528, -111.9400], [33.4528, -111.8900]],
  // North–South segment
  [[33.4528, -112.0740], [33.5000, -112.0740], [33.5300, -112.0740]],
];
transitLines.forEach(coords => {
  L.polyline(coords, {
    color: '#4A7FA5',
    weight: 4,
    opacity: 0.6,
    dashArray: '10 6',
  }).bindTooltip('Valley Metro Light Rail', { sticky: true }).addTo(layers.transit);
});

// ── LAYER TOGGLE ───────────────────────────────────────────────────
function toggleLayer(id, btn) {
  const layer = layers[id];
  if (!layer) return;
  if (map.hasLayer(layer)) {
    map.removeLayer(layer);
    btn.classList.remove('active');
  } else {
    map.addLayer(layer);
    btn.classList.add('active');
  }
}

// ── SIDEBAR TABS ───────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ntab').forEach(t => t.classList.remove('active'));
  const content = document.getElementById('tab-' + tab);
  if (content) content.classList.add('active');
  document.querySelectorAll('.ntab').forEach(btn => {
    if (btn.dataset.tab === tab) btn.classList.add('active');
  });
}

// ── RESOURCE LIST ──────────────────────────────────────────────────
let currentFilter = 'all';

function renderCards(filter = 'all') {
  currentFilter = filter;
  const searchVal = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const list = document.getElementById('resource-list');

  let items = RESOURCES;
  if (filter !== 'all') items = items.filter(r => r.type === filter);
  if (searchVal) {
    items = items.filter(r =>
      r.name.toLowerCase().includes(searchVal) ||
      r.desc.toLowerCase().includes(searchVal) ||
      (r.addr && r.addr.toLowerCase().includes(searchVal))
    );
  }

  if (items.length === 0) {
    list.innerHTML = `<div class="no-results">No resources match your search.<br>Try a different term or category.</div>`;
    return;
  }

  const typeLabel = { clinic: '🏥 Health Clinic', pantry: '📦 Food Pantry', grocery: '🛒 Grocery Store' };

  list.innerHTML = items.map(r => `
    <div class="detail-card" id="card-${r.id}" onclick="flyToResource('${r.id}')">
      <div class="card-type">${typeLabel[r.type]}</div>
      <div class="card-name">${r.name}</div>
      <div class="card-desc">${r.desc}</div>
      ${r.addr  ? `<div class="card-addr">📍 ${r.addr}</div>` : ''}
      ${r.phone ? `<div class="card-phone">📞 ${r.phone}</div>` : ''}
      <div class="card-tags">${tagHtml(r.tags)}</div>
    </div>
  `).join('');
}

function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCards(filter);
}

function filterResources() {
  renderCards(currentFilter);
}

// Fly map to resource and open popup
function flyToResource(id) {
  const r = RESOURCES.find(x => x.id === id);
  if (!r) return;
  map.flyTo([r.lat, r.lng], 15, { duration: 1.2 });

  // Open the matching marker popup
  layers[r.type].eachLayer(marker => {
    const pos = marker.getLatLng();
    if (Math.abs(pos.lat - r.lat) < 0.001 && Math.abs(pos.lng - r.lng) < 0.001) {
      setTimeout(() => marker.openPopup(), 1300);
    }
  });
}

// Find resources near a clicked zone centroid
function showNearbyResources(lat, lng) {
  map.closePopup();
  switchTab('resources');
  setFilter('all', document.querySelector('.ftab'));

  // Sort resources by distance to zone center
  const withDist = RESOURCES.map(r => ({
    ...r,
    dist: Math.hypot(r.lat - lat, r.lng - lng),
  })).sort((a, b) => a.dist - b.dist).slice(0, 8);

  const list = document.getElementById('resource-list');
  const typeLabel = { clinic: '🏥 Health Clinic', pantry: '📦 Food Pantry', grocery: '🛒 Grocery Store' };
  list.innerHTML = `
    <div style="padding:8px 4px 12px;font-size:11px;color:var(--warm-gray);">Nearest resources to this zone:</div>
    ${withDist.map(r => `
      <div class="detail-card" id="card-${r.id}" onclick="flyToResource('${r.id}')">
        <div class="card-type">${typeLabel[r.type]}</div>
        <div class="card-name">${r.name}</div>
        <div class="card-desc">${r.desc}</div>
        ${r.addr ? `<div class="card-addr">📍 ${r.addr}</div>` : ''}
        ${r.phone ? `<div class="card-phone">📞 ${r.phone}</div>` : ''}
        <div class="card-tags">${tagHtml(r.tags)}</div>
      </div>
    `).join('')}
  `;
}

// Initial render
renderCards();

// ── DIABETES RISK TOOL ─────────────────────────────────────────────
function calcRisk() {
  const age      = +document.getElementById('r-age').value;
  const family   = +document.getElementById('r-family').value;
  const diet     = +document.getElementById('r-diet').value;
  const activity = +document.getElementById('r-activity').value;
  const native   = +document.getElementById('r-native').value;

  // Native identity adds 2 pts — 2.3× higher biological + systemic risk
  const score = age + family + diet + activity + (native * 2);

  const el = document.getElementById('risk-result');
  el.classList.add('show');
  el.classList.remove('low', 'moderate', 'high');

  if (score <= 2) {
    el.classList.add('low');
    el.innerHTML = `
      <strong>✓ Lower risk</strong> — Keep up healthy habits.
      Annual blood sugar checks are still recommended for everyone over 35.
      Ask your doctor about a free A1C test at your next visit.
    `;
  } else if (score <= 5) {
    el.classList.add('moderate');
    el.innerHTML = `
      <strong>⚠ Moderate risk</strong> — Consider a free A1C screening.
      <br><br>
      <strong>NATIVE HEALTH Phoenix</strong> offers free diabetes prevention programs to all Native people
      regardless of tribal enrollment — no ID or insurance required.
      Call <a href="tel:6022795262" style="color:#8FBDD3;">(602) 279-5262</a>.
      <br><br>
      The SDPI prevention program at Phoenix Indian Medical Center has been shown to
      <strong>reduce diabetes risk by 58%</strong> through lifestyle coaching.
    `;
  } else {
    el.classList.add('high');
    el.innerHTML = `
      <strong>⚑ Elevated risk</strong> — Please get an A1C blood test soon.
      <br><br>
      <strong>For Native Americans:</strong> Phoenix Indian Medical Center (IHS) provides free care
      to enrolled tribal members. NATIVE HEALTH Phoenix serves all Native people.
      Call <a href="tel:6022795262" style="color:#8FBDD3;">(602) 279-5262</a>.
      <br><br>
      <strong>For anyone:</strong> St. Mary's Food Bank offers free health screenings at select
      food distribution events. Call <a href="tel:6022423663" style="color:#8FBDD3;">(602) 242-3663</a>.
      <br><br>
      <strong>SDPI Lifestyle Intervention</strong> can reduce your risk by 58% — ask any IHS
      or NATIVE HEALTH clinic to enroll you.
    `;
  }
}
