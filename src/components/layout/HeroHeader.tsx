/* eslint-disable @next/next/no-img-element */
import React from 'react';

export interface HeroHeaderProps {
  logoUrl?: string;
  headerText?: string;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  logoUrl = '/assets/logo/logo-green.png',
  headerText = 'Satu Pintu Akses Aplikasi GreenNusa Computindo',
}) => {
  const displayText = headerText || 'Satu Pintu Akses Aplikasi GreenNusa Computindo';

  return (
    <header className="text-center mt-10 mb-8 max-w-3xl mx-auto flex flex-col items-center">
      {/* Brand Logo */}
      <img
        src={logoUrl || '/assets/logo/logo-green.png'}
        alt="Logo Portal GreenNusa"
        className="h-[110px] w-auto object-contain mb-4"
      />
      <h1 className="font-headline text-[30px] sm:text-[34px] leading-[38px] sm:leading-[42px] font-extrabold text-[#111b21] tracking-tight">
        {displayText.includes('GreenNusa Computindo') ? (
          <>
            {displayText.split('GreenNusa Computindo')[0]}
            <span className="text-[#075e54]">GreenNusa Computindo</span>
            {displayText.split('GreenNusa Computindo')[1]}
          </>
        ) : (
          displayText
        )}
      </h1>
    </header>
  );
};

export default HeroHeader;

