"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { assignmentService } from "@/services/assignment-service"
import { conductorService } from "@/services/conductor-service"
import { busService } from "@/services/bus-service"
import { routeService } from "@/services/route-service"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function AddAssignmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [conductors, setConductors] = useState<any[]>([])
  const [buses, setBuses] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [formData, setFormData] = useState({
    conductor_id: "",
    bus_id: "",
    route_id: "",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    status: "active",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [conductorsData, busesData, routesData] = await Promise.all([
          conductorService.getActiveConductors(),
          busService.getActiveBuses(),
          routeService.getActiveRoutes(),
        ])
        setConductors(conductorsData)
        setBuses(busesData)
        setRoutes(routesData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateTimeChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: new Date(value).toISOString(),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.conductor_id || !formData.bus_id || !formData.route_id) {
      toast({
        title: "Validation Error",
        description: "Please select a conductor, bus, and route before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      await assignmentService.createAssignment(formData)
      toast({
        title: "Success",
        description: "Assignment created successfully",
      })
      router.push("/admin/assignments")
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Create Assignment" backHref="/admin/assignments">
        <CardHeader>
          <CardTitle className="text-maroon-700 text-2xl">
            <Skeleton className="h-8 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Create Assignment" backHref="/admin/assignments">
      <CardHeader>
        <CardTitle className="text-maroon-700 text-2xl">Create New Assignment</CardTitle>
        <CardDescription>Assign a conductor to a route and bus</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conductor_id">Conductor</Label>
              <Select
                value={formData.conductor_id}
                onValueChange={(value) => handleSelectChange("conductor_id", value)}
                required
              >
                <SelectTrigger
                  id="conductor_id"
                  className={`border-maroon-200 focus-visible:ring-maroon-500 ${!formData.conductor_id ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select a conductor" />
                </SelectTrigger>
                <SelectContent>
                  {conductors.length === 0 ? (
                    <SelectItem value="" disabled>
                      No active conductors available
                    </SelectItem>
                  ) : (
                    conductors.map((conductor) => (
                      <SelectItem key={conductor.id} value={conductor.id}>
                        {conductor.name} ({conductor.conductor_id})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="route_id">Route</Label>
              <Select
                value={formData.route_id}
                onValueChange={(value) => handleSelectChange("route_id", value)}
                required
              >
                <SelectTrigger
                  id="route_id"
                  className={`border-maroon-200 focus-visible:ring-maroon-500 ${!formData.route_id ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.length === 0 ? (
                    <SelectItem value="" disabled>
                      No active routes available
                    </SelectItem>
                  ) : (
                    routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name} ({route.start_location} to {route.end_location})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bus_id">Bus</Label>
              <Select value={formData.bus_id} onValueChange={(value) => handleSelectChange("bus_id", value)} required>
                <SelectTrigger
                  id="bus_id"
                  className={`border-maroon-200 focus-visible:ring-maroon-500 ${!formData.bus_id ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select a bus" />
                </SelectTrigger>
                <SelectContent>
                  {buses.length === 0 ? (
                    <SelectItem value="" disabled>
                      No active buses available
                    </SelectItem>
                  ) : (
                    buses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.bus_number} ({bus.bus_type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Time</Label>
                <input
                  id="start_date"
                  type="datetime-local"
                  className="flex h-10 w-full rounded-md border border-maroon-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={new Date(formData.start_date).toISOString().slice(0, 16)}
                  onChange={(e) => handleDateTimeChange("start_date", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Time</Label>
                <input
                  id="end_date"
                  type="datetime-local"
                  className="flex h-10 w-full rounded-md border border-maroon-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={new Date(formData.end_date).toISOString().slice(0, 16)}
                  onChange={(e) => handleDateTimeChange("end_date", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} required>
                <SelectTrigger id="status" className="border-maroon-200 focus-visible:ring-maroon-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/assignments")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-maroon-700 hover:bg-maroon-800">
              {isSaving ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </AdminLayout>
  )
}

