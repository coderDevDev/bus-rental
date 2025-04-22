import { ReactNode } from 'react';
import ClientOnly from '@/components/client-only';

// Centralized config to manage which pages need client-only rendering
const clientOnlyPages = [
  '/',
  '/admin/assignments/add',
  '/onboarding',
  '/dashboard',
  '/conductor',
  '/conductor/issue-ticket',
  '/payment',
  '/support',
  '/booking-confirmation',
  '/admin/routes',
  '/forgot-password',
  '/reset-password',
  '/admin/routes/add',
  '/admin/routes/edit',
  '/admin/routes/view',
  '/admin/routes/delete',
  '/admin/routes/list',
  '/admin/routes/search',
  '/admin/routes/view',
  '/admin/routes/edit',
  '/admin/routes/delete',
  '/admin/routes/list',
  '/admin/routes/search',
  '/admin/routes/view',
  '/admin/routes/edit',
  '/admin/routes/delete',
  '/admin/routes/list',
  '/admin/routes/search',
  '/admin/routes/view',
  '/admin/routes/edit',
  '/admin/routes/delete',
  '/admin/routes/list',
  '/admin/routes/search',
  '/admin/routes/view',
  '/admin/routes/edit',
  '/admin/routes/delete',
  '/admin/routes/list',
  '/admin/routes/search',
  '/admin/routes/view',
  '/admin/routes/edit',
  '/admin/routes/delete',
  '/admin/routes/list',
  '/admin/routes/search',
  '/admin/routes/view',
  '/admin/routes/edit',
  '/admin/routes/delete',
  '/admin/routes/list',
  '/admin/routes/search',
  '/admin/routes/view',
  '/admin/routes/edit',
  '/admin/routes/delete',
  '/admin/routes/list',
  '/admin/routes/search',
  '/admin/routes/view',
  '/admin/routes/edit',
  '/admin/routes/delete',
  '/admin/routes/list',
  '/admin/routes/search',
  '/admin/routes/view',
  '/admin/routes/edit',
  '/conductor/issue-ticket',
  '/conductor/profile',
  '/conductor/profile/edit',
  '/conductor/profile/view',
  '/conductor/profile/delete',
  '/conductor/profile/list',
  '/conductor/profile/search',
  '/payment/page',
  '/profile/page',
  '/reset-password/page',
  '/support/page',
  '/admin/routes/add',
  '/admin/routes/edit',
  '/admin/routes/view',
  '/admin/routes/delete',
  '/admin/routes/list'
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
