import { supabase } from "@/lib/supabase/client"

export interface TimeRecord {
  id: string
  record_id: string
  conductor_id: string
  assignment_id: string
  clock_in: string
  clock_out: string | null
  total_hours: number | null
  status: "active" | "completed"
  created_at: string
  updated_at: string
}

export const timeRecordService = {
  async getTimeRecords() {
    const { data, error } = await supabase
      .from("time_records")
      .select(`
        *,
        conductor:conductor_id (
          *,
          user:user_id (
            name,
            email
          )
        ),
        assignment:assignment_id (*)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Transform the data to include conductor name
    return data.map((record) => ({
      ...record,
      conductor: {
        ...record.conductor,
        name: record.conductor?.user?.name || "Unknown",
      },
    }))
  },

  async getTimeRecordById(id: string) {
    const { data, error } = await supabase
      .from("time_records")
      .select(`
        *,
        conductor:conductor_id (
          *,
          user:user_id (
            name,
            email
          )
        ),
        assignment:assignment_id (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    // Transform the data to include conductor name
    return {
      ...data,
      conductor: {
        ...data.conductor,
        name: data.conductor?.user?.name || "Unknown",
      },
    }
  },

  async createTimeRecord(timeRecord: Omit<TimeRecord, "id" | "created_at" | "updated_at">) {
    // Generate a record ID
    const recordId = `TR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`

    const newRecord = {
      ...timeRecord,
      record_id: recordId,
    }

    const { data, error } = await supabase
      .from("time_records")
      .insert([newRecord])
      .select(`
        *,
        conductor:conductor_id (
          *,
          user:user_id (
            name,
            email
          )
        ),
        assignment:assignment_id (*)
      `)
      .single()

    if (error) throw error

    // Transform the data to include conductor name
    return {
      ...data,
      conductor: {
        ...data.conductor,
        name: data.conductor?.user?.name || "Unknown",
      },
    }
  },

  async updateTimeRecord(id: string, updates: Partial<TimeRecord>) {
    // If clock_out is provided, calculate total_hours
    if (updates.clock_out && !updates.total_hours) {
      // Get the current record to get the clock_in time
      const { data: currentRecord } = await supabase.from("time_records").select("clock_in").eq("id", id).single()

      if (currentRecord) {
        const clockIn = new Date(currentRecord.clock_in).getTime()
        const clockOut = new Date(updates.clock_out).getTime()
        const totalHours = (clockOut - clockIn) / (1000 * 60 * 60)

        updates.total_hours = totalHours

        // If clock_out is provided, set status to completed
        updates.status = "completed"
      }
    }

    const { data, error } = await supabase
      .from("time_records")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        conductor:conductor_id (
          *,
          user:user_id (
            name,
            email
          )
        ),
        assignment:assignment_id (*)
      `)
      .single()

    if (error) throw error

    // Transform the data to include conductor name
    return {
      ...data,
      conductor: {
        ...data.conductor,
        name: data.conductor?.user?.name || "Unknown",
      },
    }
  },

  async deleteTimeRecord(id: string) {
    const { error } = await supabase.from("time_records").delete().eq("id", id)

    if (error) throw error
    return true
  },

  async getTimeRecordsByDate(date: string) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from("time_records")
      .select(`
        *,
        conductor:conductor_id (
          *,
          user:user_id (
            name,
            email
          )
        ),
        assignment:assignment_id (*)
      `)
      .gte("clock_in", startOfDay.toISOString())
      .lte("clock_in", endOfDay.toISOString())

    if (error) throw error

    // Transform the data to include conductor name
    return data.map((record) => ({
      ...record,
      conductor: {
        ...record.conductor,
        name: record.conductor?.user?.name || "Unknown",
      },
    }))
  },

  async getTimeRecordsByConductor(conductorId: string) {
    const { data, error } = await supabase
      .from("time_records")
      .select(`
        *,
        conductor:conductor_id (
          *,
          user:user_id (
            name,
            email
          )
        ),
        assignment:assignment_id (*)
      `)
      .eq("conductor_id", conductorId)
      .order("clock_in", { ascending: false })

    if (error) throw error

    // Transform the data to include conductor name
    return data.map((record) => ({
      ...record,
      conductor: {
        ...record.conductor,
        name: record.conductor?.user?.name || "Unknown",
      },
    }))
  },

  async getActiveTimeRecords() {
    const { data, error } = await supabase
      .from("time_records")
      .select(`
        *,
        conductor:conductor_id (
          *,
          user:user_id (
            name,
            email
          )
        ),
        assignment:assignment_id (*)
      `)
      .eq("status", "active")
      .order("clock_in", { ascending: false })

    if (error) throw error

    // Transform the data to include conductor name
    return data.map((record) => ({
      ...record,
      conductor: {
        ...record.conductor,
        name: record.conductor?.user?.name || "Unknown",
      },
    }))
  },

  async clockIn(conductorId: string, assignmentId: string) {
    return this.createTimeRecord({
      conductor_id: conductorId,
      assignment_id: assignmentId,
      clock_in: new Date().toISOString(),
      status: "active",
    })
  },

  async clockOut(recordId: string) {
    const clockOut = new Date().toISOString()
    return this.updateTimeRecord(recordId, {
      clock_out: clockOut,
      status: "completed",
    })
  },
}

