'use client';

/* eslint-disable @next/next/no-img-element */
import React from 'react';

export interface PortalIntroOverlayProps {
  show: boolean;
  overlayRef: React.RefObject<HTMLDivElement>;
  progressBarRef: React.RefObject<HTMLDivElement>;
  coreBadgeRef: React.RefObject<HTMLDivElement>;
  ring1Ref: React.RefObject<SVGCircleElement>;
  ring2Ref: React.RefObject<SVGCircleElement>;
  logoUrl?: string;
  headerText?: string;
  onSkip: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const PortalIntroOverlay: React.FC<PortalIntroOverlayProps> = ({
  show,
  overlayRef,
  progressBarRef,
  coreBadgeRef,
  ring1Ref,
  ring2Ref,
  logoUrl = '/api/assets/logo/logo green.png',
  headerText = 'Membuka Portal Ekosistem Aplikasi',
  onSkip,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!show) return null;

  return (
    <div id="portal-entry-overlay" ref={overlayRef}>
      <div className="relative flex flex-col items-center justify-center text-center px-6">
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center mb-5">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 220 220" fill="none">
            <circle
              id="intro-ring-1"
              ref={ring1Ref}
              cx="110"
              cy="110"
              r="98"
              stroke="#10b981"
              strokeOpacity="0.28"
              strokeWidth="1.5"
              strokeDasharray="8 8"
            />
            <circle
              id="intro-ring-2"
              ref={ring2Ref}
              cx="110"
              cy="110"
              r="76"
              stroke="#059669"
              strokeOpacity="0.45"
              strokeWidth="1.8"
              strokeDasharray="32 12"
            />
          </svg>

          {/* Emblem Inti GreenNusa */}
          <div
            id="intro-core-badge"
            ref={coreBadgeRef}
            className="absolute w-20 h-20 rounded-[24px] bg-gradient-to-br from-emerald-500 to-teal-800 text-white shadow-xl flex items-center justify-center border-4 border-white"
          >
            <img
              src={logoUrl || '/api/assets/logo/logo green.png'}
              alt="GreenNusa Logo"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('logo-green.png')) {
                  target.src = '/assets/logo/logo-green.png';
                }
              }}
            />
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-900/10 text-emerald-900 text-[10.5px] font-extrabold tracking-widest uppercase mb-2">
          GreenNusa Computindo
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 tracking-tight">
          {headerText}
        </h2>

        {/* Progress Bar Intro */}
        <div className="w-56 h-1.5 rounded-full bg-emerald-950/10 overflow-hidden mt-4">
          <div id="intro-progress-bar" ref={progressBarRef} className="h-full w-0 rounded-full bg-emerald-600"></div>
        </div>

        <button
          id="btn-skip-intro"
          type="button"
          onClick={onSkip}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="interactive-target mt-4 text-[11px] font-bold text-emerald-800/75 hover:text-emerald-950 underline underline-offset-4 cursor-pointer"
        >
          Lewati Animasi
        </button>
      </div>
    </div>
  );
};
