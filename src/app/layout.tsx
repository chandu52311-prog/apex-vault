import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apex Vault | Luxury Supercars & Tech Registry',
  description: 'Verified luxury automotive and high-end tech portal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050505] text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
