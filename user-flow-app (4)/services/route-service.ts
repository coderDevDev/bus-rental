import { supabase } from "@/lib/supabase/client"
import type { Route } from "@/types"

export const routeService = {
  async getAllRoutes() {
    const { data, error } = await supabase.from("routes").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async getRouteById(id: string) {
    const { data, error } = await supabase
      .from("routes")
      .select(`
        *,
        route_schedules (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  async createRoute(route: Omit<Route, "id" | "created_at" | "updated_at">) {
    // Generate a route number if not provided
    if (!route.route_number) {
      route.route_number = `R${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`
    }

    const { data, error } = await supabase.from("routes").insert([route]).select().single()

    if (error) throw error
    return data
  },

  async updateRoute(id: string, updates: Partial<Route>) {
    const { data, error } = await supabase.from("routes").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async deleteRoute(id: string) {
    // First check if there are any conductors assigned to this route
    const { data: conductors, error: conductorError } = await supabase
      .from("conductors")
      .select("id")
      .eq("current_route_id", id)

    if (conductorError) throw conductorError

    // If conductors are assigned, update them to remove the route assignment
    if (conductors && conductors.length > 0) {
      const { error: updateError } = await supabase
        .from("conductors")
        .update({ current_route_id: null })
        .eq("current_route_id", id)

      if (updateError) throw updateError
    }

    // Delete any route schedules
    const { error: scheduleError } = await supabase.from("route_schedules").delete().eq("route_id", id)

    if (scheduleError) throw scheduleError

    // Finally delete the route
    const { error } = await supabase.from("routes").delete().eq("id", id)

    if (error) throw error
    return true
  },

  async getActiveRoutes() {
    const { data, error } = await supabase.from("routes").select("*").eq("status", "active")

    if (error) throw error
    return data
  },

  async addScheduleToRoute(schedule: {
    route_id: string
    departure_time: string
    arrival_time: string
    days_of_week: string[]
    bus_id: string
    conductor_id: string
  }) {
    const { data, error } = await supabase.from("route_schedules").insert([schedule]).select().single()

    if (error) throw error
    return data
  },

  async getRouteSchedules(routeId: string) {
    const { data, error } = await supabase
      .from("route_schedules")
      .select(`
        *,
        bus:bus_id (*),
        conductor:conductor_id (
          *,
          user:user_id (
            name,
            email
          )
        )
      `)
      .eq("route_id", routeId)

    if (error) throw error
    return data
  },

  async assignBusToRoute(routeId: string, busId: string) {
    // First get the current assigned buses
    const { data: route, error: fetchError } = await supabase
      .from("routes")
      .select("assigned_buses")
      .eq("id", routeId)
      .single()

    if (fetchError) throw fetchError

    // Update the assigned_buses array
    const assignedBuses = route.assigned_buses || []
    if (!assignedBuses.includes(busId)) {
      assignedBuses.push(busId)
    }

    // Update the route
    const { data, error } = await supabase
      .from("routes")
      .update({ assigned_buses: assignedBuses })
      .eq("id", routeId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeBusFromRoute(routeId: string, busId: string) {
    // First get the current assigned buses
    const { data: route, error: fetchError } = await supabase
      .from("routes")
      .select("assigned_buses")
      .eq("id", routeId)
      .single()

    if (fetchError) throw fetchError

    // Update the assigned_buses array
    const assignedBuses = (route.assigned_buses || []).filter((id) => id !== busId)

    // Update the route
    const { data, error } = await supabase
      .from("routes")
      .update({ assigned_buses: assignedBuses })
      .eq("id", routeId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

