import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import type { DailySummaryProps } from './types';
import { cn } from '@/lib/utils';

export function DailySummary({ stats, ticketBreakdown }: DailySummaryProps) {
  const totalTickets = Object.values(ticketBreakdown).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>Daily Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Tickets</p>
            <p className="text-2xl font-bold">{stats.ticketsIssued}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Hours</p>
            <p className="text-2xl font-bold">{stats.activeHours}h</p>
          </div>
          <div className="col-span-2 sm:col-span-1 space-y-1">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              ₱{stats.revenue.toFixed(2)}
            </p>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Ticket Types */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Ticket Types</h4>
          <div className="grid gap-4">
            {Object.entries(ticketBreakdown).map(([type, count]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{type}</span>
                  <span className="text-muted-foreground">
                    {count} (
                    {totalTickets > 0
                      ? Math.round((count / totalTickets) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <Progress
                  value={totalTickets > 0 ? (count / totalTickets) * 100 : 0}
                  className={cn(
                    type === 'student' && 'bg-blue-100',
                    type === 'senior' && 'bg-purple-100'
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
