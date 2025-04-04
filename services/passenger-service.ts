import { supabase } from '@/lib/supabase/client';
import type {
  Route,
  Ticket,
  Location,
  SearchFormData,
  BookingData
} from '@/types';

interface TicketWithRoute extends Ticket {
  route?: {
    distance: number;
  };
}

export const passengerService = {
  async getDashboardData(userId: string) {
    try {
      // Get user's tickets with route info
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(
          `
          *,
          route:route_id (
            id,
            route_number,
            name,
            from_location:locations!routes_from_location_fkey (city, state),
            to_location:locations!routes_to_location_fkey (city, state),
            distance,
            base_fare
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Get locations for search
      const { data: locations, error: locationsError } = await supabase
        .from('locations')
        .select('*')
        .eq('status', 'active');

      if (locationsError) throw locationsError;

      // Calculate stats
      const stats = {
        total_trips: tickets?.length || 0,
        total_spent:
          tickets?.reduce((sum, ticket) => sum + ticket.amount, 0) || 0,
        total_distance:
          tickets?.reduce(
            (sum, ticket) => sum + (ticket.route?.distance || 0),
            0
          ) || 0
      };

      return {
        tickets: tickets || [],
        locations: locations || [],
        stats,
        routes: []
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  async getUserProfile(userId: string) {
    // First get user profile
    const { data: userData, error: userError } = await supabase
      .from('profiles') // Using profiles table instead of users
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Then get tickets count and stats
    const { data: statsData, error: statsError } = await supabase
      .from('tickets')
      .select(
        `
        id,
        route:route_id (
          distance
        )
      `
      )
      .eq('user_id', userId);

    if (statsError) throw statsError;

    return {
      ...userData,
      trips: statsData?.length || 0,
      total_distance:
        statsData?.reduce(
          (sum, ticket) => sum + (ticket.route?.distance || 0),
          0
        ) || 0
    };
  },

  async getPopularRoutes() {
    const { data, error } = await supabase
      .from('routes')
      .select(
        `
        id,
        route_number,
        name,
        from_location (
          city
        ),
        to_location (
          city
        ),
        base_fare,
        distance,
        tickets (
          count
        )
      `
      )
      .eq('status', 'active')
      .order('tickets.count', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data;
  },

  async getLocations() {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('city', { ascending: true });

    if (error) throw error;
    return data;
  },

  async searchBuses(
    fromLocationId: string,
    toLocationId: string,
    date: string
  ) {
    const { data, error } = await supabase
      .from('routes')
      .select(
        `
        *,
        assignments!inner (
          id,
          bus:buses!inner (
            id,
            bus_number,
            bus_type
          ),
          conductor:conductors!inner (
            id,
            profile:profiles!inner (
              name
            )
          )
        )
      `
      )
      .eq('from_location', fromLocationId)
      .eq('to_location', toLocationId)
      .eq('assignments.status', 'active')
      .gte('assignments.start_date', date)
      .lt('assignments.start_date', `${date}T23:59:59`);

    if (error) throw error;
    return data;
  },

  async getUserTickets(userId: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select(
        `
        *,
        route:routes!inner (
          id,
          from_location:locations!from_location_fkey (
            city
          ),
          to_location:locations!to_location_fkey (
            city
          )
        ),
        bus:buses!inner (
          bus_number,
          bus_type
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getBusLocations(routeId?: string) {
    const query = supabase.from('bus_locations').select(`
        *,
        bus:id (
          bus_number,
          capacity,
          bus_type
        ),
        next_stop:next_stop (
          city,
          state
        )
      `);

    if (routeId) {
      query.eq('route_id', routeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async generateDigitalTicket(ticketId: string) {
    const { data, error } = await supabase
      .from('digital_tickets')
      .insert([{ ticket_id: ticketId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async estimateFare(routeId: string, passengers: number) {
    const { data: route, error } = await supabase
      .from('routes')
      .select('base_fare')
      .eq('id', routeId)
      .single();

    if (error) throw error;
    return route.base_fare * passengers;
  },

  async searchRoutes(searchData: SearchFormData) {
    try {
      console.log('Searching routes with:', searchData);

      // Get routes that match the search criteria
      const { data: routes, error } = await supabase
        .from('routes')
        .select(
          `
          id,
          route_number,
          name,
          base_fare,
          distance,
          status,
          from_location:locations!routes_from_location_fkey (
            id,
            city,
            state,
            status
          ),
          to_location:locations!routes_to_location_fkey (
            id,
            city,
            state,
            status
          ),
          assignments!inner (
            id,
            status,
            start_date,
            end_date,
            bus:bus_id (
              id,
              bus_number,
              bus_type,
              capacity,
              status
            )
          )
        `
        )
        .eq('status', 'active')
        .eq('from_location.id', searchData.from)
        .eq('to_location.id', searchData.to)
        .eq('assignments.status', 'active')
        .gte('assignments.start_date', searchData.date)
        .lte('assignments.end_date', searchData.date);

      if (error) {
        console.error('Error searching routes:', error);
        throw error;
      }

      // Filter out routes with inactive buses or locations
      const availableRoutes = routes?.filter(route => {
        const isFromLocationActive = route.from_location?.status === 'active';
        const isToLocationActive = route.to_location?.status === 'active';
        const hasActiveBus = route.assignments?.some(
          assignment => assignment.bus?.status === 'active'
        );

        return isFromLocationActive && isToLocationActive && hasActiveBus;
      });

      console.log('Found routes:', availableRoutes);
      return availableRoutes || [];
    } catch (error) {
      console.error('Error in searchRoutes:', error);
      throw error;
    }
  },

  async bookTicket(bookingData: BookingData) {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          ...bookingData,
          status: 'booked',
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) throw error;
      return ticket;
    } catch (error) {
      console.error('Error booking ticket:', error);
      throw error;
    }
  },

  async bookSeat(params: {
    route_id: string;
    seat_number: number;
    boarding_stop: string;
    dropoff_stop: string;
  }) {
    const { data, error } = await supabase
      .from('passenger_bookings')
      .insert([
        {
          route_id: params.route_id,
          seat_number: params.seat_number,
          boarding_stop: params.boarding_stop,
          dropoff_stop: params.dropoff_stop,
          status: 'booked'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async trackBus(route_id: string) {
    const { data, error } = await supabase
      .from('bus_tracking')
      .select(
        `
        *,
        bus:bus_id(
          id,
          bus_number,
          bus_type
        )
      `
      )
      .eq('route_id', route_id)
      .eq('status', 'active')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  },

  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getBusSeats(busId: string, routeId: string, date: string) {
    try {
      // Get the assignment for this bus and route
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .select('id, bus:bus_id(capacity)')
        .eq('bus_id', busId)
        .eq('route_id', routeId)
        .eq('status', 'active')
        .gte('start_date', date)
        .lte('end_date', date)
        .single();

      if (assignmentError) throw assignmentError;
      if (!assignment) throw new Error('No active assignment found');

      const totalSeats = assignment.bus?.capacity || 40;
      const seats = Array.from({ length: totalSeats }, (_, i) => ({
        number: (i + 1).toString(),
        status: 'available' as const
      }));

      // Get booked seats
      const { data: bookings, error: bookingsError } = await supabase
        .from('tickets')
        .select('seat_number')
        .eq('route_id', routeId)
        .eq('bus_id', busId)
        .eq('status', 'booked')
        .eq('travel_date', date);

      if (bookingsError) throw bookingsError;

      // Mark booked seats
      bookings?.forEach(booking => {
        const seatIndex = parseInt(booking.seat_number) - 1;
        if (seatIndex >= 0 && seatIndex < seats.length) {
          seats[seatIndex].status = 'booked' as const;
        }
      });

      return seats;
    } catch (error) {
      console.error('Error getting bus seats:', error);
      throw error;
    }
  }
};
