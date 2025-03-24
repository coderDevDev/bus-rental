"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import type { Role } from "@/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in")
    }

    if (!loading && user && allowedRoles.length > 0 && !allowedRoles.includes(role as Role)) {
      // Redirect based on role
      if (role === "passenger") {
        router.push("/dashboard")
      } else if (role === "conductor") {
        router.push("/conductor")
      } else if (role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    }
  }, [user, role, loading, router, allowedRoles])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role as Role)) {
    return null
  }

  return <>{children}</>
}

