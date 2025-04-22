import { supabase } from '@/lib/supabase/client';
import type {
  ConductorAssignment,
  ConductorStats,
  Route,
  Bus,
  ConductorActivity,
  LocationUpdate,
  Location
} from '@/types/conductor';
import { routeService } from './route-service';
import { busService } from './bus-service';
import { createClient } from '@supabase/supabase-js';

let lastLocationUpdate = 0;

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

interface TicketDetails {
  id: string;
  ticket_number: string;
  passenger_name: string;
  passenger_type: 'regular' | 'student' | 'senior';
  seat_number: string;
  from_location: string;
  to_location: string;
  amount: number;
  payment_method: 'cash' | 'card';
  payment_status: 'paid' | 'pending' | 'failed';
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  conductor?: {
    id: string;
    user?: {
      name: string;
    };
  };
  assignment?: {
    id: string;
    route?: {
      name: string;
      from_location: string;
      to_location: string;
    };
    bus?: {
      bus_number: string;
    };
  };
}

interface RouteDetailsResponse {
  id: string;
  name: string;
  start_location: string;
  end_location: string;
  status: 'active';
  base_fare: number;
  from_location_latitude: number;
  from_location_longitude: number;
  to_location_latitude: number;
  to_location_longitude: number;
  currentLocation?: {
    coordinates: [number, number];
    heading?: number;
    speed?: number;
  };
}

interface LocationWithTracking {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  updated_at: string;
}

interface RouteWithLocations extends Route {
  from_location: {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  to_location: {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
}

interface TicketBreakdown {
  regular: number;
  student: number;
  senior: number;
}

interface ActivePassenger {
  id: string;
  name: string;
  seatNumber: string;
  destination: string;
  ticketType: 'regular' | 'student' | 'senior';
}

interface TicketValidationResponse {
  ticket: {
    id: string;
    ticket_number: string;
    passenger_name: string;
    from_location: string;
    to_location: string;
    status: string;
  };
  isValid: boolean;
  message: string;
}

interface TimeRecord {
  record_id: string;
  conductor_id: string;
  assignment_id: string;
  clock_in: string;
  clock_out?: string;
  status: 'active' | 'completed';
  duration_minutes?: number;
}

export const conductorDashboardService = {
  async getCurrentAssignment(
    conductorId: string
  ): Promise<ConductorAssignment | null> {
    try {
      const { data: assignment, error } = await supabase
        .from('assignments')
        .select(
          `
          *,
          route:route_id (
            id,
            name,
            route_number,
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
            base_fare,
            status
          ),
          bus:bus_id (
            id,
            bus_number,
            bus_type,
            capacity,
            status
          )
        `
        )
        .eq('conductor_id', conductorId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return assignment;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  },

  async getRouteDetails(routeId: string): Promise<Route> {
    const { data, error } = await supabase
      .from('routes')
      .select(
        `
        *,
        stops:route_stops(*)
      `
      )
      .eq('id', routeId)
      .single();

    if (error) throw error;
    return data;
  },

  async getBusDetails(busId: string): Promise<Bus> {
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .eq('id', busId)
      .single();

    if (error) throw error;
    return data;
  },

  async getTodayStats(conductorId: string): Promise<ConductorStats> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get tickets issued today
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('amount, type')
        .eq('conductor_id', conductorId)
        .gte('created_at', today);

      if (ticketsError) throw ticketsError;

      // Get time records for today
      const { data: timeRecords, error: timeError } = await supabase
        .from('time_records')
        .select('*')
        .eq('conductor_id', conductorId)
        .eq('status', 'active')
        .gte('clock_in', today);

      if (timeError) throw timeError;

      // Calculate stats
      const revenue =
        tickets?.reduce((sum, ticket) => sum + (ticket.amount || 0), 0) || 0;
      const ticketsIssued = tickets?.length || 0;

      // Calculate active hours
      const activeHours =
        timeRecords?.reduce((sum, record) => {
          const clockIn = new Date(record.clock_in);
          const clockOut = record.clock_out
            ? new Date(record.clock_out)
            : new Date();
          return (
            sum + (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
          );
        }, 0) || 0;

      return {
        ticketsIssued,
        activeHours: Math.round(activeHours * 10) / 10, // Round to 1 decimal place
        revenue,
        passengerCount: ticketsIssued
      };
    } catch (error) {
      console.error('Error getting today stats:', error);
      return {
        ticketsIssued: 0,
        activeHours: 0,
        revenue: 0,
        passengerCount: 0
      };
    }
  },

  async getPassengerCount(assignmentId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('assignment_id', assignmentId)
        .eq('status', 'active');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching passenger count:', error);
      return 0;
    }
  },

  async getCurrentLocation(assignmentId: string) {
    try {
      // Get the most recent location update for this assignment
      const { data, error } = await supabase
        .from('location_updates')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single(); // Get just one row

      if (error) {
        console.error('Error getting current location:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentLocation:', error);

      // Return a default location if there's an error
      return {
        latitude: 14.5995, // Default location (Manila)
        longitude: 120.9842,
        updated_at: new Date().toISOString()
      };
    }
  },

  async getActiveTimeRecord(conductorId: string): Promise<TimeRecord | null> {
    try {
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('conductor_id', conductorId)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No active record
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting active time record:', error);
      return null;
    }
  },

  async getRecentActivities(
    conductorId: string,
    limit = 10
  ): Promise<ConductorActivity[]> {
    const { data, error } = await supabase
      .from('conductor_activities')
      .select('*')
      .eq('conductor_id', conductorId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async scanQRCode(qrData: string, conductorId: string, assignmentId: string) {
    // Parse QR data
    const ticketData = JSON.parse(qrData);

    // Verify ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketData.ticket_id)
      .single();

    if (ticketError) throw new Error('Invalid ticket');
    if (!ticket) throw new Error('Ticket not found');
    if (ticket.status !== 'active') throw new Error('Ticket is not active');

    // Record boarding
    const { error: boardingError } = await supabase
      .from('passenger_boardings')
      .insert({
        ticket_id: ticket.id,
        conductor_id: conductorId,
        assignment_id: assignmentId,
        boarding_time: new Date().toISOString()
      });

    if (boardingError) throw boardingError;

    // Record activity
    const { error: activityError } = await supabase
      .from('conductor_activities')
      .insert({
        type: 'passenger_boarded',
        conductor_id: conductorId,
        assignment_id: assignmentId,
        ticket_id: ticket.id,
        passenger_id: ticket.passenger_id,
        details: {
          ticket_type: ticket.type,
          amount: ticket.amount
        }
      });

    if (activityError) throw activityError;

    return ticket;
  },

  async getConductorId(userId: string): Promise<string> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log({ userId });
      // First try to get existing conductor
      const { data: conductor, error } = await supabase
        .from('conductors')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Record not found
        // Get user data first
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error('Unable to get user data');
        }

        // Create new conductor profile
        const { data: newConductor, error: createError } = await supabase
          .from('conductors')
          .insert([
            {
              id: userId,
              name: user.user_metadata?.name || 'Unknown',
              email: user.email,
              phone: user.user_metadata?.phone || '',
              license_number: user.user_metadata?.license_number || '',
              experience_years: user.user_metadata?.experience_years || 0,
              status: 'active'
            }
          ])
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        return newConductor.id;
      } else if (error) {
        throw error;
      }

      return conductor.id;
    } catch (error) {
      console.error('Error getting conductor ID:', error);
      throw error;
    }
  },

  async updateConductorProfile(data: { id: string; metadata: any }) {
    try {
      // First get the conductor ID
      const conductorId = await this.getConductorId(data.id);
      if (!conductorId) {
        throw new Error('Conductor not found');
      }

      // Update conductor profile
      const { error: conductorError } = await supabase
        .from('conductors')
        .update({
          name: data.metadata.name,
          phone: data.metadata.phone
          // Add other fields as needed
        })
        .eq('id', conductorId);

      if (conductorError) throw conductorError;

      // Update auth metadata if needed
      const { error: authError } = await supabase.auth.updateUser({
        data: data.metadata
      });

      if (authError) throw authError;

      return { success: true };
    } catch (error) {
      console.error('Error updating conductor profile:', error);
      throw error;
    }
  },

  async issueTicket(ticketData: {
    passenger_name: string;
    passenger_type: string;
    seat_number: string;
    from_location: string;
    to_location: string;
    amount: number;
    payment_method: string;
    assignment_id: string;
    conductor_id: string;
  }) {
    try {
      // Generate ticket ID and number
      const id = crypto.randomUUID();
      const ticket_number = `TKT-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

      // Add current timestamp
      const now = new Date().toISOString();

      // Make sure conductor_id is provided
      if (!ticketData.conductor_id) {
        throw new Error('Conductor ID is required to issue a ticket');
      }

      // Create the ticket in database
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          id,
          ticket_number,
          created_at: now,
          status: 'active',
          ...ticketData
        })
        .select()
        .single();

      if (error) {
        console.error('Database error creating ticket:', error);
        throw new Error(`Failed to create ticket: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error issuing ticket:', error);
      throw error;
    }
  },

  async getTakenSeats(assignmentId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('seat_number')
        .eq('assignment_id', assignmentId)
        .eq('status', 'active');

      if (error) throw error;

      return data
        ?.map(ticket => ticket.seat_number)
        .filter(Boolean) as string[];
    } catch (error) {
      console.error('Error fetching taken seats:', error);
      return [];
    }
  },

  async getTicketHistory(
    conductorId: string,
    filters?: {
      status?: string;
      date?: string;
      searchQuery?: string;
    }
  ): Promise<TicketHistory[]> {
    try {
      let query = supabase
        .from('tickets')
        .select(
          `
          id,
          ticket_number,
          passenger_name,
          passenger_type,
          from_location,
          to_location,
          amount,
          status,
          created_at
        `
        )
        .eq('conductor_id', conductorId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.date) {
        query = query.gte('created_at', filters.date);
      }
      if (filters?.searchQuery) {
        query = query.or(
          `passenger_name.ilike.%${filters.searchQuery}%,ticket_number.ilike.%${filters.searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching ticket history:', error);
      throw error;
    }
  },

  async getTicketDetails(ticketId: string): Promise<TicketDetails> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(
          `
          *,
          conductor:conductor_id (
            id,
            user:user_id (name)
          ),
          assignment:assignment_id (
            id,
            route:route_id (
              name,
              from_location,
              to_location
            ),
            bus:bus_id (
              bus_number
            )
          )
        `
        )
        .eq('id', ticketId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      throw error;
    }
  },

  async getRouteDetailsForAssignment(
    assignmentId: string
  ): Promise<RouteDetailsResponse> {
    try {
      const { data: assignment, error } = await supabase
        .from('assignments')
        .select(
          `
          id,
          route:route_id (
            id,
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
            base_fare
          )
        `
        )
        .eq('id', assignmentId)
        .single();

      if (error) throw error;

      // Cast to unknown first to handle type mismatch
      const route = assignment?.route as unknown as RouteWithLocations;
      const currentLocation = await this.getCurrentLocation(assignmentId);

      return {
        id: route.id,
        name: route.name,
        start_location: route.from_location.city,
        end_location: route.to_location.city,
        status: 'active',
        base_fare: route.base_fare,
        from_location_latitude: route.from_location.latitude,
        from_location_longitude: route.from_location.longitude,
        to_location_latitude: route.to_location.latitude,
        to_location_longitude: route.to_location.longitude,
        currentLocation: currentLocation
          ? {
              coordinates: [
                currentLocation.longitude,
                currentLocation.latitude
              ],
              heading: currentLocation.heading,
              speed: currentLocation.speed
            }
          : undefined
      };
    } catch (error) {
      console.error('Error getting route details:', error);
      throw error;
    }
  },

  async recordActivity(activity: Omit<ConductorActivity, 'id' | 'created_at'>) {
    try {
      const { error } = await supabase.from('conductor_activities').insert({
        ...activity,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording activity:', error);
      throw error;
    }
  },

  async createConductorProfile(userId: string, metadata: any) {
    try {
      const { data, error } = await supabase
        .from('conductors')
        .insert([
          {
            id: userId,
            name: metadata.name,
            email: metadata.email,
            phone: metadata.phone,
            license_number: metadata.license_number,
            experience_years: metadata.experience_years,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conductor profile:', error);
      throw error;
    }
  },

  async getTicketBreakdown(assignmentId: string): Promise<TicketBreakdown> {
    try {
      const { data, error } = await supabase.rpc('get_ticket_breakdown', {
        p_assignment_id: assignmentId,
        p_status: 'active'
      });

      if (error) throw error;

      const breakdown = {
        regular: 0,
        student: 0,
        senior: 0
      };

      if (Array.isArray(data)) {
        data.forEach((item: { passenger_type: string; count: number }) => {
          if (item.passenger_type in breakdown) {
            breakdown[item.passenger_type as keyof TicketBreakdown] =
              item.count;
          }
        });
      }

      return breakdown;
    } catch (error) {
      console.error('Error getting ticket breakdown:', error);
      return { regular: 0, student: 0, senior: 0 };
    }
  },

  async getActivePassengers(assignmentId: string): Promise<ActivePassenger[]> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(
          `
          id,
          passenger_name,
          passenger_type,
          seat_number,
          to_location
        `
        )
        .eq('assignment_id', assignmentId)
        .eq('status', 'active');

      if (error) throw error;

      return data.map(ticket => ({
        id: ticket.id,
        name: ticket.passenger_name,
        seatNumber: ticket.seat_number,
        destination: ticket.to_location,
        ticketType: ticket.passenger_type
      }));
    } catch (error) {
      console.error('Error getting active passengers:', error);
      return [];
    }
  },

  async cancelTicket(ticketId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      throw error;
    }
  },

  async validateTicket(
    qrData: string,
    conductorId: string,
    assignmentId: string
  ): Promise<TicketValidationResponse> {
    try {
      // Parse QR data
      const ticketData = JSON.parse(qrData);

      // Verify ticket exists and is valid
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketData.id)
        .single();

      if (error) throw new Error('Invalid ticket');
      if (!ticket) throw new Error('Ticket not found');

      // Check if ticket is already used
      if (ticket.status !== 'active') {
        return {
          ticket,
          isValid: false,
          message: `Ticket is ${ticket.status}`
        };
      }

      // Check if ticket is for this route
      if (ticket.assignment_id !== assignmentId) {
        return {
          ticket,
          isValid: false,
          message: 'Ticket is for a different route'
        };
      }

      // Record boarding
      await supabase.from('passenger_boardings').insert({
        ticket_id: ticket.id,
        conductor_id: conductorId,
        assignment_id: assignmentId,
        boarding_time: new Date().toISOString()
      });

      // Update ticket status
      await supabase
        .from('tickets')
        .update({ status: 'boarded' })
        .eq('id', ticket.id);

      return {
        ticket,
        isValid: true,
        message: 'Ticket validated successfully'
      };
    } catch (error) {
      console.error('Error validating ticket:', error);
      throw error;
    }
  },

  async clockIn(userId: string, assignmentId: string): Promise<TimeRecord> {
    try {
      const conductorId = await this.getConductorId(userId);
      if (!conductorId) throw new Error('Conductor not found');

      const record_id = crypto.randomUUID();
      const { data, error } = await supabase
        .from('time_records')
        .insert({
          record_id,
          conductor_id: conductorId,
          assignment_id: assignmentId,
          clock_in: new Date().toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error clocking in:', error);
      throw error;
    }
  },

  async clockOut(timeRecordId: string): Promise<TimeRecord> {
    try {
      const clockOut = new Date().toISOString();
      const { data, error } = await supabase
        .from('time_records')
        .update({
          clock_out: clockOut,
          status: 'completed'
        })
        .eq('record_id', timeRecordId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error clocking out:', error);
      throw error;
    }
  },

  async updateLocation({
    conductor_id,
    assignment_id,
    latitude,
    longitude,
    heading
  }: {
    conductor_id: string;
    assignment_id: string;
    latitude: number;
    longitude: number;
    heading?: number;
  }) {
    try {
      // Check that both required parameters are provided
      if (!conductor_id || !assignment_id) {
        throw new Error('Conductor ID and Assignment ID are required');
      }

      console.log('Updating location with:', {
        conductor_id,
        assignment_id,
        latitude,
        longitude,
        heading
      });

      // Insert a new location update record instead of updating the assignment
      const { data, error } = await supabase
        .from('location_updates')
        .insert([
          {
            conductor_id,
            assignment_id,
            latitude,
            longitude,
            heading,
            updated_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Error inserting location update:', error);
        throw error;
      }

      // Also update the last_location_update field in the assignment if it exists
      try {
        await supabase
          .from('assignments')
          .update({
            last_location_update: new Date().toISOString()
          })
          .eq('id', assignment_id)
          .eq('conductor_id', conductor_id);
      } catch (updateError) {
        // Non-critical error, just log it
        console.warn(
          'Could not update assignment last_location_update:',
          updateError
        );
      }

      return data[0] || { success: true };
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  async approveTicket(ticketId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;
    } catch (error) {
      console.error('Error approving ticket:', error);
      throw error;
    }
  }
};
