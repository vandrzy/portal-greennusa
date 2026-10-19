'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ThemeItem } from '@/types';
import { useEscapeKey, useModalScrollLock } from '@/hooks';

export interface ThemeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  editingTheme?: ThemeItem | null;
  initialData?: ThemeItem | null;
}

function hexToRgba(hex: string, opacity: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(2, 6, 23, ${opacity})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function parseRgbaOrHex(colorStr?: string): { hex: string; opacityPct: number } {
  if (!colorStr) return { hex: '#075e54', opacityPct: 35 };

  const rgbaMatch = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (rgbaMatch) {
    const r = Math.min(255, parseInt(rgbaMatch[1], 10));
    const g = Math.min(255, parseInt(rgbaMatch[2], 10));
    const b = Math.min(255, parseInt(rgbaMatch[3], 10));
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
    const hex = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return { hex, opacityPct: Math.round(a * 100) };
  }

  if (colorStr.startsWith('#')) {
    return { hex: colorStr.slice(0, 7), opacityPct: 35 };
  }

  return { hex: '#075e54', opacityPct: 35 };
}

export const ThemeFormModal: React.FC<ThemeFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTheme,
  initialData,
}) => {
  const currentEditing = editingTheme || initialData || null;
  const isEditMode = Boolean(currentEditing);

  const [name, setName] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overlayColor, setOverlayColor] = useState('#075e54');
  const [overlayOpacityPercent, setOverlayOpacityPercent] = useState<number>(35);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Sync state with editingTheme or reset when opened
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSelectedFile(null);
      setIsSubmitting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (currentEditing) {
        setName(currentEditing.name || '');
        setBackgroundImage(currentEditing.bgImage || '');
        const parsed = parseRgbaOrHex(currentEditing.modalOverlayColor);
        setOverlayColor(parsed.hex);
        setOverlayOpacityPercent(parsed.opacityPct);
        setIsActive(Boolean(currentEditing.isActive));
      } else {
        setName('');
        setBackgroundImage('');
        setOverlayColor('#075e54');
        setOverlayOpacityPercent(35);
        setIsActive(false);
      }
    }
  }, [isOpen, currentEditing]);

  useModalScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContainerRef.current && !modalContainerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('File harus berupa berkas gambar (PNG, JPG, WEBP, SVG, dsb)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran gambar maksimal 5MB');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setBackgroundImage(objectUrl);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Nama tema wajib diisi');
      return;
    }

    if (!isEditMode && !selectedFile) {
      setErrorMessage('Gambar background wajib diunggah');
      return;
    }

    const calculatedOverlayColor = hexToRgba(
      overlayColor,
      Number((overlayOpacityPercent / 100).toFixed(2))
    );

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('modalOverlayColor', calculatedOverlayColor);
    formData.append('isActive', String(isActive));
    if (selectedFile) {
      formData.append('bgFile', selectedFile);
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onSave(formData);
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan tema';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentOpacityDecimal = overlayOpacityPercent / 100;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-all"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalContainerRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-xl bg-white rounded-[28px] border border-[#d8e0e5] shadow-2xl overflow-hidden flex flex-col my-auto transition-all animate-scale-up"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e9edf0] bg-[#fbfcfc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f7ef] border border-[#bce8d4] text-[#075e54] flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M7 21a4 4 0 01-4-4 4 4 0 014-4c.7 0 1.37.18 1.95.5.34-.67.87-1.22 1.55-1.55A3.987 3.987 0 0113 11a4 4 0 014 4 4 4 0 01-4 4H7zM18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-lg text-[#111b21]">
                {isEditMode ? 'Edit Tema' : 'Tambah Tema Baru'}
              </h2>
              <p className="text-xs text-[#54656f]">
                Atur nama, gambar background, dan warna overlay modal portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Modal"
            className="w-8 h-8 rounded-full bg-[#f0f2f5] hover:bg-[#e1e7eb] text-[#54656f] hover:text-[#111b21] flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[calc(85vh-140px)] custom-scrollbar">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* INPUT 1: NAMA TEMA */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="themeNameInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
              Nama Tema <span className="text-red-500">*</span>
            </label>
            <input
              id="themeNameInput"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Modern Green, tema-ramadhan..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#d8e0e5] bg-white text-sm font-headline text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all"
            />
          </div>

          {/* INPUT 2: UPLOAD BACKGROUND & PREVIEW */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
              Gambar Background {!isEditMode && <span className="text-red-500">*</span>}
            </label>

            {/* Kotak Preview Background Murni - Hanya tampil jika sudah ada gambar yang diupload atau saat edit */}
            {backgroundImage ? (
              <div className="flex flex-col gap-1.5">
                <div className="relative w-full aspect-video sm:h-44 rounded-2xl overflow-hidden border-2 border-dashed border-[#cbd5e1] bg-[#f8fafc] flex items-center justify-center shadow-inner group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={backgroundImage}
                    alt="Preview Background"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[11px] font-headline font-medium">
                      Preview Gambar
                    </span>
                  </div>
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setBackgroundImage(isEditMode && currentEditing ? currentEditing.bgImage : '');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="self-start text-[11px] text-red-600 hover:text-red-700 font-headline font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    ✕ Batalkan / Hapus Gambar Terpilih
                  </button>
                )}
              </div>
            ) : null}

            {/* Input File Upload */}
            <div className="flex items-center gap-3 mt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="block w-full text-xs text-[#54656f] file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-headline file:font-bold file:bg-[#075e54] file:text-white hover:file:bg-[#064e46] file:cursor-pointer cursor-pointer border border-[#d8e0e5] rounded-xl p-1.5 bg-[#f0f2f5]/50 focus:outline-none focus:ring-2 focus:ring-[#075e54]"
              />
            </div>
            <p className="text-[11px] text-[#64748b]">
              Gunakan gambar beresolusi tinggi (disarankan 1440x1024 atau 1920x1080) berformat PNG, JPG, atau WEBP. Maksimal 5MB.
            </p>
          </div>

          {/* INPUT 3: COLOR SELECTOR & OPACITY CONTROL */}
          <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-4">
            <span className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider block">
              Warna & Opacity Overlay Modal
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Color Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-headline font-bold text-[#54656f]">
                  Warna Overlay Modal
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={overlayColor}
                    onChange={(e) => setOverlayColor(e.target.value)}
                    className="w-10 h-10 p-0.5 rounded-xl border border-[#cbd5e1] cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={overlayColor}
                    onChange={(e) => setOverlayColor(e.target.value)}
                    placeholder="#075e54"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#cbd5e1] bg-white text-xs font-mono font-bold text-[#111b21] focus:outline-none focus:ring-2 focus:ring-[#075e54]"
                  />
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-headline font-bold text-[#54656f]">
                    Tingkat Opacity
                  </label>
                  <span className="text-xs font-headline font-bold text-[#075e54] bg-[#e6f7ef] px-2 py-0.5 rounded-md">
                    {overlayOpacityPercent}% ({currentOpacityDecimal.toFixed(2)})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={overlayOpacityPercent}
                  onChange={(e) => setOverlayOpacityPercent(Number(e.target.value))}
                  className="w-full accent-[#075e54] cursor-pointer h-2 bg-[#cbd5e1] rounded-lg"
                />
              </div>
            </div>

            {/* Live Indicator Swatch */}
            <div className="flex items-center gap-3 pt-2 border-t border-[#e2e8f0]">
              <div
                className="w-7 h-7 rounded-xl border border-slate-300 shadow-sm shrink-0"
                style={{
                  backgroundColor: overlayColor,
                  opacity: currentOpacityDecimal,
                }}
              />
              <span className="text-[11px] text-[#64748b]">
                Warna ini akan menjadi filter transparan di belakang popup modal saat aplikasi diklik oleh pengunjung.
              </span>
            </div>
          </div>

          {/* INPUT 4: STATUS AKTIF CHECKBOX */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
            <input
              id="themeIsActiveCheckbox"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#075e54] rounded focus:ring-[#075e54] border-gray-300 cursor-pointer"
            />
            <label htmlFor="themeIsActiveCheckbox" className="text-xs font-headline font-semibold text-[#111b21] cursor-pointer select-none">
              Jadikan sebagai tema aktif utama pada portal
            </label>
          </div>

          {/* FOOTER MODAL */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e9edf0] mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-[#d8e0e5] bg-white text-xs font-headline font-bold text-[#54656f] hover:bg-[#f0f2f5] hover:text-[#111b21] transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#075e54] hover:bg-[#064e46] active:bg-[#053e37] text-white font-headline text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isEditMode ? 'Perbarui Tema' : 'Simpan Tema'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThemeFormModal;
