'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCenter } from '@/components/support/help-center';
import { FeedbackForm } from '@/components/support/feedback-form';
import ClientOnly from '@/components/client-only';
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled
export default dynamic(() => Promise.resolve(SupportPage), {
  ssr: false
});

function SupportPage() {
  return (
    <ClientOnly>
      <SupportContent />
    </ClientOnly>
  );
}

function SupportContent() {
  const [activeTab, setActiveTab] = useState('help');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-white">
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="font-bold text-lg">Support & Help</h1>
          </div>
        </div>
      </header>

      <main className="container flex-1 p-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Help Center
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact Us
            </TabsTrigger>
          </TabsList>

          <TabsContent value="help">
            <HelpCenter />
          </TabsContent>

          <TabsContent value="contact">
            <FeedbackForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
