'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bell,
  Bus,
  Calendar,
  Clock,
  Home,
  MapPin,
  Search,
  Ticket,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { format } from 'date-fns';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-primary text-primary-foreground z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <h1 className="font-bold text-lg">BusGo</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-primary-foreground">
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-white text-primary">
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-primary-foreground">
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Tabs
          defaultValue="home"
          className="w-full"
          onValueChange={setActiveTab}>
          <TabsContent value="home" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Find Your Bus</CardTitle>
                <CardDescription>Search for available buses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select>
                      <SelectTrigger id="from" className="pl-10">
                        <SelectValue placeholder="Select departure city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new-york">New York</SelectItem>
                        <SelectItem value="boston">Boston</SelectItem>
                        <SelectItem value="washington">
                          Washington DC
                        </SelectItem>
                        <SelectItem value="philadelphia">
                          Philadelphia
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select>
                      <SelectTrigger id="to" className="pl-10">
                        <SelectValue placeholder="Select destination city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new-york">New York</SelectItem>
                        <SelectItem value="boston">Boston</SelectItem>
                        <SelectItem value="washington">
                          Washington DC
                        </SelectItem>
                        <SelectItem value="philadelphia">
                          Philadelphia
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date of Journey</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      className="pl-10"
                      min={today}
                      defaultValue={today}
                    />
                  </div>
                </div>

                <Button className="w-full">Search Buses</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Trips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2].map(item => (
                  <Card key={item} className="overflow-hidden">
                    <div className="bg-primary text-primary-foreground p-2 text-sm font-medium">
                      {item === 1 ? 'Tomorrow' : 'Next Week'} -{' '}
                      {item === 1 ? 'Confirmed' : 'Pending Payment'}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">
                            New York to Boston
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Express Bus {item === 1 ? 'A1' : 'B2'}
                          </p>
                        </div>
                        <Badge variant={item === 1 ? 'default' : 'outline'}>
                          {item === 1 ? 'Confirmed' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {item === 1 ? 'May 15, 2023' : 'May 20, 2023'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>{item === 1 ? '10:00 AM' : '2:30 PM'}</span>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          asChild>
                          <Link href={`/tickets/${item}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/my-trips">View All Trips</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Routes</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  asChild
                  className="h-auto py-4 flex flex-col gap-2 justify-start items-start">
                  <Link href="/search?from=new-york&to=boston">
                    <div className="flex items-center gap-2 font-medium">
                      <Bus className="h-4 w-4" />
                      <span>NY to Boston</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      From $25
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="h-auto py-4 flex flex-col gap-2 justify-start items-start">
                  <Link href="/search?from=boston&to=washington">
                    <div className="flex items-center gap-2 font-medium">
                      <Bus className="h-4 w-4" />
                      <span>Boston to DC</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      From $40
                    </span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  New York to Boston - May 15, 2023
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map(item => (
                  <Card key={item} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">
                            Express Bus {String.fromCharCode(64 + item)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Luxury {item % 2 === 0 ? 'Sleeper' : 'Seater'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${20 + item * 5}</p>
                          <p className="text-xs text-muted-foreground">
                            {30 - item * 5} seats left
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-4">
                        <div>
                          <p className="font-medium">{8 + item}:00 AM</p>
                          <p className="text-xs text-muted-foreground">
                            New York
                          </p>
                        </div>
                        <div className="flex-1 mx-2 border-t border-dashed relative">
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                            {4 + item} hrs
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{12 + item}:00 PM</p>
                          <p className="text-xs text-muted-foreground">
                            Boston
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <span>WiFi</span>
                        <span>•</span>
                        <span>Power Outlets</span>
                        <span>•</span>
                        <span>Air Conditioning</span>
                      </div>
                      <Button className="w-full" asChild>
                        <Link href={`/select-seats/${item}`}>Select Seats</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>My Tickets</CardTitle>
                <CardDescription>View and manage your tickets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map(item => (
                  <Card key={item} className="overflow-hidden">
                    <div
                      className={`${
                        item === 1
                          ? 'bg-primary'
                          : item === 2
                          ? 'bg-amber-500'
                          : 'bg-muted'
                      } text-${
                        item === 3 ? 'foreground' : 'primary-foreground'
                      } p-2 text-sm font-medium`}>
                      {item === 1
                        ? 'Upcoming'
                        : item === 2
                        ? 'Pending Payment'
                        : 'Completed'}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">
                            {item === 1
                              ? 'New York to Boston'
                              : item === 2
                              ? 'Boston to Washington'
                              : 'Philadelphia to New York'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Ticket #{1000 + item * 111}
                          </p>
                        </div>
                        <Badge
                          variant={
                            item === 1
                              ? 'default'
                              : item === 2
                              ? 'outline'
                              : 'secondary'
                          }>
                          {item === 1
                            ? 'Confirmed'
                            : item === 2
                            ? 'Pending'
                            : 'Completed'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {item === 1
                            ? 'May 15, 2023'
                            : item === 2
                            ? 'May 20, 2023'
                            : 'April 30, 2023'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-4">
                        <Clock className="h-4 w-4" />
                        <span>
                          {item === 1
                            ? '10:00 AM'
                            : item === 2
                            ? '2:30 PM'
                            : '8:45 AM'}
                        </span>
                      </div>
                      <Button
                        variant={item === 2 ? 'default' : 'outline'}
                        className="w-full"
                        asChild>
                        <Link href={`/tickets/${item}`}>
                          {item === 2 ? 'Complete Payment' : 'View Ticket'}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="p-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-4">John Doe</CardTitle>
                  <CardDescription>john.doe@example.com</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-medium mb-2">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Phone</div>
                      <div>+1 (555) 123-4567</div>
                      <div className="text-muted-foreground">
                        Preferred Payment
                      </div>
                      <div>Credit Card</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Travel Statistics</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Total Trips</div>
                      <div>12</div>
                      <div className="text-muted-foreground">
                        Total Distance
                      </div>
                      <div>1,245 miles</div>
                      <div className="text-muted-foreground">
                        Loyalty Points
                      </div>
                      <div>350 points</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/profile/edit">Edit Profile</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/settings">Settings</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive">
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsList className="fixed bottom-0 w-full border-t bg-background h-16 grid grid-cols-4 p-0 rounded-none">
            <TabsTrigger
              value="home"
              className="flex flex-col items-center justify-center data-[state=active]:bg-secondary rounded-none h-full">
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="flex flex-col items-center justify-center data-[state=active]:bg-secondary rounded-none h-full">
              <Search className="h-5 w-5" />
              <span className="text-xs">Search</span>
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="flex flex-col items-center justify-center data-[state=active]:bg-secondary rounded-none h-full">
              <Ticket className="h-5 w-5" />
              <span className="text-xs">Tickets</span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="flex flex-col items-center justify-center data-[state=active]:bg-secondary rounded-none h-full">
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </main>
    </div>
  );
}
