import React, { useState } from 'react';
import { CategoryType, IconVariant } from '../../types';
import { LOCAL_ICON_ASSETS, FOREGROUND_STACK_CONFIG } from '../../data';
import { LocalIconImage } from '../common/LocalIconImage';

export interface EcosystemFolderCardProps {
  category: CategoryType;
  title: string;
  ariaLabel: string;
  backgroundTiles: [IconVariant, IconVariant, IconVariant];
  onOpenModal: (category: CategoryType) => void;
}

export const EcosystemFolderCard: React.FC<EcosystemFolderCardProps> = ({
  category,
  title,
  ariaLabel,
  backgroundTiles,
  onOpenModal,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenModal(category);
    }
  };

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
          {/* Tile 1: Left */}
          <div className="tile-bg-sharp tile-bg-1 absolute">
            <div
              className="w-[100px] h-[100px] rounded-2xl p-2.5 flex items-center justify-center border-2 border-white/90 shadow-xl"
              style={{ backgroundColor: LOCAL_ICON_ASSETS[backgroundTiles[0]].bgColor }}
            >
              <LocalIconImage variant={backgroundTiles[0]} />
            </div>
          </div>

          {/* Tile 2: Center */}
          <div className="tile-bg-sharp tile-bg-2 absolute">
            <div
              className="w-[104px] h-[104px] rounded-2xl p-2.5 flex items-center justify-center border-2 border-white/90 shadow-xl"
              style={{ backgroundColor: LOCAL_ICON_ASSETS[backgroundTiles[1]].bgColor }}
            >
              <LocalIconImage variant={backgroundTiles[1]} />
            </div>
          </div>

          {/* Tile 3: Right */}
          <div className="tile-bg-sharp tile-bg-3 absolute">
            <div
              className="w-[100px] h-[100px] rounded-2xl p-2.5 flex items-center justify-center border-2 border-white/90 shadow-xl"
              style={{ backgroundColor: LOCAL_ICON_ASSETS[backgroundTiles[2]].bgColor }}
            >
              <LocalIconImage variant={backgroundTiles[2]} />
            </div>
          </div>
        </div>

        {/* LAYER 2: APP TILES / UBIN APLIKASI */}
        <div className="absolute inset-x-0 bottom-[236px] h-0 flex items-center justify-center z-25 overflow-visible pointer-events-none group-hover:pointer-events-auto">
          {FOREGROUND_STACK_CONFIG.map((tile) => {
            const assetConfig = LOCAL_ICON_ASSETS[tile.variant];
            return (
              <div key={tile.stackClass} className={`${tile.stackClass} folder-transition absolute cursor-pointer`}>
                <div
                  className={`${tile.sizeClass} rounded-2xl ${assetConfig.glowClass} p-2 flex items-center justify-center border-2 ${tile.borderClass} ${tile.shadowClass} opacity-100`}
                  style={{ backgroundColor: assetConfig.bgColor }}
                >
                  <LocalIconImage variant={tile.variant} altOverride={tile.alt} />
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
