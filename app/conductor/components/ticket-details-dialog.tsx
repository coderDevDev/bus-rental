import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { TicketHistoryItem } from './types';

interface TicketDetailsDialogProps {
  ticket: TicketHistoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailsDialog({
  ticket,
  open,
  onOpenChange
}: TicketDetailsDialogProps) {
  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ticket Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Ticket Number</p>
              <p className="font-medium">{ticket.ticket_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge>{ticket.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Passenger</p>
              <p className="font-medium">{ticket.passenger_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium">₱{ticket.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-medium">{ticket.from_location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">To</p>
              <p className="font-medium">{ticket.to_location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(new Date(ticket.created_at), 'PPP')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
