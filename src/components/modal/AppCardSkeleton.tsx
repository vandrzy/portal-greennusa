'use client';

import React from 'react';

export const AppCardSkeleton: React.FC = () => {
  return (
    <div
      className="relative group bg-[#f7f9fa] rounded-[20px] p-4 flex flex-col items-center justify-between text-center gap-3 border border-[#e1e7eb] shadow-[0_2px_6px_rgba(0,0,0,0.02)] min-h-[170px]"
      aria-hidden="true"
    >
      {/* Icon Placeholder */}
      <div className="relative flex-shrink-0 flex items-center justify-center mt-1">
        <div className="w-[100px] h-[100px] rounded-[18px] bg-slate-200 animate-pulse" />
      </div>

      {/* App Title Placeholder */}
      <div className="w-full flex-grow flex items-center justify-center min-h-[40px] px-2 flex-col gap-1.5">
        <div className="h-3.5 w-24 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-2.5 w-16 bg-slate-200/70 rounded-full animate-pulse" />
      </div>

      {/* Action Button Placeholder */}
      <div className="w-full pt-1">
        <div className="w-full h-[34px] rounded-full bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
};

export default AppCardSkeleton;
