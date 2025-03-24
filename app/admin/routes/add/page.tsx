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
      // Validate required fields
      if (!formData.name || !formData.from_location || !formData.to_location) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }

      // Validate locations are different
      if (formData.from_location === formData.to_location) {
        toast({
          title: 'Validation Error',
          description: 'Start and end locations must be different',
          variant: 'destructive'
        });
        return;
      }

      await routeService.createRoute(formData);
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
      setIsAddingLocation(true);
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
                    <Dialog>
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
                          <div className="space-y-2">
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
                          </div>
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
                          disabled={isAddingLocation}
                          className="w-full">
                          {isAddingLocation ? 'Adding...' : 'Add Location'}
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
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
