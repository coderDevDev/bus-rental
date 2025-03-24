export interface Conductor {
  id: string
  user_id: string
  name: string
  phone: string
  license_number: string
  current_route_id?: string
  current_bus_id?: string
  experience_years: number
  status: string
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  conductor_id: string
  route_id: string
  bus_id: string
  start_date: string
  end_date: string
  status: "active" | "assigned" | "completed" | "cancelled"
  created_at: string
  updated_at: string
  route?: Route
  bus?: Bus
}

export interface TimeRecord {
  id: string
  conductor_id: string
  assignment_id: string
  clock_in: string
  clock_out?: string
  total_hours?: number
  status: "active" | "completed"
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  conductor_id: string
  assignment_id: string
  route_id: string
  from_location: string
  to_location: string
  ticket_type: string
  fare_amount: number
  payment_method: string
  status: "issued" | "cancelled" | "completed"
  issued_at: string
  created_at: string
  updated_at: string
}

export interface Route {
  id: string
  name: string
  start_location: string
  end_location: string
  distance: number
  estimated_duration: number
  status: string
  created_at: string
  updated_at: string
}

export interface Bus {
  id: string
  bus_number: string
  capacity: number
  status: string
  current_route_id?: string
  last_maintenance?: string
  next_maintenance?: string
  created_at: string
  updated_at: string
}

