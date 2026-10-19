'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CategoryType, EcosystemAppItem } from './types';
import { PEMERINTAHAN_APPS, SWASTA_APPS } from './data';
import { useModalScrollLock, useEscapeKey } from './hooks';
import {
  AbstractParticleBackground,
  HeroHeader,
  CorporateFooter,
  EcosystemFolderCard,
  UnifiedEcosystemModal,
  WhatsAppFloatingButton,
} from './components';

export const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('pemerintahan');
  const [apps, setApps] = useState<EcosystemAppItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchApps() {
      try {
        const response = await fetch('/api/apps');
        const result = await response.json();
        if (isMounted && result.success && Array.isArray(result.data)) {
          setApps(result.data);
        }
      } catch (error) {
        console.error('Gagal mengambil data aplikasi:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchApps();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenModal = useCallback((category: CategoryType) => {
    setActiveCategory(category);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSwitchCategory = useCallback((category: CategoryType) => {
    setActiveCategory(category);
  }, []);

  // Filter apps by category with fallback to static apps if loading/empty
  const pemerintahanApps = useMemo(() => {
    const filtered = apps.filter((app) => app.category === 'pemerintahan');
    return filtered.length > 0 ? filtered : PEMERINTAHAN_APPS;
  }, [apps]);

  const swastaApps = useMemo(() => {
    const filtered = apps.filter((app) => app.category === 'swasta');
    return filtered.length > 0 ? filtered : SWASTA_APPS;
  }, [apps]);

  // Lock body scroll when modal is open
  useModalScrollLock(isModalOpen);

  // Handle Escape key to close open modal
  useEscapeKey(handleCloseModal, isModalOpen);

  return (
    <div className="text-[#111b21] antialiased min-h-screen flex flex-col font-body selection:bg-[#e9edf0] selection:text-[#25d366] relative overflow-x-hidden">
      {/* Dynamic Abstract Particles & Glowing Brand Blobs Background with Fixed Theme default.png */}
      <AbstractParticleBackground backgroundImage="/assets/backgroundTheme/default.png" />

      {/* Main Canvas */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col justify-start">
        {/* Hero Section */}
        <HeroHeader />

        {/* Folder Playground */}
        <section className="relative w-full flex flex-col items-center pt-28 sm:pt-36 pb-12 overflow-visible">
          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-end gap-16 lg:gap-24 w-full max-w-6xl overflow-visible">
            {/* FOLDER 1: INTERAKTIF (Kategori: Pemerintahan) */}
            <EcosystemFolderCard
              category="pemerintahan"
              title="Pemerintahan"
              ariaLabel="Buka Ekosistem Aplikasi Pemerintahan"
              apps={pemerintahanApps}
              onOpenModal={handleOpenModal}
            />

            {/* FOLDER 2: INTERAKTIF (Kategori: Swasta) */}
            <EcosystemFolderCard
              category="swasta"
              title="Swasta"
              ariaLabel="Buka Ekosistem Aplikasi Swasta"
              apps={swastaApps}
              onOpenModal={handleOpenModal}
            />
          </div>
        </section>
      </main>

      {/* Corporate Footer */}
      <CorporateFooter />

      {/* Unified Open Modal Component */}
      <UnifiedEcosystemModal
        isOpen={isModalOpen}
        activeCategory={activeCategory}
        apps={apps.length > 0 ? apps : undefined}
        onSwitchCategory={handleSwitchCategory}
        onClose={handleCloseModal}
      />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFloatingButton />
    </div>
  );
};

export default App;
