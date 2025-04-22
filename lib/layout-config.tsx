import { ReactNode } from 'react';
import ClientOnly from '@/components/client-only';

// Centralized config to manage which pages need client-only rendering
const clientOnlyPages = [
  '/admin/assignments/add',
  '/onboarding',
  '/dashboard',
  '/conductor',
  '/conductor/issue-ticket',
  '/payment',
  '/support',
  '/booking-confirmation'
];

export function withClientOnly(page: ReactNode, pathname?: string) {
  // If no pathname is provided or if we can't determine it, wrap the page to be safe
  if (!pathname) {
    return <ClientOnly>{page}</ClientOnly>;
  }

  // Check if any of our patterns match the current pathname
  const shouldWrap = clientOnlyPages.some(path => pathname.startsWith(path));

  if (shouldWrap) {
    return <ClientOnly>{page}</ClientOnly>;
  }

  return page;
}
