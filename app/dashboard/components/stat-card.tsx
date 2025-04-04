import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-1 text-2xl font-bold">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div className="mt-1 flex items-center text-xs">
                <span
                  className={
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }>
                  {trend.isPositive ? '+' : '-'}
                  {trend.value}%
                </span>
                <span className="ml-1 text-muted-foreground">
                  vs. last month
                </span>
              </div>
            )}
          </div>
          <div className="rounded-full p-3 bg-maroon-100/50">
            <Icon className="h-5 w-5 text-maroon-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
