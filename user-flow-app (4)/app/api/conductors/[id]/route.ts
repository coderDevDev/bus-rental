import { type NextRequest, NextResponse } from "next/server"
import { conductorService } from "@/services/conductor-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conductor = await conductorService.getConductorById(params.id)
    if (!conductor) {
      return NextResponse.json({ error: "Conductor not found" }, { status: 404 })
    }
    return NextResponse.json(conductor)
  } catch (error) {
    console.error(`Error fetching conductor ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch conductor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const conductor = await conductorService.updateConductor(params.id, data)
    return NextResponse.json(conductor)
  } catch (error) {
    console.error(`Error updating conductor ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update conductor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await conductorService.deleteConductor(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting conductor ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete conductor" }, { status: 500 })
  }
}

