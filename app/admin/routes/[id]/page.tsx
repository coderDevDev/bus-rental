'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, DollarSign, Bus } from 'lucide-react';
import { routeService } from '@/services/route-service';
import { RouteMap } from '@/components/map/RouteMap';
import type { RouteWithLocations } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoutePage({ params }: PageProps) {
  const router = useRouter();
  const [route, setRoute] = useState<RouteWithLocations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = use(params);

  useEffect(() => {
    const loadRoute = async () => {
      try {
        setIsLoading(true);
        const data = await routeService.getRouteById(id);
        setRoute(data);
      } catch (error) {
        console.error('Error loading route:', error);
        router.push('/admin/routes');
      } finally {
        setIsLoading(false);
      }
    };

    loadRoute();
  }, [id, router]);

  // Convert point-to-point route to stops format if needed
  const getRouteStops = () => {
    if (!route) return [];

    if (route.stops?.length > 0) {
      return route.stops;
    }

    if (route.from_location && route.to_location) {
      return [
        {
          location: route.from_location,
          stopNumber: 1,
          arrivalOffset: 0
        },
        {
          location: route.to_location,
          stopNumber: 2,
          arrivalOffset: route.estimated_duration
        }
      ];
    }

    return [];
  };

  if (isLoading || !route) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-primary text-primary-foreground z-10">
        <div className="container flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-primary-foreground">
            <Link href="/admin/routes">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">
            Route Details
          </h1>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="ml-auto text-primary-foreground">
            <Link href={`/admin/routes/edit/${route.id}`}>Edit Route</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {route.name}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({route.route_number})
                  </span>
                </CardTitle>
                <CardDescription>Route information and stops</CardDescription>
              </div>
              <Badge
                className={
                  route.status === 'active'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white'
                }>
                {route.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Map View */}
            <div className="border rounded-lg overflow-hidden">
              <RouteMap stops={getRouteStops()} className="h-[400px]" />
            </div>

            {/* Route Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">Distance</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{route.distance} km</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Duration</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {route.estimated_duration} mins
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">Base Fare</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    ₱{route.base_fare.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4" />
                    <span className="font-medium">Assigned Buses</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {route.assignments?.length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stops List */}
            <div>
              <h3 className="text-lg font-medium mb-4">Route Stops</h3>
              <div className="space-y-3">
                {getRouteStops().map((stop, index) => (
                  <div
                    key={stop.location.id}
                    className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">
                        {stop.location.city}, {stop.location.state}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stop.arrivalOffset === 0
                          ? 'Starting Point'
                          : `+${stop.arrivalOffset} mins`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bus Assignments */}
            {route.assignments && route.assignments.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Assigned Buses</h3>
                <div className="space-y-3">
                  {route.assignments.map(assignment => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="font-medium">
                          {assignment.bus.bus_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Capacity: {assignment.bus.capacity} seats
                        </p>
                      </div>
                      <Badge
                        className={
                          assignment.status === 'active'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }>
                        {assignment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
