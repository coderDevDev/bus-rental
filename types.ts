export interface Assignment {
  id: string;
  route_id: string;
  bus_id: string;
  conductor_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'completed' | 'cancelled';
  // other properties...
}
