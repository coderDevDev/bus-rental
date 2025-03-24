import type { Route } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';

interface RouteCardProps {
  route: Route;
  onClick?: () => void;
}

export function RouteCard({ route, onClick }: RouteCardProps) {
  return (
    <Card className="hover:bg-accent/50 cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{route.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <p>{route.from_location?.city || 'N/A'}</p>
              <ArrowRight className="h-4 w-4" />
              <p>{route.to_location?.city || 'N/A'}</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            ₱{route.base_fare.toFixed(2)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
