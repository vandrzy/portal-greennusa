'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPengaturanPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);

  // Form State
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Status State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch profil admin saat halaman pertama kali dibuka
  useEffect(() => {
    let isMounted = true;

    async function loadAdminProfile() {
      setIsProfileLoading(true);
      try {
        const res = await fetch('/api/admin/pengaturan', { cache: 'no-store' });
        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.data) {
            setProfile(json.data);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil profil admin:', err);
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    }

    loadAdminProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // 2. Handle Submit Reset Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validasi Sisi Klien
    if (!newPassword.trim()) {
      setErrorMessage('Password baru tidak boleh kosong');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password baru minimal harus 6 karakter');
      return;
    }

    if (!confirmPassword.trim()) {
      setErrorMessage('Konfirmasi password baru tidak boleh kosong');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password baru');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/pengaturan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
          confirmPassword,
        }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const json = await res.json().catch(() => null);

      if (res.ok && json?.success) {
        setSuccessMessage(json.message || 'Password admin berhasil diperbarui');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(json?.message || 'Gagal mengubah password admin');
      }
    } catch (err) {
      console.error('Gagal mengirim request reset password:', err);
      setErrorMessage('Terjadi kesalahan koneksi saat menghubungi server');
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid =
    newPassword.length >= 6 &&
    confirmPassword.length >= 6 &&
    newPassword === confirmPassword;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#d8e0e5]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-headline text-xs font-bold uppercase tracking-wider text-[#075e54]">
              Akun & Keamanan
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#e6f7ef] text-[#075e54] border border-[#bce8d4]">
              Admin
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111b21] tracking-tight">
            Pengaturan Admin
          </h1>
          <p className="text-sm text-[#54656f] mt-1">
            Kelola kata sandi dan keamanan akun administrator portal ekosistem
          </p>
        </div>
      </div>

      {/* Konten Halaman */}
      <div className="py-6 max-w-3xl flex flex-col gap-6">
        {/* Notifikasi Sukses */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-[#e6f7ef] border border-[#bce8d4] text-[#075e54] flex items-start gap-3 shadow-sm animate-fade-in">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <span className="font-headline font-bold text-sm block">Berhasil!</span>
              <p className="text-xs text-[#075e54]/90 mt-0.5">{successMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-[#075e54] hover:text-[#064e46] text-sm font-bold p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Notifikasi Error */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-[#fee2e2]/70 border border-[#fca5a5] text-[#991b1b] flex items-start gap-3 shadow-sm animate-fade-in">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <span className="font-headline font-bold text-sm block">Gagal!</span>
              <p className="text-xs text-[#991b1b]/90 mt-0.5">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-[#991b1b] hover:text-[#7f1d1d] text-sm font-bold p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Card Profil Singkat Admin */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#d8e0e5] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e6f7ef] border border-[#bce8d4] text-[#075e54] flex items-center justify-center font-headline font-extrabold text-xl shadow-inner shrink-0">
              {profile?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-lg font-bold text-[#111b21]">
                  {isProfileLoading ? 'Memuat profil...' : profile?.name || 'Administrator'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e6f7ef] text-[#075e54] border border-[#bce8d4]">
                  {profile?.role || 'admin'}
                </span>
              </div>
              <p className="text-xs text-[#54656f] mt-0.5 font-mono">
                {profile?.email || 'admin@greennusa.id'} • @{profile?.username || 'admin'}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs text-[#8696a0]">
            <span className="block">Status Sesi:</span>
            <span className="inline-flex items-center gap-1.5 text-[#075e54] font-semibold mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse" />
              Aktif & Terautentikasi
            </span>
          </div>
        </div>

        {/* Card Form Reset Password */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#d8e0e5] shadow-sm flex flex-col gap-6">
          <div className="border-b border-[#e9edf0] pb-4">
            <h3 className="font-headline text-lg font-bold text-[#111b21] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#075e54]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              <span>Reset Password Admin</span>
            </h3>
            <p className="text-xs text-[#54656f] mt-1">
              Gunakan kombinasi password yang kuat untuk menjaga keamanan akses portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Form Password Baru */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="newPasswordInput"
                className="font-headline text-xs font-bold text-[#111b21] uppercase tracking-wider"
              >
                Password Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPasswordInput"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru (min. 6 karakter)"
                  autoComplete="new-password"
                  required
                  disabled={isSaving}
                  className="w-full px-4 py-3 pr-12 rounded-2xl bg-[#f7f9fa] border border-[#d8e0e5] text-sm text-[#111b21] focus:outline-none focus:border-[#075e54] focus:ring-2 focus:ring-[#075e54]/20 transition-all placeholder:text-[#8696a0]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#54656f] hover:text-[#075e54] p-1 transition-colors"
                >
                  {showNewPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <span className="text-[11px] text-[#8696a0]">
                Password minimal 6 karakter. Disarankan mengandung huruf, angka, dan simbol.
              </span>
            </div>

            {/* Form Konfirmasi Password Baru */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPasswordInput"
                className="font-headline text-xs font-bold text-[#111b21] uppercase tracking-wider"
              >
                Konfirmasi Password Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPasswordInput"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  autoComplete="new-password"
                  required
                  disabled={isSaving}
                  className={`w-full px-4 py-3 pr-12 rounded-2xl bg-[#f7f9fa] border text-sm text-[#111b21] focus:outline-none transition-all placeholder:text-[#8696a0] ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : confirmPassword && newPassword === confirmPassword
                      ? 'border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-100'
                      : 'border-[#d8e0e5] focus:border-[#075e54] focus:ring-2 focus:ring-[#075e54]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#54656f] hover:text-[#075e54] p-1 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <span className="text-[11px] text-red-500 font-medium">
                  Konfirmasi password belum cocok dengan password baru.
                </span>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <span className="text-[11px] text-[#075e54] font-medium flex items-center gap-1">
                  ✓ Password cocok
                </span>
              )}
            </div>

            {/* Button Simpan */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e9edf0]">
              <span className="text-xs text-[#8696a0] order-2 sm:order-1">
                Semua sesi perangkat yang tersimpan akan menggunakan kata sandi baru.
              </span>

              <button
                type="submit"
                id="btnSimpanPassword"
                disabled={isSaving || !isFormValid}
                className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 rounded-2xl bg-[#075e54] hover:bg-[#064e46] active:scale-95 text-white font-headline font-bold text-sm shadow-[0_4px_14px_rgba(7,94,84,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Simpan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
