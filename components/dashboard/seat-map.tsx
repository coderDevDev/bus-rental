'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { passengerService } from '@/services/passenger-service';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface SeatMapProps {
  busId: string;
  routeId: string;
  onSelectSeat: (seatNumber: string) => void;
}

export function SeatMap({ busId, routeId, onSelectSeat }: SeatMapProps) {
  const { toast } = useToast();
  const [seats, setSeats] = useState<
    Array<{
      number: string;
      status: 'available' | 'booked' | 'selected';
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  useEffect(() => {
    console.log({ busId, routeId });
    const fetchSeats = async () => {
      if (!busId || !routeId) {
        setError('Missing bus or route information');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching seats for:', { busId, routeId });
        const busSeats = await passengerService.getBusSeats(busId, routeId);
        console.log('Received seats:', busSeats);
        setSeats(busSeats);
      } catch (err) {
        console.error('Error fetching seats:', err);
        setError('Failed to load seat map');
        toast({
          title: 'Error',
          description: 'Failed to load seat map. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [busId, routeId, toast]);

  const handleSeatClick = (seatNumber: string) => {
    if (seats.find(s => s.number === seatNumber)?.status === 'booked') {
      return;
    }

    setSelectedSeat(seatNumber);
    onSelectSeat(seatNumber);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Seat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center gap-4">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Seat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading seats...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (seats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Seat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No seats available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Seat</span>
          <div className="flex gap-2 text-sm">
            <Badge variant="outline">Available</Badge>
            <Badge variant="secondary">Selected</Badge>
            <Badge variant="destructive">Booked</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 p-4">
          {seats.map(seat => (
            <Button
              key={seat.number}
              variant="outline"
              className={cn(
                'h-12 w-12',
                seat.status === 'booked' &&
                  'bg-destructive text-destructive-foreground',
                seat.number === selectedSeat &&
                  'bg-secondary text-secondary-foreground',
                seat.status === 'available' && 'hover:bg-secondary'
              )}
              disabled={seat.status === 'booked'}
              onClick={() => handleSeatClick(seat.number)}>
              {seat.number}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
