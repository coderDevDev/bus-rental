'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Search, HelpCircle, MessageCircle, Phone } from 'lucide-react';

const FAQs = [
  {
    question: 'How do I book a bus ticket?',
    answer:
      'To book a bus ticket, simply search for your route, select your preferred schedule, choose your seat, and proceed with the payment. Your e-ticket will be sent to your email.'
  },
  {
    question: 'Can I cancel my booking?',
    answer:
      'Yes, you can cancel your booking up to 24 hours before departure. Visit My Tickets section and select the booking you wish to cancel. Refund policies apply.'
  },
  {
    question: 'How do I view my booking?',
    answer:
      'You can view your bookings in the My Tickets section of your dashboard. Here you can see all active and past bookings.'
  },
  {
    question: 'What payment methods are accepted?',
    answer:
      'We accept credit/debit cards, e-wallets (GCash, Maya), and cash payments at designated terminals.'
  }
];

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFAQs, setFilteredFAQs] = useState(FAQs);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = FAQs.filter(faq =>
      faq.question.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredFAQs(filtered);
  };

  return (
    <>
      <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
        <div className="container flex h-14 items-center justify-between px-4">
          <h1 className="font-bold text-lg">NorthPoint</h1>
        </div>
      </header>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                className="pl-9"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>

            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="grid gap-4 md:grid-cols-2">
              {/* <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <MessageCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Live Chat Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Chat with our support team
                      </p>
                    </div>
                  </div>
                  <Button className="mt-4 w-full">Start Chat</Button>
                </CardContent>
              </Card> */}

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Contact Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Call us at +63 XXX XXX XXXX
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4 w-full">
                    Call Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
