'use client';

import React from 'react';
import { EcosystemApp } from '@/types';
import { LocalIconImage } from '@/components/common/LocalIconImage';

export interface OrbitingAppItemProps {
  app: EcosystemApp;
  targetLeft: string;
  targetTop: string;
  isHovered: boolean;
  onHoverApp: (app: EcosystemApp) => void;
  onLeaveApp: () => void;
}

export const OrbitingAppItem: React.FC<OrbitingAppItemProps> = ({
  app,
  targetLeft,
  targetTop,
  isHovered,
  onHoverApp,
  onLeaveApp,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (app.url) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      style={{ left: targetLeft, top: targetTop }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-auto cursor-pointer group transition-all duration-300 select-none ${
        isHovered ? 'z-40 scale-110' : 'z-20 hover:scale-105'
      }`}
      onMouseEnter={() => onHoverApp(app)}
      onMouseLeave={onLeaveApp}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Buka aplikasi ${app.name}`}
    >
      {/* Icon Aplikasi Langsung (Tanpa Container/Card Box Ber-style Sendiri) */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        {/* Subtle Ambient Glow on Hover */}
        <div
          className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 pointer-events-none ${
            isHovered
              ? 'opacity-80 bg-emerald-400/40 scale-125'
              : 'opacity-0 group-hover:opacity-40 bg-emerald-500/20'
          }`}
        />

        <LocalIconImage
          iconPath={app.icon || app.iconPath}
          altOverride={app.name}
          className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300"
        />
      </div>

      {/* Nama Aplikasi di Bawah Icon */}
      <span
        className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-tight whitespace-nowrap transition-all duration-300 pointer-events-none shadow-md ${
          isHovered
            ? 'bg-emerald-500 text-white shadow-emerald-500/30 ring-2 ring-emerald-300/60'
            : 'bg-slate-900/90 text-slate-200 border border-emerald-500/30 group-hover:border-emerald-400 group-hover:text-white'
        }`}
      >
        {app.name}
      </span>
    </div>
  );
};

export default OrbitingAppItem;
