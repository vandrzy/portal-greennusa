'use client';

import React, { useState } from 'react';
import { CategoryType, EcosystemAppItem } from '../../types';
import { LocalIconImage } from '../common/LocalIconImage';

export interface EcosystemFolderCardProps {
  category: CategoryType;
  title: string;
  ariaLabel: string;
  apps?: EcosystemAppItem[];
  onOpenModal: (category: CategoryType) => void;
}

const STACK_SLOT_DEFS = [
  {
    stackClass: 'tile-stack-1',
    sizeClass: 'w-[88px] h-[88px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
  },
  {
    stackClass: 'tile-stack-2',
    sizeClass: 'w-[90px] h-[90px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
  },
  {
    stackClass: 'tile-stack-3',
    sizeClass: 'w-[94px] h-[94px]',
    borderClass: 'border-white/90',
    shadowClass: 'shadow-xl',
  },
  {
    stackClass: 'tile-stack-4',
    sizeClass: 'w-[90px] h-[90px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
  },
  {
    stackClass: 'tile-stack-5',
    sizeClass: 'w-[88px] h-[88px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
  },
];

const DEFAULT_FOREGROUND_STACK = [
  {
    stackClass: 'tile-stack-1',
    sizeClass: 'w-[88px] h-[88px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
    iconPath: '/assets/icons/pemerintahan/image_603ea2.png',
    alt: 'Aplikasi 1',
  },
  {
    stackClass: 'tile-stack-2',
    sizeClass: 'w-[90px] h-[90px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
    iconPath: '/assets/icons/pemerintahan/image_603e9d.png',
    alt: 'Aplikasi 2',
  },
  {
    stackClass: 'tile-stack-3',
    sizeClass: 'w-[94px] h-[94px]',
    borderClass: 'border-white/90',
    shadowClass: 'shadow-xl',
    iconPath: '/assets/icons/pemerintahan/image_603e81.png',
    alt: 'Aplikasi 3',
  },
  {
    stackClass: 'tile-stack-4',
    sizeClass: 'w-[90px] h-[90px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
    iconPath: '/assets/icons/pemerintahan/image_604148.png',
    alt: 'Aplikasi 4',
  },
  {
    stackClass: 'tile-stack-5',
    sizeClass: 'w-[88px] h-[88px]',
    borderClass: 'border-white/80',
    shadowClass: 'shadow-lg',
    iconPath: '/assets/icons/pemerintahan/image_604162.png',
    alt: 'Aplikasi 5',
  },
];

export const EcosystemFolderCard: React.FC<EcosystemFolderCardProps> = ({
  category,
  title,
  ariaLabel,
  apps = [],
  onOpenModal,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenModal(category);
    }
  };

  // Pilih 3 aplikasi untuk peek tile background
  const peekApps: EcosystemAppItem[] = React.useMemo(() => {
    if (apps.length >= 3) {
      if (category === 'pemerintahan') {
        return [apps[0], apps[1], apps[2]];
      } else {
        return [apps[0], apps[2] || apps[1], apps[4] || apps[2]];
      }
    }
    return [];
  }, [apps, category]);

  // Pilih 5 aplikasi untuk foreground fanning stack (posisi slot 0..4)
  const stackApps: EcosystemAppItem[] = React.useMemo(() => {
    if (apps.length >= 5) {
      if (category === 'pemerintahan') {
        // Center (slot 2) adalah DALEV BAPPERIDA
        return [apps[2], apps[1], apps[0], apps[3], apps[4]];
      } else {
        // Center (slot 2) adalah Kasir Borneo
        return [apps[3], apps[4], apps[2], apps[1], apps[0]];
      }
    }
    return [];
  }, [apps, category]);

  return (
    <div
      id={category === 'pemerintahan' ? 'folderPemerintahan' : 'folderSwasta'}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={() => onOpenModal(category)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="folder-card flex flex-col items-center group cursor-pointer transition-transform duration-300 overflow-visible outline-none focus:ring-4 focus:ring-[#25d366]/30 rounded-3xl max-w-full"
      style={{
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0px)',
      }}
    >
      <div className="relative w-[340px] sm:w-[440px] h-[340px] sm:h-[380px] scale-[0.85] sm:scale-100 origin-bottom overflow-visible">
        {/* LAYER 1: BACKPLATE */}
        <div className="absolute inset-0 z-10 overflow-visible pointer-events-none">
          <div className="w-full h-full bg-[#075e54] rounded-2xl shadow-xl folder-back-tab">
            <div className="w-full h-full bg-gradient-to-b from-[#043e37] via-[#054d45] to-[#075e54] rounded-2xl" />
          </div>
        </div>

        {/* LAYER 1.5: BACKGROUND SHARP PEEK TILES */}
        <div className="absolute inset-x-0 bottom-[236px] h-0 flex items-center justify-center z-15 overflow-visible pointer-events-none">
          {peekApps.length === 3 ? (
            <>
              {/* Tile 1: Left */}
              <div className="tile-bg-sharp tile-bg-1 absolute" title={peekApps[0].title}>
                <div className="w-[100px] h-[100px] rounded-2xl p-2.5 flex items-center justify-center bg-white border border-white/80 shadow-xl">
                  <LocalIconImage
                    iconPath={peekApps[0].iconPath}
                    altOverride={peekApps[0].title}
                  />
                </div>
              </div>

              {/* Tile 2: Center */}
              <div className="tile-bg-sharp tile-bg-2 absolute" title={peekApps[1].title}>
                <div className="w-[104px] h-[104px] rounded-2xl p-2.5 flex items-center justify-center bg-white border border-white/80 shadow-xl">
                  <LocalIconImage
                    iconPath={peekApps[1].iconPath}
                    altOverride={peekApps[1].title}
                  />
                </div>
              </div>

              {/* Tile 3: Right */}
              <div className="tile-bg-sharp tile-bg-3 absolute" title={peekApps[2].title}>
                <div className="w-[100px] h-[100px] rounded-2xl p-2.5 flex items-center justify-center bg-white border border-white/80 shadow-xl">
                  <LocalIconImage
                    iconPath={peekApps[2].iconPath}
                    altOverride={peekApps[2].title}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* LAYER 2: APP TILES / UBIN APLIKASI MEKAR SAAT HOVER */}
        <div className="absolute inset-x-0 bottom-[236px] h-0 flex items-center justify-center z-25 overflow-visible pointer-events-none group-hover:pointer-events-auto">
          {stackApps.length === 5
            ? stackApps.map((app, index) => {
                const slot = STACK_SLOT_DEFS[index];
                return (
                  <div
                    key={slot.stackClass}
                    title={app.title}
                    className={`${slot.stackClass} folder-transition absolute cursor-pointer`}
                  >
                    <div
                      className={`${slot.sizeClass} rounded-2xl bg-white p-2.5 flex items-center justify-center border ${slot.borderClass} ${slot.shadowClass} opacity-100 hover:shadow-2xl transition-shadow`}
                    >
                      <LocalIconImage
                        iconPath={app.iconPath}
                        altOverride={app.title}
                      />
                    </div>
                  </div>
                );
              })
            : DEFAULT_FOREGROUND_STACK.map((tile) => {
                return (
                  <div key={tile.stackClass} className={`${tile.stackClass} folder-transition absolute cursor-pointer`}>
                    <div
                      className={`${tile.sizeClass} rounded-2xl bg-white p-2.5 flex items-center justify-center border ${tile.borderClass} ${tile.shadowClass} opacity-100`}
                    >
                      <LocalIconImage iconPath={tile.iconPath} altOverride={tile.alt} />
                    </div>
                  </div>
                );
              })}
        </div>

        {/* LAYER 3: FRONT POUCH */}
        <div
          className="folder-front-pouch folder-transition absolute bottom-0 inset-x-0 h-[76%] bg-[#128c7e] rounded-[24px] shadow-2xl z-30 flex flex-col justify-between p-7 border-t border-white/40"
          style={{
            height: '76%',
            minHeight: '270px',
            padding: '2rem 1.75rem',
          }}
        >
          <div className="absolute top-0 inset-x-8 h-[1.5px] bg-white/70 rounded-full blur-[0.5px]" />
          <div className="flex-1 flex flex-col justify-end pb-2">
            <div>
              <p className="font-headline text-[13px] tracking-widest font-bold text-white/85 uppercase mb-1">
                EKOSISTEM APLIKASI
              </p>
              <h3 className="font-headline text-[34px] font-extrabold text-white leading-tight tracking-tight">
                {title}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcosystemFolderCard;
