import { NextResponse } from "next/server"
import { busService } from "@/services/bus-service"

export async function GET() {
  try {
    const buses = await busService.getAllBuses()
    return NextResponse.json(buses)
  } catch (error) {
    console.error("Error fetching buses:", error)
    return NextResponse.json({ error: "Failed to fetch buses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const bus = await busService.createBus(body)
    return NextResponse.json(bus)
  } catch (error) {
    console.error("Error creating bus:", error)
    return NextResponse.json({ error: "Failed to create bus" }, { status: 500 })
  }
}

