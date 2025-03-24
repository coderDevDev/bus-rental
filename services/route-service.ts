import { supabase } from '@/lib/supabase/client';
import type { Route, Location } from '@/types';

export const routeService = {
  async getAllRoutes() {
    const { data, error } = await supabase
      .from('routes')
      .select(
        `
        *,
        from_location:locations!routes_from_location_fkey(
          id,
          city,
          state
        ),
        to_location:locations!routes_to_location_fkey(
          id,
          city,
          state
        ),
        tickets(count)
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getRouteById(id: string) {
    const { data, error } = await supabase
      .from('routes')
      .select(
        `
        *,
        from_location:locations!routes_from_location_fkey(
          id,
          city,
          state
        ),
        to_location:locations!routes_to_location_fkey(
          id,
          city,
          state
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createRoute(
    routeData: Omit<Route, 'id' | 'created_at' | 'updated_at'>
  ) {
    const { data, error } = await supabase
      .from('routes')
      .insert([routeData])
      .select(
        `
        *,
        from_location:locations!routes_from_location_fkey(
          id,
          city,
          state
        ),
        to_location:locations!routes_to_location_fkey(
          id,
          city,
          state
        )
      `
      )
      .single();

    if (error) throw error;
    return data;
  },

  async updateRoute(id: string, updates: Partial<Route>) {
    const { data, error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', id)
      .select(
        `
        *,
        from_location:locations!routes_from_location_fkey(
          id,
          city,
          state
        ),
        to_location:locations!routes_to_location_fkey(
          id,
          city,
          state
        )
      `
      )
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRoute(id: string) {
    // First check if there are any conductors assigned to this route
    const { data: conductors, error: conductorError } = await supabase
      .from('conductors')
      .select('id')
      .eq('current_route_id', id);

    if (conductorError) throw conductorError;

    // If conductors are assigned, update them to remove the route assignment
    if (conductors && conductors.length > 0) {
      const { error: updateError } = await supabase
        .from('conductors')
        .update({ current_route_id: null })
        .eq('current_route_id', id);

      if (updateError) throw updateError;
    }

    // Delete any route schedules
    const { error: scheduleError } = await supabase
      .from('route_schedules')
      .delete()
      .eq('route_id', id);

    if (scheduleError) throw scheduleError;

    // Finally delete the route
    const { error } = await supabase.from('routes').delete().eq('id', id);

    if (error) throw error;
    return true;
  },

  async getActiveRoutes() {
    const { data, error } = await supabase
      .from('routes')
      .select(
        `
        *,
        from_location:locations!routes_from_location_fkey(
          id,
          city,
          state
        ),
        to_location:locations!routes_to_location_fkey(
          id,
          city,
          state
        )
      `
      )
      .eq('status', 'active');

    if (error) throw error;
    return data;
  },

  async addScheduleToRoute(schedule: {
    route_id: string;
    departure_time: string;
    arrival_time: string;
    days_of_week: string[];
    bus_id: string;
    conductor_id: string;
  }) {
    const { data, error } = await supabase
      .from('route_schedules')
      .insert([schedule])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRouteSchedules(routeId: string) {
    const { data, error } = await supabase
      .from('route_schedules')
      .select(
        `
        *,
        bus:bus_id (*),
        conductor:conductor_id (
          *,
          user:user_id (
            name,
            email
          )
        )
      `
      )
      .eq('route_id', routeId);

    if (error) throw error;
    return data;
  },

  async assignBusToRoute(routeId: string, busId: string) {
    // First get the current assigned buses
    const { data: route, error: fetchError } = await supabase
      .from('routes')
      .select('assigned_buses')
      .eq('id', routeId)
      .single();

    if (fetchError) throw fetchError;

    // Update the assigned_buses array
    const assignedBuses = route.assigned_buses || [];
    if (!assignedBuses.includes(busId)) {
      assignedBuses.push(busId);
    }

    // Update the route
    const { data, error } = await supabase
      .from('routes')
      .update({ assigned_buses: assignedBuses })
      .eq('id', routeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeBusFromRoute(routeId: string, busId: string) {
    // First get the current assigned buses
    const { data: route, error: fetchError } = await supabase
      .from('routes')
      .select('assigned_buses')
      .eq('id', routeId)
      .single();

    if (fetchError) throw fetchError;

    // Update the assigned_buses array
    const assignedBuses = (route.assigned_buses || []).filter(
      (id: string) => id !== busId
    );

    // Update the route
    const { data, error } = await supabase
      .from('routes')
      .update({ assigned_buses: assignedBuses })
      .eq('id', routeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLocations() {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('city', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createLocation(
    locationData: Omit<Location, 'id' | 'created_at' | 'updated_at'>
  ) {
    const { data, error } = await supabase
      .from('locations')
      .insert([locationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
