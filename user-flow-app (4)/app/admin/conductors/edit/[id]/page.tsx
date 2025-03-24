"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { conductorService } from "@/services/conductor-service"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditConductorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    license_number: "",
    phone: "",
    status: "inactive" as "active" | "inactive" | "on_leave",
    experience_years: 0,
  })

  useEffect(() => {
    const loadConductor = async () => {
      try {
        const conductor = await conductorService.getConductor(params.id)
        setFormData({
          name: conductor.name,
          email: conductor.email,
          license_number: conductor.license_number,
          phone: conductor.phone,
          status: conductor.status as "active" | "inactive" | "on_leave",
          experience_years: conductor.experience_years,
        })
      } catch (error) {
        console.error("Error loading conductor:", error)
        toast({
          title: "Error",
          description: "Failed to load conductor details",
          variant: "destructive",
        })
        router.push("/admin/conductors")
      } finally {
        setIsLoading(false)
      }
    }

    loadConductor()
  }, [params.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience_years" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value as "active" | "inactive" | "on_leave",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await conductorService.updateConductor(params.id, formData)
      toast({
        title: "Success",
        description: "Conductor updated successfully",
      })
      router.push("/admin/conductors")
    } catch (error) {
      console.error("Error updating conductor:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update conductor",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Edit Conductor" backHref="/admin/conductors">
        <CardHeader>
          <CardTitle className="text-maroon-700 text-2xl">
            <Skeleton className="h-8 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Edit Conductor" backHref="/admin/conductors">
      <CardHeader>
        <CardTitle className="text-maroon-700 text-2xl">Edit Conductor</CardTitle>
        <CardDescription>Update conductor information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                className="border-maroon-200 focus-visible:ring-maroon-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                className="border-maroon-200 focus-visible:ring-maroon-500"
                required
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                className="border-maroon-200 focus-visible:ring-maroon-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                name="license_number"
                placeholder="Enter license number"
                value={formData.license_number}
                onChange={handleChange}
                className="border-maroon-200 focus-visible:ring-maroon-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_years">Experience (Years)</Label>
              <Input
                id="experience_years"
                name="experience_years"
                type="number"
                min="0"
                placeholder="Enter years of experience"
                value={formData.experience_years}
                onChange={handleChange}
                className="border-maroon-200 focus-visible:ring-maroon-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger id="status" className="border-maroon-200 focus-visible:ring-maroon-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/conductors")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-maroon-700 hover:bg-maroon-800">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </AdminLayout>
  )
}

