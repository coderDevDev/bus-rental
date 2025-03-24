import type { Route } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, MapPin } from 'lucide-react';

interface PopularRoutesCardProps {
  routes: Route[];
}

export function PopularRoutesCard({ routes }: PopularRoutesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Routes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {routes.map(route => (
            <div
              key={route.id}
              className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">{route.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <p>{route.from_location?.city}</p>
                  <ArrowRight className="h-4 w-4" />
                  <p>{route.to_location?.city}</p>
                </div>
              </div>
              <p className="text-sm font-medium">
                ₱{route.base_fare.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
