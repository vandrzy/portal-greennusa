'use client';

import { useState, useEffect, useCallback } from 'react';
import { EcosystemApp, PortalContentData } from '@/types';
import { PEMERINTAHAN_APPS, SWASTA_APPS, ECOSYSTEM_APPS } from '@/data/ecosystemApps';

const DEFAULT_PORTAL_CONTENT: PortalContentData = {
  id: 1,
  logoUrl: '/api/assets/logo/logo green.png',
  whatsappLink: 'https://wa.me/6281348039947',
  requestDemoBadge: 'Layanan Utama',
  requestDemoTitle: 'Request Live Demo & Konsultasi',
  requestDemoDesc:
    'Jadwalkan sesi demo interaktif bersama konsultan IT GreenNusa Computindo atau uji coba langsung aplikasi Pemerintahan & Solusi Bisnis.',
  requestDemoFeatures: [
    'Akses sandbox penuh ke seluruh modul aplikasi',
    'Konsultasi arsitektur sistem & integrasi API',
    'Dukungan penuh untuk iOS, Android & Web Cloud',
    'Estimasi pengembangan & implementasi transparan',
  ],
  buatWebsiteBadge: 'Web Development',
  buatWebsiteTitle: 'Jasa Pembuatan Website & Portal Instansi',
  buatWebsiteDesc:
    'Bangun portal pemerintahan, website korporasi, hingga web app interaktif 3D dengan performa tinggi, keamanan berlapis, dan desain modern.',
  buatWebsiteFeatures: [
    'Desain UI/UX eksklusif & responsif di semua perangkat',
    'Optimasi kecepatan, keamanan SSL & standar SEO',
    'CMS kustom yang mudah dikelola tim internal',
    'Garansi pemeliharaan & dukungan teknis berkala',
  ],
  buatAplikasiBadge: 'Custom Software',
  buatAplikasiTitle: 'Pengembangan Aplikasi iOS, Android & ERP',
  buatAplikasiDesc:
    'Kembangkan aplikasi mobile (Apple iOS & Android) serta sistem informasi manajemen terintegrasi sesuai proses bisnis organisasi Anda.',
  buatAplikasiFeatures: [
    'Aplikasi Native / Hybrid untuk Apple iOS & Android',
    'Integrasi database cloud, pembayaran & GIS spasial',
    'Arsitektur scalable untuk ribuan pengguna serentak',
    'Dokumentasi teknis & pelatihan pengguna lengkap',
  ],
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
          const d = contentJson.data;
          setPortalContent({
            id: d.id || DEFAULT_PORTAL_CONTENT.id,
            logoUrl: d.logoUrl || DEFAULT_PORTAL_CONTENT.logoUrl,
            whatsappLink: d.whatsappLink || DEFAULT_PORTAL_CONTENT.whatsappLink,

            requestDemoBadge: d.requestDemoBadge || DEFAULT_PORTAL_CONTENT.requestDemoBadge,
            requestDemoTitle: d.requestDemoTitle || DEFAULT_PORTAL_CONTENT.requestDemoTitle,
            requestDemoDesc: d.requestDemoDesc || DEFAULT_PORTAL_CONTENT.requestDemoDesc,
            requestDemoFeatures:
              Array.isArray(d.requestDemoFeatures) && d.requestDemoFeatures.length > 0
                ? d.requestDemoFeatures
                : DEFAULT_PORTAL_CONTENT.requestDemoFeatures,

            buatWebsiteBadge: d.buatWebsiteBadge || DEFAULT_PORTAL_CONTENT.buatWebsiteBadge,
            buatWebsiteTitle: d.buatWebsiteTitle || DEFAULT_PORTAL_CONTENT.buatWebsiteTitle,
            buatWebsiteDesc: d.buatWebsiteDesc || DEFAULT_PORTAL_CONTENT.buatWebsiteDesc,
            buatWebsiteFeatures:
              Array.isArray(d.buatWebsiteFeatures) && d.buatWebsiteFeatures.length > 0
                ? d.buatWebsiteFeatures
                : DEFAULT_PORTAL_CONTENT.buatWebsiteFeatures,

            buatAplikasiBadge: d.buatAplikasiBadge || DEFAULT_PORTAL_CONTENT.buatAplikasiBadge,
            buatAplikasiTitle: d.buatAplikasiTitle || DEFAULT_PORTAL_CONTENT.buatAplikasiTitle,
            buatAplikasiDesc: d.buatAplikasiDesc || DEFAULT_PORTAL_CONTENT.buatAplikasiDesc,
            buatAplikasiFeatures:
              Array.isArray(d.buatAplikasiFeatures) && d.buatAplikasiFeatures.length > 0
                ? d.buatAplikasiFeatures
                : DEFAULT_PORTAL_CONTENT.buatAplikasiFeatures,
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
