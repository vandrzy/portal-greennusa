export type CategoryType = 'pemerintahan' | 'swasta';

export type IconVariant =
  | 'cyan-tools'
  | 'purple-profile'
  | 'lime-wallet'
  | 'yellow-building'
  | 'coral-phone';

export interface LocalAssetConfig {
  id: IconVariant;
  fileName: string;
  publicPath: string;
  assetImportPath: string;
  bgColor: string;
  glowClass: string;
  altText: string;
  fallbackDataUri: string;
}

export interface EcosystemAppItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: CategoryType;
  iconVariant: IconVariant;
}

export interface ForegroundTileStackItem {
  stackClass: string;
  sizeClass: string;
  borderClass: string;
  shadowClass: string;
  variant: IconVariant;
  alt: string;
}
