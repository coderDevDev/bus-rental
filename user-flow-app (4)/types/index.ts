export type Role = "passenger" | "conductor" | "admin"

export interface User {
  id: string
  email: string
  role: Role
  name: string
  created_at: string
  updated_at: string
}

export interface Conductor extends User {
  conductor_id: string
  license_number: string
  phone: string
  status: "active" | "inactive" | "on_leave"
  current_route_id: string | null
  current_bus_id: string | null
  experience_years: number
}

export interface Bus {
  id: string
  bus_number: string
  capacity: number
  status: "active" | "maintenance" | "inactive"
  current_route_id: string | null
  current_conductor_id: string | null
  last_maintenance: string
  next_maintenance: string
  mileage: number
  bus_type: "standard" | "luxury" | "express"
  created_at: string
  updated_at: string
}

export interface Route {
  id: string
  route_number: string
  name: string
  start_location: string
  end_location: string
  status: "active" | "inactive"
  assigned_buses: string[]
  distance: number
  estimated_duration: number
  fare: number
  schedule: RouteSchedule[]
  created_at: string
  updated_at: string
}

export interface RouteSchedule {
  id: string
  route_id: string
  departure_time: string
  arrival_time: string
  days_of_week: string[]
  bus_id: string
  conductor_id: string
}

export interface Maintenance {
  id: string
  bus_id: string
  type: "routine" | "repair" | "major"
  status: "scheduled" | "in_progress" | "completed"
  scheduled_date: string
  completion_date: string | null
  notes: string
  created_at: string
  updated_at: string
}

export interface Assignment {
  id: string
  bus_id: string
  conductor_id: string
  route_id: string
  start_date: string
  end_date: string
  status: "active" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

