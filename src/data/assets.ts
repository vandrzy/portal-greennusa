import { IconVariant, LocalAssetConfig, ForegroundTileStackItem } from '../types';

export const createSvgDataUri = (svgString: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;

/**
 * Konfigurasi Aset Lokal (Disimpan pada folder `public/assets/icons/` di project Vite).
 * Seluruh link URL eksternal telah dihapus dan digantikan oleh path lokal:
 * - /assets/icons/image_603e81.png (Lime - Dompet & Agenda)
 * - /assets/icons/image_603e9d.png (Purple - Dokumen Profil)
 * - /assets/icons/image_603ea2.png (Cyan - Kunci Pas & Obeng)
 * - /assets/icons/image_604148.png (Yellow - Gedung Instansi)
 * - /assets/icons/image_604162.png (Coral/Yellow - Telepon & Layanan)
 */
export const LOCAL_ICON_ASSETS: Record<IconVariant, LocalAssetConfig> = {
  'lime-wallet': {
    id: 'lime-wallet',
    fileName: 'image_603e81.png',
    publicPath: '/assets/icons/pemerintahan/image_603e81.png',
    assetImportPath: 'src/assets/icons/pemerintahan/image_603e81.png',
    bgColor: '#7CE84A',
    glowClass: 'icon-glow-lime',
    altText: 'Dompet & Buku',
    fallbackDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect x="20" y="20" width="58" height="60" rx="8" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/>
        <line x1="35" y1="20" x2="35" y2="80" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
        <path d="M78 43H62C57.5817 43 54 46.5817 54 51C54 55.4183 57.5817 59 62 59H78" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `),
  },
  'purple-profile': {
    id: 'purple-profile',
    fileName: 'image_603e9d.png',
    publicPath: '/assets/icons/pemerintahan/image_603e9d.png',
    assetImportPath: 'src/assets/icons/pemerintahan/image_603e9d.png',
    bgColor: '#8C4BFF',
    glowClass: 'icon-glow-purple',
    altText: 'Dokumen Profil',
    fallbackDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <path d="M31 15H58L75 32V79C75 82.866 71.866 86 68 86H31C27.134 86 24 82.866 24 79V22C24 18.134 27.134 15 31 15Z" stroke="#E5E5E5" stroke-width="5" stroke-linejoin="round"/>
        <path d="M57 15V27C57 30.3137 59.6863 33 63 33H75" fill="#E5E5E5"/>
        <path d="M57 15V27C57 30.3137 59.6863 33 63 33H75" stroke="#E5E5E5" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="49.5" cy="48.5" r="12.5" fill="#E5E5E5"/>
        <path d="M27 81C31 69 39.5 65 49.5 65C59.5 65 68 69 72 81" fill="#E5E5E5"/>
      </svg>
    `),
  },
  'cyan-tools': {
    id: 'cyan-tools',
    fileName: 'image_603ea2.png',
    publicPath: '/assets/icons/pemerintahan/image_603ea2.png',
    assetImportPath: 'src/assets/icons/pemerintahan/image_603ea2.png',
    bgColor: '#4CD3E8',
    glowClass: 'icon-glow-cyan',
    altText: 'Kunci Pas & Obeng',
    fallbackDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <path d="M21 15L27 29H33L39 15C44.5 18.5 47.5 25 46.5 32C45.5 37.5 41.5 42 36.5 44V77C36.5 81.1421 33.1421 84.5 29 84.5C24.8579 84.5 21.5 81.1421 21.5 77V44C16.5 42 12.5 37.5 11.5 32C10.5 25 13.5 18.5 21 15Z" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M64 23C64 18.5817 67.5817 15 72 15C76.4183 15 80 18.5817 80 23V48H64V23Z" stroke="#FFFFFF" stroke-width="4.5" stroke-linejoin="round"/>
        <line x1="57" y1="48" x2="87" y2="48" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="72" y1="48" x2="72" y2="66" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
        <polygon points="65,66 79,66 76,84 68,84" stroke="#FFFFFF" stroke-width="4.5" stroke-linejoin="round"/>
      </svg>
    `),
  },
  'yellow-building': {
    id: 'yellow-building',
    fileName: 'image_604148.png',
    publicPath: '/assets/icons/pemerintahan/image_604148.png',
    assetImportPath: 'src/assets/icons/pemerintahan/image_604148.png',
    bgColor: '#ECE846',
    glowClass: 'icon-glow-yellow',
    altText: 'Gedung',
    fallbackDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <path d="M43 79V24L50 17L57 24V79" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M30 79V42L43 30" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M70 79V42L57 30" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 79V65L30 55" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M82 79V65L70 55" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="18" y1="79" x2="82" y2="79" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `),
  },
  'coral-phone': {
    id: 'coral-phone',
    fileName: 'image_604162.png',
    publicPath: '/assets/icons/pemerintahan/image_604162.png',
    assetImportPath: 'src/assets/icons/pemerintahan/image_604162.png',
    bgColor: '#E84D4D',
    glowClass: 'icon-glow-coral',
    altText: 'Telepon',
    fallbackDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <path d="M30 22H39L44 35L37.5 40.5C41.2 48.2 47.8 54.8 55.5 58.5L61 52L74 57V66C74 70.4 70.4 74 66 74C43.9 74 26 56.1 26 34C26 27.4 27.5 22 30 22Z" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M56 26C63.5 26 70 32.5 70 40" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M56 35C59 35 61.5 37.5 61.5 40.5" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `),
  },
};

export const FOREGROUND_STACK_CONFIG: ForegroundTileStackItem[] = [
  {
    stackClass: 'tile-stack-1',
    sizeClass: 'w-[88px] h-[88px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
    variant: 'cyan-tools',
    alt: 'Kunci Pas & Obeng',
  },
  {
    stackClass: 'tile-stack-2',
    sizeClass: 'w-[90px] h-[90px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
    variant: 'purple-profile',
    alt: 'Dokumen Profil',
  },
  {
    stackClass: 'tile-stack-3',
    sizeClass: 'w-[94px] h-[94px]',
    borderClass: 'border-white/90',
    shadowClass: 'shadow-xl',
    variant: 'lime-wallet',
    alt: 'Dompet & Buku',
  },
  {
    stackClass: 'tile-stack-4',
    sizeClass: 'w-[90px] h-[90px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
    variant: 'yellow-building',
    alt: 'Gedung',
  },
  {
    stackClass: 'tile-stack-5',
    sizeClass: 'w-[88px] h-[88px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
    variant: 'coral-phone',
    alt: 'Telepon',
  },
];
