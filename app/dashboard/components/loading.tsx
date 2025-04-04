import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95">
        <div className="container flex h-14 items-center justify-between px-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>

      <main className="container py-6 px-4 space-y-6">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </main>
    </div>
  );
}
