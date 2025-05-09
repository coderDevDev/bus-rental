'use client';

import type React from 'react';
import type { Location, Route, RouteStop } from '@/types';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, PlusCircle, Grip, X } from 'lucide-react';
import { routeService } from '@/services/route-service';
import { Skeleton } from '@/components/ui/skeleton';
import { RouteMap } from '@/components/map/RouteMap';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface PageProps {
  params: Promise<{ id: string }>;
}

// First, add proper type for the form data
interface RouteFormData {
  id: string;
  route_number: string;
  name: string;
  stops: RouteStop[];
  distance: number;
  base_fare: number;
  estimated_duration: number;
  status: 'active' | 'inactive';
}

export default function EditRoutePage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const { id } = use(params);
  const [formData, setFormData] = useState<RouteFormData>({
    id: '',
    route_number: '',
    name: '',
    stops: [],
    distance: 0,
    base_fare: 0,
    estimated_duration: 0,
    status: 'active'
  });

  // Add new state for stops management
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [route, locationsData] = await Promise.all([
          routeService.getRouteById(id),
          routeService.getLocations()
        ]);

        setLocations(locationsData);

        setFormData({
          id: route.id || '',
          route_number: route.route_number || '',
          name: route.name || '',
          stops: route.stops || [],
          distance: route.distance || 0,
          base_fare: route.base_fare || 0,
          estimated_duration: route.estimated_duration || 0,
          status: route.status || 'active'
        });
      } catch (error) {
        console.error('Error loading route:', error);
        toast({
          title: 'Error',
          description: 'Failed to load route details',
          variant: 'destructive'
        });
        router.push('/admin/routes');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, router, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['distance', 'estimated_duration', 'base_fare'].includes(name)
        ? Number.parseFloat(value) || 0
        : value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as 'active' | 'inactive'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate required fields
      if (!formData.id || !formData.route_number || !formData.name) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      // Validate stops
      if (!formData.stops || formData.stops.length < 2) {
        toast({
          title: 'Error',
          description: 'Route must have at least 2 stops',
          variant: 'destructive'
        });
        return;
      }

      // Validate that all stops have valid location IDs
      const invalidStop = formData.stops.find(
        stop => !stop.location?.id || typeof stop.location.id !== 'string'
      );
      if (invalidStop) {
        toast({
          title: 'Error',
          description: 'All stops must have valid locations',
          variant: 'destructive'
        });
        return;
      }

      // Prepare route data for update
      const routeData = {
        id: formData.id,
        route_number: formData.route_number,
        name: formData.name,
        distance: formData.distance,
        base_fare: formData.base_fare,
        estimated_duration: formData.estimated_duration,
        status: formData.status,
        stops: formData.stops.map((stop, index) => ({
          location_id: stop.location.id,
          stop_number: index + 1,
          arrival_offset: stop.arrivalOffset
        }))
      };

      await routeService.updateRoute(id, routeData);

      toast({
        title: 'Success',
        description: 'Route updated successfully'
      });
      router.push('/admin/routes');
    } catch (error) {
      console.error('Error updating route:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update route',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Convert point-to-point route to stops format if needed
  const getRouteStops = () => {
    if (formData.stops?.length > 0) {
      return formData.stops;
    }

    if (formData.from_location && formData.to_location) {
      return [
        {
          location: locations.find(
            l => l.id === formData.from_location
          ) as Location,
          stopNumber: 1,
          arrivalOffset: 0
        },
        {
          location: locations.find(
            l => l.id === formData.to_location
          ) as Location,
          stopNumber: 2,
          arrivalOffset: formData.estimated_duration
        }
      ];
    }

    return [];
  };

  const handleAddStop = () => {
    if (!selectedLocation) {
      toast({
        title: 'Error',
        description: 'Please select a location',
        variant: 'destructive'
      });
      return;
    }

    const location = locations.find(l => l.id === selectedLocation);
    if (!location) {
      toast({
        title: 'Error',
        description: 'Invalid location selected',
        variant: 'destructive'
      });
      return;
    }

    const newStop: RouteStop = {
      location,
      stopNumber: formData.stops.length + 1,
      arrivalOffset:
        formData.stops.length === 0 ? 0 : formData.estimated_duration
    };

    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
    setSelectedLocation('');
  };

  const handleRemoveStop = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops?.filter((_, i) => i !== index) || []
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const stops = Array.from(formData.stops || []);
    const [reorderedStop] = stops.splice(result.source.index, 1);
    stops.splice(result.destination.index, 0, reorderedStop);

    // Update stop numbers
    const updatedStops = stops.map((stop, index) => ({
      ...stop,
      stopNumber: index + 1
    }));

    setFormData(prev => ({
      ...prev,
      stops: updatedStops
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b sticky top-0 bg-primary text-primary-foreground z-10">
          <div className="container flex items-center h-14 px-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="text-primary-foreground">
              <Link href="/admin/routes">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">
              <Skeleton className="h-6 w-32" />
            </h1>
          </div>
        </header>

        <main className="flex-1 p-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-8 w-48" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-64" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-primary text-primary-foreground z-10">
        <div className="container flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-primary-foreground">
            <Link href="/admin/routes">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">
            Edit Route
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
            <CardDescription>Update route details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Add map at the top */}
              {/* <div className="border rounded-lg overflow-hidden">
                <RouteMap stops={getRouteStops()} className="h-[400px]" />
              </div> */}

              {/* Basic route info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="route_number">Route Number</Label>
                  <Input
                    id="route_number"
                    name="route_number"
                    value={formData.route_number}
                    onChange={handleChange}
                    disabled // Route number shouldn't be changed
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Route Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_location">From Location</Label>
                  <Select
                    value={formData.from_location}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, from_location: value }))
                    }>
                    <SelectTrigger id="from_location">
                      <SelectValue placeholder="Select starting location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.city}, {location.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to_location">To Location</Label>
                  <Select
                    value={formData.to_location}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, to_location: value }))
                    }>
                    <SelectTrigger id="to_location">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.city}, {location.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    id="distance"
                    name="distance"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.distance}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_duration">
                    Estimated Duration (minutes)
                  </Label>
                  <Input
                    id="estimated_duration"
                    name="estimated_duration"
                    type="number"
                    min="0"
                    value={formData.estimated_duration}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_fare">Base Fare (₱)</Label>
                  <Input
                    id="base_fare"
                    name="base_fare"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.base_fare}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={handleStatusChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stops management */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Route Stops</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedLocation}
                      onValueChange={setSelectedLocation}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(location => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.city}, {location.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={handleAddStop}
                      disabled={!selectedLocation}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Stop
                    </Button>
                  </div>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="stops">
                    {provided => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2">
                        {getRouteStops().map((stop, index) => (
                          <Draggable
                            key={stop.location.id}
                            draggableId={stop.location.id}
                            index={index}>
                            {provided => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                                <div {...provided.dragHandleProps}>
                                  <Grip className="h-4 w-4" />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {stop.location.city}, {stop.location.state}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {index === 0
                                      ? 'Starting Point'
                                      : `+${stop.arrivalOffset} mins`}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveStop(index)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/routes')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
