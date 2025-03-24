"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"

export default function ConductorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute allowedRoles={["conductor"]}>{children}</ProtectedRoute>
}

