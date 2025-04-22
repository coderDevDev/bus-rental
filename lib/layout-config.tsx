import { ReactNode } from 'react';
import ClientOnly from '@/components/client-only';

// Simplified config to catch all pages under major sections
const clientOnlyPages = [
  '/', // Root page
  '/admin', // All admin pages
  '/conductor', // All conductor pages
  '/dashboard', // All dashboard pages
  '/booking-confirmation', // Booking confirmation pages
  '/onboarding', // Onboarding pages
  '/payment', // Payment pages
  '/sign-up', // Sign up pages
  '/sign-in', // Sign in pages
  '/support', // Support pages
  '/forgot-password', // Forgot password pages
  '/reset-password', // Reset password pages
  '/profile' // Profile pages
];

export function withClientOnly(page: ReactNode, pathname?: string) {
  // If no pathname is provided or if we can't determine it, wrap the page to be safe
  if (!pathname) {
    return <ClientOnly>{page}</ClientOnly>;
  }

  // Check if any of our patterns match the current pathname
  // This will now match any page that starts with the paths in clientOnlyPages
  const shouldWrap = clientOnlyPages.some(
    path => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (shouldWrap) {
    return <ClientOnly>{page}</ClientOnly>;
  }

  return page;
}
