export function DailySummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold">{todayStats.ticketsIssued}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">₱{todayStats.revenue}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Ticket Breakdown</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Regular</span>
                <span>{regularCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Student</span>
                <span>{studentCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Senior</span>
                <span>{seniorCount}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
