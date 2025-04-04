import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function RouteProgress() {
  const progress = 75; // Replace with actual progress calculation
  const stops = [
    { id: '1', name: 'Stop 1', arrivalTime: '10:00 AM' },
    { id: '2', name: 'Stop 2', arrivalTime: '12:00 PM' },
    { id: '3', name: 'Stop 3', arrivalTime: '2:00 PM' },
    { id: '4', name: 'Stop 4', arrivalTime: '4:00 PM' },
    { id: '5', name: 'Stop 5', arrivalTime: '6:00 PM' }
  ];
  const currentStop = 2; // Replace with actual current stop calculation

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Route Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-maroon-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stops timeline */}
          <div className="space-y-4">
            {stops.map((stop, index) => (
              <div key={stop.id} className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full',
                    currentStop === index
                      ? 'bg-maroon-600'
                      : index < currentStop
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  )}
                />
                <div>
                  <p className="font-medium">{stop.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {stop.arrivalTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
