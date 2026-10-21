'use client';

import React from 'react';
import { EcosystemApp } from '@/types';
import { LocalIconImage } from '@/components/common/LocalIconImage';

export interface AppDetailSideModalProps {
  app: EcosystemApp | null;
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const AppDetailSideModal: React.FC<AppDetailSideModalProps> = ({
  app,
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (!isOpen || !app) return null;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 pointer-events-auto transition-all duration-300 animate-in fade-in zoom-in-95"
    >
      {/* Modal Container: Fixed Dimensions (w-[380px] sm:w-[400px] h-[500px] min-h-[500px] max-h-[500px]) */}
      <div className="relative w-[340px] sm:w-[400px] h-[500px] min-h-[500px] max-h-[500px] rounded-[32px] p-6 sm:p-7 flex flex-col justify-between overflow-hidden bg-slate-900/85 backdrop-blur-2xl border border-emerald-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] text-white">
        {/* Ambient Top Glow Inside Card */}
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

        {/* Top Bar: Jenis Aplikasi & Close Button */}
        <div className="relative z-10 flex items-center justify-between gap-2 pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10.5px] font-extrabold uppercase tracking-wider text-emerald-300">
              {app.appType || (app.category === 'pemerintahan' ? 'Pemerintahan' : 'Swasta')}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail aplikasi"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Middle Content: Icon, Title, Tagline, Description, Features */}
        <div className="relative z-10 flex-1 overflow-y-auto my-3 pr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent">
          {/* Header Card: Icon + Title */}
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-emerald-500/30 p-2.5 flex items-center justify-center shrink-0 shadow-inner">
              <LocalIconImage
                iconPath={app.icon || app.iconPath}
                altOverride={app.name}
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-base sm:text-lg text-white leading-snug tracking-tight">
                {app.title || app.name}
              </h3>
              {app.tagline && (
                <p className="text-xs font-semibold text-emerald-300 line-clamp-2 mt-0.5 leading-snug">
                  {app.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Description Section with Internal Subtle Scrolling if text is long */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
            {app.description}
          </div>

          {/* Features / Keunggulan (Maksimal 4 item) */}
          {Array.isArray(app.features) && app.features.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Keunggulan Utama:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {app.features.slice(0, 4).map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-100"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-[11px] leading-tight font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Quick Hint (Tanpa Tombol "Buka Portal" & Tanpa Icon Apple/Android) */}
        <div className="relative z-10 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1.5 text-emerald-300 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Klik ikon untuk membuka
          </span>
          <span className="text-slate-400 text-[10px] font-mono">
            {app.category === 'pemerintahan' ? 'Pemerintahan' : 'Swasta'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AppDetailSideModal;
