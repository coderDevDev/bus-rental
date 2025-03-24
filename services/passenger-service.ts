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

  async bookTicket(routeId: string) {
    // First get the route details
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select(
        `
        *,
        from_location:locations!routes_from_location_fkey(city, state),
        to_location:locations!routes_to_location_fkey(city, state)
      `
      )
      .eq('id', routeId)
      .single();

    if (routeError) throw routeError;

    // Create the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([
        {
          route_id: routeId,
          user_id: 1,
          fare_amount: route.base_fare,
          travel_date: new Date().toISOString(),
          status: 'booked'
        }
      ])
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Generate QR code
    const { data: digitalTicket, error: digitalError } = await supabase
      .from('digital_tickets')
      .insert([
        {
          ticket_id: ticket.id,
          qr_code: `TICKET-${ticket.id}`
        }
      ])
      .select()
      .single();

    if (digitalError) throw digitalError;

    return {
      ...ticket,
      route,
      digital_ticket: digitalTicket
    };
  },

  async searchRoutes(params: {
    from_location?: string;
    to_location?: string;
    date?: string;
  }) {
    // First get routes
    const routeQuery = supabase
      .from('routes')
      .select(
        `
        *,
        from_location:locations!routes_from_location_fkey(*),
        to_location:locations!routes_to_location_fkey(*),
        buses:assignments(
          bus:buses(*)
        )
      `
      )
      .eq('status', 'active');

    if (params.from_location) {
      routeQuery.eq('from_location', params.from_location);
    }
    if (params.to_location) {
      routeQuery.eq('to_location', params.to_location);
    }

    const { data: routes, error } = await routeQuery;

    if (error) throw error;

    // Then get active assignments for these routes
    if (routes && routes.length > 0) {
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(
          `
          *,
          bus:buses(*),
          conductor:conductors(*)
        `
        )
        .in(
          'route_id',
          routes.map(r => r.id)
        )
        .eq('status', 'active')
        .gte('start_date', params.date || new Date().toISOString())
        .lte('end_date', params.date || new Date().toISOString());

      if (assignmentsError) throw assignmentsError;

      // Merge assignments with routes
      return routes.map(route => ({
        ...route,
        assignments: assignments?.filter(a => a.route_id === route.id) || []
      }));
    }

    return routes || [];
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
        bus:buses(*),
        assignment:assignments(*)
      `
      )
      .eq('assignment.route_id', route_id)
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
  }
};
