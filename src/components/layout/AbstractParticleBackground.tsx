'use client';

import React from 'react';

export const AbstractParticleBackground: React.FC = () => {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base Gradient Wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0f2f5] via-[#e8ecef] to-[#e2e7eb]" />

      {/* Animated Glowing Brand Mesh Blobs */}
      <div className="blob-float-1 absolute -top-24 -left-20 w-[580px] h-[580px] rounded-full bg-gradient-to-tr from-[#25d366]/20 via-[#075e54]/15 to-[#2fe572]/25 blur-[90px]" />
      <div className="blob-float-2 absolute top-1/4 -right-28 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-[#25d366]/22 via-[#075e54]/18 to-[#05463e]/12 blur-[100px]" />
      <div className="blob-float-3 absolute -bottom-32 left-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#2fe572]/20 via-[#25d366]/15 to-[#d8e0e5]/30 blur-[110px]" />
      <div className="blob-float-4 absolute top-1/2 left-1/3 w-[450px] h-[450px] rounded-full bg-gradient-to-r from-[#f0f2f5]/40 via-[#25d366]/15 to-[#075e54]/10 blur-[80px]" />

      {/* Elegant Floating SVG Abstract Particles */}
      <svg
        className="particle-float-1 absolute top-[12%] left-[8%] w-16 h-16 opacity-40 text-[#25d366]"
        fill="none"
        viewBox="0 0 100 100"
      >
        <circle cx="50" cy="50" r="38" stroke="currentColor" strokeDasharray="6 8" strokeWidth="3" />
        <circle cx="50" cy="50" fill="currentColor" fillOpacity="0.3" r="14" />
      </svg>

      <svg
        className="particle-float-2 absolute top-[22%] right-[12%] w-20 h-20 opacity-35 text-[#075e54]"
        fill="none"
        viewBox="0 0 100 100"
      >
        <polygon points="50,15 85,50 50,85 15,50" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="50" fill="currentColor" r="8" />
      </svg>

      <svg
        className="particle-float-3 absolute bottom-[28%] left-[6%] w-24 h-24 opacity-30 text-[#25d366]"
        fill="none"
        viewBox="0 0 120 120"
      >
        <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="2" />
        <circle cx="60" cy="60" r="28" stroke="currentColor" strokeDasharray="4 6" strokeWidth="1.5" />
        <circle cx="60" cy="60" fill="currentColor" r="6" />
      </svg>

      <svg
        className="particle-float-4 absolute top-[58%] right-[8%] w-16 h-16 opacity-35 text-[#25d366]"
        fill="none"
        viewBox="0 0 80 80"
      >
        <path d="M40 10 V70 M10 40 H70" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
        <circle cx="40" cy="40" r="18" stroke="currentColor" strokeWidth="2" />
      </svg>

      <svg
        className="particle-float-1 absolute bottom-[15%] right-[22%] w-12 h-12 opacity-35 text-[#2fe572]"
        fill="none"
        viewBox="0 0 60 60"
      >
        <circle cx="30" cy="30" fill="currentColor" fillOpacity="0.45" r="18" />
        <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      <svg
        className="particle-float-2 absolute top-[38%] left-[24%] w-10 h-10 opacity-25 text-[#075e54]"
        fill="none"
        viewBox="0 0 50 50"
      >
        <circle cx="25" cy="25" r="12" stroke="currentColor" strokeDasharray="3 3" strokeWidth="2" />
      </svg>

      {/* High-end Frosted Diffusion Overlay */}
      <div className="absolute inset-0 backdrop-blur-[10px] bg-white/40" />
    </div>
  );
};

export default AbstractParticleBackground;
