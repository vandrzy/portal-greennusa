export type CategoryKey = 'gov' | 'biz';

export interface OrbitalAppItem {
  id: string;
  dbId?: number;
  shortName: string;
  title: string;
  badge: string;
  status: string;
  colorGrad: string;
  sphereColor: number;
  svgKey?: string;
  desc: string;
  features: string[];
  url?: string;
  iconUrl?: string | null;
}

export const SERVICE_INFO: Record<string, OrbitalAppItem> = {
  'request-demo': {
    id: 'request-demo',
    shortName: 'Request Demo',
    badge: 'Layanan Utama',
    title: 'Request Live Demo & Konsultasi',
    status: 'Siap Uji Coba',
    colorGrad: 'from-emerald-500 to-teal-700',
    sphereColor: 0x10b981,
    svgKey: 'service-generic',
    desc: 'Jadwalkan sesi demo interaktif bersama konsultan IT GreenNusa Computindo atau uji coba langsung aplikasi Pemerintahan & Solusi Bisnis.',
    features: [
      'Akses sandbox penuh ke seluruh modul aplikasi',
      'Konsultasi arsitektur sistem & integrasi API',
      'Dukungan penuh untuk iOS, Android & Web Cloud',
      'Estimasi pengembangan & implementasi transparan'
    ],
    url: 'https://wa.me/6281348039947?text=Halo%20GreenNusa%20Computindo%2C%20saya%20ingin%20meminta%20request%20demo%20dan%20informasi%20langganan%20ekosistem%20aplikasi.'
  },
  'buat-website': {
    id: 'buat-website',
    shortName: 'Buat Website',
    badge: 'Web Development',
    title: 'Jasa Pembuatan Website & Portal Instansi',
    status: 'SEO & Cloud Ready',
    colorGrad: 'from-teal-500 to-emerald-700',
    sphereColor: 0x0d9488,
    svgKey: 'dalev-induk',
    desc: 'Bangun portal pemerintahan, website korporasi, hingga web app interaktif 3D dengan performa tinggi, keamanan berlapis, dan desain modern.',
    features: [
      'Desain UI/UX eksklusif & responsif di semua perangkat',
      'Optimasi kecepatan, keamanan SSL & standar SEO',
      'CMS kustom yang mudah dikelola tim internal',
      'Garansi pemeliharaan & dukungan teknis berkala'
    ],
    url: 'https://green-nusa.net'
  },
  'buat-aplikasi': {
    id: 'buat-aplikasi',
    shortName: 'Custom App',
    badge: 'Custom Software',
    title: 'Pengembangan Aplikasi iOS, Android & ERP',
    status: 'Apple • Android • Web',
    colorGrad: 'from-green-500 to-teal-700',
    sphereColor: 0x16a34a,
    svgKey: 'talent-gosepakat',
    desc: 'Kembangkan aplikasi mobile (Apple iOS & Android) serta sistem informasi manajemen terintegrasi sesuai proses bisnis organisasi Anda.',
    features: [
      'Aplikasi Native / Hybrid untuk Apple iOS & Android',
      'Integrasi database cloud, pembayaran & GIS spasial',
      'Arsitektur scalable untuk ribuan pengguna serentak',
      'Dokumentasi teknis & pelatihan pengguna lengkap'
    ],
    url: 'https://green-nusa.net'
  }
};

export const DEFAULT_COLOR_GRADS = [
  'from-emerald-500 to-teal-700',
  'from-teal-500 to-emerald-700',
  'from-green-500 to-emerald-700',
  'from-amber-500 to-emerald-700',
  'from-cyan-500 to-teal-700',
  'from-emerald-600 to-green-800',
  'from-lime-600 to-emerald-800',
];

export const DEFAULT_SPHERE_COLORS = [
  0x10b981, 0x0d9488, 0x16a34a, 0x059669, 0x14b8a6, 0x22c55e, 0x65a30d
];
