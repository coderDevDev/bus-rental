import type { Ticket } from '@/types';
import { format } from 'date-fns';
import { Bus, Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TicketListProps {
  tickets: Ticket[];
  onSelect?: (ticket: Ticket) => void;
}

export function TicketList({ tickets, onSelect }: TicketListProps) {
  if (!tickets.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tickets found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map(ticket => (
        <div
          key={ticket.id}
          className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50"
          onClick={() => onSelect?.(ticket)}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">
                {ticket.route?.from_location?.city || 'N/A'} →{' '}
                {ticket.route?.to_location?.city || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(ticket.travel_date), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Bus className="h-4 w-4" />
                <span>
                  {ticket.bus?.bus_number} ({ticket.bus?.bus_type})
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={
                ticket.status === 'booked'
                  ? 'default'
                  : ticket.status === 'completed'
                  ? 'secondary'
                  : 'destructive'
              }>
              {ticket.status}
            </Badge>
            <p className="text-sm font-medium">
              ₱{ticket.fare_amount.toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
