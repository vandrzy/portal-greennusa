import React from 'react';

export interface PortalDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  subEmail: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onHoverAction: () => void;
  onLeaveAction: () => void;
}

export const PortalDemoModal: React.FC<PortalDemoModalProps> = ({
  isOpen,
  onClose,
  subEmail,
  onEmailChange,
  onSubmit,
  onHoverAction,
  onLeaveAction,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="sub-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/35 backdrop-blur-md"
    >
      <div className="relative w-full max-w-md rounded-[32px] bg-white p-6 sm:p-7 shadow-2xl border border-emerald-100 text-stone-900">
        <button
          id="btn-close-sub-modal"
          type="button"
          onClick={onClose}
          onMouseEnter={onHoverAction}
          onMouseLeave={onLeaveAction}
          className="interactive-target absolute top-5 right-5 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 cursor-pointer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center mb-4">
          <i className="fa-solid fa-paper-plane text-lg"></i>
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-stone-900">
          Request Demo &amp; Subscription
        </h3>
        <p className="text-xs text-stone-600 mt-1 mb-5 leading-relaxed">
          Masukkan alamat email Anda untuk menerima akses penuh ke ekosistem aplikasi Pemerintahan
          &amp; Solusi Bisnis GreenNusa Computindo.
        </p>

        <form id="modal-sub-form" onSubmit={onSubmit} className="space-y-3">
          <input
            id="modal-sub-email"
            type="email"
            required
            value={subEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            onMouseEnter={onHoverAction}
            onMouseLeave={onLeaveAction}
            placeholder="nama@instansi-perusahaan.id"
            className="interactive-target w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            onMouseEnter={onHoverAction}
            onMouseLeave={onLeaveAction}
            className="interactive-target glossy-black-pill w-full py-3.5 rounded-full text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Kirim Akses Demo Sekarang</span>
            <i className="fa-solid fa-check"></i>
          </button>
        </form>
      </div>
    </div>
  );
};
