'use client';

import createClientComponent from '@/app/dynamic-wrap';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowRight,
  Edit,
  MapPin,
  MoreHorizontal,
  Search,
  Trash2,
  Route,
  Clock,
  DollarSign
} from 'lucide-react';
import { routeService } from '@/services/route-service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/admin/stat-card';
import type { RouteWithLocations } from '@/types';

function RoutesPage() {
  const [routes, setRoutes] = useState<RouteWithLocations[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<RouteWithLocations | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setIsLoading(true);
      const data = await routeService.getAllRoutes();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load routes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!selectedRoute) return;

    try {
      await routeService.deleteRoute(selectedRoute.id);
      setRoutes(routes.filter(r => r.id !== selectedRoute.id));
      toast({
        title: 'Success',
        description: 'Route deleted successfully'
      });
    } catch (error) {
      console.error(`Error deleting route ${selectedRoute.id}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to delete route',
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedRoute(null);
    }
  };

  const filteredRoutes = routes.filter(
    route =>
      route.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.from_location?.city
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      route.to_location?.city
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      route.route_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRoutes = filteredRoutes.filter(
    route => route.status === 'active'
  );
  const inactiveRoutes = filteredRoutes.filter(
    route => route.status === 'inactive'
  );

  const displayRoutes =
    activeTab === 'all'
      ? filteredRoutes
      : activeTab === 'active'
      ? activeRoutes
      : inactiveRoutes;

  // Calculate route statistics
  const totalDistance = routes.reduce(
    (sum, route) => sum + (route.distance || 0),
    0
  );
  const averageDuration =
    routes.length > 0
      ? Math.round(
          routes.reduce(
            (sum, route) => sum + (route.estimated_duration || 0),
            0
          ) / routes.length
        )
      : 0;
  const averageFare =
    routes.length > 0
      ? (
          routes.reduce((sum, route) => sum + (route.fare || 0), 0) /
          routes.length
        ).toFixed(2)
      : 0;

  const actions = (
    <Button asChild className="ml-auto" size="sm" variant="secondary">
      <Link href="/admin/routes/add">
        <MapPin className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Add Route</span>
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <AdminLayout title="Route Management" actions={actions}>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700"></div>
        </CardContent>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Route Management" actions={actions}>
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-maroon-700 text-2xl">Routes</CardTitle>
          <CardDescription>Manage your bus routes</CardDescription>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <StatCard
            title="Total Routes"
            value={routes.length}
            icon={Route}
            description="All configured routes"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Active Routes"
            value={activeRoutes.length}
            icon={MapPin}
            description="Currently in service"
            iconClassName="bg-green-100"
          />
          <StatCard
            title="Avg. Duration"
            value={`${averageDuration} min`}
            icon={Clock}
            description="Average travel time"
            iconClassName="bg-blue-100"
          />
          <StatCard
            title="Avg. Fare"
            value={`₱${averageFare}`}
            icon={DollarSign}
            description="Average ticket price"
            iconClassName="bg-amber-100"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search routes..."
              className="pl-8 w-full border-maroon-200 focus-visible:ring-maroon-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs
            defaultValue="all"
            className="w-full sm:w-auto"
            onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {filteredRoutes.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                <Badge variant="secondary" className="ml-2">
                  {activeRoutes.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive
                <Badge variant="secondary" className="ml-2">
                  {inactiveRoutes.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-maroon-100">
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <div className="md:hidden">
              {displayRoutes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'No routes found matching your search'
                    : 'No routes found'}
                </div>
              ) : (
                <div className="divide-y divide-maroon-100">
                  {displayRoutes.map(route => (
                    <div key={route.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-maroon-800">
                            {route.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {route.route_number}
                          </p>
                        </div>
                        <Badge
                          className={
                            route.status === 'active'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-500 text-white'
                          }>
                          {route.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <p>
                            {route.from_location?.city},{' '}
                            {route.from_location?.state || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <p>
                            {route.to_location?.city},{' '}
                            {route.to_location?.state || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Distance</p>
                          <p>{route.distance || 'N/A'} km</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p>{route.estimated_duration || 'N/A'} min</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Fare</p>
                          <p>₱{route.fare?.toFixed(2) || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-maroon-200 hover:bg-maroon-50"
                          asChild>
                          <Link href={`/admin/routes/edit/${route.id}`}>
                            <Edit className="h-4 w-4 mr-2 text-maroon-600" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedRoute(route);
                            setIsDeleteDialogOpen(true);
                          }}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Table className="hidden md:table">
              <TableHeader className="bg-maroon-50">
                <TableRow>
                  <TableHead>Route Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Base Fare</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRoutes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {searchQuery
                        ? 'No routes found matching your search'
                        : 'No routes found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayRoutes.map(route => (
                    <TableRow key={route.id} className="hover:bg-maroon-50">
                      <TableCell>{route.route_number}</TableCell>
                      <TableCell className="font-medium text-maroon-800">
                        {route.name}
                      </TableCell>
                      <TableCell>
                        {route.from_location.city}, {route.from_location.state}
                      </TableCell>
                      <TableCell>
                        {route.to_location.city}, {route.to_location.state}
                      </TableCell>
                      <TableCell>{route.distance} km</TableCell>
                      <TableCell>₱{route.base_fare.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            route.status === 'active'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-500 text-white'
                          }>
                          {route.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-maroon-700 hover:bg-maroon-100">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/routes/${route.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/routes/edit/${route.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedRoute(route);
                                setIsDeleteDialogOpen(true);
                              }}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the route {selectedRoute?.name}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteRoute}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

export default createClientComponent(RoutesPage);
