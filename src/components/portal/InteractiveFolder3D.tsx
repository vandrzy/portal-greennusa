'use client';

import React from 'react';
import { EcosystemCategoryId, PortalContentData } from '@/types';

export interface InteractiveFolder3DProps {
  activeFolder: EcosystemCategoryId | null;
  onSelectFolder: (folder: EcosystemCategoryId) => void;
  pemerintahanCount: number;
  swastaCount: number;
  portalContent?: PortalContentData;
}

export const InteractiveFolder3D: React.FC<InteractiveFolder3DProps> = ({
  activeFolder,
  onSelectFolder,
  pemerintahanCount,
  swastaCount,
  portalContent,
}) => {
  return (
    <div
      id="center-folders-hub"
      className={`relative z-20 flex items-center justify-center transition-all duration-500 ease-out ${
        activeFolder
          ? 'gap-3 sm:gap-4 scale-75 sm:scale-80'
          : 'gap-4 sm:gap-6 scale-95 sm:scale-100'
      }`}
      style={{ perspective: '1000px' }}
    >
      {/* FOLDER 1: EKOSISTEM PEMERINTAHAN */}
      <button
        id="folder-card-gov"
        type="button"
        onClick={() => onSelectFolder('pemerintahan')}
        className={`green-folder-card group relative text-left cursor-pointer transition-all duration-500 ${
          activeFolder === 'pemerintahan'
            ? 'is-open ring-2 ring-emerald-400/50 shadow-[0_20px_45px_rgba(16,185,129,0.4)]'
            : activeFolder === 'swasta'
            ? 'is-inactive-folder opacity-50 scale-90 hover:opacity-80 hover:scale-95'
            : 'hover:-translate-y-2'
        }`}
      >
        {/* Top Tab */}
        <div
          className={`folder-top-tab transition-all duration-300 ${
            activeFolder === 'pemerintahan'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-emerald-800 to-teal-900 group-hover:from-emerald-700 group-hover:to-teal-800'
          }`}
        />

        {/* Back Plate */}
        <div className="folder-back-plate bg-[#0d2a20] border border-emerald-500/20 shadow-xl" />

        {/* Paper Sheets Insert */}
        <div
          className={`folder-paper-sheet-2 transition-transform duration-500 ${
            activeFolder === 'pemerintahan'
              ? '-translate-y-3.5 rotate-2 opacity-90'
              : 'group-hover:-translate-y-2.5 opacity-55'
          }`}
        />
        <div
          className={`folder-paper-sheet transition-transform duration-500 ${
            activeFolder === 'pemerintahan'
              ? '-translate-y-2.5 -rotate-2 opacity-100'
              : 'group-hover:-translate-y-1.5 opacity-75'
          }`}
        />

        {/* Front Cover with 3D Open Flap Effect */}
        <div
          className={`folder-front-cover relative p-3.5 sm:p-4 rounded-[20px] text-white border transition-all duration-500 ${
            activeFolder === 'pemerintahan'
              ? 'bg-gradient-to-br from-[#1e523f] via-[#143d2f] to-[#0c241c] border-emerald-400/70 shadow-2xl'
              : 'bg-gradient-to-br from-[#194434] via-[#103025] to-[#0a1e17] border-emerald-500/30 group-hover:border-emerald-400/50'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform:
              activeFolder === 'pemerintahan'
                ? 'rotateX(-24deg)'
                : 'rotateX(0deg)',
            transformOrigin: 'bottom center',
          }}
        >
          {/* Badge Ikon Landmark */}
          <div className="absolute -top-3 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/95 text-emerald-800 shadow-md flex items-center justify-center border border-emerald-200 transform rotate-12 transition-transform group-hover:rotate-0">
            <svg
              className="w-4 h-4 text-emerald-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>

          {/* Status Label */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-[8.5px] sm:text-[9px] font-extrabold tracking-wider uppercase mb-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                activeFolder === 'pemerintahan'
                  ? 'bg-emerald-300 animate-pulse'
                  : 'bg-emerald-400/70'
              }`}
            />
            <span>
              {activeFolder === 'pemerintahan' ? 'Folder Terbuka' : 'Klik Buka'}
            </span>
          </span>

          <h2 className="text-xs sm:text-[13px] font-extrabold leading-snug tracking-tight text-white line-clamp-1">
            {portalContent?.folder1Title || 'Pemerintahan'}
          </h2>
          <p className="text-[10px] text-emerald-200/80 font-medium">
            {pemerintahanCount} Aplikasi Publik
          </p>

          <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[8.5px] font-bold text-emerald-100/90">
            <span className="px-1.5 py-0.5 rounded-md bg-white/10">🏛️ Pemda</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/10">📊 OPD</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/10">🌐 Publik</span>
          </div>
        </div>
      </button>

      {/* FOLDER 2: EKOSISTEM SWASTA & BISNIS */}
      <button
        id="folder-card-biz"
        type="button"
        onClick={() => onSelectFolder('swasta')}
        className={`green-folder-card group relative text-left cursor-pointer transition-all duration-500 ${
          activeFolder === 'swasta'
            ? 'is-open ring-2 ring-teal-400/50 shadow-[0_20px_45px_rgba(13,148,136,0.4)]'
            : activeFolder === 'pemerintahan'
            ? 'is-inactive-folder opacity-50 scale-90 hover:opacity-80 hover:scale-95'
            : 'hover:-translate-y-2'
        }`}
      >
        {/* Top Tab */}
        <div
          className={`folder-top-tab transition-all duration-300 ${
            activeFolder === 'swasta'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500'
              : 'bg-gradient-to-r from-teal-800 to-cyan-900 group-hover:from-teal-700 group-hover:to-cyan-800'
          }`}
        />

        {/* Back Plate */}
        <div className="folder-back-plate bg-[#082622] border border-teal-500/20 shadow-xl" />

        {/* Paper Sheets Insert */}
        <div
          className={`folder-paper-sheet-2 transition-transform duration-500 ${
            activeFolder === 'swasta'
              ? '-translate-y-3.5 rotate-2 opacity-90'
              : 'group-hover:-translate-y-2.5 opacity-55'
          }`}
        />
        <div
          className={`folder-paper-sheet transition-transform duration-500 ${
            activeFolder === 'swasta'
              ? '-translate-y-2.5 -rotate-2 opacity-100'
              : 'group-hover:-translate-y-1.5 opacity-75'
          }`}
        />

        {/* Front Cover with 3D Open Flap Effect */}
        <div
          className={`folder-front-cover relative p-3.5 sm:p-4 rounded-[20px] text-white border transition-all duration-500 ${
            activeFolder === 'swasta'
              ? 'bg-gradient-to-br from-[#194a44] via-[#103732] to-[#0a2320] border-teal-400/70 shadow-2xl'
              : 'bg-gradient-to-br from-[#143b36] via-[#0c2a26] to-[#071d1a] border-teal-500/30 group-hover:border-teal-400/50'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform:
              activeFolder === 'swasta' ? 'rotateX(-24deg)' : 'rotateX(0deg)',
            transformOrigin: 'bottom center',
          }}
        >
          {/* Badge Ikon Briefcase */}
          <div className="absolute -top-3 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/95 text-teal-800 shadow-md flex items-center justify-center border border-teal-200 transform rotate-12 transition-transform group-hover:rotate-0">
            <svg
              className="w-4 h-4 text-teal-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Status Label */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-[8.5px] sm:text-[9px] font-extrabold tracking-wider uppercase mb-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                activeFolder === 'swasta'
                  ? 'bg-teal-300 animate-pulse'
                  : 'bg-teal-400/70'
              }`}
            />
            <span>
              {activeFolder === 'swasta' ? 'Folder Terbuka' : 'Klik Buka'}
            </span>
          </span>

          <h2 className="text-xs sm:text-[13px] font-extrabold leading-snug tracking-tight text-white line-clamp-1">
            {portalContent?.folder2Title || 'Swasta'}
          </h2>
          <p className="text-[10px] text-teal-200/80 font-medium">
            {swastaCount} Solusi Bisnis
          </p>

          <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[8.5px] font-bold text-teal-100/90">
            <span className="px-1.5 py-0.5 rounded-md bg-white/10">💼 Ritel</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/10">📱 POS</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/10">⚡ Bisnis</span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default InteractiveFolder3D;
