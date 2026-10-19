export type CategoryType = 'pemerintahan' | 'swasta';

export interface EcosystemAppItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: CategoryType;
  iconPath: string;
}

export interface ThemeItem {
  id: number;
  name: string;
  backgroundImage: string;
  overlayColor: string;
  overlayOpacity: number;
  isActive: boolean;
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

