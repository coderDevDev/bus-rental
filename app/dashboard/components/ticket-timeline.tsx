import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TicketTimelineProps {
  status: string;
  fromLocation: string;
  toLocation: string;
  departureTime?: string;
  arrivalTime?: string;
  currentProgress: number;
}

export function TicketTimeline({
  status,
  fromLocation,
  toLocation,
  departureTime,
  arrivalTime,
  currentProgress
}: TicketTimelineProps) {
  const steps = [
    {
      title: 'Ticket Booked',
      icon: CheckCircle2,
      done: true
    },
    {
      title: 'At Pickup Point',
      icon: MapPin,
      done: currentProgress > 0
    },
    {
      title: 'Journey Started',
      icon: Clock,
      done: currentProgress > 5
    },
    {
      title: 'Arriving Soon',
      icon: MapPin,
      done: currentProgress > 90
    },
    {
      title: 'Journey Completed',
      icon: CheckCircle2,
      done: status === 'completed'
    }
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-medium">{fromLocation}</p>
              {departureTime && (
                <p className="text-muted-foreground">
                  {format(new Date(departureTime), 'h:mm a')}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium">{toLocation}</p>
              {arrivalTime && (
                <p className="text-muted-foreground">
                  {format(new Date(arrivalTime), 'h:mm a')}
                </p>
              )}
            </div>
          </div>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-4 left-2 right-2 h-0.5 bg-gray-200">
              <div
                className="h-full bg-maroon-600 transition-all duration-500"
                style={{ width: `${currentProgress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className={cn(
                    'flex flex-col items-center gap-2',
                    step.done && 'text-maroon-600'
                  )}>
                  <step.icon
                    className={cn(
                      'h-8 w-8 bg-white rounded-full',
                      step.done ? 'text-maroon-600' : 'text-gray-300'
                    )}
                  />
                  <span className="text-xs text-center">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
