"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { conductorService } from "@/services/conductor-service"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AddConductorPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    license_number: "",
    phone: "",
    status: "active",
    experience_years: 0,
    password: "Password123", // Default password
  })

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
    setIsSubmitting(true)

    try {
      // The conductorService.createConductor function now handles creating both the user and conductor records
      await conductorService.createConductor({
        name: formData.name,
        email: formData.email,
        license_number: formData.license_number,
        phone: formData.phone,
        status: formData.status,
        experience_years: formData.experience_years,
        password: formData.password,
      })

      toast({
        title: "Success",
        description: "Conductor added successfully",
      })
      router.push("/admin/conductors")
    } catch (error) {
      console.error("Error adding conductor:", error)
      toast({
        title: "Error",
        description: "Failed to add conductor. Please check if the email is already in use.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout title="Add New Conductor" backHref="/admin/conductors">
      <CardHeader>
        <CardTitle className="text-maroon-700 text-2xl">Conductor Information</CardTitle>
        <CardDescription>Enter the details of the new conductor</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
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
                value={formData.email}
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
                value={formData.license_number}
                onChange={handleChange}
                className="border-maroon-200 focus-visible:ring-maroon-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border-maroon-200 focus-visible:ring-maroon-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                name="experience_years"
                type="number"
                min="0"
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="border-maroon-200 focus-visible:ring-maroon-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/conductors")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-maroon-700 hover:bg-maroon-800">
              {isSubmitting ? "Adding..." : "Add Conductor"}
            </Button>
          </div>
        </form>
      </CardContent>
    </AdminLayout>
  )
}

