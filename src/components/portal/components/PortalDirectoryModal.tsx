import React from 'react';
import { OrbitalAppItem, CategoryKey } from '../constants/portalServices';
import { CUSTOM_SVG_ICONS } from '../constants/portalSvgIcons';
import { LocalIconImage } from '@/components/common/LocalIconImage';

export interface PortalDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  govApps: OrbitalAppItem[];
  bizApps: OrbitalAppItem[];
  onSelectApp: (appId: string, catKey: CategoryKey) => void;
  onHoverAction: () => void;
  onLeaveAction: () => void;
}

export const PortalDirectoryModal: React.FC<PortalDirectoryModalProps> = ({
  isOpen,
  onClose,
  govApps,
  bizApps,
  onSelectApp,
  onHoverAction,
  onLeaveAction,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="directory-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-md"
    >
      <div className="relative w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-[32px] bg-[#f3faf6] p-6 sm:p-8 shadow-2xl border border-emerald-900/15 text-stone-900">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-emerald-900/10">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
              Katalog Ekosistem GreenNusa
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
              Aplikasi Pemerintahan &amp; Solusi Bisnis
            </h3>
          </div>
          <button
            id="btn-close-directory"
            type="button"
            onClick={onClose}
            onMouseEnter={onHoverAction}
            onMouseLeave={onLeaveAction}
            className="interactive-target w-10 h-10 rounded-full bg-white hover:bg-emerald-50 border border-emerald-900/10 flex items-center justify-center text-stone-700 shadow-sm cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Pemerintahan List */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <i className="fa-solid fa-landmark text-xs"></i>
                </span>
                Pemerintahan &amp; Organisasi Publik ({govApps.length})
              </h4>
            </div>
            <div id="dir-list-gov" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {govApps.map((app) => {
                const svgIcon = CUSTOM_SVG_ICONS[app.id] || CUSTOM_SVG_ICONS['service-generic'];
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => onSelectApp(app.id, 'gov')}
                    onMouseEnter={onHoverAction}
                    onMouseLeave={onLeaveAction}
                    className="dir-item-btn interactive-target text-left p-3 rounded-2xl bg-[#f3faf6] hover:bg-emerald-100/70 border border-emerald-900/10 flex items-start gap-3 transition-all group cursor-pointer"
                  >
                    {app.iconUrl ? (
                      <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 p-1 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <LocalIconImage
                          iconPath={app.iconUrl}
                          altOverride={app.shortName}
                          className="w-full h-full object-contain filter drop-shadow-sm"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.colorGrad} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                        dangerouslySetInnerHTML={{ __html: svgIcon }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-emerald-950 truncate">
                          {app.shortName}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                        {app.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Swasta List */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <i className="fa-solid fa-briefcase text-xs"></i>
                </span>
                Swasta &amp; Solusi Bisnis ({bizApps.length})
              </h4>
            </div>
            <div id="dir-list-biz" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {bizApps.map((app) => {
                const svgIcon = CUSTOM_SVG_ICONS[app.id] || CUSTOM_SVG_ICONS['service-generic'];
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => onSelectApp(app.id, 'biz')}
                    onMouseEnter={onHoverAction}
                    onMouseLeave={onLeaveAction}
                    className="dir-item-btn interactive-target text-left p-3 rounded-2xl bg-[#f3faf6] hover:bg-emerald-100/70 border border-emerald-900/10 flex items-start gap-3 transition-all group cursor-pointer"
                  >
                    {app.iconUrl ? (
                      <div className="w-10 h-10 rounded-xl bg-white border border-teal-200 p-1 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <LocalIconImage
                          iconPath={app.iconUrl}
                          altOverride={app.shortName}
                          className="w-full h-full object-contain filter drop-shadow-sm"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.colorGrad} text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                        dangerouslySetInnerHTML={{ __html: svgIcon }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-emerald-950 truncate">
                          {app.shortName}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                        {app.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
