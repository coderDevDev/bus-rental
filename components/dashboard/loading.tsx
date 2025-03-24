import { Skeleton } from '../ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <Skeleton className="h-[150px] w-full rounded-lg" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
}
