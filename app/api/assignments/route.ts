import { NextResponse } from "next/server"
import { assignmentService } from "@/services/assignment-service"

export async function GET() {
  try {
    const assignments = await assignmentService.getAllAssignments()
    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const assignment = await assignmentService.createAssignment(body)
    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}

