'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { EcosystemAppItem } from '@/types';
import { PEMERINTAHAN_APPS, SWASTA_APPS } from '@/data/ecosystemApps';

const STORAGE_KEY = 'greennusa_admin_apps_storage';

interface AdminAppsContextType {
  apps: EcosystemAppItem[];
  isLoading: boolean;
  addApp: (newApp: Omit<EcosystemAppItem, 'id'>) => EcosystemAppItem;
  updateApp: (id: string, updatedFields: Partial<Omit<EcosystemAppItem, 'id'>>) => boolean;
  deleteApp: (id: string) => boolean;
  resetToDefault: () => void;
  pemerintahanCount: number;
  swastaCount: number;
  totalCount: number;
}

const AdminAppsContext = createContext<AdminAppsContextType | undefined>(undefined);

export const AdminAppsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apps, setApps] = useState<EcosystemAppItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize data on client mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApps(parsed);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached apps from localStorage:', e);
    }

    // Fallback: load from static dataset or fetch /api/apps
    async function loadInitial() {
      try {
        const res = await fetch('/api/apps');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setApps(json.data);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
          } catch {}
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch /api/apps, using static data:', err);
      }

      const defaultData = [...PEMERINTAHAN_APPS, ...SWASTA_APPS];
      setApps(defaultData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      } catch {}
    }

    loadInitial().finally(() => setIsLoading(false));
  }, []);

  const saveToStorage = (updatedApps: EcosystemAppItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedApps));
    } catch (e) {
      console.error('Failed to save apps to localStorage:', e);
    }
  };

  const addApp = useCallback((newAppData: Omit<EcosystemAppItem, 'id'>): EcosystemAppItem => {
    const generatedId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdApp: EcosystemAppItem = {
      id: generatedId,
      ...newAppData,
    };

    setApps((prev) => {
      const next = [createdApp, ...prev];
      saveToStorage(next);
      return next;
    });

    return createdApp;
  }, []);

  const updateApp = useCallback(
    (id: string, updatedFields: Partial<Omit<EcosystemAppItem, 'id'>>): boolean => {
      let found = false;
      setApps((prev) => {
        const next = prev.map((item) => {
          if (item.id === id) {
            found = true;
            return { ...item, ...updatedFields };
          }
          return item;
        });
        if (found) {
          saveToStorage(next);
        }
        return next;
      });
      return found;
    },
    []
  );

  const deleteApp = useCallback((id: string): boolean => {
    let found = false;
    setApps((prev) => {
      const next = prev.filter((item) => {
        if (item.id === id) {
          found = true;
          return false;
        }
        return true;
      });
      if (found) {
        saveToStorage(next);
      }
      return next;
    });
    return found;
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultData = [...PEMERINTAHAN_APPS, ...SWASTA_APPS];
    setApps(defaultData);
    saveToStorage(defaultData);
  }, []);

  const pemerintahanCount = useMemo(
    () => apps.filter((a) => a.category === 'pemerintahan').length,
    [apps]
  );

  const swastaCount = useMemo(
    () => apps.filter((a) => a.category === 'swasta').length,
    [apps]
  );

  const totalCount = apps.length;

  return (
    <AdminAppsContext.Provider
      value={{
        apps,
        isLoading,
        addApp,
        updateApp,
        deleteApp,
        resetToDefault,
        pemerintahanCount,
        swastaCount,
        totalCount,
      }}
    >
      {children}
    </AdminAppsContext.Provider>
  );
};

export const useAdminApps = (): AdminAppsContextType => {
  const context = useContext(AdminAppsContext);
  if (!context) {
    throw new Error('useAdminApps must be used within an AdminAppsProvider');
  }
  return context;
};
