'use client';

import { useState, useEffect } from 'react';
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
  Users,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type {
  Route,
  Location,
  SearchFormData,
  BookingData,
  Ticket,
  RouteWithLocations
} from '@/types';
import {
  formatDistance,
  formatDuration,
  calculateTotalFare,
  calculatePassengerFare
} from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { TicketConfirmation } from './ticket-confirmation';
import { generateTicketPDF } from '@/lib/pdf-generator';
import { routeService } from '@/services/route-service';

import { RouteMap } from '@/components/map/RouteMap';

interface SearchRoutesProps {
  locations: Location[];
  onSearch: (data: SearchFormData) => Promise<RouteWithLocations[]>;
  results: RouteWithLocations[];
  onRouteSelect: (routeId: string) => void;
  selectedRoute: string | null;
  onBook: (data: BookingData) => Promise<Ticket>;
}

export function SearchRoutes({
  locations,
  onSearch,
  results,
  onRouteSelect,
  selectedRoute,
  onBook
}: SearchRoutesProps) {
  const { user } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [confirmedTicket, setConfirmedTicket] = useState<Ticket | null>(null);
  const [takenSeats, setTakenSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [passengers, setPassengers] = useState<
    Array<{
      name: string;
      type: 'regular' | 'student' | 'senior';
      seatNumber: string;
    }>
  >([]);

  // Add new state for selected boarding/destination stops
  const [selectedBoardingStop, setSelectedBoardingStop] = useState<number>(0);
  const [selectedDestinationStop, setSelectedDestinationStop] =
    useState<number>(0);

  const [paymentMethod, setPaymentMethod] = useState<
    'cash' | 'card' | 'ewallet'
  >('cash');

  useEffect(() => {
    if (user) {
      const userName =
        user.user_metadata?.name || user.email?.split('@')[0] || '';
      setPassengers([
        {
          name: userName,
          type: 'regular',
          seatNumber: ''
        }
      ]);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchTakenSeats = async () => {
      if (selectedRoute) {
        const route = results.find(r => r.id === selectedRoute);
        const assignmentId = route?.assignments?.[0]?.id;
        if (assignmentId) {
          const seats = await routeService.getTakenSeats(assignmentId);
          setTakenSeats(seats);
        }
      }
    };

    fetchTakenSeats();
  }, [selectedRoute, results]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const searchData = {
        from,
        to,
        date
      };

      const results = await onSearch(searchData);

      // Results now include both direct routes and routes with stops
      console.log('Search results:', results);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search routes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get route stops
  const getRouteStops = (route: RouteWithLocations) => {
    if (route.stops?.length > 0) {
      console.log({ stops: route.stops });
      return route.stops;
    }

    if (route.from_location && route.to_location) {
      return [
        {
          location: route.from_location,
          stopNumber: 1,
          arrivalOffset: 0
        },
        {
          location: route.to_location,
          stopNumber: 2,
          arrivalOffset: route.estimated_duration
        }
      ];
    }

    return [];
  };

  // Helper function to format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Helper function to format distance
  const formatDistance = (km: number) => {
    return `${km.toFixed(1)} km`;
  };

  // Helper function to get available seats
  const getAvailableSeats = (route: RouteWithLocations) => {
    const assignment = route.assignments?.[0];
    if (!assignment) return 0;

    const capacity = assignment.bus.capacity;
    const takenSeats = assignment.taken_seats?.length || 0;
    return capacity - takenSeats;
  };

  const selectedRouteData = results.find(r => r.id === selectedRoute) as
    | RouteWithLocations
    | undefined;

  // Add helper function to calculate segment fare
  const calculateSegmentFare = (
    route: RouteWithLocations | undefined,
    fromIndex: number,
    toIndex: number
  ) => {
    if (!route?.stops || fromIndex >= toIndex) return 0;

    // Calculate distance ratio for the segment
    const totalStops = route.stops.length;
    const segmentRatio = (toIndex - fromIndex) / (totalStops - 1);
    return route.base_fare * segmentRatio;
  };

  // Add this helper function at the top of the file
  const calculatePassengerDiscount = (
    type: 'regular' | 'student' | 'senior'
  ): number => {
    switch (type) {
      case 'student':
        return 0.2; // 20% discount
      case 'senior':
        return 0.2; // 20% discount
      default:
        return 0; // no discount
    }
  };

  const handleBooking = async (route: RouteWithLocations) => {
    try {
      // 1. Validate route and assignment data
      if (!route?.stops || !route.assignments?.[0]) {
        toast({
          title: 'Booking Error',
          description: 'Route information is incomplete',
          variant: 'destructive'
        });
        return;
      }

      // 2. Validate conductor assignment
      const conductor = route.assignments[0].conductor;
      if (!conductor?.id) {
        toast({
          title: 'Booking Error',
          description: 'No conductor assigned to this route',
          variant: 'destructive'
        });
        return;
      }

      // 3. Validate stop selection
      if (selectedBoardingStop === selectedDestinationStop) {
        toast({
          title: 'Invalid Stop Selection',
          description: 'Boarding point and destination must be different stops',
          variant: 'destructive'
        });
        return;
      }

      // 4. Validate passenger data
      if (passengers.length === 0) {
        toast({
          title: 'Invalid Passengers',
          description: 'Please add at least one passenger',
          variant: 'destructive'
        });
        return;
      }

      // 5. Validate passenger details
      const invalidPassengers = passengers.some(
        p => !p.name || !p.type || !p.seatNumber
      );
      if (invalidPassengers) {
        toast({
          title: 'Incomplete Passenger Details',
          description:
            'Please fill in all passenger information including seats',
          variant: 'destructive'
        });
        return;
      }

      // 6. Get stop information
      const fromStop = route.stops[selectedBoardingStop];
      const toStop = route.stops[selectedDestinationStop];

      // 7. Validate stop data
      if (!fromStop?.location || !toStop?.location) {
        toast({
          title: 'Invalid Stop Data',
          description: 'Stop location information is missing',
          variant: 'destructive'
        });
        return;
      }

      // Debug logging
      console.log('Stop Data:', {
        fromStop,
        toStop,
        fromLocation: fromStop.location,
        toLocation: toStop.location
      });

      // 8. Check for duplicate seat selections
      const seatNumbers = passengers.map(p => p.seatNumber);
      const hasDuplicates = seatNumbers.length !== new Set(seatNumbers).size;
      if (hasDuplicates) {
        toast({
          title: 'Invalid Seat Selection',
          description: 'Each passenger must have a unique seat',
          variant: 'destructive'
        });
        return;
      }

      // 9. Check if seats are already taken
      const hasConflict = passengers.some(p =>
        takenSeats.includes(p.seatNumber)
      );
      if (hasConflict) {
        toast({
          title: 'Seat Conflict',
          description: 'One or more selected seats are no longer available',
          variant: 'destructive'
        });
        return;
      }

      const segmentFare = calculateSegmentFare(
        route,
        selectedBoardingStop,
        selectedDestinationStop
      );

      // Calculate total amount with discounts
      const totalAmount = passengers.reduce((total, passenger) => {
        const discount = calculatePassengerDiscount(passenger.type);
        return total + segmentFare * (1 - discount);
      }, 0);

      const bookingData: BookingData = {
        passenger_id: user?.id,
        route_id: route.id,
        assignment_id: route.assignments[0].id,
        conductor_id: conductor.id,
        from_location_id: fromStop.location.id,
        to_location_id: toStop.location.id,
        from_location: fromStop.location.city,
        to_location: toStop.location.city,
        departure_time: new Date(
          Date.now() + fromStop.arrivalOffset * 60000
        ).toISOString(),
        arrival_time: new Date(
          Date.now() + toStop.arrivalOffset * 60000
        ).toISOString(),
        amount: totalAmount,
        payment_method: paymentMethod,
        passengers: passengers.map(p => ({
          name: p.name.trim(),
          passenger_type: p.type,
          seat_number: p.seatNumber,
          fare: segmentFare * (1 - calculatePassengerDiscount(p.type)),
          status: 'active' as const
        }))
      };

      // Debug logging
      console.log('Booking Data:', bookingData);

      // 11. Submit booking
      const ticket = await onBook(bookingData);

      console.log('success');
      // 12. Handle success
      setConfirmedTicket(ticket);
      setBookingDialog(false);

      // 13. Reset form
      setPassengers([
        {
          name: user?.user_metadata?.name || '',
          type: 'regular',
          seatNumber: ''
        }
      ]);

      // 14. Show success message
      toast({
        title: 'Success',
        description: 'Tickets booked successfully!',
        variant: 'default'
      });
    } catch (error) {
      // 15. Handle specific error types
      console.error('Booking error:', error);

      let errorMessage = 'Failed to book tickets';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error format
        const supabaseError = error as { message?: string; details?: string };
        errorMessage =
          supabaseError.details || supabaseError.message || errorMessage;
      }

      toast({
        title: 'Booking Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const addPassenger = () => {
    setPassengers([
      ...passengers,
      { name: '', type: 'regular', seatNumber: '' }
    ]);
  };

  const BusSeatLayout = ({
    capacity = 0,
    selectedSeat = '',
    onSeatSelect,
    takenSeats = []
  }: {
    capacity: number;
    selectedSeat: string;
    onSeatSelect: (seat: string) => void;
    takenSeats: string[];
  }) => {
    const seatsPerRow = 4; // 2 seats on each side
    const rows = Math.ceil(capacity / seatsPerRow);

    return (
      <div className="relative w-full max-w-md mx-auto bg-white rounded-lg p-4 border border-maroon-200">
        {/* Driver's area */}
        <div className="flex items-center justify-center mb-6 border-b border-maroon-200 pb-4">
          <div className="w-12 h-12 bg-maroon-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-maroon-700">Driver</span>
          </div>
        </div>

        {/* Seats grid */}
        <div className="grid gap-y-2">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex justify-between">
              {/* Left side seats */}
              <div className="flex gap-2">
                {[0, 1].map(seatIndex => {
                  const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
                  if (seatNumber > capacity) return null;
                  return (
                    <button
                      key={seatNumber}
                      onClick={() => onSeatSelect(String(seatNumber))}
                      disabled={takenSeats.includes(String(seatNumber))}
                      className={cn(
                        'w-10 h-10 rounded-t-lg border-2 flex items-center justify-center text-sm transition-colors',
                        takenSeats.includes(String(seatNumber))
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : selectedSeat === String(seatNumber)
                          ? 'bg-maroon-100 border-maroon-700 text-maroon-700'
                          : 'border-maroon-200 hover:border-maroon-700 hover:bg-maroon-50'
                      )}>
                      {seatNumber}
                    </button>
                  );
                })}
              </div>

              {/* Aisle */}
              <div className="w-8" />

              {/* Right side seats */}
              <div className="flex gap-2">
                {[2, 3].map(seatIndex => {
                  const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
                  if (seatNumber > capacity) return null;
                  return (
                    <button
                      key={seatNumber}
                      onClick={() => onSeatSelect(String(seatNumber))}
                      disabled={takenSeats.includes(String(seatNumber))}
                      className={cn(
                        'w-10 h-10 rounded-t-lg border-2 flex items-center justify-center text-sm transition-colors',
                        takenSeats.includes(String(seatNumber))
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : selectedSeat === String(seatNumber)
                          ? 'bg-maroon-100 border-maroon-700 text-maroon-700'
                          : 'border-maroon-200 hover:border-maroon-700 hover:bg-maroon-50'
                      )}>
                      {seatNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-maroon-200 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-maroon-200" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-maroon-100 border-2 border-maroon-700" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200" />
            <span>Taken</span>
          </div>
        </div>
      </div>
    );
  };

  const isSeatAvailable = (seatNumber: string) => {
    return (
      !takenSeats.includes(seatNumber) &&
      !passengers.some(p => p.seatNumber === seatNumber)
    );
  };

  const getSeatStatus = (seatNumber: string) => {
    if (takenSeats.includes(seatNumber)) return 'taken';
    if (passengers.some(p => p.seatNumber === seatNumber)) return 'selected';
    return 'available';
  };

  // Display route information
  const renderRouteInfo = (route: RouteWithLocations) => {
    return (
      <div className="space-y-4">
        {/* Route Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bus className="h-5 w-5 text-maroon-600" />
            <div>
              <h3 className="font-semibold text-lg">
                Route {route.route_number}
              </h3>
              <p className="text-sm text-muted-foreground">{route.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-maroon-500" />
            <span className="text-sm">
              {getAvailableSeats(route)} available /{' '}
              {route.assignments?.[0]?.bus?.capacity || 0} total
            </span>
          </div>
        </div>

        {/* Route Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* From Location */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              From
            </p>
            <p className="font-medium">{route.from_location?.city}</p>
            <p className="text-sm text-muted-foreground">
              {route.from_location?.state}
            </p>
          </div>

          {/* To Location */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              To
            </p>
            <p className="font-medium">{route.to_location?.city}</p>
            <p className="text-sm text-muted-foreground">
              {route.to_location?.state}
            </p>
          </div>

          {/* Distance & Duration */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Journey Details
            </p>
            <p className="font-medium">{formatDistance(route.distance)}</p>
            <p className="text-sm text-muted-foreground">
              ~{formatDuration(route.estimated_duration)} hrs
            </p>
          </div>

          {/* Fare */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center">
              <Wallet className="h-4 w-4 mr-1" />
              Base Fare
            </p>
            <p className="font-medium text-maroon-700">
              ₱{route.base_fare.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">per person</p>
          </div>
        </div>

        {/* Bus Details */}
        {route.assignments?.[0]?.bus && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bus className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  Bus {route.assignments[0].bus.bus_number}
                </p>
                <p className="text-xs text-muted-foreground">
                  {route.assignments[0].bus.capacity} seater
                </p>
              </div>
            </div>
            {selectedRoute === route.id && (
              <Button
                size="sm"
                className="bg-maroon-600 hover:bg-maroon-700 text-white"
                onClick={e => {
                  e.stopPropagation(); // Prevent route selection
                  setBookingDialog(true);
                }}>
                Book Now
              </Button>
            )}
          </div>
        )}

        {/* Conductor Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>
            Conductor:{' '}
            {route.assignments?.[0]?.conductor?.user?.name || 'Not assigned'}
          </span>
        </div>

        {/* Route Map */}
        {selectedRoute === route.id && (
          <div className="mt-4">
            <RouteMap stops={getRouteStops(route)} className="h-[200px]" />
          </div>
        )}

        {/* Stops List */}
        {selectedRoute === route.id && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Route Stops</h4>
            <div className="space-y-2">
              {getRouteStops(route).map((stop, index) => (
                <div
                  key={stop.location.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">
                      {stop.location.city}, {stop.location.state}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stop.arrivalOffset === 0
                        ? 'Starting Point'
                        : `+${stop.arrivalOffset} mins`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
            Search available bus routes and scheduless
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-6">
              <div className="relative">
                <div className="absolute left-2 top-10">
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
                        <SelectItem
                          key={`from-${location.id}-${location.city}-${location.state}`}
                          value={location.id}>
                          {location.city}, {location.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-2 top-10">
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
                        <SelectItem
                          key={`to-${location.id}-${location.city}-${location.state}`}
                          value={location.id}>
                          {location.city}, {location.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-2 top-10">
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
              Search Routes
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-maroon-800">
                Available Routes
              </h2>
              <Badge variant="outline" className="bg-maroon-50">
                {results.length} routes found
              </Badge>
            </div>

            {results.map(route => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}>
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                    selectedRoute === route.id
                      ? 'border-maroon-500 bg-maroon-50'
                      : 'border-transparent hover:border-maroon-200'
                  }`}
                  onClick={() => onRouteSelect(route.id)}>
                  <CardContent className="p-6">
                    {renderRouteInfo(route)}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Tickets</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-6 p-4">
              {/* Boarding and Destination Selection */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-medium">Select Stops</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose your boarding point and destination. You can board at
                  any stop except the last one.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Boarding Point</Label>
                    <Select
                      value={selectedBoardingStop.toString()}
                      onValueChange={value =>
                        setSelectedBoardingStop(parseInt(value))
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select boarding point" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedRouteData?.stops?.map((stop, index) => {
                          // Can't board at the last stop
                          const isLastStop =
                            index ===
                            (selectedRouteData.stops?.length || 0) - 1;

                          return (
                            <SelectItem
                              key={stop.location.id}
                              value={index.toString()}
                              disabled={isLastStop}>
                              {stop.location.city} ({stop.arrivalOffset} mins)
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Destination Point</Label>
                    <Select
                      value={selectedDestinationStop.toString()}
                      onValueChange={value =>
                        setSelectedDestinationStop(parseInt(value))
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedRouteData?.stops?.map((stop, index) => {
                          // Can only get off at stops after boarding point
                          const isBeforeOrAtBoardingStop =
                            index <= selectedBoardingStop;

                          return (
                            <SelectItem
                              key={stop.location.id}
                              value={index.toString()}
                              disabled={isBeforeOrAtBoardingStop}>
                              {stop.location.city} ({stop.arrivalOffset} mins)
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Show error if invalid selection */}
                {selectedBoardingStop === selectedDestinationStop && (
                  <p className="text-sm text-destructive mt-2">
                    Boarding point and destination must be different stops
                  </p>
                )}

                {/* Show segment details */}
                {selectedBoardingStop !== selectedDestinationStop &&
                  selectedRouteData && (
                    <div className="mt-2 p-3 bg-secondary rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Journey Duration
                          </p>
                          <p className="font-medium">
                            {selectedRouteData.stops[selectedDestinationStop]
                              .arrivalOffset -
                              selectedRouteData.stops[selectedBoardingStop]
                                .arrivalOffset}{' '}
                            mins
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Segment Fare
                          </p>
                          <p className="font-medium text-maroon-600">
                            ₱
                            {calculateSegmentFare(
                              selectedRouteData,
                              selectedBoardingStop,
                              selectedDestinationStop
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Passenger Details */}
              {passengers.map((passenger, index) => (
                <div key={index} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Passenger Name</Label>
                    <Input
                      value={passenger.name}
                      onChange={e => {
                        const newPassengers = [...passengers];
                        newPassengers[index].name = e.target.value;
                        setPassengers(newPassengers);
                      }}
                      placeholder="Enter passenger name"
                      className="border-maroon-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passenger Type</Label>
                    <RadioGroup
                      value={passenger.type}
                      onValueChange={value => {
                        const newPassengers = [...passengers];
                        newPassengers[index].type = value as
                          | 'regular'
                          | 'student'
                          | 'senior';
                        setPassengers(newPassengers);
                      }}>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="regular"
                            id={`regular-${index}`}
                          />
                          <Label htmlFor={`regular-${index}`}>Regular</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="student"
                            id={`student-${index}`}
                          />
                          <Label htmlFor={`student-${index}`}>Student</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="senior"
                            id={`senior-${index}`}
                          />
                          <Label htmlFor={`senior-${index}`}>Senior</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Seatss</Label>
                    <BusSeatLayout
                      capacity={
                        selectedRouteData?.assignments?.[0]?.bus?.capacity || 40
                      }
                      selectedSeat={passenger.seatNumber}
                      onSeatSelect={seat => {
                        // Check if seat is already selected by another passenger
                        const isSelectedByOther = passengers.some(
                          p => p.seatNumber === seat && p !== passenger
                        );

                        if (isSelectedByOther) {
                          toast({
                            title: 'Seat Already Selected',
                            description:
                              'This seat is selected by another passenger',
                            variant: 'destructive'
                          });
                          return;
                        }

                        const newPassengers = [...passengers];
                        const index = newPassengers.indexOf(passenger);
                        newPassengers[index].seatNumber = seat;
                        setPassengers(newPassengers);
                      }}
                      takenSeats={takenSeats}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Fare: ₱
                    {calculatePassengerFare(
                      calculateSegmentFare(
                        selectedRouteData!,
                        selectedBoardingStop,
                        selectedDestinationStop
                      ),
                      passenger.type
                    ).toFixed(2)}
                  </div>
                </div>
              ))}

              {/* Payment Details */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Segment Fare
                    </p>
                    <p className="text-xl font-bold">
                      ₱
                      {calculateSegmentFare(
                        selectedRouteData!,
                        selectedBoardingStop,
                        selectedDestinationStop
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="text-xl font-bold">
                      ₱
                      {(
                        calculateSegmentFare(
                          selectedRouteData!,
                          selectedBoardingStop,
                          selectedDestinationStop
                        ) * passengers.length
                      ).toFixed(2)}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {passengers.map((p, i) => {
                        const discount = calculatePassengerDiscount(p.type);
                        if (discount > 0) {
                          const discountAmount =
                            calculateSegmentFare(
                              selectedRouteData!,
                              selectedBoardingStop,
                              selectedDestinationStop
                            ) * discount;
                          return (
                            <div key={i}>
                              {p.type} discount: -₱{discountAmount.toFixed(2)}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setBookingDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleBooking(selectedRouteData!)}>
                  Confirm Booking
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {confirmedTicket && (
        <TicketConfirmation
          ticket={confirmedTicket}
          onClose={() => setConfirmedTicket(null)}
          onDownload={async () => {
            // Implement PDF download
            const pdfBlob = await generateTicketPDF(confirmedTicket);
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ticket-${confirmedTicket.ticket_number}.pdf`;
            a.click();
          }}
          onShare={() => {
            // Implement sharing
            if (navigator.share) {
              navigator.share({
                title: 'Bus Ticket',
                text: `Ticket #${confirmedTicket.ticket_number} from ${confirmedTicket.from_location} to ${confirmedTicket.to_location}`,
                url: window.location.href
              });
            }
          }}
        />
      )}
    </div>
  );
}
