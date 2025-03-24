"use server"

import { busService } from "@/services/bus-service"
import { maintenanceService } from "@/services/maintenance-service"
import { assignmentService } from "@/services/assignment-service"
import type { Bus, Maintenance } from "@/types"

export async function getBuses() {
  try {
    return await busService.getAllBuses()
  } catch (error) {
    console.error("Error fetching buses:", error)
    throw new Error("Failed to fetch buses")
  }
}

export async function getBusDetails(id: string) {
  try {
    const [bus, maintenance, assignments] = await Promise.all([
      busService.getBusById(id),
      maintenanceService.getMaintenanceByBus(id),
      assignmentService.getAssignmentsByBus(id),
    ])

    return {
      bus,
      maintenance,
      assignments,
    }
  } catch (error) {
    console.error("Error fetching bus details:", error)
    throw new Error("Failed to fetch bus details")
  }
}

export async function createBus(busData: Omit<Bus, "id" | "created_at" | "updated_at">) {
  try {
    return await busService.createBus(busData)
  } catch (error) {
    console.error("Error creating bus:", error)
    throw new Error("Failed to create bus")
  }
}

export async function updateBus(id: string, updates: Partial<Bus>) {
  try {
    return await busService.updateBus(id, updates)
  } catch (error) {
    console.error("Error updating bus:", error)
    throw new Error("Failed to update bus")
  }
}

export async function scheduleMaintenance(
  busId: string,
  maintenanceData: Omit<Maintenance, "id" | "created_at" | "updated_at">,
) {
  try {
    const [maintenance, updatedBus] = await Promise.all([
      maintenanceService.createMaintenance(maintenanceData),
      busService.scheduleMaintenance(busId, maintenanceData.scheduled_date),
    ])

    return {
      maintenance,
      bus: updatedBus,
    }
  } catch (error) {
    console.error("Error scheduling maintenance:", error)
    throw new Error("Failed to schedule maintenance")
  }
}

export async function assignBus(
  busId: string,
  conductorId: string,
  routeId: string,
  startDate: string,
  endDate: string,
) {
  try {
    const [assignment, updatedBus] = await Promise.all([
      assignmentService.createAssignment({
        bus_id: busId,
        conductor_id: conductorId,
        route_id: routeId,
        start_date: startDate,
        end_date: endDate,
        status: "active",
      }),
      busService.updateBus(busId, {
        current_conductor_id: conductorId,
        current_route_id: routeId,
      }),
    ])

    return {
      assignment,
      bus: updatedBus,
    }
  } catch (error) {
    console.error("Error assigning bus:", error)
    throw new Error("Failed to assign bus")
  }
}

