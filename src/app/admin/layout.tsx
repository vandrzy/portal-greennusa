'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAppsProvider } from '@/context/AdminAppsContext';
import { ToastProvider } from '@/context/ToastContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      label: 'Manajemen Konten Portal',
      href: '/admin/kontenportal',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
      ),
    },
    {
      label: 'Manajemen Aplikasi',
      href: '/admin/aplikasi',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      label: 'Pengaturan Admin',
      href: '/admin/pengaturan',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <AdminAppsProvider>
      <ToastProvider>
        <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#f0f2f5] font-body text-[#111b21] flex flex-col md:flex-row">
        {/* DESKTOP SIDEBAR - Strictly 100vh Height & Sticky */}
        <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white border-r border-[#d8e0e5] shadow-sm z-30 shrink-0 h-screen max-h-screen sticky top-0">
          {/* Logo Brand Header */}
          <div className="shrink-0 p-6 border-b border-[#e9edf0] flex flex-col gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="p-2 rounded-2xl bg-[#e6f7ef] border border-[#bce8d4] group-hover:shadow-sm transition-all flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logo/logo-green.png"
                  alt="Logo GreenNusa"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-extrabold text-[15px] text-[#111b21] leading-tight">
                  GreenNusa
                </span>
                <span className="text-[11px] font-semibold text-[#075e54] tracking-wider uppercase">
                  Panel Admin
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
            <span className="px-3 py-1.5 text-[10.5px] font-headline font-bold text-[#8696a0] tracking-wider uppercase">
              Menu Utama
            </span>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-headline font-semibold transition-all ${
                    isActive
                      ? 'bg-[#075e54] text-white shadow-[0_4px_12px_rgba(7,94,84,0.2)]'
                      : 'text-[#54656f] hover:bg-[#f0f2f5] hover:text-[#075e54]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-[#54656f]'}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="my-3 border-t border-[#e9edf0]" />

            <span className="px-3 py-1.5 text-[10.5px] font-headline font-bold text-[#8696a0] tracking-wider uppercase">
              Tautan Eksternal
            </span>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#54656f] hover:bg-[#f0f2f5] hover:text-[#075e54] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <span>Lihat Portal Publik</span>
              </div>
              <span className="text-[11px] text-[#8696a0]">&rarr;</span>
            </Link>
          </nav>

          {/* Sidebar Footer / User Profile & Logout - Anchored at Bottom */}
          <div className="shrink-0 p-4 border-t border-[#e9edf0] flex flex-col gap-3 mt-auto">
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="w-9 h-9 rounded-full bg-[#e6f7ef] border border-[#bce8d4] text-[#075e54] flex items-center justify-center font-headline font-bold text-sm">
                A
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-headline text-xs font-bold text-[#111b21] block truncate">
                  Administrator
                </span>
                <span className="text-[11px] text-[#54656f] truncate block">admin@greennusa.id</span>
              </div>
            </div>

            <button
              type="button"
              id="adminLogoutBtn"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#fee2e2]/60 hover:bg-[#fee2e2] text-[#991b1b] text-xs font-headline font-bold transition-all border border-[#fca5a5]/40 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
            </button>
          </div>
        </aside>

        {/* MOBILE HEADER */}
        <header className="md:hidden bg-white border-b border-[#d8e0e5] px-4 py-3.5 flex items-center justify-between sticky top-0 z-40">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo/logo-green.png" alt="Logo" className="h-7 w-auto object-contain" />
            <span className="font-headline font-extrabold text-sm text-[#111b21]">
              Admin GreenNusa
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            className="p-2 rounded-xl bg-[#f0f2f5] text-[#111b21] hover:text-[#075e54] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </header>

        {/* MOBILE DRAWER */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col justify-end">
            <div className="bg-white rounded-t-3xl p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#e9edf0]">
                <span className="font-headline font-extrabold text-base text-[#111b21]">
                  Menu Navigasi
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full text-[#54656f]"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-headline font-semibold transition-all ${
                        isActive
                          ? 'bg-[#075e54] text-white'
                          : 'text-[#54656f] hover:bg-[#f0f2f5]'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#e9edf0] flex flex-col gap-3">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2 text-xs font-semibold text-[#075e54] py-2"
                >
                  <span>&rarr; Buka Halaman Utama Portal</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#fee2e2] text-[#991b1b] text-sm font-headline font-bold"
                >
                  <span>{isLoggingOut ? 'Keluar...' : 'Keluar dari Panel Admin'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN ADMIN CONTENT WRAPPER */}
        <main className="flex-1 min-w-0 flex flex-col overflow-y-auto md:h-screen custom-scrollbar">
          {children}
        </main>
        </div>
      </ToastProvider>
    </AdminAppsProvider>
  );
}
