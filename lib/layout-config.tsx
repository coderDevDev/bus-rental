import { ReactNode } from 'react';
import ClientOnly from '@/components/client-only';

// Centralized config to manage which pages need client-only rendering
const clientOnlyPages = [
  '/admin/assignments/add',
  '/onboarding',
  '/dashboard',
  '/conductor',
  '/conductor/issue-ticket'
];

export function withClientOnly(page: ReactNode, path: string) {
  if (clientOnlyPages.includes(path)) {
    return <ClientOnly>{page}</ClientOnly>;
  }
  return page;
}
