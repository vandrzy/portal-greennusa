import React from 'react';

export interface CorporateFooterProps {
  paragraphText?: string;
}

export const CorporateFooter: React.FC<CorporateFooterProps> = ({
  paragraphText,
}) => {
  const defaultText =
    'Portal ini merupakan pusat integrasi seluruh layanan digital dan aplikasi ekosistem resmi GreenNusa Computindo guna mendukung efisiensi serta kemudahan akses solusi teknologi bagi instansi pemerintahan dan sektor swasta.';

  return (
    <footer className="relative z-10 w-full bottom-0 mt-auto">
      <div className="w-full max-w-4xl mx-auto px-6 lg:px-12 py-10 flex flex-col justify-center items-center text-center gap-3">
        <p className="font-body text-sm text-[#54656f] leading-relaxed max-w-3xl">
          {paragraphText || defaultText}
        </p>
        <div className="flex items-center gap-3">
          <span className="font-headline text-xs text-[#8696a0] tracking-wider font-semibold">
            2026
          </span>
        </div>
      </div>
    </footer>
  );
};

export default CorporateFooter;
