'use client';

import { useState } from 'react';
import { Location, Route } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RouteMap } from '../map/RouteMap';
import { routeService } from '@/services/route-service';

export function RouteSearch() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // This would need to be implemented in your route service
      const routes = await routeService.findRoutes(origin, destination);
      setAvailableRoutes(routes);
    } catch (error) {
      console.error('Error searching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Enter origin"
          value={origin}
          onChange={e => setOrigin(e.target.value)}
        />
        <Input
          placeholder="Enter destination"
          value={destination}
          onChange={e => setDestination(e.target.value)}
        />
      </div>

      <Button onClick={handleSearch} className="w-full" disabled={loading}>
        {loading ? 'Searching...' : 'Find Routes'}
      </Button>

      {availableRoutes.length > 0 ? (
        <div className="space-y-4">
          {availableRoutes.map(route => (
            <Card
              key={route.id}
              className="p-4 cursor-pointer hover:bg-accent"
              onClick={() => setSelectedRoute(route)}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Route {route.route_number}</h3>
                  <p className="text-sm text-muted-foreground">{route.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₱{route.base_fare}</p>
                  <p className="text-sm text-muted-foreground">
                    {route.estimated_duration} mins
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          No routes found. Try different locations.
        </p>
      )}

      {selectedRoute && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Selected Route</h3>
          <RouteMap stops={selectedRoute.stops} />
          <div className="mt-4 space-y-2">
            {selectedRoute.stops.map((stop, index) => (
              <div key={stop.location.id} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                <span>
                  {stop.location.city}, {stop.location.state}
                </span>
                <span className="text-sm text-muted-foreground ml-auto">
                  +{stop.arrivalOffset} mins
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
