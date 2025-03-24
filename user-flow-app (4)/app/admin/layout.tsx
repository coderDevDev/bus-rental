"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
}

