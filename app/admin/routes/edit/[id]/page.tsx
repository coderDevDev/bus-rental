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
import { ArrowLeft } from 'lucide-react';
import { routeService } from '@/services/route-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditRoutePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState<
    Omit<Route, 'id' | 'created_at' | 'updated_at'>
  >({
    route_number: '',
    name: '',
    from_location: '',
    to_location: '',
    distance: 0,
    base_fare: 0,
    estimated_duration: 0,
    status: 'active'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [route, locationsData] = await Promise.all([
          routeService.getRouteById(params.id),
          routeService.getLocations()
        ]);

        setLocations(locationsData);
        setFormData({
          route_number: route.route_number,
          name: route.name,
          from_location: route.from_location.id,
          to_location: route.to_location.id,
          distance: route.distance,
          base_fare: route.base_fare,
          estimated_duration: route.estimated_duration,
          status: route.status
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
  }, [params.id, router, toast]);

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

      await routeService.updateRoute(params.id, formData);
      toast({
        title: 'Success',
        description: 'Route updated successfully'
      });
      router.push('/admin/routes');
    } catch (error) {
      console.error('Error updating route:', error);
      toast({
        title: 'Error',
        description: 'Failed to update route',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
