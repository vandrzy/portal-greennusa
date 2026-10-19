'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  appImage?: string | null;
  appImageFile?: File | null;
  removeAppImage?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FetchAppsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: 'all' | CategoryType | string;
}

interface AdminAppsContextType {
  apps: EcosystemAppItem[];
  pagination: PaginationMeta;
  isLoading: boolean;
  pemerintahanCount: number;
  swastaCount: number;
  totalCount: number;
  refreshData: () => Promise<void>;
  fetchApps: (params?: FetchAppsParams) => Promise<void>;
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
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pemerintahanCount, setPemerintahanCount] = useState<number>(0);
  const [swastaCount, setSwastaCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const currentParamsRef = useRef<FetchAppsParams>({
    page: 1,
    limit: 6,
    search: '',
    category: 'all',
  });

  // Fetch apps with query parameters for backend pagination and filtering
  const fetchApps = useCallback(
    async (params?: FetchAppsParams) => {
      setIsLoading(true);
      try {
        const merged: FetchAppsParams = {
          ...currentParamsRef.current,
          ...(params || {}),
        };
        currentParamsRef.current = merged;

        const query = new URLSearchParams();
        if (merged.page) query.set('page', merged.page.toString());
        if (merged.limit) query.set('limit', merged.limit.toString());
        if (merged.category && merged.category !== 'all') {
          query.set('category', merged.category);
        }
        if (merged.search && merged.search.trim()) {
          query.set('search', merged.search.trim());
        }

        const queryString = query.toString();
        const endpoint = queryString ? `/api/admin/apps?${queryString}` : '/api/admin/apps';

        const res = await fetch(endpoint, { cache: 'no-store' });
        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setApps(json.data);
            if (json.pagination) {
              setPagination(json.pagination);
            } else {
              setPagination({
                page: merged.page || 1,
                limit: merged.limit || 6,
                total: json.data.length,
                totalPages: Math.max(1, Math.ceil(json.data.length / (merged.limit || 6))),
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load admin apps from API:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // Fetch dashboard metrics
  const refreshDashboardMetrics = useCallback(async () => {
    try {
      const dashRes = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      if (dashRes.status === 401) {
        router.push('/login');
        return;
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
      console.error('Failed to load dashboard metrics from API:', err);
    }
  }, [router]);

  // Refresh both apps list and metrics
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchApps(currentParamsRef.current),
      refreshDashboardMetrics(),
    ]);
  }, [fetchApps, refreshDashboardMetrics]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchApps(currentParamsRef.current),
      refreshDashboardMetrics(),
    ]).finally(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [fetchApps, refreshDashboardMetrics]);

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

    if (payload.appImageFile instanceof File) {
      fd.append('appImageFile', payload.appImageFile);
    } else if (payload.appImage) {
      fd.append('appImage', payload.appImage);
    }

    if (payload.removeAppImage) {
      fd.append('removeAppImage', 'true');
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
        pagination,
        isLoading,
        pemerintahanCount,
        swastaCount,
        totalCount,
        refreshData,
        fetchApps,
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
