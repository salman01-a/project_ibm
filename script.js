/**
 * ============================================================
 * Smart Bill & Tip Splitter — script.js
 * Vanilla JavaScript murni (ES6+), tanpa dependensi eksternal
 * ============================================================
 *
 * Arsitektur:
 *  - State terpusat (object `state`)
 *  - Fungsi kalkulasi murni (pure functions)
 *  - Fungsi render yang memperbarui DOM berdasarkan state
 *  - Event listeners terdaftar satu kali di inisialisasi
 * ============================================================
 */

'use strict';

/* ── 1. Konfigurasi Mata Uang ────────────────────────────────── */
/**
 * Peta konfigurasi format mata uang.
 * Tiap entri berisi: simbol tampilan, locale untuk Intl.NumberFormat,
 * dan kode mata uang ISO 4217.
 */
const CURRENCIES = {
  IDR: { symbol: 'Rp',  locale: 'id-ID', code: 'IDR' },
  USD: { symbol: '$',   locale: 'en-US', code: 'USD' },
  EUR: { symbol: '€',   locale: 'de-DE', code: 'EUR' },
};

/* ── 2. State Terpusat ───────────────────────────────────────── */
/**
 * Satu-satunya sumber kebenaran (single source of truth) aplikasi.
 * Semua perubahan input memodifikasi state ini, lalu render dipanggil.
 */
const state = {
  billAmount:  0,     // Jumlah tagihan (angka, bukan string)
  tipPercent:  0,     // Persentase tip yang sedang aktif
  peopleCount: 1,     // Jumlah orang yang berbagi
  currency:    'IDR', // Kode mata uang aktif
};

/* ── 3. Referensi Elemen DOM ─────────────────────────────────── */
/**
 * Semua referensi elemen DOM dikumpulkan di satu tempat agar
 * mudah dikelola dan menghindari query berulang ke DOM.
 */
const el = {
  // Input
  currency:       document.getElementById('currency'),
  currencySymbol: document.getElementById('currency-symbol'),
  billAmount:     document.getElementById('bill-amount'),
  tipSlider:      document.getElementById('tip-slider'),
  tipSliderOutput:document.getElementById('tip-slider-output'),
  tipBtns:        document.querySelectorAll('.tip-btn'),
  peopleCount:    document.getElementById('people-count'),
  btnMinus:       document.getElementById('btn-minus'),
  btnPlus:        document.getElementById('btn-plus'),

  // Output (kartu ringkasan)
  tipPerPerson:   document.getElementById('tip-per-person'),
  totalPerPerson: document.getElementById('total-per-person'),
  grandTotal:     document.getElementById('grand-total'),

  // Lainnya
  peopleError:    document.getElementById('people-error'),
  btnReset:       document.getElementById('btn-reset'),
  card:           document.querySelector('.card'),
};

/* ── 4. Fungsi Utilitas ──────────────────────────────────────── */

/**
 * Memformat angka menjadi string mata uang sesuai locale dan kode.
 * Menggunakan Intl.NumberFormat bawaan browser untuk presisi penuh.
 *
 * @param {number} amount  - Nilai yang akan diformat
 * @param {string} currCode - Kode mata uang (misal: 'IDR')
 * @returns {string} String mata uang yang sudah diformat
 */
function formatCurrency(amount, currCode) {
  const cfg = CURRENCIES[currCode];
  return new Intl.NumberFormat(cfg.locale, {
    style:    'currency',
    currency: cfg.code,
    // IDR tidak memerlukan desimal, USD/EUR tetap pakai 2 desimal
    minimumFractionDigits: currCode === 'IDR' ? 0 : 2,
    maximumFractionDigits: currCode === 'IDR' ? 0 : 2,
  }).format(amount);
}

/**
 * Menambahkan class animasi sementara ke sebuah elemen,
 * lalu menghapusnya setelah animasi selesai.
 *
 * @param {HTMLElement} element - Elemen target
 * @param {string}      cls     - Nama class CSS animasi
 * @param {number}      dur     - Durasi animasi dalam ms (default: 500)
 */
function animateOnce(element, cls, dur = 500) {
  element.classList.remove(cls); // Reset untuk retriggering
  // Force reflow agar animasi dapat dimulai ulang
  void element.offsetWidth;
  element.classList.add(cls);
  setTimeout(() => element.classList.remove(cls), dur);
}

/**
 * Memperbarui nilai elemen output dan memicu animasi "pop"
 * hanya jika nilai benar-benar berubah.
 *
 * @param {HTMLElement} element  - Elemen <span> output
 * @param {string}      newValue - Nilai teks baru
 */
function updateOutputValue(element, newValue) {
  if (element.textContent !== newValue) {
    element.textContent = newValue;
    animateOnce(element, 'updated', 400);
  }
}

/* ── 5. Fungsi Kalkulasi (Pure Functions) ────────────────────── */

/**
 * Menghitung semua nilai output berdasarkan state saat ini.
 * Mengembalikan object dengan tiga nilai: tipPerPerson, totalPerPerson,
 * dan grandTotal.
 *
 * Fungsi ini murni (tidak ada efek samping / side effects).
 *
 * @param {object} s - State aplikasi
 * @returns {{ tipPerPerson: number, totalPerPerson: number, grandTotal: number }}
 */
function calculate(s) {
  // Guard: pastikan tidak ada pembagian dengan nol
  if (s.billAmount <= 0 || s.peopleCount < 1) {
    return { tipPerPerson: 0, totalPerPerson: 0, grandTotal: 0 };
  }

  const tipTotal      = s.billAmount * (s.tipPercent / 100);
  const totalBill     = s.billAmount + tipTotal;
  const tipPerPerson   = tipTotal / s.peopleCount;
  const totalPerPerson = totalBill / s.peopleCount;
  const grandTotal     = totalBill;

  return { tipPerPerson, totalPerPerson, grandTotal };
}

/* ── 6. Fungsi Render ────────────────────────────────────────── */

/**
 * Memperbarui semua elemen output DOM berdasarkan state terbaru.
 * Dipanggil setiap kali state berubah.
 */
function render() {
  const { tipPerPerson, totalPerPerson, grandTotal } = calculate(state);
  const curr = state.currency;

  updateOutputValue(el.tipPerPerson,   formatCurrency(tipPerPerson,   curr));
  updateOutputValue(el.totalPerPerson, formatCurrency(totalPerPerson, curr));
  updateOutputValue(el.grandTotal,     formatCurrency(grandTotal,     curr));
}

/**
 * Memperbarui tampilan simbol mata uang di prefix input tagihan
 * dan memperbarui slider track gradient.
 */
function renderCurrencySymbol() {
  el.currencySymbol.textContent = CURRENCIES[state.currency].symbol;
}

/**
 * Memperbarui visual track (warna fill) pada slider sesuai posisinya.
 * Menggunakan background-size trick yang kompatibel lintas browser.
 */
function renderSliderTrack() {
  const pct = ((state.tipPercent - 0) / (50 - 0)) * 100;
  // Gunakan dua warna solid agar track terlihat di semua browser
  el.tipSlider.style.background =
    `linear-gradient(to right, var(--clr-accent) ${pct}%, rgba(255,255,255,0.12) ${pct}%)`;
}

/* ── 7. Validasi Input ───────────────────────────────────────── */

/**
 * Memvalidasi jumlah orang (harus >= 1 dan integer).
 * Menampilkan atau menyembunyikan pesan error sesuai hasil validasi.
 *
 * @param {number} value - Nilai yang akan divalidasi
 * @returns {boolean} true jika valid, false jika tidak
 */
function validatePeopleCount(value) {
  const parsed = parseInt(value, 10);
  let errorMsg = '';

  if (isNaN(parsed) || value === '') {
    errorMsg = 'Masukkan jumlah orang yang valid.';
  } else if (parsed <= 0) {
    errorMsg = 'Jumlah orang tidak boleh 0 atau negatif.';
  } else if (parsed > 99) {
    errorMsg = 'Maksimal 99 orang.';
  }

  // Tampilkan atau sembunyikan pesan error
  el.peopleError.textContent = errorMsg;

  // Update ARIA state pada stepper input
  el.peopleCount.setAttribute('aria-invalid', errorMsg ? 'true' : 'false');

  return errorMsg === '';
}

/* ── 8. Handler Perubahan Tip ────────────────────────────────── */

/**
 * Mengatur persentase tip aktif dan menyinkronkan semua UI tip:
 * - Tombol cepat (aria-pressed)
 * - Slider posisi
 * - Output label slider
 *
 * @param {number}  percent  - Persentase tip baru
 * @param {boolean} fromSlider - true jika perubahan berasal dari slider
 */
function setTipPercent(percent, fromSlider = false) {
  state.tipPercent = percent;

  // Perbarui status tombol tip cepat
  el.tipBtns.forEach((btn) => {
    const isActive = parseInt(btn.dataset.tip, 10) === percent;
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  // Sinkronkan slider jika perubahan BUKAN dari slider
  if (!fromSlider) {
    // Jika nilai di luar range slider (0-50), set ke nilai terdekat
    const clampedVal = Math.min(50, Math.max(0, percent));
    el.tipSlider.value = clampedVal;
    el.tipSlider.setAttribute('aria-valuenow', clampedVal);
    el.tipSlider.setAttribute('aria-valuetext', `${clampedVal}%`);
  }

  // Perbarui label output slider
  el.tipSliderOutput.textContent = `${percent}%`;

  // Perbarui visual track slider
  renderSliderTrack();
}

/* ── 9. Event Handlers ───────────────────────────────────────── */

/**
 * Handler: perubahan dropdown mata uang.
 */
function handleCurrencyChange() {
  state.currency = el.currency.value;
  renderCurrencySymbol();
  render();
}

/**
 * Handler: perubahan input jumlah tagihan.
 * Menggunakan parseFloat untuk mendukung nilai desimal.
 */
function handleBillAmountInput() {
  const raw = parseFloat(el.billAmount.value);
  // Jika field kosong atau NaN, set ke 0
  state.billAmount = isNaN(raw) || raw < 0 ? 0 : raw;
  render();
}

/**
 * Handler: klik tombol tip cepat.
 * Mengambil nilai dari atribut data-tip.
 */
function handleTipBtnClick(e) {
  const btn = e.currentTarget;
  const tipValue = parseInt(btn.dataset.tip, 10);
  setTipPercent(tipValue, false);
  render();
}

/**
 * Handler: geser slider tip kustom.
 */
function handleSliderInput() {
  const val = parseInt(el.tipSlider.value, 10);
  // Update ARIA attributes slider
  el.tipSlider.setAttribute('aria-valuenow', val);
  el.tipSlider.setAttribute('aria-valuetext', `${val}%`);
  // Sinkronkan state dan UI (dari slider, jadi fromSlider = true)
  setTipPercent(val, true);
  render();
}

/**
 * Handler: klik tombol kurang (−) pada stepper.
 */
function handleBtnMinus() {
  const current = parseInt(el.peopleCount.value, 10) || 1;
  const next = Math.max(1, current - 1); // Tidak boleh di bawah 1
  el.peopleCount.value = next;
  state.peopleCount = next;
  validatePeopleCount(next);
  render();
}

/**
 * Handler: klik tombol plus (+) pada stepper.
 */
function handleBtnPlus() {
  const current = parseInt(el.peopleCount.value, 10) || 1;
  const next = Math.min(99, current + 1); // Maksimal 99
  el.peopleCount.value = next;
  state.peopleCount = next;
  validatePeopleCount(next);
  render();
}

/**
 * Handler: input langsung ke field jumlah orang.
 * Mendukung pengetikan manual oleh pengguna.
 */
function handlePeopleInput() {
  const val = el.peopleCount.value;
  const parsed = parseInt(val, 10);

  if (validatePeopleCount(val)) {
    state.peopleCount = parsed;
    render();
  } else {
    // Jika tidak valid, kalkulasi ulang dengan nilai teraman (1)
    state.peopleCount = parsed > 0 && !isNaN(parsed) ? parsed : 1;
    render();
  }
}

/**
 * Handler: klik tombol Reset.
 * Mengembalikan form ke kondisi awal dengan animasi shake.
 */
function handleReset() {
  // Tambah class spinning pada ikon reset untuk animasi putar
  el.btnReset.classList.add('spinning');

  // Tambah animasi shake pada card
  animateOnce(el.card, 'shake', 450);

  // Tunggu sedikit untuk animasi terlihat, lalu reset state
  setTimeout(() => {
    // Reset state ke nilai awal
    state.billAmount  = 0;
    state.tipPercent  = 0;
    state.peopleCount = 1;
    state.currency    = 'IDR';

    // Reset semua input DOM
    el.currency.value     = 'IDR';
    el.billAmount.value   = '';
    el.peopleCount.value  = 1;

    // Reset UI tip (tombol & slider)
    setTipPercent(0, false);

    // Reset validasi error
    el.peopleError.textContent = '';
    el.peopleCount.setAttribute('aria-invalid', 'false');

    // Perbarui simbol mata uang dan render ulang
    renderCurrencySymbol();
    render();

    // Hapus class spinning setelah animasi selesai
    el.btnReset.classList.remove('spinning');
  }, 200);
}

/* ── 10. Inisialisasi Event Listeners ───────────────────────── */

/**
 * Mendaftarkan semua event listener setelah DOM siap.
 * Dipanggil sekali saat halaman pertama kali dimuat.
 */
function initEventListeners() {
  // Mata uang
  el.currency.addEventListener('change', handleCurrencyChange);

  // Jumlah tagihan — 'input' agar real-time
  el.billAmount.addEventListener('input', handleBillAmountInput);

  // Tombol tip cepat — loop karena NodeList
  el.tipBtns.forEach((btn) => {
    btn.addEventListener('click', handleTipBtnClick);
  });

  // Slider tip kustom
  el.tipSlider.addEventListener('input', handleSliderInput);

  // Stepper jumlah orang
  el.btnMinus.addEventListener('click', handleBtnMinus);
  el.btnPlus.addEventListener('click', handleBtnPlus);
  el.peopleCount.addEventListener('input', handlePeopleInput);

  // Cegah input nilai desimal pada field orang (hanya integer)
  el.peopleCount.addEventListener('keydown', (e) => {
    // Izinkan: backspace, delete, tab, escape, enter, arrow keys
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                         'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (allowedKeys.includes(e.key)) return;
    // Blokir karakter selain digit
    if (!/^\d$/.test(e.key)) e.preventDefault();
  });

  // Tombol reset
  el.btnReset.addEventListener('click', handleReset);
}

/* ── 11. Inisialisasi Aplikasi ───────────────────────────────── */

/**
 * Titik masuk utama aplikasi.
 * Dipanggil sekali saat DOM telah sepenuhnya dimuat.
 */
function initApp() {
  // Pastikan semua elemen yang diperlukan tersedia di DOM
  // (guard untuk mencegah error jika HTML berubah)
  const requiredEls = [
    'currency', 'currencySymbol', 'billAmount', 'tipSlider',
    'tipSliderOutput', 'peopleCount', 'btnMinus', 'btnPlus',
    'tipPerPerson', 'totalPerPerson', 'grandTotal',
    'peopleError', 'btnReset', 'card',
  ];

  for (const key of requiredEls) {
    if (!el[key]) {
      // Ini seharusnya tidak pernah terjadi jika HTML konsisten
      console.error(`[BillSplitter] Elemen DOM tidak ditemukan: #${key}`);
      return;
    }
  }

  // Inisialisasi event listeners
  initEventListeners();

  // Render state awal (semua nilai nol)
  renderCurrencySymbol();
  renderSliderTrack();
  render();
}

/* ── 12. Bootstrap ───────────────────────────────────────────── */

/**
 * Gunakan DOMContentLoaded agar script berjalan setelah DOM siap,
 * meski tag <script> ada di akhir body (tetap aman).
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM sudah siap (script defer / di akhir body)
  initApp();
}
