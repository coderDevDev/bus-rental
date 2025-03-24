'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

interface FareEstimatorProps {
  onBook: (routeId: string) => void;
}

export function FareEstimator({ onBook }: FareEstimatorProps) {
  const [passengers, setPassengers] = useState(1);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);

  const calculateFare = async () => {
    // Implementation for fare calculation
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fare Estimator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Number of Passengers</Label>
          <Input
            type="number"
            min="1"
            value={passengers}
            onChange={e => setPassengers(parseInt(e.target.value) || 1)}
          />
        </div>
        {estimatedFare && (
          <div className="text-center p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Estimated Fare</p>
            <p className="text-2xl font-bold">₱{estimatedFare.toFixed(2)}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="w-full" onClick={calculateFare}>
          <Calculator className="h-4 w-4 mr-2" />
          Calculate
        </Button>
        <Button
          className="w-full"
          onClick={() => selectedRoute && onBook(selectedRoute)}
          disabled={!selectedRoute}>
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
}
