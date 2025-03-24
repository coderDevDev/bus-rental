"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Bus,
  Calendar,
  Clock,
  MapPin,
  Shield,
  PenToolIcon as Tool,
  User,
  Plus,
  Search,
  Edit,
  Trash2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { busService } from "@/services/bus-service"
import { maintenanceService } from "@/services/maintenance-service"
import type { Bus as BusType } from "@/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function BusManagement() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [buses, setBuses] = useState<BusType[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newBus, setNewBus] = useState({
    bus_number: "",
    capacity: 45,
    bus_type: "standard",
  })
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editBus, setEditBus] = useState<Partial<BusType>>({})

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    try {
      setLoading(true)
      const data = await busService.getAllBuses()
      setBuses(data)
    } catch (error) {
      console.error("Error fetching buses:", error)
      toast({
        title: "Error",
        description: "Failed to fetch buses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBus = async () => {
    try {
      if (!newBus.bus_number) {
        toast({
          title: "Validation Error",
          description: "Bus number is required",
          variant: "destructive",
        })
        return
      }

      const response = await busService.createBus({
        bus_number: newBus.bus_number,
        capacity: newBus.capacity,
        bus_type: newBus.bus_type,
        status: "inactive",
        last_maintenance: new Date().toISOString(),
        next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        mileage: 0,
      })

      setBuses((prev) => [response, ...prev])
      toast({
        title: "Success",
        description: "Bus created successfully",
      })

      // Reset form
      setNewBus({
        bus_number: "",
        capacity: 45,
        bus_type: "standard",
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error creating bus:", error)
      toast({
        title: "Error",
        description: "Failed to create bus. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateBus = async () => {
    if (!selectedBus) return

    try {
      const updatedBus = await busService.updateBus(selectedBus.id, editBus)
      setBuses((prev) => prev.map((bus) => (bus.id === selectedBus.id ? updatedBus : bus)))
      toast({
        title: "Success",
        description: "Bus updated successfully",
      })
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating bus:", error)
      toast({
        title: "Error",
        description: "Failed to update bus. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBus = async () => {
    if (!selectedBus) return

    try {
      await busService.deleteBus(selectedBus.id)
      setBuses((prev) => prev.filter((bus) => bus.id !== selectedBus.id))
      toast({
        title: "Success",
        description: "Bus deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting bus:", error)
      toast({
        title: "Error",
        description: "Failed to delete bus. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedBus(null)
    }
  }

  const handleScheduleMaintenance = async (busId: string, maintenanceDate: string) => {
    try {
      const updates = {
        status: "maintenance" as const,
        next_maintenance: maintenanceDate,
      }
      const updatedBus = await busService.updateBus(busId, updates)

      // Also create a maintenance record
      await maintenanceService.createMaintenance({
        bus_id: busId,
        type: "routine",
        status: "scheduled",
        scheduled_date: maintenanceDate,
        notes: "Scheduled maintenance",
      })

      setBuses((prev) => prev.map((bus) => (bus.id === busId ? updatedBus : bus)))
      toast({
        title: "Success",
        description: "Maintenance scheduled successfully",
      })
    } catch (error) {
      console.error("Error scheduling maintenance:", error)
      toast({
        title: "Error",
        description: "Failed to schedule maintenance. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredBuses = buses.filter(
    (bus) =>
      bus.bus_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.bus_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeBuses = filteredBuses.filter((bus) => bus.status === "active")
  const maintenanceBuses = filteredBuses.filter((bus) => bus.status === "maintenance")

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading buses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" asChild className="text-white">
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Bus Management</h1>
          <Button
            size="sm"
            className="ml-auto bg-white text-maroon-700 hover:bg-maroon-50"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Bus</span>
          </Button>
        </div>
      </header>

      <div className="p-4">
        <div className="relative mb-4">
          <Input
            placeholder="Search buses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-maroon-200 focus-visible:ring-maroon-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <main className="flex-1">
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsContent value="overview" className="p-4 space-y-4">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Card className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <Bus className="h-8 w-8 text-maroon-600 mb-2" />
                    <p className="text-2xl font-bold text-maroon-800">{buses.length}</p>
                    <p className="text-sm text-muted-foreground">Total Buses</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <Tool className="h-8 w-8 text-maroon-600 mb-2" />
                    <p className="text-2xl font-bold text-maroon-800">{maintenanceBuses.length}</p>
                    <p className="text-sm text-muted-foreground">In Maintenance</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <Shield className="h-8 w-8 text-maroon-600 mb-2" />
                    <p className="text-2xl font-bold text-maroon-800">{activeBuses.length}</p>
                    <p className="text-sm text-muted-foreground">Active Buses</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <Calendar className="h-8 w-8 text-maroon-600 mb-2" />
                    <p className="text-2xl font-bold text-maroon-800">
                      {buses.filter((b) => b.status === "inactive").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Inactive Buses</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-maroon-700">Bus Fleet</CardTitle>
                <CardDescription>Overview of all buses and their current status</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {filteredBuses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "No buses found matching your search" : "No buses found"}
                      </div>
                    ) : (
                      filteredBuses.map((bus) => (
                        <Card key={bus.id} className="shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-maroon-800">{bus.bus_number}</h3>
                                  <Badge
                                    variant={
                                      bus.status === "active"
                                        ? "default"
                                        : bus.status === "maintenance"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                  >
                                    {bus.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <MapPin className="h-4 w-4" />
                                      <span>Route: {bus.current_route_id || "Not assigned"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <User className="h-4 w-4" />
                                      <span>Conductor: {bus.current_conductor_id || "Not assigned"}</span>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        Next Maintenance: {new Date(bus.next_maintenance).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Clock className="h-4 w-4" />
                                      <span>Mileage: {bus.mileage} km</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-maroon-200 hover:bg-maroon-50"
                                    >
                                      Manage
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedBus(bus)
                                        setEditBus({
                                          status: bus.status,
                                          next_maintenance: bus.next_maintenance,
                                          mileage: bus.mileage,
                                          capacity: bus.capacity,
                                          bus_type: bus.bus_type,
                                        })
                                        setIsEditDialogOpen(true)
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => {
                                        setSelectedBus(bus)
                                        setIsDeleteDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="p-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-maroon-700">Maintenance Schedule</CardTitle>
                <CardDescription>Upcoming and past maintenance records</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredBuses.map((bus) => (
                      <Card key={bus.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-maroon-800">{bus.bus_number}</h3>
                                <Badge
                                  variant={new Date(bus.next_maintenance) <= new Date() ? "destructive" : "default"}
                                >
                                  {new Date(bus.next_maintenance) <= new Date() ? "Maintenance Due" : "Scheduled"}
                                </Badge>
                              </div>
                              <div className="grid gap-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Tool className="h-4 w-4" />
                                  <span>Last Maintenance: {new Date(bus.last_maintenance).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>Next Maintenance: {new Date(bus.next_maintenance).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>Current Mileage: {bus.mileage} km</span>
                                </div>
                              </div>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="border-maroon-200 hover:bg-maroon-50">
                                  Schedule
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Schedule Maintenance - {bus.bus_number}</DialogTitle>
                                  <DialogDescription>Update maintenance schedule and details</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Schedule Date</Label>
                                    <Input
                                      type="date"
                                      defaultValue={new Date(bus.next_maintenance).toISOString().split("T")[0]}
                                      onChange={(e) => handleScheduleMaintenance(bus.id, e.target.value)}
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="p-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-maroon-700">Route & Conductor Assignments</CardTitle>
                <CardDescription>Manage bus assignments and schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {activeBuses.map((bus) => (
                      <Card key={bus.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-maroon-800">{bus.bus_number}</h3>
                              <Badge variant="outline">Active</Badge>
                            </div>

                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <Label>Current Assignment</Label>
                                <Card>
                                  <CardContent className="p-3 grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">Route</p>
                                      <p className="font-medium">{bus.current_route_id || "Not assigned"}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">Conductor</p>
                                      <p className="font-medium">{bus.current_conductor_id || "Not assigned"}</p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
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
              value="maintenance"
              className="flex flex-col items-center justify-center data-[state=active]:bg-maroon-100 data-[state=active]:text-maroon-800 rounded-none h-full"
            >
              <Tool className="h-5 w-5" />
              <span className="text-xs">Maintenance</span>
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="flex flex-col items-center justify-center data-[state=active]:bg-maroon-100 data-[state=active]:text-maroon-800 rounded-none h-full"
            >
              <Shield className="h-5 w-5" />
              <span className="text-xs">Assignments</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </main>

      {/* Add Bus Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bus</DialogTitle>
            <DialogDescription>Enter bus details to add it to the fleet</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="busNumber">Bus Number</Label>
              <Input
                id="busNumber"
                placeholder="BUS-2024-XX"
                value={newBus.bus_number}
                onChange={(e) => setNewBus((prev) => ({ ...prev, bus_number: e.target.value }))}
                className="border-maroon-200 focus-visible:ring-maroon-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="45"
                value={newBus.capacity}
                onChange={(e) => setNewBus((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) }))}
                className="border-maroon-200 focus-visible:ring-maroon-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Bus Type</Label>
              <Select
                value={newBus.bus_type}
                onValueChange={(value) => setNewBus((prev) => ({ ...prev, bus_type: value }))}
              >
                <SelectTrigger className="border-maroon-200 focus-visible:ring-maroon-500">
                  <SelectValue placeholder="Select bus type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateBus} className="bg-maroon-700 hover:bg-maroon-800">
              Add Bus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bus Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bus - {selectedBus?.bus_number}</DialogTitle>
            <DialogDescription>Update bus details and assignments</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editBus.status}
                onValueChange={(value) => setEditBus((prev) => ({ ...prev, status: value as BusType["status"] }))}
              >
                <SelectTrigger className="border-maroon-200 focus-visible:ring-maroon-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Next Maintenance</Label>
              <Input
                type="date"
                value={editBus.next_maintenance ? new Date(editBus.next_maintenance).toISOString().split("T")[0] : ""}
                onChange={(e) => setEditBus((prev) => ({ ...prev, next_maintenance: e.target.value }))}
                className="border-maroon-200 focus-visible:ring-maroon-500"
              />
            </div>
            <div className="space-y-2">
              <Label>Bus Type</Label>
              <Select
                value={editBus.bus_type}
                onValueChange={(value) => setEditBus((prev) => ({ ...prev, bus_type: value }))}
              >
                <SelectTrigger className="border-maroon-200 focus-visible:ring-maroon-500">
                  <SelectValue placeholder="Select bus type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                type="number"
                value={editBus.capacity}
                onChange={(e) => setEditBus((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) }))}
                className="border-maroon-200 focus-visible:ring-maroon-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mileage (km)</Label>
            <Input
              type="number"
              value={editBus.mileage}
              onChange={(e) => setEditBus((prev) => ({ ...prev, mileage: Number.parseInt(e.target.value) }))}
              className="border-maroon-200 focus-visible:ring-maroon-500"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateBus} className="bg-maroon-700 hover:bg-maroon-800">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the bus {selectedBus?.bus_number}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteBus}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

