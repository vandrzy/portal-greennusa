'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AbstractParticleBackground } from '@/components/layout/AbstractParticleBackground';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Username/email dan password wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Kredensial yang Anda masukkan salah');
        setIsLoading(false);
        return;
      }

      // Login berhasil -> redirect ke admin dashboard
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Terjadi gangguan koneksi ke server. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#f0f2f5] font-body selection:bg-[#e9edf0] selection:text-[#25d366]">
      {/* Background with Ambient Mesh & Floating Blobs */}
      <AbstractParticleBackground />

      {/* Main Centered Login Card */}
      <div className="relative z-10 w-full max-w-[460px] bg-white/95 backdrop-blur-md rounded-[28px] border border-[#d8e0e5] shadow-[0_24px_60px_-15px_rgba(7,94,84,0.18)] p-6 sm:p-8 flex flex-col transition-all duration-300">
        {/* Top Header / Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3 p-2 rounded-2xl bg-white border border-[#e1e7eb] shadow-sm flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo/logo-green.png"
              alt="Logo GreenNusa"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f7ef] border border-[#bce8d4] text-[#075e54] text-[11px] font-headline font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse" />
            Portal Administrator
          </div>

          <h1 className="font-headline text-2xl sm:text-[26px] font-extrabold text-[#111b21] tracking-tight">
            Masuk ke Panel Admin
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#54656f] mt-1 max-w-[340px]">
            Kelola data dan integrasi ekosistem aplikasi resmi GreenNusa Computindo
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-2xl bg-[#fee2e2]/80 border border-[#fca5a5] text-[#991b1b] text-xs sm:text-sm flex items-start gap-2.5 transition-all duration-200"
          >
            <svg
              className="w-5 h-5 flex-shrink-0 text-[#dc2626] mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Field 1: Username / Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="identifier"
              className="font-headline text-xs font-bold text-[#111b21] uppercase tracking-wider"
            >
              Username atau Email
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#54656f]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Masukkan username atau email"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f7f9fa] border border-[#d8e0e5] text-sm text-[#111b21] placeholder-[#8696a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#128c7e] transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Field 2: Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="font-headline text-xs font-bold text-[#111b21] uppercase tracking-wider"
              >
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#54656f]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                disabled={isLoading}
                className="w-full pl-11 pr-11 py-3 rounded-2xl bg-[#f7f9fa] border border-[#d8e0e5] text-sm text-[#111b21] placeholder-[#8696a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#128c7e] transition-all disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                className="absolute right-3.5 p-1 rounded-lg text-[#54656f] hover:text-[#075e54] focus:outline-none transition-colors"
              >
                {showPassword ? (
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="loginSubmitBtn"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-[#075e54] hover:bg-[#064e46] active:bg-[#053e37] text-white font-headline text-sm font-bold shadow-[0_4px_16px_rgba(7,94,84,0.25)] hover:shadow-[0_6px_20px_rgba(7,94,84,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <span>Kirim</span>
            )}
          </button>
        </form>

        {/* Footer / Back Link */}
        <div className="mt-6 pt-5 border-t border-[#e9edf0] flex flex-col items-center gap-2 text-xs text-[#54656f]">
          <Link
            href="/"
            className="font-headline font-semibold text-[#075e54] hover:text-[#128c7e] transition-colors inline-flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Kembali ke Halaman Utama Portal</span>
          </Link>
          <span className="text-[11px] text-[#8696a0]">
            Portal Ekosistem GreenNusa Computindo &copy; 2026
          </span>
        </div>
      </div>
    </div>
  );
}
