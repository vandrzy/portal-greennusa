'use client';

import React from 'react';

export interface AbstractParticleBackgroundProps {
  backgroundImage?: string;
}

export const AbstractParticleBackground: React.FC<AbstractParticleBackgroundProps> = ({
  backgroundImage = '/assets/backgroundTheme/default.png',
}) => {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background Gambar Penuh - Memenuhi layar secara vertikal & horizontal dan tetap diam saat scroll */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
        }}
      />
    </div>
  );
};

export default AbstractParticleBackground;
