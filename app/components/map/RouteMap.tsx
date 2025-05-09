'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location, RouteStop } from '@/types';
import mapboxSdk from '@mapbox/mapbox-sdk';
import directionsService from '@mapbox/mapbox-sdk/services/directions';

interface RouteMapProps {
  stops: RouteStop[];
  onStopSelect?: (location: Location) => void;
  className?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
mapboxgl.accessToken = MAPBOX_TOKEN;

// Initialize the Mapbox SDK client
const mapboxClient = mapboxSdk({ accessToken: MAPBOX_TOKEN });
const directionsClient = directionsService(mapboxClient);

export function RouteMap({
  stops,
  onStopSelect,
  className = ''
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const routeSourceRef = useRef<mapboxgl.GeoJSONSource | null>(null);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [121.0244, 14.5547], // Default center (Manila)
      zoom: 11
    });

    newMap.addControl(new mapboxgl.NavigationControl());

    // Wait for map to load before setting the ref
    newMap.on('load', () => {
      map.current = newMap;

      // Add source and layer for route
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
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
          'line-color': '#FF4444',
          'line-width': 4
        }
      });

      routeSourceRef.current = map.current.getSource(
        'route'
      ) as mapboxgl.GeoJSONSource;
    });

    return () => {
      newMap.remove();
      map.current = null;
      routeSourceRef.current = null;
    };
  }, []);

  // Get driving directions when stops change
  useEffect(() => {
    async function getDirections() {
      if (!map.current || !routeSourceRef.current || stops.length < 2) return;

      try {
        // Create waypoints from all stops
        const waypoints = stops.map(stop => ({
          coordinates: [stop.location.longitude, stop.location.latitude]
        }));

        const response = await directionsClient
          .getDirections({
            profile: 'driving',
            waypoints,
            geometries: 'geojson'
          })
          .send();

        if (response.body.routes && response.body.routes.length > 0) {
          const route = response.body.routes[0];

          // Update the route line with the actual driving path
          routeSourceRef.current.setData({
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          });

          // Fit bounds to show the entire route
          const bounds = new mapboxgl.LngLatBounds();
          route.geometry.coordinates.forEach(coord => {
            bounds.extend(coord as [number, number]);
          });
          map.current.fitBounds(bounds, { padding: 50 });
        }
      } catch (error) {
        console.error('Error getting directions:', error);
        // Fallback to straight lines if directions fail
        const coordinates = stops.map(stop => [
          stop.location.longitude,
          stop.location.latitude
        ]);

        routeSourceRef.current.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        });
      }
    }

    // Update markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    stops.forEach((stop, index) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = '#FF4444';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.innerHTML = `${index + 1}`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([stop.location.longitude, stop.location.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>Stop ${index + 1}</strong><br>${stop.location.city}, ${
              stop.location.state
            }<br>+${stop.arrivalOffset} mins`
          )
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Get directions for the route
    getDirections();
  }, [stops]);

  return (
    <div
      ref={mapContainer}
      className={`w-full h-[400px] rounded-lg ${className}`}
    />
  );
}
