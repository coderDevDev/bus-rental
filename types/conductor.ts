export interface ConductorAssignment {
  id: string;
  conductor_id: string;
  route_id: string;
  bus_id: string;
  start_date: string;
  end_date: string;
  status: string;
  route?: {
    id: string;
    name: string;
    start_location: string;
    end_location: string;
    stops: any[]; // Define proper type if needed
    status: string;
    base_fare: number;
  };
  bus?: {
    id: string;
    bus_number: string;
    bus_type: string;
    capacity: number;
    status: string;
  };
  conductor?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Route {
  id: string;
  name: string;
  route_number: string;
  start_location: string;
  end_location: string;
  stops: RouteStop[];
  fare: number;
  status: 'active' | 'inactive';
}

export interface RouteStop {
  id: string;
  name: string;
  coordinates: [number, number];
  arrival_time: string;
  departure_time: string;
  sequence: number;
  status: 'completed' | 'current' | 'upcoming';
}

export interface Bus {
  id: string;
  bus_number: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface ConductorStats {
  ticketsIssued: number;
  activeHours: number;
  revenue: number;
  passengerCount: number;
}

export interface ConductorActivity {
  id: string;
  type:
    | 'ticket_issued'
    | 'passenger_boarded'
    | 'passenger_alighted'
    | 'location_updated';
  conductor_id: string;
  assignment_id: string;
  ticket_id?: string;
  passenger_id?: string;
  details: {
    location?: string;
    amount?: number;
    ticket_type?: string;
    passenger_count?: number;
  };
  created_at: string;
}
