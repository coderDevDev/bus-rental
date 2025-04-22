'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bell,
  Bus,
  MapPin,
  QrCode,
  TicketIcon,
  Users,
  Clock,
  DollarSign,
  MoreVertical,
  Eye,
  Edit,
  Trash,
  Wallet
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { conductorDashboardService } from '@/services/conductor-dashboard-service';
import { RouteMap } from '@/components/conductor/route-map';
import { StatCard } from '@/components/admin/stat-card';
import { useGeolocation } from '@/hooks/use-geolocation';
import { QrScanner } from '@/components/qr-scanner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import type { ConductorActivity } from '@/types/conductor';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import {
  TicketManagement,
  RouteProgress,
  PassengerList,
  QuickActions,
  DailySummary
} from './components';
import { useRouter } from 'next/navigation';
import { TicketDetailsDialog } from './components/ticket-details-dialog';
import type { TicketHistoryItem } from './components/types';
import { TicketScanner } from './components/ticket-scanner';
import { TimeStatus } from './components/time-status';

interface TicketHistory {
  id: string;
  ticket_number: string;
  passenger_name: string;
  passenger_type: 'regular' | 'student' | 'senior';
  from_location: string;
  to_location: string;
  amount: number;
  status: string;
  created_at: string;
}

interface TodayStats {
  ticketsIssued: number;
  activeHours: number;
  revenue: number;
}

interface MapData {
  startLocation: {
    name: string;
    coordinates: [number, number];
  };
  endLocation: {
    name: string;
    coordinates: [number, number];
  };
  currentLocation?: {
    coordinates: [number, number];
    heading?: number;
  };
  stops: Array<{
    name: string;
    coordinates: [number, number];
    isCurrent?: boolean;
  }>;
}

interface Passenger {
  id: string;
  name: string;
  seatNumber: string;
  destination: string;
  ticketType: 'regular' | 'student' | 'senior';
}

interface Stop {
  id: string;
  name: string;
  arrivalTime: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface TicketBreakdown {
  regular: number;
  student: number;
  senior: number;
}

interface DashboardState {
  ticketBreakdown: TicketBreakdown;
  activePassengers: Passenger[];
  selectedTicket: TicketHistoryItem | null;
}

// First, let's create a custom type for toast variants
type ToastVariant = 'default' | 'destructive' | 'warning';

export default function ConductorDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  console.log({ user });
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [busDetails, setBusDetails] = useState<any>(null);
  const [passengerCount, setPassengerCount] = useState<number>(0);
  const [todayStats, setTodayStats] = useState<TodayStats>({
    ticketsIssued: 0,
    activeHours: 0,
    revenue: 0
  });
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTimeRecord, setActiveTimeRecord] = useState<any>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [activities, setActivities] = useState<ConductorActivity[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [ticketHistory, setTicketHistory] = useState<TicketHistory[]>([]);
  const [ticketBreakdown, setTicketBreakdown] = useState<TicketBreakdown>({
    regular: 0,
    student: 0,
    senior: 0
  });
  const [activePassengers, setActivePassengers] = useState<Passenger[]>([]);
  const [selectedTicket, setSelectedTicket] =
    useState<TicketHistoryItem | null>(null);

  const { location } = useGeolocation();

  let [selectedConductorId, setSelectedConductorId] = useState<string | null>(
    null
  );

  // Memoize the loadDashboardData function to prevent it from being recreated on every render
  const loadDashboardData = useCallback(async () => {
    try {
      if (!user) return;

      setIsLoading(true);
      const conductorId = await conductorDashboardService.getConductorId(
        user.id
      );
      setSelectedConductorId(conductorId);

      const assignment = await conductorDashboardService.getCurrentAssignment(
        conductorId
      );
      if (!assignment) {
        toast({
          title: 'No Active Assignment',
          description: 'You have no active assignments.',
          variant: 'default'
        });
        return;
      }

      setCurrentAssignment(assignment);

      // Get all assignment-related data after confirming assignment exists
      const [
        breakdown,
        passengers,
        stats,
        timeRecord,
        count,
        location,
        history
      ] = await Promise.all([
        conductorDashboardService.getTicketBreakdown(assignment.id),
        conductorDashboardService.getActivePassengers(assignment.id),
        conductorDashboardService.getTodayStats(conductorId),
        conductorDashboardService.getActiveTimeRecord(conductorId),
        conductorDashboardService.getPassengerCount(assignment.id),
        conductorDashboardService.getCurrentLocation(assignment.id),
        conductorDashboardService.getTicketHistory(conductorId)
      ]);

      // Update all state at once
      setTicketBreakdown(breakdown);
      setActivePassengers(passengers);
      setTodayStats(stats);
      setActiveTimeRecord(timeRecord);
      setPassengerCount(count);
      setCurrentLocation(location);
      setTicketHistory(history);

      // Get route and bus details if needed
      if (!assignment.route) {
        const route = await conductorDashboardService.getRouteDetails(
          assignment.route_id
        );
        setRouteDetails(route);
      } else {
        setRouteDetails(assignment.route);
      }

      if (!assignment.bus) {
        const bus = await conductorDashboardService.getBusDetails(
          assignment.bus_id
        );
        setBusDetails(bus);
      } else {
        setBusDetails(assignment.bus);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, [user, toast]);

  // Update the useEffect to use the memoized loadDashboardData
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // Update the location update effect to handle null checks better
  useEffect(() => {
    if (!currentAssignment?.id || !location || !user?.id) return;

    const now = Date.now();
    if (now - lastUpdateTime < 30000) return;

    const updateLocation = async () => {
      try {
        const conductorId = await conductorDashboardService.getConductorId(
          user.id
        );

        console.log({ conductorId, currentAssignment: currentAssignment.id });

        if (conductorId && currentAssignment.id) {
          await conductorDashboardService.updateLocation({
            conductor_id: conductorId,
            assignment_id: currentAssignment.id,
            latitude: location.latitude,
            longitude: location.longitude,
            heading: location.heading
          });
        }
        setLastUpdateTime(now);
      } catch (error) {
        console.error('Error updating location:', error);
        if (
          error instanceof Error &&
          !error.message.includes('User not found') &&
          !error.message.includes('conductor_id')
        ) {
          toast({
            title: 'Location Update Failed',
            description: 'Unable to update your current location',
            variant: 'destructive'
          });
        }
      }
    };

    updateLocation();
  }, [currentAssignment?.id, location, user?.id, lastUpdateTime, toast]);

  // Update the handleQRScan function
  const handleQRScan = useCallback(
    async (qrData: string) => {
      if (!currentAssignment?.id || !selectedConductorId) {
        toast({
          title: 'Error',
          description: 'No active assignment found',
          variant: 'destructive'
        });
        return;
      }

      try {
        const result = await conductorDashboardService.validateTicket(
          qrData,
          selectedConductorId,
          currentAssignment.id
        );

        if (result.isValid) {
          toast({
            title: 'Success',
            description: `Ticket ${result.ticket.ticket_number} validated successfully`
          });
          // Refresh dashboard data
          loadDashboardData();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        throw error; // Let the scanner component handle the error
      }
    },
    [currentAssignment?.id, selectedConductorId, loadDashboardData]
  );

  // Update the handleClockIn function
  const handleClockIn = useCallback(async () => {
    if (!user?.id || !currentAssignment?.id) return;

    try {
      const timeRecord = await conductorDashboardService.clockIn(
        user.id,
        currentAssignment.id
      );
      setActiveTimeRecord(timeRecord);
      toast({
        title: 'Success',
        description: `Clocked in at ${format(
          new Date(timeRecord.clock_in),
          'h:mm a'
        )}`
      });
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to clock in',
        variant: 'destructive'
      });
    }
  }, [user?.id, currentAssignment?.id, toast]);

  // Add handleClockOut function
  const handleClockOut = useCallback(async () => {
    if (!activeTimeRecord?.record_id) return;

    try {
      const record = await conductorDashboardService.clockOut(
        activeTimeRecord.record_id
      );
      setActiveTimeRecord(null);
      toast({
        title: 'Success',
        description: `Clocked out at ${format(
          new Date(record.clock_out!),
          'h:mm a'
        )}`
      });
      // Refresh stats
      loadDashboardData();
    } catch (error) {
      console.error('Error clocking out:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to clock out',
        variant: 'destructive'
      });
    }
  }, [activeTimeRecord?.record_id, toast, loadDashboardData]);

  // Update the mapData transformation
  const mapData: MapData | null = currentAssignment?.route
    ? {
        startLocation: {
          name: currentAssignment.route.from_location.city,
          coordinates: [
            currentAssignment.route.from_location.longitude,
            currentAssignment.route.from_location.latitude
          ]
        },
        endLocation: {
          name: currentAssignment.route.to_location.city,
          coordinates: [
            currentAssignment.route.to_location.longitude,
            currentAssignment.route.to_location.latitude
          ]
        },
        currentLocation: currentLocation
          ? {
              coordinates: [
                currentLocation.longitude,
                currentLocation.latitude
              ] as [number, number],
              heading: currentLocation.heading
            }
          : undefined,
        stops: [] // Add stops if available
      }
    : null;

  const handleViewTicket = useCallback(
    (ticketId: string) => {
      const ticket = ticketHistory.find(t => t.id === ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    },
    [ticketHistory]
  );

  const handleCancelTicket = useCallback(
    async (ticketId: string) => {
      try {
        await conductorDashboardService.cancelTicket(ticketId);
        // Refresh ticket history
        loadDashboardData();
        toast({
          title: 'Success',
          description: 'Ticket cancelled successfully'
        });
      } catch (error) {
        console.error('Error cancelling ticket:', error);
        toast({
          title: 'Error',
          description: 'Failed to cancel ticket',
          variant: 'destructive'
        });
      }
    },
    [loadDashboardData]
  );

  const handlePassengerClick = useCallback(
    (passengerId: string) => {
      const passenger = activePassengers.find(p => p.id === passengerId);
      if (passenger) {
        // Show passenger details or actions
      }
    },
    [activePassengers]
  );

  // Add handleApproveTicket function
  const handleApproveTicket = useCallback(
    async (ticketId: string) => {
      try {
        await conductorDashboardService.approveTicket(ticketId);
        // Refresh ticket history
        loadDashboardData();
        toast({
          title: 'Success',
          description: 'Ticket approved successfully'
        });
      } catch (error) {
        console.error('Error approving ticket:', error);
        toast({
          title: 'Error',
          description: 'Failed to approve ticket',
          variant: 'destructive'
        });
      }
    },
    [loadDashboardData]
  );

  // Inside useEffect for location updates
  useEffect(() => {
    // Function to get position from browser
    const updateCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              heading: position.coords.heading || 0,
              timestamp: new Date().toISOString()
            };

            setCurrentLocation(newLocation);

            // Also save to localStorage as backup
            localStorage.setItem(
              'conductorLocation',
              JSON.stringify(newLocation)
            );

            // Call API to update server-side location data if needed
            if (currentAssignment) {
              conductorDashboardService
                .updateLocation({
                  conductor_id: selectedConductorId,
                  assignment_id: currentAssignment.id,
                  latitude: newLocation.latitude,
                  longitude: newLocation.longitude,
                  heading: newLocation.heading
                })
                .catch(err =>
                  console.error('Failed to update location on server:', err)
                );
            }
          },
          error => {
            console.error('Geolocation error:', error);
            // Try to get last known position from localStorage
            const lastKnownLocation = localStorage.getItem('conductorLocation');
            if (lastKnownLocation) {
              setCurrentLocation(JSON.parse(lastKnownLocation));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
          }
        );
      }
    };

    // Update location immediately
    updateCurrentLocation();

    // Set up interval for regular updates
    const locationInterval = setInterval(updateCurrentLocation, 15000); // every 15 seconds

    return () => {
      clearInterval(locationInterval);
    };
  }, [currentAssignment]);

  // For testing/demo purposes only - simulates a moving vehicle
  // Add this inside your component
  const simulateMovement = useCallback(() => {
    if (!currentLocation || !routeDetails) return;

    // Get start and end coordinates
    const startLat = routeDetails.from_location.latitude || 14.5995;
    const startLng = routeDetails.from_location.longitude || 120.9842;
    const endLat = routeDetails.to_location.latitude || 10.3157;
    const endLng = routeDetails.to_location.longitude || 123.8854;

    // Calculate a point along the route based on time
    const progress = (Date.now() % 300000) / 300000; // 0-1 value cycling every 5 minutes
    const newLat = startLat + (endLat - startLat) * progress;
    const newLng = startLng + (endLng - startLng) * progress;

    setCurrentLocation({
      latitude: newLat,
      longitude: newLng,
      heading: 0,
      timestamp: new Date().toISOString()
    });
  }, [currentLocation, routeDetails]);

  // Add another useEffect for the simulation
  useEffect(() => {
    // Only use in development/testing
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(simulateMovement, 3000);
      return () => clearInterval(interval);
    }
  }, [simulateMovement]);

  // Add a useEffect that refreshes data when the component mounts or gains focus
  useEffect(() => {
    // Load dashboard data when the component mounts
    if (user) {
      loadDashboardData();
    }

    // Also set up a listener for when the window regains focus
    // This ensures data refreshes when returning from another page
    const handleFocus = () => {
      if (user) {
        loadDashboardData();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, loadDashboardData]);

  if (!isLoaded || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
          <div className="container flex items-center h-14 px-4">
            <h1 className="font-bold text-lg">Conductor Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 container p-4">
          <Card className="mb-4">
            <CardContent className="flex items-center justify-center h-[200px]">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700" />
                <p className="text-sm text-muted-foreground">
                  Loading dashboard...
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-friendly header */}
      <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <h1 className="font-bold text-lg">NorthPoint</h1>
            {currentAssignment && (
              <Badge variant="outline" className="text-white border-white/30">
                Bus #{currentAssignment.bus?.bus_number}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="text-white">
              <Link href="/conductor/notifications">
                <Bell className="h-5 w-5" />
                <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-white text-maroon-700">
                  2
                </Badge>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="text-white">
              <Link href="/conductor/profile">
                <Avatar className="h-8 w-8 border border-white/30">
                  <AvatarImage src="/placeholder.svg" alt="Conductor" />
                  <AvatarFallback>
                    {user?.user_metadata?.name?.[0] || 'C'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto p-4 space-y-4">
        {/* Quick Actions - Full width on mobile */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button
            variant="outline"
            className="h-auto py-4 px-3"
            onClick={() => router.push('/conductor/issue-ticket')}>
            <div className="flex flex-col items-center gap-1">
              <TicketIcon className="h-5 w-5" />
              <span className="text-xs">Issue Ticket</span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 px-3"
            onClick={() => setIsScanning(true)}>
            <div className="flex flex-col items-center gap-1">
              <QrCode className="h-5 w-5" />
              <span className="text-xs">Scan Ticket</span>
            </div>
          </Button>
          <Button
            variant={activeTimeRecord ? 'destructive' : 'outline'}
            className="h-auto py-4 px-3"
            onClick={activeTimeRecord ? handleClockOut : handleClockIn}>
            <div className="flex flex-col items-center gap-1">
              <Clock className="h-5 w-5" />
              <span className="text-xs">
                {activeTimeRecord ? 'Clock Out' : 'Clock In'}
              </span>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 px-3"
            onClick={() => router.push('/conductor/route-details')}>
            <div className="flex flex-col items-center gap-1">
              <MapPin className="h-5 w-5" />
              <span className="text-xs">Route Info</span>
            </div>
          </Button>
        </div>

        {/* Time Status */}
        {activeTimeRecord && (
          <TimeStatus
            clockInTime={activeTimeRecord.clock_in}
            onClockOut={handleClockOut}
          />
        )}

        {/* Stats Cards - 2x2 grid on mobile */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Tickets"
            value={todayStats.ticketsIssued}
            icon={TicketIcon}
            description="Today's tickets"
            className="bg-gradient-to-br from-maroon-50 to-maroon-100"
          />
          <StatCard
            title="Revenue"
            value={`₱${todayStats.revenue.toFixed(2)}`}
            icon={Wallet}
            description="Today's earnings"
            className="bg-gradient-to-br from-green-50 to-green-100"
          />
          <StatCard
            title="Hours"
            value={`${todayStats.activeHours}h`}
            icon={Clock}
            description="Time on duty"
            className="bg-gradient-to-br from-blue-50 to-blue-100"
          />
          <StatCard
            title="Passengers"
            value={passengerCount}
            icon={Users}
            description="Current passengers"
            className="bg-gradient-to-br from-purple-50 to-purple-100"
          />
        </div>

        {/* Main Content Area - Stack on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Route Map */}
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Live Route Tracking</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {console.log({ mapData })}
                {mapData && (
                  <RouteMap
                    startLocation={mapData.startLocation}
                    endLocation={mapData.endLocation}
                    stops={mapData.stops}
                    currentLocation={mapData.currentLocation}
                    className="h-[250px] sm:h-[300px] w-full rounded-b-lg"
                  />
                )}
              </CardContent>
            </Card>

            {/* Route Progress */}
            <RouteProgress
              currentAssignment={currentAssignment}
              currentLocation={currentLocation}
            />

            {/* Ticket Management */}
            <TicketManagement
              tickets={ticketHistory}
              onViewTicket={handleViewTicket}
              onCancelTicket={handleCancelTicket}
              onApproveTicket={handleApproveTicket}
            />
          </div>

          {/* Sidebar - Full width on mobile */}
          <div className="space-y-4">
            <DailySummary
              stats={todayStats}
              ticketBreakdown={ticketBreakdown}
            />
            <PassengerList
              passengers={activePassengers}
              onPassengerClick={handlePassengerClick}
            />
          </div>
        </div>

        {/* Dialogs remain unchanged */}
        <TicketDetailsDialog
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={open => !open && setSelectedTicket(null)}
        />
        <TicketScanner
          open={isScanning}
          onOpenChange={setIsScanning}
          onScanComplete={handleQRScan}
        />
      </main>
    </div>
  );
}
