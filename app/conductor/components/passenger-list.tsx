export function PassengerList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Passengers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {passengers.map(passenger => (
            <div
              key={passenger.id}
              className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium">{passenger.name}</p>
                <p className="text-sm text-muted-foreground">
                  Seat {passenger.seatNumber}
                </p>
              </div>
              <Badge>{passenger.destination}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
