import React from 'react';
import { OrbitalAppItem } from '../constants/portalServices';
import { LocalIconImage } from '@/components/common/LocalIconImage';

export interface PortalGlassCardProps {
  cardRef: React.RefObject<HTMLDivElement>;
  topStickerRef: React.RefObject<HTMLDivElement>;
  currentGlassApp: OrbitalAppItem | null;
  styledStickerSvg: string;
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onCopyDemo?: () => void;
  onHoverAction: () => void;
  onLeaveAction: () => void;
}

export const PortalGlassCard: React.FC<PortalGlassCardProps> = ({
  cardRef,
  topStickerRef,
  currentGlassApp,
  styledStickerSvg,
  isVisible,
  onMouseEnter,
  onMouseLeave,
  onHoverAction,
  onLeaveAction,
}) => {
  if (!currentGlassApp) return null;

  return (
    <div
      id="app-glass-card"
      ref={cardRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`tilted-glass-card absolute z-30 w-[94%] sm:w-[405px] p-6 sm:p-7 text-white ${
        isVisible ? 'is-visible' : ''
      }`}
    >
      {/* FLOATING CORNER STICKER */}
      <div
        id="card-top-sticker"
        ref={topStickerRef}
        className="floating-corner-sticker absolute -top-5 right-6 w-14 h-14 !p-0 flex items-center justify-center transform rotate-6 text-emerald-700"
      >
        {currentGlassApp.iconUrl ? (
          <LocalIconImage
            iconPath={currentGlassApp.iconUrl}
            altOverride={currentGlassApp.title}
            className="w-10 h-10 object-contain"
          />
        ) : (
          <div
            id="sticker-svg-holder"
            className="w-8 h-8 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: styledStickerSvg }}
          />
        )}
      </div>

      {/* STATUS BADGE */}
      <div className="floating-corner-sticker !rounded-full absolute -bottom-4 right-5 px-3.5 py-1 flex items-center gap-1.5 text-emerald-950 text-[10.5px] font-extrabold">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span id="sticker-status-text">{currentGlassApp.status}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2.5 pr-12">
        <span
          id="glass-app-badge"
          className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-extrabold uppercase tracking-wider text-emerald-100"
        >
          {currentGlassApp.badge}
        </span>
      </div>

      <h2 id="glass-app-title" className="text-lg sm:text-xl font-extrabold tracking-tight text-white mb-2">
        {currentGlassApp.title}
      </h2>

      <p id="glass-app-desc" className="text-xs leading-relaxed text-emerald-50/95 font-medium mb-4">
        {currentGlassApp.desc}
      </p>

      <div id="glass-app-features" className="grid grid-cols-1 gap-1.5 text-xs">
        {currentGlassApp.features.map((feat, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/12 border border-white/15 text-emerald-50 font-medium"
          >
            <i className="fa-solid fa-circle-check text-emerald-300 text-[11px] shrink-0"></i>
            <span className="truncate">{feat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
