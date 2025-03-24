"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute allowedRoles={["passenger"]}>{children}</ProtectedRoute>
}

