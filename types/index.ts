export type Role = 'passenger' | 'conductor' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Conductor extends User {
  conductor_id: string;
  license_number: string;
  phone: string;
  status: 'active' | 'inactive' | 'on_leave';
  current_route_id: string | null;
  current_bus_id: string | null;
  experience_years: number;
}

export interface Bus {
  id: string;
  bus_number: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  current_route_id: string | null;
  current_conductor_id: string | null;
  last_maintenance: string;
  next_maintenance: string;
  mileage: number;
  bus_type: 'standard' | 'luxury' | 'express';
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  route_number: string;
  name: string;
  from_location: Location;
  to_location: Location;
  distance: number;
  base_fare: number;
  estimated_duration: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  tickets?: { count: number }[];
  assignments?: Assignment[];
}

export interface RouteWithLocations
  extends Omit<Route, 'from_location' | 'to_location'> {
  from_location: Location;
  to_location: Location;
}

export interface RouteSchedule {
  id: string;
  route_id: string;
  departure_time: string;
  arrival_time: string;
  days_of_week: string[];
  bus_id: string;
  conductor_id: string;
}

export interface Maintenance {
  id: string;
  bus_id: string;
  type: 'routine' | 'repair' | 'major';
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduled_date: string;
  completion_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  route_id: string;
  bus_id: string;
  conductor_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  route?: Route;
  bus?: Bus;
  conductor?: Conductor;
}

export interface Location {
  id: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  route_id: string;
  bus_id: string;
  ticket_number: string;
  travel_date: string;
  seat_number: string;
  fare_amount: number;
  status: 'booked' | 'cancelled' | 'completed';
  created_at: string;
  route?: {
    id: string;
    from_location: { city: string };
    to_location: { city: string };
  };
  bus?: {
    bus_number: string;
    bus_type: string;
  };
}

export interface SignInFormData {
  email: string;
  password: string;
  role: Role;
}

export interface BusTracking {
  id: string;
  bus_id: string;
  route_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: string;
  last_updated: string;
  bus: {
    id: string;
    bus_number: string;
    bus_type: string;
  };
}

export interface PassengerBooking {
  id: string;
  ticket_id: string;
  user_id: string;
  seat_number: number;
  boarding_stop: string;
  dropoff_stop: string;
  status: 'booked' | 'boarded' | 'completed' | 'cancelled';
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  ticket_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'ewallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference_number?: string;
  created_at: string;
}
