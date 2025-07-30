import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Code Valley - RPG Life Simulation',
  description: 'A programming-themed life simulation game inspired by Stardew Valley',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-900">
          {children}
        </div>
      </body>
    </html>
  );
}