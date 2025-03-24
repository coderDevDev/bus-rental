"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Bus, MapPin, QrCode, TicketIcon, Users, Clock, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { conductorDashboardService } from "@/services/conductor-dashboard-service"
import { RouteMap } from "@/components/conductor/route-map"
import { StatCard } from "@/components/admin/stat-card"

export default function ConductorDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [currentAssignment, setCurrentAssignment] = useState<any>(null)
  const [routeDetails, setRouteDetails] = useState<any>(null)
  const [busDetails, setBusDetails] = useState<any>(null)
  const [passengerCount, setPassengerCount] = useState<number>(0)
  const [todayStats, setTodayStats] = useState<any>({
    ticketsIssued: 0,
    activeHours: 0,
    revenue: 0,
  })
  const [currentLocation, setCurrentLocation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTimeRecord, setActiveTimeRecord] = useState<any>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState(0)

  // Memoize the loadDashboardData function to prevent it from being recreated on every render
  const loadDashboardData = useCallback(async () => {
    try {
      // Prevent rapid re-renders by checking time since last update
      const now = Date.now()
      if (now - lastUpdateTime < 5000) {
        console.log("Skipping update, too soon since last update")
        return
      }

      setLastUpdateTime(now)
      setIsLoading(true)

      if (!user) {
        console.log("No user found, skipping data load")
        return
      }

      // Get the conductor ID from the user
      const conductorId = user.id
      console.log("Loading data for conductor ID:", conductorId)

      // Get current assignment
      const assignment = await conductorDashboardService.getCurrentAssignment(conductorId)
      console.log("Assignment result:", assignment ? "Found" : "Not found")
      setCurrentAssignment(assignment)

      if (assignment) {
        // Get route details if not already included
        if (!assignment.route) {
          console.log("Fetching route details for route ID:", assignment.route_id)
          const route = await conductorDashboardService.getRouteDetails(assignment.route_id)
          setRouteDetails(route)
        } else {
          console.log("Using route details from assignment")
          setRouteDetails(assignment.route)
        }

        // Get bus details if not already included
        if (!assignment.bus) {
          console.log("Fetching bus details for bus ID:", assignment.bus_id)
          const bus = await conductorDashboardService.getBusDetails(assignment.bus_id)
          setBusDetails(bus)
        } else {
          console.log("Using bus details from assignment")
          setBusDetails(assignment.bus)
        }

        // Get passenger count
        const count = await conductorDashboardService.getPassengerCount(assignment.id)
        setPassengerCount(count)

        // Get current location
        const location = await conductorDashboardService.getCurrentLocation()
        setCurrentLocation(location)
      } else {
        console.log("No active assignment found for conductor")
      }

      // Get today's stats
      const stats = await conductorDashboardService.getTodayStats(conductorId)
      setTodayStats(stats)

      // Get active time record
      const timeRecord = await conductorDashboardService.getActiveTimeRecord(conductorId)
      setActiveTimeRecord(timeRecord)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, toast, lastUpdateTime])

  // Main data loading effect
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        if (!user) {
          console.log("No user found, skipping data load")
          return
        }

        // Get the conductor ID from the user
        // In a real app, you might need to get the conductor ID differently
        const conductorId = user.id
        console.log("Loading data for conductor ID:", conductorId)

        // Get current assignment
        const assignment = await conductorDashboardService.getCurrentAssignment(conductorId)
        console.log("Assignment result:", assignment ? "Found" : "Not found")
        setCurrentAssignment(assignment)

        if (assignment) {
          // Get route details if not already included
          if (!assignment.route) {
            console.log("Fetching route details for route ID:", assignment.route_id)
            const route = await conductorDashboardService.getRouteDetails(assignment.route_id)
            setRouteDetails(route)
          } else {
            console.log("Using route details from assignment")
            setRouteDetails(assignment.route)
          }

          // Get bus details if not already included
          if (!assignment.bus) {
            console.log("Fetching bus details for bus ID:", assignment.bus_id)
            const bus = await conductorDashboardService.getBusDetails(assignment.bus_id)
            setBusDetails(bus)
          } else {
            console.log("Using bus details from assignment")
            setBusDetails(assignment.bus)
          }

          // Get passenger count
          const count = await conductorDashboardService.getPassengerCount(assignment.id)
          setPassengerCount(count)

          // Get current location
          const location = await conductorDashboardService.getCurrentLocation()
          setCurrentLocation(location)
        } else {
          console.log("No active assignment found for conductor")
        }

        // Get today's stats
        const stats = await conductorDashboardService.getTodayStats(conductorId)
        setTodayStats(stats)

        // Get active time record
        const timeRecord = await conductorDashboardService.getActiveTimeRecord(conductorId)
        setActiveTimeRecord(timeRecord)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()

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
    }, 60000) // Update every 60 seconds

    return () => {
      clearInterval(locationInterval)
    }
  }, [])

  const handleClockIn = async () => {
    if (!user || !currentAssignment) return

    try {
      const timeRecord = await conductorDashboardService.clockIn(user.id, currentAssignment.id)
      setActiveTimeRecord(timeRecord)
      toast({
        title: "Success",
        description: "You have successfully clocked in.",
      })
    } catch (error) {
      console.error("Error clocking in:", error)
      toast({
        title: "Error",
        description: "Failed to clock in. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleClockOut = async () => {
    if (!activeTimeRecord) return

    try {
      await conductorDashboardService.clockOut(activeTimeRecord.id)
      setActiveTimeRecord(null)
      toast({
        title: "Success",
        description: "You have successfully clocked out.",
      })
    } catch (error) {
      console.error("Error clocking out:", error)
      toast({
        title: "Error",
        description: "Failed to clock out. Please try again.",
        variant: "destructive",
      })
    }
  }

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
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <h1 className="font-bold text-lg">BusGo Conductor</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="text-white">
              <Link href="/conductor/notifications">
                <Bell className="h-5 w-5" />
                <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-white text-maroon-700">
                  2
                </Badge>
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="text-white">
              <Link href="/conductor/profile">
                <Avatar className="h-8 w-8 border border-white/30">
                  <AvatarImage src="/placeholder.svg" alt="Conductor" />
                  <AvatarFallback>{user?.user_metadata?.name?.[0] || "C"}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container p-4">
        {!currentAssignment ? (
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-800">No Active Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700">
                You don't have an active route assignment. Please contact your administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Clock In/Out Card */}
            <Card className="mb-4 border-maroon-200 bg-maroon-50/50">
              <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-medium text-maroon-800">
                    {activeTimeRecord ? "Currently On Duty" : "Start Your Shift"}
                  </h3>
                  <p className="text-sm text-maroon-600">
                    {activeTimeRecord
                      ? `Clocked in at ${new Date(activeTimeRecord.clock_in).toLocaleTimeString()}`
                      : "You need to clock in to start your shift"}
                  </p>
                </div>
                <Button
                  variant={activeTimeRecord ? "outline" : "default"}
                  className={
                    activeTimeRecord
                      ? "border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                      : "bg-maroon-700 hover:bg-maroon-800"
                  }
                  onClick={activeTimeRecord ? handleClockOut : handleClockIn}
                >
                  {activeTimeRecord ? "Clock Out" : "Clock In"}
                </Button>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <StatCard
                title="Tickets Issued"
                value={todayStats.ticketsIssued}
                icon={TicketIcon}
                description="Today's total"
                iconClassName="bg-maroon-100"
              />
              <StatCard
                title="Active Hours"
                value={`${todayStats.activeHours} hrs`}
                icon={Clock}
                description="Today's shift time"
                iconClassName="bg-blue-100"
              />
              <StatCard
                title="Revenue Generated"
                value={`₱${todayStats.revenue.toLocaleString()}`}
                icon={DollarSign}
                description="Today's total"
                iconClassName="bg-green-100"
              />
            </div>
          </>
        )}

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsContent value="overview" className="space-y-4">
            {currentAssignment && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-maroon-700">Current Route Assignment</CardTitle>
                  <CardDescription>
                    {routeDetails?.name || "Route"}: {routeDetails?.start_location || ""} -{" "}
                    {routeDetails?.end_location || ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Bus Number</p>
                      <p className="font-medium">{busDetails?.bus_number || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Shift</p>
                      <p className="font-medium">
                        {new Date(currentAssignment.start_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -
                        {new Date(currentAssignment.end_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Current Status</p>
                      <Badge variant="outline" className="bg-green-500 text-white border-0">
                        Active
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Passengers</p>
                      <p className="font-medium">
                        {passengerCount}/{busDetails?.capacity || 45}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Current Location</span>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Tracking Active
                      </Badge>
                    </div>

                    {mapData && (
                      <RouteMap
                        startLocation={mapData.startLocation}
                        endLocation={mapData.endLocation}
                        stops={mapData.stops}
                        currentLocation={mapData.currentLocation}
                        className="h-[300px] w-full"
                      />
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button className="flex-1 bg-maroon-700 hover:bg-maroon-800" asChild>
                    <Link href="/conductor/issue-ticket">Issue Ticket</Link>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/conductor/route-details">View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            )}

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-maroon-700">Today&apos;s Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center">
                      <TicketIcon className="h-8 w-8 text-maroon-600 mb-2" />
                      <p className="text-2xl font-bold text-maroon-800">{todayStats.ticketsIssued}</p>
                      <p className="text-sm text-muted-foreground">Tickets Issued</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center">
                      <Users className="h-8 w-8 text-maroon-600 mb-2" />
                      <p className="text-2xl font-bold text-maroon-800">{passengerCount}</p>
                      <p className="text-sm text-muted-foreground">Current Passengers</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-maroon-700">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="flex items-start gap-4 pb-4 border-b last:border-0">
                        <div className="w-8 h-8 rounded-full bg-maroon-100 flex items-center justify-center">
                          {item % 2 === 0 ? (
                            <TicketIcon className="h-4 w-4 text-maroon-700" />
                          ) : (
                            <Users className="h-4 w-4 text-maroon-700" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {item % 2 === 0 ? "Ticket Issued" : "Passenger Boarded"}
                          </p>
                          <p className="text-xs text-muted-foreground">{item * 10} minutes ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="p-0">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-maroon-700">Issue Ticket</CardTitle>
                  <Button size="sm" variant="outline" className="gap-2 border-maroon-200 hover:bg-maroon-50">
                    <QrCode className="h-4 w-4 text-maroon-700" />
                    Scan QR
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {[
                    { type: "Regular", price: 25.0 },
                    { type: "Student", price: 20.0 },
                    { type: "Senior Citizen", price: 15.0 },
                  ].map((ticket, index) => (
                    <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-maroon-800">Ticket #{1000 + index}</p>
                            <p className="text-sm text-muted-foreground">{ticket.type}</p>
                          </div>
                          <Badge className="bg-maroon-100 text-maroon-800 border-0">₱{ticket.price.toFixed(2)}</Badge>
                        </div>
                        <Button className="w-full mt-4 bg-maroon-700 hover:bg-maroon-800">
                          Issue {ticket.type} Ticket
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-maroon-700 hover:bg-maroon-800" asChild>
                  <Link href="/conductor/issue-ticket">Issue New Ticket</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="route" className="p-0">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-maroon-700">Route Information</CardTitle>
                <CardDescription>
                  {routeDetails?.name || "Route"}: {routeDetails?.start_location || ""} -{" "}
                  {routeDetails?.end_location || ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Bus Status</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      On Schedule
                    </Badge>
                  </div>

                  {mapData && (
                    <RouteMap
                      startLocation={mapData.startLocation}
                      endLocation={mapData.endLocation}
                      stops={mapData.stops}
                      currentLocation={mapData.currentLocation}
                      className="h-[300px] w-full"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-maroon-700">Stops</h3>
                  {[
                    { name: "New York Central", time: "8:00 AM", status: "completed" },
                    { name: "Hartford Terminal", time: "10:30 AM", status: "current" },
                    { name: "Worcester Station", time: "12:45 PM", status: "upcoming" },
                    { name: "Boston South Station", time: "2:00 PM", status: "upcoming" },
                  ].map((stop, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-maroon-100 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-maroon-700" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-maroon-800">{stop.name}</p>
                        <p className="text-sm text-muted-foreground">Scheduled: {stop.time}</p>
                      </div>
                      {stop.status === "current" && <Badge className="bg-maroon-700 text-white">Current Stop</Badge>}
                      {stop.status === "completed" && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Completed
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsList className="fixed bottom-0 w-full border-t bg-background h-16 grid grid-cols-3 p-0 rounded-none">
            <TabsTrigger
              value="overview"
              className="flex flex-col items-center justify-center data-[state=active]:bg-maroon-100 data-[state=active]:text-maroon-800 rounded-none h-full"
            >
              <Bus className="h-5 w-5" />
              <span className="text-xs">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="flex flex-col items-center justify-center data-[state=active]:bg-maroon-100 data-[state=active]:text-maroon-800 rounded-none h-full"
            >
              <TicketIcon className="h-5 w-5" />
              <span className="text-xs">Tickets</span>
            </TabsTrigger>
            <TabsTrigger
              value="route"
              className="flex flex-col items-center justify-center data-[state=active]:bg-maroon-100 data-[state=active]:text-maroon-800 rounded-none h-full"
            >
              <MapPin className="h-5 w-5" />
              <span className="text-xs">Route</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </main>
    </div>
  )
}

