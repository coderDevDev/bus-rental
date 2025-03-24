import { type NextRequest, NextResponse } from "next/server"
import { routeService } from "@/services/route-service"

export async function GET(request: NextRequest) {
  try {
    const routes = await routeService.getAllRoutes()
    return NextResponse.json(routes)
  } catch (error) {
    console.error("Error fetching routes:", error)
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const route = await routeService.createRoute(data)
    return NextResponse.json(route)
  } catch (error) {
    console.error("Error creating route:", error)
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 })
  }
}

