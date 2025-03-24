import { supabase } from "@/lib/supabase/client"
import { routeService } from "./route-service"
import { busService } from "./bus-service"

let lastLocationUpdate = 0

export const conductorDashboardService = {
  async getCurrentAssignment(conductorId: string) {
    try {
      console.log("Fetching assignment for conductor ID:", conductorId)

      // First, check if the conductor exists
      const { data: conductors, error: conductorError } = await supabase
        .from("conductors")
        .select("*")
        .eq("id", conductorId)

      if (conductorError) throw conductorError

      if (!conductors || conductors.length === 0) {
        console.log("No conductor found with ID:", conductorId)

        // Try to find conductor by user_id instead
        const { data: userConductors, error: userConductorError } = await supabase
          .from("conductors")
          .select("*")
          .eq("user_id", conductorId)

        if (userConductorError) throw userConductorError

        if (!userConductors || userConductors.length === 0) {
          console.log("No conductor found with user_id:", conductorId)
          return null
        }

        console.log("Found conductor by user_id:", userConductors[0].id)
        conductorId = userConductors[0].id
      }

      // Get active assignments for the conductor
      const { data: assignments, error: assignmentError } = await supabase
        .from("assignments")
        .select(`
          *,
          route:route_id (*),
          bus:bus_id (*)
        `)
        .eq("conductor_id", conductorId)
        .in("status", ["active", "assigned"]) // Include both active and assigned status
        .order("start_date", { ascending: true })

      if (assignmentError) throw assignmentError

      console.log("Found assignments:", assignments?.length || 0)

      if (assignments && assignments.length > 0) {
        // Log all assignments for debugging
        assignments.forEach((a, i) => {
          console.log(`Assignment ${i + 1}:`, {
            id: a.id,
            status: a.status,
            start_date: a.start_date,
            end_date: a.end_date,
          })
        })

        // Find the first active or most recent assignment
        const activeAssignment = assignments.find((a) => a.status === "active") || assignments[0]
        console.log("Using assignment:", activeAssignment.id)
        return activeAssignment
      }

      console.log("No active assignments found")
      return null
    } catch (error) {
      console.error("Error fetching current assignment:", error)
      throw error
    }
  },

  async getRouteDetails(routeId: string) {
    try {
      const route = await routeService.getRouteById(routeId)
      return route
    } catch (error) {
      console.error("Error fetching route details:", error)
      throw error
    }
  },

  async getBusDetails(busId: string) {
    try {
      const bus = await busService.getBusById(busId)
      return bus
    } catch (error) {
      console.error("Error fetching bus details:", error)
      throw error
    }
  },

  async getPassengerCount(assignmentId: string) {
    try {
      // Check if tickets table exists
      const { error: tableCheckError } = await supabase.from("tickets").select("id").limit(1)

      if (tableCheckError) {
        console.log("Tickets table doesn't exist, returning mock data")
        // Return mock data if table doesn't exist
        return Math.floor(Math.random() * 30) + 10
      }

      // Get count of tickets issued for this assignment
      const { count, error } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("assignment_id", assignmentId)
        .eq("status", "issued")

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error("Error fetching passenger count:", error)
      // Return mock data on error
      return Math.floor(Math.random() * 30) + 10
    }
  },

  async getTodayStats(conductorId: string) {
    try {
      // Use mock data for tickets and revenue
      const ticketsIssued = Math.floor(Math.random() * 50) + 20
      const revenue = ticketsIssued * 25 // Mock average ticket price of $25

      // Get active hours
      const { data: timeRecords, error: timeError } = await supabase
        .from("time_records")
        .select("clock_in, clock_out, total_hours")
        .eq("conductor_id", conductorId)
        .gte("clock_in", new Date().toISOString().split("T")[0]) // Today's date
        .lt("clock_out", new Date(Date.now() + 86400000).toISOString().split("T")[0]) // Tomorrow's date

      let activeHours = 0

      if (timeError) {
        console.log("Error fetching time records:", timeError)
      } else if (timeRecords && timeRecords.length > 0) {
        // Sum up completed records
        const completedHours = timeRecords
          .filter((record) => record.total_hours)
          .reduce((sum, record) => sum + (record.total_hours || 0), 0)

        // Calculate in-progress records
        const activeRecords = timeRecords.filter((record) => !record.clock_out)
        const nowMs = Date.now()
        const activeRecordsHours = activeRecords.reduce((sum, record) => {
          const startMs = new Date(record.clock_in).getTime()
          return sum + (nowMs - startMs) / (1000 * 60 * 60)
        }, 0)

        activeHours = completedHours + activeRecordsHours
      }

      return {
        ticketsIssued,
        activeHours: Number.parseFloat(activeHours.toFixed(1)),
        revenue,
      }
    } catch (error) {
      console.error("Error fetching today's stats:", error)
      // Return mock data on error
      return {
        ticketsIssued: Math.floor(Math.random() * 50) + 20,
        activeHours: 0,
        revenue: Math.floor(Math.random() * 1000) + 500,
      }
    }
  },

  async getCurrentLocation() {
    // Debounce location updates to prevent excessive re-renders
    const now = Date.now()
    if (now - lastLocationUpdate < 5000) {
      // If less than 5 seconds since last update, return the cached value
      return {
        latitude: 40.7128,
        longitude: -74.006,
        speed: 35, // km/h
        heading: 45, // degrees
        timestamp: new Date().toISOString(),
      }
    }

    lastLocationUpdate = now

    // In a real app, this would fetch the current GPS location
    // For demo purposes, we'll return a fixed location
    return {
      latitude: 40.7128,
      longitude: -74.006,
      speed: 35, // km/h
      heading: 45, // degrees
      timestamp: new Date().toISOString(),
    }
  },

  async clockIn(conductorId: string, assignmentId: string) {
    try {
      const { data, error } = await supabase
        .from("time_records")
        .insert({
          conductor_id: conductorId,
          assignment_id: assignmentId,
          clock_in: new Date().toISOString(),
          status: "active",
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error clocking in:", error)
      throw error
    }
  },

  async clockOut(recordId: string) {
    try {
      const now = new Date()

      // Get the current record to calculate total hours
      const { data: record, error: fetchError } = await supabase
        .from("time_records")
        .select("clock_in")
        .eq("id", recordId)
        .single()

      if (fetchError) throw fetchError

      // Calculate total hours
      const clockIn = new Date(record.clock_in)
      const totalHours = (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60)

      // Update the record
      const { data, error } = await supabase
        .from("time_records")
        .update({
          clock_out: now.toISOString(),
          total_hours: totalHours,
          status: "completed",
        })
        .eq("id", recordId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error clocking out:", error)
      throw error
    }
  },

  async getActiveTimeRecord(conductorId: string) {
    try {
      console.log("Fetching active time record for conductor:", conductorId)
      const { data, error } = await supabase
        .from("time_records")
        .select("*")
        .eq("conductor_id", conductorId)
        .eq("status", "active")
        .order("clock_in", { ascending: false })
        .limit(1)

      if (error) throw error

      // Return null if no records found
      if (!data || data.length === 0) {
        console.log("No active time records found")
        return null
      }

      console.log("Found active time record:", data[0].id)
      return data[0]
    } catch (error) {
      console.error("Error fetching active time record:", error)
      throw error
    }
  },
}

