import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RouteProgressProps } from './types';
import { Badge } from '@/components/ui/badge';

export function RouteProgress({
  currentAssignment,
  currentLocation
}: RouteProgressProps) {
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
                {currentAssignment?.route.from_location.city} →{' '}
                {currentAssignment?.route.to_location.city}
              </p>
            </div>
            <Badge variant="outline" className="bg-maroon-50">
              In Progress
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-2 bg-gray-100 rounded-full">
              <div
                className="h-full bg-maroon-600 rounded-full transition-all"
                style={{ width: '75%' }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Departed</span>
              <span>75% Complete</span>
            </div>
          </div>

          {/* Stops */}
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-maroon-600" />
                <div>
                  <p className="font-medium">
                    {currentAssignment?.route.from_location.city}
                  </p>
                  <p className="text-sm text-muted-foreground">Departure</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div>
                  <p className="font-medium">
                    {currentAssignment?.route.to_location.city}
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
