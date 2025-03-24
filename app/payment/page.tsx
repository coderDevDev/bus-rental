"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CreditCard, Landmark, Phone, Shield } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Payment() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const busId = searchParams.get("bus") || "1"
  const seatsParam = searchParams.get("seats") || ""
  const selectedSeats = seatsParam.split(",").map(Number)
  const totalAmount = selectedSeats.length * (20 + Number.parseInt(busId) * 5)

  const handlePayment = () => {
    toast({
      title: "Payment Successful",
      description: "Your booking has been confirmed",
    })

    router.push("/booking-confirmation")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-primary text-primary-foreground z-10">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" asChild className="text-primary-foreground">
            <Link href={`/select-seats/${busId}`}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Payment</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
            <CardDescription>Express Bus {String.fromCharCode(64 + Number.parseInt(busId))}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>New York to Boston</span>
                <span>May 15, 2023</span>
              </div>
              <div className="flex justify-between">
                <span>Departure Time</span>
                <span>{8 + Number.parseInt(busId)}:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Seats</span>
                <span>{selectedSeats.join(", ")}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Amount</span>
                <span>${totalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose your preferred payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="card">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Card</span>
                </TabsTrigger>
                <TabsTrigger value="bank" className="flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  <span>Bank</span>
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Mobile</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="Enter name as on card" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bank" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Select Bank</Label>
                  <RadioGroup defaultValue="bank1">
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="bank1" id="bank1" />
                      <Label htmlFor="bank1">National Bank</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="bank2" id="bank2" />
                      <Label htmlFor="bank2">City Bank</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="bank3" id="bank3" />
                      <Label htmlFor="bank3">Metro Bank</Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>

              <TabsContent value="mobile" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Select Mobile Payment</Label>
                  <RadioGroup defaultValue="mobile1">
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="mobile1" id="mobile1" />
                      <Label htmlFor="mobile1">PayMobile</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="mobile2" id="mobile2" />
                      <Label htmlFor="mobile2">QuickPay</Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-3">
                      <RadioGroupItem value="mobile3" id="mobile3" />
                      <Label htmlFor="mobile3">WalletPay</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input id="mobileNumber" placeholder="Enter mobile number" />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handlePayment}>
              Pay ${totalAmount}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

