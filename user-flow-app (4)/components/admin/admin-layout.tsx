"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Bus, Calendar, ChevronRight, Home, MapPin, Menu, Settings, Users, X } from "lucide-react"
import { cn } from "@/components/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  backHref?: string
  actions?: React.ReactNode
}

export function AdminLayout({ children, title, backHref = "/admin", actions }: AdminLayoutProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/conductors", label: "Conductors", icon: Users },
    { href: "/admin/routes", label: "Routes", icon: MapPin },
    { href: "/admin/buses", label: "Buses", icon: Bus },
    { href: "/admin/assignments", label: "Assignments", icon: Calendar },
    { href: "/admin/monitoring", label: "Monitoring", icon: Calendar },
    { href: "/admin/profile", label: "Profile", icon: Settings },
  ]

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
        <div className="container flex items-center h-14 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="text-white">
              <Link href={backHref}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="font-bold text-lg hidden sm:block">{title}</h1>
          </div>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2 sm:hidden">{title}</h1>

          <div className="ml-auto flex items-center gap-2">
            {actions}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b bg-maroon-700 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-lg">BusGo Admin</h2>
                      <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarImage src="/placeholder.svg" alt={user?.user_metadata?.name || "Admin"} />
                        <AvatarFallback>{user?.user_metadata?.name?.[0] || "A"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.user_metadata?.name || "Admin User"}</p>
                        <p className="text-xs opacity-80">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    <nav className="p-2">
                      {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-maroon-100 text-maroon-900 font-medium"
                                : "text-gray-700 hover:bg-gray-100",
                            )}
                          >
                            <Icon className={cn("h-4 w-4", isActive ? "text-maroon-700" : "text-gray-500")} />
                            {item.label}
                            {isActive && <ChevronRight className="ml-auto h-4 w-4 text-maroon-700" />}
                          </Link>
                        )
                      })}
                    </nav>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon" asChild className="text-white hidden md:flex">
              <Link href="/admin/profile">
                <Avatar className="h-8 w-8 border border-white/30">
                  <AvatarImage src="/placeholder.svg" alt={user?.user_metadata?.name || "Admin"} />
                  <AvatarFallback>{user?.user_metadata?.name?.[0] || "A"}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 container max-w-7xl">
        <Card className="shadow-sm border-gray-200">{children}</Card>
      </main>
    </div>
  )
}

