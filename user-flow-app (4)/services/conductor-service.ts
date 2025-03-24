import { supabase } from "@/lib/supabase/client"
import type { Conductor } from "@/types"

export interface ConductorFormData {
  name: string
  email: string
  license_number: string
  phone: string
  status: "active" | "inactive" | "on_leave"
  experience_years: number
}

export const conductorService = {
  async getAllConductors() {
    // Join the conductors table with the users table to get all conductor information
    const { data, error } = await supabase
      .from("conductors")
      .select(`
        *,
        user:user_id (
          id,
          email,
          name,
          role
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Transform the data to match the expected format
    return data.map((conductor) => ({
      id: conductor.id,
      user_id: conductor.user_id,
      conductor_id: conductor.conductor_id,
      name: conductor.user?.name || "",
      email: conductor.user?.email || "",
      license_number: conductor.license_number,
      phone: conductor.phone,
      status: conductor.status,
      current_route_id: conductor.current_route_id,
      current_bus_id: conductor.current_bus_id,
      experience_years: conductor.experience_years,
      created_at: conductor.created_at,
      updated_at: conductor.updated_at,
    }))
  },

  async getConductor(id: string) {
    const { data, error } = await supabase
      .from("conductors")
      .select(`
        *,
        user:user_id (
          id,
          email,
          name,
          role
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    // Transform the data to match the expected format
    return {
      id: data.id,
      user_id: data.user_id,
      conductor_id: data.conductor_id,
      name: data.user?.name || "",
      email: data.user?.email || "",
      license_number: data.license_number,
      phone: data.phone,
      status: data.status,
      current_route_id: data.current_route_id,
      current_bus_id: data.current_bus_id,
      experience_years: data.experience_years,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },

  async getConductorById(id: string) {
    const { data, error } = await supabase
      .from("conductors")
      .select(`
        *,
        user:user_id (
          id,
          email,
          name,
          role
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    // Transform the data to match the expected format
    return {
      id: data.id,
      user_id: data.user_id,
      conductor_id: data.conductor_id,
      name: data.user?.name || "",
      email: data.user?.email || "",
      license_number: data.license_number,
      phone: data.phone,
      status: data.status,
      current_route_id: data.current_route_id,
      current_bus_id: data.current_bus_id,
      experience_years: data.experience_years,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },

  async createConductor(conductorData: {
    name: string
    email: string
    license_number: string
    phone: string
    status: string
    experience_years: number
    password?: string
  }) {
    // First, create a user record
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: conductorData.email,
      password: conductorData.password || "Password123", // Default password if not provided
      options: {
        data: {
          role: "conductor",
          name: conductorData.name,
        },
      },
    })

    if (userError) throw userError
    if (!userData.user) throw new Error("Failed to create user")

    // Then create a user profile in the users table
    const { error: profileError } = await supabase.from("users").insert({
      id: userData.user.id,
      email: conductorData.email,
      role: "conductor",
      name: conductorData.name,
    })

    if (profileError) throw profileError

    // Generate a conductor ID
    const conductorId = `CON-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`

    // Create the conductor record
    const { data: createdConductorData, error: conductorError } = await supabase
      .from("conductors")
      .insert({
        user_id: userData.user.id,
        conductor_id: conductorId,
        license_number: conductorData.license_number,
        phone: conductorData.phone,
        status: conductorData.status,
        experience_years: conductorData.experience_years,
      })
      .select()
      .single()

    if (conductorError) throw conductorError

    return {
      ...createdConductorData,
      name: conductorData.name,
      email: conductorData.email,
    }
  },

  async updateConductor(id: string, updates: Partial<Conductor> | ConductorFormData) {
    // Get the current conductor record to get the user_id
    const { data: currentConductor, error: fetchError } = await supabase
      .from("conductors")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    // Update the user record if name is provided
    if (updates.name && currentConductor.user_id) {
      const { error: userError } = await supabase
        .from("users")
        .update({ name: updates.name })
        .eq("id", currentConductor.user_id)

      if (userError) throw userError
    }

    // Update the conductor record
    const conductorUpdates = {
      license_number: updates.license_number,
      phone: updates.phone,
      status: updates.status,
      current_route_id: updates.current_route_id,
      current_bus_id: updates.current_bus_id,
      experience_years: updates.experience_years,
    }

    // Remove undefined values
    Object.keys(conductorUpdates).forEach((key) => {
      if (conductorUpdates[key] === undefined) {
        delete conductorUpdates[key]
      }
    })

    const { data, error } = await supabase
      .from("conductors")
      .update(conductorUpdates)
      .eq("id", id)
      .select(`
        *,
        user:user_id (
          id,
          email,
          name,
          role
        )
      `)
      .single()

    if (error) throw error

    // Transform the data to match the expected format
    return {
      id: data.id,
      user_id: data.user_id,
      conductor_id: data.conductor_id,
      name: data.user?.name || "",
      email: data.user?.email || "",
      license_number: data.license_number,
      phone: data.phone,
      status: data.status,
      current_route_id: data.current_route_id,
      current_bus_id: data.current_bus_id,
      experience_years: data.experience_years,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },

  async deleteConductor(id: string) {
    // Get the user_id from the conductor record
    const { data: conductor, error: fetchError } = await supabase
      .from("conductors")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    // Delete the conductor record
    const { error: conductorError } = await supabase.from("conductors").delete().eq("id", id)

    if (conductorError) throw conductorError

    // Delete the user record
    if (conductor.user_id) {
      const { error: userError } = await supabase.from("users").delete().eq("id", conductor.user_id)

      if (userError) throw userError
    }

    return true
  },

  async getActiveConductors() {
    const { data, error } = await supabase
      .from("conductors")
      .select(`
        *,
        user:user_id (
          id,
          email,
          name,
          role
        )
      `)
      .eq("status", "active")

    if (error) throw error

    // Transform the data to match the expected format
    return data.map((conductor) => ({
      id: conductor.id,
      user_id: conductor.user_id,
      conductor_id: conductor.conductor_id,
      name: conductor.user?.name || "",
      email: conductor.user?.email || "",
      license_number: conductor.license_number,
      phone: conductor.phone,
      status: conductor.status,
      current_route_id: conductor.current_route_id,
      current_bus_id: conductor.current_bus_id,
      experience_years: conductor.experience_years,
      created_at: conductor.created_at,
      updated_at: conductor.updated_at,
    }))
  },

  async assignConductorToRoute(conductorId: string, routeId: string) {
    const { data, error } = await supabase
      .from("conductors")
      .update({ current_route_id: routeId })
      .eq("id", conductorId)
      .select(`
        *,
        user:user_id (
          id,
          email,
          name,
          role
        )
      `)
      .single()

    if (error) throw error

    // Transform the data to match the expected format
    return {
      id: data.id,
      user_id: data.user_id,
      conductor_id: data.conductor_id,
      name: data.user?.name || "",
      email: data.user?.email || "",
      license_number: data.license_number,
      phone: data.phone,
      status: data.status,
      current_route_id: data.current_route_id,
      current_bus_id: data.current_bus_id,
      experience_years: data.experience_years,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },

  async updateConductorStatus(conductorId: string, status: Conductor["status"]) {
    const { data, error } = await supabase.from("conductors").update({ status }).eq("id", conductorId).select().single()

    if (error) throw error
    return data
  },
}

