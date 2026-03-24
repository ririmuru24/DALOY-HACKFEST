const app = {
    screens: {},
    dispenseInterval: null,
    currentMl: 0,
    totalMl: 1000,
    idleTimer: null,
    mode: 'get-water',   // 'get-water' or 'recycle-only'
    scanIdCounter: 0,     // incremented each scan; guards stale timeout callbacks

    init() {
        this.screens = {
            'welcome':    document.getElementById('state-welcome'),
            'insert':     document.getElementById('state-insert'),
            'scanning':   document.getElementById('state-scanning'),
            'get-water':  document.getElementById('state-get-water'),
            'dispensing': document.getElementById('state-dispensing'),
            'reward':     document.getElementById('state-reward'),
        };
        this.go('welcome');
    },

    go(name) {
        Object.values(this.screens).forEach(s => { if (s) s.classList.remove('active'); });
        if (this.screens[name]) this.screens[name].classList.add('active');
        this.resetIdle();
    },

    resetIdle() {
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => this.go('welcome'), 90000);
    },

    /* ---- Welcome buttons ---- */
    startGetWater() {
        this.mode = 'get-water';
        this.go('insert');
    },

    startRecycleOnly() {
        this.mode = 'recycle-only';
        this.go('insert');
    },

    /* ---- Insert screen ---- */
    selectTag(val) {
        const inp = document.getElementById('trash-input');
        if (inp) inp.value = val;
    },

    startScanning() {
        const inp = document.getElementById('trash-input');
        const val = inp ? inp.value.trim() : 'Unknown';
        const klase  = document.getElementById('scan-klase');
        const halaga = document.getElementById('scan-halaga');
        if (klase)  klase.innerText  = 'Tinitignan...';
        if (halaga) halaga.innerText = 'Tinitignan...';
        this.go('scanning');

        // Guard token: if idle resets screen before scan finishes, cancel the callbacks
        const scanId = ++this.scanIdCounter;

        const reward = Math.floor(Math.random() * 500) + 300;
        setTimeout(() => {
            if (this.scanIdCounter !== scanId) return; // stale — cancelled
            if (klase)  klase.innerText  = val || 'Plastik';
            if (halaga) halaga.innerText = reward + ' ml';
        }, 1500);

        setTimeout(() => {
            if (this.scanIdCounter !== scanId) return; // stale — cancelled
            if (this.mode === 'get-water') {
                this.go('get-water');
            } else {
                this.showDonation();
            }
        }, 3500);
    },

    showDonation() {
        const earned = Math.floor(Math.random() * 200) + 50;
        const total  = Math.floor(Math.random() * 2000) + 1500;
        const title = document.querySelector('#state-reward .reward-title');
        const desc  = document.querySelector('#state-reward .reward-desc');
        const neg = document.getElementById('pts-nagastos');
        const pts = document.getElementById('pts-natitira');
        const negLabel = document.querySelector('#state-reward .pts-card.green-bg-card span');
        const ptsLabel = document.querySelector('#state-reward .pts-card.blue-bg-card span');
        if (title) title.innerText = 'SALAMAT!';
        if (desc)  desc.innerHTML = 'Nakolekta mo ang <strong class="blue-hl">' + earned + ' pts</strong><br>para sa iyong basura!';
        if (neg)      neg.innerText = '+' + earned + ' pts';
        if (negLabel) negLabel.innerText = 'Nakolekta';
        if (pts)      pts.innerText = (total + earned).toLocaleString() + ' pts';
        if (ptsLabel) ptsLabel.innerText = 'Kabuuang Puntos';
        this.go('reward');
    },

    /* ---- Get Water screen ---- */
    selectSize(ml, btn) {
        this.totalMl = ml;
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active-size'));
        btn.classList.add('active-size');
        const hint = document.getElementById('cost-hint');
        const pts  = ml / 10;
        const label = ml >= 1000 ? (ml/1000) + 'L' : ml + 'ml';
        if (hint) hint.innerText = `Gagastusin: ${pts} pts para sa ${label}`;
    },

    startDispensing() {
        clearInterval(this.dispenseInterval);
        this.currentMl = 0;

        const bar   = document.getElementById('dispense-bar');
        const pct   = document.getElementById('pct-text');
        const ratio = document.getElementById('dispense-ratio');
        const total = document.getElementById('dispense-total-label');
        const fill  = document.getElementById('waterFill');

        if (bar)    bar.style.width   = '0%';
        if (pct)    pct.innerText     = '0%';
        if (fill)   fill.style.height = '0%';
        if (total)  total.innerText   = this.totalMl + ' ml';
        if (ratio)  ratio.innerText   = '0 / ' + this.totalMl + ' ml';

        this.go('dispensing');

        const step = this.totalMl / 60;
        this.dispenseInterval = setInterval(() => {
            this.currentMl += step;
            if (this.currentMl >= this.totalMl) {
                this.currentMl = this.totalMl;
                clearInterval(this.dispenseInterval);
                setTimeout(() => this.showReward(), 1200);
            }
            const p = Math.floor((this.currentMl / this.totalMl) * 100);
            if (bar)   bar.style.width   = p + '%';
            if (pct)   pct.innerText     = p + '%';
            if (fill)  fill.style.height = p + '%';
            if (ratio) ratio.innerText   = Math.floor(this.currentMl) + ' / ' + this.totalMl + ' ml';
        }, 80);
    },

    showReward() {
        clearInterval(this.dispenseInterval);
        const dispensedMl = Math.floor(this.currentMl);
        const spent = Math.floor(this.totalMl / 10);
        const left  = Math.floor(Math.random() * 2000) + 1500;
        const title    = document.querySelector('#state-reward .reward-title');
        const desc     = document.querySelector('#state-reward .reward-desc');
        const mlEl     = document.getElementById('final-reward-ml');
        const neg      = document.getElementById('pts-nagastos');
        const pts      = document.getElementById('pts-natitira');
        const negLabel = document.querySelector('#state-reward .pts-card.green-bg-card span');
        const ptsLabel = document.querySelector('#state-reward .pts-card.blue-bg-card span');

        if (title) title.innerText = 'MABUHAY!';
        // Update description text WITHOUT re-injecting duplicate IDs
        if (desc)  desc.innerHTML = 'Nakuha mo ang <strong class="blue-hl">' + dispensedMl + 'ml</strong><br>na malinis na tubig.';
        // Keep the static #final-reward-ml element in sync too
        if (mlEl)  mlEl.innerText = dispensedMl + 'ml';
        if (neg)      neg.innerText = '-' + spent + ' pts';
        if (negLabel) negLabel.innerText = 'Nagastos';
        if (pts)      pts.innerText = left.toLocaleString() + ' pts';
        if (ptsLabel) ptsLabel.innerText = 'Natitira';
        this.go('reward');
    },

    /* Direct dispense from welcome — no longer used, but kept as fallback */
    directDispense() {
        this.mode = 'get-water';
        this.totalMl = 1000;
        this.go('get-water');
    },

    /* ---- Validate recycle input before scanning ---- */
    validateAndScan() {
        const inp = document.getElementById('trash-input');
        const err = document.getElementById('trash-error');
        if (!inp || !inp.value.trim()) {
            // Show error message
            if (err) err.style.display = 'block';
            // Flash red outline on the input
            if (inp) {
                inp.style.borderColor = '#FF6B6B';
                inp.style.boxShadow   = '0 0 0 3px rgba(255,107,107,0.3)';
                inp.focus();
                setTimeout(() => {
                    inp.style.borderColor = '';
                    inp.style.boxShadow   = '';
                }, 1800);
            }
            return;
        }
        // Valid — hide error and proceed
        if (err) err.style.display = 'none';
        if (inp) { inp.style.borderColor = ''; inp.style.boxShadow = ''; }
        this.startScanning();
    }
};

window.addEventListener('DOMContentLoaded', () => app.init());
