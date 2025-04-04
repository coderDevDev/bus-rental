import { Bus, Shield, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function AdminStats() {
  return (
    <>
      <h3 className="font-medium mb-2">System Overview</h3>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <Bus className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">24</p>
            <p className="text-sm text-muted-foreground">Buses</p>
          </CardContent>
        </Card>
        {/* Add other stats */}
      </div>
    </>
  );
}
