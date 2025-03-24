import { supabase } from "@/lib/supabase/client"
import type { Maintenance } from "@/types"

export const maintenanceService = {
  async getAllMaintenance() {
    const { data, error } = await supabase.from("maintenance").select("*").order("scheduled_date", { ascending: true })

    if (error) throw error
    return data
  },

  async getMaintenanceById(id: string) {
    const { data, error } = await supabase.from("maintenance").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async createMaintenance(maintenance: Omit<Maintenance, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase.from("maintenance").insert([maintenance]).select().single()

    if (error) throw error
    return data
  },

  async updateMaintenance(id: string, updates: Partial<Maintenance>) {
    const { data, error } = await supabase.from("maintenance").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  async deleteMaintenance(id: string) {
    const { error } = await supabase.from("maintenance").delete().eq("id", id)

    if (error) throw error
    return true
  },

  async getMaintenanceByBus(busId: string) {
    const { data, error } = await supabase
      .from("maintenance")
      .select("*")
      .eq("bus_id", busId)
      .order("scheduled_date", { ascending: true })

    if (error) throw error
    return data
  },

  async getUpcomingMaintenance() {
    const { data, error } = await supabase
      .from("maintenance")
      .select("*")
      .eq("status", "scheduled")
      .gte("scheduled_date", new Date().toISOString())
      .order("scheduled_date", { ascending: true })

    if (error) throw error
    return data
  },

  async completeMaintenance(id: string, notes: string) {
    const { data, error } = await supabase
      .from("maintenance")
      .update({
        status: "completed",
        completion_date: new Date().toISOString(),
        notes,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

