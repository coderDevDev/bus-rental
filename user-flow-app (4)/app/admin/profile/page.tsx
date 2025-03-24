"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Bus, Clock, Settings, Shield, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SignOutButton } from "@/components/sign-out-button"
import { useAuth } from "@/hooks/use-auth"

export default function AdminProfile() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-primary text-primary-foreground z-10">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" asChild className="text-primary-foreground">
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Admin Profile</h1>
          <Button variant="ghost" size="icon" asChild className="ml-auto text-primary-foreground">
            <Link href="/admin/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt="Admin" />
                <AvatarFallback>{user?.user_metadata?.name?.[0] || "A"}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{user?.user_metadata?.name || "Admin User"}</CardTitle>
              <CardDescription>Admin ID: ADM-2024-001</CardDescription>
              <Badge className="mt-2">System Administrator</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || "admin@busgo.com"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">System Administrator</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p className="font-medium">{new Date().toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Account Created</p>
                <p className="font-medium">{new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">System Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <Bus className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-sm text-muted-foreground">Buses</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">42</p>
                    <p className="text-sm text-muted-foreground">Conductors</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-bold">15</p>
                    <p className="text-sm text-muted-foreground">Routes</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Recent Activity</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Added new bus (BUS-2024-004) - 2 hours ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Updated route schedule (Route 101) - 4 hours ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Assigned conductor to route - 1 day ago</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/settings">System Settings</Link>
            </Button>
            <SignOutButton />
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

