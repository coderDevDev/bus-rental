import { supabase } from '@/lib/supabase/client';
import type { Route, Ticket, Location } from '@/types';

export const passengerService = {
  async getDashboardData(userId: string) {
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
          from_location:locations!routes_from_location_fkey (
            city,
            state
          ),
          to_location:locations!routes_to_location_fkey (
            city,
            state
          ),
          distance,
          base_fare
        ),
        bus:bus_id (
          bus_number,
          bus_type
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ticketsError) throw ticketsError;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get popular routes
    const { data: routes, error: routesError } = await supabase
      .from('routes')
      .select(
        `
        *,
        from_location:locations!routes_from_location_fkey (
          city,
          state
        ),
        to_location:locations!routes_to_location_fkey (
          city,
          state
        ),
        tickets(count)
      `
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);

    if (routesError) throw routesError;

    // Calculate stats
    const stats = {
      total_trips: tickets?.length || 0,
      total_spent:
        tickets?.reduce((sum, ticket) => sum + ticket.fare_amount, 0) || 0,
      total_distance:
        tickets?.reduce(
          (sum, ticket) => sum + (ticket.route?.distance || 0),
          0
        ) || 0
    };

    return {
      tickets,
      profile,
      routes,
      stats
    };
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

  async bookTicket(bookingData: {
    route_id: string;
    seat_number: string;
    fare_amount: number;
  }) {
    // Start a Supabase transaction
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          route_id: bookingData.route_id,
          seat_number: bookingData.seat_number,
          fare_amount: bookingData.fare_amount,
          status: 'booked',
          travel_date: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Create passenger booking
    const { error: bookingError } = await supabase
      .from('passenger_bookings')
      .insert([
        {
          ticket_id: ticket.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          seat_number: parseInt(bookingData.seat_number),
          status: 'booked'
        }
      ]);

    if (bookingError) throw bookingError;

    return ticket;
  },

  async searchRoutes(params: { from: string; to: string; date: string }) {
    const { data, error } = await supabase
      .from('routes')
      .select(
        `
        *,
        from_location:locations!routes_from_location_fkey(
          id,
          city,
          state
        ),
        to_location:locations!routes_to_location_fkey(
          id,
          city,
          state
        ),
        assignments!inner(
          id,
          status,
          start_date,
          end_date,
          bus:bus_id(
            id,
            bus_number,
            bus_type,
            capacity
          ),
          conductor:conductor_id(
            id,
            user:user_id(
              name
            )
          )
        )
      `
      )
      .eq('from_location.city', params.from)
      .eq('to_location.city', params.to)
      .eq('assignments.status', 'active');
    // .gte('assignments.start_date', new Date(params.date).toISOString())
    // .lte('assignments.end_date', new Date(params.date).toISOString());

    if (error) {
      console.error('Error searching routes:', error);
      throw error;
    }

    console.log('Search results:', {
      params,
      results: data
    });

    return data;
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
          seats[seatIndex].status = 'booked';
        }
      });

      return seats;
    } catch (error) {
      console.error('Error getting bus seats:', error);
      throw error;
    }
  }
};
