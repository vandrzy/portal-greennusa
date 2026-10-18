/* eslint-disable @next/next/no-img-element */
import React from 'react';

export const HeroHeader: React.FC = () => {
  return (
    <header className="text-center mt-10 mb-8 max-w-3xl mx-auto flex flex-col items-center">
      {/* Brand Logo */}
      <img
        src="/assets/logo/logo green.png"
        alt="GreenNusa Computindo"
        className="h-[110px] w-auto object-contain mb-4"
      />
      <h1 className="font-headline text-[30px] sm:text-[34px] leading-[38px] sm:leading-[42px] font-extrabold text-[#111b21] tracking-tight">
        Satu Pintu Akses Aplikasi <span className="text-[#075e54]">GreenNusa Computindo</span>
      </h1>
    </header>
  );
};

export default HeroHeader;
