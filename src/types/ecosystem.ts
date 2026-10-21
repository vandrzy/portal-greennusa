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

export interface ThemeItem {
  id: string;
  name: string;
  bgImage: string;
  modalOverlayColor: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PortalContentData {
  id: number;
  logoUrl: string;
  headerText: string;
  paragraphText: string;
  folder1Title: string;
  folder1Subtitle: string;
  folder2Title: string;
  folder2Subtitle: string;
  whatsappLink: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}


