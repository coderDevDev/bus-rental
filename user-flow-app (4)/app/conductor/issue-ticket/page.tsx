"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Printer, Send, Receipt, CreditCard, Wallet } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { conductorDashboardService } from "@/services/conductor-dashboard-service"

export default function IssueTicket() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentAssignment, setCurrentAssignment] = useState<any>(null)
  const [routeDetails, setRouteDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    ticketType: "regular",
    from: "",
    to: "",
    paymentMethod: "cash",
  })

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

          // Set default from/to locations
          setFormData((prev) => ({
            ...prev,
            from: route.start_location,
            to: route.end_location,
          }))
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load assignment data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, toast])

  const handleTicketTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, ticketType: value }))
  }

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }))
  }

  const handleFromChange = (value: string) => {
    setFormData((prev) => ({ ...prev, from: value }))
  }

  const handleToChange = (value: string) => {
    setFormData((prev) => ({ ...prev, to: value }))
  }

  const getTicketPrice = () => {
    const baseFare = routeDetails?.fare || 25

    switch (formData.ticketType) {
      case "student":
        return baseFare * 0.8 // 20% discount
      case "senior":
        return baseFare * 0.6 // 40% discount
      default:
        return baseFare
    }
  }

  const handleIssueTicket = async () => {
    if (!user || !currentAssignment || !routeDetails) return

    setIsSubmitting(true)

    try {
      const result = await conductorDashboardService.issueTicket({
        conductorId: user.id,
        assignmentId: currentAssignment.id,
        routeId: routeDetails.id,
        fromLocation: formData.from,
        toLocation: formData.to,
        ticketType: formData.ticketType,
        fare: getTicketPrice(),
        paymentMethod: formData.paymentMethod,
      })

      toast({
        title: "Ticket Issued",
        description: `Ticket #${result.ticketId} has been issued successfully`,
      })

      router.push("/conductor")
    } catch (error) {
      console.error("Error issuing ticket:", error)
      toast({
        title: "Error",
        description: "Failed to issue ticket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
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
            <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Issue Ticket</h1>
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
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Issue Ticket</h1>
        </div>
      </header>

      <main className="flex-1 container p-4">
        <Card className="mb-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-maroon-700">Passenger Information</CardTitle>
            <CardDescription>Enter passenger details to issue ticket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ticket Type</Label>
              <RadioGroup
                value={formData.ticketType}
                onValueChange={handleTicketTypeChange}
                className="grid grid-cols-3 gap-4"
              >
                <Label
                  htmlFor="regular"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-maroon-700"
                >
                  <RadioGroupItem value="regular" id="regular" className="sr-only" />
                  <Receipt className="h-6 w-6 mb-2 text-maroon-700" />
                  <span className="text-sm font-medium">Regular</span>
                  <span className="text-sm text-muted-foreground">₱{routeDetails.fare?.toFixed(2) || "25.00"}</span>
                </Label>
                <Label
                  htmlFor="student"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-maroon-700"
                >
                  <RadioGroupItem value="student" id="student" className="sr-only" />
                  <Receipt className="h-6 w-6 mb-2 text-maroon-700" />
                  <span className="text-sm font-medium">Student</span>
                  <span className="text-sm text-muted-foreground">
                    ₱{(routeDetails.fare * 0.8)?.toFixed(2) || "20.00"}
                  </span>
                </Label>
                <Label
                  htmlFor="senior"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-maroon-700"
                >
                  <RadioGroupItem value="senior" id="senior" className="sr-only" />
                  <Receipt className="h-6 w-6 mb-2 text-maroon-700" />
                  <span className="text-sm font-medium">Senior</span>
                  <span className="text-sm text-muted-foreground">
                    ₱{(routeDetails.fare * 0.6)?.toFixed(2) || "15.00"}
                  </span>
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Select value={formData.from} onValueChange={handleFromChange}>
                <SelectTrigger id="from" className="border-maroon-200 focus-visible:ring-maroon-500">
                  <SelectValue placeholder="Select pickup point" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={routeDetails.start_location}>{routeDetails.start_location}</SelectItem>
                  <SelectItem value="Hartford">Hartford</SelectItem>
                  <SelectItem value="Worcester">Worcester</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Select value={formData.to} onValueChange={handleToChange}>
                <SelectTrigger id="to" className="border-maroon-200 focus-visible:ring-maroon-500">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hartford">Hartford</SelectItem>
                  <SelectItem value="Worcester">Worcester</SelectItem>
                  <SelectItem value={routeDetails.end_location}>{routeDetails.end_location}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={handlePaymentMethodChange}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="cash"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-maroon-700"
                >
                  <RadioGroupItem value="cash" id="cash" className="sr-only" />
                  <Wallet className="h-6 w-6 mb-2 text-maroon-700" />
                  <span className="text-sm font-medium">Cash</span>
                </Label>
                <Label
                  htmlFor="card"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-maroon-700"
                >
                  <RadioGroupItem value="card" id="card" className="sr-only" />
                  <CreditCard className="h-6 w-6 mb-2 text-maroon-700" />
                  <span className="text-sm font-medium">Card</span>
                </Label>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-maroon-700">Ticket Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ticket Type</span>
                <span className="font-medium capitalize">{formData.ticketType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Route</span>
                <span className="font-medium">
                  {formData.from} to {formData.to}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{formData.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-maroon-700">₱{getTicketPrice().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full gap-2 bg-maroon-700 hover:bg-maroon-800"
              onClick={handleIssueTicket}
              disabled={isSubmitting}
            >
              <Printer className="h-4 w-4" />
              {isSubmitting ? "Processing..." : "Print Ticket"}
            </Button>
            {formData.paymentMethod === "card" && (
              <Button variant="outline" className="w-full gap-2 border-maroon-200 hover:bg-maroon-50">
                <Send className="h-4 w-4" />
                Send Digital Ticket
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

