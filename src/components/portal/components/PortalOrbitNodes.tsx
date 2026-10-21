import React from 'react';
import { OrbitalAppItem } from '../constants/portalServices';
import { CUSTOM_SVG_ICONS } from '../constants/portalSvgIcons';
import { LocalIconImage } from '@/components/common/LocalIconImage';

export interface PortalOrbitNodesProps {
  containerRef: React.RefObject<HTMLDivElement>;
  orbitList: OrbitalAppItem[];
  getOrbitNodeGeometry: (index: number) => { targetLeft: string; targetTop: string };
  orbitNodeRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  activeOrbitCount: number;
  isMultiOrbit: boolean;
  isGlassCardVisible: boolean;
  hoveredAppId: string | null;
  onHover: (appId: string, el: HTMLElement) => void;
  onLeave: () => void;
  onClick: (app: OrbitalAppItem, el: HTMLElement) => void;
}

export const PortalOrbitNodes: React.FC<PortalOrbitNodesProps> = ({
  containerRef,
  orbitList,
  getOrbitNodeGeometry,
  orbitNodeRefs,
  activeOrbitCount,
  isMultiOrbit,
  isGlassCardVisible,
  hoveredAppId,
  onHover,
  onLeave,
  onClick,
}) => {
  return (
    <div
      id="orbital-nodes-container"
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      {orbitList.map((app, index) => {
        const { targetLeft, targetTop } = getOrbitNodeGeometry(index);
        const svgMarkup = CUSTOM_SVG_ICONS[app.id] || CUSTOM_SVG_ICONS['service-generic'];
        const isActiveNode = isGlassCardVisible && hoveredAppId === app.id;
        const nodeSizeClass =
          activeOrbitCount >= 3
            ? 'ultra-compact-node'
            : isMultiOrbit
            ? 'compact-node'
            : '';

        return (
          <button
            key={app.id}
            ref={(el) => {
              orbitNodeRefs.current[app.id] = el;
            }}
            type="button"
            data-app-id={app.id}
            data-target-left={targetLeft}
            data-target-top={targetTop}
            style={{ left: targetLeft, top: targetTop }}
            onMouseEnter={(e) => onHover(app.id, e.currentTarget)}
            onMouseLeave={onLeave}
            onClick={(e) => {
              e.stopPropagation();
              onClick(app, e.currentTarget);
            }}
            className={`orbit-app-node interactive-target pointer-events-auto group cursor-pointer ${nodeSizeClass} ${
              isActiveNode ? 'active-node' : ''
            }`}
          >
            <div className="orbit-app-badge">
              {app.iconUrl ? (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center p-1">
                  <LocalIconImage
                    iconPath={app.iconUrl}
                    altOverride={app.shortName}
                    className="w-full h-full object-contain filter drop-shadow-sm"
                  />
                </div>
              ) : (
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${app.colorGrad} text-white flex items-center justify-center shadow-inner`}
                  dangerouslySetInnerHTML={{ __html: svgMarkup }}
                />
              )}
            </div>
            <span className="orbit-label-pill">{app.shortName}</span>
          </button>
        );
      })}
    </div>
  );
};
