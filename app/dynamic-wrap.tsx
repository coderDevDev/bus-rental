'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/client-only';

// Create a higher-order component that dynamically imports and disables SSR
export default function createClientComponent<T>(
  Component: React.ComponentType<T>
) {
  // Return a wrapper component that disables SSR
  const DynamicComponent = dynamic(() => Promise.resolve(Component), {
    ssr: false
  });

  // Return a function that wraps the component with ClientOnly
  return function ClientComponent(props: T) {
    return (
      <ClientOnly>
        <DynamicComponent {...props} />
      </ClientOnly>
    );
  };
}
