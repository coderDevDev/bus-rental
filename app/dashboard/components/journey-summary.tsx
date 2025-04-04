import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Route as RouteIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { Ticket } from '@/types';

interface JourneySummaryProps {
  ticket: Ticket;
  duration: number; // in minutes
  distance: number; // in kilometers
}

export function JourneySummary({
  ticket,
  duration,
  distance
}: JourneySummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Journey Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-maroon-600" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-2xl font-bold">{duration} min</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-maroon-600" />
              <span className="text-sm font-medium">Distance</span>
            </div>
            <p className="text-2xl font-bold">{distance.toFixed(1)} km</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-maroon-600" />
              <span className="text-sm font-medium">Stops</span>
            </div>
            <p className="text-2xl font-bold">2</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-medium">{ticket.from_location}</p>
              <p className="text-muted-foreground">
                {format(new Date(ticket.created_at), 'h:mm a')}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{ticket.to_location}</p>
              <p className="text-muted-foreground">
                {format(new Date(ticket.completed_at || ''), 'h:mm a')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Journey Details</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Ticket #{ticket.ticket_number}</li>
              <li>Seat {ticket.seat_number}</li>
              <li>
                ₱{ticket.amount.toFixed(2)} paid via {ticket.payment_method}
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
