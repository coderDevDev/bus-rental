import { format, formatDistanceStrict } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TimeStatusProps {
  clockInTime: string;
  onClockOut: () => Promise<void>;
}

export function TimeStatus({ clockInTime, onClockOut }: TimeStatusProps) {
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const updateDuration = () => {
      setDuration(
        formatDistanceStrict(new Date(clockInTime), new Date(), {
          addSuffix: false,
          unit: 'minute'
        })
      );
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [clockInTime]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Clocked in at</p>
            <p className="font-medium">
              {format(new Date(clockInTime), 'h:mm a')}
            </p>
            <p className="text-sm text-muted-foreground">
              Duration: {duration}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600"
            onClick={onClockOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Clock Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
