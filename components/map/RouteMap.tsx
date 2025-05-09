'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: stops[0]?.location
        ? [stops[0].location.longitude, stops[0].location.latitude]
        : [120.9842, 14.5995], // Default to Manila
      zoom: 9
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || stops.length < 2) return;

    map.current.on('style.load', () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

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

          if (map.current?.getSource('route')) {
            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            });
          } else {
            map.current?.addLayer({
              id: 'route',
              type: 'line',
              source: {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: route.geometry
                }
              },
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
          }

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
              .addTo(map.current!);

            if (onStopClick) {
              marker
                .getElement()
                .addEventListener('click', () => onStopClick(stop));
            }

            markersRef.current.push(marker);
          });

          const bounds = new mapboxgl.LngLatBounds();
          stops.forEach(stop => {
            bounds.extend([stop.location.longitude, stop.location.latitude]);
          });
          map.current?.fitBounds(bounds, { padding: 50 });
        });
    });
  }, [stops, onStopClick]);

  return (
    <div
      ref={mapContainer}
      className={`w-full h-[400px] rounded-lg ${className || ''}`}
    />
  );
}
