"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

export default function Shop() {
  const { toast } = useToast()
  const [cartCount, setCartCount] = useState(0)

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1)
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart",
    })
  }

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
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">Shop</h1>
          <Button variant="ghost" size="icon" asChild className="ml-auto">
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                  {cartCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="p-4">
        <div className="relative mb-4">
          <Input placeholder="Search products..." className="pl-10" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="sale">Sale</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Card key={item}>
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted flex items-center justify-center">Product {item}</div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start p-3">
                    <h3 className="font-medium text-sm">Product Name {item}</h3>
                    <p className="text-sm font-bold">${(item * 9.99).toFixed(2)}</p>
                    <Button size="sm" className="mt-2 w-full" onClick={handleAddToCart}>
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[2, 4, 6, 8].map((item) => (
                <Card key={item}>
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted flex items-center justify-center">Popular {item}</div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start p-3">
                    <h3 className="font-medium text-sm">Popular Product {item}</h3>
                    <p className="text-sm font-bold">${(item * 9.99).toFixed(2)}</p>
                    <Button size="sm" className="mt-2 w-full" onClick={handleAddToCart}>
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 3, 5, 7].map((item) => (
                <Card key={item}>
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted flex items-center justify-center">New {item}</div>
                    <Badge className="absolute top-2 right-2">New</Badge>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start p-3">
                    <h3 className="font-medium text-sm">New Product {item}</h3>
                    <p className="text-sm font-bold">${(item * 12.99).toFixed(2)}</p>
                    <Button size="sm" className="mt-2 w-full" onClick={handleAddToCart}>
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sale" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[2, 3, 5, 8].map((item) => (
                <Card key={item}>
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted flex items-center justify-center">Sale {item}</div>
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      Sale
                    </Badge>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start p-3">
                    <h3 className="font-medium text-sm">Sale Product {item}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">${(item * 7.99).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground line-through">${(item * 9.99).toFixed(2)}</p>
                    </div>
                    <Button size="sm" className="mt-2 w-full" onClick={handleAddToCart}>
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

