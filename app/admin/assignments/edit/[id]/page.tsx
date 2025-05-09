'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { AdminLayout } from '@/components/admin/admin-layout';
import { assignmentService } from '@/services/assignment-service';
import { adminService } from '@/services/admin-service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Route, Bus, Conductor, Assignment } from '@/types';

const formSchema = z
  .object({
    route_id: z.string().min(1, 'Route is required'),
    bus_id: z.string().min(1, 'Bus is required'),
    conductor_id: z.string().min(1, 'Conductor is required'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    status: z.enum(['active', 'completed', 'cancelled'])
  })
  .refine(data => new Date(data.end_date) > new Date(data.start_date), {
    message: 'End date must be after start date',
    path: ['end_date']
  });

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditAssignmentPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [conductors, setConductors] = useState<Conductor[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const { id } = use(params);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [assignmentData, routesData, busesData, conductorsData] =
          await Promise.all([
            assignmentService.getAssignment(id),
            adminService.getRoutes(),
            adminService.getBuses(),
            adminService.getConductors()
          ]);

        console.log('Loaded conductors:', conductorsData);

        setAssignment(assignmentData);
        setRoutes(routesData);
        setBuses(busesData);
        setConductors(conductorsData);

        // Set form default values
        form.reset({
          route_id: assignmentData.route_id,
          bus_id: assignmentData.bus_id,
          conductor_id: assignmentData.conductor_id,
          start_date: assignmentData.start_date.slice(0, 16),
          end_date: assignmentData.end_date.slice(0, 16),
          status: assignmentData.status
        });
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load assignment data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, form, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Parse dates for validation and formatting
      const startDateObj = new Date(values.start_date);
      const endDateObj = new Date(values.end_date);

      // Validate that end date is after start date
      if (endDateObj <= startDateObj) {
        toast({
          title: 'Validation Error',
          description: 'End date must be after start date',
          variant: 'destructive'
        });
        return;
      }

      // Format dates properly for PostgreSQL
      const startDate = startDateObj.toISOString();
      const endDate = endDateObj.toISOString();

      // Create update object with valid dates
      const updateData: Partial<Assignment> = {
        route_id: values.route_id,
        bus_id: values.bus_id,
        conductor_id: values.conductor_id,
        start_date: startDate,
        end_date: endDate,
        status: values.status
      };

      console.log('Sending update with datass:', updateData);

      await assignmentService.updateAssignment(id, updateData);
      toast({
        title: 'Success',
        description: 'Assignment updated successfully'
      });
      router.push('/admin/assignments');
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update assignment',
        variant: 'destructive'
      });
    }
  };

  return (
    <AdminLayout title="Edit Assignment" backHref="/admin/assignments">
      <CardHeader>
        <CardTitle>Edit Assignment</CardTitle>
        <CardDescription>Update assignment details</CardDescription>
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
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select route" />
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
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bus" />
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
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select conductor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conductors.map(conductor => (
                          <SelectItem key={conductor.id} value={conductor.id}>
                            {conductor.user?.name || conductor.conductor_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                Update Assignment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </AdminLayout>
  );
}
