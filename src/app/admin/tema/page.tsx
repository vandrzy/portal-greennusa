'use client';

import React, { useState, useMemo } from 'react';
import { ThemeItem } from '@/types';
import { ThemeFormModal } from '@/components/modal/ThemeFormModal';

const PAGE_SIZE = 6;

const INITIAL_THEMES: ThemeItem[] = [
  {
    id: 1,
    name: 'default',
    backgroundImage: '/assets/backgroundTheme/default.png',
    overlayColor: '#075e54',
    overlayOpacity: 0.35,
    isActive: true,
  },
];

export default function AdminTemaPage() {
  const [themes, setThemes] = useState<ThemeItem[]>(INITIAL_THEMES);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeItem | null>(null);

  // Delete Confirmation State
  const [themeToDelete, setThemeToDelete] = useState<ThemeItem | null>(null);

  // Filtered Themes based on search query
  const filteredThemes = useMemo(() => {
    if (!searchQuery.trim()) return themes;
    const query = searchQuery.toLowerCase().trim();
    return themes.filter((theme) => theme.name.toLowerCase().includes(query));
  }, [themes, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredThemes.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredThemes.length);

  const paginatedThemes = useMemo(() => {
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    return filteredThemes.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredThemes, currentPage]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingTheme(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (theme: ThemeItem) => {
    setEditingTheme(theme);
    setIsModalOpen(true);
  };

  const handleSaveTheme = (themeData: {
    name: string;
    backgroundImage: string;
    overlayColor: string;
    overlayOpacity: number;
    isActive?: boolean;
    imageFile?: File | null;
  }) => {
    if (editingTheme) {
      // Mode Edit
      setThemes((prev) =>
        prev.map((item) =>
          item.id === editingTheme.id
            ? {
                ...item,
                name: themeData.name,
                backgroundImage: themeData.backgroundImage,
                overlayColor: themeData.overlayColor,
                overlayOpacity: themeData.overlayOpacity,
              }
            : item
        )
      );
    } else {
      // Mode Tambah
      const newId = themes.length > 0 ? Math.max(...themes.map((t) => t.id)) + 1 : 1;
      const newTheme: ThemeItem = {
        id: newId,
        name: themeData.name,
        backgroundImage: themeData.backgroundImage,
        overlayColor: themeData.overlayColor,
        overlayOpacity: themeData.overlayOpacity,
        isActive: false,
      };
      setThemes((prev) => [newTheme, ...prev]);
    }
  };

  const handleToggleActive = (id: number) => {
    setThemes((prev) =>
      prev.map((theme) => {
        if (theme.id === id) {
          // Jadikan aktif dan jika sudah aktif, biarkan atau toggle
          return { ...theme, isActive: !theme.isActive };
        }
        // Aturan tema: jika satu tema diaktifkan, tema lain dinonaktifkan
        return { ...theme, isActive: false };
      })
    );
  };

  const handleDeleteConfirm = () => {
    if (!themeToDelete) return;
    setThemes((prev) => prev.filter((item) => item.id !== themeToDelete.id));
    setThemeToDelete(null);
  };

  return (
    <div className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto flex flex-col gap-6">
      {/* 1. HEADER BAGIAN ATAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e1e7eb]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6f7ef] border border-[#bce8d4] text-[#075e54] text-xs font-headline font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#25d366]" />
            Kustomisasi Desain & Tema
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111b21] tracking-tight">
            Pengaturan Tema
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#54656f] mt-1">
            Kelola tema tampilan, gambar latar belakang, dan warna overlay pada portal utama
          </p>
        </div>

        {/* Tombol + Tambah Tema */}
        <button
          type="button"
          id="btnTambahTema"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#075e54] hover:bg-[#064e46] active:bg-[#053e37] text-white font-headline text-sm font-bold shadow-[0_4px_16px_rgba(7,94,84,0.25)] hover:shadow-[0_6px_20px_rgba(7,94,84,0.35)] transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>+ Tambah Tema</span>
        </button>
      </div>

      {/* 2. SEARCHBAR TOOLBAR */}
      <div className="bg-white rounded-[20px] border border-[#d8e0e5] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md flex items-center">
          <span className="absolute left-3.5 text-[#8696a0]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari tema berdasarkan nama..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[#f7f9fa] border border-[#d8e0e5] text-[#111b21] placeholder-[#8696a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#128c7e] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-xs text-[#8696a0] hover:text-[#111b21]"
            >
              ✕
            </button>
          )}
        </div>

        <div className="text-xs text-[#54656f] font-headline font-semibold self-center sm:self-auto">
          Total: <span className="font-bold text-[#075e54]">{themes.length}</span> tema terdaftar
        </div>
      </div>

      {/* 3. TABEL DAFTAR TEMA */}
      <div className="bg-white rounded-[24px] border border-[#d8e0e5] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f9fa] border-b border-[#e1e7eb] text-[11px] font-headline font-bold text-[#54656f] uppercase tracking-wider">
                <th className="py-4 px-6 w-36">Gambar Background</th>
                <th className="py-4 px-6 min-w-[200px]">Nama & Detail Overlay</th>
                <th className="py-4 px-6 w-32 text-center">Status</th>
                <th className="py-4 px-6 w-64 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9edf0] text-sm">
              {paginatedThemes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#54656f]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">🎨</span>
                      <p className="font-headline font-semibold text-sm">Tidak ada tema yang cocok</p>
                      <p className="text-xs text-[#8696a0]">
                        {searchQuery ? 'Coba ubah kata kunci pencarian Anda' : 'Belum ada tema yang ditambahkan'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedThemes.map((theme) => {
                  const opacityPercent = Math.round(
                    theme.overlayOpacity <= 1 ? theme.overlayOpacity * 100 : theme.overlayOpacity
                  );
                  return (
                    <tr
                      key={theme.id}
                      className="hover:bg-[#fbfcfc] transition-colors group"
                    >
                      {/* Kolom 1: Gambar Background */}
                      <td className="py-4 px-6">
                        <div className="relative w-28 h-16 rounded-xl overflow-hidden border border-[#d8e0e5] shadow-sm bg-[#f8fafc] flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={theme.backgroundImage}
                            alt={theme.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Mini Overlay Indicator in corner */}
                          <div
                            className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full border border-white/80 shadow-xs"
                            style={{
                              backgroundColor: theme.overlayColor,
                              opacity: theme.overlayOpacity,
                            }}
                            title={`Warna Overlay: ${theme.overlayColor} (${opacityPercent}%)`}
                          />
                        </div>
                      </td>

                      {/* Kolom 2: Nama & Detail Overlay */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-headline font-bold text-base text-[#111b21]">
                            {theme.name}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-[#54656f]">
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold bg-[#f0f2f5] px-2 py-0.5 rounded-md">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300"
                                style={{ backgroundColor: theme.overlayColor }}
                              />
                              {theme.overlayColor}
                            </span>
                            <span className="text-[11px] font-headline text-[#8696a0]">
                              Opacity: <strong className="text-[#111b21]">{opacityPercent}%</strong>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kolom Status */}
                      <td className="py-4 px-6 text-center">
                        {theme.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f7ef] text-[#075e54] border border-[#bce8d4] text-xs font-headline font-bold">
                            <span className="w-2 h-2 rounded-full bg-[#25d366]" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-headline font-semibold">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Kolom 3: Aksi (3 Tombol: Aktifkan/Nonaktifkan, Edit, Hapus) */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Tombol 1: Aktifkan / Nonaktifkan */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(theme.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                              theme.isActive
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-[#e6f7ef] hover:bg-[#cbf0dd] text-[#075e54] border-[#bce8d4]'
                            }`}
                            title={theme.isActive ? 'Nonaktifkan tema ini' : 'Gunakan dan aktifkan tema ini'}
                          >
                            {theme.isActive ? (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Nonaktifkan</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Aktifkan</span>
                              </>
                            )}
                          </button>

                          {/* Tombol 2: Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(theme)}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#f0f2f5] text-[#54656f] hover:text-[#075e54] text-xs font-headline font-bold border border-[#d8e0e5] transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Edit Tema"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span>Edit</span>
                          </button>

                          {/* Tombol 3: Hapus */}
                          <button
                            type="button"
                            onClick={() => setThemeToDelete(theme)}
                            className="px-3 py-1.5 rounded-xl bg-[#fee2e2]/60 hover:bg-[#fee2e2] text-[#991b1b] text-xs font-headline font-bold border border-[#fca5a5]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Hapus Tema"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION */}
        {filteredThemes.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#e9edf0] bg-[#fbfcfc] flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info Halaman */}
            <span className="text-xs sm:text-sm text-[#54656f]">
              Menampilkan <span className="font-bold text-[#111b21]">{startIndex}</span>–
              <span className="font-bold text-[#111b21]">{endIndex}</span> dari{' '}
              <span className="font-bold text-[#075e54]">{filteredThemes.length}</span> tema
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 font-headline text-xs font-bold">
              {/* Tombol Prev */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#d8e0e5] text-[#54656f] hover:text-[#075e54] hover:bg-[#f0f2f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                &larr; Sebelumnya
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-[#075e54] text-white shadow-xs'
                        : 'bg-white border border-[#d8e0e5] text-[#54656f] hover:bg-[#f0f2f5] hover:text-[#075e54]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Tombol Next */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#d8e0e5] text-[#54656f] hover:text-[#075e54] hover:bg-[#f0f2f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Berikutnya &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT TEMA */}
      <ThemeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTheme}
        editingTheme={editingTheme}
      />

      {/* MODAL KONFIRMASI HAPUS */}
      {themeToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-[#d8e0e5] flex flex-col gap-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto font-bold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <div className="text-center">
              <h3 className="font-headline font-extrabold text-base text-[#111b21]">
                Hapus Tema Ini?
              </h3>
              <p className="text-xs text-[#54656f] mt-1">
                Apakah Anda yakin ingin menghapus tema{' '}
                <strong className="text-[#111b21]">"{themeToDelete.name}"</strong>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setThemeToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#d8e0e5] bg-white text-xs font-headline font-bold text-[#54656f] hover:bg-[#f0f2f5] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-headline font-bold transition-all shadow-sm cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
