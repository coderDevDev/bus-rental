'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Ticket } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SeatMap } from './seat-map';
import { PaymentForm } from './payment-form';
import type { Route } from '@/types';

interface FareEstimatorProps {
  route: Route;
  onBook: (bookingData: {
    route_id: string;
    seat_number: string;
    fare_amount: number;
  }) => Promise<void>;
}

export function FareEstimator({ route, onBook }: FareEstimatorProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'seat' | 'payment'>('seat');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [estimatedFare, setEstimatedFare] = useState<number>(
    route?.base_fare || 0
  );

  // Add logging to debug route data
  console.log('Route data:', {
    id: route?.id,
    buses: route?.buses,
    assignments: route?.assignments
  });

  if (!route) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fare Estimator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Please select a route to view fare details
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeat(seatNumber);
    // Calculate fare based on seat selection
    setEstimatedFare(route.base_fare);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      await onBook({
        route_id: route.id,
        seat_number: selectedSeat,
        fare_amount: estimatedFare
      });

      toast({
        title: 'Booking Successful',
        description: 'Your ticket has been booked successfully!'
      });
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'Failed to complete booking. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {step === 'seat' ? (
        <>
          <SeatMap
            busId={route.assignments?.[0]?.bus_id || ''}
            routeId={route.id}
            onSelectSeat={handleSeatSelect}
          />
          {selectedSeat && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Fare Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Fare</span>
                      <span>₱{route.base_fare.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Amount</span>
                      <span>₱{estimatedFare.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setStep('payment')}>
                  Proceed to Payment
                  <Ticket className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <PaymentForm amount={estimatedFare} onSuccess={handlePaymentSuccess} />
      )}
    </div>
  );
}
