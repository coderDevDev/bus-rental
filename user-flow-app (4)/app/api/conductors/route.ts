import { type NextRequest, NextResponse } from "next/server"
import { conductorService } from "@/services/conductor-service"

export async function GET(request: NextRequest) {
  try {
    const conductors = await conductorService.getAllConductors()
    return NextResponse.json(conductors)
  } catch (error) {
    console.error("Error fetching conductors:", error)
    return NextResponse.json({ error: "Failed to fetch conductors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const conductor = await conductorService.createConductor(data)
    return NextResponse.json(conductor)
  } catch (error) {
    console.error("Error creating conductor:", error)
    return NextResponse.json({ error: "Failed to create conductor" }, { status: 500 })
  }
}

