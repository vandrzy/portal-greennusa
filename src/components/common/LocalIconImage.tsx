'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { IconVariant } from '../../types';
import { LOCAL_ICON_ASSETS } from '../../data';

export interface LocalIconImageProps {
  variant?: IconVariant;
  iconPath?: string;
  className?: string;
  altOverride?: string;
}

/**
 * Komponen `LocalIconImage`
 * Menggunakan path lokal `/assets/icons/image_*.png` pada folder `public/assets/icons/`.
 * Dilengkapi fallback SVG lokal jika gambar fisik sedang tidak tersedia.
 */
export const LocalIconImage: React.FC<LocalIconImageProps> = ({
  variant = 'cyan-tools',
  iconPath,
  className = 'w-full h-full object-contain filter drop-shadow-sm',
  altOverride,
}) => {
  const asset = LOCAL_ICON_ASSETS[variant];
  const targetSrc = iconPath || asset?.publicPath || '/assets/icons/image_603ea2.png';
  const [imgSrc, setImgSrc] = useState<string>(targetSrc);

  useEffect(() => {
    setImgSrc(targetSrc);
  }, [targetSrc]);

  const handleImageError = () => {
    if (asset?.fallbackDataUri && imgSrc !== asset.fallbackDataUri) {
      setImgSrc(asset.fallbackDataUri);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={altOverride || asset?.altText || 'Icon Aplikasi'}
      data-local-asset={targetSrc}
      className={className}
      onError={handleImageError}
    />
  );
};

export default LocalIconImage;
