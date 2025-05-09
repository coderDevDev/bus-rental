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
      console.log('Searching with:', searchData);
      const { data: routes, error } = await supabase
        .from('routes')
        .select(
          `
          *,
          from_location:locations!routes_from_location_fkey (*),
          to_location:locations!routes_to_location_fkey (*),
          assignments(
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
              capacity,
              status
            ),
            start_date,
            end_date,
            status
          )
        `
        )
        .not('stops', 'is', null)
        .filter(
          'stops',
          'cs',
          `[{"location":{"id":"${searchData.from}"}},{"location":{"id":"${searchData.to}"}}]`
        );

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      console.log('Raw routes found:', routes);

      // Process and filter routes
      const availableRoutes = routes
        ?.filter(route => {
          if (!route.stops) return false;

          const stops = route.stops;
          const fromIndex = stops.findIndex(
            (stop: any) => stop.location.id === searchData.from
          );
          const toIndex = stops.findIndex(
            (stop: any) => stop.location.id === searchData.to
          );

          // Only include if 'from' stop comes before 'to' stop
          return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
        })
        .map(route => {
          const stops = route.stops;
          const fromIndex = stops.findIndex(
            (stop: any) => stop.location.id === searchData.from
          );
          const toIndex = stops.findIndex(
            (stop: any) => stop.location.id === searchData.to
          );

          // Get only the relevant stops for this journey
          const relevantStops = stops.slice(fromIndex, toIndex + 1);

          // Calculate segment fare
          const segmentFare = calculateSegmentFare(
            route.base_fare,
            fromIndex,
            toIndex,
            stops
          );

          return {
            ...route,
            stops: relevantStops,
            fare: segmentFare,
            departure_time: stops[fromIndex].arrivalOffset,
            arrival_time: stops[toIndex].arrivalOffset
          };
        });

      console.log('Processed routes:', availableRoutes);
      return availableRoutes || [];
    } catch (error) {
      console.error('Error searching routes:', error);
      throw error;
    }
  },

  async bookTicket(bookingData: BookingData) {
    try {
      console.log('Received Booking Data:', bookingData);

      // Since we don't have ticket_passengers table, we'll store first passenger info in tickets
      const ticketData = {
        passenger_id: bookingData.passenger_id,
        route_id: bookingData.route_id,
        assignment_id: bookingData.assignment_id,
        conductor_id: bookingData.conductor_id,
        from_location_id: bookingData.from_location_id,
        to_location_id: bookingData.to_location_id,
        from_location: bookingData.from_location,
        to_location: bookingData.to_location,
        departure_time: bookingData.departure_time,
        arrival_time: bookingData.arrival_time,
        ticket_number: `T-${Math.floor(Math.random() * 10000)}`,
        status: 'active',
        passenger_type: bookingData.passengers[0].passenger_type,
        passenger_name: bookingData.passengers[0].name,
        seat_number: bookingData.passengers[0].seat_number,
        amount: bookingData.amount,
        payment_method: bookingData.payment_method,
        created_at: new Date().toISOString()
      };

      // Debug logging
      console.log('Ticket Data to Insert:', ticketData);

      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select()
        .single();

      if (ticketError) {
        console.error('Ticket creation error:', ticketError);
        throw ticketError;
      }

      // If there are additional passengers, create separate tickets for them
      if (bookingData.passengers.length > 1) {
        const additionalTickets = bookingData.passengers
          .slice(1)
          .map(passenger => ({
            ...ticketData,
            ticket_number: `T-${Math.floor(Math.random() * 10000)}`,
            passenger_type: passenger.passenger_type,
            passenger_name: passenger.name,
            seat_number: passenger.seat_number
          }));

        const { error: additionalError } = await supabase
          .from('tickets')
          .insert(additionalTickets);

        if (additionalError) {
          console.error('Error creating additional tickets:', additionalError);
          // Rollback the first ticket
          await supabase.from('tickets').delete().eq('id', ticket.id);
          throw additionalError;
        }
      }

      // Return the complete ticket
      const { data: fullTicket, error: getError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticket.id)
        .single();

      if (getError) {
        console.error('Error fetching complete ticket:', getError);
        throw getError;
      }

      return fullTicket;
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

// Helper function to calculate fare for a segment of the route
function calculateSegmentFare(
  baseFare: number,
  fromIndex: number,
  toIndex: number,
  stops: any[]
) {
  // Calculate total distance between selected stops
  let segmentDistance = 0;
  for (let i = fromIndex; i < toIndex; i++) {
    const currentStop = stops[i].location;
    const nextStop = stops[i + 1].location;
    segmentDistance += calculateDistance(
      currentStop.latitude,
      currentStop.longitude,
      nextStop.latitude,
      nextStop.longitude
    );
  }

  // Calculate fare based on distance ratio
  const totalDistance = calculateTotalDistance(stops);
  return (segmentDistance / totalDistance) * baseFare;
}

// Helper function to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function calculateTotalDistance(stops: any[]) {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += calculateDistance(
      stops[i].location.latitude,
      stops[i].location.longitude,
      stops[i + 1].location.latitude,
      stops[i + 1].location.longitude
    );
  }
  return total;
}

function getAvailableSeats(assignment: any) {
  const capacity = assignment.bus.capacity;
  const takenSeats = assignment.taken_seats?.length || 0;
  return capacity - takenSeats;
}
