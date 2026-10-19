'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';

export interface LocalIconImageProps {
  iconPath?: string;
  src?: string;
  className?: string;
  altOverride?: string;
  alt?: string;
}

// Fallback SVG data URI jika aset gambar gagal dimuat
const DEFAULT_FALLBACK_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'><rect x='20' y='20' width='60' height='60' rx='12' stroke='%23128c7e' stroke-width='4'/><circle cx='50' cy='50' r='14' fill='%23128c7e'/></svg>";

export const LocalIconImage: React.FC<LocalIconImageProps> = ({
  iconPath,
  src,
  className = 'w-full h-full object-contain filter drop-shadow-sm',
  altOverride,
  alt = 'Gambar Aplikasi',
}) => {
  const rawPath = iconPath || src;
  const targetAlt = altOverride || alt;

  const resolvedSrc =
    rawPath &&
    (rawPath.startsWith('/assets/icons/') ||
      rawPath.startsWith('/assets/logo/') ||
      rawPath.startsWith('/assets/appImages/') ||
      rawPath.startsWith('/assets/backgroundTheme/'))
      ? `/api/icon?path=${encodeURIComponent(rawPath)}`
      : rawPath || DEFAULT_FALLBACK_SVG;

  const [imgSrc, setImgSrc] = useState<string>(resolvedSrc);

  useEffect(() => {
    setImgSrc(resolvedSrc);
  }, [resolvedSrc]);

  const handleImageError = () => {
    if (imgSrc !== DEFAULT_FALLBACK_SVG) {
      setImgSrc(DEFAULT_FALLBACK_SVG);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={targetAlt}
      className={className}
      onError={handleImageError}
    />
  );
};

export default LocalIconImage;
