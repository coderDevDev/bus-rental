export interface Location {
  id: string;
  city: string;
  state: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface RouteStop {
  location: Location;
  stopNumber: number;
  arrivalOffset: number; // Minutes from start of route
}

export interface BusAssignment {
  id: string;
  bus: {
    id: string;
    bus_number: string;
    capacity: number;
    status: string;
  };
  status: string;
}

export interface Route {
  id: string;
  route_number: string;
  name: string;
  stops: RouteStop[] | null;
  distance: number;
  base_fare: number;
  estimated_duration: number;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface RouteWithLocations extends Route {
  from_location?: Location | null;
  to_location?: Location | null;
  fare?: number;
  assignments?: BusAssignment[];
}

export interface BookingData {
  route_id: string;
  assignment_id: string;
  conductor_id: string;
  from_location_id: string;
  to_location_id: string;
  from_location: string;
  to_location: string;
  departure_time: string;
  arrival_time: string;
  passenger_type?: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'ewallet';
  passengers: Array<{
    name: string;
    passenger_type: 'regular' | 'student' | 'senior';
    seat_number: string;
    fare: number;
    status: 'active' | 'cancelled';
  }>;
}
