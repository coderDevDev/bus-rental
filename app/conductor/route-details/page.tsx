"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, MapPin, Users, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { conductorDashboardService } from "@/services/conductor-dashboard-service"
import { RouteMap } from "@/components/conductor/route-map"

export default function RouteDetails() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentAssignment, setCurrentAssignment] = useState<any>(null)
  const [routeDetails, setRouteDetails] = useState<any>(null)
  const [busDetails, setBusDetails] = useState<any>(null)
  const [passengerCount, setPassengerCount] = useState<number>(0)
  const [currentLocation, setCurrentLocation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        if (!user) return

        // Get current assignment
        const assignment = await conductorDashboardService.getCurrentAssignment(user.id)
        setCurrentAssignment(assignment)

        if (assignment) {
          // Get route details
          const route = await conductorDashboardService.getRouteDetails(assignment.route_id)
          setRouteDetails(route)

          // Get bus details
          const bus = await conductorDashboardService.getBusDetails(assignment.bus_id)
          setBusDetails(bus)

          // Get passenger count
          const count = await conductorDashboardService.getPassengerCount(assignment.id)
          setPassengerCount(count)

          // Get current location
          const location = await conductorDashboardService.getCurrentLocation()
          setCurrentLocation(location)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load route details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Set up interval to update current location
    const locationInterval = setInterval(async () => {
      if (currentAssignment) {
        try {
          const location = await conductorDashboardService.getCurrentLocation()
          setCurrentLocation(location)
        } catch (error) {
          console.error("Error updating location:", error)
        }
      }
    }, 10000) // Update every 10 seconds

    return () => {
      clearInterval(locationInterval)
    }
  }, [user, toast])

  // Mock data for route map
  const mapData = routeDetails
    ? {
        startLocation: {
          name: routeDetails.start_location,
          coordinates: [-74.006, 40.7128], // New York
        },
        endLocation: {
          name: routeDetails.end_location,
          coordinates: [-71.0589, 42.3601], // Boston
        },
        stops: [
          {
            name: "Hartford",
            coordinates: [-72.6823, 41.7658],
            isCurrent: true,
          },
          {
            name: "Worcester",
            coordinates: [-71.8023, 42.2626],
          },
        ],
        currentLocation: currentLocation
          ? {
              coordinates: [currentLocation.longitude, currentLocation.latitude],
              heading: currentLocation.heading,
            }
          : undefined,
      }
    : null

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading route details...</p>
        </div>
      </div>
    )
  }

  if (!currentAssignment || !routeDetails) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
          <div className="container flex items-center h-14 px-4">
            <Button variant="ghost" size="icon" asChild className="text-white">
              <Link href="/conductor">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Route Details</h1>
          </div>
        </header>

        <main className="flex-1 container p-4 flex items-center justify-center">
          <Card className="w-full max-w-md border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800">No Active Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700">
                You don't have an active route assignment. Please contact your administrator.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/conductor">Back to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" asChild className="text-white">
            <Link href="/conductor">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Route Details</h1>
        </div>
      </header>

      <main className="flex-1 container p-4">
        <Card className="mb-4 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-maroon-700">{routeDetails.name}</CardTitle>
                <CardDescription>{routeDetails.route_number}</CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Bus Number</p>
                <p className="font-medium">{busDetails?.bus_number || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-medium">{busDetails?.capacity || 45} seats</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Load</p>
                <p className="font-medium">{passengerCount} passengers</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">On Schedule</p>
              </div>
            </div>

            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center mb-4">
              {mapData && (
                <RouteMap
                  startLocation={mapData.startLocation}
                  endLocation={mapData.endLocation}
                  stops={mapData.stops}
                  currentLocation={mapData.currentLocation}
                  className="h-full w-full"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-maroon-50">
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-maroon-100 data-[state=active]:text-maroon-800"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="passengers"
              className="data-[state=active]:bg-maroon-100 data-[state=active]:text-maroon-800"
            >
              Passengers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-maroon-700">Route Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {[
                      { time: "6:00 AM", location: "New York Central", status: "completed" },
                      { time: "8:30 AM", location: "Hartford Terminal", status: "current" },
                      { time: "10:45 AM", location: "Worcester Station", status: "upcoming" },
                      { time: "12:00 PM", location: "Boston South Station", status: "upcoming" },
                    ].map((stop, index) => (
                      <div key={index} className="relative flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              stop.status === "completed"
                                ? "bg-maroon-700"
                                : stop.status === "current"
                                  ? "bg-green-500"
                                  : "bg-muted"
                            }`}
                          />
                          {index < 3 && (
                            <div
                              className={`w-0.5 h-full ${stop.status === "completed" ? "bg-maroon-700" : "bg-muted"}`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-maroon-800">{stop.location}</p>
                              <p className="text-sm text-muted-foreground">{stop.time}</p>
                            </div>
                            {stop.status === "current" && (
                              <Badge className="bg-maroon-700 text-white">Current Stop</Badge>
                            )}
                            {stop.status === "completed" && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="passengers">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-maroon-700">Current Passengers</CardTitle>
                  <Badge variant="outline" className="gap-1 bg-maroon-50 text-maroon-800 border-maroon-200">
                    <Users className="h-4 w-4" />
                    {passengerCount}/{busDetails?.capacity || 45}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {Array.from({ length: passengerCount }).map((_, index) => (
                      <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-maroon-800">Passenger #{1001 + index}</p>
                              <p className="text-sm text-muted-foreground">
                                {index % 3 === 0 ? "Regular" : index % 3 === 1 ? "Student" : "Senior"}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>Hartford to Boston</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-maroon-50 text-maroon-800 border-maroon-200">
                              Seat {index + 1}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

