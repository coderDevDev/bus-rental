'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Bus, Clock } from 'lucide-react';
import { passengerService } from '@/services/passenger-service';
import type { BusTracking } from '@/types';

interface BusTrackerProps {
  routeId: string;
}

export function BusTracker({ routeId }: BusTrackerProps) {
  const [tracking, setTracking] = useState<BusTracking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const data = await passengerService.trackBus(routeId);
        setTracking(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching bus location:', err);
        setError('Unable to track bus location');
      }
    };

    fetchTracking();
    const interval = setInterval(fetchTracking, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [routeId]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Bus Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!tracking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Bus Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Loading bus location...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Bus Location</span>
          <Badge variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Updated: {new Date(tracking.last_updated).toLocaleTimeString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MapContainer
          center={[tracking.latitude, tracking.longitude]}
          zoom={15}
          className="h-[300px] w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[tracking.latitude, tracking.longitude]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">Bus {tracking.bus.bus_number}</h3>
                <p className="text-sm">Speed: {tracking.speed} km/h</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </CardContent>
    </Card>
  );
}
