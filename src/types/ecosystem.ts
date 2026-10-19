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

