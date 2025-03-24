"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Clock, Search, Activity, Timer, CheckCircle2 } from "lucide-react"
import { timeRecordService } from "@/services/time-record-service"
import { conductorService } from "@/services/conductor-service"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatCard } from "@/components/admin/stat-card"

export default function MonitoringPage() {
  const [timeRecords, setTimeRecords] = useState<any[]>([])
  const [conductors, setConductors] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [selectedConductor, setSelectedConductor] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("daily")

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [recordsData, conductorsData] = await Promise.all([
          timeRecordService.getTimeRecords(),
          conductorService.getAllConductors(),
        ])
        setTimeRecords(recordsData)
        setConductors(conductorsData)
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

  const handleDateChange = async (date: string) => {
    setSelectedDate(date)
    try {
      setIsLoading(true)
      const records = await timeRecordService.getTimeRecordsByDate(date)
      setTimeRecords(records)
    } catch (error) {
      console.error("Error loading time records:", error)
      toast({
        title: "Error",
        description: "Failed to load time records for the selected date",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRecords = timeRecords.filter((record) => {
    // Filter by conductor if one is selected
    if (selectedConductor !== "all" && record.conductor_id !== selectedConductor) {
      return false
    }

    // Filter by search query
    return (
      (record.conductor?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.record_id || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const activeRecords = filteredRecords.filter((record) => record.status === "active")
  const completedRecords = filteredRecords.filter((record) => record.status === "completed")

  // Calculate monitoring statistics
  const totalHours = timeRecords.filter((r) => r.total_hours).reduce((acc, curr) => acc + (curr.total_hours || 0), 0)

  const averageShiftLength =
    completedRecords.length > 0
      ? (completedRecords.reduce((acc, curr) => acc + (curr.total_hours || 0), 0) / completedRecords.length).toFixed(1)
      : 0

  const mostActiveDay = "Monday" // This would normally be calculated from actual data

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const calculateTotalHours = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return "In progress"

    const start = new Date(clockIn).getTime()
    const end = new Date(clockOut).getTime()
    const diffHours = (end - start) / (1000 * 60 * 60)

    return `${diffHours.toFixed(2)} hours`
  }

  // Calculate conductor statistics
  const conductorStats = conductors
    .map((conductor) => {
      const conductorRecords = timeRecords.filter((r) => r.conductor_id === conductor.id)
      const totalHours = conductorRecords
        .filter((r) => r.total_hours)
        .reduce((acc, curr) => acc + (curr.total_hours || 0), 0)
      const totalShifts = conductorRecords.length
      const avgHoursPerShift = totalShifts > 0 ? totalHours / totalShifts : 0

      return {
        id: conductor.id,
        name: conductor.name,
        totalShifts,
        totalHours,
        avgHoursPerShift,
      }
    })
    .sort((a, b) => b.totalHours - a.totalHours)

  if (isLoading) {
    return (
      <AdminLayout title="Conductor Monitoring">
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700"></div>
        </CardContent>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Conductor Monitoring">
      <Tabs defaultValue="daily" className="w-full" onValueChange={setActiveTab}>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-maroon-700 text-2xl">Conductor Monitoring</CardTitle>
            <CardDescription>Track conductor time records and performance</CardDescription>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard
              title="Active Shifts"
              value={activeRecords.length}
              icon={Activity}
              description="Currently on duty"
              iconClassName="bg-green-100"
            />
            <StatCard
              title="Total Hours"
              value={`${totalHours.toFixed(1)} hrs`}
              icon={Clock}
              description="Cumulative work hours"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Avg. Shift Length"
              value={`${averageShiftLength} hrs`}
              icon={Timer}
              description="Average shift duration"
              iconClassName="bg-blue-100"
            />
            <StatCard
              title="Most Active Day"
              value={mostActiveDay}
              icon={CheckCircle2}
              description="Highest conductor activity"
              iconClassName="bg-amber-100"
            />
          </div>

          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="daily">Daily View</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
        </CardHeader>

        <TabsContent value="daily">
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  className="flex h-10 rounded-md border border-maroon-200 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-maroon-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-auto">
                <Select value={selectedConductor} onValueChange={setSelectedConductor}>
                  <SelectTrigger className="w-full sm:w-[200px] border-maroon-200 focus-visible:ring-maroon-500">
                    <SelectValue placeholder="Select conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conductors</SelectItem>
                    {conductors.map((conductor) => (
                      <SelectItem key={conductor.id} value={conductor.id}>
                        {conductor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search records..."
                  className="pl-8 w-full border-maroon-200 focus-visible:ring-maroon-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border border-maroon-100">
              <ScrollArea className="h-[calc(100vh-24rem)]">
                <Table>
                  <TableHeader className="bg-maroon-50">
                    <TableRow>
                      <TableHead>Record ID</TableHead>
                      <TableHead>Conductor</TableHead>
                      <TableHead className="hidden md:table-cell">Assignment</TableHead>
                      <TableHead className="hidden md:table-cell">Clock In</TableHead>
                      <TableHead className="hidden lg:table-cell">Clock Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          {searchQuery || selectedConductor !== "all"
                            ? "No records found matching your criteria"
                            : "No time records found for this date"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id} className="hover:bg-maroon-50">
                          <TableCell className="font-medium">{record.record_id || record.id.substring(0, 8)}</TableCell>
                          <TableCell>{record.conductor?.name || "N/A"}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {record.assignment?.id ? record.assignment.id.substring(0, 8) : "N/A"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{formatDateTime(record.clock_in)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {record.clock_out ? formatDateTime(record.clock_out) : "Still active"}
                          </TableCell>
                          <TableCell>
                            {record.total_hours
                              ? `${record.total_hours.toFixed(2)} hrs`
                              : calculateTotalHours(record.clock_in, record.clock_out)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                record.status === "active" ? "bg-green-500 text-white" : "bg-blue-500 text-white"
                              }
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </CardContent>
        </TabsContent>

        <TabsContent value="summary">
          <CardContent>
            <div className="rounded-md border border-maroon-100 mb-6">
              <ScrollArea className="h-[calc(100vh-24rem)]">
                <Table>
                  <TableHeader className="bg-maroon-50">
                    <TableRow>
                      <TableHead>Conductor</TableHead>
                      <TableHead>Total Shifts</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Average Hours/Shift</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conductorStats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No conductor data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      conductorStats.map((conductor) => (
                        <TableRow key={conductor.id} className="hover:bg-maroon-50">
                          <TableCell className="font-medium">{conductor.name}</TableCell>
                          <TableCell>{conductor.totalShifts}</TableCell>
                          <TableCell>{conductor.totalHours.toFixed(2)} hours</TableCell>
                          <TableCell>{conductor.avgHoursPerShift.toFixed(2)} hours</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}

