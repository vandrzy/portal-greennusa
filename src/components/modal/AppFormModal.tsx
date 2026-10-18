'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CategoryType, EcosystemAppItem } from '@/types';
import { useEscapeKey, useModalScrollLock } from '@/hooks';
import { LocalIconImage } from '@/components/common/LocalIconImage';

export interface AppFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appData: {
    title: string;
    description: string;
    url: string;
    category: CategoryType;
    iconPath: string;
  }) => void;
  initialData?: EcosystemAppItem | null;
}

const DEFAULT_FALLBACK_ICON = '/assets/icons/pemerintahan/image_604148.png';

export const AppFormModal: React.FC<AppFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditMode = Boolean(initialData);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<CategoryType>('pemerintahan');
  const [iconPath, setIconPath] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Sync form state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setUrl(initialData.url || '');
        setCategory(initialData.category || 'pemerintahan');
        setIconPath(initialData.iconPath || '');
      } else {
        setTitle('');
        setDescription('');
        setUrl('');
        setCategory('pemerintahan');
        setIconPath('');
      }
    }
  }, [isOpen, initialData]);

  // Lock body scroll and enable escape key listener
  useModalScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContainerRef.current && !modalContainerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Handle image upload & preview conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('File yang diunggah harus berupa gambar (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setIconPath(base64);
        setErrorMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Nama aplikasi wajib diisi');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Deskripsi wajib diisi');
      return;
    }
    if (!url.trim()) {
      setErrorMessage('URL aplikasi wajib diisi');
      return;
    }

    // Default icon fallback jika user belum memilih gambar
    const finalIcon = iconPath.trim() || DEFAULT_FALLBACK_ICON;

    onSave({
      title: title.trim(),
      description: description.trim(),
      url: url.trim(),
      category,
      iconPath: finalIcon,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-50 bg-[#075e54]/40 backdrop-blur-[8px] transition-opacity duration-300"
      />

      {/* Modal Centered Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appModalTitle"
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5"
      >
        <div
          ref={modalContainerRef}
          className="relative w-full max-w-xl bg-white rounded-[24px] border border-[#d8e0e5] shadow-[0_24px_60px_-15px_rgba(7,94,84,0.25)] p-6 sm:p-7 flex flex-col gap-5 my-auto transform transition-all duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#e9edf0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e6f7ef] text-[#075e54] flex items-center justify-center font-bold">
                {isEditMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
              </div>
              <div>
                <span className="font-headline text-[10.5px] font-bold tracking-wider uppercase text-[#075e54] block">
                  {isEditMode ? 'PERBARUI DATA' : 'TAMBAH KE EKOSISTEM'}
                </span>
                <h2
                  id="appModalTitle"
                  className="font-headline text-xl font-extrabold text-[#111b21] tracking-tight"
                >
                  {isEditMode ? 'Edit Aplikasi' : 'Tambah Aplikasi'}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup form"
              className="w-8 h-8 rounded-full bg-[#f0f2f5] hover:bg-[#e4e8eb] text-[#111b21] flex items-center justify-center font-bold text-sm transition-colors border border-[#d1d7db]"
            >
              ✕
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#fee2e2]/80 border border-[#fca5a5] text-[#991b1b] text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Field 1: Nama Aplikasi */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="appName"
                className="font-headline text-xs font-bold text-[#111b21] uppercase tracking-wider"
              >
                Nama Aplikasi <span className="text-red-500">*</span>
              </label>
              <input
                id="appName"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: DALEV BAPPERIDA, FixMate, Rajiin"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f7f9fa] border border-[#d8e0e5] text-sm text-[#111b21] placeholder-[#8696a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#128c7e] transition-all"
              />
            </div>

            {/* Field 2: Deskripsi */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="appDescription"
                className="font-headline text-xs font-bold text-[#111b21] uppercase tracking-wider"
              >
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="appDescription"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan fungsi utama dan manfaat aplikasi ini bagi pengguna..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#f7f9fa] border border-[#d8e0e5] text-sm text-[#111b21] placeholder-[#8696a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#128c7e] transition-all resize-none"
              />
            </div>

            {/* Field 3: URL Aplikasi & Field 4: Dropdown Kategori (Row on Desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="appUrl"
                  className="font-headline text-xs font-bold text-[#111b21] uppercase tracking-wider"
                >
                  URL Aplikasi <span className="text-red-500">*</span>
                </label>
                <input
                  id="appUrl"
                  type="text"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://aplikasi.id"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f7f9fa] border border-[#d8e0e5] text-sm text-[#111b21] placeholder-[#8696a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#128c7e] transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="appCategory"
                  className="font-headline text-xs font-bold text-[#111b21] uppercase tracking-wider"
                >
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="appCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f7f9fa] border border-[#d8e0e5] text-sm text-[#111b21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#128c7e] transition-all cursor-pointer font-medium"
                >
                  <option value="pemerintahan">Pemerintahan</option>
                  <option value="swasta">Swasta</option>
                </select>
              </div>
            </div>

            {/* Field 5: Form Upload Icon & Preview */}
            <div className="flex flex-col gap-1.5">
              <label className="font-headline text-xs font-bold text-[#111b21] uppercase tracking-wider">
                Icon Aplikasi & Preview
              </label>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload Box with Integrated Preview */}
              <div
                onClick={handleTriggerUpload}
                className="group relative w-full border-2 border-dashed border-[#bce8d4] hover:border-[#128c7e] bg-[#f7fbf9] hover:bg-[#edf9f3] rounded-2xl p-4 transition-all duration-200 cursor-pointer flex items-center gap-4"
              >
                {/* Preview Box */}
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#d8e0e5] p-2 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                  {iconPath ? (
                    iconPath.startsWith('data:') || iconPath.startsWith('blob:') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={iconPath}
                        alt="Preview icon"
                        className="w-full h-full object-contain filter drop-shadow-sm"
                      />
                    ) : (
                      <LocalIconImage
                        iconPath={iconPath}
                        altOverride="Preview icon"
                        className="w-full h-full object-contain filter drop-shadow-sm"
                      />
                    )
                  ) : (
                    <svg
                      className="w-8 h-8 text-[#8696a0]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                {/* Upload Action Description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-headline text-xs font-bold text-[#075e54] group-hover:underline">
                      {iconPath ? 'Klik untuk mengganti icon' : 'Klik untuk unggah icon gambar'}
                    </span>
                    <span className="text-[10px] bg-[#e6f7ef] text-[#075e54] px-2 py-0.5 rounded-full font-bold">
                      PNG / JPG / SVG
                    </span>
                  </div>
                  <p className="text-[11px] text-[#54656f] mt-0.5 truncate">
                    {iconPath
                      ? 'Icon siap digunakan. Klik area ini jika ingin mengganti dengan gambar lain.'
                      : 'Ukuran rekomendasi 128x128px atau rasio 1:1 untuk tampilan optimal.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e9edf0] mt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#f0f2f5] hover:bg-[#e4e8eb] text-[#54656f] font-headline text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                id="submitAppModalBtn"
                className="px-6 py-2.5 rounded-xl bg-[#075e54] hover:bg-[#064e46] text-white font-headline text-xs font-bold shadow-[0_4px_12px_rgba(7,94,84,0.25)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Simpan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AppFormModal;
