import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface BusLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  lastUpdate: string;
}

export function useBusLocation(assignmentId: string | null) {
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    // Subscribe to real-time location updates
    const channel = supabase
      .channel(`bus-location-${assignmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bus_locations',
          filter: `assignment_id=eq.${assignmentId}`
        },
        payload => {
          setBusLocation({
            latitude: payload.new.latitude,
            longitude: payload.new.longitude,
            heading: payload.new.heading,
            speed: payload.new.speed,
            lastUpdate: payload.new.updated_at
          });
        }
      )
      .subscribe();

    // Initial fetch
    const fetchCurrentLocation = async () => {
      const { data, error } = await supabase
        .from('bus_locations')
        .select('*')
        .eq('assignment_id', assignmentId)
        .single();

      if (!error && data) {
        setBusLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          heading: data.heading,
          speed: data.speed,
          lastUpdate: data.updated_at
        });
      }
    };

    fetchCurrentLocation();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assignmentId]);

  return busLocation;
}
