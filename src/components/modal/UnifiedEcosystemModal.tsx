'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CategoryType, EcosystemAppItem } from '../../types';
import { PEMERINTAHAN_APPS, SWASTA_APPS } from '../../data';
import { AppLaunchCard } from './AppLaunchCard';
import { AppCardSkeleton } from './AppCardSkeleton';
import { LocalIconImage } from '../common/LocalIconImage';
import { useModalScrollLock, useEscapeKey } from '@/hooks';

const renderFormattedText = (text: string) => {
  if (!text || !text.includes('*')) return text;
  return text.split(/(\*[^*]+\*)/g).map((chunk, index) => {
    if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length >= 2) {
      return (
        <em key={index} className="italic font-medium text-[#111b21]">
          {chunk.slice(1, -1)}
        </em>
      );
    }
    return chunk;
  });
};

const getFallbackApps = (
  category: CategoryType,
  pageNum: number,
  pageSize: number = 9,
  customApps?: EcosystemAppItem[]
) => {
  const source =
    customApps && customApps.length > 0
      ? customApps
      : category === 'pemerintahan'
      ? PEMERINTAHAN_APPS
      : SWASTA_APPS;
  const allCategoryApps = source.filter((a) => a.category === category);
  const start = (pageNum - 1) * pageSize;
  const end = start + pageSize;
  const slice = allCategoryApps.slice(start, end);
  return {
    apps: slice,
    total: allCategoryApps.length,
    hasMore: end < allCategoryApps.length,
  };
};

export interface UnifiedEcosystemModalProps {
  isOpen: boolean;
  activeCategory: CategoryType;
  apps?: EcosystemAppItem[];
  onSwitchCategory: (category: CategoryType) => void;
  onClose: () => void;
  overlayColor?: string;
}

export const UnifiedEcosystemModal: React.FC<UnifiedEcosystemModalProps> = ({
  isOpen,
  activeCategory,
  apps,
  onSwitchCategory,
  onClose,
  overlayColor,
}) => {
  // Lock body scroll and close on ESC
  useModalScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);

  const modalCardRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef<boolean>(false);

  const [displayedApps, setDisplayedApps] = useState<EcosystemAppItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const [hoveredApp, setHoveredApp] = useState<EcosystemAppItem | null>(null);
  const lastHoveredApp = useRef<EcosystemAppItem | null>(null);

  if (hoveredApp) {
    lastHoveredApp.current = hoveredApp;
  }
  const displayedApp = hoveredApp || lastHoveredApp.current;

  // Fetch paginated apps from /api/apps
  const fetchApps = useCallback(
    async (pageNum: number, category: CategoryType, isFirstPage: boolean) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isFirstPage) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const res = await fetch(`/api/apps?category=${category}&page=${pageNum}&limit=9`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setDisplayedApps((prev) => (isFirstPage ? json.data : [...prev, ...json.data]));
            setPage(pageNum);
            setHasMore(Boolean(json.pagination?.hasMore));
            if (typeof json.pagination?.total === 'number') {
              setTotalCount(json.pagination.total);
            }
            return;
          }
        }

        // Fallback jika API gagal
        const fallback = getFallbackApps(category, pageNum, 9, apps);
        setDisplayedApps((prev) => (isFirstPage ? fallback.apps : [...prev, ...fallback.apps]));
        setPage(pageNum);
        setHasMore(fallback.hasMore);
        setTotalCount(fallback.total);
      } catch (error) {
        console.error('Gagal mengambil data aplikasi paginated:', error);
        const fallback = getFallbackApps(category, pageNum, 9, apps);
        setDisplayedApps((prev) => (isFirstPage ? fallback.apps : [...prev, ...fallback.apps]));
        setPage(pageNum);
        setHasMore(fallback.hasMore);
        setTotalCount(fallback.total);
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [apps]
  );

  // Load page 1 whenever modal opens or category switches
  useEffect(() => {
    if (isOpen) {
      setDisplayedApps([]);
      setPage(1);
      setHasMore(true);
      setTotalCount(null);
      setHoveredApp(null);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      fetchApps(1, activeCategory, true);
    } else {
      setHoveredApp(null);
    }
  }, [isOpen, activeCategory, fetchApps]);

  // Load next page function
  const loadMore = useCallback(() => {
    if (isFetchingRef.current || !hasMore || isLoading || isLoadingMore) {
      return;
    }
    fetchApps(page + 1, activeCategory, false);
  }, [hasMore, isLoading, isLoadingMore, page, activeCategory, fetchApps]);

  // Setup Intersection Observer on sentinel element
  useEffect(() => {
    if (!isOpen || isLoading || !hasMore) return;

    const sentinel = sentinelRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isFetchingRef.current) {
          loadMore();
        }
      },
      {
        root: scrollContainer,
        rootMargin: '100px',
        threshold: 0.05,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [isOpen, isLoading, hasMore, loadMore]);

  // Failsafe scroll listener
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (distanceToBottom < 120 && hasMore && !isLoading && !isLoadingMore && !isFetchingRef.current) {
      loadMore();
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalCardRef.current && !modalCardRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleCategorySwitch = (category: CategoryType) => {
    if (category === activeCategory) return;
    setHoveredApp(null);
    onSwitchCategory(category);
  };

  const categoryTitle = activeCategory === 'pemerintahan' ? 'Pemerintahan' : 'Swasta';
  const totalDisplay = totalCount !== null ? totalCount : displayedApps.length;
  const badgeText = isLoading
    ? 'Memuat...'
    : activeCategory === 'pemerintahan'
      ? `${totalDisplay} Aplikasi`
      : `${totalDisplay} Solusi Bisnis`;

  return (
    <>
      {/* Backdrop */}
      <div
        id="modalBackdrop"
        aria-hidden="true"
        className={`fixed inset-0 z-[60] backdrop-blur-[8px] transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: overlayColor || 'rgba(7, 94, 84, 0.45)',
        }}
      />

      {/* Modal Dialog Container - Always Centered with Horizontal Overflow Protection */}
      <div
        id="modalContainer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalCategoryTitle"
        onClick={handleContainerClick}
        className={`fixed inset-0 z-[60] overflow-hidden flex items-center justify-center p-3 sm:p-5 lg:p-6 transition-all duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Main Modal Card - Perfectly Centered, Constrained to Viewport Height */}
        <div
          id="modalCard"
          ref={modalCardRef}
          className={`relative w-full max-w-[800px] h-[580px] sm:h-[640px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3.5rem)] bg-white rounded-[24px] border border-[#d8e0e5] shadow-[0_24px_60px_-15px_rgba(7,94,84,0.22)] p-5 sm:p-6 flex flex-col gap-3 sm:gap-4 transform transition-all duration-300 my-auto mx-auto ${
            isOpen ? 'scale-100' : 'scale-95'
          }`}
        >
          {/* MODAL HEADER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#e9edf0] flex-shrink-0">
            {/* Left: Category Meta + Title + Badge */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#e6f7ef] text-[#075e54] flex items-center justify-center flex-shrink-0 shadow-inner">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-1.5V9a3 3 0 0 0-3-3h-3.79l-.7-1.42A3 3 0 0 0 7.82 3H4.5A3 3 0 0 0 1.5 6v12a3 3 0 0 0 3 3h15zm-15-16.5h3.32a1.5 1.5 0 0 1 1.35.84L9.88 6.7A1.5 1.5 0 0 0 11.23 7.5H15a1.5 1.5 0 0 1 1.5 1.5v1.5H4.5a1.5 1.5 0 0 0-1.5 1.5V6a1.5 1.5 0 0 1 1.5-1.5z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline text-[10.5px] font-bold tracking-wider uppercase text-[#075e54]">
                    EKOSISTEM APLIKASI
                  </span>
                  <span
                    id="appCountBadge"
                    className="font-headline px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e6f7ef] text-[#075e54] border border-[#bce8d4]"
                  >
                    {badgeText}
                  </span>
                </div>
                <h2
                  id="modalCategoryTitle"
                  className="font-headline text-xl sm:text-[23px] font-extrabold text-[#111b21] tracking-tight mt-0.5"
                >
                  {categoryTitle}
                </h2>
              </div>
            </div>

            {/* Right: Category Switcher Pill + Close Button */}
            <div className="flex items-center gap-2.5 self-end sm:self-center">
              {/* Tab Switcher */}
              <div className="font-headline inline-flex p-1 bg-[#e9edf0] rounded-full border border-[#d8e0e5] text-xs font-semibold shadow-inner">
                <button
                  type="button"
                  id="tabBtnPemerintahan"
                  onClick={() => handleCategorySwitch('pemerintahan')}
                  className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                    activeCategory === 'pemerintahan'
                      ? 'bg-[#075e54] text-white font-bold shadow-sm'
                      : 'text-[#54656f] hover:text-[#075e54] hover:bg-white/60'
                  }`}
                >
                  Pemerintahan
                </button>
                <button
                  type="button"
                  id="tabBtnSwasta"
                  onClick={() => handleCategorySwitch('swasta')}
                  className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                    activeCategory === 'swasta'
                      ? 'bg-[#075e54] text-white font-bold shadow-sm'
                      : 'text-[#54656f] hover:text-[#075e54] hover:bg-white/60'
                  }`}
                >
                  Swasta
                </button>
              </div>

              {/* Close Modal Button */}
              <button
                type="button"
                id="modalCloseBtn"
                onClick={onClose}
                aria-label="Tutup modal"
                className="w-8 h-8 rounded-full bg-[#f0f2f5] hover:bg-[#e4e8eb] text-[#111b21] hover:text-[#075e54] flex items-center justify-center font-bold text-sm transition-colors border border-[#d1d7db]"
              >
                ✕
              </button>
            </div>
          </div>

          {/* SCROLLABLE MODAL BODY - Scroll hanya terjadi di dalam modal */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1.5 -mr-1 flex flex-col gap-3.5"
          >
            {/* 3x3 CARDS GRID */}
            <div
              id={activeCategory === 'pemerintahan' ? 'gridPemerintahan' : 'gridSwasta'}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-0.5 transition-opacity duration-200"
            >
              {isLoading ? (
                // Initial Load: 9 Skeleton Cards
                Array.from({ length: 9 }).map((_, idx) => (
                  <AppCardSkeleton key={`init-skeleton-${idx}`} />
                ))
              ) : (
                <>
                  {displayedApps.map((app) => (
                    <AppLaunchCard
                      key={app.id}
                      app={app}
                      isHovered={hoveredApp?.id === app.id}
                      onHover={setHoveredApp}
                      onLeave={() => setHoveredApp(null)}
                    />
                  ))}

                  {/* Infinite Scroll: Skeleton Cards while fetching next batch */}
                  {isLoadingMore && (
                    <>
                      {Array.from({
                        length: totalCount
                          ? Math.min(3, Math.max(1, totalCount - displayedApps.length))
                          : 3,
                      }).map((_, idx) => (
                        <AppCardSkeleton key={`more-skeleton-${idx}`} />
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Sentinel for Infinite Scroll Intersection Observer */}
            <div
              ref={sentinelRef}
              className="col-span-full h-2 w-full pointer-events-none opacity-0"
              aria-hidden="true"
            />

            {/* Inline explanation on smaller screens (< 1340px) */}
            <div
              className={`min-[1340px]:hidden overflow-hidden transition-all duration-200 ${
                hoveredApp ? 'max-h-80 opacity-100 pt-1' : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              {hoveredApp && (
                <div className="p-3 rounded-xl bg-[#f7f9fa] border border-[#128c7e]/30 flex flex-col gap-2.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#128c7e] shrink-0" />
                    <span className="font-headline text-[11px] font-bold text-[#075e54] block truncate">
                      {hoveredApp.title}
                    </span>
                  </div>
                  {hoveredApp.appImage && (
                    <div className="w-full h-28 rounded-lg overflow-hidden border border-[#d8e0e5] bg-slate-100">
                      <LocalIconImage
                        src={hoveredApp.appImage}
                        alt={`Gambar ${hoveredApp.title}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="font-body text-[11.5px] leading-snug text-[#3b4a54] line-clamp-2">
                    {renderFormattedText(hoveredApp.description)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MODAL FOOTER NOTE / QUICK STATS */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-[#e9edf0] gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#25d366] flex-shrink-0" />
              <span id="footerNote" className="text-slate-600 font-medium truncate">
                {hoveredApp
                  ? `Aplikasi aktif: ${hoveredApp.title}`
                  : isLoading
                    ? 'Memuat daftar aplikasi...'
                    : isLoadingMore
                      ? 'Memuat aplikasi berikutnya...'
                      : 'GreenNusa Computindo — Solusi Digital Terintegrasi'}
              </span>
            </div>
            <span className="text-slate-400 flex-shrink-0">
              Tekan{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px]">
                ESC
              </kbd>{' '}
              atau klik di luar untuk menutup
            </span>
          </div>

          {/* SISI KANAN MODAL: Penjelasan Aplikasi (Floating Info Card) */}
          <div
            id="modalSideExplanationCard"
            aria-live="polite"
            className={`hidden min-[1340px]:flex flex-col absolute top-0 left-[calc(100%+18px)] w-[320px] xl:w-[330px] ${
              displayedApp?.appImage ? 'h-[520px]' : 'h-[370px]'
            } max-h-[calc(100vh-2rem)] bg-white rounded-[24px] border border-[#d8e0e5] shadow-[0_24px_50px_-12px_rgba(7,94,84,0.22)] p-6 z-50 transition-all duration-200 ${
              hoveredApp
                ? 'opacity-100 translate-x-0 pointer-events-auto'
                : 'opacity-0 -translate-x-3 pointer-events-none'
            }`}
          >
            {displayedApp && (
              <div className="flex flex-col h-full justify-between">
                {/* Header Card Penjelasan */}
                <div className="flex items-center justify-between pb-3 border-b border-[#e9edf0]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#128c7e]" />
                    <span className="font-headline text-[11px] font-bold tracking-wider uppercase text-[#075e54]">
                      Penjelasan Aplikasi
                    </span>
                  </div>
                  <span className="font-headline text-[10.5px] font-bold text-[#128c7e] bg-[#e6f7ef] px-2.5 py-0.5 rounded-full border border-[#bce8d4]">
                    {displayedApp.category === 'pemerintahan' ? 'Pemerintahan' : 'Swasta'}
                  </span>
                </div>

                {/* Identitas Aplikasi */}
                <div className="flex items-center gap-3.5 pt-1">
                  <LocalIconImage
                    src={displayedApp.iconPath}
                    iconPath={displayedApp.iconPath}
                    altOverride={displayedApp.title}
                    className="w-12 h-12 object-contain flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-headline text-[15px] font-extrabold text-[#111b21] leading-snug break-words line-clamp-2">
                      {displayedApp.title}
                    </h4>
                  </div>
                </div>

                {/* Gambar Aplikasi (Tampil di antara Nama Aplikasi dan Deskripsi JIKA ADA) */}
                {displayedApp.appImage && (
                  <div className="my-2.5 w-full h-32 rounded-xl overflow-hidden border border-[#d8e0e5] bg-slate-100 flex-shrink-0">
                    <LocalIconImage
                      src={displayedApp.appImage}
                      alt={`Gambar ${displayedApp.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Box Penjelasan (Ukuran Card Selalu Tetap Sama Walau Teks Pendek) */}
                <div className="flex-1 min-h-[175px] my-2.5 p-3.5 rounded-2xl bg-[#f7f9fa] border border-[#e8ecef] overflow-y-auto custom-scrollbar flex flex-col justify-start">
                  <span className="font-headline text-[10px] font-bold uppercase tracking-wider text-[#8696a0] mb-1.5 block">
                    Deskripsi Aplikasi:
                  </span>
                  <p className="font-body text-[12.5px] leading-relaxed text-[#202c33]">
                    {renderFormattedText(displayedApp.description)}
                  </p>
                </div>

                {/* Footer Card Penjelasan */}
                <div className="pt-2.5 border-t border-[#e9edf0] flex items-center">
                  <span className="text-[11px] text-[#8696a0] font-mono truncate w-full">
                    {displayedApp.url.replace(/^https?:\/\//, '')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UnifiedEcosystemModal;
