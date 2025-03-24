'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, Calendar } from 'lucide-react';
import type { Location } from '@/types';

interface SearchCardProps {
  locations: Location[];
  onSubmit: (searchParams: { from: string; to: string; date: string }) => void;
}

export function SearchCard({ locations, onSubmit }: SearchCardProps) {
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchData.from || !searchData.to) {
      return;
    }

    console.log({ searchData });
    onSubmit(searchData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Routes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Select
                value={searchData.from}
                onValueChange={value =>
                  setSearchData(prev => ({ ...prev, from: value }))
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Select departure" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.city}, {location.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Select
                value={searchData.to}
                onValueChange={value =>
                  setSearchData(prev => ({ ...prev, to: value }))
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.city}, {location.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={searchData.date}
                onChange={e =>
                  setSearchData(prev => ({ ...prev, date: e.target.value }))
                }
                min={new Date().toISOString().split('T')[0]}
              />
              <Button
                type="submit"
                disabled={!searchData.from || !searchData.to}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
