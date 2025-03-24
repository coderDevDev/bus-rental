'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Clock } from 'lucide-react';
import L from 'leaflet';
import { supabase } from '@/lib/supabase/client';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png'
});

interface BusLocation {
  id: string;
  bus_number: string;
  latitude: number;
  longitude: number;
  route_name: string;
  next_stop: string;
  eta: string;
  available_seats: number;
}

export function LiveMap() {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusLocation | null>(null);

  useEffect(() => {
    // Subscribe to real-time bus location updates
    const subscription = supabase
      .channel('bus-locations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bus_locations'
        },
        payload => {
          setBusLocations(current =>
            current.map(bus =>
              bus.id === payload.new.id ? { ...bus, ...payload.new } : bus
            )
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <CardTitle>Live Bus Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <MapContainer
          center={[14.5995, 120.9842]} // Manila coordinates
          zoom={13}
          className="w-full h-[300px]">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {busLocations.map(bus => (
            <Marker
              key={bus.id}
              position={[bus.latitude, bus.longitude]}
              eventHandlers={{
                click: () => setSelectedBus(bus)
              }}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">Bus {bus.bus_number}</h3>
                  <p className="text-sm">{bus.route_name}</p>
                  <div className="flex items-center gap-2 text-sm mt-2">
                    <Bus className="h-4 w-4" />
                    <span>{bus.available_seats} seats available</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Clock className="h-4 w-4" />
                    <span>ETA: {bus.eta}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
