import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MapPin, Clock, Route as RouteIcon } from 'lucide-react';
import type { Ticket } from '@/types';
import { calculateDistance } from '@/lib/geo-utils';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

interface JourneyHistoryProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
}

export function JourneyHistory({
  tickets,
  onSelectTicket
}: JourneyHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) {
      return false;
    }

    if (dateRange && dateRange.from && dateRange.to) {
      const ticketDate = new Date(ticket.created_at);
      if (dateRange.from > ticketDate || dateRange.to < ticketDate) {
        return false;
      }
    }

    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journey History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <RouteIcon className="h-5 w-5 text-maroon-600" />
                  <div>
                    <p className="text-sm font-medium">Total Journeys</p>
                    <p className="text-2xl font-bold">{tickets.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-maroon-600" />
                  <div>
                    <p className="text-sm font-medium">Total Distance</p>
                    <p className="text-2xl font-bold">
                      {tickets
                        .reduce((total, ticket) => {
                          const distance = calculateDistance(
                            {
                              latitude: ticket.from_location_latitude,
                              longitude: ticket.from_location_longitude
                            },
                            {
                              latitude: ticket.to_location_latitude,
                              longitude: ticket.to_location_longitude
                            }
                          );
                          return total + distance;
                        }, 0)
                        .toFixed(0)}{' '}
                      km
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-maroon-600" />
                  <div>
                    <p className="text-sm font-medium">Average Duration</p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        tickets.reduce((total, ticket) => {
                          if (!ticket.completed_at) return total;
                          const duration =
                            new Date(ticket.completed_at).getTime() -
                            new Date(ticket.created_at).getTime();
                          return total + duration / (1000 * 60); // Convert to minutes
                        }, 0) / tickets.length
                      )}{' '}
                      min
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Journeys</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map(ticket => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectTicket(ticket)}>
                  <TableCell>
                    {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {ticket.from_location} → {ticket.to_location}
                  </TableCell>
                  <TableCell>
                    {ticket.completed_at
                      ? `${Math.round(
                          (new Date(ticket.completed_at).getTime() -
                            new Date(ticket.created_at).getTime()) /
                            (1000 * 60)
                        )} min`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
