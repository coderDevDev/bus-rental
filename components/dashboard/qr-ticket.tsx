'use client';

import QRCode from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import type { Ticket } from '@/types';

interface QRTicketProps {
  ticket: Ticket;
}

export function QRTicket({ ticket }: QRTicketProps) {
  const ticketData = JSON.stringify({
    id: ticket.id,
    seat: ticket.seat_number,
    route: ticket.route?.name
  });

  const handleDownload = () => {
    // Implementation for downloading ticket as PDF
  };

  const handleShare = () => {
    // Implementation for sharing ticket
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Digital Ticket</span>
          <Badge>{ticket.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <QRCode value={ticketData} size={200} />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold">{ticket.ticket_number}</p>
          <p className="text-sm text-muted-foreground">
            {ticket.route?.from_location?.city} →{' '}
            {ticket.route?.to_location?.city}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
