export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          name?: string
          updated_at?: string
        }
      }
      conductors: {
        Row: {
          id: string
          user_id: string
          conductor_id: string
          license_number: string
          phone: string
          status: string
          current_route_id: string | null
          current_bus_id: string | null
          experience_years: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          conductor_id: string
          license_number: string
          phone: string
          status?: string
          current_route_id?: string | null
          current_bus_id?: string | null
          experience_years: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          current_route_id?: string | null
          current_bus_id?: string | null
          experience_years?: number
          updated_at?: string
        }
      }
      buses: {
        Row: {
          id: string
          bus_number: string
          capacity: number
          status: string
          current_route_id: string | null
          current_conductor_id: string | null
          last_maintenance: string
          next_maintenance: string
          mileage: number
          bus_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bus_number: string
          capacity: number
          status?: string
          current_route_id?: string | null
          current_conductor_id?: string | null
          last_maintenance: string
          next_maintenance: string
          mileage: number
          bus_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          current_route_id?: string | null
          current_conductor_id?: string | null
          last_maintenance?: string
          next_maintenance?: string
          mileage?: number
          updated_at?: string
        }
      }
      routes: {
        Row: {
          id: string
          route_number: string
          name: string
          start_location: string
          end_location: string
          status: string
          assigned_buses: string[]
          distance: number
          estimated_duration: number
          fare: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          route_number: string
          name: string
          start_location: string
          end_location: string
          status?: string
          assigned_buses?: string[]
          distance?: number
          estimated_duration?: number
          fare?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          assigned_buses?: string[]
          distance?: number
          estimated_duration?: number
          fare?: number
          updated_at?: string
        }
      }
      route_schedules: {
        Row: {
          id: string
          route_id: string
          departure_time: string
          arrival_time: string
          days_of_week: string[]
          bus_id: string
          conductor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          route_id: string
          departure_time: string
          arrival_time: string
          days_of_week: string[]
          bus_id: string
          conductor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          departure_time?: string
          arrival_time?: string
          days_of_week?: string[]
          bus_id?: string
          conductor_id?: string
          updated_at?: string
        }
      }
      maintenance: {
        Row: {
          id: string
          bus_id: string
          type: string
          status: string
          scheduled_date: string
          completion_date: string | null
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bus_id: string
          type: string
          status?: string
          scheduled_date: string
          completion_date?: string | null
          notes: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          completion_date?: string | null
          notes?: string
          updated_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          bus_id: string
          conductor_id: string
          route_id: string
          start_date: string
          end_date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bus_id: string
          conductor_id: string
          route_id: string
          start_date: string
          end_date: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          end_date?: string
          updated_at?: string
        }
      }
    }
  }
}

