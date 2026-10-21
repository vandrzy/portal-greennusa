import React from 'react';

export interface PortalToastProps {
  message: string;
  isVisible: boolean;
}

export const PortalToast: React.FC<PortalToastProps> = ({ message, isVisible }) => {
  return (
    <div
      id="gn-toast"
      className={`fixed bottom-5 right-5 z-50 pointer-events-none transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="px-4 py-3 rounded-2xl bg-stone-900 text-white text-xs font-semibold shadow-2xl border border-emerald-500/40 flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span id="gn-toast-text">{message}</span>
      </div>
    </div>
  );
};
