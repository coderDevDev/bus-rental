'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { passengerService } from './services/passenger-service';
import { DashboardSkeleton } from './components/loading';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bus,
  MapPin,
  Wallet,
  TicketIcon,
  Search,
  Clock,
  Bell,
  Menu,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from './components/stat-card';
import { SearchRoutes } from './components/search-routes';
import { TicketsView } from './components/tickets-view';
import { LiveTracking } from './components/live-tracking';
import { PassengerHeader } from './components/passenger-header';
import type {
  Route,
  Ticket,
  Location,
  SearchFormData,
  BookingData,
  User
} from '@/types';
import { NotificationPreferences } from './components/notification-preferences';
import { PassengerProfile } from './components/passenger-profile';
import { JourneyHistory } from './components/journey-history';
import ClientOnly from '@/components/client-only';

interface DashboardStats {
  total_trips: number;
  total_spent: number;
  total_distance: number;
}

export default function DashboardPage() {
  return (
    <ClientOnly>
      <DashboardPageContent />
    </ClientOnly>
  );
}

function DashboardPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_trips: 0,
    total_spent: 0,
    total_distance: 0
  });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('dashboardActiveTab');
      return savedTab || 'search';
    }
    return 'search';
  });
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('dashboardActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await passengerService.getDashboardData(user.id);

        // Filter out cancelled tickets from statistics
        const activeTickets = data.tickets.filter(
          ticket => ticket.status !== 'cancelled'
        );

        console.log({ activeTickets });
        setStats({
          total_trips: activeTickets.length,
          total_spent: activeTickets.reduce(
            (sum, ticket) => sum + (ticket.amount || 0),
            0
          ),
          total_distance: data.stats.total_distance
        });

        setTickets(data.tickets);
        setRoutes(data.routes);
        // unique item by city
        setLocations(
          data.locations.filter(
            (location, index, self) =>
              index === self.findIndex(t => t.city === location.city)
          )
        );
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
  }, [user]);

  const handleSearch = async (searchData: {
    from: string;
    to: string;
    date: string;
  }) => {
    try {
      console.log({ searchData });

      // Now searchData contains location IDs, not city names
      // from: "23da22b0-e017-411e-9059-ebb0cf9b7d95"
      // to: "5eb5f2a1-0674-4379-adb2-f6df6485dca4"

      const results = await passengerService.searchRoutes(searchData);

      // No need to filter here - the service will handle it correctly
      setRoutes(results);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search routes',
        variant: 'destructive'
      });
    }
  };

  const handleBookTicket = async (
    bookingData: BookingData
  ): Promise<Ticket> => {
    try {
      // Create tickets for each passenger
      const ticketPromises = bookingData.passengers.map(async passenger => {
        const ticket = await passengerService.bookTicket({
          conductor_id: bookingData.conductor_id,
          assignment_id: bookingData.assignmentId,
          passenger_name: passenger.passenger_name,
          passenger_id: passenger.passenger_id,
          passenger_type: passenger.passenger_type,
          seat_number: passenger.seat_number,
          from_location: passenger.from_location,
          to_location: passenger.to_location,
          amount: passenger.amount,
          payment_method: passenger.payment_method,
          payment_status: passenger.payment_status,
          status: passenger.status
        });
        return ticket;
      });

      const newTickets = await Promise.all(ticketPromises);
      setTickets(prev => [...newTickets, ...prev]);

      // Return the first ticket for confirmation dialog
      return newTickets[0];
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to book tickets';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleTicketCancel = async (ticketId: string) => {
    try {
      await passengerService.cancelTicket(ticketId);
      // Update UI
      setTickets(prev =>
        prev.map(t => (t.id === ticketId ? { ...t, status: 'cancelled' } : t))
      );
      toast({
        title: 'Success',
        description: 'Ticket cancelled successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel ticket',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadTicket = async (ticketId: string) => {
    // Generate and download PDF ticket
  };

  const handleShareTicket = async (ticketId: string) => {
    // Share ticket details via email/message
  };

  const activeTickets = tickets.filter(t => t.status === 'active');

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50">
      <PassengerHeader user={user as User | null} />

      <main className="container py-6 px-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Trips"
            value={stats.total_trips}
            icon={Bus}
            description="All time trips"
            className="bg-gradient-to-br from-maroon-50 to-maroon-100"
          />
          <StatCard
            title="Distance"
            value={`${stats.total_distance.toFixed(1)} km`}
            icon={MapPin}
            description="Total traveled"
            className="bg-gradient-to-br from-blue-50 to-blue-100"
          />
          <StatCard
            title="Spent"
            value={`₱${stats.total_spent.toFixed(2)}`}
            icon={Wallet}
            description="Total spent"
            className="bg-gradient-to-br from-green-50 to-green-100"
          />
          <StatCard
            title="Active Tickets"
            value={tickets.filter(t => t.status === 'active').length}
            icon={TicketIcon}
            description="Currently active tickets"
            className="bg-gradient-to-br from-purple-50 to-purple-100"
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 gap-4 bg-transparent">
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <TicketIcon className="h-4 w-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="tracking">
              <MapPin className="h-4 w-4 mr-2" />
              Track
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            {/* <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="search" className="mt-6">
            <SearchRoutes
              locations={locations}
              onSearch={handleSearch}
              results={routes}
              selectedRoute={selectedRoute}
              onRouteSelect={setSelectedRoute}
              onBook={handleBookTicket}
            />
          </TabsContent>

          <TabsContent value="tickets" className="mt-6">
            <TicketsView
              tickets={tickets}
              onCancel={handleTicketCancel}
              onDownload={handleDownloadTicket}
              onShare={handleShareTicket}
            />
          </TabsContent>

          <TabsContent value="tracking" className="mt-6">
            <LiveTracking
              activeTickets={tickets.filter(t => t.status === 'active')}
            />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationPreferences />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <PassengerProfile />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <JourneyHistory
              tickets={tickets}
              onSelectTicket={ticket => {
                setActiveTab('tracking');
                // This will trigger the LiveTracking component to show the selected ticket
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
