import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Download,
  Share,
  MapPin,
  Calendar,
  Clock,
  User,
  CreditCard
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Ticket } from '@/types';
import { format } from 'date-fns';

interface TicketConfirmationProps {
  ticket: Ticket;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export function TicketConfirmation({
  ticket,
  onClose,
  onDownload,
  onShare
}: TicketConfirmationProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Booking Confirmed!</DialogTitle>
          <DialogDescription>
            Your ticket has been booked successfully
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-maroon-50 rounded-lg">
            <QRCodeSVG
              value={JSON.stringify({
                ticket_number: ticket.ticket_number,
                passenger_name: ticket.passenger_name,
                from: ticket.from_location,
                to: ticket.to_location,
                date: ticket.created_at
              })}
              size={200}
              level="H"
              includeMargin
            />
          </div>

          {/* Ticket Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Passenger
                </p>
                <p className="font-medium">{ticket.passenger_name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {ticket.passenger_type}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <CreditCard className="w-4 h-4 mr-1" />
                  Amount
                </p>
                <p className="font-medium">₱{ticket.amount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  Seat #{ticket.seat_number}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-maroon-500" />
                <div>
                  <p className="text-sm font-medium">
                    {ticket.from_location} → {ticket.to_location}
                  </p>
                  <p className="text-xs text-muted-foreground">Route</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-maroon-500" />
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(ticket.created_at), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">Travel Date</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-maroon-500" />
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(ticket.created_at), 'h:mm a')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Departure Time
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={onDownload}
              className="flex-1 bg-maroon-600 hover:bg-maroon-700">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={onShare} variant="outline" className="flex-1">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
