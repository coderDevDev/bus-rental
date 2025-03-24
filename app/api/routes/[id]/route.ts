import { type NextRequest, NextResponse } from "next/server"
import { routeService } from "@/services/route-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const route = await routeService.getRouteById(params.id)
    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }
    return NextResponse.json(route)
  } catch (error) {
    console.error(`Error fetching route ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch route" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const route = await routeService.updateRoute(params.id, data)
    return NextResponse.json(route)
  } catch (error) {
    console.error(`Error updating route ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await routeService.deleteRoute(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting route ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete route" }, { status: 500 })
  }
}

