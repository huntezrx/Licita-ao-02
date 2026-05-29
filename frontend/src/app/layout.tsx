import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Impacta Empreendimentos - Gestão de Licitações',
  description: 'Sistema de gestão de licitações públicas da Impacta Empreendimentos',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
