import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { Check, Eye, X } from 'lucide-react';
import type { TicketManagementProps } from './types';

export function TicketManagement({
  tickets,
  onViewTicket,
  onCancelTicket,
  onApproveTicket
}: TicketManagementProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tickets</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ticket #</TableHead>
                <TableHead>Passenger</TableHead>
                <TableHead className="hidden md:table-cell">Route</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map(ticket => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    {ticket.ticket_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{ticket.passenger_name}</p>
                      <p className="md:hidden text-sm text-muted-foreground">
                        {ticket.from_location} → {ticket.to_location}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {ticket.from_location} → {ticket.to_location}
                  </TableCell>
                  <TableCell className="text-right">
                    ₱{ticket.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewTicket(ticket.id)}
                        className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {ticket.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onApproveTicket(ticket.id)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => onCancelTicket(ticket.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No tickets yet</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
