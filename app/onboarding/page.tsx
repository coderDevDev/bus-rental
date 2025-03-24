"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Onboarding() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    preferredPayment: "card",
    notificationPreference: "email",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (step === 1 && (!formData.fullName || !formData.phoneNumber)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate successful onboarding
    toast({
      title: "Success",
      description: "Profile setup completed",
    })

    // Redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 bg-primary text-primary-foreground">
        <Button variant="ghost" size="icon" asChild className="text-primary-foreground">
          <Link href="/sign-up">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
            <CardDescription className="text-center">Step {step} of 2</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-3">
                    <Label>Preferred Payment Method</Label>
                    <RadioGroup
                      value={formData.preferredPayment}
                      onValueChange={(value) => handleRadioChange("preferredPayment", value)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card">Credit/Debit Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mobile" id="mobile" />
                        <Label htmlFor="mobile">Mobile Payment</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash">Cash on Boarding</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3 mt-6">
                    <Label>Notification Preferences</Label>
                    <RadioGroup
                      value={formData.notificationPreference}
                      onValueChange={(value) => handleRadioChange("notificationPreference", value)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email">Email</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sms" id="sms" />
                        <Label htmlFor="sms">SMS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both">Both Email and SMS</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={() => router.push("/sign-up")}>
                Cancel
              </Button>
            )}

            {step < 2 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Complete Setup</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

