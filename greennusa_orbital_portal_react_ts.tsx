import React, { useState, useEffect, useRef, useCallback } from 'react';

// Deklarasi tipe global untuk library eksternal yang dimuat secara dinamis (Three.js, GSAP, Anime.js)
declare global {
  interface Window {
    THREE: any;
    gsap: any;
    anime: any;
  }
}

export type CategoryKey = 'gov' | 'biz';

export interface OrbitalAppItem {
  id: string;
  shortName?: string;
  title: string;
  badge: string;
  status: string;
  colorGrad?: string;
  sphereColor: number;
  svgKey?: string;
  desc: string;
  features: string[];
}

const CUSTOM_SVG_ICONS: Record<string, string> = {
  'dalev-induk': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="26" height="17" rx="2.5" fill="currentColor" fill-opacity="0.12"/>
      <path d="M11 27h10M16 22v5"/>
      <path d="M9 17v-4M14 17v-7M19 17v-5M23 17v-8" stroke-width="2.4"/>
    </svg>`,
  'sipadu': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="13" width="11" height="15" rx="1.5" fill="currentColor" fill-opacity="0.12"/>
      <path d="M9 17h5M9 21h5M17 19h8v9H17z"/>
      <path d="M21 19V6M14 6h13M25 6v5"/>
    </svg>`,
  'e-kinerja': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 23a11 11 0 1 1 22 0" fill="currentColor" fill-opacity="0.12"/>
      <path d="M16 19l6-6"/>
      <circle cx="16" cy="19" r="2.2" fill="currentColor"/>
      <path d="M9 23h14"/>
    </svg>`,
  'probebaya': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 13l7-6 7 6v7H9v-7z" fill="currentColor" fill-opacity="0.14"/>
      <path d="M4 22c3 4 7 5 12 5s9-1 12-5"/>
      <path d="M7 20l4 2M25 20l-4 2"/>
    </svg>`,
  'tepian-mahakam': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="5" width="20" height="12" rx="2" fill="currentColor" fill-opacity="0.12"/>
      <path d="M10 8v6M14 8v6M18 8v6M22 8v6"/>
      <path d="M4 22c3-2 6 2 9 0s6-2 9 0 6 0 6 0"/>
      <path d="M4 26c3-2 6 2 9 0s6-2 9 0 6 0 6 0"/>
    </svg>`,
  'e-tepian': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 25h22M6 20l6-6 5 3 8-9"/>
      <circle cx="12" cy="14" r="2"/>
      <circle cx="25" cy="8" r="3" fill="currentColor" fill-opacity="0.25"/>
    </svg>`,
  'e-sakip': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 5h13l5 5v17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" fill="currentColor" fill-opacity="0.1"/>
      <path d="M10 12h8M10 16h5"/>
      <circle cx="21" cy="21" r="5.5" fill="#ffffff"/>
      <path d="M18.8 21l1.6 1.6 3.2-3.2"/>
    </svg>`,
  'talent-gosepakat': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="6" width="18" height="21" rx="2.5" fill="currentColor" fill-opacity="0.12"/>
      <circle cx="14" cy="13" r="3"/>
      <path d="M9 22c1.2-2.5 3-3.5 5-3.5s3.8 1 5 3.5"/>
      <path d="M25 8l1.2 2.5 2.8.4-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 2.8-.4L25 8z" fill="currentColor"/>
    </svg>`,
  'gosepakat': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 13l5-4 6 4 5-3v8l-5 4-6 3-6-3-5-4V10l6 3z" fill="currentColor" fill-opacity="0.14"/>
      <path d="M12 18l3 3M16 15l4 4"/>
    </svg>`,
  'sandi-prakat': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="16" cy="16" r="11" fill="currentColor" fill-opacity="0.1"/>
      <polygon points="16,8 19,16 16,24 13,16" fill="currentColor" fill-opacity="0.3"/>
      <path d="M8 16h16"/>
    </svg>`,
  'ppid-kaltim': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 9a2 2 0 0 1 2-2h6l3 3h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9z" fill="currentColor" fill-opacity="0.14"/>
      <path d="M16 16v6"/>
      <circle cx="16" cy="13" r="1" fill="currentColor"/>
    </svg>`,
  'e-kianpuas': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="16" cy="18" r="9" fill="currentColor" fill-opacity="0.12"/>
      <path d="M12 19c1.2 2 2.5 3 4 3s2.8-1 4-3"/>
      <circle cx="13" cy="15" r="1" fill="currentColor"/>
      <circle cx="19" cy="15" r="1" fill="currentColor"/>
      <path d="M8 6l1 2M16 4v2.5M24 6l-1 2" stroke-width="2.2"/>
    </svg>`,
  'kianprima': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 6h14v6a7 7 0 0 1-14 0V6z" fill="currentColor" fill-opacity="0.14"/>
      <path d="M9 8H5v3a4 4 0 0 0 4 4M23 8h4v3a4 4 0 0 1-4 4"/>
      <path d="M16 19v6M11 25h10"/>
      <path d="M13.5 11.5l1.8 1.8 3.5-3.5"/>
    </svg>`,
  'land-management': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 18l12-6 12 6-12 8-12-8z" fill="currentColor" fill-opacity="0.14"/>
      <path d="M10 15l12 7M22 15l-12 7"/>
      <path d="M16 15c0-3 4-5.5 4-8a4 4 0 1 0-8 0c0 2.5 4 5 4 8z" fill="#ffffff"/>
      <circle cx="16" cy="7" r="1.2" fill="currentColor"/>
    </svg>`,
  'kur-kaltim': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12l2-6h18l2 6" fill="currentColor" fill-opacity="0.16"/>
      <path d="M7 12v13h10M5 12a3.5 3.5 0 0 0 7 0 3.5 3.5 0 0 0 7 0 3.5 3.5 0 0 0 7 0"/>
      <ellipse cx="22" cy="22" rx="4.5" ry="2.2"/>
      <path d="M17.5 22v3.5c0 1.2 2 2.2 4.5 2.2s4.5-1 4.5-2.2V22"/>
      <path d="M23 17v-5m0 0l-2.5 2.5M23 12l2.5 2.5"/>
    </svg>`,
  'fixmate': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 25l10-10M22 6a5 5 0 0 0-5 6l-10 10 3 3 10-10a5 5 0 0 0 6-5l-3 2-3-3 2-3z" fill="currentColor" fill-opacity="0.12"/>
      <path d="M7 7l18 18M5 9l4-4"/>
    </svg>`,
  'rajiin': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="15" cy="16" r="10" fill="currentColor" fill-opacity="0.12"/>
      <path d="M15 11v5l3.5 2"/>
      <circle cx="23" cy="23" r="4.5" fill="#ffffff"/>
      <path d="M21 23l1.5 1.5 3-3"/>
    </svg>`,
  'nusa-kasir': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="14" width="16" height="12" rx="2" fill="currentColor" fill-opacity="0.14"/>
      <path d="M8 14V8h8v6M8 19h8M8 22h5"/>
      <path d="M24 6v10M19 11h10M20.5 7.5l7 7M27.5 7.5l-7 7"/>
    </svg>`,
  'hayyumart': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 11h20l-2 15H8L6 11z" fill="currentColor" fill-opacity="0.14"/>
      <path d="M11 11V8a5 5 0 0 1 10 0v3"/>
      <path d="M16 15v7M12.5 18.5h7"/>
    </svg>`,
  'ntn-pos': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="7" width="14" height="20" rx="2.5" fill="currentColor" fill-opacity="0.12"/>
      <rect x="9" y="10" width="8" height="5" rx="1"/>
      <path d="M9 19h2M13 19h2M17 19h1M9 23h2M13 23h2"/>
      <rect x="20" y="11" width="7" height="11" rx="1.5" fill="#ffffff"/>
      <path d="M23 11v11"/>
    </svg>`,
  'absensi-tambang': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 19a11 11 0 0 1 22 0H5z" fill="currentColor" fill-opacity="0.15"/>
      <path d="M3 19h26M16 8v5"/>
      <circle cx="22" cy="23" r="4.5" fill="#ffffff"/>
      <path d="M22 21v2.2l1.6 1"/>
    </svg>`,
  'pengajuan-keuangan': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="10" width="22" height="16" rx="2.5" fill="currentColor" fill-opacity="0.14"/>
      <path d="M7 10V7a2 2 0 0 1 2-2h12v5"/>
      <rect x="20" y="15" width="7" height="6" rx="1.5" fill="#ffffff"/>
      <circle cx="23.5" cy="18" r="1" fill="currentColor"/>
    </svg>`,
  'manajemen-inventory': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 4l11 6v12l-11 6L5 22V10l11-6z" fill="currentColor" fill-opacity="0.13"/>
      <path d="M5 10l11 6 11-6M16 16v12M10.5 7l11 6"/>
      <path d="M19 19v4M22 17.5v4"/>
    </svg>`,
  'kelola-medsos': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7l-5 4v-4H8a3 3 0 0 1-3-3V8z" fill="currentColor" fill-opacity="0.13"/>
      <path d="M23 16.5c1.2-1.4 3.5-1.4 4.5 0 1 1.4.5 3.5-4.5 6.5-5-3-5.5-5.1-4.5-6.5 1-1.4 3.3-1.4 4.5 0z" fill="#ffffff"/>
    </svg>`,
  'service-generic': `
    <svg viewBox="0 0 32 32" fill="none" class="w-6 h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="16,4 27,10 27,22 16,28 5,22 5,10" fill="currentColor" fill-opacity="0.14"/>
      <path d="M5 10l11 6 11-6M16 16v12"/>
    </svg>`
};

const PORTAL_CATEGORIES: Record<CategoryKey, OrbitalAppItem[]> = {
  gov: [
    {
      id: 'dalev-induk',
      shortName: 'Dalev Induk',
      title: 'Portal Induk Dalev Bapperida',
      badge: 'Pemerintahan',
      status: 'Analitik Makro Aktif',
      colorGrad: 'from-emerald-500 to-teal-700',
      sphereColor: 0x10b981,
      desc: 'Layar monitor eksekutif dengan grafik batang (bar chart) analitik untuk pengendalian dan evaluasi pembangunan daerah Bapperida secara terpadu.',
      features: [
        'Konsolidasi data capaian pembangunan lintas OPD',
        'Visualisasi grafik batang & indikator makro real-time',
        'Dashboard eksekutif pimpinan daerah berbasis web',
        'Ekspor laporan evaluasi berkala otomatis'
      ]
    },
    {
      id: 'sipadu',
      shortName: 'Sipadu',
      title: 'Sipadu (Sistem Informasi Pembangunan Terpadu)',
      badge: 'Infrastruktur',
      status: 'Monitoring Konstruksi',
      colorGrad: 'from-teal-500 to-emerald-700',
      sphereColor: 0x0d9488,
      desc: 'Blok struktur bangunan bertingkat dengan crane konstruksi minimalis untuk memantau progres fisik dan anggaran proyek pembangunan daerah.',
      features: [
        'Pelacakan progres fisik konstruksi & kurva S',
        'Dokumentasi foto lapangan ber-geotagging',
        'Integrasi data kontrak & serapan anggaran',
        'Peringatan dini keterlambatan paket pekerjaan'
      ]
    },
    {
      id: 'e-kinerja',
      shortName: 'E-Kinerja',
      title: 'E-Dalev / E-Kinerja Pemerintah Daerah',
      badge: 'Capaian Target',
      status: 'Real-Time Speedometer',
      colorGrad: 'from-green-500 to-emerald-700',
      sphereColor: 0x16a34a,
      desc: 'Speedometer indikator capaian dengan jarum penunjuk target untuk memantau realisasi program, kegiatan, dan kinerja ASN secara terukur.',
      features: [
        'Indikator speedometer realisasi fisik & keuangan',
        'Penilaian SKP & produktivitas kinerja harian',
        'Sinkronisasi target triwulanan perangkat daerah',
        'Audit trail evaluasi kinerja transparan'
      ]
    },
    {
      id: 'probebaya',
      shortName: 'Probebaya',
      title: 'Probebaya (Pembangunan & Pemberdayaan Masyarakat)',
      badge: 'Pemberdayaan RT',
      status: 'Berbasis Rukun Tetangga',
      colorGrad: 'from-amber-500 to-emerald-700',
      sphereColor: 0x059669,
      desc: 'Siluet rumah warga dinaungi sepasang tangan penopang sebagai wujud program pembangunan dan pemberdayaan masyarakat tingkat RT.',
      features: [
        'Perencanaan & pelaporan dana pemberdayaan RT',
        'Transparansi realisasi infrastruktur lingkungan',
        'Pemberdayaan ekonomi UMKM & sosial warga',
        'Verifikasi berjenjang kelurahan hingga kecamatan'
      ]
    },
    {
      id: 'tepian-mahakam',
      shortName: 'Tepian Mahakam',
      title: 'Tepian Mahakam — Pendataan Aset Daerah',
      badge: 'Aset & Barcode',
      status: 'Inventarisasi Digital',
      colorGrad: 'from-cyan-500 to-teal-700',
      sphereColor: 0x0891b2,
      desc: 'Garis gelombang sungai dengan label barcode aset daerah untuk digitalisasi pencatatan, pelabelan, dan pengamanan aset milik pemerintah.',
      features: [
        'Pelabelan QR/Barcode aset bergerak & tidak bergerak',
        'Riwayat pemeliharaan & mutasi barang daerah',
        'Pemetaan lokasi aset berbasis koordinat',
        'Rekonsiliasi nilai aset & penyusutan otomatis'
      ]
    },
    {
      id: 'e-tepian',
      shortName: 'E-Tepian',
      title: 'E-Tepian (Evaluasi Pembangunan & Anggaran)',
      badge: 'Evaluasi Tren',
      status: 'Real-Time Line Chart',
      colorGrad: 'from-emerald-500 to-cyan-700',
      sphereColor: 0x14b8a6,
      desc: 'Grafik garis evaluasi (line chart) menanjak dengan titik data koin untuk memantau tren serapan anggaran dan evaluasi pembangunan kota.',
      features: [
        'Grafik tren serapan APBD bulanan & tahunan',
        'Komparasi target vs realisasi keuangan',
        'Deteksi deviasi anggaran tiap perangkat daerah',
        'Akses pelaporan cepat via Web, iOS & Android'
      ]
    },
    {
      id: 'e-sakip',
      shortName: 'E-Sakip',
      title: 'E-Sakip (Sistem Akuntabilitas Kinerja Instansi)',
      badge: 'Akuntabilitas',
      status: 'Terverifikasi Inspektorat',
      colorGrad: 'from-teal-500 to-green-700',
      sphereColor: 0x10b981,
      desc: 'Lembar dokumen laporan dengan lingkaran stempel verifikasi/centang untuk pengelolaan dokumen perencanaan, pengukuran, dan evaluasi SAKIP.',
      features: [
        'Manajemen pohon kinerja, IKU, dan Renstra',
        'Lembar kerja evaluasi (LKE) digital berjenjang',
        'Stempel verifikasi & validasi dokumen elektronik',
        'Penyusunan laporan LKJIP otomatis'
      ]
    },
    {
      id: 'talent-gosepakat',
      shortName: 'Talent Sepakat',
      title: 'Talent GoSepakat — Manajemen Talenta',
      badge: 'Profil Talenta',
      status: 'ID Badge & Kompetensi',
      colorGrad: 'from-emerald-600 to-teal-800',
      sphereColor: 0x047857,
      desc: 'Siluet kartu profil pengguna (ID badge) dengan bintang talenta untuk pemetaan kompetensi, kualifikasi, dan manajemen talenta SDM.',
      features: [
        'Kartu profil talenta & portofolio kompetensi',
        'Pemetaan matriks 9-Box Talent Management',
        'Riwayat sertifikasi, pelatihan & penilaian bintang',
        'Rekomendasi pengembangan karier berbasis data'
      ]
    },
    {
      id: 'gosepakat',
      shortName: 'GoSepakat',
      title: 'GoSepakat — Portal Kemitraan & Kolaborasi',
      badge: 'Kemitraan',
      status: 'Sinergi Multi-Pihak',
      colorGrad: 'from-green-600 to-teal-700',
      sphereColor: 0x15803d,
      desc: 'Simbol dua tangan berjabat (handshake) dan simpul kemitraan untuk memfasilitasi kerja sama daerah, MoU digital, dan kolaborasi lintas instansi.',
      features: [
        'Pengajuan & pelacakan naskah kesepakatan (MoU/PKS)',
        'Direktori mitra strategis pemerintah & swasta',
        'Monitoring masa berlaku & evaluasi kerja sama',
        'Arsip dokumen kemitraan terenkripsi'
      ]
    },
    {
      id: 'sandi-prakat',
      shortName: 'Sandi Prakat',
      title: 'Sandi Prakat — Sistem Informasi Kepanduan',
      badge: 'Kepanduan',
      status: 'Pendataan Kwarcab/Kwarda',
      colorGrad: 'from-lime-600 to-emerald-700',
      sphereColor: 0x65a30d,
      desc: 'Kompas kepanduan dengan arah mata angin dan lambang tunas/pandu untuk pengelolaan anggota, kegiatan, dan atribut pramuka/kepanduan.',
      features: [
        'Database anggota & KTA kepanduan digital',
        'Kalender kegiatan kwartir & gugus depan',
        'Pencatatan kecakapan & tanda penghargaan',
        'Peta sebaran potensi anggota kepanduan'
      ]
    },
    {
      id: 'ppid-kaltim',
      shortName: 'PPID Kaltim',
      title: 'PPID Kaltim — Keterbukaan Informasi Publik',
      badge: 'Informasi Publik',
      status: 'Standar Komisi Informasi',
      colorGrad: 'from-cyan-600 to-emerald-700',
      sphereColor: 0x0d9488,
      desc: "Map dokumen (folder) dengan simbol huruf 'i' untuk layanan permohonan informasi publik, daftar informasi berkala, dan pengajuan keberatan.",
      features: [
        'Katalog Informasi Berkala, Serta Merta & Setiap Saat',
        'Formulir permohonan informasi online & tiket lacak',
        'Statistik waktu respons layanan informasi publik',
        'Akses dokumen publik ramah disabilitas'
      ]
    },
    {
      id: 'e-kianpuas',
      shortName: 'E-Kianpuas',
      title: 'E-Kianpuas — Survei Kepuasan Masyarakat',
      badge: 'Indeks IKM',
      status: 'Rating & Sentimen Publik',
      colorGrad: 'from-emerald-500 to-green-700',
      sphereColor: 0x22c55e,
      desc: 'Kurva wajah tersenyum berdampingan dengan deretan bintang untuk mengukur Indeks Kepuasan Masyarakat (IKM) terhadap layanan publik secara langsung.',
      features: [
        'Kuesioner SKM digital via QR Code & layar sentuh',
        'Kalkulasi nilai IKM & mutu pelayanan otomatis',
        'Analitik ulasan & saran perbaikan masyarakat',
        'Publikasi grafik kepuasan real-time'
      ]
    },
    {
      id: 'kianprima',
      shortName: 'KianPrima',
      title: 'KianPrima — Standar Pelayanan Prima',
      badge: 'Mutu Layanan',
      status: 'Tersertifikasi Prima',
      colorGrad: 'from-teal-500 to-emerald-800',
      sphereColor: 0x059669,
      desc: 'Trofi penghargaan pelayanan prima dengan perisai berlogo centang mutu untuk pemantauan standar operasional dan inovasi pelayanan publik.',
      features: [
        'Evaluasi indikator standar pelayanan publik',
        'Penilaian inovasi & penghargaan unit kerja',
        'Monitoring kepatuhan maklumat pelayanan',
        'Dashboard pemeringkatan kinerja unit layanan'
      ]
    },
    {
      id: 'land-management',
      shortName: 'Land Mgmt',
      title: 'Land Management — Sistem Pertanahan & Spasial',
      badge: 'GIS & Kavling',
      status: 'Peta Petak Spasial',
      colorGrad: 'from-green-600 to-emerald-800',
      sphereColor: 0x16a34a,
      desc: 'Petak kavling tanah kotak (grid map) dengan pin titik lokasi untuk pemetaan lahan, manajemen aset tanah, dan tata ruang wilayah.',
      features: [
        'Visualisasi peta poligon kavling & batas lahan',
        'Database legalitas sertifikat & status penguasaan',
        'Pencarian titik koordinat & tumpang tindih lahan',
        'Integrasi dokumen spasial & foto udara drone'
      ]
    },
    {
      id: 'kur-kaltim',
      shortName: 'KUR Kaltim',
      title: 'KUR Kaltim — Kredit Usaha Rakyat Daerah',
      badge: 'Pembiayaan UMKM',
      status: 'Sinergi Perbankan & UMKM',
      colorGrad: 'from-emerald-500 to-teal-600',
      sphereColor: 0x10b981,
      desc: 'Kanopi ruko UMKM dengan simbol koin bertumpuk dan panah naik untuk memfasilitasi akses pembiayaan Kredit Usaha Rakyat bagi pelaku usaha daerah.',
      features: [
        'Pendaftaran & pengajuan calon debitur UMKM daerah',
        'Monitoring penyaluran KUR per sektor & kabupaten/kota',
        'Integrasi penyaluran bersama bank penyalur',
        'Pendampingan usaha & analitik pertumbuhan UMKM'
      ]
    }
  ],
  biz: [
    {
      id: 'fixmate',
      shortName: 'Fixmate',
      title: 'Fixmate — Manajemen Servis & Perbaikan',
      badge: 'Service & Tiket',
      status: 'Tracking Teknisi',
      colorGrad: 'from-emerald-500 to-teal-700',
      sphereColor: 0x10b981,
      desc: 'Siluet kunci pas (wrench) dan obeng bersilang untuk manajemen tiket servis, penjadwalan teknisi, dan pelacakan status perbaikan unit pelanggan.',
      features: [
        'Penerimaan tanda terima servis & estimasi biaya',
        'Notifikasi status pengerjaan otomatis via WhatsApp',
        'Manajemen stok suku cadang (sparepart) bengkel/servis',
        'Riwayat garansi & komisi teknisi otomatis'
      ]
    },
    {
      id: 'rajiin',
      shortName: 'Rajiin',
      title: 'Rajiin — Smart Attendance & Produktivitas SDM',
      badge: 'HRIS & Presensi',
      status: 'Biometrik & Geotagging',
      colorGrad: 'from-teal-500 to-emerald-700',
      sphereColor: 0x0d9488,
      desc: 'Jam bulat penunjuk waktu dengan simbol sidik jari & centang absensi untuk pencatatan kehadiran karyawan, shift kerja, dan rekap lembur.',
      features: [
        'Presensi Selfie + GPS Radius & Anti-Fake GPS',
        'Pengajuan izin, sakit, dan cuti berjenjang di HP',
        'Manajemen jadwal shift dinamis & keterlambatan',
        'Integrasi perhitungan tunjangan & payroll'
      ]
    },
    {
      id: 'nusa-kasir',
      shortName: 'Nusa Kasir',
      title: 'Nusa Kasir — Borneo Frozen Mart',
      badge: 'Cold Chain POS',
      status: 'Multi-Harga & Thermal',
      colorGrad: 'from-cyan-500 to-teal-700',
      sphereColor: 0x0891b2,
      desc: 'Mesin register kasir dan struk belanja dengan kristal es (snowflake) yang dirancang khusus untuk ritel makanan beku (frozen food) & grosir.',
      features: [
        'Harga bertingkat (eceran, reseller, agen & karton)',
        'Pemantauan stok cold storage & tanggal kedaluwarsa',
        'Cetak struk kasir cepat & pembayaran QRIS/EDC',
        'Laporan laba kotor harian & produk terlaris'
      ]
    },
    {
      id: 'hayyumart',
      shortName: 'HayyuMart',
      title: 'HayyuMart — Sistem Ritel & Minimarket Modern',
      badge: 'Smart Minimarket',
      status: 'Barcode & Member Point',
      colorGrad: 'from-green-500 to-emerald-700',
      sphereColor: 0x16a34a,
      desc: 'Keranjang belanja minimarket dengan tanda plus/tambah untuk operasional kasir swalayan, manajemen promo bundel, dan loyalitas pelanggan.',
      features: [
        'Transaksi kasir super cepat dengan barcode scanner',
        'Program poin member, diskon grosir & voucher',
        'Manajemen pembelian supplier & retur barang',
        'Sinkronisasi stok gudang ke etalase toko'
      ]
    },
    {
      id: 'ntn-pos',
      shortName: 'NTN POS',
      title: 'NTN POS — Point of Sale & Integrasi Pembayaran',
      badge: 'Omnichannel POS',
      status: 'EDC, QRIS & E-Wallet',
      colorGrad: 'from-emerald-600 to-teal-800',
      sphereColor: 0x059669,
      desc: 'Terminal mesin gesek kartu EDC dengan kartu debit/kredit keluar masuk untuk transaksi kasir multi-metode pembayaran dan manajemen cabang.',
      features: [
        'Rekonsiliasi pembayaran tunai, kartu EDC & QRIS',
        'Manajemen kas masuk/keluar & tutup kasir (closing)',
        'Pantau omzet seluruh cabang dari smartphone',
        'Integrasi pembukuan & laporan pajak ritel'
      ]
    },
    {
      id: 'absensi-tambang',
      shortName: 'Absen Tambang',
      title: 'Absensi Tambang — Presensi & Safety Site',
      badge: 'Mining Operations',
      status: 'Offline-First & Geofence',
      colorGrad: 'from-lime-600 to-emerald-800',
      sphereColor: 0x65a30d,
      desc: 'Helm proyek keselamatan (hard hat) dengan ikon jam dan pin lokasi untuk presensi pekerja tambang di area site, pit, maupun camp terpencil.',
      features: [
        'Mode Offline-First (tetap rekam saat sinyal minim)',
        'Geofencing area Pit, Workshop & Mess Tambang',
        'Checklist K3 / Fit-to-Work sebelum mulai shift',
        'Rekap jam kerja alat berat & roster kru lapangan'
      ]
    },
    {
      id: 'pengajuan-keuangan',
      shortName: 'Pengajuan Dana',
      title: 'Sistem Pengajuan Keuangan & Reimbursement',
      badge: 'E-Budgeting Bisnis',
      status: 'Multi-Level Approval',
      colorGrad: 'from-teal-600 to-green-800',
      sphereColor: 0x047857,
      desc: 'Dompet dan map berkas berisi lembaran uang kertas serta koin untuk mendigitalisasi pengajuan kasbon, pembelian, dan pencairan dana perusahaan.',
      features: [
        'Alur persetujuan (approval) manajer hingga direksi',
        'Unggah bukti nota/invoice & validasi anggaran',
        'Pelacakan status pencairan dana secara real-time',
        'Integrasi langsung ke laporan arus kas (cashflow)'
      ]
    },
    {
      id: 'manajemen-inventory',
      shortName: 'Inventory',
      title: 'Manajemen Inventory & Gudang Distribusi',
      badge: 'Warehouse WMS',
      status: 'Stok Opname & Barcode',
      colorGrad: 'from-emerald-500 to-green-700',
      sphereColor: 0x22c55e,
      desc: 'Kardus paket tertutup dengan label stiker kode batang (barcode) untuk kontrol stok multi-gudang, mutasi barang, dan stok opname presisi.',
      features: [
        'Cetak & pindai label Barcode / QR Code barang',
        'Peringatan stok minimum (reorder point) otomatis',
        'Pelacakan nomor batch, serial & metode FIFO',
        'Surat jalan pengiriman & kartu stok digital'
      ]
    },
    {
      id: 'kelola-medsos',
      shortName: 'Kelola Medsos',
      title: 'Kelola Medsos — Social Media & Campaign Hub',
      badge: 'Digital Engagement',
      status: 'Content & Analytics',
      colorGrad: 'from-cyan-500 to-emerald-700',
      sphereColor: 0x14b8a6,
      desc: 'Balon percakapan (chat bubble) berdampingan dengan simbol hati (like) untuk penjadwalan konten, manajemen interaksi, dan analitik performa medsos.',
      features: [
        'Kalender perencanaan & penjadwalan konten terpadu',
        'Monitoring respons audiens, komentar & sentimen',
        'Laporan pertumbuhan reach, impresi & engagement',
        'Kolaborasi persetujuan desain & copywriting tim'
      ]
    }
  ]
};

const SERVICE_INFO: Record<string, OrbitalAppItem> = {
  'request-demo': {
    id: 'request-demo',
    badge: 'Layanan Utama',
    title: 'Request Live Demo & Konsultasi',
    status: 'Siap Uji Coba',
    sphereColor: 0x10b981,
    svgKey: 'service-generic',
    desc: 'Jadwalkan sesi demo interaktif bersama konsultan IT GreenNusa Computindo atau uji coba langsung aplikasi Pemerintahan & Solusi Bisnis.',
    features: [
      'Akses sandbox penuh ke seluruh modul aplikasi',
      'Konsultasi arsitektur sistem & integrasi API',
      'Dukungan penuh untuk iOS, Android & Web Cloud',
      'Estimasi pengembangan & implementasi transparan'
    ]
  },
  'buat-website': {
    id: 'buat-website',
    badge: 'Web Development',
    title: 'Jasa Pembuatan Website & Portal Instansi',
    status: 'SEO & Cloud Ready',
    sphereColor: 0x0d9488,
    svgKey: 'dalev-induk',
    desc: 'Bangun portal pemerintahan, website korporasi, hingga web app interaktif 3D dengan performa tinggi, keamanan berlapis, dan desain modern.',
    features: [
      'Desain UI/UX eksklusif & responsif di semua perangkat',
      'Optimasi kecepatan, keamanan SSL & standar SEO',
      'CMS kustom yang mudah dikelola tim internal',
      'Garansi pemeliharaan & dukungan teknis berkala'
    ]
  },
  'buat-aplikasi': {
    id: 'buat-aplikasi',
    badge: 'Custom Software',
    title: 'Pengembangan Aplikasi iOS, Android & ERP',
    status: 'Apple • Android • Web',
    sphereColor: 0x16a34a,
    svgKey: 'talent-gosepakat',
    desc: 'Kembangkan aplikasi mobile (Apple iOS & Android) serta sistem informasi manajemen terintegrasi sesuai proses bisnis organisasi Anda.',
    features: [
      'Aplikasi Native / Hybrid untuk Apple iOS & Android',
      'Integrasi database cloud, pembayaran & GIS spasial',
      'Arsitektur scalable untuk ribuan pengguna serentak',
      'Dokumentasi teknis & pelatihan pengguna lengkap'
    ]
  }
};

const ALL_APPS_MAP: Record<string, OrbitalAppItem> = {};
PORTAL_CATEGORIES.gov.forEach((item) => {
  ALL_APPS_MAP[item.id] = item;
});
PORTAL_CATEGORIES.biz.forEach((item) => {
  ALL_APPS_MAP[item.id] = item;
});
Object.keys(SERVICE_INFO).forEach((k) => {
  ALL_APPS_MAP[k] = SERVICE_INFO[k];
});

export default function App() {
  // State untuk kategori folder aktif ('gov' | 'biz' | null)
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  // State untuk item yang dirender di orbit (tetap ada selama animasi penutupan berlangsung)
  const [renderedCategory, setRenderedCategory] = useState<CategoryKey | null>(null);
  // State aplikasi/layanan yang sedang di-hover untuk ditampilkan di kartu Frosted Glass
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);
  const [isGlassCardVisible, setIsGlassCardVisible] = useState<boolean>(false);
  // State untuk kursor bullseye saat menunjuk elemen interaktif
  const [isPointing, setIsPointing] = useState<boolean>(false);
  // State untuk Intro Overlay
  const [showIntroOverlay, setShowIntroOverlay] = useState<boolean>(true);
  // State untuk Modal Direktori & Modal Subscription
  const [isDirModalOpen, setIsDirModalOpen] = useState<boolean>(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState<boolean>(false);
  const [subEmail, setSubEmail] = useState<string>('');
  // State untuk Toast Notification
  const [toastMessage, setToastMessage] = useState<string>('Akun demo disalin');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  // State kesiapan library eksternal (Three.js, GSAP, Anime.js)
  const [scriptsReady, setScriptsReady] = useState<boolean>(false);

  // Refs untuk animasi DOM, GSAP, dan Three.js
  const cursorOuterRef = useRef<HTMLDivElement | null>(null);
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const gridBgRef = useRef<HTMLDivElement | null>(null);
  const orbitalRingsSvgRef = useRef<SVGSVGElement | null>(null);
  const foldersHubRef = useRef<HTMLDivElement | null>(null);
  const nodesContainerRef = useRef<HTMLDivElement | null>(null);
  const rightSphereStageRef = useRef<HTMLDivElement | null>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const glassCardRef = useRef<HTMLDivElement | null>(null);
  const topStickerRef = useRef<HTMLDivElement | null>(null);
  const hoverBeamPathRef = useRef<SVGPathElement | null>(null);

  // Refs untuk Intro Gate Overlay
  const introOverlayRef = useRef<HTMLDivElement | null>(null);
  const introProgressBarRef = useRef<HTMLDivElement | null>(null);
  const introCoreBadgeRef = useRef<HTMLDivElement | null>(null);
  const introRing1Ref = useRef<SVGCircleElement | null>(null);
  const introRing2Ref = useRef<SVGCircleElement | null>(null);
  const folderGovRef = useRef<HTMLButtonElement | null>(null);
  const folderBizRef = useRef<HTMLButtonElement | null>(null);

  // Refs untuk mutable state Three.js & Timers
  const wireframeSphereMeshRef = useRef<any>(null);
  const targetRotSpeedRef = useRef<number>(0.0035);
  const currentRotSpeedRef = useRef<number>(0.0035);
  const sphereSlowdownTimerRef = useRef<number | null>(null);
  const hideCardTimeoutRef = useRef<number | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const introTimelineRef = useRef<any>(null);
  const orbitNodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    // Muat Google Fonts & Font Awesome 6 jika belum ada
    const ensureStylesheet = (id: string, href: string) => {
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    };

    ensureStylesheet(
      'gn-google-fonts',
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap'
    );
    ensureStylesheet(
      'gn-fontawesome',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
    );

    // Muat script eksternal secara berurutan/paralel dengan aman
    const loadScript = (src: string, globalKey: keyof Window): Promise<void> => {
      return new Promise((resolve) => {
        if (window[globalKey]) {
          resolve();
          return;
        }
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener('load', () => resolve());
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    };

    let isMounted = true;
    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'THREE'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', 'gsap'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js', 'anime')
    ]).then(() => {
      if (isMounted) {
        setScriptsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sinkronisasi class 'is-pointing' pada body sesuai state React
  useEffect(() => {
    if (isPointing) {
      document.body.classList.add('is-pointing');
    } else {
      document.body.classList.remove('is-pointing');
    }
    return () => {
      document.body.classList.remove('is-pointing');
    };
  }, [isPointing]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  }, []);

  const drawHoverConnectionBeam = useCallback((fromEl: HTMLElement | null, toEl: HTMLElement | null) => {
    const pathEl = hoverBeamPathRef.current;
    if (!pathEl || !fromEl || !toEl || window.innerWidth < 1024) return;

    const r1 = fromEl.getBoundingClientRect();
    const r2 = toEl.getBoundingClientRect();

    const x1 = r1.left + r1.width / 2;
    const y1 = r1.top + r1.height / 2;
    const x2 = r2.left + 26;
    const y2 = r2.top + r2.height / 2;

    const cx = (x1 + x2) / 2;
    const cy = Math.min(y1, y2) - 42;

    pathEl.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
    pathEl.classList.remove('opacity-0');
    pathEl.classList.add('opacity-100');
  }, []);

  const hideGlassCard = useCallback(() => {
    setIsGlassCardVisible(false);
    const pathEl = hoverBeamPathRef.current;
    if (pathEl) {
      pathEl.classList.remove('opacity-100');
      pathEl.classList.add('opacity-0');
    }
    if (wireframeSphereMeshRef.current && window.THREE) {
      wireframeSphereMeshRef.current.material.color.setHex(0x10b981);
      targetRotSpeedRef.current = 0.0035;
    }
  }, []);

  const scheduleHideGlassCard = useCallback(() => {
    if (hideCardTimeoutRef.current) {
      window.clearTimeout(hideCardTimeoutRef.current);
    }
    hideCardTimeoutRef.current = window.setTimeout(() => {
      hideGlassCard();
    }, 95);
  }, [hideGlassCard]);

  const updateGlassCardOnHover = useCallback(
    (appId: string, triggerElement: HTMLElement | null) => {
      const app = ALL_APPS_MAP[appId];
      if (!app) return;

      if (hideCardTimeoutRef.current) {
        window.clearTimeout(hideCardTimeoutRef.current);
      }

      setHoveredAppId(appId);
      setIsGlassCardVisible(true);

      if (window.gsap && topStickerRef.current) {
        window.gsap.fromTo(
          topStickerRef.current,
          { scale: 0.75, rotation: -12 },
          { scale: 1, rotation: 6, duration: 0.36, ease: 'back.out(1.6)' }
        );
      }

      if (wireframeSphereMeshRef.current && window.THREE) {
        wireframeSphereMeshRef.current.material.color.setHex(app.sphereColor || 0x10b981);
        targetRotSpeedRef.current = 0.018;
        if (sphereSlowdownTimerRef.current) {
          window.clearTimeout(sphereSlowdownTimerRef.current);
        }
        sphereSlowdownTimerRef.current = window.setTimeout(() => {
          targetRotSpeedRef.current = 0.0035;
        }, 480);
      }

      if (triggerElement && glassCardRef.current) {
        drawHoverConnectionBeam(triggerElement, glassCardRef.current);
      }
    },
    [drawHoverConnectionBeam]
  );

  const playPortalEntryAnimation = useCallback(() => {
    setShowIntroOverlay(true);

    requestAnimationFrame(() => {
      const overlay = introOverlayRef.current;
      const progressBar = introProgressBarRef.current;
      const coreBadge = introCoreBadgeRef.current;
      if (!overlay || !window.gsap) return;

      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
      if (progressBar) progressBar.style.width = '0%';

      if (window.anime) {
        if (introRing1Ref.current) {
          window.anime({
            targets: introRing1Ref.current,
            rotate: '1turn',
            duration: 9000,
            loop: true,
            easing: 'linear'
          });
        }
        if (introRing2Ref.current) {
          window.anime({
            targets: introRing2Ref.current,
            rotate: '-1turn',
            duration: 6000,
            loop: true,
            easing: 'linear'
          });
        }
      }

      const tl = window.gsap.timeline({
        onComplete: () => {
          setShowIntroOverlay(false);
        }
      });

      tl.fromTo(
        coreBadge,
        { scale: 0.65, rotation: -15 },
        { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(1.6)' }
      )
        .to(progressBar, { width: '100%', duration: 0.85, ease: 'power2.inOut' }, '-=0.15')
        .to(overlay, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
          onStart: () => {
            const folderEls = [folderGovRef.current, folderBizRef.current].filter(Boolean);
            if (folderEls.length) {
              window.gsap.fromTo(
                folderEls,
                { y: 24, scale: 0.8, opacity: 0 },
                { y: 0, scale: 1, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)' }
              );
            }
          }
        });

      introTimelineRef.current = tl;
    });
  }, []);

  // Menutup folder orbit dengan animasi GSAP melipat ke titik tengah
  const closeFolderOrbit = useCallback(() => {
    setActiveCategory(null);
    hideGlassCard();

    const container = nodesContainerRef.current;
    if (!container) {
      setRenderedCategory(null);
      return;
    }

    const nodes = container.querySelectorAll('.orbit-app-node');
    if (nodes.length && window.gsap) {
      window.gsap.killTweensOf(nodes);
      window.gsap.to(nodes, {
        left: '50%',
        top: '50%',
        scale: 0.15,
        opacity: 0,
        duration: 0.38,
        stagger: 0.015,
        ease: 'power2.in',
        onComplete: () => {
          setRenderedCategory(null);
        }
      });
    } else {
      setRenderedCategory(null);
    }
  }, [hideGlassCard]);

  // Membuka atau menutup kategori folder saat kartu folder hijau diklik
  const toggleFolderCategory = useCallback(
    (categoryKey: CategoryKey) => {
      if (activeCategory === categoryKey) {
        closeFolderOrbit();
        return;
      }

      setActiveCategory(categoryKey);
      setRenderedCategory(categoryKey);
      hideGlassCard();

      // Beri akselerasi halus pada bola 3D saat folder dibuka
      targetRotSpeedRef.current = 0.016;
      if (sphereSlowdownTimerRef.current) {
        window.clearTimeout(sphereSlowdownTimerRef.current);
      }
      sphereSlowdownTimerRef.current = window.setTimeout(() => {
        targetRotSpeedRef.current = 0.0035;
      }, 500);
    },
    [activeCategory, closeFolderOrbit, hideGlassCard]
  );

  // Efek GSAP Bloom saat renderedCategory berubah dan node aplikasi baru dirender
  useEffect(() => {
    if (!renderedCategory || !activeCategory || !scriptsReady || !window.gsap) return;
    const container = nodesContainerRef.current;
    if (!container) return;

    const nodes = container.querySelectorAll('.orbit-app-node');
    if (nodes.length) {
      window.gsap.killTweensOf(nodes);
      window.gsap.fromTo(
        nodes,
        {
          left: '50%',
          top: '50%',
          scale: 0.2,
          opacity: 0
        },
        {
          left: (_i: number, el: HTMLElement) => el.getAttribute('data-target-left'),
          top: (_i: number, el: HTMLElement) => el.getAttribute('data-target-top'),
          scale: 1,
          opacity: 1,
          duration: 0.65,
          stagger: 0.026,
          ease: 'back.out(1.28)'
        }
      );
    }
  }, [renderedCategory, activeCategory, scriptsReady]);

  useEffect(() => {
    if (!scriptsReady) return;

    // 1. Jalankan Intro Gate Animation saat pertama kali siap
    playPortalEntryAnimation();

    // 2. Animasi Cincin SVG Bersih di belakang Bola 3D
    if (window.anime) {
      window.anime({
        targets: '.svg-clean-ring',
        rotate: '1turn',
        duration: 36000,
        loop: true,
        easing: 'linear'
      });
    }

    // 3. Bullseye Custom Cursor & Mouse Parallax dengan GSAP quickTo
    const gsap = window.gsap;
    const outerCircle = cursorOuterRef.current;
    const centerDot = cursorDotRef.current;

    const xDot = outerCircle && centerDot && gsap ? gsap.quickTo(centerDot, 'x', { duration: 0.03, ease: 'none' }) : null;
    const yDot = outerCircle && centerDot && gsap ? gsap.quickTo(centerDot, 'y', { duration: 0.03, ease: 'none' }) : null;
    const xOuter = outerCircle && centerDot && gsap ? gsap.quickTo(outerCircle, 'x', { duration: 0.15, ease: 'power3.out' }) : null;
    const yOuter = outerCircle && centerDot && gsap ? gsap.quickTo(outerCircle, 'y', { duration: 0.15, ease: 'power3.out' }) : null;

    const gridBg = gridBgRef.current;
    const orbitalRings = orbitalRingsSvgRef.current;
    const foldersHub = foldersHubRef.current;
    const nodesContainer = nodesContainerRef.current;
    const rightSphereStage = rightSphereStageRef.current;

    const gridX = gridBg && gsap ? gsap.quickTo(gridBg, 'x', { duration: 0.6, ease: 'power3.out' }) : null;
    const gridY = gridBg && gsap ? gsap.quickTo(gridBg, 'y', { duration: 0.6, ease: 'power3.out' }) : null;
    const ringsX = orbitalRings && gsap ? gsap.quickTo(orbitalRings, 'x', { duration: 0.5, ease: 'power3.out' }) : null;
    const ringsY = orbitalRings && gsap ? gsap.quickTo(orbitalRings, 'y', { duration: 0.5, ease: 'power3.out' }) : null;
    const hubX = foldersHub && gsap ? gsap.quickTo(foldersHub, 'x', { duration: 0.4, ease: 'power3.out' }) : null;
    const hubY = foldersHub && gsap ? gsap.quickTo(foldersHub, 'y', { duration: 0.4, ease: 'power3.out' }) : null;
    const nodesX = nodesContainer && gsap ? gsap.quickTo(nodesContainer, 'x', { duration: 0.45, ease: 'power3.out' }) : null;
    const nodesY = nodesContainer && gsap ? gsap.quickTo(nodesContainer, 'y', { duration: 0.45, ease: 'power3.out' }) : null;
    const sphereX = rightSphereStage && gsap ? gsap.quickTo(rightSphereStage, 'x', { duration: 0.55, ease: 'power3.out' }) : null;
    const sphereY = rightSphereStage && gsap ? gsap.quickTo(rightSphereStage, 'y', { duration: 0.55, ease: 'power3.out' }) : null;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (xDot && yDot && xOuter && yOuter) {
        xDot(e.clientX);
        yDot(e.clientY);
        xOuter(e.clientX);
        yOuter(e.clientY);
      }

      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;

      if (gridX && gridY) {
        gridX(-nx * 55);
        gridY(-ny * 22);
      }
      if (ringsX && ringsY) {
        ringsX(nx * 14);
        ringsY(ny * 14);
      }
      if (hubX && hubY) {
        hubX(nx * 22);
        hubY(ny * 22);
      }
      if (nodesX && nodesY) {
        nodesX(nx * 18);
        nodesY(ny * 18);
      }
      if (sphereX && sphereY) {
        sphereX(nx * 20);
        sphereY(ny * 20);
      }

      mouseX = nx * 0.45;
      mouseY = ny * 0.45;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 4. Inisialisasi Three.js 3D Wireframe Sphere
    let animFrameId: number;
    const canvas = threeCanvasRef.current;
    const THREE = window.THREE;
    let handleResize: (() => void) | null = null;

    if (canvas && THREE) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
      camera.position.z = 6.2;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
      });
      renderer.setClearColor(0x000000, 0);

      handleResize = () => {
        const parent = canvas.parentElement;
        const w = parent?.clientWidth || 520;
        const h = parent?.clientHeight || 520;
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      handleResize();
      window.addEventListener('resize', handleResize);

      const sphereGroup = new THREE.Group();
      sphereGroup.rotation.z = 0.22;
      scene.add(sphereGroup);

      // Bola Wireframe Globe Sederhana (14 segmen bujur, 10 segmen lintang)
      const geoSphere = new THREE.SphereGeometry(1.75, 14, 10);
      const matSphere = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      const wireframeSphereMesh = new THREE.Mesh(geoSphere, matSphere);
      wireframeSphereMeshRef.current = wireframeSphereMesh;
      sphereGroup.add(wireframeSphereMesh);

      // Titik-Titik Sudut Halus pada Pertemuan Garis Bola
      const pointsMat = new THREE.PointsMaterial({
        color: 0x059669,
        size: 0.05,
        transparent: true,
        opacity: 0.65
      });
      const spherePoints = new THREE.Points(geoSphere, pointsMat);
      sphereGroup.add(spherePoints);

      // Satu Cincin Ekuator Minimalis Mengelilingi Bola
      const ringGeo = new THREE.TorusGeometry(2.18, 0.009, 12, 90);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0d9488,
        transparent: true,
        opacity: 0.28
      });
      const equatorRingMesh = new THREE.Mesh(ringGeo, ringMat);
      equatorRingMesh.rotation.x = Math.PI / 2.25;
      sphereGroup.add(equatorRingMesh);

      const animateThree = () => {
        animFrameId = requestAnimationFrame(animateThree);
        currentRotSpeedRef.current += (targetRotSpeedRef.current - currentRotSpeedRef.current) * 0.08;

        wireframeSphereMesh.rotation.y += currentRotSpeedRef.current;
        spherePoints.rotation.y = wireframeSphereMesh.rotation.y;
        equatorRingMesh.rotation.z -= currentRotSpeedRef.current * 0.6;

        sphereGroup.rotation.y += (mouseX - sphereGroup.rotation.y) * 0.05;
        sphereGroup.rotation.x += (mouseY - sphereGroup.rotation.x) * 0.05;

        renderer.render(scene, camera);
      };
      animateThree();
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, [scriptsReady, playPortalEntryAnimation]);

  const handleSkipIntro = () => {
    if (introTimelineRef.current) {
      introTimelineRef.current.progress(1);
    }
    setShowIntroOverlay(false);
  };

  const handleReplayIntro = () => {
    closeFolderOrbit();
    playPortalEntryAnimation();
  };

  const handleCopyDemo = () => {
    const demoText = 'User: demo@green-nusa.net | Pass: demo123';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(demoText).catch(() => {});
    } else {
      const area = document.createElement('textarea');
      area.value = demoText;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    showToast('Akun Demo (demo@green-nusa.net) berhasil disalin!');
  };

  const handleSelectDirectoryApp = (appId: string, catKey: CategoryKey) => {
    setIsDirModalOpen(false);
    if (catKey !== activeCategory) {
      setActiveCategory(catKey);
      setRenderedCategory(catKey);
    }
    window.setTimeout(() => {
      const targetNode = orbitNodeRefs.current[appId] || null;
      updateGlassCardOnHover(appId, targetNode);
    }, 300);
  };

  const handleSubscriptionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (subEmail.trim()) {
      showToast(`Akses demo aplikasi dikirim ke ${subEmail.trim()}`);
      setSubEmail('');
      setIsSubModalOpen(false);
    }
  };

  // Data Aplikasi yang ditampilkan di Kartu Glass (default ke dalev-induk bila belum ada yang di-hover)
  const currentGlassApp = hoveredAppId ? ALL_APPS_MAP[hoveredAppId] : ALL_APPS_MAP['dalev-induk'];
  const currentStickerSvgKey = currentGlassApp.svgKey || currentGlassApp.id;
  const rawStickerSvg = CUSTOM_SVG_ICONS[currentStickerSvgKey] || CUSTOM_SVG_ICONS['service-generic'];
  const styledStickerSvg = rawStickerSvg.replace('class="w-6 h-6"', 'class="w-8 h-8 text-emerald-700"');

  // Daftar aplikasi melingkar yang sedang dirender
  const orbitList = renderedCategory ? PORTAL_CATEGORIES[renderedCategory] : [];
  const totalOrbitNodes = orbitList.length;

  // Rumus kapasitas per orbit (maksimal 3 orbit):
  // Orbit 1: 9 aplikasi (batas kumulatif = 9)
  // Orbit ke-n (n >= 2): tambahan kapasitas = (9 + n + 1)
  // -> Orbit 2 (n=2): 9 + 2 + 1 = 12 aplikasi (batas kumulatif = 9 + 12 = 21)
  // -> Orbit 3 (n=3): 9 + 3 + 1 = 13 aplikasi (batas kumulatif = 21 + 13 = 34)
  const MAX_ORBITS = 3;
  const ORBIT_RING_CAPACITIES: number[] = [9];
  const ORBIT_CUMULATIVE_MAX: number[] = [9];

  for (let n = 2; n <= MAX_ORBITS; n++) {
    const ringCapacity = 9 + n + 1;
    ORBIT_RING_CAPACITIES.push(ringCapacity);
    ORBIT_CUMULATIVE_MAX.push(ORBIT_CUMULATIVE_MAX[n - 2] + ringCapacity);
  }

  // Hitung berapa jumlah lingkaran orbit aktif (1 s/d 3) berdasarkan totalOrbitNodes
  const getActiveOrbitCount = (total: number): number => {
    if (total <= 0) return 1;
    for (let i = 0; i < MAX_ORBITS; i++) {
      if (total <= ORBIT_CUMULATIVE_MAX[i]) {
        return i + 1;
      }
    }
    return MAX_ORBITS;
  };

  const activeOrbitCount = getActiveOrbitCount(totalOrbitNodes);
  const isMultiOrbit = activeOrbitCount > 1;

  // Konfigurasi viewBox 600x600 (pusat di 300, 300)
  // Radius diatur dinamis berdasarkan jumlah orbit aktif (1..3) agar tidak pernah menabrak 2 folder di tengah
  const svgCenter = 300;
  const svgViewBoxSize = 600;

  const ORBIT_RADII_BY_COUNT: Record<number, number[]> = {
    1: [232],
    2: [196, 268],
    3: [174, 228, 280]
  };

  const activeOrbitRadiiSvg = ORBIT_RADII_BY_COUNT[activeOrbitCount] || ORBIT_RADII_BY_COUNT[1];

  // Zona aman folder tengah menyesuaikan radius terdalam
  const safeZoneRadiusSvg =
    activeOrbitCount === 1 ? 132 : activeOrbitCount === 2 ? 126 : 114;

  // Distribusi jumlah aplikasi ke masing-masing lingkaran orbit aktif sesuai kapasitas tiap orbit
  const distributeNodesAcrossOrbits = (total: number, orbitCount: number): number[] => {
    if (total <= 0) return [0];
    if (orbitCount === 1) return [total];

    const counts: number[] = new Array(orbitCount).fill(0);
    let remaining = total;

    for (let r = 0; r < orbitCount; r++) {
      if (r === orbitCount - 1) {
        // Orbit terluar menampung sisa aplikasi
        counts[r] = remaining;
      } else {
        const cap = ORBIT_RING_CAPACITIES[r];
        const assigned = Math.min(cap, remaining);
        counts[r] = assigned;
        remaining -= assigned;
      }
    }
    return counts;
  };

  const nodesPerOrbitRing = distributeNodesAcrossOrbits(totalOrbitNodes, activeOrbitCount);

  const getOrbitNodeGeometry = (index: number) => {
    // Cari aplikasi ke-`index` berada di orbit ke berapa (ringIdx: 0 .. activeOrbitCount-1)
    let ringIdx = 0;
    let indexInRing = index;

    for (let r = 0; r < nodesPerOrbitRing.length; r++) {
      if (indexInRing < nodesPerOrbitRing[r]) {
        ringIdx = r;
        break;
      }
      indexInRing -= nodesPerOrbitRing[r];
    }

    const countInThisRing = Math.max(1, nodesPerOrbitRing[ringIdx]);
    const svgRadius = activeOrbitRadiiSvg[ringIdx] || 232;
    const pctRadius = (svgRadius / svgViewBoxSize) * 100;

    // Beri pergeseran sudut (staggered offset) antar-cincin agar ikon tidak segaris lurus dan bebas dari tepi horizontal folder
    const angleOffset =
      ringIdx % 2 === 0 && isMultiOrbit ? 180 / countInThisRing : ringIdx > 0 ? 90 / countInThisRing : 0;
    const angleDeg = -90 + angleOffset + indexInRing * (360 / countInThisRing);
    const angleRad = (angleDeg * Math.PI) / 180;

    return {
      ringIndex: ringIdx + 1, // 1-based orbit index (1..3)
      angleRad,
      svgRadius,
      pctRadius,
      cx: (svgCenter + svgRadius * Math.cos(angleRad)).toFixed(2),
      cy: (svgCenter + svgRadius * Math.sin(angleRad)).toFixed(2),
      targetLeft: (50 + pctRadius * Math.cos(angleRad)).toFixed(3) + '%',
      targetTop: (50 + pctRadius * Math.sin(angleRad)).toFixed(3) + '%'
    };
  };

  // Skala dinamis pusat 2 folder sesuai jumlah lingkaran orbit (1 s/d 3) agar selalu punya clearance aman
  const folderHubOrbitClass = activeCategory
    ? activeOrbitCount === 3
      ? 'has-open-folder has-triple-orbit'
      : activeOrbitCount === 2
      ? 'has-open-folder has-dual-orbit'
      : 'has-open-folder'
    : '';

  return (
    <div className="relative min-h-screen flex items-center justify-center selection:bg-emerald-500 selection:text-white py-6 px-4 sm:px-8 lg:px-10">
      <style>{`
        :root {
            --gn-bg: #f3faf6;
            --gn-green-dark: #16382c;
            --gn-green-mid: #285e4b;
            --gn-emerald: #10b981;
            --gn-ring: #cbe3d8;
        }

        * {
            box-sizing: border-box;
            -webkit-font-smoothing: antialiased;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--gn-bg);
            color: #163026;
            overflow-x: hidden;
            min-height: 100vh;
        }

        /* LATAR BELAKANG 3D PERSPECTIVE HORIZON GRID */
        #perspective-grid-viewport {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
            perspective: 360px;
            perspective-origin: 50% 38%;
            background: linear-gradient(180deg, #f3faf6 0%, #f3faf6 38%, #ebf7f1 100%);
        }

        #animated-grid-bg {
            position: absolute;
            left: -60%;
            right: -60%;
            top: 36%;
            bottom: -65%;
            transform-style: preserve-3d;
            will-change: transform;
        }

        #perspective-grid-plane {
            width: 100%;
            height: 100%;
            transform-origin: 50% 0%;
            transform: rotateX(74deg);
            background-image:
                linear-gradient(to right, rgba(22, 56, 44, 0.22) 1.6px, transparent 1.6px),
                linear-gradient(to bottom, rgba(22, 56, 44, 0.22) 1.6px, transparent 1.6px);
            background-size: 68px 68px;
            animation: slowPerspectiveGridFlow 5.5s linear infinite;
            -webkit-mask-image: linear-gradient(
                to bottom,
                transparent 0%,
                rgba(0, 0, 0, 0.06) 10%,
                rgba(0, 0, 0, 0.45) 32%,
                rgba(0, 0, 0, 0.92) 70%,
                rgba(0, 0, 0, 1) 100%
            );
            mask-image: linear-gradient(
                to bottom,
                transparent 0%,
                rgba(0, 0, 0, 0.06) 10%,
                rgba(0, 0, 0, 0.45) 32%,
                rgba(0, 0, 0, 0.92) 70%,
                rgba(0, 0, 0, 1) 100%
            );
            will-change: background-position;
        }

        #animated-grid-vignette {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 1;
            background:
                radial-gradient(circle at 50% 38%, rgba(243, 250, 246, 0.95) 0%, transparent 55%),
                linear-gradient(90deg, rgba(243, 250, 246, 0.85) 0%, transparent 18%, transparent 82%, rgba(243, 250, 246, 0.85) 100%);
        }

        @keyframes slowPerspectiveGridFlow {
            0% {
                background-position: 0px 0px;
            }
            100% {
                background-position: 0px 68px;
            }
        }

        /* Sembunyikan kursor bawaan di desktop agar kursor bulat bertitik tengah tampil presisi */
        @media (pointer: fine) {
            body, a, button, input, [role="button"], .interactive-target {
                cursor: none !important;
            }
        }

        /* KURSOR BULAT DENGAN TITIK DI TENGAH */
        #custom-cursor-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            pointer-events: none;
            z-index: 99999;
        }

        #cursor-outer-circle {
            position: fixed;
            top: 0;
            left: 0;
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            border: 1.8px solid rgba(22, 48, 38, 0.55);
            background: rgba(16, 185, 129, 0.03);
            transform: translate(-50%, -50%);
            transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                        height 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                        border-color 0.2s ease,
                        background 0.2s ease,
                        box-shadow 0.2s ease;
        }

        #cursor-center-dot {
            position: fixed;
            top: 0;
            left: 0;
            width: 7px;
            height: 7px;
            border-radius: 9999px;
            background: #163026;
            transform: translate(-50%, -50%);
            transition: width 0.16s ease, height 0.16s ease, background 0.16s ease;
        }

        body.is-pointing #cursor-outer-circle {
            width: 44px;
            height: 44px;
            border-color: #10b981;
            border-width: 2.2px;
            background: rgba(16, 185, 129, 0.10);
            box-shadow: 0 0 18px rgba(16, 185, 129, 0.28);
        }

        body.is-pointing #cursor-center-dot {
            width: 9px;
            height: 9px;
            background: #10b981;
        }

        /* ANIMASI MASUK KE PORTAL (INTRO GATE OVERLAY) */
        #portal-entry-overlay {
            position: fixed;
            inset: 0;
            z-index: 9000;
            background: radial-gradient(circle at center, #f3faf6 0%, #e3f3eb 65%, #d2ebe0 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        /* 2 KARTU HIJAU EFEK FOLDER DI TENGAH ORBIT */
        #center-folders-hub {
            position: relative;
            z-index: 30;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), gap 0.45s ease;
            perspective: 900px;
        }

        @media (min-width: 640px) {
            #center-folders-hub {
                flex-direction: row;
                gap: 14px;
            }
        }

        #center-folders-hub.has-open-folder {
            transform: scale(0.76);
            gap: 10px;
        }

        #center-folders-hub.has-dual-orbit {
            transform: scale(0.62);
            gap: 8px;
        }

        #center-folders-hub.has-triple-orbit {
            transform: scale(0.55);
            gap: 7px;
        }

        @media (max-width: 639px) {
            #center-folders-hub.has-open-folder {
                transform: scale(0.64);
                gap: 6px;
            }
            #center-folders-hub.has-dual-orbit {
                transform: scale(0.52);
                gap: 5px;
            }
            #center-folders-hub.has-triple-orbit {
                transform: scale(0.46);
                gap: 4px;
            }
        }

        .green-folder-card {
            position: relative;
            width: 158px;
            padding-top: 12px;
            text-align: left;
            outline: none;
            transform-style: preserve-3d;
            transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
                        filter 0.3s ease;
        }

        .folder-back-plate {
            position: absolute;
            inset: 12px 0 0 0;
            border-radius: 20px;
            background: #17382c;
            box-shadow: 0 14px 28px -8px rgba(16, 44, 34, 0.32);
            transition: transform 0.35s ease;
        }

        .folder-top-tab {
            position: absolute;
            top: 2px;
            left: 14px;
            width: 64px;
            height: 18px;
            border-radius: 10px 10px 0 0;
            background: linear-gradient(135deg, #2b5c4a 0%, #1c4032 100%);
            border-top: 1.5px solid rgba(255, 255, 255, 0.35);
            border-left: 1px solid rgba(255, 255, 255, 0.22);
            border-right: 1px solid rgba(255, 255, 255, 0.22);
            z-index: 1;
            transition: transform 0.35s ease, background 0.3s ease;
        }

        .folder-paper-sheet {
            position: absolute;
            left: 10px;
            right: 10px;
            top: 10px;
            height: 36px;
            border-radius: 12px;
            background: linear-gradient(180deg, #ffffff 0%, #d1fae5 100%);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
            z-index: 2;
            transform: translateY(4px) scale(0.95);
            opacity: 0.75;
            transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
        }

        .folder-paper-sheet-2 {
            position: absolute;
            left: 16px;
            right: 16px;
            top: 8px;
            height: 30px;
            border-radius: 10px;
            background: rgba(167, 243, 208, 0.75);
            z-index: 1;
            transform: translateY(6px) scale(0.92);
            opacity: 0.55;
            transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
        }

        .folder-front-cover {
            position: relative;
            z-index: 3;
            padding: 13px 13px 12px 13px;
            border-radius: 20px;
            background: linear-gradient(145deg, #437c66 0%, #2c5b49 55%, #1c3f32 100%);
            border: 1.5px solid rgba(255, 255, 255, 0.38);
            box-shadow:
                0 16px 30px -10px rgba(18, 48, 37, 0.42),
                inset 0 1.5px 1.5px rgba(255, 255, 255, 0.32);
            color: #ffffff;
            transform-origin: bottom center;
            transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
                        border-color 0.3s ease,
                        box-shadow 0.3s ease,
                        background 0.3s ease;
        }

        .green-folder-card:hover {
            transform: translateY(-4px);
        }

        .green-folder-card:hover .folder-paper-sheet {
            transform: translateY(-5px) rotate(-2deg) scale(0.98);
            opacity: 0.95;
        }

        .green-folder-card:hover .folder-paper-sheet-2 {
            transform: translateY(-9px) rotate(2.5deg) scale(0.95);
            opacity: 0.8;
        }

        .green-folder-card:hover .folder-front-cover {
            transform: rotateX(-9deg);
            border-color: rgba(167, 243, 208, 0.75);
        }

        .green-folder-card.is-open {
            transform: translateY(-3px) scale(1.04);
        }

        .green-folder-card.is-open .folder-top-tab {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .green-folder-card.is-open .folder-paper-sheet {
            transform: translateY(-8px) rotate(-2deg) scale(1);
            opacity: 1;
        }

        .green-folder-card.is-open .folder-paper-sheet-2 {
            transform: translateY(-13px) rotate(3deg) scale(0.97);
            opacity: 0.9;
        }

        .green-folder-card.is-open .folder-front-cover {
            background: linear-gradient(145deg, #35755d 0%, #214e3d 55%, #143327 100%);
            border-color: #34d399;
            transform: rotateX(-14deg);
            box-shadow:
                0 20px 36px -8px rgba(16, 185, 129, 0.42),
                0 0 0 2px rgba(16, 185, 129, 0.32),
                inset 0 1.5px 2px rgba(255, 255, 255, 0.45);
        }

        .green-folder-card.is-inactive-folder {
            opacity: 0.72;
            transform: scale(0.93);
        }

        .green-folder-card.is-inactive-folder:hover {
            opacity: 1;
            transform: scale(0.97) translateY(-2px);
        }

        /* IKON APLIKASI MELINGKAR PRESISI DI ATAS JALUR LINGKARAN */
        .orbit-app-node {
            position: absolute;
            transform: translate(-50%, -50%);
            z-index: 25;
            outline: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .orbit-app-badge {
            width: 52px;
            height: 52px;
            border-radius: 9999px;
            background: #ffffff;
            border: 2.5px solid #ffffff;
            box-shadow:
                0 10px 22px -5px rgba(20, 56, 42, 0.16),
                0 3px 8px -2px rgba(20, 56, 42, 0.08),
                0 0 0 1.5px rgba(16, 185, 129, 0.24);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
                        box-shadow 0.28s ease,
                        border-color 0.25s ease;
        }

        .orbit-app-node.compact-node .orbit-app-badge {
            width: 45px;
            height: 45px;
        }

        .orbit-app-node.ultra-compact-node .orbit-app-badge {
            width: 39px;
            height: 39px;
        }

        .orbit-app-node:hover,
        .orbit-app-node.active-node {
            z-index: 45;
        }

        .orbit-app-node:hover .orbit-app-badge,
        .orbit-app-node.active-node .orbit-app-badge {
            transform: scale(1.22);
            box-shadow:
                0 16px 30px -6px rgba(16, 185, 129, 0.45),
                0 0 0 3px #10b981;
        }

        .orbit-label-pill {
            margin-top: 5px;
            padding: 2px 7px;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.94);
            color: #123126;
            font-size: 9.5px;
            font-weight: 700;
            letter-spacing: -0.01em;
            white-space: nowrap;
            box-shadow: 0 3px 8px rgba(15, 41, 32, 0.10);
            border: 1px solid rgba(16, 185, 129, 0.22);
            transition: all 0.22s ease;
            pointer-events: none;
        }

        .orbit-app-node.compact-node .orbit-label-pill {
            font-size: 8.8px;
            padding: 1.5px 6px;
            margin-top: 3px;
        }

        .orbit-app-node.ultra-compact-node .orbit-label-pill {
            font-size: 8px;
            padding: 1px 5px;
            margin-top: 2px;
        }

        .orbit-app-node:hover .orbit-label-pill,
        .orbit-app-node.active-node .orbit-label-pill {
            background: #0f2920;
            color: #ffffff;
            border-color: #10b981;
            transform: translateY(1px) scale(1.05);
        }

        /* TOMBOL KAPSUL HITAM GLOSSY */
        .glossy-black-pill {
            background: radial-gradient(100% 140% at 50% 0%, #37403c 0%, #141917 50%, #070a09 100%);
            box-shadow:
                0 16px 30px -8px rgba(0, 0, 0, 0.28),
                inset 0 1.5px 1px rgba(255, 255, 255, 0.32);
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                        box-shadow 0.25s ease;
        }

        .glossy-black-pill:hover {
            transform: translateY(-2px) scale(1.015);
            box-shadow:
                0 22px 36px -8px rgba(16, 185, 129, 0.30),
                inset 0 1.5px 2px rgba(255, 255, 255, 0.45);
        }

        /* KOTAK FROSTED GLASS BLUR */
        .tilted-glass-card {
            position: relative;
            background: linear-gradient(
                145deg,
                rgba(38, 86, 68, 0.88) 0%,
                rgba(26, 65, 51, 0.93) 60%,
                rgba(18, 48, 37, 0.96) 100%
            );
            backdrop-filter: blur(22px) saturate(175%);
            -webkit-backdrop-filter: blur(22px) saturate(175%);
            border-radius: 30px;
            border: 1.5px solid rgba(255, 255, 255, 0.38);
            box-shadow:
                0 28px 56px -14px rgba(15, 42, 32, 0.38),
                0 10px 24px -8px rgba(16, 185, 129, 0.20),
                inset 0 1.5px 2px rgba(255, 255, 255, 0.35);
            transform: rotate(-2deg) scale(0.94) translateY(10px);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                        transform 0.32s cubic-bezier(0.16, 1, 0.3, 1),
                        visibility 0.28s ease;
        }

        .tilted-glass-card.is-visible {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: rotate(-2deg) scale(1) translateY(0);
        }

        .tilted-glass-card.is-visible:hover {
            transform: rotate(0deg) scale(1.01) translateY(-2px);
        }

        .floating-corner-sticker {
            background: #ffffff;
            border-radius: 20px;
            padding: 10px;
            box-shadow:
                0 14px 26px -6px rgba(15, 42, 32, 0.22),
                0 4px 8px rgba(0, 0, 0, 0.06);
            border: 2.5px solid #ffffff;
        }

        .platform-chip {
            background: rgba(255, 255, 255, 0.88);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(16, 185, 129, 0.22);
            box-shadow: 0 8px 20px -6px rgba(22, 48, 38, 0.08);
            transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .platform-chip:hover {
            transform: translateY(-2px);
            border-color: #10b981;
        }

        @media (max-width: 640px) {
            .green-folder-card {
                width: 144px;
            }
            .orbit-app-badge {
                width: 40px;
                height: 40px;
            }
            .orbit-app-node.compact-node .orbit-app-badge {
                width: 35px;
                height: 35px;
            }
            .orbit-app-node.ultra-compact-node .orbit-app-badge {
                width: 30px;
                height: 30px;
            }
            .orbit-label-pill {
                font-size: 7.5px;
                padding: 1px 4px;
                margin-top: 2px;
            }
        }
      `}</style>

      {/* LATAR BELAKANG 3D PERSPECTIVE HORIZON GRID BERJALAN PELAN + PARALLAX MOUSE */}
      <div id="perspective-grid-viewport">
        <div id="animated-grid-bg" ref={gridBgRef}>
          <div id="perspective-grid-plane"></div>
        </div>
      </div>
      <div id="animated-grid-vignette"></div>

      {/* KURSOR POINTING BULAT DENGAN TITIK DI TENGAH */}
      <div id="custom-cursor-wrapper" className="hidden md:block">
        <div id="cursor-outer-circle" ref={cursorOuterRef}></div>
        <div id="cursor-center-dot" ref={cursorDotRef}></div>
      </div>

      {/* =================================================================== */}
      {/* ANIMASI MASUK KE PORTAL (PORTAL GATE INTRO OVERLAY)                 */}
      {/* =================================================================== */}
      {showIntroOverlay && (
        <div id="portal-entry-overlay" ref={introOverlayRef}>
          <div className="relative flex flex-col items-center justify-center text-center px-6">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center mb-5">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 220 220" fill="none">
                <circle
                  id="intro-ring-1"
                  ref={introRing1Ref}
                  cx="110"
                  cy="110"
                  r="98"
                  stroke="#10b981"
                  strokeOpacity="0.28"
                  strokeWidth="1.5"
                  strokeDasharray="8 8"
                />
                <circle
                  id="intro-ring-2"
                  ref={introRing2Ref}
                  cx="110"
                  cy="110"
                  r="76"
                  stroke="#059669"
                  strokeOpacity="0.45"
                  strokeWidth="1.8"
                  strokeDasharray="32 12"
                />
              </svg>

              {/* Emblem Inti GreenNusa */}
              <div
                id="intro-core-badge"
                ref={introCoreBadgeRef}
                className="absolute w-20 h-20 rounded-[24px] bg-gradient-to-br from-emerald-500 to-teal-800 text-white shadow-xl flex items-center justify-center border-4 border-white"
              >
                <svg viewBox="0 0 40 40" className="w-10 h-10">
                  <circle cx="20" cy="17" r="9" fill="none" stroke="#ffffff" strokeWidth="5" />
                  <path d="M22,27 C22,33 15,37 11,35 C12,30 16,27 22,27 Z" fill="#a7f3d0" />
                </svg>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-900/10 text-emerald-900 text-[10.5px] font-extrabold tracking-widest uppercase mb-2">
              GreenNusa Computindo
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight">
              Membuka Portal Ekosistem Aplikasi
            </h2>

            {/* Progress Bar Intro */}
            <div className="w-56 h-1.5 rounded-full bg-emerald-950/10 overflow-hidden mt-4">
              <div id="intro-progress-bar" ref={introProgressBarRef} className="h-full w-0 rounded-full bg-emerald-600"></div>
            </div>

            <button
              id="btn-skip-intro"
              type="button"
              onClick={handleSkipIntro}
              onMouseEnter={() => setIsPointing(true)}
              onMouseLeave={() => setIsPointing(false)}
              className="interactive-target mt-4 text-[11px] font-bold text-emerald-800/75 hover:text-emerald-950 underline underline-offset-4"
            >
              Lewati Animasi
            </button>
          </div>
        </div>
      )}

      {/* GARIS PENGHUBUNG SVG DINAMIS SAAT HOVER DARI IKON KIRI KE KARTU KANAN */}
      <svg
        id="hover-connection-svg"
        className="fixed inset-0 w-full h-full pointer-events-none z-10 hidden lg:block overflow-visible"
      >
        <defs>
          <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#16382c" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path
          id="hover-beam-path"
          ref={hoverBeamPathRef}
          d=""
          fill="none"
          stroke="url(#beamGrad)"
          strokeWidth="2"
          strokeDasharray="5 5"
          className="opacity-0 transition-opacity duration-200"
        />
      </svg>

      <main
        id="portal-main-workspace"
        className="relative z-20 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center"
      >
        <section className="lg:col-span-7 flex flex-col items-center justify-center w-full">
          {/* PANGGUNG ORBIT MELINGKAR PRESISI */}
          <div
            id="orbital-stage"
            className="relative w-[360px] h-[360px] sm:w-[580px] sm:h-[580px] flex items-center justify-center select-none my-1"
          >
            {/* Lingkaran Konsentris Presisi (Otomatis 1 s/d 4 Jalur Orbit Sesuai Rumus Kapasitas) */}
            <svg
              id="orbital-rings-svg"
              ref={orbitalRingsSvgRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 600 600"
              fill="none"
            >
              {/* Lingkaran Dekorasi Batas Luar */}
              <circle
                cx="300"
                cy="300"
                r={activeCategory && activeOrbitCount >= 3 ? '295' : activeCategory && isMultiOrbit ? '288' : '272'}
                stroke="#dfeee7"
                strokeWidth="1"
                className="transition-all duration-500"
              />

              {/* Saat Belum Ada Folder Dibuka: Tampilkan Jalur Orbit Default */}
              {!activeCategory && (
                <>
                  <circle
                    id="main-orbit-track"
                    cx="300"
                    cy="300"
                    r={232}
                    stroke="#b9dece"
                    strokeWidth="1.6"
                    className="transition-all duration-500"
                  />
                  <circle
                    id="inner-orbit-track"
                    cx="300"
                    cy="300"
                    r={162}
                    stroke="#d2e9df"
                    strokeWidth="1.2"
                    strokeDasharray="5 5"
                    className="transition-all duration-500"
                  />
                </>
              )}

              {/* Saat Folder Dibuka: Render Dinamis 1 s/d 4 Lingkaran Orbit Aktif */}
              {activeCategory &&
                activeOrbitRadiiSvg.map((radiusSvg, rIdx) => {
                  const isOuterMost = rIdx === activeOrbitRadiiSvg.length - 1;
                  const strokeColors = ['#059669', '#10b981', '#0d9488', '#14b8a6'];
                  const strokeColor = strokeColors[rIdx % strokeColors.length];
                  return (
                    <circle
                      key={`active-orbit-ring-${rIdx + 1}`}
                      id={isOuterMost ? 'main-orbit-track' : `orbit-track-${rIdx + 1}`}
                      cx="300"
                      cy="300"
                      r={radiusSvg}
                      stroke={strokeColor}
                      strokeWidth={isOuterMost ? '2' : '1.75'}
                      strokeDasharray={isOuterMost ? undefined : rIdx % 2 === 0 ? '6 4' : '3 3'}
                      className="transition-all duration-500"
                    />
                  );
                })}

              {/* Lingkaran Batas Zona Aman Folder di Tengah */}
              <circle
                cx="300"
                cy="300"
                r={safeZoneRadiusSvg}
                stroke="#d2e9df"
                strokeWidth="1"
                strokeDasharray="4 4"
                className={`transition-all duration-500 ${
                  activeCategory ? 'opacity-90' : 'opacity-0'
                }`}
              />

              {/* Titik-Titik Sudut Presisi pada Lingkaran Orbit (1 s/d 4 Lingkaran) */}
              <g id="orbit-svg-ticks">
                {activeCategory &&
                  orbitList.map((app, index) => {
                    const { cx, cy, ringIndex } = getOrbitNodeGeometry(index);
                    const tickColors = ['#059669', '#10b981', '#0d9488', '#14b8a6'];
                    return (
                      <circle
                        key={`tick-${app.id}`}
                        cx={cx}
                        cy={cy}
                        r={activeOrbitCount >= 3 ? '2.5' : ringIndex === 1 ? '2.8' : '3'}
                        fill={tickColors[(ringIndex - 1) % tickColors.length]}
                        fillOpacity="0.52"
                      />
                    );
                  })}
              </g>
            </svg>

            {/* PUSAT ORBIT: 2 KARTU FOLDER HIJAU (KLIK UNTUK MEMUNCULKAN IKON MELINGKAR) */}
            <div
              id="center-folders-hub"
              ref={foldersHubRef}
              className={folderHubOrbitClass}
            >
              {/* FOLDER HIJAU 1: PEMERINTAHAN & ORGANISASI PUBLIK */}
              <button
                id="folder-card-gov"
                ref={folderGovRef}
                type="button"
                data-cat="gov"
                onClick={() => toggleFolderCategory('gov')}
                onMouseEnter={() => setIsPointing(true)}
                onMouseLeave={() => setIsPointing(false)}
                className={`green-folder-card interactive-target group ${
                  activeCategory === 'gov'
                    ? 'is-open'
                    : activeCategory === 'biz'
                    ? 'is-inactive-folder'
                    : ''
                }`}
              >
                <div className="folder-top-tab"></div>
                <div className="folder-back-plate"></div>
                <div className="folder-paper-sheet-2"></div>
                <div className="folder-paper-sheet"></div>

                <div className="folder-front-cover">
                  <div className="absolute -top-3 -right-2 w-7 h-7 rounded-xl bg-white shadow-md flex items-center justify-center border border-emerald-100 transform rotate-12 text-emerald-700">
                    <i className="fa-solid fa-landmark text-xs"></i>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[8.5px] font-extrabold tracking-wider uppercase mb-1">
                    <span className="folder-status-dot w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                    <span className="folder-state-label">
                      {activeCategory === 'gov' ? 'Folder Terbuka' : 'Buka Folder'}
                    </span>
                  </span>

                  <h2 className="text-xs font-extrabold leading-snug tracking-tight text-white">
                    Pemerintahan &amp; Publik
                  </h2>

                  <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between gap-1">
                    <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[8.5px] font-bold inline-flex items-center gap-1">
                      <i className="fa-brands fa-apple"></i> iOS
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[8.5px] font-bold inline-flex items-center gap-1">
                      <i className="fa-brands fa-android text-emerald-300"></i> Android
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[8.5px] font-bold inline-flex items-center gap-1">
                      <i className="fa-solid fa-globe text-cyan-200"></i> Web
                    </span>
                  </div>
                </div>
              </button>

              {/* FOLDER HIJAU 2: SWASTA & SOLUSI BISNIS */}
              <button
                id="folder-card-biz"
                ref={folderBizRef}
                type="button"
                data-cat="biz"
                onClick={() => toggleFolderCategory('biz')}
                onMouseEnter={() => setIsPointing(true)}
                onMouseLeave={() => setIsPointing(false)}
                className={`green-folder-card interactive-target group ${
                  activeCategory === 'biz'
                    ? 'is-open'
                    : activeCategory === 'gov'
                    ? 'is-inactive-folder'
                    : ''
                }`}
              >
                <div className="folder-top-tab"></div>
                <div className="folder-back-plate"></div>
                <div className="folder-paper-sheet-2"></div>
                <div className="folder-paper-sheet"></div>

                <div className="folder-front-cover">
                  <div className="absolute -top-3 -right-2 w-7 h-7 rounded-xl bg-white shadow-md flex items-center justify-center border border-emerald-100 transform rotate-12 text-emerald-700">
                    <i className="fa-solid fa-briefcase text-xs"></i>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[8.5px] font-extrabold tracking-wider uppercase mb-1">
                    <span className="folder-status-dot w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                    <span className="folder-state-label">
                      {activeCategory === 'biz' ? 'Folder Terbuka' : 'Buka Folder'}
                    </span>
                  </span>

                  <h2 className="text-xs font-extrabold leading-snug tracking-tight text-white">
                    Swasta &amp; Solusi Bisnis
                  </h2>

                  <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between gap-1">
                    <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[8.5px] font-bold inline-flex items-center gap-1">
                      <i className="fa-brands fa-apple"></i> iOS
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[8.5px] font-bold inline-flex items-center gap-1">
                      <i className="fa-brands fa-android text-emerald-300"></i> Android
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-white/15 text-[8.5px] font-bold inline-flex items-center gap-1">
                      <i className="fa-solid fa-globe text-cyan-200"></i> Web
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* CONTAINER DINAMIS UNTUK IKON-IKON YANG DISUSUN MELINGKAR 360 DERAJAT */}
            <div
              id="orbital-nodes-container"
              ref={nodesContainerRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {orbitList.map((app, index) => {
                const { targetLeft, targetTop } = getOrbitNodeGeometry(index);
                const svgMarkup = CUSTOM_SVG_ICONS[app.id] || CUSTOM_SVG_ICONS['service-generic'];
                const isActiveNode = isGlassCardVisible && hoveredAppId === app.id;
                const nodeSizeClass =
                  activeOrbitCount >= 3
                    ? 'ultra-compact-node'
                    : isMultiOrbit
                    ? 'compact-node'
                    : '';

                return (
                  <button
                    key={app.id}
                    ref={(el) => {
                      orbitNodeRefs.current[app.id] = el;
                    }}
                    type="button"
                    data-app-id={app.id}
                    data-target-left={targetLeft}
                    data-target-top={targetTop}
                    style={{ left: targetLeft, top: targetTop }}
                    onMouseEnter={(e) => {
                      setIsPointing(true);
                      updateGlassCardOnHover(app.id, e.currentTarget);
                    }}
                    onMouseLeave={() => {
                      setIsPointing(false);
                      scheduleHideGlassCard();
                    }}
                    onClick={(e) => {
                      updateGlassCardOnHover(app.id, e.currentTarget);
                    }}
                    className={`orbit-app-node interactive-target pointer-events-auto group ${nodeSizeClass} ${
                      isActiveNode ? 'active-node' : ''
                    }`}
                  >
                    <div className="orbit-app-badge">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${app.colorGrad} text-white flex items-center justify-center shadow-inner`}
                        dangerouslySetInnerHTML={{ __html: svgMarkup }}
                      />
                    </div>
                    <span className="orbit-label-pill">{app.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex flex-col items-center space-y-3.5 w-full max-w-lg">
            <div className="flex flex-wrap items-center gap-2.5 w-full justify-center">
              <button
                id="btn-open-sub-modal"
                type="button"
                data-app-id="request-demo"
                onClick={() => setIsSubModalOpen(true)}
                onMouseEnter={(e) => {
                  setIsPointing(true);
                  updateGlassCardOnHover('request-demo', e.currentTarget);
                }}
                onMouseLeave={() => {
                  setIsPointing(false);
                  scheduleHideGlassCard();
                }}
                className="interactive-target orbit-service-trigger glossy-black-pill py-3 px-6 rounded-full text-white font-bold text-xs sm:text-[13px] flex items-center justify-center gap-2.5"
              >
                <span>Request Demo &amp; Subscription</span>
                <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                  <i className="fa-solid fa-chevron-right text-[9px]"></i>
                </span>
              </button>

              <button
                id="btn-open-all-directory"
                type="button"
                onClick={() => setIsDirModalOpen(true)}
                onMouseEnter={() => setIsPointing(true)}
                onMouseLeave={() => setIsPointing(false)}
                className="interactive-target px-4 py-3 rounded-full bg-white border border-emerald-950/15 text-emerald-950 hover:bg-emerald-50 text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <i className="fa-solid fa-folder-tree text-emerald-600"></i>
                <span>Semua Katalog</span>
              </button>

              <button
                id="btn-replay-intro"
                type="button"
                title="Putar Ulang Animasi Masuk Portal"
                onClick={handleReplayIntro}
                onMouseEnter={() => setIsPointing(true)}
                onMouseLeave={() => setIsPointing(false)}
                className="interactive-target w-10 h-10 rounded-full bg-white border border-emerald-950/15 text-emerald-950 hover:bg-emerald-50 text-xs font-extrabold shadow-sm flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-rotate-right text-emerald-700"></i>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-xs font-semibold text-stone-800">
              <button
                type="button"
                data-app-id="buat-website"
                onMouseEnter={(e) => {
                  setIsPointing(true);
                  updateGlassCardOnHover('buat-website', e.currentTarget);
                }}
                onMouseLeave={() => {
                  setIsPointing(false);
                  scheduleHideGlassCard();
                }}
                className="interactive-target orbit-service-trigger inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
              >
                <i className="fa-solid fa-display text-stone-900"></i>
                <span className="underline underline-offset-4 decoration-stone-400 hover:decoration-emerald-600">
                  Buat Website
                </span>
              </button>

              <button
                type="button"
                data-app-id="buat-aplikasi"
                onMouseEnter={(e) => {
                  setIsPointing(true);
                  updateGlassCardOnHover('buat-aplikasi', e.currentTarget);
                }}
                onMouseLeave={() => {
                  setIsPointing(false);
                  scheduleHideGlassCard();
                }}
                className="interactive-target orbit-service-trigger inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
              >
                <i className="fa-solid fa-leaf text-stone-900"></i>
                <span className="underline underline-offset-4 decoration-stone-400 hover:decoration-emerald-600">
                  Buat Aplikasi Custom
                </span>
              </button>

              <a
                href="https://green-nusa.net"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setIsPointing(true)}
                onMouseLeave={() => setIsPointing(false)}
                className="interactive-target inline-flex items-center gap-1.5 hover:text-emerald-700 transition-colors"
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-stone-900"></i>
                <span className="underline underline-offset-4 decoration-stone-400 hover:decoration-emerald-600">
                  green-nusa.net
                </span>
              </a>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[450px] sm:min-h-[520px] overflow-visible">
          <div
            id="right-sphere-stage"
            ref={rightSphereStageRef}
            className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] flex items-center justify-center overflow-visible"
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
              viewBox="0 0 440 440"
              fill="none"
            >
              <circle
                cx="220"
                cy="220"
                r="172"
                stroke="#10b981"
                strokeOpacity="0.18"
                strokeWidth="1.2"
                strokeDasharray="6 6"
                className="svg-clean-ring"
              />
              <circle cx="220" cy="220" r="196" stroke="#059669" strokeOpacity="0.10" strokeWidth="1" />
            </svg>

            <div className="absolute -inset-12 sm:-inset-16 pointer-events-none z-10 overflow-visible flex items-center justify-center">
              <canvas id="three-wireframe-canvas" ref={threeCanvasRef} className="w-full h-full block"></canvas>
            </div>

            <div
              id="app-glass-card"
              ref={glassCardRef}
              onMouseEnter={() => {
                if (hideCardTimeoutRef.current) {
                  window.clearTimeout(hideCardTimeoutRef.current);
                }
              }}
              onMouseLeave={() => scheduleHideGlassCard()}
              className={`tilted-glass-card absolute z-30 w-[94%] sm:w-[405px] p-6 sm:p-7 text-white ${
                isGlassCardVisible ? 'is-visible' : ''
              }`}
            >
              <div
                id="card-top-sticker"
                ref={topStickerRef}
                className="floating-corner-sticker absolute -top-5 right-6 w-14 h-14 flex items-center justify-center transform rotate-6 text-emerald-700"
              >
                <div
                  id="sticker-svg-holder"
                  className="w-8 h-8 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: styledStickerSvg }}
                />
              </div>

              <div className="floating-corner-sticker !rounded-full absolute -bottom-4 right-5 px-3.5 py-1 flex items-center gap-1.5 text-emerald-950 text-[10.5px] font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span id="sticker-status-text">{currentGlassApp.status}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-2.5 pr-12">
                <span
                  id="glass-app-badge"
                  className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-extrabold uppercase tracking-wider text-emerald-100"
                >
                  {currentGlassApp.badge}
                </span>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 border border-white/15 text-[10px] font-bold text-emerald-100">
                  <i className="fa-brands fa-apple"></i>
                  <i className="fa-brands fa-android text-emerald-300"></i>
                  <i className="fa-solid fa-globe text-cyan-200"></i>
                </div>
              </div>

              <h2 id="glass-app-title" className="text-lg sm:text-xl font-extrabold tracking-tight text-white mb-2">
                {currentGlassApp.title}
              </h2>

              <p id="glass-app-desc" className="text-xs leading-relaxed text-emerald-50/95 font-medium mb-4">
                {currentGlassApp.desc}
              </p>

              <div id="glass-app-features" className="grid grid-cols-1 gap-1.5 mb-5 text-xs">
                {currentGlassApp.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/12 border border-white/15 text-emerald-50 font-medium"
                  >
                    <i className="fa-solid fa-circle-check text-emerald-300 text-[11px] shrink-0"></i>
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3.5 border-t border-white/20 flex flex-wrap items-center justify-between gap-2">
                <button
                  id="btn-copy-demo"
                  type="button"
                  onClick={handleCopyDemo}
                  onMouseEnter={() => setIsPointing(true)}
                  onMouseLeave={() => setIsPointing(false)}
                  className="interactive-target px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-[11px] font-bold text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <i className="fa-regular fa-copy"></i>
                  <span>demo@green-nusa.net</span>
                </button>

                <a
                  id="glass-app-link"
                  href="https://green-nusa.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setIsPointing(true)}
                  onMouseLeave={() => setIsPointing(false)}
                  className="interactive-target px-4 py-1.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-extrabold inline-flex items-center gap-1.5 shadow-md transition-all"
                >
                  <span>Buka Portal</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5 z-20">
            <div className="platform-chip px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-extrabold text-emerald-950">
              <span className="w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center">
                <i className="fa-brands fa-apple text-xs"></i>
              </span>
              <span>Apple iOS</span>
            </div>

            <div className="platform-chip px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-extrabold text-emerald-950">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <i className="fa-brands fa-android text-xs"></i>
              </span>
              <span>Android APK</span>
            </div>

            <div className="platform-chip px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-extrabold text-emerald-950">
              <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                <i className="fa-solid fa-globe text-[11px]"></i>
              </span>
              <span>Web Cloud</span>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL DIREKTORI LENGKAP 2 KATEGORI */}
      <div
        id="directory-modal"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsDirModalOpen(false);
        }}
        className={`fixed inset-0 z-50 ${
          isDirModalOpen ? 'flex' : 'hidden'
        } items-center justify-center p-4 bg-stone-950/40 backdrop-blur-md`}
      >
        <div className="relative w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-[32px] bg-[#f3faf6] p-6 sm:p-8 shadow-2xl border border-emerald-900/15 text-stone-900">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-emerald-900/10">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                Katalog Ekosistem GreenNusa
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
                Aplikasi Pemerintahan &amp; Solusi Bisnis
              </h3>
            </div>
            <button
              id="btn-close-directory"
              type="button"
              onClick={() => setIsDirModalOpen(false)}
              onMouseEnter={() => setIsPointing(true)}
              onMouseLeave={() => setIsPointing(false)}
              className="interactive-target w-10 h-10 rounded-full bg-white hover:bg-emerald-50 border border-emerald-900/10 flex items-center justify-center text-stone-700 shadow-sm"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <i className="fa-solid fa-landmark text-xs"></i>
                  </span>
                  Pemerintahan &amp; Organisasi Publik
                </h4>
              </div>
              <div id="dir-list-gov" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PORTAL_CATEGORIES.gov.map((app) => {
                  const svgIcon = CUSTOM_SVG_ICONS[app.id] || CUSTOM_SVG_ICONS['service-generic'];
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleSelectDirectoryApp(app.id, 'gov')}
                      onMouseEnter={() => setIsPointing(true)}
                      onMouseLeave={() => setIsPointing(false)}
                      className="dir-item-btn interactive-target text-left p-3 rounded-2xl bg-[#f3faf6] hover:bg-emerald-100/70 border border-emerald-900/10 flex items-start gap-3 transition-all group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.colorGrad} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                        dangerouslySetInnerHTML={{ __html: svgIcon }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-extrabold text-emerald-950 truncate">
                            {app.shortName}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                          {app.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <i className="fa-solid fa-briefcase text-xs"></i>
                  </span>
                  Swasta &amp; Solusi Bisnis
                </h4>
              </div>
              <div id="dir-list-biz" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PORTAL_CATEGORIES.biz.map((app) => {
                  const svgIcon = CUSTOM_SVG_ICONS[app.id] || CUSTOM_SVG_ICONS['service-generic'];
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleSelectDirectoryApp(app.id, 'biz')}
                      onMouseEnter={() => setIsPointing(true)}
                      onMouseLeave={() => setIsPointing(false)}
                      className="dir-item-btn interactive-target text-left p-3 rounded-2xl bg-[#f3faf6] hover:bg-emerald-100/70 border border-emerald-900/10 flex items-start gap-3 transition-all group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.colorGrad} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                        dangerouslySetInnerHTML={{ __html: svgIcon }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-extrabold text-emerald-950 truncate">
                            {app.shortName}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                          {app.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL RINGKAS UNTUK SUBSCRIPTION / REQUEST DEMO */}
      <div
        id="sub-modal"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsSubModalOpen(false);
        }}
        className={`fixed inset-0 z-50 ${
          isSubModalOpen ? 'flex' : 'hidden'
        } items-center justify-center p-4 bg-stone-950/35 backdrop-blur-md`}
      >
        <div className="relative w-full max-w-md rounded-[32px] bg-white p-6 sm:p-7 shadow-2xl border border-emerald-100 text-stone-900">
          <button
            id="btn-close-sub-modal"
            type="button"
            onClick={() => setIsSubModalOpen(false)}
            onMouseEnter={() => setIsPointing(true)}
            onMouseLeave={() => setIsPointing(false)}
            className="interactive-target absolute top-5 right-5 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center mb-4">
            <i className="fa-solid fa-paper-plane text-lg"></i>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-stone-900">
            Request Demo &amp; Subscription
          </h3>
          <p className="text-xs text-stone-600 mt-1 mb-5 leading-relaxed">
            Masukkan alamat email Anda untuk menerima akses penuh ke ekosistem aplikasi Pemerintahan
            &amp; Solusi Bisnis GreenNusa Computindo.
          </p>

          <form id="modal-sub-form" onSubmit={handleSubscriptionSubmit} className="space-y-3">
            <input
              id="modal-sub-email"
              type="email"
              required
              value={subEmail}
              onChange={(e) => setSubEmail(e.target.value)}
              onMouseEnter={() => setIsPointing(true)}
              onMouseLeave={() => setIsPointing(false)}
              placeholder="nama@instansi-perusahaan.id"
              className="interactive-target w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              onMouseEnter={() => setIsPointing(true)}
              onMouseLeave={() => setIsPointing(false)}
              className="interactive-target glossy-black-pill w-full py-3.5 rounded-full text-white text-xs font-extrabold flex items-center justify-center gap-2"
            >
              <span>Kirim Akses Demo Sekarang</span>
              <i className="fa-solid fa-check"></i>
            </button>
          </form>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <div
        id="gn-toast"
        className={`fixed bottom-5 right-5 z-50 pointer-events-none transition-all duration-300 ${
          isToastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="px-4 py-3 rounded-2xl bg-stone-900 text-white text-xs font-semibold shadow-2xl border border-emerald-500/40 flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span id="gn-toast-text">{toastMessage}</span>
        </div>
      </div>
    </div>
  );
}