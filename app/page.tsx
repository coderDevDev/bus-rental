'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ClientOnly from '@/components/client-only';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Bus } from 'lucide-react';

// Use dynamic import with SSR disabled
export default dynamic(() => Promise.resolve(HomePage), {
  ssr: false
});

function HomePage() {
  return (
    <ClientOnly>
      <HomeContent />
    </ClientOnly>
  );
}

function HomeContent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-maroon-700 to-maroon-900">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-6 pt-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white">
            <Bus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center">NorthPoint</h1>
          <p className="text-center text-muted-foreground">
            Book bus tickets easily with our mobile-first application
          </p>
          <Button asChild className="w-full">
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
