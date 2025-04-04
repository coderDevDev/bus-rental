export interface ConductorAssignment {
  id: string;
  bus_id: string;
  conductor_id: string;
  route_id: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  route: Route;
  bus: {
    id: string;
    status: string;
    bus_type: string;
    capacity: number;
    bus_number: string;
  };
}

export interface Route {
  id: string;
  name: string;
  route_number: string;
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
  base_fare: number;
  status: string;
}

export interface Location {
  id: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface Bus {
  id: string;
  bus_number: string;
  bus_type: 'standard' | 'luxury' | 'express';
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface LocationUpdate {
  conductor_id: string;
  assignment_id: string;
  latitude: number;
  longitude: number;
  heading?: number;
  updated_at: string;
}

export interface ConductorActivity {
  id: string;
  type: 'clock_in' | 'clock_out' | 'ticket_issued' | 'location_update';
  conductor_id: string;
  assignment_id: string;
  ticket_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  updated_at: string;
}

export interface ConductorStats {
  ticketsIssued: number;
  activeHours: number;
  revenue: number;
  passengerCount: number;
}

export interface RouteStop {
  id: string;
  location: Location;
  sequence: number;
}

export interface TicketBreakdownResponse {
  passenger_type: string;
  count: number;
}

export interface TicketBreakdown {
  regular: number;
  student: number;
  senior: number;
}
