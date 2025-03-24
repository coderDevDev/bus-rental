"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Download, Share2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function BookingConfirmation() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-4">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-center">Booking Confirmed!</h1>
          <p className="text-center text-muted-foreground">Your ticket has been booked successfully</p>
        </div>

        <Card className="mb-4">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle>Ticket Details</CardTitle>
            <CardDescription className="text-primary-foreground/80">Booking ID: BUS12345</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="font-bold text-lg">New York to Boston</h3>
              <p className="text-sm text-muted-foreground">Express Bus A</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">May 15, 2023</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">10:00 AM</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seats</p>
                <p className="font-medium">5, 6</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passengers</p>
                <p className="font-medium">2</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ticket Price</span>
                <span>$50</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>$5</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Amount</span>
                <span>$55</span>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium">Boarding Point</p>
              <p className="text-muted-foreground">New York Central Bus Station, Platform 3</p>
            </div>

            <div className="flex justify-center">
              <div className="bg-black text-white p-4 rounded-md">
                <p className="text-center text-xs mb-2">Scan at boarding</p>
                <div className="w-40 h-40 bg-white flex items-center justify-center text-black">QR Code</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <Button className="w-full" asChild>
            <Link href="/dashboard?tab=tickets">View My Tickets</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard">Back to Home</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

