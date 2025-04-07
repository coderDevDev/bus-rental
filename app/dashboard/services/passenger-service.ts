import { supabase } from '@/lib/supabase/client';
import type {
  Route,
  Ticket,
  Location,
  SearchFormData,
  BookingData
} from '@/types';

// Add type for assignment
interface AssignmentWithConductor {
  id: string;
  conductor_id: string;
  conductor?: {
    id: string;
    user?: {
      name: string;
      email: string;
    };
  };
}

export const passengerService = {
  async getDashboardData(userId: string) {
    try {
      // First get tickets with assignment and route info
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(
          `
          *,
          assignment:assignment_id (
            id,
            route:route_id (
              id,
              route_number,
              name,
              from_location:locations!routes_from_location_fkey (
                city,
                state,
                latitude,
                longitude
              ),
              to_location:locations!routes_to_location_fkey (
                city,
                state,
                latitude,
                longitude
              ),
              distance,
              base_fare
            )
          )
        `
        )
        .eq('passenger_id', userId)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Get locations for search
      const { data: locations, error: locationsError } = await supabase
        .from('locations')
        .select('*');
      // .eq('status', 'active');

      if (locationsError) throw locationsError;

      // Transform tickets to include location coordinates
      const transformedTickets = tickets?.map(ticket => ({
        ...ticket,
        from_location_latitude:
          ticket.assignment?.route?.from_location?.latitude || 0,
        from_location_longitude:
          ticket.assignment?.route?.from_location?.longitude || 0,
        to_location_latitude:
          ticket.assignment?.route?.to_location?.latitude || 0,
        to_location_longitude:
          ticket.assignment?.route?.to_location?.longitude || 0
      }));

      // Calculate stats
      const stats = {
        total_trips: tickets?.length || 0,
        total_spent:
          tickets?.reduce((sum, ticket) => sum + ticket.amount, 0) || 0,
        total_distance:
          tickets?.reduce((sum, ticket) => {
            const route = ticket.assignment?.route;
            return sum + (route?.distance || 0);
          }, 0) || 0
      };

      return {
        tickets: transformedTickets || [],
        locations: locations || [],
        stats,
        routes: []
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  async searchRoutes(searchData: SearchFormData) {
    try {
      const { data: routes, error } = await supabase
        .from('routes')
        .select(
          `
          *,
          from_location:locations!routes_from_location_fkey (*),
          to_location:locations!routes_to_location_fkey (*),
          assignments!inner(
            id,
            conductor_id,
            conductor:conductor_id (
              id,
              user:user_id (
                name,
                email
              )
            ),
            bus:bus_id (
              id,
              bus_number,
              capacity
            ),
            start_date,
            end_date,
            status
          )
        `
        )
        .eq('status', 'active')
        .eq('from_location', searchData.from)
        .eq('to_location', searchData.to)
        .eq('assignments.status', 'active');

      console.log({ jham: routes });
      if (error) throw error;

      // Transform the data to include conductor info in a more accessible way
      const routesWithConductor =
        routes?.map(route => ({
          ...route,
          assignments: route.assignments?.map(
            (assignment: AssignmentWithConductor) => ({
              ...assignment,
              conductor_id: assignment.conductor_id,
              conductor_name: assignment.conductor?.user?.name || 'Unknown'
            })
          )
        })) || [];

      return routesWithConductor;
    } catch (error) {
      console.error('Error searching routes:', error);
      throw error;
    }
  },

  async bookTicket(bookingData: {
    conductor_id: string;
    assignment_id: string;
    passenger_name: string;
    passenger_id: string;
    passenger_type: 'regular' | 'student' | 'senior';
    seat_number: string;
    from_location: string;
    to_location: string;
    amount: number;
    payment_method: 'cash' | 'card' | 'ewallet';
    payment_status: string;
    status: string;
  }) {
    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          conductor_id: bookingData.conductor_id,
          assignment_id: bookingData.assignment_id,
          passenger_name: bookingData.passenger_name,
          passenger_id: bookingData.passenger_id,
          passenger_type: bookingData.passenger_type,
          seat_number: bookingData.seat_number,
          from_location: bookingData.from_location,
          to_location: bookingData.to_location,
          amount: bookingData.amount,
          payment_method: bookingData.payment_method,
          payment_status: bookingData.payment_status,
          status: bookingData.status,
          ticket_number: `T-${Math.floor(1000 + Math.random() * 9000)}`,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return ticket;
    } catch (error) {
      console.error('Error booking ticket:', error);
      throw error;
    }
  },

  async getTicketQR(ticketId: string) {
    // Generate/fetch QR code for ticket validation
  },

  async cancelTicket(ticketId: string) {
    // Handle ticket cancellation
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update({ status: 'cancelled' })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getTicketHistory(
    userId: string,
    filters?: {
      status?: string;
      dateRange?: { from: string; to: string };
    }
  ) {
    // Fetch ticket history with filters
  },

  async rateJourney(
    ticketId: string,
    rating: {
      score: number;
      feedback?: string;
    }
  ) {
    // Submit journey rating
  },

  async completeJourney(ticketId: string) {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'completed' as const,
          completed_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      // Record the activity
      await supabase.from('passenger_activities').insert({
        type: 'journey_completed',
        passenger_id: selectedTicket.passenger_id,
        ticket_id: ticketId,
        created_at: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error completing journey:', error);
      throw error;
    }
  }
};
