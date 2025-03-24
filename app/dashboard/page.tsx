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
  Wallet
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

  const handleSearch = async (searchParams: {
    from: string;
    to: string;
    date: string;
  }) => {
    try {
      setLoading(true);
      const results = await passengerService.searchRoutes(searchParams);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching routes:', error);
      toast({
        title: 'Error',
        description: 'Failed to search routes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (routeId: string) => {
    try {
      setLoading(true);
      // Implementation for booking
      const ticket = await passengerService.bookTicket(routeId);
      setActiveTicket(ticket);
      toast({
        title: 'Success',
        description: 'Ticket booked successfully'
      });
    } catch (error) {
      console.error('Error booking ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to book ticket',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-primary text-primary-foreground z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <h1 className="font-bold text-lg">BusGo</h1>
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

      <main className="flex-1 container mx-auto p-4 space-y-4">
        <Tabs defaultValue="home">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-4">
            <SearchCard locations={locations} onSubmit={handleSearch} />

            {searchResults.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  {searchResults.map(route => (
                    <Card
                      key={route.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedRoute(route.id)}>
                      <CardContent className="p-4">
                        {/* Route details */}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedRoute && (
                  <div className="space-y-4">
                    <BusTracker routeId={selectedRoute} />
                    <FareEstimator onBook={handleBooking} />
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

        <div className="space-y-4 p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Trips"
              value={stats.total_trips}
              icon={<Bus className="h-4 w-4" />}
            />
            <StatCard
              title="Total Distance"
              value={`${stats.total_distance.toFixed(1)} km`}
              icon={<MapPin className="h-4 w-4" />}
            />
            <StatCard
              title="Total Spent"
              value={`₱${stats.total_spent.toFixed(2)}`}
              icon={<Wallet className="h-4 w-4" />}
            />
            <StatCard
              title="Active Tickets"
              value={userTickets.filter(t => t.status === 'booked').length}
              icon={<TicketIcon className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Tickets</CardTitle>
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
                <CardTitle>Popular Routes</CardTitle>
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
        </div>
      </main>
    </div>
  );
}
