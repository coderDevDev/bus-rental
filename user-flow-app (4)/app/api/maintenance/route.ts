import { NextResponse } from "next/server"
import { maintenanceService } from "@/services/maintenance-service"

export async function GET() {
  try {
    const maintenance = await maintenanceService.getAllMaintenance()
    return NextResponse.json(maintenance)
  } catch (error) {
    console.error("Error fetching maintenance records:", error)
    return NextResponse.json({ error: "Failed to fetch maintenance records" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const maintenance = await maintenanceService.createMaintenance(body)
    return NextResponse.json(maintenance)
  } catch (error) {
    console.error("Error creating maintenance record:", error)
    return NextResponse.json({ error: "Failed to create maintenance record" }, { status: 500 })
  }
}

