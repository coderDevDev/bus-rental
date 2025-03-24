import { supabase } from "@/lib/supabase/client"
import type { Bus } from "@/types"

export const busService = {
  async getAllBuses() {
    const { data, error } = await supabase.from("buses").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async getBusById(id: string) {
    const { data, error } = await supabase
      .from("buses")
      .select(`
        *,
        conductor:current_conductor_id (
          *,
          user:user_id (
            name,
            email
          )
        ),
        route:current_route_id (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  async createBus(bus: Omit<Bus, "id" | "created_at" | "updated_at">) {
    // Generate a bus number if not provided
    if (!bus.bus_number) {
      bus.bus_number = `BUS-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`
    }

    const { data, error } = await supabase.from("buses").insert([bus]).select().single()

    if (error) throw error
    return data
  },

  async updateBus(id: string, updates: Partial<Bus>) {
    const { data, error } = await supabase.from("buses").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async deleteBus(id: string) {
    // First check if there are any conductors assigned to this bus
    const { data: conductors, error: conductorError } = await supabase
      .from("conductors")
      .select("id")
      .eq("current_bus_id", id)

    if (conductorError) throw conductorError

    // If conductors are assigned, update them to remove the bus assignment
    if (conductors && conductors.length > 0) {
      const { error: updateError } = await supabase
        .from("conductors")
        .update({ current_bus_id: null })
        .eq("current_bus_id", id)

      if (updateError) throw updateError
    }

    // Delete any route schedules for this bus
    const { error: scheduleError } = await supabase.from("route_schedules").delete().eq("bus_id", id)

    if (scheduleError) throw scheduleError

    // Finally delete the bus
    const { error } = await supabase.from("buses").delete().eq("id", id)

    if (error) throw error
    return true
  },

  async getActiveBuses() {
    const { data, error } = await supabase.from("buses").select("*").eq("status", "active")

    if (error) throw error
    return data
  },

  async scheduleMaintenance(busId: string, maintenanceDate: string) {
    const { data, error } = await supabase
      .from("buses")
      .update({
        status: "maintenance",
        next_maintenance: maintenanceDate,
      })
      .eq("id", busId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async completeMaintenance(busId: string) {
    const nextMaintenanceDate = new Date()
    nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + 30) // Schedule next maintenance in 30 days

    const { data, error } = await supabase
      .from("buses")
      .update({
        status: "active",
        last_maintenance: new Date().toISOString(),
        next_maintenance: nextMaintenanceDate.toISOString(),
      })
      .eq("id", busId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async assignBusToConductor(busId: string, conductorId: string) {
    const { data, error } = await supabase
      .from("buses")
      .update({ current_conductor_id: conductorId })
      .eq("id", busId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async assignBusToRoute(busId: string, routeId: string) {
    const { data, error } = await supabase
      .from("buses")
      .update({ current_route_id: routeId })
      .eq("id", busId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

