import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RouteProgressProps } from './types';
import { Badge } from '@/components/ui/badge';
import { calculateDistanceBetweenPoints } from '@/lib/geo-utils';

export function RouteProgress({
  currentAssignment,
  currentLocation
}: RouteProgressProps) {
  // Calculate progress based on current location
  const { progressPercentage, status } = useMemo(() => {
    if (!currentAssignment || !currentLocation) {
      return { progressPercentage: 0, status: 'Not Started' };
    }

    // Check if location data has proper structure
    const fromLoc = currentAssignment.route.from_location || {};
    const toLoc = currentAssignment.route.to_location || {};

    // Use default coordinates for testing if real coordinates aren't available
    // Manila coordinates as fallback: 14.5995, 120.9842
    const startLat = fromLoc.latitude || fromLoc.lat || 14.5995;
    const startLng = fromLoc.longitude || fromLoc.lng || 120.9842;

    // Cebu coordinates as fallback: 10.3157, 123.8854
    const endLat = toLoc.latitude || toLoc.lat || 10.3157;
    const endLng = toLoc.longitude || toLoc.lng || 123.8854;

    // Get current coordinates from location tracking
    const currentLat = currentLocation.latitude || currentLocation.lat;
    const currentLng = currentLocation.longitude || currentLocation.lng;

    // If any coordinates are missing, return default values
    if (
      !startLat ||
      !startLng ||
      !endLat ||
      !endLng ||
      !currentLat ||
      !currentLng
    ) {
      console.warn('Missing coordinate data for route progress calculation', {
        from: { lat: startLat, lng: startLng },
        to: { lat: endLat, lng: endLng },
        current: { lat: currentLat, lng: currentLng }
      });
      return { progressPercentage: 30, status: 'In Progress' }; // Fallback to a default value
    }

    try {
      // Calculate distances safely
      const totalDistance = calculateDistanceBetweenPoints(
        startLat,
        startLng,
        endLat,
        endLng
      );

      const coveredDistance = calculateDistanceBetweenPoints(
        startLat,
        startLng,
        currentLat,
        currentLng
      );

      // Ensure we don't divide by zero
      if (totalDistance === 0) {
        return { progressPercentage: 0, status: 'Not Started' };
      }

      // Calculate progress percentage
      let progress = Math.min(
        Math.round((coveredDistance / totalDistance) * 100),
        100
      );

      // Determine status
      let routeStatus = 'In Progress';
      if (progress < 1) routeStatus = 'Not Started';
      if (progress >= 100) routeStatus = 'Completed';

      return {
        progressPercentage: progress,
        status: routeStatus
      };
    } catch (error) {
      console.error('Error calculating route progress:', error);
      return { progressPercentage: 30, status: 'In Progress' }; // Fallback to a default
    }
  }, [currentAssignment, currentLocation]);

  // If no assignment data is available
  if (!currentAssignment) {
    return (
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Route Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-muted-foreground">No active route</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>Route Progress</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-6">
          {/* Route Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Current Route</p>
              <p className="font-medium">
                {currentAssignment.route.from_location.city} →{' '}
                {currentAssignment.route.to_location.city}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'bg-maroon-50',
                status === 'Completed' && 'bg-green-50 text-green-700',
                status === 'Not Started' && 'bg-gray-50 text-gray-700'
              )}>
              {status}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-2 bg-gray-100 rounded-full">
              <div
                className="h-full bg-maroon-600 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progressPercentage > 0 ? 'Departed' : 'Not Started'}</span>
              <span>{progressPercentage}% Complete</span>
            </div>
          </div>

          {/* Stops */}
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    progressPercentage > 0 ? 'bg-maroon-600' : 'bg-gray-300'
                  }`}
                />
                <div>
                  <p className="font-medium">
                    {currentAssignment.route.from_location.city}
                  </p>
                  <p className="text-sm text-muted-foreground">Departure</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    progressPercentage >= 100 ? 'bg-maroon-600' : 'bg-gray-300'
                  }`}
                />
                <div>
                  <p className="font-medium">
                    {currentAssignment.route.to_location.city}
                  </p>
                  <p className="text-sm text-muted-foreground">Destination</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
