'use client';

import React, { useState, useRef, useCallback } from 'react';
import { EcosystemCategoryId, EcosystemApp } from '@/types';
import { usePortalEcosystem } from '@/hooks/usePortalEcosystem';
import {
  getActiveOrbitCount,
  getOrbitNodeGeometry,
  ORBIT_RADII_BY_COUNT,
} from '@/constants/portalConfig';
import { PortalHeader } from './PortalHeader';
import { InteractiveFolder3D } from './InteractiveFolder3D';
import { OrbitingAppItem } from './OrbitingAppItem';
import { AppDetailSideModal } from './AppDetailSideModal';
import { WhatsAppFloatingButton } from '@/components/common/WhatsAppFloatingButton';

export const PortalMainView: React.FC = () => {
  const {
    pemerintahanApps,
    swastaApps,
    portalContent,
    isLoading,
  } = usePortalEcosystem();

  const [activeFolder, setActiveFolder] = useState<EcosystemCategoryId | null>(null);
  const [hoveredApp, setHoveredApp] = useState<EcosystemApp | null>(null);

  const hideTimeoutRef = useRef<number | null>(null);

  // Toggle or select folder category
  const handleToggleFolder = useCallback(
    (folder: EcosystemCategoryId) => {
      if (activeFolder === folder) {
        setActiveFolder(null);
        setHoveredApp(null);
      } else {
        setActiveFolder(folder);
        setHoveredApp(null);
      }
    },
    [activeFolder]
  );

  const handleCloseFolder = useCallback(() => {
    setActiveFolder(null);
    setHoveredApp(null);
  }, []);

  // Hover app handlers with graceful delayed dismiss
  const handleHoverApp = useCallback((app: EcosystemApp) => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setHoveredApp(app);
  }, []);

  const handleLeaveApp = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => {
      setHoveredApp(null);
    }, 150);
  }, []);

  const handleModalMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleModalMouseLeave = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = window.setTimeout(() => {
      setHoveredApp(null);
    }, 150);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setHoveredApp(null);
  }, []);

  // Active apps & orbit ring calculations
  const activeApps =
    activeFolder === 'pemerintahan'
      ? pemerintahanApps
      : activeFolder === 'swasta'
      ? swastaApps
      : [];

  const totalCount = activeApps.length;
  const activeOrbitCount = getActiveOrbitCount(totalCount);
  const isMultiOrbit = activeOrbitCount > 1;
  const activeRadii = ORBIT_RADII_BY_COUNT[activeOrbitCount] || ORBIT_RADII_BY_COUNT[1];
  const safeZoneRadiusSvg =
    activeOrbitCount === 1 ? 132 : activeOrbitCount === 2 ? 126 : 114;

  return (
    <div className="relative min-h-screen w-full bg-[#020617] text-white overflow-x-hidden selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* =================================================================== */}
      {/* DARK AMBIENT BACKGROUND WITH RADIAL GRADIENTS & GLOWING BLOBS       */}
      {/* =================================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.22),transparent_70%)]" />

        {/* Ambient Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full bg-emerald-950/20 blur-[150px]" />

        {/* Ambient Side Blobs */}
        <div className="absolute top-1/4 -left-36 w-96 h-96 rounded-full bg-emerald-900/15 blur-[130px]" />
        <div className="absolute bottom-1/4 -right-36 w-96 h-96 rounded-full bg-teal-900/15 blur-[130px]" />

        {/* Subtle Radial Vignette Edge */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#020617_92%)]" />
      </div>

      {/* =================================================================== */}
      {/* HEADER SECTION (WITH GRENNUSA LOGO & BADGE)                         */}
      {/* =================================================================== */}
      <PortalHeader
        logoUrl={portalContent.logoUrl}
        headerText={portalContent.headerText}
        paragraphText={portalContent.paragraphText}
        activeFolder={activeFolder}
      />

      {/* =================================================================== */}
      {/* MAIN STAGE: ORBITAL CONCENTRIC RINGS & 3D FOLDERS                   */}
      {/* =================================================================== */}
      <main
        id="portal-main-workspace"
        className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-4 py-2"
      >
        <div
          id="orbital-stage"
          className="relative w-[360px] h-[360px] sm:w-[580px] sm:h-[580px] flex items-center justify-center select-none"
        >
          {/* CONCENTRIC SVG RINGS & ORBIT TICKS */}
          <svg
            id="orbital-rings-svg"
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox="0 0 600 600"
            fill="none"
          >
            {/* Lingkaran Batas Luar */}
            <circle
              cx="300"
              cy="300"
              r={
                activeFolder && activeOrbitCount >= 3
                  ? '295'
                  : activeFolder && isMultiOrbit
                  ? '288'
                  : '272'
              }
              stroke="rgba(16, 185, 129, 0.12)"
              strokeWidth="1"
              className="transition-all duration-500"
            />

            {/* Saat Belum Ada Folder Dibuka: Jalur Orbit Bawaan */}
            {!activeFolder && (
              <>
                <circle
                  cx="300"
                  cy="300"
                  r={232}
                  stroke="rgba(16, 185, 129, 0.22)"
                  strokeWidth="1.5"
                  className="transition-all duration-500"
                />
                <circle
                  cx="300"
                  cy="300"
                  r={162}
                  stroke="rgba(16, 185, 129, 0.14)"
                  strokeWidth="1.2"
                  strokeDasharray="6 6"
                  className="transition-all duration-500"
                />
              </>
            )}

            {/* Saat Folder Dibuka: Render Dinamis Jalur Orbit Sesuai Kapasitas */}
            {activeFolder &&
              activeRadii.map((radiusSvg, rIdx) => {
                const isOuterMost = rIdx === activeRadii.length - 1;
                const strokeColors = ['#059669', '#10b981', '#0d9488', '#14b8a6'];
                const strokeColor = strokeColors[rIdx % strokeColors.length];
                return (
                  <circle
                    key={`active-orbit-ring-${rIdx + 1}`}
                    cx="300"
                    cy="300"
                    r={radiusSvg}
                    stroke={strokeColor}
                    strokeOpacity={isOuterMost ? 0.35 : 0.25}
                    strokeWidth={isOuterMost ? '2' : '1.75'}
                    strokeDasharray={isOuterMost ? undefined : rIdx % 2 === 0 ? '6 6' : '4 4'}
                    className="transition-all duration-500"
                  />
                );
              })}

            {/* Batas Zona Aman Folder di Tengah */}
            <circle
              cx="300"
              cy="300"
              r={safeZoneRadiusSvg}
              stroke="rgba(16, 185, 129, 0.18)"
              strokeWidth="1"
              strokeDasharray="4 4"
              className={`transition-all duration-500 ${
                activeFolder ? 'opacity-90' : 'opacity-0'
              }`}
            />

            {/* Titik-Titik Sudut Presisi pada Lingkaran Orbit */}
            <g id="orbit-svg-ticks">
              {activeFolder &&
                activeApps.map((app, index) => {
                  const { cx, cy, ringIndex } = getOrbitNodeGeometry(index, totalCount);
                  const tickColors = ['#059669', '#10b981', '#0d9488', '#14b8a6'];
                  return (
                    <circle
                      key={`tick-${app.id || index}`}
                      cx={cx}
                      cy={cy}
                      r={activeOrbitCount >= 3 ? '2.5' : ringIndex === 1 ? '2.8' : '3'}
                      fill={tickColors[(ringIndex - 1) % tickColors.length]}
                      fillOpacity="0.65"
                    />
                  );
                })}
            </g>
          </svg>

          {/* CENTER 3D FOLDER CARDS (PEMERINTAHAN & SWASTA) */}
          <InteractiveFolder3D
            activeFolder={activeFolder}
            onSelectFolder={handleToggleFolder}
            pemerintahanCount={pemerintahanApps.length}
            swastaCount={swastaApps.length}
            portalContent={portalContent}
          />

          {/* DYNAMIC ORBITING APPS CONTAINER */}
          <div
            id="orbital-nodes-container"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {activeFolder &&
              activeApps.map((app, index) => {
                const { targetLeft, targetTop } = getOrbitNodeGeometry(index, totalCount);
                return (
                  <OrbitingAppItem
                    key={app.id || app.name || index}
                    app={app}
                    targetLeft={targetLeft}
                    targetTop={targetTop}
                    isHovered={hoveredApp?.id === app.id}
                    onHoverApp={handleHoverApp}
                    onLeaveApp={handleLeaveApp}
                  />
                );
              })}
          </div>
        </div>

        {/* LOADING INDICATOR (IF APIS ARE FETCHING) */}
        {isLoading && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Memperbarui data aplikasi...</span>
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* SIDE MODAL (FIXED DIMENSION ON RIGHT SIDE)                          */}
      {/* =================================================================== */}
      <AppDetailSideModal
        app={hoveredApp}
        isOpen={Boolean(hoveredApp)}
        onClose={handleCloseModal}
        onMouseEnter={handleModalMouseEnter}
        onMouseLeave={handleModalMouseLeave}
      />

      {/* =================================================================== */}
      {/* BOTTOM HINT BAR & ACTION CONTROLS                                    */}
      {/* =================================================================== */}
      <footer className="relative z-20 py-4 px-4 flex flex-col items-center justify-center text-center">
        {activeFolder ? (
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={handleCloseFolder}
              className="px-4 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 hover:border-emerald-500/50 shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <span>✕</span>
              <span>
                Tutup Folder {activeFolder === 'pemerintahan' ? 'Pemerintahan' : 'Swasta'}
              </span>
            </button>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-relaxed">
              Arahkan kursor ke icon untuk melihat detail • Klik icon untuk langsung membuka aplikasi
            </p>
          </div>
        ) : (
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-relaxed">
            💡 Klik salah satu folder di tengah untuk menjelajahi ekosistem aplikasi
          </p>
        )}
      </footer>

      {/* =================================================================== */}
      {/* FLOATING WHATSAPP BUTTON (SAME POSITION AS OLD PORTAL)              */}
      {/* =================================================================== */}
      <WhatsAppFloatingButton whatsappLink={portalContent.whatsappLink} />
    </div>
  );
};

export default PortalMainView;
