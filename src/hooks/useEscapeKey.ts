import { useEffect } from 'react';

/**
 * Custom hook to trigger a callback when the Escape key is pressed.
 */
export const useEscapeKey = (callback: () => void, isEnabled: boolean = true): void => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [callback, isEnabled]);
};
