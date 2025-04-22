import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { withClientOnly } from '@/lib/layout-config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NorthPoint - Bus Booking App',
  description: 'Book bus tickets easily with our mobile-first application'
};

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { path: string };
}) {
  // Wrap pages that need client-only rendering
  const renderedChildren = withClientOnly(children, params.path);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">{renderedChildren}</div>
        <Toaster />
      </body>
    </html>
  );
}
