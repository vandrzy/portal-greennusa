'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    // Bersihkan timer jika masih ada
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const defaultTitle =
        title ||
        (type === 'success' ? 'Berhasil' : type === 'error' ? 'Gagal' : 'Informasi');

      const newToast: ToastItem = {
        id,
        type,
        message,
        title: defaultTitle,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Atur timer auto-dismiss
      const timer = setTimeout(() => {
        dismissToast(id);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Floating Notification Popup Container di Kanan Atas */}
      <aside
        aria-live="polite"
        aria-label="Notifikasi Sistem"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-[calc(100%-2.5rem)]"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.12)] border transition-all duration-300 animate-slide-in-right ${
              toast.type === 'success'
                ? 'border-[#bce8d4]'
                : toast.type === 'error'
                ? 'border-[#fca5a5]'
                : 'border-[#cbd5e1]'
            }`}
          >
            {/* Icon Indikator */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-inner ${
                toast.type === 'success'
                  ? 'bg-[#e6f7ef] text-[#075e54] border border-[#bce8d4]'
                  : toast.type === 'error'
                  ? 'bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]'
                  : 'bg-[#f1f5f9] text-[#334155] border border-[#cbd5e1]'
              }`}
            >
              {toast.type === 'success' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
                  />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            {/* Pesan Teks Notifikasi */}
            <div className="flex-1 min-w-0 pt-0.5">
              <span
                className={`font-headline font-bold text-xs sm:text-sm block tracking-tight ${
                  toast.type === 'success'
                    ? 'text-[#075e54]'
                    : toast.type === 'error'
                    ? 'text-[#dc2626]'
                    : 'text-[#1e293b]'
                }`}
              >
                {toast.title}
              </span>
              <p className="text-xs text-[#54656f] mt-0.5 leading-relaxed break-words font-body">
                {toast.message}
              </p>
            </div>

            {/* Tombol Tutup Manual */}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Tutup notifikasi"
              className="text-[#8696a0] hover:text-[#111b21] p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
