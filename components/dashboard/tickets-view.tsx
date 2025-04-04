interface TicketsViewProps {
  tickets: Ticket[];
  onViewTicket: (ticketId: string) => void;
  onCancelTicket: (ticketId: string) => void;
}

export function TicketsView({
  tickets,
  onViewTicket,
  onCancelTicket
}: TicketsViewProps) {
  const activeTickets = tickets.filter(t => t.status === 'active');
  const pastTickets = tickets.filter(t => t.status !== 'active');

  return (
    <div className="space-y-6">
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
                    className="bg-maroon-100 text-maroon-800">
                    Active
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

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">₱{ticket.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Seat</p>
                      <p className="font-medium">{ticket.seat_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">
                        {ticket.passenger_type}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t p-4">
                <div className="flex justify-end gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => onViewTicket(ticket.id)}>
                    View Details
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onCancelTicket(ticket.id)}>
                    Cancel Ticket
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
                <TableHead></TableHead>
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
                  <TableCell>₱{ticket.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewTicket(ticket.id)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
