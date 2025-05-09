'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  MapPin,
  Calendar,
  ArrowRight,
  Bus,
  Clock,
  Wallet,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Route, Location, SearchFormData, BookingData } from '@/types';
import { BusTracker } from '@/components/dashboard/bus-tracker';
import { FareEstimator } from '@/components/dashboard/fare-estimator';

interface SearchRoutesProps {
  onSearch: (data: SearchFormData) => void;
  results: Route[];
  onRouteSelect: (routeId: string) => void;
  selectedRoute: string | null;
  onBook: (data: BookingData) => void;
  locations: Location[];
}

export function SearchRoutes({
  onSearch,
  results,
  onRouteSelect,
  selectedRoute,
  onBook,
  locations
}: SearchRoutesProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ from, to, date });
  };

  const getAvailableSeats = (route: Route) => {
    const assignment = route.assignments?.[0];
    return assignment?.bus?.capacity || 0;
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="border-2 border-maroon-100 bg-maroon-50/30">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-maroon-800">
            Find Your Route
          </CardTitle>
          <CardDescription>
            Search available bus routes and schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-6">
              <div className="relative">
                <div className="absolute left-2 top-8">
                  <MapPin className="h-5 w-5 text-maroon-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from" className="text-maroon-700">
                    From
                  </Label>
                  <Select value={from} onValueChange={setFrom}>
                    <SelectTrigger
                      id="from"
                      className="pl-9 border-maroon-200 focus:ring-maroon-500">
                      <SelectValue placeholder="Select departure city" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.city}>
                          {location.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-2 top-8">
                  <MapPin className="h-5 w-5 text-maroon-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to" className="text-maroon-700">
                    To
                  </Label>
                  <Select value={to} onValueChange={setTo}>
                    <SelectTrigger
                      id="to"
                      className="pl-9 border-maroon-200 focus:ring-maroon-500">
                      <SelectValue placeholder="Select destination city" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.city}>
                          {location.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-2 top-8">
                  <Calendar className="h-5 w-5 text-maroon-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-maroon-700">
                    Travel Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="pl-9 border-maroon-200 focus:ring-maroon-500"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-maroon-600 hover:bg-maroon-700 text-white"
              size="lg">
              Search Routessss
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4">
            <h2 className="text-xl font-semibold text-maroon-800">
              Available Routesss
            </h2>
            {results.map(route => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}>
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                    selectedRoute === route.id
                      ? 'border-maroon-500 bg-maroon-50'
                      : 'border-transparent hover:border-maroon-200'
                  }`}
                  onClick={() => onRouteSelect(route.id)}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Route Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-maroon-800">
                            {route.name}
                          </h3>
                          <p className="text-sm text-maroon-600">
                            Route #{route.route_number || 'N/A'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            route.status === 'active' ? 'default' : 'secondary'
                          }>
                          {route.status}
                        </Badge>
                      </div>

                      {/* Route Path */}
                      <div className="flex items-center gap-4 py-3">
                        <div className="flex-1 flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-maroon-500" />
                          <p className="font-medium">
                            {route.from_location?.city}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-maroon-500" />
                        <div className="flex-1 flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-maroon-500" />
                          <p className="font-medium">
                            {route.to_location?.city}
                          </p>
                        </div>
                      </div>

                      {/* Route Details */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-maroon-100">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-maroon-500" />
                          <span className="text-sm">
                            {route.estimated_duration} mins
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-maroon-500" />
                          <span className="text-sm">₱{route.base_fare}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-maroon-500" />
                          <span className="text-sm">
                            {getAvailableSeats(route)} seats
                          </span>
                        </div>
                      </div>

                      {/* Bus Details */}
                      {route.assignments?.[0] && (
                        <div className="pt-4 border-t border-maroon-100">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Bus className="h-4 w-4 text-maroon-500" />
                              <span className="text-sm">
                                {route.assignments[0].bus?.bus_number}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-maroon-500" />
                              <span className="text-sm">
                                {format(
                                  new Date(route.assignments[0].start_date),
                                  'h:mm a'
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Route Details */}
      <AnimatePresence>
        {selectedRoute && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6">
            <BusTracker routeId={selectedRoute} />
            <FareEstimator
              route={results.find(r => r.id === selectedRoute)!}
              onBook={onBook}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
