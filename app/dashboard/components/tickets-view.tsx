'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import type { Ticket } from '@/types';
import { TicketDetailsModal } from './ticket-details-modal';
import { useState } from 'react';
import { ticketService } from '../services/ticket-service';
import { useToast } from '@/components/ui/use-toast';

interface TicketsViewProps {
  tickets: Ticket[];
  onCancel: (ticketId: string) => void;
  onDownload: (ticketId: string) => void;
  onShare: (ticketId: string) => void;
}

export function TicketsView({
  tickets,
  onCancel,
  onDownload,
  onShare
}: TicketsViewProps) {
  const activeTickets = tickets.filter(t => t.status === 'active');
  const pastTickets = tickets.filter(t => t.status !== 'active');

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const { toast } = useToast();

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

  const handleDownload = async (ticket: Ticket) => {
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

  const handleShare = async (ticket: Ticket) => {
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
    <div className="space-y-8">
      {/* Active Tickets */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-maroon-800">
          Active Tickets
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {activeTickets.map(ticket => (
            <Card
              key={ticket.id}
              className="overflow-hidden border-2 hover:border-maroon-200">
              <CardHeader className="bg-maroon-50 border-b border-maroon-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-maroon-800">
                      Ticket #{ticket.ticket_number}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(ticket.created_at), 'PPP')}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="font-medium">{ticket.from_location}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">To</p>
                      <p className="font-medium">{ticket.to_location}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Passenger</p>
                      <p className="font-medium">{ticket.passenger_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Seat</p>
                      <p className="font-medium">{ticket.seat_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">₱{ticket.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment</p>
                      <p className="font-medium capitalize">
                        {ticket.payment_method}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t p-4">
                <div className="flex justify-end gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedTicket(ticket)}>
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(ticket)}>
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => handleShare(ticket)}>
                    Share
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onCancel(ticket.id)}>
                    Cancel
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Past Tickets */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-maroon-800">Past Tickets</h2>
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastTickets.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    {ticket.ticket_number}
                  </TableCell>
                  <TableCell>
                    {ticket.from_location} → {ticket.to_location}
                  </TableCell>
                  <TableCell>
                    {format(new Date(ticket.created_at), 'PP')}
                  </TableCell>
                  <TableCell>₱{ticket.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(ticket)}>
                        Download
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(ticket)}>
                        Share
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <TicketDetailsModal
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={open => !open && setSelectedTicket(null)}
      />
    </div>
  );
}
