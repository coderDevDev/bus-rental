'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RouteMap } from '@/components/conductor/route-map';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Bus } from 'lucide-react';
import type { Ticket } from '@/types';
import { format } from 'date-fns';

interface LiveTrackingProps {
  activeTickets: Ticket[];
}

export function LiveTracking({ activeTickets }: LiveTrackingProps) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [busLocation, setBusLocation] = useState<{
    latitude: number;
    longitude: number;
    heading?: number;
  } | null>(null);

  useEffect(() => {
    if (activeTickets.length > 0 && !selectedTicket) {
      setSelectedTicket(activeTickets[0]);
    }
  }, [activeTickets, selectedTicket]);

  // Simulate real-time bus location updates
  useEffect(() => {
    if (!selectedTicket) return;

    const interval = setInterval(() => {
      // In a real app, you would fetch the actual bus location from your backend
      setBusLocation({
        latitude: 14.5995, // Example coordinates
        longitude: 120.9842,
        heading: 45
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedTicket]);

  if (activeTickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No active tickets to track</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ticket Selection */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {activeTickets.map(ticket => (
          <Button
            key={ticket.id}
            variant={selectedTicket?.id === ticket.id ? 'default' : 'outline'}
            className="flex-shrink-0"
            onClick={() => setSelectedTicket(ticket)}>
            <Bus className="h-4 w-4 mr-2" />
            {ticket.from_location} → {ticket.to_location}
          </Button>
        ))}
      </div>

      {selectedTicket && (
        <>
          {/* Map View */}
          <Card>
            <CardHeader>
              <CardTitle>Live Bus Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] relative">
                <RouteMap
                  startLocation={{
                    name: selectedTicket.from_location,
                    coordinates: [120.9842, 14.5995] // You should get these from your backend
                  }}
                  endLocation={{
                    name: selectedTicket.to_location,
                    coordinates: [121.0122, 14.6037] // You should get these from your backend
                  }}
                  currentLocation={
                    busLocation
                      ? {
                          coordinates: [
                            busLocation.longitude,
                            busLocation.latitude
                          ],
                          heading: busLocation.heading
                        }
                      : undefined
                  }
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Journey Details */}
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Current Location</span>
                  </div>
                  <p className="font-medium">
                    {busLocation ? 'En Route' : 'Waiting for updates...'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Estimated Arrival</span>
                  </div>
                  <p className="font-medium">
                    {format(new Date(), 'h:mm a')}{' '}
                    {/* Replace with actual ETA */}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bus className="h-4 w-4" />
                    <span className="text-sm">Status</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700">
                    On Time
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
