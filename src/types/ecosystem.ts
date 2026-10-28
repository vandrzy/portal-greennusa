export type EcosystemCategoryId = 'pemerintahan' | 'swasta';

// Aliases untuk kompatibilitas ke belakang dengan komponen lama
export type CategoryType = EcosystemCategoryId;
export type FolderCategory = EcosystemCategoryId;

export interface EcosystemApp {
  id: string;
  dbId?: number;
  name: string;               // Nama aplikasi (ditampilkan di bawah icon)
  title: string;              // Judul lengkap aplikasi (ditampilkan di modal)
  appType: string;            // Jenis aplikasi (badge di atas judul pada modal)
  tagline: string;            // Tagline aplikasi (ditampilkan di modal)
  features: string[];         // Keunggulan aplikasi (maksimal 4 item)
  category: EcosystemCategoryId;
  description: string;        // Deskripsi aplikasi
  icon: string;               // URL / nama file icon aplikasi
  url: string;                // URL tujuan saat aplikasi diklik
  appImage?: string | null;   // Opsional (legacy compatibility)
  iconPath?: string;          // Opsional (legacy compatibility)
}

// Alias untuk kompatibilitas ke belakang
export type EcosystemAppItem = EcosystemApp;

export interface AppOrbitPosition {
  x: number;
  y: number;
}

export interface PortalFolderConfig {
  id: EcosystemCategoryId;
  title: string;
  subtitle: string;
  color: string;
  tabColor: string;
  glowColor: string;
}

export interface PortalModalContent {
  badge: string;
  title: string;
  desc: string;
  features: string[];
}

export interface PortalContentData {
  id: number;
  logoUrl: string;
  whatsappLink: string;
  // Modal 1: Request Demo
  requestDemoBadge: string;
  requestDemoTitle: string;
  requestDemoDesc: string;
  requestDemoFeatures: string[];
  // Modal 2: Jasa Buat Website
  buatWebsiteBadge: string;
  buatWebsiteTitle: string;
  buatWebsiteDesc: string;
  buatWebsiteFeatures: string[];
  // Modal 3: Buat Aplikasi Custom
  buatAplikasiBadge: string;
  buatAplikasiTitle: string;
  buatAplikasiDesc: string;
  buatAplikasiFeatures: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}


