'use client';

import { useState, useEffect, useCallback } from 'react';
import { EcosystemApp, PortalContentData } from '@/types';
import { PEMERINTAHAN_APPS, SWASTA_APPS, ECOSYSTEM_APPS } from '@/data/ecosystemApps';

const DEFAULT_PORTAL_CONTENT: PortalContentData = {
  id: 1,
  logoUrl: '/api/assets/logo/logo green.png',
  headerText: 'Satu Pintu Akses Aplikasi GreenNusa Computindo',
  paragraphText:
    'Portal integrasi seluruh layanan digital dan aplikasi ekosistem resmi GreenNusa Computindo guna mendukung efisiensi serta kemudahan akses solusi teknologi bagi instansi pemerintahan dan sektor swasta.',
  folder1Title: 'Pemerintahan & Publik',
  folder1Subtitle: 'EKOSISTEM APLIKASI',
  folder2Title: 'Swasta & Bisnis',
  folder2Subtitle: 'EKOSISTEM APLIKASI',
  whatsappLink: 'https://wa.me/6281348039947',
};

export interface UsePortalEcosystemReturn {
  apps: EcosystemApp[];
  pemerintahanApps: EcosystemApp[];
  swastaApps: EcosystemApp[];
  portalContent: PortalContentData;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePortalEcosystem(): UsePortalEcosystemReturn {
  const [apps, setApps] = useState<EcosystemApp[]>(ECOSYSTEM_APPS);
  const [pemerintahanApps, setPemerintahanApps] = useState<EcosystemApp[]>(PEMERINTAHAN_APPS);
  const [swastaApps, setSwastaApps] = useState<EcosystemApp[]>(SWASTA_APPS);
  const [portalContent, setPortalContent] = useState<PortalContentData>(DEFAULT_PORTAL_CONTENT);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Memanggil /api/apps dan /api/kontenportal secara paralel (TANPA /api/themes/active)
      const [appsRes, contentRes] = await Promise.all([
        fetch('/api/apps', { cache: 'no-store' }).catch(() => null),
        fetch('/api/kontenportal', { cache: 'no-store' }).catch(() => null),
      ]);

      if (appsRes && appsRes.ok) {
        const appsJson = await appsRes.json();
        if (appsJson.success && Array.isArray(appsJson.data) && appsJson.data.length > 0) {
          const loadedApps: EcosystemApp[] = appsJson.data;
          setApps(loadedApps);
          setPemerintahanApps(loadedApps.filter((a) => a.category === 'pemerintahan'));
          setSwastaApps(loadedApps.filter((a) => a.category === 'swasta'));
        }
      }

      if (contentRes && contentRes.ok) {
        const contentJson = await contentRes.json();
        if (contentJson.success && contentJson.data) {
          setPortalContent({
            ...DEFAULT_PORTAL_CONTENT,
            ...contentJson.data,
            logoUrl: contentJson.data.logoUrl || DEFAULT_PORTAL_CONTENT.logoUrl,
          });
        }
      }
    } catch (err: unknown) {
      console.warn('Gagal memuat data portal dari API, menggunakan fallback lokal:', err);
      setError('Gagal memuat data dari server, menggunakan data cadangan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    apps,
    pemerintahanApps,
    swastaApps,
    portalContent,
    isLoading,
    error,
    refresh: fetchData,
  };
}

export default usePortalEcosystem;
