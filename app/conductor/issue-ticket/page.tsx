'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ArrowLeft,
  Printer,
  Send,
  Receipt,
  CreditCard,
  Wallet
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { conductorDashboardService } from '@/services/conductor-dashboard-service';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TicketType {
  id: string;
  name: string;
  discount_percentage: number;
}

const BusSeatLayout = ({
  capacity = 0,
  selectedSeat = '',
  onSeatSelect,
  takenSeats = [] // Array of already booked seat numbers
}: {
  capacity: number;
  selectedSeat: string;
  onSeatSelect: (seat: string) => void;
  takenSeats: string[];
}) => {
  // Calculate rows and columns
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
            <div className="w-8 border-dashed border-t-2 border-maroon-200 self-center"></div>

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
      <div className="mt-6 pt-4 border-t border-maroon-200 flex gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-maroon-200"></div>
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-maroon-700 bg-maroon-100"></div>
          <span className="text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-gray-200 bg-gray-100"></div>
          <span className="text-muted-foreground">Taken</span>
        </div>
      </div>
    </div>
  );
};

export default function IssueTicket() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    ticketType: 'regular',
    from: '',
    to: '',
    paymentMethod: 'cash',
    passengerName: '',
    seatNumber: '',
    passengerId: ''
  });
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { id: 'regular', name: 'Regular', discount_percentage: 0 },
    { id: 'student', name: 'Student', discount_percentage: 20 }, // 20% discount
    { id: 'senior', name: 'Senior Citizen', discount_percentage: 20 } // 20% discount per Philippine law
  ]);
  const [availableStops, setAvailableStops] = useState<any[]>([]);
  const [fromStops, setFromStops] = useState<any[]>([]);
  const [toStops, setToStops] = useState<any[]>([]);
  const [takenSeats, setTakenSeats] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        if (!user) return;

        // Get conductor ID
        const conductorId = await conductorDashboardService.getConductorId(
          user.id
        );
        if (!conductorId) {
          throw new Error('Conductor profile not found');
        }

        const assignment = await conductorDashboardService.getCurrentAssignment(
          conductorId
        );
        setCurrentAssignment(assignment);

        console.log({ assignment });
        if (assignment?.route) {
          setRouteDetails(assignment.route);

          // Get the from and to locations from the route
          const fromLocation = assignment.route.from_location;
          const toLocation = assignment.route.to_location;

          console.log({ fromLocation, toLocation });
          // Initialize stops array with proper structure
          const stops = [
            {
              id: 'start',
              name: fromLocation?.city || '',
              type: 'terminal'
            },
            {
              id: 'end',
              name: toLocation?.city || '',
              type: 'terminal'
            }
          ];

          // Filter out any stops with empty names
          const validStops = stops.filter(stop => stop.name);

          setAvailableStops(validStops);
          setFromStops(validStops);
          setToStops(validStops);

          // Set default from location
          setFormData(prev => ({
            ...prev,
            from: fromLocation?.city || '',
            to: '' // Clear destination initially
          }));
        }

        // Get taken seats
        if (assignment) {
          const taken = await conductorDashboardService.getTakenSeats(
            assignment.id
          );
          setTakenSeats(taken);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load route data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  const handleTicketTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, ticketType: value }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
  };

  const handleFromChange = (value: string) => {
    setFormData(prev => ({ ...prev, from: value }));

    // Update available destinations based on selected origin
    const remainingStops = availableStops.filter(stop => stop.name !== value);
    setToStops(remainingStops);

    // If current destination is same as new origin, clear it
    if (formData.to === value) {
      setFormData(prev => ({ ...prev, to: '' }));
    }
  };

  const handleToChange = (value: string) => {
    setFormData(prev => ({ ...prev, to: value }));

    // Update available origins based on selected destination
    const remainingStops = availableStops.filter(stop => stop.name !== value);
    setFromStops(remainingStops);

    // If current origin is same as new destination, clear it
    if (formData.from === value) {
      setFormData(prev => ({ ...prev, from: '' }));
    }
  };

  const getTicketPrice = (ticketTypeId?: string) => {
    const baseFare = routeDetails?.base_fare || 0;
    const ticketType = ticketTypes.find(
      t => t.id === (ticketTypeId || formData.ticketType)
    );
    if (!ticketType) return baseFare;

    const discount = (ticketType.discount_percentage / 100) * baseFare;
    return baseFare - discount;
  };

  const handleIssueTicket = async () => {
    if (!user || !currentAssignment || !routeDetails) return;

    // Validate required fields
    const requiredFields = {
      passengerName: 'Passenger name',
      from: 'Pickup point',
      to: 'Destination',
      ticketType: 'Ticket type'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !formData[key])
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      toast({
        title: 'Required Fields Missing',
        description: `Please enter: ${missingFields.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    // Validate seat selection if bus has capacity
    if (currentAssignment?.bus?.capacity && !formData.seatNumber) {
      toast({
        title: 'Seat Selection Required',
        description: 'Please select a seat for the passenger',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const ticket = await conductorDashboardService.issueTicket({
        conductorId: user.id,
        assignmentId: currentAssignment.id,
        fromLocation: formData.from,
        toLocation: formData.to,
        ticketType: formData.ticketType as 'regular' | 'student' | 'senior',
        fare: getTicketPrice(),
        paymentMethod: formData.paymentMethod as 'cash' | 'card',
        passengerName: formData.passengerName,
        seatNumber: formData.seatNumber || undefined,
        passengerId: formData.passengerId || undefined
      });

      // Update taken seats list after successful ticket issuance
      setTakenSeats(prev => [...prev, formData.seatNumber]);

      toast({
        title: 'Success',
        description: `Ticket #${ticket.id} has been issued successfully`
      });

      // Reset form for next ticket
      setFormData({
        ticketType: 'regular',
        from: currentAssignment.route.start_location,
        to: currentAssignment.route.end_location,
        paymentMethod: 'cash',
        passengerName: '',
        seatNumber: '',
        passengerId: ''
      });

      router.push('/conductor');
    } catch (error) {
      console.error('Error issuing ticket:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to issue ticket',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  console.log({ currentAssignment, routeDetails });

  if (!currentAssignment) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
          <div className="container flex items-center h-14 px-4">
            <Button variant="ghost" size="icon" asChild className="text-white">
              <Link href="/conductor">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">
              Issue Ticket
            </h1>
          </div>
        </header>

        <main className="flex-1 container p-4 flex items-center justify-center">
          <Card className="w-full max-w-md border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800">
                No Active Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700">
                You don't have an active route assignment. Please contact your
                administrator.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/conductor">Back to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" asChild className="text-white">
            <Link href="/conductor">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">
            Issue Ticket
          </h1>
        </div>
      </header>

      <main className="flex-1 container p-4">
        <Card className="mb-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-maroon-700">
              Passenger Information
            </CardTitle>
            <CardDescription>
              Enter passenger details to issue ticket
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ticket Type</Label>
              <RadioGroup
                value={formData.ticketType}
                onValueChange={handleTicketTypeChange}
                className="grid grid-cols-3 gap-4">
                {ticketTypes.map(type => (
                  <Label
                    key={type.id}
                    htmlFor={type.id}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-maroon-700">
                    <RadioGroupItem
                      value={type.id}
                      id={type.id}
                      className="sr-only"
                    />
                    {/* <Receipt className="h-6 w-6 mb-2 text-maroon-700" /> */}
                    <span className="text-sm font-medium">{type.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ₱{getTicketPrice(type.id).toFixed(2)}
                      {type.discount_percentage > 0 && (
                        <span className="ml-1 text-green-600">
                          (-{type.discount_percentage}%)
                        </span>
                      )}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {console.log({ fromStops })}
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Select
                value={formData.from}
                onValueChange={handleFromChange}
                disabled={isLoading}>
                <SelectTrigger
                  id="from"
                  className="border-maroon-200 focus-visible:ring-maroon-500">
                  <SelectValue
                    placeholder={
                      isLoading ? 'Loading...' : 'Select pickup point'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {fromStops.map(stop => (
                    <SelectItem key={stop.id} value={stop.name}>
                      {stop.name}
                      {stop.type === 'terminal' && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (Terminal)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Select
                value={formData.to}
                onValueChange={handleToChange}
                disabled={!formData.from || isLoading}>
                <SelectTrigger
                  id="to"
                  className="border-maroon-200 focus-visible:ring-maroon-500">
                  <SelectValue
                    placeholder={
                      isLoading
                        ? 'Loading...'
                        : !formData.from
                        ? 'Select pickup point first'
                        : 'Select destination'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {toStops
                    .filter(stop => stop.name !== formData.from)
                    .map(stop => (
                      <SelectItem key={stop.id} value={stop.name}>
                        {stop.name}
                        {stop.type === 'terminal' && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Terminal)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={handlePaymentMethodChange}
                className="grid grid-cols-2 gap-4">
                <Label
                  htmlFor="cash"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-maroon-700">
                  <RadioGroupItem value="cash" id="cash" className="sr-only" />
                  <Wallet className="h-6 w-6 mb-2 text-maroon-700" />
                  <span className="text-sm font-medium">Cash</span>
                </Label>
                <Label
                  htmlFor="card"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-maroon-700">
                  <RadioGroupItem value="card" id="card" className="sr-only" />
                  <CreditCard className="h-6 w-6 mb-2 text-maroon-700" />
                  <span className="text-sm font-medium">Card</span>
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passengerName">Passenger Name</Label>
                <Input
                  id="passengerName"
                  value={formData.passengerName}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      passengerName: e.target.value
                    }))
                  }
                  placeholder="Enter passenger name"
                  className="border-maroon-200 focus-visible:ring-maroon-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seatNumber">Select Seat</Label>
                <BusSeatLayout
                  capacity={currentAssignment?.bus?.capacity || 0}
                  selectedSeat={formData.seatNumber}
                  onSeatSelect={seat =>
                    setFormData(prev => ({ ...prev, seatNumber: seat }))
                  }
                  takenSeats={takenSeats}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-maroon-700">Ticket Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Ticket Type
                </span>
                <span className="font-medium capitalize">
                  {formData.ticketType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Route</span>
                <span className="font-medium">
                  {formData.from} to {formData.to}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Payment Method
                </span>
                <span className="font-medium capitalize">
                  {formData.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-maroon-700">
                  ₱{getTicketPrice().toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full gap-2 bg-maroon-700 hover:bg-maroon-800"
              onClick={handleIssueTicket}
              disabled={isSubmitting}>
              <Printer className="h-4 w-4" />
              {isSubmitting ? 'Processing...' : 'Print Ticket'}
            </Button>
            {formData.paymentMethod === 'card' && (
              <Button
                variant="outline"
                className="w-full gap-2 border-maroon-200 hover:bg-maroon-50">
                <Send className="h-4 w-4" />
                Send Digital Ticket
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
