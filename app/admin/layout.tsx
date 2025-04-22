'use client';

import type React from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/client-only';

// Create a dynamic version of the layout that skips SSR
const DynamicLayout = dynamic(() => Promise.resolve(AdminLayout), {
  ssr: false
});

export default function RootAdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientOnly>
      <DynamicLayout>{children}</DynamicLayout>
    </ClientOnly>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>;
}
