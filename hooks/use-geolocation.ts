import { useState, useEffect } from 'react';

interface GeolocationState {
  location: {
    latitude: number;
    longitude: number;
    heading?: number;
  } | null;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported'
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      position => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            heading: position.coords.heading || undefined
          },
          error: null
        });
      },
      error => {
        setState(prev => ({
          ...prev,
          error: error.message
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 12000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
