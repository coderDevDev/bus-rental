interface Route {
  id: string;
  name: string;
  route_number: string;
  status: 'active' | 'inactive';
  base_fare: number;
  from_location: Location;
  to_location: Location;
  assignments?: Array<{
    id: string;
    status: string;
    conductor?: {
      id: string;
      status: string;
    };
    bus?: {
      id: string;
      bus_number: string;
      capacity: number;
      status: string;
    };
    tickets?: Array<{
      count: number;
    }>;
  }>;
  created_at: string;
  updated_at: string;
}
