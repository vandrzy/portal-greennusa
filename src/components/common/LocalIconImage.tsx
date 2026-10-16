import React, { useState, useEffect } from 'react';
import { IconVariant } from '../../types';
import { LOCAL_ICON_ASSETS } from '../../data';

export interface LocalIconImageProps {
  variant: IconVariant;
  className?: string;
  altOverride?: string;
}

/**
 * Komponen `LocalIconImage`
 * Menggunakan path lokal `/assets/icons/image_*.png` pada folder `public/assets/icons/`.
 * Dilengkapi fallback SVG lokal jika gambar fisik sedang tidak tersedia.
 */
export const LocalIconImage: React.FC<LocalIconImageProps> = ({
  variant,
  className = 'w-full h-full object-contain filter drop-shadow-sm',
  altOverride,
}) => {
  const asset = LOCAL_ICON_ASSETS[variant];
  const [imgSrc, setImgSrc] = useState<string>(asset.publicPath);

  useEffect(() => {
    setImgSrc(asset.publicPath);
  }, [asset.publicPath]);

  const handleImageError = () => {
    if (imgSrc !== asset.fallbackDataUri) {
      setImgSrc(asset.fallbackDataUri);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={altOverride || asset.altText}
      data-local-asset={asset.publicPath}
      data-asset-file={asset.fileName}
      className={className}
      onError={handleImageError}
    />
  );
};

export default LocalIconImage;
