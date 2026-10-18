'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EcosystemAppItem, CategoryType } from '@/types';

export interface AppPayload {
  title: string;
  description: string;
  url: string;
  category: CategoryType;
  icon?: File | string | null;
  iconPath?: string;
  iconFile?: File | null;
}

interface AdminAppsContextType {
  apps: EcosystemAppItem[];
  isLoading: boolean;
  pemerintahanCount: number;
  swastaCount: number;
  totalCount: number;
  refreshData: () => Promise<void>;
  addApp: (
    payload: AppPayload | FormData
  ) => Promise<{ success: boolean; message?: string; data?: EcosystemAppItem }>;
  updateApp: (
    id: string,
    payload: Partial<AppPayload> | FormData
  ) => Promise<{ success: boolean; message?: string; data?: EcosystemAppItem }>;
  deleteApp: (id: string) => Promise<{ success: boolean; message?: string }>;
}

const AdminAppsContext = createContext<AdminAppsContextType | undefined>(undefined);

export const AdminAppsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [apps, setApps] = useState<EcosystemAppItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pemerintahanCount, setPemerintahanCount] = useState<number>(0);
  const [swastaCount, setSwastaCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Fetch apps & dashboard metrics from Backend APIs
  const refreshData = useCallback(async () => {
    try {
      const [appsRes, dashRes] = await Promise.all([
        fetch('/api/admin/apps', { cache: 'no-store' }),
        fetch('/api/admin/dashboard', { cache: 'no-store' }),
      ]);

      // Handle unauthenticated session
      if (appsRes.status === 401 || dashRes.status === 401) {
        router.push('/login');
        return;
      }

      if (appsRes.ok) {
        const appsJson = await appsRes.json();
        if (appsJson.success && Array.isArray(appsJson.data)) {
          setApps(appsJson.data);
        }
      }

      if (dashRes.ok) {
        const dashJson = await dashRes.json();
        if (dashJson.success && dashJson.data) {
          setPemerintahanCount(dashJson.data.pemerintahan || 0);
          setSwastaCount(dashJson.data.swasta || 0);
          setTotalCount(dashJson.data.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data from API:', err);
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    refreshData().finally(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [refreshData]);

  // Helper to format payload into FormData
  const toFormData = (payload: AppPayload | Partial<AppPayload> | FormData): FormData => {
    if (payload instanceof FormData) return payload;

    const fd = new FormData();
    if (payload.title) fd.append('title', payload.title);
    if (payload.description) fd.append('description', payload.description);
    if (payload.url) fd.append('url', payload.url);
    if (payload.category) fd.append('category', payload.category);

    const fileToUpload = payload.iconFile || payload.icon;
    if (fileToUpload instanceof File) {
      fd.append('icon', fileToUpload);
    } else if (typeof fileToUpload === 'string' && fileToUpload.startsWith('data:image/')) {
      fd.append('icon', fileToUpload);
    } else if (payload.iconPath) {
      fd.append('icon', payload.iconPath);
    }

    return fd;
  };

  const addApp = useCallback(
    async (payload: AppPayload | FormData) => {
      try {
        const body = toFormData(payload);
        const res = await fetch('/api/admin/apps', {
          method: 'POST',
          body,
        });

        if (res.status === 401) {
          router.push('/login');
          return { success: false, message: 'Sesi telah berakhir. Silakan login kembali.' };
        }

        const json = await res.json();
        if (json.success) {
          await refreshData();
        }
        return json;
      } catch (err) {
        console.error('Error adding app:', err);
        return { success: false, message: 'Gagal menghubungi server saat menambah aplikasi' };
      }
    },
    [refreshData, router]
  );

  const updateApp = useCallback(
    async (id: string, payload: Partial<AppPayload> | FormData) => {
      try {
        const body = toFormData(payload);
        const res = await fetch(`/api/admin/apps/${id}`, {
          method: 'PUT',
          body,
        });

        if (res.status === 401) {
          router.push('/login');
          return { success: false, message: 'Sesi telah berakhir. Silakan login kembali.' };
        }

        const json = await res.json();
        if (json.success) {
          await refreshData();
        }
        return json;
      } catch (err) {
        console.error('Error updating app:', err);
        return { success: false, message: 'Gagal menghubungi server saat memperbarui aplikasi' };
      }
    },
    [refreshData, router]
  );

  const deleteApp = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/admin/apps/${id}`, {
          method: 'DELETE',
        });

        if (res.status === 401) {
          router.push('/login');
          return { success: false, message: 'Sesi telah berakhir. Silakan login kembali.' };
        }

        const json = await res.json();
        if (json.success) {
          await refreshData();
        }
        return json;
      } catch (err) {
        console.error('Error deleting app:', err);
        return { success: false, message: 'Gagal menghubungi server saat menghapus aplikasi' };
      }
    },
    [refreshData, router]
  );

  return (
    <AdminAppsContext.Provider
      value={{
        apps,
        isLoading,
        pemerintahanCount,
        swastaCount,
        totalCount,
        refreshData,
        addApp,
        updateApp,
        deleteApp,
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
