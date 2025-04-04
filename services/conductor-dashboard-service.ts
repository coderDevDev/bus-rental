import { supabase } from '@/lib/supabase/client';
import type {
  ConductorAssignment,
  ConductorStats,
  Route,
  Bus,
  ConductorActivity
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

interface LocationData {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  updated_at: string;
}

export const conductorDashboardService = {
  async getCurrentAssignment(
    conductorId: string
  ): Promise<ConductorAssignment | null> {
    try {
      const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .select(
          `
          *,
          route:route_id(
            id,
            name,
            from_location:locations!routes_from_location_fkey(city),
            to_location:locations!routes_to_location_fkey(city),
            *,
            from_location_latitude:locations!routes_from_location_fkey(latitude),
            from_location_longitude:locations!routes_from_location_fkey(longitude),
            to_location_latitude:locations!routes_to_location_fkey(latitude),
            to_location_longitude:locations!routes_to_location_fkey(longitude)
          ),
          bus:bus_id(
            id,
            bus_number,
            bus_type,
            capacity
          ),
          conductor:conductor_id(
            id,
            conductor_id,
            user:user_id(
              name,
              email
            )
          )
        `
        )
        .eq('conductor_id', conductorId)
        .eq('status', 'active')
        .single();

      if (assignmentError) {
        console.error('Error fetching assignment:', assignmentError);
        throw assignmentError;
      }

      if (!assignment) {
        console.log('No active assignment found for conductor:', conductorId);
        return null;
      }

      console.log({ assignment });

      // Format the data to match our types
      const formattedAssignment: ConductorAssignment = {
        id: assignment.id,
        conductor_id: assignment.conductor_id,
        route_id: assignment.route_id,
        bus_id: assignment.bus_id,
        start_date: assignment.start_date,
        end_date: assignment.end_date,
        status: assignment.status,
        route: assignment.route
          ? {
              id: assignment.route.id,
              name: assignment.route.name,
              start_location: assignment.route.from_location?.city || '',
              end_location: assignment.route.to_location?.city || '',
              stops: [], // Temporarily set to empty array
              status: 'active',
              base_fare: assignment.route.base_fare,
              from_location_latitude: assignment.route.from_location_latitude,
              from_location_longitude: assignment.route.from_location_longitude,
              to_location_latitude: assignment.route.to_location_latitude,
              to_location_longitude: assignment.route.to_location_longitude
            }
          : undefined,
        bus: assignment.bus
          ? {
              id: assignment.bus.id,
              bus_number: assignment.bus.bus_number,
              bus_type: assignment.bus.bus_type,
              capacity: assignment.bus.capacity,
              status: 'active'
            }
          : undefined,
        conductor: assignment.conductor
          ? {
              id: assignment.conductor.id,
              name: assignment.conductor.user?.name || '',
              email: assignment.conductor.user?.email || ''
            }
          : undefined
      };

      console.log('Found active assignment:', formattedAssignment);
      return formattedAssignment;
    } catch (error) {
      console.error('Error in getCurrentAssignment:', error);
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

  async getPassengerCount(assignmentId: string) {
    try {
      // Check if tickets table exists
      const { error: tableCheckError } = await supabase
        .from('tickets')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.log("Tickets table doesn't exist, returning mock data");
        // Return mock data if table doesn't exist
        return Math.floor(Math.random() * 30) + 10;
      }

      console.log({ assignmentId });
      // Get count of tickets issued for this assignment
      const { count, error } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('assignment_id', assignmentId)
        .eq('status', 'active');

      console.log({ tata: count });
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching passenger count:', error);
      // Return mock data on error
      return Math.floor(Math.random() * 30) + 10;
    }
  },

  async getCurrentLocation(assignmentId: string): Promise<LocationData | null> {
    try {
      // Get the most recent location update for this assignment
      const { data, error } = await supabase
        .from('location_updates')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        latitude: data.latitude,
        longitude: data.longitude,
        heading: data.heading,
        speed: data.speed,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  },

  async clockIn(userId: string, assignmentId: string) {
    try {
      // First get the conductor ID
      const conductorId = await this.getConductorId(userId);
      if (!conductorId) {
        throw new Error('Conductor not found');
      }

      // Generate a UUID for record_id
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

      if (error) {
        console.error('Error clocking in:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in clockIn:', error);
      throw error;
    }
  },

  async clockOut(timeRecordId: string) {
    try {
      const { error } = await supabase
        .from('time_records')
        .update({
          clock_out: new Date().toISOString(),
          status: 'completed'
        })
        .eq('record_id', timeRecordId); // Use record_id instead of id

      if (error) {
        console.error('Error clocking out:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in clockOut:', error);
      throw error;
    }
  },

  async updateLocation({
    conductorId,
    assignmentId,
    latitude,
    longitude,
    heading,
    speed
  }: {
    conductorId: string;
    assignmentId: string;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  }) {
    try {
      // Get the conductor record first to ensure it exists
      const { data: conductor, error: conductorError } = await supabase
        .from('conductors')
        .select('id')
        .eq('id', conductorId) // Use conductor.id directly since we're passing it
        .single();

      if (conductorError) throw conductorError;
      if (!conductor) throw new Error('Conductor not found');

      const { error } = await supabase.from('location_updates').upsert({
        conductor_id: conductorId,
        assignment_id: assignmentId,
        latitude,
        longitude,
        heading,
        speed,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  async getActiveTimeRecord(conductorId: string) {
    try {
      console.log('Fetching active time record for conductor:', conductorId);
      const { data, error } = await supabase
        .from('time_records')
        .select('*')
        .eq('conductor_id', conductorId)
        .eq('status', 'active')
        .order('clock_in', { ascending: false })
        .limit(1);

      if (error) throw error;

      // Return null if no records found
      if (!data || data.length === 0) {
        console.log('No active time records found');
        return null;
      }

      console.log('Found active time record:', data[0].id);
      return data[0];
    } catch (error) {
      console.error('Error fetching active time record:', error);
      throw error;
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

  async getConductorId(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('conductors')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching conductor:', error);
        throw error;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error in getConductorId:', error);
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

  async issueTicket(data: {
    conductorId: string;
    assignmentId: string;
    fromLocation: string;
    toLocation: string;
    ticketType: 'regular' | 'student' | 'senior';
    fare: number;
    paymentMethod: 'cash' | 'card';
    passengerName: string;
    seatNumber?: string;
    passengerId?: string;
  }) {
    try {
      // First get the conductor ID
      const conductorId = await this.getConductorId(data.conductorId);
      if (!conductorId) {
        throw new Error('Conductor not found');
      }

      // Generate QR code data
      const qrData = {
        ticket_type: data.ticketType,
        from: data.fromLocation,
        to: data.toLocation,
        timestamp: new Date().toISOString()
      };

      // Create the ticket
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          conductor_id: conductorId,
          assignment_id: data.assignmentId,
          passenger_name: data.passengerName,
          passenger_id: data.passengerId,
          passenger_type: data.ticketType,
          seat_number: data.seatNumber,
          from_location: data.fromLocation,
          to_location: data.toLocation,
          amount: data.fare,
          payment_method: data.paymentMethod,
          payment_status: 'paid',
          status: 'active',
          qr_code: JSON.stringify(qrData)
        })
        .select()
        .single();

      if (error) throw error;

      // Record the activity
      await supabase.from('conductor_activities').insert({
        type: 'ticket_issued',
        conductor_id: conductorId,
        assignment_id: data.assignmentId,
        ticket_id: ticket.id,
        details: {
          ticket_type: data.ticketType,
          amount: data.fare,
          payment_method: data.paymentMethod,
          passenger_name: data.passengerName,
          seat_number: data.seatNumber
        }
      });

      return ticket;
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

  async getTicketDetails(ticketId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(
          `
          *,
          conductor:conductor_id(
            id,
            user:user_id(name)
          ),
          assignment:assignment_id(
            id,
            route:route_id(
              name,
              from_location,
              to_location
            ),
            bus:bus_id(
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

  async getRouteDetails(assignmentId: string) {
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

      // Get current location
      const currentLocation = await this.getCurrentLocation(assignmentId);

      // Transform the data into the required format
      return {
        id: assignment.route.id,
        name: assignment.route.name,
        start_location: assignment.route.from_location.city,
        end_location: assignment.route.to_location.city,
        status: 'active',
        base_fare: assignment.route.base_fare,
        from_location_latitude: assignment.route.from_location.latitude,
        from_location_longitude: assignment.route.from_location.longitude,
        to_location_latitude: assignment.route.to_location.latitude,
        to_location_longitude: assignment.route.to_location.longitude,
        currentLocation: currentLocation
          ? {
              coordinates: [
                currentLocation.latitude,
                currentLocation.longitude
              ] as [number, number],
              heading: currentLocation.heading,
              speed: currentLocation.speed
            }
          : undefined
      };
    } catch (error) {
      console.error('Error getting route details:', error);
      throw error;
    }
  }
};
