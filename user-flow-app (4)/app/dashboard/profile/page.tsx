"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Settings } from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"
import { useAuth } from "@/hooks/use-auth"

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" asChild className="mr-auto">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Profile</h1>
          <Button variant="ghost" size="icon" asChild className="ml-auto">
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback>{user?.user_metadata?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{user?.user_metadata?.name || "User Name"}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
          <div className="flex gap-4 mt-4">
            <Button asChild>
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>
            <Button variant="outline">Share Profile</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is a sample user bio. The user can edit this in their profile settings. Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="aspect-square bg-muted rounded-md flex items-center justify-center">
                  Post {item}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <Avatar>
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">You</span> liked a post from{" "}
                        <span className="font-medium">User {item}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="aspect-square bg-muted rounded-md flex items-center justify-center">
                  Saved {item}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <SignOutButton />
        </div>
      </main>
    </div>
  )
}

