# 💳 Smart Bill & Tip Splitter

Aplikasi web interaktif untuk membagi tagihan dan tip secara cerdas — dibangun dengan **HTML, CSS, dan Vanilla JavaScript murni** tanpa framework atau dependensi eksternal apapun.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 💵 **Input Tagihan** | Masukkan total tagihan dengan format angka yang fleksibel |
| ⚡ **Tip Cepat** | Tombol satu klik untuk pilihan tip 5%, 10%, 15%, 20% |
| 🎚️ **Slider Kustom** | Atur persentase tip bebas dari 0% hingga 50% |
| 👥 **Stepper Orang** | Tombol +/− untuk mengatur jumlah orang yang berbagi |
| 🌍 **Pilihan Mata Uang** | Dropdown untuk IDR (Rupiah), USD (Dollar), EUR (Euro) |
| 📊 **Ringkasan Real-Time** | Tip/orang, Total/orang, dan Grand Total diperbarui instan |
| 🔄 **Tombol Reset** | Kembalikan form ke kondisi awal dengan animasi halus |
| ✅ **Validasi Input** | Mencegah jumlah orang bernilai 0 atau negatif |

---

## 🗂️ Struktur File

```
ProjectIBM/
├── index.html   # Struktur semantik HTML5
├── style.css    # Desain glassmorphism & neumorphism, CSS Variables
├── script.js    # Logika kalkulasi & interaksi, Vanilla JS (ES6+)
└── README.md    # Dokumentasi proyek
```

---

## 🚀 Cara Menjalankan

Tidak diperlukan instalasi atau build step apapun. Cukup buka file langsung di browser:

```bash
# Opsi 1 — buka langsung
open index.html

# Opsi 2 — gunakan live server (VS Code Extension: Live Server)
# Klik kanan index.html → "Open with Live Server"

# Opsi 3 — Python simple HTTP server
python3 -m http.server 8080
# Lalu buka http://localhost:8080
```

---

## 🧮 Logika Kalkulasi

```
Tip Total       = Jumlah Tagihan × (Persentase Tip / 100)
Grand Total     = Jumlah Tagihan + Tip Total
Tip / Orang     = Tip Total ÷ Jumlah Orang
Total / Orang   = Grand Total ÷ Jumlah Orang
```

---

## 🏗️ Arsitektur Kode

```
script.js
├── CURRENCIES         — Konfigurasi format mata uang (IDR/USD/EUR)
├── state              — Single source of truth (billAmount, tipPercent, peopleCount, currency)
├── el                 — Referensi elemen DOM terpusat
│
├── formatCurrency()   — Format angka ke string mata uang via Intl.NumberFormat
├── animateOnce()      — Trigger animasi CSS sekali pakai
├── updateOutputValue()— Perbarui DOM hanya jika nilai berubah (+ animasi pop)
│
├── calculate()        — Pure function: hitung semua output dari state
├── render()           — Perbarui seluruh output DOM berdasarkan state
├── renderCurrencySymbol() — Perbarui simbol prefix input
├── renderSliderTrack()    — Perbarui warna track slider secara dinamis
│
├── validatePeopleCount()  — Validasi jumlah orang (min 1, max 99)
├── setTipPercent()        — Sinkronisasi tombol tip + slider + state
│
├── Handler Events     — handleCurrencyChange, handleBillAmountInput,
│                        handleTipBtnClick, handleSliderInput,
│                        handleBtnMinus, handleBtnPlus,
│                        handlePeopleInput, handleReset
│
├── initEventListeners() — Registrasi semua event listener (dipanggil sekali)
└── initApp()            — Bootstrap: guard DOM → init listeners → render awal
```

---

## 🎨 Desain & Tampilan

- **Soft Glassmorphism** — surface semi-transparan dengan `backdrop-filter: blur`
- **Neumorphism** — `box-shadow` inset/outset untuk kedalaman pada input & tombol
- **CSS Custom Properties** — 20+ design token (warna, radius, font, transisi) di `:root`
- **Mobile-First** — layout responsif dengan CSS Flexbox/Grid, breakpoint di 520px
- **Animated Blobs** — dekorasi latar bergerak dengan `@keyframes`, menghormati `prefers-reduced-motion`

---

## ♿ Aksesibilitas (WCAG AA)

- Kontras teks utama **>7:1** (WCAG AAA) terhadap latar belakang gelap
- Semua tombol interaktif memiliki `aria-label` eksplisit
- Tombol tip menggunakan `aria-pressed` untuk status aktif
- Kartu ringkasan menggunakan `aria-live="polite"` + `aria-atomic="true"` untuk screen reader
- Pesan error menggunakan `role="alert"` + `aria-live="assertive"`
- Slider range dilengkapi `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`
- Semua elemen interaktif memiliki indikator `focus-visible` yang jelas

---

## 🌐 Kompatibilitas Browser

| Browser | Versi Minimum |
|---|---|
| Chrome / Edge | 88+ |
| Firefox | 78+ |
| Safari | 14+ |
| Samsung Internet | 14+ |

> Fitur yang digunakan: `Intl.NumberFormat`, `backdrop-filter`, CSS Custom Properties, `ES6+`

---

## 📄 Lisensi

Proyek ini dibuat sebagai entri kompetisi pembuatan web utility tools. Bebas digunakan untuk keperluan belajar dan referensi.
