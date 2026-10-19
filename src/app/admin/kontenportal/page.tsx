'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminKontenPortalPage() {
  const router = useRouter();

  // State Management terhubung ke Backend API (/api/kontenportal)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savedLogoUrl, setSavedLogoUrl] = useState<string>('/assets/logo/logo-green.png');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [headerText, setHeaderText] = useState<string>('');
  const [paragraphText, setParagraphText] = useState<string>('');
  const [folder1Title, setFolder1Title] = useState<string>('');
  const [folder1Subtitle, setFolder1Subtitle] = useState<string>('');
  const [folder2Title, setFolder2Title] = useState<string>('');
  const [folder2Subtitle, setFolder2Subtitle] = useState<string>('');
  const [whatsappLink, setWhatsappLink] = useState<string>('');

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch data konten portal saat halaman pertama kali dimuat
  useEffect(() => {
    let isMounted = true;

    async function loadPortalContent() {
      setIsLoading(true);
      setErrorMessage(null);
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
            setHeaderText(data.headerText || '');
            setParagraphText(data.paragraphText || '');
            setFolder1Title(data.folder1Title || '');
            setFolder1Subtitle(data.folder1Subtitle || '');
            setFolder2Title(data.folder2Title || '');
            setFolder2Subtitle(data.folder2Subtitle || '');
            setWhatsappLink(data.whatsappLink || '');
          }
        } else {
          const json = await res.json().catch(() => null);
          if (isMounted && json?.message) {
            setErrorMessage(json.message);
          }
        }
      } catch (err: any) {
        console.error('Gagal mengambil konten portal dari API:', err);
        if (isMounted) {
          setErrorMessage('Gagal menghubungi server untuk memuat data konten portal');
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
  }, [router]);

  // Handle Logo Upload with local preview
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  // Handle Cancel / Reset Logo back to currently saved logo
  const handleResetLogo = () => {
    setLogoFile(null);
    setLogoPreview(savedLogoUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 2. Handle Form Submit (Simpan ke Backend API PUT /api/kontenportal)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('headerText', headerText);
      formData.append('paragraphText', paragraphText);
      formData.append('folder1Title', folder1Title);
      formData.append('folder1Subtitle', folder1Subtitle);
      formData.append('folder2Title', folder2Title);
      formData.append('folder2Subtitle', folder2Subtitle);
      formData.append('whatsappLink', whatsappLink);

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await fetch('/api/kontenportal', {
        method: 'PUT',
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
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3500);
      } else {
        setErrorMessage(json.message || 'Gagal menyimpan perubahan konten portal');
      }
    } catch (err: any) {
      console.error('Error saat menyimpan konten portal:', err);
      setErrorMessage(err?.message || 'Terjadi kesalahan jaringan saat menyimpan konten portal');
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
    <div className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto flex flex-col gap-6 pb-16">
      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e1e7eb]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6f7ef] border border-[#bce8d4] text-[#075e54] text-xs font-headline font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#25d366]" />
            Kustomisasi Tampilan Publik
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#111b21] tracking-tight">
            Manajemen Konten Portal
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#54656f] mt-1 max-w-2xl">
            Atur logo, teks header, teks bagian depan folder kategori, paragraf footer, dan tautan WhatsApp pada portal utama.
          </p>
        </div>
      </div>

      {/* NOTIFIKASI ERROR JIKA ADA */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 shadow-sm animate-fade-in transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 font-bold">
            !
          </div>
          <div className="flex-1 text-sm font-headline font-semibold">
            {errorMessage}
          </div>
        </div>
      )}

      {/* NOTIFIKASI SUKSES (Banner Muncul Saat Simpan Berhasil) */}
      {saveSuccess && (
        <div
          role="alert"
          className="flex items-center gap-3 p-4 rounded-2xl bg-[#e6f7ef] border border-[#25d366] text-[#075e54] shadow-sm animate-fade-in transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-[#25d366] text-white flex items-center justify-center shrink-0 font-bold">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 text-sm font-headline font-semibold">
            Perubahan konten portal berhasil disimpan! (Tersimpan pada konfigurasi aktif)
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* KOMPONEN 1: FORM GANTI LOGO + LIVE PREVIEW LOGO */}
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
                  className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-headline font-semibold transition-all mt-1"
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

        {/* KOMPONEN 2: FORM GANTI TULISAN HEADER */}
        <section className="bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#e9edf0]">
            <div className="w-8 h-8 rounded-xl bg-[#e6f7ef] text-[#075e54] flex items-center justify-center font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-lg text-[#111b21]">Tulisan Header Utama</h2>
              <p className="text-xs text-[#54656f]">Teks judul besar yang terletak tepat di bawah logo pada bagian atas portal.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="headerTextInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
              Teks Judul Portal <span className="text-red-500">*</span>
            </label>
            <input
              id="headerTextInput"
              type="text"
              required
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="Masukkan tulisan header utama..."
              className="w-full px-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-headline text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all"
            />
            <p className="text-[11.5px] text-[#54656f]">
              Contoh: Satu Pintu Akses Aplikasi GreenNusa Computindo
            </p>
          </div>
        </section>

        {/* KOMPONEN 3: FORM UNTUK MENGGANTI PARAGRAF FOOTER */}
        <section className="bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#e9edf0]">
            <div className="w-8 h-8 rounded-xl bg-[#e6f7ef] text-[#075e54] flex items-center justify-center font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-lg text-[#111b21]">Paragraf Footer Portal</h2>
              <p className="text-xs text-[#54656f]">Paragraf pengantar dan keterangan ekosistem aplikasi yang tampil di bagian footer portal.</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="paragraphTextInput" className="text-xs font-headline font-bold text-[#111b21] uppercase tracking-wider">
              Isi Paragraf Footer <span className="text-red-500">*</span>
            </label>
            <textarea
              id="paragraphTextInput"
              required
              rows={4}
              value={paragraphText}
              onChange={(e) => setParagraphText(e.target.value)}
              placeholder="Masukkan paragraf deskripsi footer portal..."
              className="w-full px-4 py-3 rounded-xl border border-[#d8e0e5] bg-white text-sm font-body text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-[#075e54] transition-all leading-relaxed"
            />
            <p className="text-[11.5px] text-[#54656f]">
              Teks ini ditampilkan pada bagian bawah (footer) portal di bawah kartu ekosistem aplikasi.
            </p>
          </div>
        </section>

        {/* KOMPONEN 4: 2 FORM UNTUK MENGGANTI TULISAN BAGIAN DEPAN FOLDER (MASING-MASING 2 INPUT) */}
        <section className="bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-3 border-b border-[#e9edf0]">
            <div className="w-8 h-8 rounded-xl bg-[#e6f7ef] text-[#075e54] flex items-center justify-center font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-headline font-extrabold text-lg text-[#111b21]">Tulisan Bagian Depan Folder Kategori</h2>
              <p className="text-xs text-[#54656f]">
                Atur 2 teks (Judul dan Sub-judul/Label atas) pada kantong depan masing-masing folder interaktif.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD FORM FOLDER 1 (PEMERINTAHAN) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#075e54]" />
                  <h3 className="font-headline font-extrabold text-sm sm:text-base text-[#111b21]">
                    Folder 1: Pemerintahan
                  </h3>
                </div>
                <span className="text-[10.5px] font-headline font-bold uppercase tracking-wider text-[#075e54] bg-[#e6f7ef] px-2.5 py-0.5 rounded-full">
                  Kategori 1
                </span>
              </div>

              {/* Input 1: Judul Utama Folder 1 */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="folder1TitleInput" className="text-xs font-headline font-bold text-[#111b21]">
                  Input 1: Judul / Label Utama Folder 1 <span className="text-red-500">*</span>
                </label>
                <input
                  id="folder1TitleInput"
                  type="text"
                  required
                  value={folder1Title}
                  onChange={(e) => setFolder1Title(e.target.value)}
                  placeholder="Contoh: Pemerintahan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-sm font-headline text-[#111b21] focus:outline-none focus:ring-2 focus:ring-[#075e54] transition-all"
                />
                <p className="text-[11px] text-[#64748b]">Teks besar di bagian depan kartu folder 1.</p>
              </div>

              {/* Input 2: Sub-judul / Keterangan Folder 1 */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="folder1SubtitleInput" className="text-xs font-headline font-bold text-[#111b21]">
                  Input 2: Sub-judul / Label Atas Folder 1 <span className="text-red-500">*</span>
                </label>
                <input
                  id="folder1SubtitleInput"
                  type="text"
                  required
                  value={folder1Subtitle}
                  onChange={(e) => setFolder1Subtitle(e.target.value)}
                  placeholder="Contoh: EKOSISTEM APLIKASI"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-sm font-headline text-[#111b21] focus:outline-none focus:ring-2 focus:ring-[#075e54] transition-all"
                />
                <p className="text-[11px] text-[#64748b]">Label kecil huruf kapital di atas judul folder 1.</p>
              </div>
            </div>

            {/* CARD FORM FOLDER 2 (SWASTA) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#128c7e]" />
                  <h3 className="font-headline font-extrabold text-sm sm:text-base text-[#111b21]">
                    Folder 2: Swasta
                  </h3>
                </div>
                <span className="text-[10.5px] font-headline font-bold uppercase tracking-wider text-[#128c7e] bg-[#e6f7ef] px-2.5 py-0.5 rounded-full">
                  Kategori 2
                </span>
              </div>

              {/* Input 1: Judul Utama Folder 2 */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="folder2TitleInput" className="text-xs font-headline font-bold text-[#111b21]">
                  Input 1: Judul / Label Utama Folder 2 <span className="text-red-500">*</span>
                </label>
                <input
                  id="folder2TitleInput"
                  type="text"
                  required
                  value={folder2Title}
                  onChange={(e) => setFolder2Title(e.target.value)}
                  placeholder="Contoh: Swasta"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-sm font-headline text-[#111b21] focus:outline-none focus:ring-2 focus:ring-[#075e54] transition-all"
                />
                <p className="text-[11px] text-[#64748b]">Teks besar di bagian depan kartu folder 2.</p>
              </div>

              {/* Input 2: Sub-judul / Keterangan Folder 2 */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="folder2SubtitleInput" className="text-xs font-headline font-bold text-[#111b21]">
                  Input 2: Sub-judul / Label Atas Folder 2 <span className="text-red-500">*</span>
                </label>
                <input
                  id="folder2SubtitleInput"
                  type="text"
                  required
                  value={folder2Subtitle}
                  onChange={(e) => setFolder2Subtitle(e.target.value)}
                  placeholder="Contoh: EKOSISTEM APLIKASI"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cbd5e1] bg-white text-sm font-headline text-[#111b21] focus:outline-none focus:ring-2 focus:ring-[#075e54] transition-all"
                />
                <p className="text-[11px] text-[#64748b]">Label kecil huruf kapital di atas judul folder 2.</p>
              </div>
            </div>
          </div>
        </section>

        {/* KOMPONEN 5: FORM UNTUK MENGGANTI LINK WHATSAPP PADA FLOATING ICON WHATSAPP */}
        <section className="bg-white rounded-[24px] border border-[#d8e0e5] p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#e9edf0]">
            <div className="w-8 h-8 rounded-xl bg-[#e6f7ef] text-[#25d366] flex items-center justify-center font-bold">
              {/* WhatsApp Icon */}
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

        {/* KOMPONEN 6: BUTTON SIMPAN */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#d8e0e5]">
          <p className="text-xs text-[#54656f]">
            Pastikan seluruh data yang dimasukkan sudah sesuai sebelum menekan tombol simpan.
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
