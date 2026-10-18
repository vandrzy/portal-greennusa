'use client';

import { useEffect } from 'react';

/**
 * Custom hook to lock body scroll when a modal is active.
 * Restores original scroll behavior on close or unmount.
 */
export const useModalScrollLock = (isLocked: boolean): void => {
  useEffect(() => {
    if (isLocked) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isLocked]);
};
