'use client';

import React from 'react';
import { EcosystemAppItem } from '../../types';
import { LOCAL_ICON_ASSETS } from '../../data';
import { LocalIconImage } from '../common/LocalIconImage';

export interface AppLaunchCardProps {
  app: EcosystemAppItem;
  isHovered?: boolean;
  onHover?: (app: EcosystemAppItem) => void;
  onLeave?: () => void;
}

export const AppLaunchCard: React.FC<AppLaunchCardProps> = ({
  app,
  isHovered = false,
  onHover,
  onLeave,
}) => {
  const asset = LOCAL_ICON_ASSETS[app.iconVariant];

  return (
    <div
      onMouseEnter={() => onHover?.(app)}
      onMouseLeave={onLeave}
      onFocus={() => onHover?.(app)}
      onBlur={onLeave}
      className={`relative group bg-[#f7f9fa] hover:bg-white rounded-[20px] p-4 flex flex-col items-center justify-between text-center gap-3 transition-all duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:shadow-md hover:-translate-y-0.5 ${
        isHovered
          ? 'border-2 border-[#128c7e] ring-2 ring-[#128c7e]/20 bg-white'
          : 'border border-[#e1e7eb] hover:border-[#128c7e]/60'
      }`}
    >
      {/* Icon (Tooltip lama telah dihapus sesuai permintaan) */}
      <div className="relative flex-shrink-0 flex items-center justify-center mt-1">
        <div
          className="w-12 h-12 rounded-[14px] flex items-center justify-center p-2 shadow-sm ring-2 ring-[#075e54]/15 cursor-pointer transform group-hover:scale-105 transition-transform"
          style={{ backgroundColor: asset.bgColor }}
        >
          <LocalIconImage
            variant={app.iconVariant}
            iconPath={app.iconPath}
            altOverride={app.title}
            className="w-8 h-8 object-contain"
          />
        </div>
      </div>

      {/* App Title */}
      <div className="w-full flex-grow flex items-center justify-center min-h-[40px] px-1">
        <h3
          className="font-headline text-[14px] font-bold text-[#111b21] leading-snug tracking-tight text-center"
          title={app.title}
        >
          {app.title}
        </h3>
      </div>

      {/* Action Button */}
      <div className="w-full pt-1">
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-headline inline-flex items-center justify-center w-full h-[34px] px-4 rounded-full bg-[#25d366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150"
        >
          Buka
        </a>
      </div>
    </div>
  );
};

export default AppLaunchCard;
