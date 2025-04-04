import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PassengerListProps } from './types';

export function PassengerList({
  passengers,
  onPassengerClick
}: PassengerListProps) {
  const getTicketTypeColor = (type: string) => {
    switch (type) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'senior':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="flex items-center justify-between">
          <span>Current Passengers</span>
          <Badge variant="outline">{passengers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] sm:h-[400px]">
          <div className="space-y-1">
            {passengers.map(passenger => (
              <button
                key={passenger.id}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-b last:border-0"
                onClick={() => onPassengerClick(passenger.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{passenger.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="shrink-0">
                        Seat {passenger.seatNumber}
                      </Badge>
                      <p className="text-sm text-muted-foreground truncate">
                        To: {passenger.destination}
                      </p>
                    </div>
                  </div>
                  <Badge className={getTicketTypeColor(passenger.ticketType)}>
                    {passenger.ticketType}
                  </Badge>
                </div>
              </button>
            ))}
            {passengers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <p>No passengers yet</p>
                <p className="text-sm mt-1">
                  Passengers will appear here once tickets are issued
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
