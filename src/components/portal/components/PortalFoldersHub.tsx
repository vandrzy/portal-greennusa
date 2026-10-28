import React from 'react';
import { CategoryKey } from '../constants/portalServices';

export interface PortalFoldersHubProps {
  hubRef: React.RefObject<HTMLDivElement>;
  folderGovRef: React.RefObject<HTMLButtonElement>;
  folderBizRef: React.RefObject<HTMLButtonElement>;
  activeCategory: CategoryKey | null;
  folderHubOrbitClass: string;
  folder1Title?: string;
  folder2Title?: string;
  govCount: number;
  bizCount: number;
  onToggleCategory: (cat: CategoryKey) => void;
  onOpenCatalogModal?: (cat: 'pemerintahan' | 'swasta') => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const PortalFoldersHub: React.FC<PortalFoldersHubProps> = ({
  hubRef,
  folderGovRef,
  folderBizRef,
  activeCategory,
  folderHubOrbitClass,
  folder1Title = 'Pemerintahan',
  folder2Title = 'Swasta & Bisnis',
  govCount,
  bizCount,
  onToggleCategory,
  onOpenCatalogModal,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div id="center-folders-hub" ref={hubRef} className={folderHubOrbitClass}>
      {/* FOLDER 1: PEMERINTAHAN */}
      <button
        id="folder-card-gov"
        ref={folderGovRef}
        type="button"
        data-cat="gov"
        onClick={() => onToggleCategory('gov')}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`green-folder-card interactive-target group cursor-pointer ${
          activeCategory === 'gov'
            ? 'is-open'
            : activeCategory === 'biz'
            ? 'is-inactive-folder'
            : ''
        }`}
      >
        <div className="folder-top-tab"></div>
        <div className="folder-back-plate"></div>
        <div className="folder-paper-sheet-2"></div>
        <div className="folder-paper-sheet"></div>

        <div className="folder-front-cover">
          <div className="absolute -top-3.5 -right-2.5 w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center border border-emerald-100 transform rotate-12 text-emerald-700">
            <i className="fa-solid fa-landmark text-sm"></i>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[9.5px] font-extrabold tracking-wider uppercase mb-1.5">
            <span className="folder-status-dot w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
            <span className="folder-state-label">
              {activeCategory === 'gov' ? 'Folder Terbuka' : 'Buka Folder'}
            </span>
          </span>

          <h2 className="text-sm sm:text-[14.5px] font-extrabold leading-snug tracking-tight text-white">
            {folder1Title}
          </h2>

          <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between gap-1.5">
            <span
              onClick={(e) => {
                if (onOpenCatalogModal) {
                  e.stopPropagation();
                  onOpenCatalogModal('pemerintahan');
                }
              }}
              title="Buka Katalog Lengkap Pemerintahan"
              className="px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 active:scale-95 text-[9.5px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-layer-group text-[9.5px]"></i> {govCount} Apps
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/15 text-[9.5px] font-bold inline-flex items-center gap-1.5">
              <i className="fa-solid fa-circle-check text-emerald-300"></i> Aktif
            </span>
          </div>
        </div>
      </button>

      {/* FOLDER 2: SWASTA */}
      <button
        id="folder-card-biz"
        ref={folderBizRef}
        type="button"
        data-cat="biz"
        onClick={() => onToggleCategory('biz')}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`green-folder-card interactive-target group cursor-pointer ${
          activeCategory === 'biz'
            ? 'is-open'
            : activeCategory === 'gov'
            ? 'is-inactive-folder'
            : ''
        }`}
      >
        <div className="folder-top-tab"></div>
        <div className="folder-back-plate"></div>
        <div className="folder-paper-sheet-2"></div>
        <div className="folder-paper-sheet"></div>

        <div className="folder-front-cover">
          <div className="absolute -top-3.5 -right-2.5 w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center border border-emerald-100 transform rotate-12 text-emerald-700">
            <i className="fa-solid fa-briefcase text-sm"></i>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-[9.5px] font-extrabold tracking-wider uppercase mb-1.5">
            <span className="folder-status-dot w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
            <span className="folder-state-label">
              {activeCategory === 'biz' ? 'Folder Terbuka' : 'Buka Folder'}
            </span>
          </span>

          <h2 className="text-sm sm:text-[14.5px] font-extrabold leading-snug tracking-tight text-white">
            {folder2Title}
          </h2>

          <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between gap-1.5">
            <span
              onClick={(e) => {
                if (onOpenCatalogModal) {
                  e.stopPropagation();
                  onOpenCatalogModal('swasta');
                }
              }}
              title="Buka Katalog Lengkap Swasta"
              className="px-2 py-0.5 rounded-md bg-white/15 hover:bg-white/25 active:scale-95 text-[9.5px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <i className="fa-solid fa-layer-group text-[9.5px]"></i> {bizCount} Apps
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/15 text-[9.5px] font-bold inline-flex items-center gap-1.5">
              <i className="fa-solid fa-circle-check text-emerald-300"></i> Aktif
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};
