'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Ticket as TicketIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { Ticket } from '@/types';

interface TripHistoryProps {
  tickets: Ticket[];
  onViewTicket: (ticket: Ticket) => void;
}

export function TripHistory({ tickets, onViewTicket }: TripHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'upcoming'>('all');

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'completed') return ticket.status === 'completed';
    if (filter === 'upcoming') return ticket.status === 'booked';
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Trip History
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}>
              All
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}>
              Completed
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('upcoming')}>
              Upcoming
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Seat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map(ticket => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(ticket.travel_date), 'MMM d, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {ticket.route?.from_location?.city} →{' '}
                    {ticket.route?.to_location?.city}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {ticket.bus?.bus_number}
                    <Badge variant="outline">{ticket.bus?.bus_type}</Badge>
                  </div>
                </TableCell>
                <TableCell>Seat {ticket.seat_number}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      ticket.status === 'completed'
                        ? 'default'
                        : ticket.status === 'booked'
                        ? 'secondary'
                        : 'destructive'
                    }>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewTicket(ticket)}>
                    <TicketIcon className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
