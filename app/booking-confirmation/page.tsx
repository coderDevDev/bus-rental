'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Check, Download, Share2, Home } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import ClientOnly from '@/components/client-only';
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled
export default dynamic(() => Promise.resolve(BookingConfirmationPage), {
  ssr: false
});

function BookingConfirmationPage() {
  return (
    <ClientOnly>
      <BookingConfirmationContent />
    </ClientOnly>
  );
}

function BookingConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get booking details from URL parameters (or use defaults)
  const busId = searchParams.get('bus') || '1';
  const seatsParam = searchParams.get('seats') || '';
  const selectedSeats = seatsParam.split(',');
  const totalAmount = selectedSeats.length * (20 + Number.parseInt(busId) * 5);

  // Generate a random booking number
  const bookingNumber = `BKG-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 p-2 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your booking has been successfully processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/5 p-4">
              <div className="text-center mb-3">
                <div className="text-sm text-muted-foreground">
                  Booking Number
                </div>
                <div className="text-lg font-semibold">{bookingNumber}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Route</div>
                  <div>New York to Boston</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Date</div>
                  <div>May 15, 2023</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Bus</div>
                  <div>
                    Express {String.fromCharCode(64 + Number.parseInt(busId))}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Departure</div>
                  <div>{8 + Number.parseInt(busId)}:00 AM</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Seat(s)</div>
                  <div>{selectedSeats.join(', ')}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total</div>
                  <div>${totalAmount}</div>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              A confirmation email has been sent to your registered email
              address.
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="sm" className="flex-1 gap-1">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
            <Button
              className="w-full gap-1"
              onClick={() => router.push('/dashboard')}>
              <Home className="h-4 w-4" />
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
