'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

interface ModalFormState {
  badge: string;
  title: string;
  desc: string;
  features: string[];
}

export default function AdminKontenPortalPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Logo & WhatsApp
  const [savedLogoUrl, setSavedLogoUrl] = useState<string>('/assets/logo/logo-green.png');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [whatsappLink, setWhatsappLink] = useState<string>('https://wa.me/6281348039947');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal 1: Request Demo
  const [requestDemo, setRequestDemo] = useState<ModalFormState>({
    badge: 'Layanan Utama',
    title: 'Request Live Demo & Konsultasi',
    desc: 'Jadwalkan sesi demo interaktif bersama konsultan IT GreenNusa Computindo atau uji coba langsung aplikasi Pemerintahan & Solusi Bisnis.',
    features: [
      'Akses sandbox penuh ke seluruh modul aplikasi',
      'Konsultasi arsitektur sistem & integrasi API',
      'Dukungan penuh untuk iOS, Android & Web Cloud',
      'Estimasi pengembangan & implementasi transparan',
    ],
  });

  // Modal 2: Jasa Buat Website
  const [buatWebsite, setBuatWebsite] = useState<ModalFormState>({
    badge: 'Web Development',
    title: 'Jasa Pembuatan Website & Portal Instansi',
    desc: 'Bangun portal pemerintahan, website korporasi, hingga web app interaktif 3D dengan performa tinggi, keamanan berlapis, dan desain modern.',
    features: [
      'Desain UI/UX eksklusif & responsif di semua perangkat',
      'Optimasi kecepatan, keamanan SSL & standar SEO',
      'CMS kustom yang mudah dikelola tim internal',
      'Garansi pemeliharaan & dukungan teknis berkala',
    ],
  });

  // Modal 3: Buat Aplikasi Custom
  const [buatAplikasi, setBuatAplikasi] = useState<ModalFormState>({
    badge: 'Custom Software',
    title: 'Pengembangan Aplikasi iOS, Android & ERP',
    desc: 'Kembangkan aplikasi mobile (Apple iOS & Android) serta sistem informasi manajemen terintegrasi sesuai proses bisnis organisasi Anda.',
    features: [
      'Aplikasi Native / Hybrid untuk Apple iOS & Android',
      'Integrasi database cloud, pembayaran & GIS spasial',
      'Arsitektur scalable untuk ribuan pengguna serentak',
      'Dokumentasi teknis & pelatihan pengguna lengkap',
    ],
  });

  // 1. Fetch data konten portal aktif saat halaman dimuat
  useEffect(() => {
    let isMounted = true;

    async function loadPortalContent() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/kontenportal', { cache: 'no-store' });
        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.data) {
            const data = json.data;
            const activeLogo = data.logoUrl || '/assets/logo/logo-green.png';
            setSavedLogoUrl(activeLogo);
            setLogoPreview(activeLogo);
            setWhatsappLink(data.whatsappLink || 'https://wa.me/6281348039947');

            if (data.requestDemoTitle || data.requestDemoBadge) {
              setRequestDemo({
                badge: data.requestDemoBadge || 'Layanan Utama',
                title: data.requestDemoTitle || 'Request Live Demo & Konsultasi',
                desc:
                  data.requestDemoDesc ||
                  'Jadwalkan sesi demo interaktif bersama konsultan IT GreenNusa Computindo atau uji coba langsung aplikasi Pemerintahan & Solusi Bisnis.',
                features:
                  Array.isArray(data.requestDemoFeatures) && data.requestDemoFeatures.length > 0
                    ? data.requestDemoFeatures.slice(0, 4)
                    : [
                        'Akses sandbox penuh ke seluruh modul aplikasi',
                        'Konsultasi arsitektur sistem & integrasi API',
                        'Dukungan penuh untuk iOS, Android & Web Cloud',
                        'Estimasi pengembangan & implementasi transparan',
                      ],
              });
            }

            if (data.buatWebsiteTitle || data.buatWebsiteBadge) {
              setBuatWebsite({
                badge: data.buatWebsiteBadge || 'Web Development',
                title: data.buatWebsiteTitle || 'Jasa Pembuatan Website & Portal Instansi',
                desc:
                  data.buatWebsiteDesc ||
                  'Bangun portal pemerintahan, website korporasi, hingga web app interaktif 3D dengan performa tinggi, keamanan berlapis, dan desain modern.',
                features:
                  Array.isArray(data.buatWebsiteFeatures) && data.buatWebsiteFeatures.length > 0
                    ? data.buatWebsiteFeatures.slice(0, 4)
                    : [
                        'Desain UI/UX eksklusif & responsif di semua perangkat',
                        'Optimasi kecepatan, keamanan SSL & standar SEO',
                        'CMS kustom yang mudah dikelola tim internal',
                        'Garansi pemeliharaan & dukungan teknis berkala',
                      ],
              });
            }

            if (data.buatAplikasiTitle || data.buatAplikasiBadge) {
              setBuatAplikasi({
                badge: data.buatAplikasiBadge || 'Custom Software',
                title: data.buatAplikasiTitle || 'Pengembangan Aplikasi iOS, Android & ERP',
                desc:
                  data.buatAplikasiDesc ||
                  'Kembangkan aplikasi mobile (Apple iOS & Android) serta sistem informasi manajemen terintegrasi sesuai proses bisnis organisasi Anda.',
                features:
                  Array.isArray(data.buatAplikasiFeatures) && data.buatAplikasiFeatures.length > 0
                    ? data.buatAplikasiFeatures.slice(0, 4)
                    : [
                        'Aplikasi Native / Hybrid untuk Apple iOS & Android',
                        'Integrasi database cloud, pembayaran & GIS spasial',
                        'Arsitektur scalable untuk ribuan pengguna serentak',
                        'Dokumentasi teknis & pelatihan pengguna lengkap',
                      ],
              });
            }
          }
        } else {
          const json = await res.json().catch(() => null);
          if (isMounted && json?.message) {
            showToast('error', json.message);
          }
        }
      } catch (err: any) {
        console.error('Gagal mengambil konten portal dari API:', err);
        if (isMounted) {
          showToast('error', 'Gagal menghubungi server untuk memuat data konten portal');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPortalContent();

    return () => {
      isMounted = false;
    };
  }, [router, showToast]);

  // Handle Logo Upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleResetLogo = () => {
    setLogoFile(null);
    setLogoPreview(savedLogoUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper Array Features Handlers
  const handleFeatureChange = (
    setter: React.Dispatch<React.SetStateAction<ModalFormState>>,
    index: number,
    value: string
  ) => {
    setter((prev) => {
      const next = [...prev.features];
      next[index] = value;
      return { ...prev, features: next };
    });
  };

  const handleAddFeature = (
    setter: React.Dispatch<React.SetStateAction<ModalFormState>>
  ) => {
    setter((prev) => {
      if (prev.features.length >= 4) return prev;
      return { ...prev, features: [...prev.features, ''] };
    });
  };

  const handleRemoveFeature = (
    setter: React.Dispatch<React.SetStateAction<ModalFormState>>,
    index: number
  ) => {
    setter((prev) => {
      if (prev.features.length <= 1) {
        return { ...prev, features: [''] };
      }
      return {
        ...prev,
        features: prev.features.filter((_, i) => i !== index),
      };
    });
  };

  // 2. Handle Form Submit (PATCH /api/kontenportal)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi dasar
    if (!whatsappLink.trim()) {
      showToast('error', 'Tautan WhatsApp wajib diisi');
      return;
    }

    if (!requestDemo.title.trim() || !buatWebsite.title.trim() || !buatAplikasi.title.trim()) {
      showToast('error', 'Judul/Header untuk semua modal wajib diisi');
      return;
    }

    // Validasi batas maksimal karakter
    if (requestDemo.badge.length > 20 || buatWebsite.badge.length > 20 || buatAplikasi.badge.length > 20) {
      showToast('error', 'Form Badge maksimal 20 karakter');
      return;
    }

    if (requestDemo.title.length > 45 || buatWebsite.title.length > 45 || buatAplikasi.title.length > 45) {
      showToast('error', 'Form Header / Judul maksimal 45 karakter');
      return;
    }

    if (requestDemo.desc.length > 175 || buatWebsite.desc.length > 175 || buatAplikasi.desc.length > 175) {
      showToast('error', 'Form Paragraf Penjelasan maksimal 175 karakter');
      return;
    }

    const hasOverLimitFeature = [
      ...requestDemo.features,
      ...buatWebsite.features,
      ...buatAplikasi.features,
    ].some((feat) => feat.length > 60);

    if (hasOverLimitFeature) {
      showToast('error', 'Tiap item daftar layanan maksimal 60 karakter');
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('whatsappLink', whatsappLink.trim());

      // Modal 1: Request Demo
      formData.append('requestDemoBadge', requestDemo.badge.trim());
      formData.append('requestDemoTitle', requestDemo.title.trim());
      formData.append('requestDemoDesc', requestDemo.desc.trim());
      formData.append(
        'requestDemoFeatures',
        JSON.stringify(requestDemo.features.map((f) => f.trim()).filter(Boolean).slice(0, 4))
      );

      // Modal 2: Jasa Buat Website
      formData.append('buatWebsiteBadge', buatWebsite.badge.trim());
      formData.append('buatWebsiteTitle', buatWebsite.title.trim());
      formData.append('buatWebsiteDesc', buatWebsite.desc.trim());
      formData.append(
        'buatWebsiteFeatures',
        JSON.stringify(buatWebsite.features.map((f) => f.trim()).filter(Boolean).slice(0, 4))
      );

      // Modal 3: Buat Aplikasi Custom
      formData.append('buatAplikasiBadge', buatAplikasi.badge.trim());
      formData.append('buatAplikasiTitle', buatAplikasi.title.trim());
      formData.append('buatAplikasiDesc', buatAplikasi.desc.trim());
      formData.append(
        'buatAplikasiFeatures',
        JSON.stringify(buatAplikasi.features.map((f) => f.trim()).filter(Boolean).slice(0, 4))
      );

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await fetch('/api/kontenportal', {
        method: 'PATCH',
        body: formData,
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const json = await res.json();
      if (res.ok && json.success) {
        const d = json.data;
        const newLogo = d.logoUrl || savedLogoUrl;
        setSavedLogoUrl(newLogo);
        setLogoPreview(newLogo);
        setLogoFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        showToast('success', 'Perubahan konten portal dan modal berhasil disimpan!');
      } else {
        showToast('error', json.message || 'Gagal menyimpan perubahan konten portal');
      }
    } catch (err: any) {
      console.error('Error saat menyimpan konten portal:', err);
      showToast('error', err?.message || 'Terjadi kesalahan jaringan saat menyimpan konten portal');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-3 border-[#075e54] border-t-transparent rounded-full animate-spin" />
        <span className="font-headline text-sm font-bold text-[#54656f]">
          Memuat konfigurasi konten portal...
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto flex flex-col gap-6 pb-16 font-body">
      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e1e7eb]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6f7ef] border border-[#bce8d4] text-[#075e54] text-xs font-headline font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#25d366]" />
            Kustomisasi Tampilan Publik &amp; Modal
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111b21] tracking-tight">
            Manajemen Konten Portal
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#54656f] mt-1 max-w-2xl">
            Kelola logo portal, link WhatsApp, serta detail informasi modal interaktif (Request Demo, Jasa Buat Website, dan Buat Aplikasi Custom).
          </p>
        </div>
      </div>

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* BAGIAN 1: LOGO PORTAL */}
        <section className="bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-3 border-b border-[#e9edf0]">
            <div className="w-8 h-8 rounded-xl bg-[#e6f7ef] text-[#075e54] flex items-center justify-center font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-lg text-[#111b21]">Logo Portal</h2>
              <p className="text-xs text-[#54656f]">Ganti file gambar logo resmi GreenNusa yang tampil di header portal utama.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Kotak Preview Logo */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-full max-w-sm h-36 rounded-2xl border-2 border-dashed border-[#cbd5e1] bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreview}
                  alt="Preview Logo Portal"
                  className="max-h-24 w-auto object-contain transition-all group-hover:scale-105 duration-200"
                />
              </div>

              {/* Status Badge */}
              {logoFile ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fcd34d] text-xs font-headline font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
                  Preview Logo Baru (Belum Disimpan)
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f7ef] text-[#075e54] border border-[#bce8d4] text-xs font-headline font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#25d366]" />
                  Logo Aktif Saat Ini
                </div>
              )}
            </div>

            {/* Input & Kontrol Upload */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
                Unggah Berkas Logo Baru
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-xs text-[#54656f] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-headline file:font-bold file:bg-[#075e54] file:text-white hover:file:bg-[#064e46] file:cursor-pointer cursor-pointer border border-[#d8e0e5] rounded-xl p-2 bg-[#f0f2f5]/40 focus:outline-none focus:ring-2 focus:ring-[#075e54]"
              />
              <p className="text-[11.5px] text-[#54656f] leading-relaxed">
                Format yang didukung: PNG, SVG, JPG, WEBP. Disarankan menggunakan gambar dengan latar belakang transparan beresolusi tajam.
              </p>

              {logoFile && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-headline font-semibold transition-all mt-1 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Batal / Gunakan Logo Saat Ini</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* BAGIAN 2: MODAL REQUEST DEMO */}
        <section className="bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e9edf0]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#e6f7ef] text-[#075e54] flex items-center justify-center font-bold">
                <i className="fa-solid fa-headset text-sm"></i>
              </div>
              <div>
                <h2 className="font-headline font-extrabold text-lg text-[#111b21]">Modal: Request Demo</h2>
                <p className="text-xs text-[#54656f]">Atur badge, judul, paragraf penjelasan, dan daftar layanan pada kartu/modal Request Demo.</p>
              </div>
            </div>
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#075e54] bg-[#e6f7ef] px-3 py-1 rounded-full border border-[#bce8d4]">
              Service 1
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Form Badge */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="reqDemoBadgeInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
                  Form Badge <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${requestDemo.badge.length >= 20 ? 'text-amber-600 font-bold' : 'text-[#54656f]'}`}>
                  {requestDemo.badge.length}/20
                </span>
              </div>
              <input
                id="reqDemoBadgeInput"
                type="text"
                maxLength={20}
                required
                value={requestDemo.badge}
                onChange={(e) => setRequestDemo((p) => ({ ...p, badge: e.target.value }))}
                placeholder="Contoh: Layanan Utama"
                className="w-full px-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-headline text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all"
              />
            </div>

            {/* Header / Judul */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="reqDemoTitleInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
                  Header / Judul <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${requestDemo.title.length >= 45 ? 'text-amber-600 font-bold' : 'text-[#54656f]'}`}>
                  {requestDemo.title.length}/45
                </span>
              </div>
              <input
                id="reqDemoTitleInput"
                type="text"
                maxLength={45}
                required
                value={requestDemo.title}
                onChange={(e) => setRequestDemo((p) => ({ ...p, title: e.target.value }))}
                placeholder="Contoh: Request Live Demo & Konsultasi"
                className="w-full px-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-headline text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all"
              />
            </div>
          </div>

          {/* Paragraf / Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="reqDemoDescInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
                Paragraf Penjelasan <span className="text-red-500">*</span>
              </label>
              <span className={`text-[11px] font-mono ${requestDemo.desc.length >= 175 ? 'text-amber-600 font-bold' : 'text-[#54656f]'}`}>
                {requestDemo.desc.length}/175
              </span>
            </div>
            <textarea
              id="reqDemoDescInput"
              required
              maxLength={175}
              rows={3}
              value={requestDemo.desc}
              onChange={(e) => setRequestDemo((p) => ({ ...p, desc: e.target.value }))}
              placeholder="Masukkan paragraf penjelasan Request Demo..."
              className="w-full px-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-body text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all leading-relaxed"
            />
          </div>

          {/* Layanan (Array Maksimal 4) */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-[#e9edf0]">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider block">
                  Daftar Layanan / Keunggulan (Maks. 4 Item, maks. 60 karakter/item)
                </label>
                <p className="text-[11.5px] text-[#54656f]">Item poin layanan yang ditampilkan dengan centang hijau pada kartu.</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#075e54] bg-[#e6f7ef] px-2.5 py-0.5 rounded-full">
                {requestDemo.features.length}/4 Item
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {requestDemo.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#e6f7ef] text-[#075e54] text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      maxLength={60}
                      required
                      value={feat}
                      onChange={(e) => handleFeatureChange(setRequestDemo, idx, e.target.value)}
                      placeholder={`Layanan #${idx + 1}`}
                      className="w-full px-3.5 py-2.5 pr-14 rounded-xl border border-[#d8e0e5] bg-white text-sm font-body text-[#111b21] focus:outline-none focus:ring-2 focus:ring-[#075e54]"
                    />
                    <span className={`absolute right-3 text-[10.5px] font-mono pointer-events-none ${feat.length >= 60 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                      {feat.length}/60
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(setRequestDemo, idx)}
                    title="Hapus baris ini"
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              ))}
            </div>

            {requestDemo.features.length < 4 && (
              <button
                type="button"
                onClick={() => handleAddFeature(setRequestDemo)}
                className="self-start inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#e6f7ef] hover:bg-[#d4f2e3] text-[#075e54] text-xs font-headline font-bold transition-all mt-1 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-xs"></i>
                <span>Tambah Layanan ({requestDemo.features.length}/4)</span>
              </button>
            )}
          </div>
        </section>

        {/* BAGIAN 3: MODAL JASA BUAT WEBSITE */}
        <section className="bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e9edf0]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#e6f7ef] text-[#075e54] flex items-center justify-center font-bold">
                <i className="fa-solid fa-code text-sm"></i>
              </div>
              <div>
                <h2 className="font-headline font-extrabold text-lg text-[#111b21]">Modal: Jasa Buat Website</h2>
                <p className="text-xs text-[#54656f]">Atur badge, judul, paragraf penjelasan, dan daftar layanan pada kartu/modal Jasa Buat Website.</p>
              </div>
            </div>
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#075e54] bg-[#e6f7ef] px-3 py-1 rounded-full border border-[#bce8d4]">
              Service 2
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Form Badge */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="buatWebBadgeInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
                  Form Badge <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${buatWebsite.badge.length >= 20 ? 'text-amber-600 font-bold' : 'text-[#54656f]'}`}>
                  {buatWebsite.badge.length}/20
                </span>
              </div>
              <input
                id="buatWebBadgeInput"
                type="text"
                maxLength={20}
                required
                value={buatWebsite.badge}
                onChange={(e) => setBuatWebsite((p) => ({ ...p, badge: e.target.value }))}
                placeholder="Contoh: Web Development"
                className="w-full px-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-headline text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all"
              />
            </div>

            {/* Header / Judul */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="buatWebTitleInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
                  Header / Judul <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${buatWebsite.title.length >= 45 ? 'text-amber-600 font-bold' : 'text-[#54656f]'}`}>
                  {buatWebsite.title.length}/45
                </span>
              </div>
              <input
                id="buatWebTitleInput"
                type="text"
                maxLength={45}
                required
                value={buatWebsite.title}
                onChange={(e) => setBuatWebsite((p) => ({ ...p, title: e.target.value }))}
                placeholder="Contoh: Jasa Pembuatan Website & Portal Instansi"
                className="w-full px-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-headline text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all"
              />
            </div>
          </div>

          {/* Paragraf / Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="buatWebDescInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
                Paragraf Penjelasan <span className="text-red-500">*</span>
              </label>
              <span className={`text-[11px] font-mono ${buatWebsite.desc.length >= 175 ? 'text-amber-600 font-bold' : 'text-[#54656f]'}`}>
                {buatWebsite.desc.length}/175
              </span>
            </div>
            <textarea
              id="buatWebDescInput"
              required
              maxLength={175}
              rows={3}
              value={buatWebsite.desc}
              onChange={(e) => setBuatWebsite((p) => ({ ...p, desc: e.target.value }))}
              placeholder="Masukkan paragraf penjelasan Jasa Buat Website..."
              className="w-full px-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-body text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all leading-relaxed"
            />
          </div>

          {/* Layanan (Array Maksimal 4) */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-[#e9edf0]">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider block">
                  Daftar Layanan / Keunggulan (Maks. 4 Item, maks. 60 karakter/item)
                </label>
                <p className="text-[11.5px] text-[#54656f]">Item poin layanan yang ditampilkan dengan centang hijau pada kartu.</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#075e54] bg-[#e6f7ef] px-2.5 py-0.5 rounded-full">
                {buatWebsite.features.length}/4 Item
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {buatWebsite.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#e6f7ef] text-[#075e54] text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      maxLength={60}
                      required
                      value={feat}
                      onChange={(e) => handleFeatureChange(setBuatWebsite, idx, e.target.value)}
                      placeholder={`Layanan #${idx + 1}`}
                      className="w-full px-3.5 py-2.5 pr-14 rounded-xl border border-[#d8e0e5] bg-white text-sm font-body text-[#111b21] focus:outline-none focus:ring-2 focus:ring-[#075e54]"
                    />
                    <span className={`absolute right-3 text-[10.5px] font-mono pointer-events-none ${feat.length >= 60 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                      {feat.length}/60
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(setBuatWebsite, idx)}
                    title="Hapus baris ini"
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              ))}
            </div>

            {buatWebsite.features.length < 4 && (
              <button
                type="button"
                onClick={() => handleAddFeature(setBuatWebsite)}
                className="self-start inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#e6f7ef] hover:bg-[#d4f2e3] text-[#075e54] text-xs font-headline font-bold transition-all mt-1 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-xs"></i>
                <span>Tambah Layanan ({buatWebsite.features.length}/4)</span>
              </button>
            )}
          </div>
        </section>

        {/* BAGIAN 4: MODAL BUAT APLIKASI CUSTOM */}
        <section className="bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e9edf0]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#e6f7ef] text-[#075e54] flex items-center justify-center font-bold">
                <i className="fa-solid fa-mobile-screen-button text-sm"></i>
              </div>
              <div>
                <h2 className="font-headline font-extrabold text-lg text-[#111b21]">Modal: Buat Aplikasi Custom</h2>
                <p className="text-xs text-[#54656f]">Atur badge, judul, paragraf penjelasan, dan daftar layanan pada kartu/modal Buat Aplikasi Custom.</p>
              </div>
            </div>
            <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-[#075e54] bg-[#e6f7ef] px-3 py-1 rounded-full border border-[#bce8d4]">
              Service 3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Form Badge */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="buatAppBadgeInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
                  Form Badge <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${buatAplikasi.badge.length >= 20 ? 'text-amber-600 font-bold' : 'text-[#54656f]'}`}>
                  {buatAplikasi.badge.length}/20
                </span>
              </div>
              <input
                id="buatAppBadgeInput"
                type="text"
                maxLength={20}
                required
                value={buatAplikasi.badge}
                onChange={(e) => setBuatAplikasi((p) => ({ ...p, badge: e.target.value }))}
                placeholder="Contoh: Custom Software"
                className="w-full px-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-headline text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all"
              />
            </div>

            {/* Header / Judul */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="buatAppTitleInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
                  Header / Judul <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${buatAplikasi.title.length >= 45 ? 'text-amber-600 font-bold' : 'text-[#54656f]'}`}>
                  {buatAplikasi.title.length}/45
                </span>
              </div>
              <input
                id="buatAppTitleInput"
                type="text"
                maxLength={45}
                required
                value={buatAplikasi.title}
                onChange={(e) => setBuatAplikasi((p) => ({ ...p, title: e.target.value }))}
                placeholder="Contoh: Pengembangan Aplikasi iOS, Android & ERP"
                className="w-full px-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-headline text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all"
              />
            </div>
          </div>

          {/* Paragraf / Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="buatAppDescInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
                Paragraf Penjelasan <span className="text-red-500">*</span>
              </label>
              <span className={`text-[11px] font-mono ${buatAplikasi.desc.length >= 175 ? 'text-amber-600 font-bold' : 'text-[#54656f]'}`}>
                {buatAplikasi.desc.length}/175
              </span>
            </div>
            <textarea
              id="buatAppDescInput"
              required
              maxLength={175}
              rows={3}
              value={buatAplikasi.desc}
              onChange={(e) => setBuatAplikasi((p) => ({ ...p, desc: e.target.value }))}
              placeholder="Masukkan paragraf penjelasan Buat Aplikasi Custom..."
              className="w-full px-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-body text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all leading-relaxed"
            />
          </div>

          {/* Layanan (Array Maksimal 4) */}
          <div className="flex flex-col gap-2.5 pt-2 border-t border-[#e9edf0]">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider block">
                  Daftar Layanan / Keunggulan (Maks. 4 Item, maks. 60 karakter/item)
                </label>
                <p className="text-[11.5px] text-[#54656f]">Item poin layanan yang ditampilkan dengan centang hijau pada kartu.</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#075e54] bg-[#e6f7ef] px-2.5 py-0.5 rounded-full">
                {buatAplikasi.features.length}/4 Item
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {buatAplikasi.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#e6f7ef] text-[#075e54] text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      maxLength={60}
                      required
                      value={feat}
                      onChange={(e) => handleFeatureChange(setBuatAplikasi, idx, e.target.value)}
                      placeholder={`Layanan #${idx + 1}`}
                      className="w-full px-3.5 py-2.5 pr-14 rounded-xl border border-[#d8e0e5] bg-white text-sm font-body text-[#111b21] focus:outline-none focus:ring-2 focus:ring-[#075e54]"
                    />
                    <span className={`absolute right-3 text-[10.5px] font-mono pointer-events-none ${feat.length >= 60 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                      {feat.length}/60
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(setBuatAplikasi, idx)}
                    title="Hapus baris ini"
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <i className="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              ))}
            </div>

            {buatAplikasi.features.length < 4 && (
              <button
                type="button"
                onClick={() => handleAddFeature(setBuatAplikasi)}
                className="self-start inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#e6f7ef] hover:bg-[#d4f2e3] text-[#075e54] text-xs font-headline font-bold transition-all mt-1 cursor-pointer"
              >
                <i className="fa-solid fa-plus text-xs"></i>
                <span>Tambah Layanan ({buatAplikasi.features.length}/4)</span>
              </button>
            )}
          </div>
        </section>

        {/* BAGIAN 5: LINK WHATSAPP */}
        <section className="bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#e9edf0]">
            <div className="w-8 h-8 rounded-xl bg-[#e6f7ef] text-[#25d366] flex items-center justify-center font-bold">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-lg text-[#111b21]">Link WhatsApp (Floating Icon)</h2>
              <p className="text-xs text-[#54656f]">Tautan URL tujuan saat pengunjung mengklik tombol mengambang WhatsApp di portal.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="whatsappLinkInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
              Tautan / URL WhatsApp <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#25d366]">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </span>
              <input
                id="whatsappLinkInput"
                type="url"
                required
                value={whatsappLink}
                onChange={(e) => setWhatsappLink(e.target.value)}
                placeholder="https://wa.me/6281348039947"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-headline text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all"
              />
            </div>
            <p className="text-[11.5px] text-[#54656f]">
              Contoh format: <span className="font-semibold text-[#075e54]">https://wa.me/6281348039947</span> — Tautan ini akan dibuka saat pengunjung mengklik tombol WhatsApp mengambang di pojok kanan bawah portal.
            </p>
          </div>
        </section>

        {/* TOMBOL SIMPAN PERUBAHAN */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#d8e0e5]">
          <p className="text-xs text-[#54656f]">
            Pastikan seluruh data yang dimasukkan sudah sesuai sebelum menekan tombol simpan perubahan.
          </p>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#075e54] hover:bg-[#064e46] active:scale-[0.98] text-white font-headline text-sm font-bold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
