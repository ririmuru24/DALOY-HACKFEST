/* DALOY Mobile – Shared Interactivity */

// ── QR Helpers ───────────────────────────────────────────────
function genSessionId(prefix) {
  return prefix + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function showQR(opts) {
  const overlay = document.getElementById('qr-overlay');
  if (!overlay) return;
  const box = document.getElementById('qr-box');
  box.innerHTML = '';
  const sessionId = genSessionId(opts.sessionPrefix || 'DALOY');
  const qrData = opts.qrData || ('https://daloy.app/scan?session=' + sessionId);
  if (window.QRCode) {
    new QRCode(box, { text: qrData, width: 152, height: 152, colorDark: '#000', colorLight: '#fff', correctLevel: QRCode.CorrectLevel.M });
  } else {
    box.innerHTML = `<svg width="152" height="152" viewBox="0 0 152 152" xmlns="http://www.w3.org/2000/svg">
      <rect width="152" height="152" fill="#fff"/>
      <rect x="10" y="10" width="50" height="50" fill="none" stroke="#000" stroke-width="8"/>
      <rect x="24" y="24" width="22" height="22" fill="#000"/>
      <rect x="92" y="10" width="50" height="50" fill="none" stroke="#000" stroke-width="8"/>
      <rect x="106" y="24" width="22" height="22" fill="#000"/>
      <rect x="10" y="92" width="50" height="50" fill="none" stroke="#000" stroke-width="8"/>
      <rect x="24" y="106" width="22" height="22" fill="#000"/>
      <rect x="68" y="68" width="16" height="16" fill="#000"/>
      <rect x="92" y="68" width="10" height="10" fill="#000"/>
      <rect x="110" y="68" width="10" height="10" fill="#000"/>
      <rect x="128" y="68" width="14" height="14" fill="#000"/>
      <rect x="68" y="92" width="10" height="10" fill="#000"/>
      <rect x="68" y="110" width="16" height="16" fill="#000"/>
      <rect x="92" y="92" width="14" height="14" fill="#000"/>
      <rect x="114" y="100" width="10" height="10" fill="#000"/>
      <rect x="128" y="92" width="14" height="22" fill="#000"/>
    </svg>`;
  }
  if (document.getElementById('qr-title'))   document.getElementById('qr-title').textContent   = opts.title     || 'QR Code';
  if (document.getElementById('qr-sub'))     document.getElementById('qr-sub').textContent     = opts.sub       || '';
  if (document.getElementById('qr-label'))   document.getElementById('qr-label').textContent   = opts.scanLabel || 'Scan at the kiosk';
  if (document.getElementById('qr-session')) document.getElementById('qr-session').textContent = sessionId;
  overlay.classList.add('open');
}

function closeQR() {
  const overlay = document.getElementById('qr-overlay');
  if (overlay) overlay.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('qr-overlay');
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeQR(); });
  document.getElementById('qr-done')?.addEventListener('click', closeQR);
});

// ── Home – Quick Action QR (called via onclick) ───────────────
window.openQR = function(type) {
  if (type === 'recycle') {
    showQR({ title: 'Recycle QR Code', sub: 'Scan at the kiosk to start recycling', scanLabel: 'Scan at the kiosk', sessionPrefix: 'DALOY-REC' });
  } else if (type === 'water') {
    showQR({ title: 'Get Water QR Code', sub: 'Present this at the kiosk to collect water', scanLabel: 'Scan at the kiosk', sessionPrefix: 'DALOY-H2O' });
  }
};

// Home scan-btn
document.getElementById('scan-btn')?.addEventListener('click', () => {
  showQR({ title: 'Scan QR Code', sub: 'Scan any DALOY kiosk', scanLabel: 'Align with kiosk scanner', sessionPrefix: 'DALOY-SCN' });
});

// ── Water Amount Picker (get-water.html) ─────────────────────
const pickerValEl = document.getElementById('picker-val');
const litersChips = document.querySelectorAll('.chip[data-liters]');
const RATE        = 100;
const BALANCE     = 2840;
let currentLiters = 2;
let waterMode     = 'myself';

function updatePicker(liters) {
  currentLiters = Math.max(1, Math.min(liters, 28));
  if (pickerValEl) pickerValEl.textContent = currentLiters;
  litersChips.forEach(c => c.classList.toggle('active', parseInt(c.dataset.liters) === currentLiters));

  const cost      = currentLiters * RATE;
  const costCalc  = document.getElementById('cost-calc');
  const costVal   = document.getElementById('cost-val');
  const remaining = document.getElementById('remaining-pts');
  const eco       = document.getElementById('eco-tip-text');

  if (costCalc)  costCalc.textContent  = `${currentLiters}L × ${RATE} pts/L`;
  if (costVal)   costVal.textContent   = `${cost.toLocaleString()} pts`;
  if (remaining) {
    const rem = BALANCE - cost;
    remaining.textContent = `${rem.toLocaleString()} pts`;
    remaining.style.color = rem >= 0 ? 'var(--accent)' : 'var(--red)';
  }
  if (eco) eco.textContent = `Getting ${currentLiters}L avoids ${(currentLiters * 0.5).toFixed(1)} kg of single-use plastic waste`;
}

document.getElementById('btn-minus')?.addEventListener('click', () => updatePicker(currentLiters - 1));
document.getElementById('btn-plus')?.addEventListener('click',  () => updatePicker(currentLiters + 1));
litersChips.forEach(c => c.addEventListener('click', () => updatePicker(parseInt(c.dataset.liters))));
if (pickerValEl) updatePicker(2);

// ── Water For Toggle Cards ────────────────────────────────────
document.querySelectorAll('.toggle-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.toggle-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    waterMode = card.dataset.mode || card.dataset.val || 'myself';
  });
});

// ── Get Water CTA → QR ───────────────────────────────────────
document.getElementById('water-cta')?.addEventListener('click', () => {
  const isDonate = waterMode === 'donate';
  showQR({
    title:         'Water QR Code',
    sub:           isDonate ? 'Share this with the recipient to scan' : 'Present at the kiosk to collect water',
    scanLabel:     isDonate ? 'Share with recipient to scan'         : 'Scan at the kiosk',
    sessionPrefix: 'DALOY-H2O'
  });
});

// ── Donate Points Picker (donate.html) ───────────────────────
const donateValEl  = document.getElementById('donate-val');
const ptsChips     = document.querySelectorAll('.chip[data-pts]');
const STEP         = 100;
const DONATE_BAL   = 2840;
let currentDonate  = 200;

function updateDonate(pts) {
  currentDonate = Math.round(Math.max(100, Math.min(pts, DONATE_BAL)) / 100) * 100;
  const liters = currentDonate / 100;

  if (donateValEl) donateValEl.textContent = currentDonate.toLocaleString();

  const dlEl = document.getElementById('donate-liters');
  if (dlEl) dlEl.textContent = `= ${liters} Liter${liters !== 1 ? 's' : ''} of water`;

  ptsChips.forEach(c => c.classList.toggle('active', parseInt(c.dataset.pts) === currentDonate));

  const dsPts    = document.getElementById('ds-pts');
  const dsLit    = document.getElementById('ds-liters');
  const dsAfter  = document.getElementById('ds-after');
  const dsImpact = document.getElementById('ds-impact');

  if (dsPts)    dsPts.textContent    = `\u2212${currentDonate.toLocaleString()} pts`;
  if (dsLit)    dsLit.textContent    = `${liters} Liter${liters !== 1 ? 's' : ''}`;
  if (dsAfter)  dsAfter.textContent  = `${(DONATE_BAL - currentDonate).toLocaleString()} pts`;
  if (dsImpact) dsImpact.innerHTML   = `<strong>${liters} liter${liters !== 1 ? 's' : ''}</strong> can sustain a child for <strong>${liters} day${liters !== 1 ? 's' : ''}</strong>`;
}

document.getElementById('donate-minus')?.addEventListener('click', () => updateDonate(currentDonate - STEP));
document.getElementById('donate-plus')?.addEventListener('click',  () => updateDonate(currentDonate + STEP));
ptsChips.forEach(c => c.addEventListener('click', () => updateDonate(parseInt(c.dataset.pts))));
if (donateValEl) updateDonate(200);

// ── Beneficiary Selector (.beneficiary + .radio-dot) ─────────
document.querySelectorAll('.beneficiary').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.beneficiary').forEach(c => {
      c.classList.remove('active');
      const dot = c.querySelector('.radio-dot');
      if (dot) dot.classList.remove('active');
    });
    card.classList.add('active');
    const dot = card.querySelector('.radio-dot');
    if (dot) dot.classList.add('active');
  });
});

// ── Donate CTA → QR ──────────────────────────────────────────
document.getElementById('donate-cta')?.addEventListener('click', () => {
  showQR({ title: 'Donation QR Code', sub: 'Share with your chosen recipient to scan', scanLabel: 'Share with recipient to scan', sessionPrefix: 'DALOY-DON' });
});

// ── Filter Chips (locations.html) ────────────────────────────
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

// ── Recycle radio options (recycle.html) ─────────────────────
document.querySelectorAll('.radio-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
});

// ── CTA ripple ───────────────────────────────────────────────
document.querySelectorAll('.btn-cta').forEach(btn => {
  btn.addEventListener('click', function() {
    this.style.transform = 'scale(0.96)';
    setTimeout(() => { this.style.transform = ''; }, 160);
  });
});
