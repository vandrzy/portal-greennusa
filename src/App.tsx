'use client';

import React, { useState, useCallback } from 'react';
import { CategoryType } from './types';
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

  // Lock body scroll when modal is open
  useModalScrollLock(isModalOpen);

  // Handle Escape key to close open modal
  useEscapeKey(handleCloseModal, isModalOpen);

  return (
    <div className="bg-[#f0f2f5] text-[#111b21] antialiased min-h-screen flex flex-col font-body selection:bg-[#e9edf0] selection:text-[#25d366] relative overflow-x-hidden">
      {/* Dynamic Abstract Particles & Glowing Brand Blobs Background */}
      <AbstractParticleBackground />

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
              apps={PEMERINTAHAN_APPS}
              onOpenModal={handleOpenModal}
            />

            {/* FOLDER 2: INTERAKTIF (Kategori: Swasta) */}
            <EcosystemFolderCard
              category="swasta"
              title="Swasta"
              ariaLabel="Buka Ekosistem Aplikasi Swasta"
              apps={SWASTA_APPS}
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
        onSwitchCategory={handleSwitchCategory}
        onClose={handleCloseModal}
      />

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFloatingButton />
    </div>
  );
};

export default App;
