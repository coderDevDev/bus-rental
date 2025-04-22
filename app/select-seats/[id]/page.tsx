'use client';

import { useState } from 'react';
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
import { ArrowLeft, Bus, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/client-only';
import dynamic from 'next/dynamic';

// Make this a dynamic component with SSR disabled
export default dynamic(() => Promise.resolve(SelectSeatsPage), {
  ssr: false
});

function SelectSeatsPage({ params }: { params: { id: string } }) {
  return (
    <ClientOnly>
      <SelectSeats params={params} />
    </ClientOnly>
  );
}

function SelectSeats({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const busId = params.id;

  // Mock data for bus layout
  const totalSeats = 40;
  const unavailableSeats = [3, 7, 12, 15, 22, 28, 33, 38];

  const handleSeatClick = (seatNumber: number) => {
    if (unavailableSeats.includes(seatNumber)) return;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatNumber));
    } else {
      if (selectedSeats.length < 4) {
        setSelectedSeats([...selectedSeats, seatNumber]);
      } else {
        toast({
          title: 'Maximum seats reached',
          description: 'You can only select up to 4 seats',
          variant: 'destructive'
        });
      }
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: 'No seats selected',
        description: 'Please select at least one seat to continue',
        variant: 'destructive'
      });
      return;
    }

    router.push(`/payment?bus=${busId}&seats=${selectedSeats.join(',')}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-primary text-primary-foreground z-10">
        <div className="container flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-primary-foreground">
            <Link href="/dashboard?tab=search">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">
            Select Seats
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>
              Express Bus {String.fromCharCode(64 + Number.parseInt(busId))}
            </CardTitle>
            <CardDescription>New York to Boston - May 15, 2023</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center text-sm mb-4">
              <div>
                <p className="font-medium">
                  {8 + Number.parseInt(busId)}:00 AM
                </p>
                <p className="text-xs text-muted-foreground">New York</p>
              </div>
              <div className="flex-1 mx-2 border-t border-dashed relative">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  {4 + Number.parseInt(busId)} hrs
                </span>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {12 + Number.parseInt(busId)}:00 PM
                </p>
                <p className="text-xs text-muted-foreground">Boston</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bus Layout</CardTitle>
              <Bus className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>Select up to 4 seats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-10 rounded border border-primary flex items-center justify-center text-primary text-sm">
                Driver
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {Array.from({ length: totalSeats }, (_, i) => i + 1).map(
                seatNumber => (
                  <button
                    key={seatNumber}
                    className={`
                    aspect-square rounded-md flex items-center justify-center text-sm
                    ${
                      unavailableSeats.includes(seatNumber)
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : selectedSeats.includes(seatNumber)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }
                  `}
                    onClick={() => handleSeatClick(seatNumber)}
                    disabled={unavailableSeats.includes(seatNumber)}>
                    {selectedSeats.includes(seatNumber) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      seatNumber
                    )}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted rounded"></div>
                <span>Unavailable</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Selected Seats</span>
                <span>
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Price per seat</span>
                <span>${20 + Number.parseInt(busId) * 5}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Amount</span>
                <span>
                  ${selectedSeats.length * (20 + Number.parseInt(busId) * 5)}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleContinue}
              disabled={selectedSeats.length === 0}>
              Continue to Payment
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
