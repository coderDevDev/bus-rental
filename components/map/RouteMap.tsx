'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location, RouteStop } from '@/types';
import mapboxSdk from '@mapbox/mapbox-sdk';
import directionsService from '@mapbox/mapbox-sdk/services/directions';

const mapboxClient = mapboxSdk({
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN
});
const directionsClient = directionsService(mapboxClient);

interface RouteMapProps {
  stops: RouteStop[];
  onStopClick?: (stop: RouteStop) => void;
  className?: string;
}

export function RouteMap({ stops, onStopClick, className }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: stops[0]?.location
        ? [stops[0].location.longitude, stops[0].location.latitude]
        : [120.9842, 14.5995], // Default to Manila
      zoom: 9
    });

    newMap.on('load', () => {
      setMapLoaded(true);
    });

    map.current = newMap;

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update markers and route when stops change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for all stops
    stops.forEach((stop, index) => {
      const marker = new mapboxgl.Marker({
        color: index === 0 ? '#22c55e' : '#ef4444'
      })
        .setLngLat([stop.location.longitude, stop.location.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<div class="font-medium">${stop.location.city}</div>
             <div class="text-sm text-gray-500">Stop #${index + 1}</div>`
          )
        )
        .addTo(map.current);

      if (onStopClick) {
        marker.getElement().addEventListener('click', () => onStopClick(stop));
      }

      markersRef.current.push(marker);
    });

    // If we have at least 2 stops, show the route
    if (stops.length >= 2) {
      const coordinates = stops.map(stop => ({
        coordinates: [stop.location.longitude, stop.location.latitude]
      }));

      directionsClient
        .getDirections({
          profile: 'driving',
          geometries: 'geojson',
          waypoints: coordinates
        })
        .send()
        .then(response => {
          const route = response.body.routes[0];

          // Remove existing route if any
          if (map.current?.getLayer('route')) {
            map.current.removeLayer('route');
          }
          if (map.current?.getSource('route')) {
            map.current.removeSource('route');
          }

          // Add new route
          map.current?.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
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
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.75
            }
          });
        })
        .catch(error => {
          console.error('Error getting directions:', error);
        });
    }

    // Fit bounds to show all markers
    if (stops.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      stops.forEach(stop => {
        bounds.extend([stop.location.longitude, stop.location.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [stops, mapLoaded, onStopClick]);

  return (
    <div
      ref={mapContainer}
      className={`w-full h-[400px] rounded-lg ${className || ''}`}
    />
  );
}
