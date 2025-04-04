import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';

interface Location {
  name: string;
  coordinates: [number, number];
}

interface CurrentLocation {
  coordinates: [number, number];
  heading?: number;
}

interface RouteMapProps {
  startLocation: Location;
  endLocation: Location;
  currentLocation?: CurrentLocation;
  stops?: Location[];
  className?: string;
  showPath?: boolean;
}

export function RouteMap({
  startLocation,
  endLocation,
  currentLocation,
  stops = [],
  className,
  showPath = true
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: startLocation.coordinates,
        zoom: 12
      });

      // Add markers and route path
      map.current.on('load', async () => {
        if (!map.current) return;

        // Add start marker
        new mapboxgl.Marker({ color: '#800000' })
          .setLngLat(startLocation.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(startLocation.name))
          .addTo(map.current);

        // Add end marker
        new mapboxgl.Marker({ color: '#000000' })
          .setLngLat(endLocation.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(endLocation.name))
          .addTo(map.current);

        // Add stop markers
        stops.forEach(stop => {
          new mapboxgl.Marker({ color: '#666666' })
            .setLngLat(stop.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(stop.name))
            .addTo(map.current);
        });

        if (showPath) {
          // Get route from Mapbox Directions API
          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${startLocation.coordinates[0]},${startLocation.coordinates[1]};${endLocation.coordinates[0]},${endLocation.coordinates[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
          );

          const data = await response.json();
          const route = data.routes[0].geometry;

          // Add route layer
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#800000',
              'line-width': 4,
              'line-opacity': 0.75
            }
          });

          // Fit bounds to show entire route
          const coordinates = route.coordinates;
          const bounds = coordinates.reduce(
            (bounds: mapboxgl.LngLatBounds, coord: [number, number]) =>
              bounds.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
          );

          map.current.fitBounds(bounds, {
            padding: 50
          });
        }
      });

      // Update current location marker
      if (currentLocation) {
        const el = document.createElement('div');
        el.className = 'current-location-marker';
        el.style.backgroundColor = '#4CAF50';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';

        new mapboxgl.Marker(el)
          .setLngLat(currentLocation.coordinates)
          .addTo(map.current);
      }
    } catch (e) {
      console.error('Map initialization error:', e);
      setMapError(true);
    }

    return () => {
      map.current?.remove();
    };
  }, [startLocation, endLocation, currentLocation, stops, showPath]);

  if (mapError) {
    return (
      <div className={cn('rounded-lg bg-gray-100 p-4', className)}>
        <p className="text-center text-gray-500">
          Unable to load map. Please check your connection.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className={cn('h-[400px] w-full rounded-lg overflow-hidden', className)}
    />
  );
}
