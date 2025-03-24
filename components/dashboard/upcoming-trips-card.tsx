import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Ticket } from '@/types';
import { Bus, Calendar } from 'lucide-react';

interface UpcomingTripsCardProps {
  tickets: Ticket[];
}

export function UpcomingTripsCard({ tickets }: UpcomingTripsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Trips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tickets.length === 0 ? (
          <p className="text-center text-muted-foreground">No upcoming trips</p>
        ) : (
          tickets.map(ticket => (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">
                  {ticket.route?.from_location} → {ticket.route?.to_location}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(ticket.travel_date), 'PPP')}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bus className="h-4 w-4" />
                  Bus {ticket.bus?.bus_number}
                </div>
              </div>
              <Badge>{ticket.status}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
