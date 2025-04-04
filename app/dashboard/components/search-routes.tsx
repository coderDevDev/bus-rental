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
  Ticket
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

interface SearchRoutesProps {
  locations: Location[];
  onSearch: (data: SearchFormData) => void;
  results: Route[];
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ from, to, date });
  };

  const getAvailableSeats = (route: Route) => {
    const assignment = route.assignments?.[0];
    if (!assignment) return 0;

    const totalCapacity = assignment.bus?.capacity || 0;

    // Get taken seats for this route's assignment
    const takenSeatsCount = takenSeats.length;

    // Calculate available seats
    const availableSeats = totalCapacity - takenSeatsCount;

    return Math.max(0, availableSeats); // Ensure we don't return negative numbers
  };

  const selectedRouteData = results.find(r => r.id === selectedRoute) as
    | Route
    | undefined;

  const handleBooking = async (route: Route) => {
    const assignment = route.assignments?.[0];

    if (!assignment) {
      toast({
        title: 'Error',
        description: 'No assignment found for this route',
        variant: 'destructive'
      });
      return;
    }

    if (!assignment.conductor_id) {
      toast({
        title: 'Error',
        description: 'No conductor assigned to this route',
        variant: 'destructive'
      });
      return;
    }

    // Validate seat selections
    const hasInvalidSeats = passengers.some(p => !p.seatNumber);
    if (hasInvalidSeats) {
      toast({
        title: 'Error',
        description: 'Please select seats for all passengers',
        variant: 'destructive'
      });
      return;
    }

    // Check for duplicate seat selections
    const seatNumbers = passengers.map(p => p.seatNumber);
    const hasDuplicates = seatNumbers.length !== new Set(seatNumbers).size;
    if (hasDuplicates) {
      toast({
        title: 'Error',
        description: 'Each passenger must have a unique seat',
        variant: 'destructive'
      });
      return;
    }

    // Check if any selected seat is already taken
    const hasConflict = passengers.some(p => takenSeats.includes(p.seatNumber));
    if (hasConflict) {
      toast({
        title: 'Error',
        description: 'One or more selected seats are no longer available',
        variant: 'destructive'
      });
      return;
    }

    try {
      const bookingData: BookingData = {
        conductor_id: assignment.conductor_id,
        assignmentId: assignment.id,
        passengers: passengers.map(passenger => ({
          passenger_name: passenger.name,
          passenger_id: user?.id || '',
          passenger_type: passenger.type,
          seat_number: passenger.seatNumber,
          from_location: route.from_location.city,
          to_location: route.to_location.city,
          amount: calculatePassengerFare(route.base_fare, passenger.type),
          payment_method: 'cash' as const,
          payment_status: 'paid' as const,
          status: 'active' as const
        }))
      };

      const result = await onBook(bookingData);
      setBookingDialog(false);
      setConfirmedTicket(result);
      setPassengers([
        {
          name: user?.user_metadata?.name || '',
          type: 'regular',
          seatNumber: ''
        }
      ]);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to book ticket',
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
                          value={location.city}>
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
                          value={location.city}>
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
                    <div className="space-y-4">
                      {/* Route Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bus className="h-5 w-5 text-maroon-600" />
                          <div>
                            <h3 className="font-semibold text-lg">
                              Route {route.route_number}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {route.name}
                            </p>
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
                          <p className="font-medium">
                            {route.from_location?.city}
                          </p>
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
                          <p className="font-medium">
                            {route.to_location?.city}
                          </p>
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
                          <p className="font-medium">
                            {formatDistance(route.distance)}
                          </p>
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
                          <p className="text-sm text-muted-foreground">
                            per person
                          </p>
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
                              onClick={() => setBookingDialog(true)}>
                              Book Now
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Add this in the route card */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>
                          Conductor:{' '}
                          {route.assignments?.[0]?.conductor_name ||
                            'Not assigned'}
                        </span>
                      </div>
                    </div>
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700" />
                </div>
              ) : (
                passengers.map((passenger, index) => (
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
                          selectedRouteData?.assignments?.[0]?.bus?.capacity ||
                          40
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
                  </div>
                ))
              )}
              <Button
                type="button"
                variant="outline"
                onClick={addPassenger}
                className="w-full">
                Add Another Passenger
              </Button>
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="text-xl font-bold">
                      ₱{calculateTotalFare(selectedRouteData, passengers)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Method
                    </p>
                    <Select defaultValue="cash">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="ewallet">E-Wallet</SelectItem>
                      </SelectContent>
                    </Select>
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
