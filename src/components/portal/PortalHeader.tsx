'use client';

/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { EcosystemCategoryId } from '@/types';

export interface PortalHeaderProps {
  logoUrl?: string;
  headerText?: string;
  paragraphText?: string;
  activeFolder?: EcosystemCategoryId | null;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  logoUrl = '/api/assets/logo/logo green.png',
  headerText = 'Satu Pintu Akses Aplikasi GreenNusa Computindo',
  paragraphText = 'Portal integrasi seluruh layanan digital dan aplikasi ekosistem resmi GreenNusa Computindo.',
  activeFolder,
}) => {
  const isFolderActive = Boolean(activeFolder);
  const resolvedLogo = logoUrl || '/api/assets/logo/logo green.png';

  return (
    <header
      className={`relative z-30 flex flex-col items-center text-center transition-all duration-500 max-w-4xl mx-auto px-4 ${
        isFolderActive ? 'py-2 sm:py-3 scale-95 sm:scale-100' : 'py-5 sm:py-7'
      }`}
    >
      {/* Brand Logo GreenNusa */}
      <div className="relative mb-3 flex items-center justify-center">
        <img
          src={resolvedLogo}
          alt="GreenNusa Computindo Logo"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('logo-green.png')) {
              target.src = '/assets/logo/logo-green.png';
            }
          }}
          className="h-9 sm:h-11 md:h-12 w-auto object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)] transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Badge Portal Ekosistem Digital */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs font-extrabold tracking-wider uppercase mb-2 backdrop-blur-md shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>PORTAL EKOSISTEM DIGITAL</span>
      </div>

      {/* Judul Utama */}
      <h1
        className={`font-extrabold text-white tracking-tight leading-tight transition-all duration-500 ${
          isFolderActive
            ? 'text-xl sm:text-2xl md:text-3xl'
            : 'text-2xl sm:text-3xl md:text-4xl'
        }`}
      >
        {headerText.includes('GreenNusa Computindo') ? (
          <>
            {headerText.split('GreenNusa Computindo')[0]}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              GreenNusa Computindo
            </span>
            {headerText.split('GreenNusa Computindo')[1]}
          </>
        ) : (
          headerText
        )}
      </h1>

      {/* Subjudul */}
      <p
        className={`text-slate-400 font-normal max-w-2xl mt-1.5 transition-all duration-500 leading-relaxed ${
          isFolderActive
            ? 'text-xs sm:text-sm line-clamp-1 opacity-80'
            : 'text-xs sm:text-sm md:text-base opacity-100'
        }`}
      >
        {paragraphText}
      </p>
    </header>
  );
};

export default PortalHeader;
