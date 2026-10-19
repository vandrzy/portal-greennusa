export type CategoryType = 'pemerintahan' | 'swasta';
export type FolderCategory = CategoryType;

export interface EcosystemAppItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: CategoryType;
  iconPath: string;
  appImage?: string | null;
}

export type EcosystemApp = EcosystemAppItem;

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

