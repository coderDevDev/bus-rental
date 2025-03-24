"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Bus, Calendar, Clock, Download, MapPin, Share2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function TicketDetails({ params }: { params: { id: string } }) {
  const ticketId = params.id

  // Mock data based on ticket ID
  const ticketData = {
    "1": {
      status: "confirmed",
      route: "New York to Boston",
      busName: "Express Bus A1",
      date: "May 15, 2023",
      time: "10:00 AM",
      seats: "5, 6",
      passengers: 2,
      price: 50,
      serviceFee: 5,
      boardingPoint: "New York Central Bus Station, Platform 3",
      dropPoint: "Boston South Station, Gate 7",
    },
    "2": {
      status: "pending",
      route: "Boston to Washington",
      busName: "Express Bus B2",
      date: "May 20, 2023",
      time: "2:30 PM",
      seats: "10, 11",
      passengers: 2,
      price: 70,
      serviceFee: 7,
      boardingPoint: "Boston South Station, Gate 5",
      dropPoint: "Washington Union Station, Bay 12",
    },
    "3": {
      status: "completed",
      route: "Philadelphia to New York",
      busName: "Express Bus C3",
      date: "April 30, 2023",
      time: "8:45 AM",
      seats: "15, 16, 17",
      passengers: 3,
      price: 45,
      serviceFee: 5,
      boardingPoint: "Philadelphia Bus Terminal, Gate 3",
      dropPoint: "New York Central Bus Station, Platform 2",
    },
  }[ticketId] || {
    status: "confirmed",
    route: "New York to Boston",
    busName: "Express Bus A1",
    date: "May 15, 2023",
    time: "10:00 AM",
    seats: "5, 6",
    passengers: 2,
    price: 50,
    serviceFee: 5,
    boardingPoint: "New York Central Bus Station, Platform 3",
    dropPoint: "Boston South Station, Gate 7",
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-primary text-primary-foreground z-10">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" asChild className="text-primary-foreground">
            <Link href="/dashboard?tab=tickets">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Ticket Details</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card className="mb-4">
          <CardHeader
            className={`${
              ticketData.status === "confirmed"
                ? "bg-primary"
                : ticketData.status === "pending"
                  ? "bg-amber-500"
                  : "bg-muted"
            } text-${ticketData.status === "completed" ? "foreground" : "primary-foreground"}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Ticket #{1000 + Number.parseInt(ticketId) * 111}</CardTitle>
                <CardDescription
                  className={ticketData.status === "completed" ? "text-muted-foreground" : "text-primary-foreground/80"}
                >
                  Booking ID: BUS{12345 + Number.parseInt(ticketId) * 100}
                </CardDescription>
              </div>
              <Badge
                variant={
                  ticketData.status === "confirmed"
                    ? "outline"
                    : ticketData.status === "pending"
                      ? "secondary"
                      : "outline"
                }
                className={ticketData.status === "completed" ? "" : "border-primary-foreground text-primary-foreground"}
              >
                {ticketData.status === "confirmed"
                  ? "Confirmed"
                  : ticketData.status === "pending"
                    ? "Pending"
                    : "Completed"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="font-bold text-lg">{ticketData.route}</h3>
              <p className="text-sm text-muted-foreground">{ticketData.busName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{ticketData.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{ticketData.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Bus className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Seats</p>
                  <p className="font-medium">{ticketData.seats}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 flex items-center justify-center text-muted-foreground">
                  <span className="text-xs">👤</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Passengers</p>
                  <p className="font-medium">{ticketData.passengers}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ticket Price</span>
                <span>${ticketData.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>${ticketData.serviceFee}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Amount</span>
                <span>${ticketData.price + ticketData.serviceFee}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md text-sm flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Boarding Point</p>
                  <p className="text-muted-foreground">{ticketData.boardingPoint}</p>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md text-sm flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Drop Point</p>
                  <p className="text-muted-foreground">{ticketData.dropPoint}</p>
                </div>
              </div>
            </div>

            {ticketData.status === "confirmed" && (
              <div className="flex justify-center">
                <div className="bg-black text-white p-4 rounded-md">
                  <p className="text-center text-xs mb-2">Scan at boarding</p>
                  <div className="w-40 h-40 bg-white flex items-center justify-center text-black">QR Code</div>
                </div>
              </div>
            )}

            {ticketData.status === "pending" && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm text-amber-800">
                <p className="font-medium">Payment Pending</p>
                <p>Please complete your payment to confirm this booking.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            {ticketData.status === "pending" ? (
              <Button className="w-full" asChild>
                <Link href="/payment?bus=2&seats=10,11">Complete Payment</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </>
            )}
          </CardFooter>
        </Card>

        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard?tab=tickets">Back to Tickets</Link>
        </Button>
      </main>
    </div>
  )
}

