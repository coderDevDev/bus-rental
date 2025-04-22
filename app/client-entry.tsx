'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ClientEntryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientEntry({
  children,
  fallback = <div>Loading...</div>
}: ClientEntryProps) {
  // This runs only on the client
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Show nothing during initial SSR pass
  if (!isClient) {
    return <div style={{ display: 'none' }}></div>;
  }

  return (
    <ErrorBoundary
      fallback={<div>Something went wrong. Please refresh the page.</div>}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
