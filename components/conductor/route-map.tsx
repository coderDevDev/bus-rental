'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/components/lib/utils';
import type { Map } from 'mapbox-gl';

// Initialize Mapbox - in a real app, this would be an environment variable
// Using a public token that should work for development purposes
mapboxgl.accessToken =
  'pk.eyJ1IjoibWlyYW5mYW0tMTIzIiwiYSI6ImNtMnUwa3AwNjA5MTAyanB4aGtxNXlkanUifQ.oYbW0ZPDHKZ8_fwy7ilmyA';

const MAPBOX_DIRECTIONS_API =
  'https://api.mapbox.com/directions/v5/mapbox/driving';

interface RouteMapProps {
  startLocation: {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  endLocation: {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  currentLocation?: {
    coordinates: [number, number]; // [longitude, latitude]
    heading?: number;
  };
  passengerLocation?: {
    coordinates: [number, number]; // [longitude, latitude]
    heading?: number;
  };
  stops?: Array<{
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
    isCurrent?: boolean;
  }>;
  className?: string;
  routeColor?: string;
  showPath?: boolean;
}

export function RouteMap({
  startLocation,
  endLocation,
  currentLocation,
  passengerLocation,
  stops = [],
  className,
  showPath = true
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [lastRender, setLastRender] = useState(0);
  const [isRouteFetching, setIsRouteFetching] = useState(false);

  // Memoize the coordinates to prevent unnecessary re-renders
  const startCoords = useMemo(
    () => startLocation.coordinates,
    [startLocation.coordinates[0], startLocation.coordinates[1]]
  );
  const endCoords = useMemo(
    () => endLocation.coordinates,
    [endLocation.coordinates[0], endLocation.coordinates[1]]
  );
  const currentCoords = useMemo(
    () => currentLocation?.coordinates,
    [currentLocation?.coordinates?.[0], currentLocation?.coordinates?.[1]]
  );
  const passengerCoords = useMemo(
    () => passengerLocation?.coordinates,
    [passengerLocation?.coordinates?.[0], passengerLocation?.coordinates?.[1]]
  );

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      console.log('Initializing map');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: currentCoords || startCoords,
        zoom: 12
      });

      map.current.on('load', () => {
        console.log('Map loaded');
        setMapLoaded(true);
      });

      map.current.on('error', e => {
        console.error('Mapbox error:', e);
        // If there's a token error, we'll show a fallback
        if (e.error && e.error.status === 401) {
          setMapError(true);
        }
      });

      return () => {
        // Clean up markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Remove map
        if (map.current) {
          console.log('Removing map');
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  }, [currentCoords, startCoords]); // Empty dependency array - only run once

  // Update map center when currentLocation changes
  useEffect(() => {
    if (!mapLoaded || !map.current || !currentCoords) return;

    // Throttle updates to prevent excessive re-renders
    const now = Date.now();
    if (now - lastRender < 5000) return;

    setLastRender(now);

    console.log('Updating map center');
    map.current.flyTo({
      center: currentCoords,
      zoom: 13,
      speed: 1.5
    });
  }, [mapLoaded, currentCoords, lastRender]);

  // Add route and markers when map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Throttle updates to prevent excessive re-renders
    const now = Date.now();
    if (now - lastRender < 5000) return;

    setLastRender(now);

    console.log('Updating map markers and route');

    // Clean up previous markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add start marker
    new mapboxgl.Marker({ color: '#b91c1c' })
      .setLngLat(startLocation.coordinates)
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${startLocation.name}</h3>`))
      .addTo(map.current);

    // Add end marker
    const endMarker = new mapboxgl.Marker({ color: '#b91c1c' })
      .setLngLat(endCoords)
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${endLocation.name}</h3>`))
      .addTo(map.current);
    markersRef.current.push(endMarker);

    // Add stop markers
    stops.forEach(stop => {
      const stopMarker = new mapboxgl.Marker({
        color: stop.isCurrent ? '#047857' : '#6b7280'
      })
        .setLngLat(stop.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${stop.name}</h3>`))
        .addTo(map.current!);
      markersRef.current.push(stopMarker);
    });

    // Add current location marker
    if (currentCoords) {
      const el = document.createElement('div');
      el.className = 'current-location-marker';
      el.style.backgroundColor = '#047857';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';

      if (currentLocation?.heading !== undefined) {
        // Add direction indicator
        const arrow = document.createElement('div');
        arrow.style.width = '0';
        arrow.style.height = '0';
        arrow.style.borderLeft = '6px solid transparent';
        arrow.style.borderRight = '6px solid transparent';
        arrow.style.borderBottom = '12px solid #047857';
        arrow.style.position = 'absolute';
        arrow.style.top = '-14px';
        arrow.style.left = '4px';
        arrow.style.transform = `rotate(${currentLocation.heading}deg)`;
        el.appendChild(arrow);
      }

      const currentMarker = new mapboxgl.Marker(el)
        .setLngLat(currentCoords)
        .addTo(map.current);
      markersRef.current.push(currentMarker);
    }

    // Add passenger location marker
    if (passengerLocation) {
      const el = document.createElement('div');
      el.className = 'passenger-location-marker';
      el.style.backgroundColor = '#2563eb'; // Blue color for passenger
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';

      new mapboxgl.Marker(el)
        .setLngLat(passengerLocation.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML('Your Location'))
        .addTo(map.current);
    }

    // Update route drawing
    const drawRoute = async () => {
      try {
        // Get all points in order including stops
        const routePoints = [
          startCoords,
          ...stops.map(stop => stop.coordinates),
          endCoords
        ];

        // Get the route geometry from Mapbox Directions API
        const routeGeometry = await getDirectionsRoute(routePoints);

        if (!routeGeometry) throw new Error('No route found');

        if (map.current?.getSource('route')) {
          // Update existing source
          const source = map.current.getSource(
            'route'
          ) as mapboxgl.GeoJSONSource;
          source.setData({
            type: 'Feature',
            properties: {},
            geometry: routeGeometry
          });
        } else {
          // Add new source and layer
          map.current?.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: routeGeometry
            }
          });

          map.current?.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#b91c1c',
              'line-width': 4,
              'line-opacity': 0.8
            }
          });
        }

        // Fit bounds to show the entire route with padding
        if (routeGeometry.coordinates.length > 0) {
          const bounds = routeGeometry.coordinates.reduce(
            (bounds, coord) => bounds.extend(coord as [number, number]),
            new mapboxgl.LngLatBounds(
              routeGeometry.coordinates[0] as [number, number],
              routeGeometry.coordinates[0] as [number, number]
            )
          );

          map.current?.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        }
      } catch (error) {
        console.error('Error drawing route:', error);
      }
    };

    drawRoute();
  }, [
    mapLoaded,
    startLocation,
    endLocation,
    stops,
    currentLocation,
    passengerLocation,
    lastRender,
    startCoords,
    endCoords,
    currentCoords,
    passengerCoords,
    currentLocation?.heading,
    startLocation.name,
    endLocation.name
  ]);

  const getDirectionsRoute = async (points: [number, number][]) => {
    try {
      // Create coordinates string for the API
      const coordinates = points.map(point => point.join(',')).join(';');

      const response = await fetch(
        `${MAPBOX_DIRECTIONS_API}/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );

      if (!response.ok) throw new Error('Failed to fetch route');

      const data = await response.json();
      return data.routes[0].geometry;
    } catch (error) {
      console.error('Error fetching directions:', error);
      return null;
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        <div ref={mapContainer} className="h-full min-h-[300px]">
          {(mapError || !mapLoaded) && (
            <div className="flex items-center justify-center h-full bg-muted">
              <div className="text-center p-4">
                <p className="text-muted-foreground mb-2">
                  {isRouteFetching
                    ? 'Calculating route...'
                    : 'Map could not be loaded'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Route from {startLocation.name} to {endLocation.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
