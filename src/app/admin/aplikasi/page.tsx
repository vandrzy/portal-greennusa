'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAdminApps } from '@/context/AdminAppsContext';
import { EcosystemAppItem, CategoryType } from '@/types';
import { AppFormModal } from '@/components/modal/AppFormModal';
import { LocalIconImage } from '@/components/common/LocalIconImage';

const PAGE_SIZE = 6;

export default function AdminAplikasiPage() {
  const {
    apps,
    pagination,
    addApp,
    updateApp,
    deleteApp,
    fetchApps,
    isLoading,
    totalCount,
    pemerintahanCount,
    swastaCount,
  } = useAdminApps();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | CategoryType>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<EcosystemAppItem | null>(null);

  // Delete Confirmation state & loading
  const [appToDelete, setAppToDelete] = useState<EcosystemAppItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Debounce search query input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset to page 1 whenever search query or category filter changes
  const prevFilterRef = useRef({ debouncedSearch, filterCategory });
  useEffect(() => {
    if (
      prevFilterRef.current.debouncedSearch !== debouncedSearch ||
      prevFilterRef.current.filterCategory !== filterCategory
    ) {
      prevFilterRef.current = { debouncedSearch, filterCategory };
      setCurrentPage(1);
    }
  }, [debouncedSearch, filterCategory]);

  // Fetch apps with server-side pagination & filtering
  useEffect(() => {
    fetchApps({
      page: currentPage,
      limit: PAGE_SIZE,
      category: filterCategory,
      search: debouncedSearch,
    });
  }, [currentPage, filterCategory, debouncedSearch, fetchApps]);

  // Auto-retreat to previous page if current page exceeds total pages
  useEffect(() => {
    if (pagination.totalPages > 0 && currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.total || 0;
  const startIndex = totalItems === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, totalItems);

  // Handlers
  const handleOpenAdd = () => {
    setSelectedApp(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (app: EcosystemAppItem) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (data: {
    title: string;
    description: string;
    url: string;
    category: CategoryType;
    iconFile?: File | null;
    iconPath?: string;
    appImage?: string | null;
    appImageFile?: File | null;
    removeAppImage?: boolean;
  }) => {
    if (selectedApp) {
      return await updateApp(selectedApp.id, data);
    } else {
      const res = await addApp(data);
      if (res.success) {
        setCurrentPage(1);
      }
      return res;
    }
  };

  const handleConfirmDelete = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteApp(appToDelete.id);
      if (res && res.success === false) {
        alert(res.message || 'Gagal menghapus aplikasi');
      }
    } finally {
      setIsDeleting(false);
      setAppToDelete(null);
    }
  };

  return (
    <div className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto flex flex-col gap-6">
      {/* 1. HEADER BAGIAN ATAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e1e7eb]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6f7ef] border border-[#bce8d4] text-[#075e54] text-xs font-headline font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#25d366]" />
            Inventaris Solusi Digital
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111b21] tracking-tight">
            Manajemen Aplikasi
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#54656f] mt-1">
            Kelola data katalog aplikasi pemerintahan dan swasta yang ditampilkan pada portal
          </p>
        </div>

        {/* Tombol + Tambah Aplikasi */}
        <button
          type="button"
          id="btnTambahAplikasi"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#075e54] hover:bg-[#064e46] active:bg-[#053e37] text-white font-headline text-sm font-bold shadow-[0_4px_16px_rgba(7,94,84,0.25)] hover:shadow-[0_6px_20px_rgba(7,94,84,0.35)] transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>+ Tambah Aplikasi</span>
        </button>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
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
            placeholder="Cari berdasarkan nama, deskripsi, atau URL..."
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

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#f0f2f5] rounded-xl border border-[#d8e0e5] text-xs font-headline font-semibold">
          <button
            type="button"
            onClick={() => {
              setFilterCategory('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-white text-[#075e54] font-bold shadow-sm'
                : 'text-[#54656f] hover:text-[#075e54]'
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterCategory('pemerintahan');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterCategory === 'pemerintahan'
                ? 'bg-[#075e54] text-white font-bold shadow-sm'
                : 'text-[#54656f] hover:text-[#075e54]'
            }`}
          >
            Pemerintahan ({pemerintahanCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterCategory('swasta');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterCategory === 'swasta'
                ? 'bg-[#128c7e] text-white font-bold shadow-sm'
                : 'text-[#54656f] hover:text-[#075e54]'
            }`}
          >
            Swasta ({swastaCount})
          </button>
        </div>
      </div>

      {/* 2. TABEL APLIKASI (4 KOLOM UTAMA) */}
      <div className="bg-white rounded-[24px] border border-[#d8e0e5] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f9fa] border-b border-[#e1e7eb] text-[11px] font-headline font-bold text-[#54656f] uppercase tracking-wider">
                <th scope="col" className="py-4 px-5 w-20 text-center">
                  Icon
                </th>
                <th scope="col" className="py-4 px-5">
                  Nama Aplikasi
                </th>
                <th scope="col" className="py-4 px-5 w-40 text-center">
                  Kategori
                </th>
                <th scope="col" className="py-4 px-5 w-40 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f4] text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#54656f]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-3 border-[#075e54] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Memuat data aplikasi...</span>
                    </div>
                  </td>
                </tr>
              ) : apps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-[#54656f]">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-[#f0f2f5] text-[#8696a0] flex items-center justify-center text-xl">
                        🔍
                      </div>
                      <span className="font-headline font-bold text-base text-[#111b21]">
                        Tidak ada aplikasi yang ditemukan
                      </span>
                      <p className="text-xs text-[#8696a0]">
                        Coba sesuaikan kata kunci pencarian atau ubah filter kategori Anda.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setFilterCategory('all');
                          setCurrentPage(1);
                        }}
                        className="mt-1 px-4 py-1.5 rounded-xl bg-[#e6f7ef] text-[#075e54] text-xs font-bold font-headline cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-[#fbfcfc] transition-colors group"
                  >
                    {/* Kolom 1: Icon */}
                    <td className="py-3.5 px-5 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-[#e1e7eb] p-2 flex items-center justify-center shadow-xs mx-auto group-hover:scale-105 transition-transform overflow-hidden">
                        {app.iconPath?.startsWith('data:') || app.iconPath?.startsWith('blob:') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={app.iconPath}
                            alt={app.title}
                            className="w-full h-full object-contain filter drop-shadow-sm"
                          />
                        ) : (
                          <LocalIconImage
                            iconPath={app.iconPath}
                            altOverride={app.title}
                            className="w-full h-full object-contain filter drop-shadow-sm"
                          />
                        )}
                      </div>
                    </td>

                    {/* Kolom 2: Nama */}
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col min-w-0 pr-4">
                        <span className="font-headline font-extrabold text-sm sm:text-[15px] text-[#111b21] group-hover:text-[#075e54] transition-colors">
                          {app.title}
                        </span>
                        <p className="text-xs text-[#54656f] line-clamp-1 mt-0.5 font-body">
                          {app.description.replace(/\*/g, '')}
                        </p>
                        <a
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-[#075e54] hover:underline mt-0.5 truncate max-w-md inline-flex items-center gap-1"
                        >
                          <span>{app.url}</span>
                          <span className="text-[10px]">&rarr;</span>
                        </a>
                      </div>
                    </td>

                    {/* Kolom 3: Kategori */}
                    <td className="py-3.5 px-5 text-center">
                      {app.category === 'pemerintahan' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-headline font-bold bg-[#e6f7ef] text-[#075e54] border border-[#bce8d4]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#25d366]" />
                          Pemerintahan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-headline font-bold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                          Swasta
                        </span>
                      )}
                    </td>

                    {/* Kolom 4: Aksi (Edit & Hapus Berdampingan) */}
                    <td className="py-3.5 px-5 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        {/* Tombol Edit */}
                        <button
                          type="button"
                          id={`btnEdit-${app.id}`}
                          onClick={() => handleOpenEdit(app)}
                          title="Edit Aplikasi"
                          className="px-3 py-1.5 rounded-xl bg-[#f0f2f5] hover:bg-[#e4e8eb] text-[#075e54] text-xs font-headline font-bold border border-[#d1d7db] transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span>Edit</span>
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          type="button"
                          id={`btnHapus-${app.id}`}
                          onClick={() => setAppToDelete(app)}
                          title="Hapus Aplikasi"
                          className="px-3 py-1.5 rounded-xl bg-[#fee2e2]/60 hover:bg-[#fee2e2] text-[#991b1b] text-xs font-headline font-bold border border-[#fca5a5]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. PAGINATION */}
        {!isLoading && totalItems > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#e9edf0] bg-[#fbfcfc] flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Info Halaman */}
            <span className="text-xs sm:text-sm text-[#54656f]">
              Menampilkan <span className="font-bold text-[#111b21]">{startIndex}</span>–
              <span className="font-bold text-[#111b21]">{endIndex}</span> dari{' '}
              <span className="font-bold text-[#075e54]">{totalItems}</span> aplikasi
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 font-headline text-xs font-bold">
              {/* Tombol Prev */}
              <button
                type="button"
                id="btnPrevPage"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isLoading}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#d8e0e5] text-[#54656f] hover:text-[#075e54] hover:bg-[#f0f2f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
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
                id="btnNextPage"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#d8e0e5] text-[#54656f] hover:text-[#075e54] hover:bg-[#f0f2f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Selanjutnya &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH / EDIT APLIKASI */}
      <AppFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={selectedApp}
      />

      {/* MODAL DIALOG KONFIRMASI HAPUS */}
      {appToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#075e54]/30 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[24px] border border-[#d8e0e5] p-6 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.18)] flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#fee2e2] text-[#dc2626] flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-headline font-extrabold text-lg text-[#111b21]">
                  Konfirmasi Hapus Aplikasi
                </h3>
                <span className="text-xs text-[#54656f]">Tindakan ini tidak dapat dibatalkan</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#54656f] leading-relaxed">
              Apakah Anda yakin ingin menghapus aplikasi{' '}
              <strong className="text-[#111b21]">{appToDelete.title}</strong> dari katalog ekosistem?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e9edf0]">
              <button
                type="button"
                onClick={() => setAppToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-[#f0f2f5] hover:bg-[#e4e8eb] text-[#54656f] font-headline text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                id="btnConfirmDelete"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-headline text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus Aplikasi</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
