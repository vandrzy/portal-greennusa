import type { Metadata } from 'next';
import '../index.css';
import '../styles/portalAnimations.css';

export const metadata: Metadata = {
  title: 'Portal Ekosistem GreenNusa Computindo',
  description:
    'Portal integrasi seluruh layanan digital dan aplikasi ekosistem resmi GreenNusa Computindo guna mendukung efisiensi serta kemudahan akses solusi teknologi bagi instansi pemerintahan dan sektor swasta.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%2325d366'/><text x='50%' y='55%' font-size='45' font-weight='bold' text-anchor='middle' fill='%23ffffff' dominant-baseline='middle'>G</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
