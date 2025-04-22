'use client';

import type React from 'react';
import type { Location, Route } from '@/types';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { routeService } from '@/services/route-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import mapboxgl from 'mapbox-gl';
import mapboxSdk from '@mapbox/mapbox-sdk';
import directionsService from '@mapbox/mapbox-sdk/services/directions';

// Setup Mapbox client
// You'll need to store your Mapbox token in an environment variable
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
mapboxgl.accessToken = MAPBOX_TOKEN;

// Initialize the Mapbox SDK client
const mapboxClient = mapboxSdk({ accessToken: MAPBOX_TOKEN });
const directionsClient = directionsService(mapboxClient);

// Add this near the top to verify MAPBOX_TOKEN is available
console.log('Mapbox token available:', !!MAPBOX_TOKEN);

export default function AddRoutePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState<
    Omit<Route, 'id' | 'created_at' | 'updated_at'>
  >({
    route_number: '',
    name: '',
    from_location: '' as string,
    to_location: '' as string,
    distance: 0,
    base_fare: 0,
    estimated_duration: 0,
    status: 'active'
  });
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({
    city: '',
    state: '',
    country: '',
    latitude: 0,
    longitude: 0
  });

  // Add these states to track calculation
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await routeService.getLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error loading locations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load locations',
          variant: 'destructive'
        });
      }
    };

    loadLocations();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['distance', 'estimated_duration', 'base_fare'].includes(name)
        ? Number.parseFloat(value) || 0
        : value
    }));
  };

  const handleStatusChange = (value: 'active' | 'inactive') => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Find the location objects from their IDs
      const fromLocation = locations.find(l => l.id === formData.from_location);
      const toLocation = locations.find(l => l.id === formData.to_location);

      if (!fromLocation || !toLocation) {
        toast({
          title: 'Validation Error',
          description: 'Selected locations are invalid',
          variant: 'destructive'
        });
        return;
      }

      // Create the route data with Location objects
      const routeData = {
        ...formData,
        from_location: fromLocation, // Replace ID with Location object
        to_location: toLocation // Replace ID with Location object
      };

      await routeService.createRoute(routeData);
      // close the modal
      setIsAddingLocation(false);
      toast({
        title: 'Success',
        description: 'Route added successfully'
      });
      router.push('/admin/routes');
    } catch (error) {
      console.error('Error adding route:', error);
      toast({
        title: 'Error',
        description: 'Failed to add route',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLocation = async () => {
    try {
      // setIsAddingLocation(true);
      const createdLocation = await routeService.createLocation(newLocation);
      setLocations(prev => [...prev, createdLocation]);
      toast({
        title: 'Success',
        description: 'Location added successfully'
      });
      return createdLocation.id;
    } catch (error) {
      console.error('Error creating location:', error);
      toast({
        title: 'Error',
        description: 'Failed to create location',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsAddingLocation(false);
    }
  };

  // Add this helper function to calculate distance using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return parseFloat(distance.toFixed(2));
  };

  // Add this function to estimate duration based on distance
  const estimateDuration = (distance: number): number => {
    // Assuming average speed of 40 km/h for buses
    const averageSpeedKmh = 40;
    const timeHours = distance / averageSpeedKmh;
    const timeMinutes = Math.ceil(timeHours * 60); // Round up to nearest minute
    return timeMinutes;
  };

  // Replace the current useEffect with this enhanced version
  useEffect(() => {
    console.log('Location selection changed:', {
      from: formData.from_location,
      to: formData.to_location,
      fromLocation: locations.find(l => l.id === formData.from_location),
      toLocation: locations.find(l => l.id === formData.to_location)
    });

    // Only calculate if both locations are selected and user hasn't manually entered values
    if (
      formData.from_location &&
      formData.to_location &&
      (formData.distance === 0 || formData.estimated_duration === 0)
    ) {
      const fromLocation = locations.find(l => l.id === formData.from_location);
      const toLocation = locations.find(l => l.id === formData.to_location);

      if (fromLocation && toLocation) {
        console.log(
          'Attempting to calculate route between:',
          fromLocation,
          toLocation
        );
        calculateRouteWithMapbox(fromLocation, toLocation);
      }
    }
  }, [
    formData.from_location,
    formData.to_location,
    locations,
    formData.distance,
    formData.estimated_duration
  ]);

  // Add this function to calculate route using Mapbox
  const calculateRouteWithMapbox = async (
    fromLocation: Location,
    toLocation: Location
  ) => {
    try {
      setIsCalculatingRoute(true);
      setCalculationError(null);

      // Ensure we have valid coordinates
      if (
        !fromLocation.latitude ||
        !fromLocation.longitude ||
        !toLocation.latitude ||
        !toLocation.longitude
      ) {
        throw new Error('Invalid location coordinates');
      }

      // First check if the straight-line distance is likely to exceed Mapbox's limit
      const straightLineDistance = calculateDistance(
        fromLocation.latitude,
        fromLocation.longitude,
        toLocation.latitude,
        toLocation.longitude
      );

      // If the straight-line distance is already over 350km, don't even try the API call
      // (Using 350km as a safety margin below the ~400km API limit)
      if (straightLineDistance > 350) {
        throw new Error('Distance exceeds Mapbox API limitations (400km max)');
      }

      // Call Mapbox Directions API
      const response = await directionsClient
        .getDirections({
          profile: 'driving-traffic', // Use 'driving-traffic' for most accurate bus travel times
          waypoints: [
            { coordinates: [fromLocation.longitude, fromLocation.latitude] },
            { coordinates: [toLocation.longitude, toLocation.latitude] }
          ],
          geometries: 'geojson'
        })
        .send();

      if (response && response.body.routes && response.body.routes.length > 0) {
        const route = response.body.routes[0];

        // Get distance in kilometers (Mapbox returns distance in meters)
        const distance = parseFloat((route.distance / 1000).toFixed(2));

        // Get duration in minutes (Mapbox returns duration in seconds)
        // For bus routes, add 20% to the normal driving time to account for stops
        const durationSeconds = route.duration * 1.2;
        const duration = Math.ceil(durationSeconds / 60);

        // Update form data
        setFormData(prev => ({
          ...prev,
          distance: prev.distance === 0 ? distance : prev.distance,
          estimated_duration:
            prev.estimated_duration === 0 ? duration : prev.estimated_duration
        }));
      } else {
        throw new Error('No route found between locations');
      }
    } catch (error) {
      console.error('Error calculating route:', error);

      // Check if the error is related to the distance limitation
      let errorMessage = 'Failed to calculate route';
      if (error instanceof Error) {
        errorMessage = error.message;
        if (
          errorMessage.includes('exceeds maximum distance') ||
          errorMessage.includes('exceeds Mapbox API limitations')
        ) {
          errorMessage = 'Route distance exceeds Mapbox API limit of 400km';
        }
      }

      setCalculationError(errorMessage);

      // Fall back to Haversine calculation for any error
      const distance = calculateDistance(
        fromLocation.latitude,
        fromLocation.longitude,
        toLocation.latitude,
        toLocation.longitude
      );

      // For the fallback, use a lower average speed for long distances
      // to get a more realistic time estimate
      const averageSpeed = distance > 100 ? 60 : 40; // 60 km/h for highways, 40 km/h for local routes
      const duration = Math.ceil((distance / averageSpeed) * 60); // Convert to minutes

      setFormData(prev => ({
        ...prev,
        distance: prev.distance === 0 ? distance : prev.distance,
        estimated_duration:
          prev.estimated_duration === 0 ? duration : prev.estimated_duration
      }));
    } finally {
      setIsCalculatingRoute(false);
    }
  };

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
            Add New Route
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
            <CardDescription>
              Enter the details of the new route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="route_number">Route Number</Label>
                  <Input
                    id="route_number"
                    name="route_number"
                    value={formData.route_number}
                    onChange={handleChange}
                    placeholder="Will be auto-generated if left empty"
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
                  <div className="flex justify-between items-center">
                    <Label htmlFor="from_location">From Location</Label>
                    <Dialog
                      open={isAddingLocation}
                      onOpenChange={setIsAddingLocation}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Location
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Location</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={newLocation.city}
                              onChange={e =>
                                setNewLocation(prev => ({
                                  ...prev,
                                  city: e.target.value
                                }))
                              }
                              placeholder="Enter city name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                              id="state"
                              value={newLocation.state}
                              onChange={e =>
                                setNewLocation(prev => ({
                                  ...prev,
                                  state: e.target.value
                                }))
                              }
                              placeholder="Enter state/province"
                            />
                          </div>
                          {/* <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              value={newLocation.country}
                              onChange={e =>
                                setNewLocation(prev => ({
                                  ...prev,
                                  country: e.target.value
                                }))
                              }
                              placeholder="Enter country"
                            />
                          </div> */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="latitude">Latitude</Label>
                              <Input
                                id="latitude"
                                type="number"
                                step="0.000001"
                                value={newLocation.latitude}
                                onChange={e =>
                                  setNewLocation(prev => ({
                                    ...prev,
                                    latitude: Number(e.target.value)
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="longitude">Longitude</Label>
                              <Input
                                id="longitude"
                                type="number"
                                step="0.000001"
                                value={newLocation.longitude}
                                onChange={e =>
                                  setNewLocation(prev => ({
                                    ...prev,
                                    longitude: Number(e.target.value)
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleAddLocation}
                          // disabled={isAddingLocation}
                          className="w-full">
                          {/* {isAddingLocation ? 'Adding...' : 'Add Location'} */}
                          Add Location
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select
                    value={formData.from_location}
                    onValueChange={value => {
                      console.log('From location changed to:', value);
                      setFormData(prev => ({
                        ...prev,
                        from_location: value,
                        // Reset distance and duration when changing location to ensure recalculation
                        ...(prev.distance === 0 && { distance: 0 }),
                        ...(prev.estimated_duration === 0 && {
                          estimated_duration: 0
                        })
                      }));
                    }}>
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
                    onValueChange={value => {
                      console.log('To location changed to:', value);
                      setFormData(prev => ({
                        ...prev,
                        to_location: value,
                        // Reset distance and duration when changing location to ensure recalculation
                        ...(prev.distance === 0 && { distance: 0 }),
                        ...(prev.estimated_duration === 0 && {
                          estimated_duration: 0
                        })
                      }));
                    }}>
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
                  <div className="relative">
                    <Input
                      id="distance"
                      name="distance"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.distance}
                      onChange={handleChange}
                      placeholder="Auto-calculated from locations"
                      required
                    />
                    {isCalculatingRoute && (
                      <div className="absolute right-3 top-2.5">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-maroon-700 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  {formData.from_location &&
                    formData.to_location &&
                    formData.distance === 0 &&
                    !isCalculatingRoute && (
                      <p className="text-xs text-muted-foreground">
                        Will be automatically calculated when both locations are
                        selected
                      </p>
                    )}
                  {calculationError && (
                    <p className="text-xs text-red-500">
                      {calculationError}.{' '}
                      {calculationError.includes('limit')
                        ? 'Using straight-line distance with highway speed estimates.'
                        : 'Using straight-line distance instead.'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_duration">
                    Estimated Duration (minutes)
                  </Label>
                  <div className="relative">
                    <Input
                      id="estimated_duration"
                      name="estimated_duration"
                      type="number"
                      min="0"
                      value={formData.estimated_duration}
                      onChange={handleChange}
                      placeholder="Auto-calculated from distance"
                      required
                    />
                    {isCalculatingRoute && (
                      <div className="absolute right-3 top-2.5">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-maroon-700 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  {formData.from_location &&
                    formData.to_location &&
                    formData.estimated_duration === 0 &&
                    !isCalculatingRoute && (
                      <p className="text-xs text-muted-foreground">
                        Will be automatically calculated based on road distance
                        and traffic conditions
                      </p>
                    )}
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
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/routes')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Route'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
