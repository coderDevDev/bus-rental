'use client';

import { useEffect, useState } from 'react';
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
  Calendar,
  Clock,
  Home,
  MapPin,
  Search,
  Ticket as TicketIcon,
  Wallet,
  Users,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { passengerService } from '@/services/passenger-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { DashboardSkeleton } from '@/components/dashboard/loading';
import type { Location, Route, Ticket, User } from '@/types';
import { SearchCard } from '@/components/dashboard/search-card';
import { UpcomingTripsCard } from '@/components/dashboard/upcoming-trips-card';
import { PopularRoutesCard } from '@/components/dashboard/popular-routes-card';
import { TicketsCard } from '@/components/dashboard/tickets-card';
import { ProfileCard } from '@/components/dashboard/profile-card';
import { StatCard } from '@/components/dashboard/stat-card';
import { RouteCard } from '@/components/dashboard/route-card';
import { TicketList } from '@/components/dashboard/ticket-list';
import { useRouter } from 'next/navigation';
import { User as UserIcon } from 'lucide-react';
import { LiveMap } from '@/components/dashboard/live-map';
import { QRTicket } from '@/components/dashboard/qr-ticket';
import { FareEstimator } from '@/components/dashboard/fare-estimator';
import { BusTracker } from '@/components/dashboard/bus-tracker';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [stats, setStats] = useState({
    total_trips: 0,
    total_spent: 0,
    total_distance: 0
  });
  const [popularRoutes, setPopularRoutes] = useState<Route[]>([]);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [searchResults, setSearchResults] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const [dashboardData, locationsData] = await Promise.all([
          passengerService.getDashboardData(user.id),
          passengerService.getLocations()
        ]);

        setStats(dashboardData.stats);
        setPopularRoutes(dashboardData.routes);
        setUserTickets(dashboardData.tickets);
        setUserProfile(dashboardData.profile);
        setLocations(locationsData);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, toast]);

  const handleSearch = async (formData: SearchFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Searching with params:', formData);

      const results = await passengerService.searchRoutes({
        from: formData.from,
        to: formData.to,
        date: formData.date
      });

      console.log('Search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search routes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = async (bookingData: {
    route_id: string;
    seat_number: string;
    fare_amount: number;
  }) => {
    try {
      setLoading(true);
      const ticket = await passengerService.bookTicket(bookingData);
      setActiveTicket(ticket);

      // Show success message
      toast({
        title: 'Booking Successful',
        description: 'Your ticket has been booked successfully!'
      });

      // Refresh user tickets
      const updatedTickets = await passengerService.getUserTickets();
      setUserTickets(updatedTickets);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: 'Failed to book ticket. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  console.log({ searchResults });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container flex items-center h-16 px-4">
          <div className="flex-1 flex items-center gap-6">
            <h1 className="text-xl font-semibold text-primary">NorthPoint</h1>
            <nav className="hidden md:flex gap-4">
              <Button variant="ghost" className="text-muted-foreground">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="ghost" className="text-muted-foreground">
                <TicketIcon className="h-4 w-4 mr-2" />
                My Tickets
              </Button>
              <Button variant="ghost" className="text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                Track Bus
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-primary-foreground">
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-white text-primary">
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-primary-foreground">
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6 space-y-6">
        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 h-14 rounded-lg bg-muted p-1">
            <TabsTrigger value="home" className="rounded-md">
              <Home className="h-4 w-4 mr-2" />
              Home
            </TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-md">
              <TicketIcon className="h-4 w-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="tracking" className="rounded-md">
              <MapPin className="h-4 w-4 mr-2" />
              Live Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <SearchCard locations={locations} onSubmit={handleSearch} />

            {searchResults.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Available Routes</h2>
                  {searchResults.map(route => (
                    <Card
                      key={route.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedRoute === route.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedRoute(route.id)}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Route Header */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {route.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Route #{route.route_number || 'N/A'}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-sm">
                              {route.status}
                            </Badge>
                          </div>

                          {/* Route Details */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <div className="text-sm">
                                <p className="font-medium">
                                  {route.name.split('-')[0]}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <ArrowRight className="h-4 w-4" />
                              <div className="text-sm">
                                <p className="font-medium">
                                  {route.name.split('-')[1]}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Schedule & Fare */}
                          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {route.estimated_duration} mins
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                ₱{route.base_fare}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {route.assignments?.[0]?.start_date
                                  ? new Date(
                                      route.assignments[0].start_date
                                    ).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Assignment Details */}
                          {route.assignments?.[0] && (
                            <div className="pt-4 border-t">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Bus className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {route.assignments[0].bus.bus_number}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {route.assignments[0].conductor.user.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedRoute && (
                  <div className="space-y-6">
                    <BusTracker routeId={selectedRoute} />
                    <FareEstimator
                      route={searchResults.find(r => r.id === selectedRoute)}
                      onBook={handleBooking}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tickets">
            <div className="space-y-4">
              <TicketsCard tickets={userTickets} />
              {activeTicket && <QRTicket ticket={activeTicket} />}
            </div>
          </TabsContent>

          <TabsContent value="tracking">
            <LiveMap />
          </TabsContent>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Trips"
            value={stats.total_trips}
            icon={<Bus className="h-5 w-5" />}
            className="bg-blue-50"
          />
          <StatCard
            title="Total Distance"
            value={`${stats.total_distance.toFixed(1)} km`}
            icon={<MapPin className="h-5 w-5" />}
            className="bg-green-50"
          />
          <StatCard
            title="Total Spent"
            value={`₱${stats.total_spent.toFixed(2)}`}
            icon={<Wallet className="h-5 w-5" />}
            className="bg-yellow-50"
          />
          <StatCard
            title="Active Tickets"
            value={userTickets.filter(t => t.status === 'booked').length}
            icon={<TicketIcon className="h-5 w-5" />}
            className="bg-purple-50"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TicketIcon className="h-5 w-5" />
                Recent Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TicketList
                tickets={userTickets.slice(0, 5)}
                onSelect={setActiveTicket}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Popular Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularRoutes.map(route => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    onClick={() => router.push(`/routes/${route.id}`)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
