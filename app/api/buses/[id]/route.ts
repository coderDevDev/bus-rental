import { NextResponse } from "next/server"
import { busService } from "@/services/bus-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const bus = await busService.getBusById(params.id)
    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 })
    }
    return NextResponse.json(bus)
  } catch (error) {
    console.error("Error fetching bus:", error)
    return NextResponse.json({ error: "Failed to fetch bus" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const bus = await busService.updateBus(params.id, body)
    return NextResponse.json(bus)
  } catch (error) {
    console.error("Error updating bus:", error)
    return NextResponse.json({ error: "Failed to update bus" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await busService.deleteBus(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting bus:", error)
    return NextResponse.json({ error: "Failed to delete bus" }, { status: 500 })
  }
}

