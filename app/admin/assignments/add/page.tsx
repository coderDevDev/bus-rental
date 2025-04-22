'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { assignmentService } from '@/services/assignment-service';
import { conductorService } from '@/services/conductor-service';
import { busService } from '@/services/bus-service';
import { routeService } from '@/services/route-service';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { adminService } from '@/services/admin-service';
import type { Route, Bus, Conductor } from '@/types';
import ClientOnly from '@/components/client-only';

const formSchema = z.object({
  route_id: z.string().min(1, 'Route is required'),
  bus_id: z.string().min(1, 'Bus is required'),
  conductor_id: z.string().min(1, 'Conductor is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.enum(['active', 'scheduled', 'completed', 'cancelled'])
});

export default function AddAssignment() {
  return (
    <ClientOnly>
      <AddAssignmentPage />
    </ClientOnly>
  );
}

function AddAssignmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [conductors, setConductors] = useState<Conductor[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'active',
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 8 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16)
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [routesData, busesData, conductorsData] = await Promise.all([
          adminService.getRoutes(),
          adminService.getBuses(),
          adminService.getConductors()
        ]);
        setRoutes(routesData);
        setBuses(busesData);
        setConductors(conductorsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load form data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log({ values });
      await adminService.createAssignment(values);
      toast({
        title: 'Success',
        description: 'Assignment created successfully'
      });
      router.push('/admin/assignments');
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to create assignment',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Create Assignment" backHref="/admin/assignments">
        <CardHeader>
          <CardTitle className="text-maroon-700 text-2xl">
            <Skeleton className="h-8 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Create Assignment" backHref="/admin/assignments">
      <CardHeader>
        <CardTitle className="text-maroon-700 text-2xl">
          Create New Assignment
        </CardTitle>
        <CardDescription>Assign a conductor to a route and bus</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="route_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route</FormLabel>
                    <FormControl>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a route" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {routes.map(route => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.name} ({route.from_location.city} to{' '}
                              {route.to_location.city})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bus_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bus</FormLabel>
                    <FormControl>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a bus" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {buses.map(bus => (
                            <SelectItem key={bus.id} value={bus.id}>
                              {bus.bus_number} - {bus.bus_type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conductor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conductor</FormLabel>
                    <FormControl>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a conductor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conductors.map(conductor => (
                            <SelectItem key={conductor.id} value={conductor.id}>
                              {conductor.user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Create Assignment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </AdminLayout>
  );
}
