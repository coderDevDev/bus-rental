import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Ticket } from '@/types';
import { Bus, Calendar, MapPin } from 'lucide-react';

interface TicketsCardProps {
  tickets: Ticket[];
}

export function TicketsCard({ tickets }: TicketsCardProps) {
  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'booked':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tickets.length === 0 ? (
          <p className="text-center text-muted-foreground">No tickets found</p>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">
                    {ticket.route?.from_location} → {ticket.route?.to_location}
                  </p>
                </div>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(ticket.travel_date), 'PPP')}
                </div>
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  Bus {ticket.bus?.bus_number}
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Ticket #:</span>{' '}
                {ticket.ticket_number}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
