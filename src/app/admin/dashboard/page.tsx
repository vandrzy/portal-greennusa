'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminApps } from '@/context/AdminAppsContext';

export default function AdminDashboardPage() {
  const { pemerintahanCount, swastaCount, totalCount, isLoading } = useAdminApps();

  return (
    <div className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto flex flex-col gap-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e1e7eb]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6f7ef] border border-[#bce8d4] text-[#075e54] text-xs font-headline font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#25d366]" />
            Ringkasan Ekosistem
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111b21] tracking-tight">
            Dashboard
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#54656f] mt-1">
            Pantau ringkasan metrik dan total distribusi aplikasi pada portal GreenNusa
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/aplikasi"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#075e54] hover:bg-[#064e46] text-white font-headline text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Kelola Aplikasi</span>
          </Link>
        </div>
      </div>

      {/* STATISTIC CARDS (GRID 2 CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: TOTAL APLIKASI PEMERINTAHAN */}
        <div className="group relative bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-7 shadow-sm hover:shadow-[0_16px_36px_-10px_rgba(7,94,84,0.15)] hover:border-[#128c7e]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
          {/* Subtle Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#075e54] via-[#128c7e] to-[#25d366]" />

          {/* Top Row: Category Label & Icon */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="font-headline text-xs font-bold tracking-wider uppercase text-[#075e54] block mb-1">
                Kategori Layanan Publik
              </span>
              <h2 className="font-headline text-base sm:text-lg font-extrabold text-[#111b21]">
                Total Aplikasi Pemerintahan
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-[#e6f7ef] border border-[#bce8d4] text-[#075e54] flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#075e54] group-hover:text-white transition-all duration-300 shadow-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>

          {/* Middle: Big Stat Number */}
          <div className="my-6">
            {isLoading ? (
              <div className="h-12 w-24 bg-[#f0f2f5] animate-pulse rounded-xl" />
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="font-headline text-4xl sm:text-5xl font-black text-[#111b21] tracking-tight">
                  {pemerintahanCount}
                </span>
                <span className="font-headline text-sm font-semibold text-[#54656f]">
                  Aplikasi Aktif
                </span>
              </div>
            )}
            <p className="font-body text-xs text-[#54656f] mt-2">
              Solusi digital untuk instansi pemerintah daerah, OPD, dan layanan keterbukaan publik.
            </p>
          </div>

          {/* Bottom Card Footer */}
          <div className="pt-4 border-t border-[#f0f2f5] flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#075e54]">
              <span className="w-2 h-2 rounded-full bg-[#25d366]" />
              Terverifikasi & Aktif
            </span>
            <Link
              href="/admin/aplikasi"
              className="text-xs font-headline font-bold text-[#075e54] hover:text-[#128c7e] transition-colors inline-flex items-center gap-1"
            >
              <span>Lihat Detail</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* CARD 2: TOTAL APLIKASI SWASTA */}
        <div className="group relative bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-7 shadow-sm hover:shadow-[0_16px_36px_-10px_rgba(7,94,84,0.15)] hover:border-[#128c7e]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
          {/* Subtle Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#128c7e] via-[#25d366] to-[#4cd3e8]" />

          {/* Top Row: Category Label & Icon */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="font-headline text-xs font-bold tracking-wider uppercase text-[#128c7e] block mb-1">
                Kategori Solusi Bisnis & UMKM
              </span>
              <h2 className="font-headline text-base sm:text-lg font-extrabold text-[#111b21]">
                Total Aplikasi Swasta
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-[#e6f7ef] border border-[#bce8d4] text-[#128c7e] flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#128c7e] group-hover:text-white transition-all duration-300 shadow-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Middle: Big Stat Number */}
          <div className="my-6">
            {isLoading ? (
              <div className="h-12 w-24 bg-[#f0f2f5] animate-pulse rounded-xl" />
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="font-headline text-4xl sm:text-5xl font-black text-[#111b21] tracking-tight">
                  {swastaCount}
                </span>
                <span className="font-headline text-sm font-semibold text-[#54656f]">
                  Aplikasi Aktif
                </span>
              </div>
            )}
            <p className="font-body text-xs text-[#54656f] mt-2">
              Sistem operasional retail, POS, manajemen absensi, dan digitalisasi usaha swasta.
            </p>
          </div>

          {/* Bottom Card Footer */}
          <div className="pt-4 border-t border-[#f0f2f5] flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#128c7e]">
              <span className="w-2 h-2 rounded-full bg-[#128c7e]" />
              Terverifikasi & Aktif
            </span>
            <Link
              href="/admin/aplikasi"
              className="text-xs font-headline font-bold text-[#128c7e] hover:text-[#075e54] transition-colors inline-flex items-center gap-1"
            >
              <span>Lihat Detail</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ADDITIONAL SUMMARY BANNER */}
      <div className="bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-7 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e6f7ef] text-[#075e54] flex items-center justify-center font-bold text-lg flex-shrink-0">
            📊
          </div>
          <div>
            <h3 className="font-headline text-base font-extrabold text-[#111b21]">
              Total Keseluruhan Aplikasi Portal
            </h3>
            <p className="text-xs text-[#54656f] mt-0.5">
              Terdapat total <span className="font-bold text-[#075e54]">{totalCount} aplikasi</span> aktif yang terintegrasi dan siap diakses publik.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/admin/aplikasi"
            className="w-full md:w-auto text-center px-5 py-2.5 rounded-2xl bg-[#f0f2f5] hover:bg-[#e4e8eb] text-[#111b21] font-headline text-xs font-bold transition-all border border-[#d1d7db]"
          >
            Buka Manajemen Aplikasi &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
