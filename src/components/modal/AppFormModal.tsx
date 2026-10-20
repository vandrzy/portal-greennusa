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
    iconFile?: File | null;
    iconPath?: string;
    appImage?: string | null;
    appImageFile?: File | null;
    removeAppImage?: boolean;
  }) => Promise<{ success: boolean; message?: string } | void> | void;
  initialData?: EcosystemAppItem | null;
}

const DEFAULT_FALLBACK_ICON = '/assets/icons/pemerintahan/Portal_Induk_Dalev_Bapperida.png';
const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

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
  const [iconPreview, setIconPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [appImagePreview, setAppImagePreview] = useState<string>('');
  const [appImageFile, setAppImageFile] = useState<File | null>(null);
  const [removeAppImage, setRemoveAppImage] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const appImageInputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Sync form state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setIsSubmitting(false);
      setSelectedFile(null);
      setAppImageFile(null);
      setRemoveAppImage(false);

      if (fileInputRef.current) fileInputRef.current.value = '';
      if (appImageInputRef.current) appImageInputRef.current.value = '';

      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setUrl(initialData.url || '');
        setCategory(initialData.category || 'pemerintahan');
        setIconPreview(initialData.iconPath || '');
        setAppImagePreview(initialData.appImage || '');
      } else {
        setTitle('');
        setDescription('');
        setUrl('');
        setCategory('pemerintahan');
        setIconPreview('');
        setAppImagePreview('');
      }
    }
  }, [isOpen, initialData]);

  // Lock body scroll and enable escape key listener
  useModalScrollLock(isOpen);
  useEscapeKey(onClose, isOpen && !isSubmitting);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSubmitting) return;
    if (modalContainerRef.current && !modalContainerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Handle image upload with strict client-side validation & live preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict image validation
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const isValidExtension = /\.(png|jpe?g|webp|svg|gif)$/i.test(fileName);
    const isValidMime = ALLOWED_IMAGE_TYPES.includes(fileType);

    if (!isValidMime && !isValidExtension) {
      setErrorMessage('File icon harus berupa gambar (PNG, JPG, JPEG, WEBP, SVG, atau GIF)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file gambar icon melebihi batas maksimal 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setIconPreview(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = () => {
    if (!isSubmitting) {
      fileInputRef.current?.click();
    }
  };

  // Handle app preview banner image upload
  const handleAppImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const isValidExtension = /\.(png|jpe?g|webp|svg)$/i.test(fileName);
    const isValidMime = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'].includes(fileType);

    if (!isValidMime && !isValidExtension) {
      setErrorMessage('File gambar aplikasi harus berupa gambar (PNG, JPG, JPEG, WEBP, atau SVG)');
      if (appImageInputRef.current) appImageInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran gambar aplikasi maksimal 5MB');
      if (appImageInputRef.current) appImageInputRef.current.value = '';
      return;
    }

    setAppImageFile(file);
    setRemoveAppImage(false);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setAppImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAppImage = () => {
    setAppImageFile(null);
    setAppImagePreview('');
    setRemoveAppImage(true);
    if (appImageInputRef.current) {
      appImageInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!isEditMode && !selectedFile && !iconPreview) {
      setErrorMessage('File icon aplikasi wajib diunggah');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await onSave({
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        category,
        iconFile: selectedFile,
        iconPath: iconPreview || DEFAULT_FALLBACK_ICON,
        appImage: appImagePreview || null,
        appImageFile,
        removeAppImage,
      });

      if (res && typeof res === 'object' && res.success === false) {
        setErrorMessage(res.message || 'Terjadi kesalahan saat menyimpan data');
        setIsSubmitting(false);
        return;
      }

      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Gagal menyimpan aplikasi');
      setIsSubmitting(false);
    }
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
              disabled={isSubmitting}
              aria-label="Tutup form"
              className="w-8 h-8 rounded-full bg-[#f0f2f5] hover:bg-[#e4e8eb] text-[#111b21] flex items-center justify-center font-bold text-sm transition-colors border border-[#d1d7db] disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-[#fee2e2]/90 border border-[#fca5a5] text-[#991b1b] text-xs font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4 flex-shrink-0 text-[#dc2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
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
                disabled={isSubmitting}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: DALEV BAPPERIDA, FixMate, Rajiin"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f7f9fa] border border-[#d8e0e5] text-sm text-[#111b21] placeholder-[#8696a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#128c7e] transition-all disabled:opacity-60"
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
                disabled={isSubmitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan fungsi utama dan manfaat aplikasi ini bagi pengguna..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#f7f9fa] border border-[#d8e0e5] text-sm text-[#111b21] placeholder-[#8696a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#128c7e] transition-all resize-none disabled:opacity-60"
              />
            </div>

            {/* Field 3: URL Aplikasi & Field 4: Dropdown Kategori */}
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
                  disabled={isSubmitting}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://aplikasi.id"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f7f9fa] border border-[#d8e0e5] text-sm text-[#111b21] placeholder-[#8696a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#128c7e] transition-all disabled:opacity-60"
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
                  disabled={isSubmitting}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f7f9fa] border border-[#d8e0e5] text-sm text-[#111b21] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#128c7e] transition-all cursor-pointer font-medium disabled:opacity-60"
                >
                  <option value="pemerintahan">Pemerintahan</option>
                  <option value="swasta">Swasta</option>
                </select>
              </div>
            </div>

            {/* Field 5: Form Upload Icon & Preview (Gambar Khusus) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-headline text-xs font-bold text-[#111b21] uppercase tracking-wider">
                Upload Icon Aplikasi <span className="text-red-500">*</span>
              </label>

              {/* Hidden Native File Input with Strict MIME Accept */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="hidden"
              />

              {/* Upload Box with Integrated Preview */}
              <div
                onClick={handleTriggerUpload}
                className={`group relative w-full border-2 border-dashed border-[#bce8d4] hover:border-[#128c7e] bg-[#f7fbf9] hover:bg-[#edf9f3] rounded-2xl p-4 transition-all duration-200 cursor-pointer flex items-center gap-4 ${
                  isSubmitting ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {/* Preview Box */}
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#d8e0e5] p-2 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                  {iconPreview ? (
                    iconPreview.startsWith('data:') || iconPreview.startsWith('blob:') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={iconPreview}
                        alt="Preview icon"
                        className="w-full h-full object-contain filter drop-shadow-sm"
                      />
                    ) : (
                      <LocalIconImage
                        iconPath={iconPreview}
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
                      {iconPreview ? 'Klik untuk mengganti icon' : 'Klik untuk unggah icon gambar'}
                    </span>
                    <span className="text-[10px] bg-[#e6f7ef] text-[#075e54] px-2 py-0.5 rounded-full font-bold">
                      Khusus Gambar
                    </span>
                  </div>
                  <p className="text-[11px] text-[#54656f] mt-0.5 truncate">
                    {iconPreview
                      ? selectedFile
                        ? `File dipilih: ${selectedFile.name}`
                        : 'Icon saat ini aktif. Klik untuk memilih gambar pengganti.'
                      : 'Hanya format PNG, JPG, JPEG, WebP, SVG, GIF (Maks. 5MB).'}
                  </p>
                </div>
              </div>
            </div>

            {/* Field 6: Upload Gambar Aplikasi (Opsional) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-headline text-xs font-bold text-[#111b21] uppercase tracking-wider">
                  Upload Gambar Aplikasi <span className="text-[11px] font-normal text-[#8696a0] normal-case tracking-normal">(Opsional)</span>
                </label>
                {appImagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAppImage}
                    disabled={isSubmitting}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    Hapus Gambar
                  </button>
                )}
              </div>

              {/* Hidden Native File Input for App Image */}
              <input
                ref={appImageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleAppImageChange}
                disabled={isSubmitting}
                className="hidden"
                id="app-image-upload"
              />

              <label
                htmlFor="app-image-upload"
                className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
                  appImagePreview
                    ? 'border-[#25d366] bg-[#f7fbf9] p-3'
                    : 'border-[#d8e0e5] bg-[#f7f9fa] hover:bg-[#edf9f3] hover:border-[#128c7e] py-5 px-4'
                } ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}
              >
                {appImagePreview ? (
                  <div className="w-full flex flex-col items-center gap-2">
                    {/* Bagian Preview Gambar Aplikasi */}
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-[#d8e0e5] flex items-center justify-center">
                      {appImagePreview.startsWith('data:') || appImagePreview.startsWith('blob:') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={appImagePreview}
                          alt="Preview Gambar Aplikasi"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <LocalIconImage
                          src={appImagePreview}
                          alt="Preview Gambar Aplikasi"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#075e54] hover:underline">
                      Klik untuk mengganti gambar aplikasi
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#d8e0e5] text-[#075e54] flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#111b21]">
                      Pilih gambar banner/preview aplikasi
                    </p>
                    <p className="text-[11px] text-[#8696a0]">
                      PNG, JPG, WEBP, SVG (Maks. 5MB) — Opsional
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e9edf0] mt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#f0f2f5] hover:bg-[#e4e8eb] text-[#54656f] font-headline text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                id="submitAppModalBtn"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#075e54] hover:bg-[#064e46] active:bg-[#053e37] text-white font-headline text-xs font-bold shadow-[0_4px_12px_rgba(7,94,84,0.25)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Simpan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AppFormModal;
