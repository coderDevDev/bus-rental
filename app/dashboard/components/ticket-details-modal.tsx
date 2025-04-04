import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import type { Ticket } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Share } from 'lucide-react';
import { ticketService } from '../services/ticket-service';
import { useToast } from '@/components/ui/use-toast';

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailsModal({
  ticket,
  open,
  onOpenChange
}: TicketDetailsModalProps) {
  const { toast } = useToast();

  if (!ticket) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDownload = async () => {
    if (!ticket) return;
    try {
      await ticketService.downloadTicket(ticket);
      toast({
        title: 'Success',
        description: 'Ticket downloaded successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download ticket',
        variant: 'destructive'
      });
    }
  };

  const handleShare = async () => {
    if (!ticket) return;
    try {
      const result = await ticketService.shareTicket(ticket);
      toast({
        title: 'Success',
        description:
          result === 'copied'
            ? 'Ticket link copied to clipboard'
            : 'Ticket shared successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to share ticket',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ticket Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={
                  ticket.qr_code ||
                  JSON.stringify({
                    id: ticket.id,
                    number: ticket.ticket_number
                  })
                }
                size={200}
              />
            </div>
          </div>

          {/* Ticket Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Ticket #{ticket.ticket_number}
              </h3>
              <Badge
                variant="outline"
                className={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">From</p>
                <p className="font-medium">{ticket.from_location}</p>
              </div>
              <div>
                <p className="text-muted-foreground">To</p>
                <p className="font-medium">{ticket.to_location}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Passenger</p>
                <p className="font-medium">{ticket.passenger_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Seat</p>
                <p className="font-medium">{ticket.seat_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">₱{ticket.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment</p>
                <p className="font-medium capitalize">
                  {ticket.payment_method}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">
                  {format(new Date(ticket.created_at), 'PPP')}
                </p>
              </div>
              {ticket.completed_at && (
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-medium">
                    {format(new Date(ticket.completed_at), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
