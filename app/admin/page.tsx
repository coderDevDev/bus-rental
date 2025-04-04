'use client';

import { useState, useEffect } from 'react';
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

import {
  Bus,
  Calendar,
  CreditCard,
  MapPin,
  Settings,
  User,
  Users,
  ArrowUpRight,
  UserIcon
} from 'lucide-react';
import { busService } from '@/services/bus-service';
import { routeService } from '@/services/route-service';
import { conductorService } from '@/services/conductor-service';
import { assignmentService } from '@/services/assignment-service';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
export default function AdminDashboard() {
  const { user } = useAuth();
  const { signOut } = useAuth();
  console.log({ user });
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    totalConductors: 0,
    activeConductors: 0,
    totalRevenue: 0,
    totalTickets: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch all required data
        const [buses, routes, conductors, assignments] = await Promise.all([
          busService.getAllBuses(),
          routeService.getAllRoutes(),
          conductorService.getAllConductors(),
          assignmentService.getAllAssignments()
        ]);

        // Calculate total tickets and revenue from assignments
        const totalTickets = routes.reduce((sum, route) => {
          const assignmentTickets =
            route.assignments?.reduce((aSum, assignment) => {
              return aSum + (assignment.tickets?.[0]?.count || 0);
            }, 0) || 0;
          return sum + assignmentTickets;
        }, 0);

        // Calculate revenue
        const totalRevenue = routes.reduce((sum, route) => {
          const assignmentRevenue =
            route.assignments?.reduce((aSum, assignment) => {
              return (
                aSum + (assignment.tickets?.[0]?.count || 0) * route.base_fare
              );
            }, 0) || 0;
          return sum + assignmentRevenue;
        }, 0);

        setStats({
          totalBuses: buses.length,
          activeBuses: buses.filter(bus => bus.status === 'active').length,
          totalRoutes: routes.length,
          activeRoutes: routes.filter(route => route.status === 'active')
            .length,
          totalConductors: conductors.length,
          activeConductors: conductors.filter(
            conductor => conductor.status === 'active'
          ).length,
          totalRevenue,
          totalTickets
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg">NorthPoint Passenger</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-maroon-600 text-[10px] font-medium text-white flex items-center justify-center">
              2
            </span>
          </Button> */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    //logout
                    signOut();
                  }}
                  className="text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 container max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-maroon-800">
            Welcome back, {user?.user_metadata?.name || 'Admin'}
          </h2>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your bus management system
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-maroon-700"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-maroon-50 to-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-maroon-700">
                    Total Buses
                  </CardTitle>
                  <div className="p-2 bg-maroon-100 rounded-full">
                    <Bus className="h-6 w-6 text-maroon-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-maroon-900">
                    {stats.totalBuses}
                  </div>
                  <p className="text-sm text-maroon-600 mt-1">
                    {stats.activeBuses} active buses
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">
                    Active Routes
                  </CardTitle>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MapPin className="h-6 w-6 text-blue-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">
                    {stats.activeRoutes}
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Out of {stats.totalRoutes} total routes
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">
                    Conductors
                  </CardTitle>
                  <div className="p-2 bg-green-100 rounded-full">
                    <Users className="h-6 w-6 text-green-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">
                    {stats.totalConductors}
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {stats.activeConductors} active conductors
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-amber-700">
                    Revenue
                  </CardTitle>
                  <div className="p-2 bg-amber-100 rounded-full">
                    <CreditCard className="h-6 w-6 text-amber-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-900">
                    ₱{stats.totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-sm text-amber-600 mt-1">
                    Total revenue to date
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-maroon-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-maroon-800">
                      Conductor Management
                    </CardTitle>
                    <div className="p-2 bg-maroon-100 rounded-full">
                      <Users className="h-8 w-8 text-maroon-700" />
                    </div>
                  </div>
                  <CardDescription>Manage your bus conductors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Total Conductors
                      </span>
                      <span className="text-lg font-bold text-maroon-800">
                        {stats.totalConductors}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active</span>
                      <span className="text-lg font-bold text-green-600">
                        {stats.activeConductors}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Inactive</span>
                      <span className="text-lg font-bold text-gray-500">
                        {stats.totalConductors - stats.activeConductors}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-maroon-700 hover:bg-maroon-800 group">
                    <Link
                      href="/admin/conductors"
                      className="flex items-center justify-center">
                      Manage Conductors
                      <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-blue-800">
                      Route Management
                    </CardTitle>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <MapPin className="h-8 w-8 text-blue-700" />
                    </div>
                  </div>
                  <CardDescription>Manage your bus routes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Routes</span>
                      <span className="text-lg font-bold text-blue-800">
                        {stats.totalRoutes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active</span>
                      <span className="text-lg font-bold text-green-600">
                        {stats.activeRoutes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Inactive</span>
                      <span className="text-lg font-bold text-gray-500">
                        {stats.totalRoutes - stats.activeRoutes}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-blue-700 hover:bg-blue-800 group">
                    <Link
                      href="/admin/routes"
                      className="flex items-center justify-center">
                      Manage Routes
                      <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-green-800">
                      Bus Management
                    </CardTitle>
                    <div className="p-2 bg-green-100 rounded-full">
                      <Bus className="h-8 w-8 text-green-700" />
                    </div>
                  </div>
                  <CardDescription>Manage your bus fleet</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Buses</span>
                      <span className="text-lg font-bold text-green-800">
                        {stats.totalBuses}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active</span>
                      <span className="text-lg font-bold text-green-600">
                        {stats.activeBuses}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Inactive</span>
                      <span className="text-lg font-bold text-gray-500">
                        {stats.totalBuses - stats.activeBuses}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-green-700 hover:bg-green-800 group">
                    <Link
                      href="/admin/buses"
                      className="flex items-center justify-center">
                      Manage Buses
                      <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-amber-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-amber-800">
                      Shift Assignment
                    </CardTitle>
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Calendar className="h-8 w-8 text-amber-700" />
                    </div>
                  </div>
                  <CardDescription>Assign conductors to routes</CardDescription>
                </CardHeader>
                <CardContent className="h-[104px] flex items-center justify-center">
                  <p className="text-center text-muted-foreground">
                    Create and monitor shift assignments
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-amber-700 hover:bg-amber-800 group">
                    <Link
                      href="/admin/assignments"
                      className="flex items-center justify-center">
                      Manage Assignments
                      <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-t-purple-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-purple-800">
                      Conductor Monitoring
                    </CardTitle>
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Users className="h-8 w-8 text-purple-700" />
                    </div>
                  </div>
                  <CardDescription>
                    Monitor conductor activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[104px] flex items-center justify-center">
                  <p className="text-center text-muted-foreground">
                    View time records and performance
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-purple-700 hover:bg-purple-800 group">
                    <Link
                      href="/admin/monitoring"
                      className="flex items-center justify-center">
                      View Monitoring
                      <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
