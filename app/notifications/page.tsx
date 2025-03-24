"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Notifications() {
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
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Notifications</h1>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Check className="h-5 w-5" />
            <span className="sr-only">Mark all as read</span>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-2 w-full rounded-none border-b">
            <TabsTrigger value="all" className="rounded-none">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="rounded-none">
              Unread
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="p-0">
            <ScrollArea className="h-[calc(100vh-112px)]">
              <div className="divide-y">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                  <Card key={item} className="rounded-none border-x-0 border-t-0 last:border-b-0">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarFallback>U{item}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">User {item}</span>{" "}
                            {item % 3 === 0
                              ? "liked your post"
                              : item % 3 === 1
                                ? "commented on your post"
                                : "started following you"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item} hour{item !== 1 ? "s" : ""} ago
                          </p>
                        </div>
                        {item % 2 === 0 && <div className="ml-auto w-2 h-2 rounded-full bg-primary self-center" />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread" className="p-0">
            <ScrollArea className="h-[calc(100vh-112px)]">
              <div className="divide-y">
                {[2, 4, 6, 8, 10].map((item) => (
                  <Card key={item} className="rounded-none border-x-0 border-t-0 last:border-b-0">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarFallback>U{item}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">User {item}</span>{" "}
                            {item % 3 === 0
                              ? "liked your post"
                              : item % 3 === 1
                                ? "commented on your post"
                                : "started following you"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item} hour{item !== 1 ? "s" : ""} ago
                          </p>
                        </div>
                        <div className="ml-auto w-2 h-2 rounded-full bg-primary self-center" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

