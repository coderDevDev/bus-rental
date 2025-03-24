import { supabase } from '@/lib/supabase/client';
import type { Route, Bus, Conductor, Assignment } from '@/types';

export const adminService = {
  // Routes
  async getRoutes() {
    const { data, error } = await supabase
      .from('routes')
      .select(
        `
        *,
        from_location:locations!routes_from_location_fkey(city),
        to_location:locations!routes_to_location_fkey(city)
      `
      )
      .eq('status', 'active');

    if (error) throw error;
    return data;
  },

  // Buses
  async getBuses() {
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .eq('status', 'active')
      .order('bus_number');

    if (error) throw error;
    return data;
  },

  // Conductors
  async getConductors() {
    const { data, error } = await supabase
      .from('conductors')
      .select(
        `
        *,
        user:user_id(
          name,
          email
        )
      `
      )
      .eq('status', 'active');

    if (error) throw error;
    return data;
  },

  // Assignments
  async getAssignments() {
    const { data, error } = await supabase
      .from('assignments')
      .select(
        `
        *,
        route:route_id(
          id,
          name,
          from_location:locations!routes_from_location_fkey(city),
          to_location:locations!routes_to_location_fkey(city)
        ),
        bus:bus_id(
          id,
          bus_number,
          bus_type,
          capacity
        ),
        conductor:conductor_id(
          id,
          conductor_id,
          user:user_id(
            name,
            email
          )
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createAssignment(data: {
    route_id: string;
    bus_id: string;
    conductor_id: string;
    start_date: string;
    end_date: string;
    status: string;
  }) {
    try {
      // First check for conflicts
      const { data: conflicts, error: checkError } = await supabase
        .from('assignments')
        .select('id')
        .or(`bus_id.eq.${data.bus_id},conductor_id.eq.${data.conductor_id}`)
        .eq('status', 'active')
        .filter('start_date', 'lte', data.end_date)
        .filter('end_date', 'gte', data.start_date);

      if (checkError) throw checkError;
      if (conflicts?.length > 0) {
        throw new Error(
          'Bus or conductor already assigned during this time period'
        );
      }

      // Create assignment if no conflicts
      const { data: newAssignment, error } = await supabase
        .from('assignments')
        .insert([
          {
            ...data,
            start_date: new Date(data.start_date).toISOString(),
            end_date: new Date(data.end_date).toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update the conductor's current assignments if status is active
      if (data.status === 'active') {
        await supabase
          .from('conductors')
          .update({
            current_route_id: data.route_id,
            current_bus_id: data.bus_id
          })
          .eq('id', data.conductor_id);

        // Update the bus's current assignments
        await supabase
          .from('buses')
          .update({
            current_route_id: data.route_id,
            current_conductor_id: data.conductor_id
          })
          .eq('id', data.bus_id);
      }

      return newAssignment;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  async updateAssignment(
    id: string,
    data: Partial<Omit<Assignment, 'id' | 'created_at' | 'updated_at'>>
  ) {
    const { error } = await supabase
      .from('assignments')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAssignment(id: string) {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) throw error;
  }
};
