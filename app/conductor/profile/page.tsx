"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Bus, Clock, MapPin, TicketIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SignOutButton } from "@/components/sign-out-button"
import { useAuth } from "@/hooks/use-auth"

export default function ConductorProfile() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-primary text-primary-foreground z-10">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" asChild className="text-primary-foreground">
            <Link href="/conductor">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Profile</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt="Conductor" />
                <AvatarFallback>{user?.user_metadata?.name?.[0] || "C"}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{user?.user_metadata?.name || "John Smith"}</CardTitle>
              <CardDescription>Conductor ID: CON-2024-001</CardDescription>
              <Badge className="mt-2">On Duty</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">+1 (555) 123-4567</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || "john.smith@busgo.com"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">License</p>
                <p className="font-medium">CDL-A 123456</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-medium">5 years</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Current Assignment</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-muted-foreground" />
                  <span>Route 101: NY - Boston Express</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Morning Shift (6 AM - 2 PM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Bus: BUS-2024-A1</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Today&apos;s Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <TicketIcon className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">47</p>
                    <p className="text-sm text-muted-foreground">Tickets Issued</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">6h</p>
                    <p className="text-sm text-muted-foreground">Hours Active</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/conductor/settings">Settings</Link>
            </Button>
            <SignOutButton />
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

