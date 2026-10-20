# Portal Ekosistem Digital GreenNusa

Aplikasi portal terpusat berbasis **Next.js (App Router)** untuk menampilkan, mengelompokkan, dan mengelola berbagai aplikasi dalam ekosistem digital **PT GreenNusa** (kategori **Pemerintahan / E-Government** dan **Swasta / Enterprise**). Dilengkapi dengan **Panel Admin (CMS)** untuk mengelola daftar aplikasi, konten halaman utama, kontak WhatsApp, serta kustomisasi tema tampilan secara dinamis.

## Daftar Isi

1. [Penjelasan Sistem & Fitur Utama](#1-penjelasan-sistem--fitur-utama)

2. [Teknologi yang Digunakan (Tech Stack)](#2-teknologi-yang-digunakan-tech-stack)

3. [Struktur Direktori Proyek](#3-struktur-direktori-proyek)

4. [Cara Penggunaan & Instalasi Lokal (Development)](#4-cara-penggunaan--instalasi-lokal-development)

5. [Panduan Penggunaan Fitur (User & Admin)](#5-panduan-penggunaan-fitur-user--admin)

6. [Cara Deployment ke VPS (cPanel & Linux Non-Panel)](#6-cara-deployment-ke-vps-cpanel--linux-non-panel)

7. [Troubleshooting Umum](#7-troubleshooting-umum)

## 1. Penjelasan Sistem & Fitur Utama

Sistem ini berfungsi sebagai *Single Entry Point* (gerbang utama) bagi klien, mitra, maupun tim internal untuk mengakses seluruh produk aplikasi yang dikembangkan oleh GreenNusa.

### A. Halaman Publik (Portal Depan)

* **Pengelompokan Ekosistem Interaktif:** Menampilkan kartu folder kategori aplikasi (**Pemerintahan** & **Swasta**) beserta pratinjau ikon aplikasi di dalamnya.

* **Unified Ecosystem Modal:** Jendela modal interaktif dengan fitur pencarian *real-time*, filter kategori, dan kartu peluncur aplikasi (*App Launch Card*) yang mengarahkan pengguna langsung ke URL aplikasi terkait.

* **Tema & Partikel Dinamis:** Mendukung *background image* kustom atau animasi partikel abstrak, kustomisasi warna aksen (*primary/accent color*), dan pengaturan opasitas *overlay* yang dikendalikan dari database.

* **Integrasi Tombol WhatsApp Mengambang (*Floating Button*):** Memudahkan pengunjung menghubungi tim GreenNusa secara langsung dengan nomor dan pesan yang dapat diatur dari halaman admin.

### B. Halaman Administrator (`/admin`)

* **Autentikasi Berbasis JWT Cookie:** Dilindungi oleh Next.js Middleware (`src/middleware.ts`) dan validasi sesi (`src/lib/auth.ts`) menggunakan *HTTP-Only Cookie*.

* **Dashboard Statistik (`/admin/dashboard`):** Menampilkan ringkasan total aplikasi, distribusi aplikasi Pemerintahan vs Swasta, serta status tema aktif secara *real-time*.

* **Manajemen Aplikasi (`/admin/aplikasi`):** Fitur CRUD (*Create, Read, Update, Delete*) daftar aplikasi lengkap dengan fitur *upload* ikon/gambar aplikasi yang langsung divalidasi (*Magic Bytes validation*).

* **Manajemen Konten Portal (`/admin/kontenportal`):** Mengubah logo perusahaan, judul *Hero Header*, subjudul, teks *footer*, serta nomor dan *template* pesan WhatsApp tanpa perlu mengubah kode program.

* **Manajemen Tema (`/admin/tema`):** Membuat, mengubah, mengunggah gambar latar (*background theme*), memilih skema warna, dan mengaktifkan tema portal dengan sekali klik.

### C. Sistem Penyimpanan Aset Lokal Aman (`upload/assets`)

* Seluruh aset gambar yang diunggah melalui panel admin disimpan di luar folder statis bawaan (`upload/assets/`) agar aman dan persisten.

* Disajikan melalui endpoint internal (`/api/assets/[...path]` dan `/api/icon`) yang dilengkapi proteksi **Anti-Path Traversal** (`src/lib/assetHelper.ts`), validasi *Magic Bytes* (`src/lib/baseFileStorage.ts`), serta `Cache-Control` untuk performa tinggi.

## 2. Teknologi yang Digunakan (Tech Stack)

* **Framework:** Next.js (App Router) + React + TypeScript

* **Styling & Animasi:** Tailwind CSS, Lucide React Icons, Custom CSS Animations

* **Database & ORM:** MySQL / MariaDB dengan **Prisma ORM**

* **Autentikasi:** JWT (`jose` / `jsonwebtoken`) dengan *HTTP-Only Cookie* & `bcryptjs`

* **Server Entrypoint:** Custom Node.js HTTP Server (`server.js`) siap pakai untuk cPanel Phusion Passenger maupun PM2.

## 3. Struktur Direktori Proyek

```
portal-greennusa-use-next-js/
├── prisma/
│   ├── migrations/              # Riwayat migrasi tabel database
│   ├── schema.prisma            # Skema database Prisma (User, App, PortalContent, Theme)
│   └── seed.ts                  # Script pengisian data awal (seeding)
├── src/
│   ├── app/
│   │   ├── admin/               # Halaman CMS Admin (dashboard, aplikasi, kontenportal, tema)
│   │   ├── api/                 # Backend API Route Handlers (auth, apps, themes, assets, dll)
│   │   ├── login/               # Halaman Login Admin
│   │   ├── layout.tsx           # Root Layout Next.js
│   │   └── page.tsx             # Halaman Utama Portal Publik
│   ├── components/              # Komponen UI (folder card, modal, header, footer, common)
│   ├── context/                 # React Context untuk manajemen state aplikasi admin
│   ├── data/                    # Data referensi awal aplikasi ekosistem
│   ├── hooks/                   # Custom React Hooks (useEscapeKey, useModalScrollLock)
│   ├── lib/
│   │   ├── assetHelper.ts       # Proteksi keamanan pembacaan file & HTTP caching
│   │   ├── auth.ts              # Utilitas JWT & verifikasi sesi admin
│   │   ├── baseFileStorage.ts   # Engine utama validasi & penyimpanan upload gambar
│   │   ├── iconStorage.ts       # Manajemen file ikon/gambar aplikasi
│   │   ├── logoStorage.ts       # Manajemen file logo portal
│   │   ├── themeStorage.ts      # Manajemen file background tema
│   │   └── prisma.ts            # Singleton koneksi Prisma Client
│   ├── middleware.ts            # Proteksi route /admin dan /api/admin
│   ├── styles/                  # Animasi CSS portal
│   └── types/                   # Definisi tipe data TypeScript
├── upload/
│   └── assets/                  # Direktori penyimpanan fisik gambar (appImages, backgroundTheme, icons, logo)
├── next.config.mjs              # Konfigurasi Next.js (dioptimasi untuk memori VPS/cPanel)
├── package.json                 # Daftar dependensi dan script npm
└── server.js                    # Entrypoint utama untuk cPanel Node.js Selector / PM2

```

## 4. Cara Penggunaan & Instalasi Lokal (Development)

### Prasyarat

* **Node.js** versi `18.18.0` atau `20.x LTS` (Direkomendasikan)

* **Database** MySQL atau MariaDB yang sedang berjalan

* **Git**

### Langkah Instalasi

1. **Clone Repositori & Masuk ke Direktori Proyek**

   ```
   git clone <url-repository-anda>
   cd portal-greennusa-use-next-js
   
   ```

2. **Instal Dependensi Paket**

   ```
   npm install
   
   ```

3. **Konfigurasi Environment Variables (`.env`)**
   Buat file `.env` di *root* proyek dan sesuaikan dengan konfigurasi database lokal Anda:

   ```
   # Koneksi Database MySQL/MariaDB
   DATABASE_URL="mysql://root:password_db@localhost:3306/db_portal_greennusa?connection_limit=5&pool_timeout=10"
   
   # Kunci Rahasia JWT Autentikasi Admin (Gunakan string acak minimal 32 karakter)
   JWT_SECRET="ganti_dengan_kode_rahasia_panjang_dan_acak_minimal_32_karakter"
   
   # Environment Mode
   NODE_ENV="development"
   
   ```

4. **Jalankan Migrasi Database & Generate Prisma Client**

   ```
   npx prisma generate
   npx prisma migrate deploy
   
   ```

5. **Jalankan Seeding Data Awal (User Admin, Aplikasi, Tema, & Konten Default)**

   ```
   npx prisma db seed
   
   ```

   *(Jika belum dikonfigurasi pada `package.json`, dapat dijalankan dengan `npx tsx prisma/seed.ts` atau sesuai script seed yang tersedia).*

6. **Jalankan Server Development**

   ```
   npm run dev
   
   ```

   Buka browser dan akses: `http://localhost:3000`

## 5. Panduan Penggunaan Fitur (User & Admin)

### A. Akses Pengunjung (Publik)

1. Buka halaman utama (`/`).

2. Klik salah satu kartu kategori folder (**Ekosistem Pemerintahan** atau **Ekosistem Swasta**).

3. Di dalam modal yang terbuka:

   * Gunakan kolom **Pencarian** di bagian atas untuk mencari aplikasi berdasarkan nama atau deskripsi.

   * Pindah tab kategori di bagian atas modal tanpa harus menutup jendela.

   * Klik kartu aplikasi untuk membuka aplikasi tujuan di tab baru.

   * Tekan tombol `ESC` pada keyboard atau klik area luar modal untuk menutup.

### B. Akses Administrator (CMS)

1. Buka halaman login di `/login` (misal: `http://localhost:3000/login`).

2. Masukkan *Username* dan *Password* admin (sesuai dengan data yang dibuat pada `prisma/seed.ts`).

3. Setelah berhasil masuk, gunakan menu navigasi di *sidebar* kiri:

   * **Dashboard (`/admin/dashboard`):** Melihat ringkasan jumlah aplikasi dan status sistem.

   * **Kelola Aplikasi (`/admin/aplikasi`):**

     * Klik **"Tambah Aplikasi"** untuk mendaftarkan aplikasi baru.

     * Pilih kategori (`pemerintahan` atau `swasta`), isi nama, deskripsi singkat, URL aplikasi, dan unggah ikon (`.png`, `.jpg`, atau `.webp`, maks 5MB).

   * **Konten Portal (`/admin/kontenportal`):**

     * Ubah teks judul utama (*Hero Title*), subjudul, nama perusahaan, teks hak cipta *footer*, nomor WhatsApp (format `628...`), dan unggah logo baru.

     * Klik **"Simpan Perubahan"** untuk langsung menerapkan ke halaman depan.

   * **Kelola Tema (`/admin/tema`):**

     * Tambah tema baru dengan mengunggah gambar latar (*background*) atau mengatur kode warna utama.

     * Klik tombol **"Aktifkan"** pada salah satu kartu tema untuk menjadikannya tema utama di halaman publik.

## 6. Cara Deployment ke VPS (cPanel & Linux Non-Panel)

Proyek ini telah dilengkapi dengan `server.js` dan konfigurasi `next.config.mjs` yang ramah terhadap batasan memori/*thread* pada VPS. Pilih metode di bawah ini yang sesuai dengan infrastruktur VPS Anda:

### Metode A: Deployment pada VPS Berbasis cPanel (Setup Node.js App)

#### 1. Persiapan Database di cPanel

1. Login ke **cPanel** -> buka menu **MySQL® Databases** (atau **Database Wizard**).

2. Buat database baru (contoh: `cpaneluser_portal`).

3. Buat user database baru beserta *password* yang kuat, lalu tambahkan user tersebut ke database dengan hak akses **ALL PRIVILEGES**.

#### 2. Upload Kode Proyek ke Server

1. Anda dapat melakukan `git clone` melalui **cPanel Terminal / SSH** atau mengunggah file `.zip` proyek melalui **File Manager** ke direktori di luar `public_html` (direkomendasikan), misalnya:

   ```
   /home/cpaneluser/portal-greennusa
   
   ```

   *(Catatan: Jangan ikut mengunggah folder `node_modules` dan `.next` dari komputer lokal).*

2. Pastikan folder `upload/assets` ikut terunggah dan memiliki izin akses (*permission*) `755`.

#### 3. Konfigurasi Menu "Setup Node.js App" di cPanel

1. Buka menu **Setup Node.js App** di cPanel, lalu klik **Create Application**.

2. Isi formulir konfigurasi sebagai berikut:

   * **Node.js version:** Pilih `20.x` (atau minimal `18.18+`)

   * **Application mode:** `Production`

   * **Application root:** `portal-greennusa` *(sesuaikan dengan path folder Anda)*

   * **Application URL:** Pilih domain/subdomain Anda

   * **Application startup file:** `server.js`

3. Pada bagian **Environment variables**, klik **Add Variable** dan tambahkan:

   * `DATABASE_URL` = `mysql://cpaneluser_dbuser:password_db@localhost:3306/cpaneluser_portal?connection_limit=5&pool_timeout=10`

   * `JWT_SECRET` = `<isi_dengan_secret_key_acak_minimal_32_karakter>`

   * `NODE_ENV` = `production`

4. Klik tombol **Create** di kanan atas.

#### 4. Instalasi, Migrasi, & Build melalui Terminal cPanel

1. Salin perintah `source /home/cpaneluser/nodevenv/...` yang muncul di bagian atas halaman *Setup Node.js App*.

2. Buka menu **Terminal** di cPanel (atau login via SSH), lalu tempel perintah `source` tersebut untuk masuk ke *virtual environment* Node.js:

   ```
   source /home/cpaneluser/nodevenv/portal-greennusa/20/bin/activate && cd /home/cpaneluser/portal-greennusa
   
   ```

3. Jalankan instalasi dependensi, migrasi Prisma, dan *build* produksi secara berurutan:

   ```
   # 1. Instal seluruh paket termasuk devDependencies (dibutuhkan untuk build TypeScript & Tailwind)
   npm install --include=dev
   
   # 2. Generate Prisma Client sesuai binary OS server cPanel
   npx prisma generate
   
   # 3. Terapkan tabel migrasi ke database MySQL
   npx prisma migrate deploy
   
   # 4. (Opsional - Hanya saat pertama kali deploy) Isi data awal & akun admin
   npx prisma db seed
   
   # 5. Build aplikasi Next.js untuk produksi
   npm run build
   
   ```

4. Kembali ke halaman **Setup Node.js App** di cPanel, lalu klik tombol **Restart**.

5. Buka domain Anda di browser; aplikasi sudah aktif dan siap digunakan!

### Metode B: Deployment pada VPS Linux Mandiri (Ubuntu/Debian + PM2 + Nginx)

Jika Anda menggunakan VPS tanpa cPanel:

1. **Clone & Siapkan File `.env`**

   ```
   git clone <url-repo> /var/www/portal-greennusa
   cd /var/www/portal-greennusa
   nano .env
   
   ```

   *(Isi `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV="production"`, dan `PORT=3000`)*.

2. **Instalasi, Migrasi, & Build**

   ```
   npm ci
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   
   ```

3. **Jalankan Menggunakan PM2**

   ```
   npm install -g pm2
   pm2 start server.js --name "portal-greennusa"
   pm2 save
   pm2 startup
   
   ```

4. **Konfigurasi Reverse Proxy Nginx (`/etc/nginx/sites-available/portal-greennusa`)**

   ```
   server {
       listen 80;
       server_name portal.domainanda.com;
   
       client_max_body_size 10M;
   
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   
   ```

## 7. Troubleshooting Umum

| Gejala / Error | Penyebab | Solusi | 
| ----- | ----- | ----- | 
| **`Error: uv_thread_create` / `SIGKILL` saat `npm run build` di cPanel** | Batas proses LVE / RAM di akun cPanel terlampaui saat kompilasi paralel. | Pastikan `experimental: { workerThreads: false, cpus: 1 }` di `next.config.mjs` tetap aktif. | 
| **`PrismaClientInitializationError: Query Engine not found`** | Binary Prisma di-*generate* di OS yang berbeda (misal Windows) lalu di-upload ke Linux. | Jalankan ulang `npx prisma generate` langsung di terminal VPS/cPanel, lalu *restart* aplikasi. | 
| **Gagal Upload Ikon / Tema di प्रोडक्शन (`EACCES: permission denied`)** | User Node.js tidak memiliki hak tulis ke folder `upload/assets`. | Jalankan `chmod -R 755 upload` dan pastikan pemilik folder (`chown`) sesuai dengan *user* cPanel/VPS. | 
| **`Too many connections` pada MySQL** | Koneksi Prisma tidak dibatasi pada environment dengan limit MySQL ketat. | Pastikan `DATABASE_URL` diakhiri dengan parameter `?connection_limit=5&pool_timeout=10`. | 
