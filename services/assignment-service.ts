import { supabase } from '@/lib/supabase/client';
import type { Assignment } from '@/types';

export const assignmentService = {
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
          name,
          user:user_id(name)
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAssignment(id: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select(
        `
        *,
        route:route_id(*),
        bus:bus_id(*),
        conductor:conductor_id(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateAssignment(id: string, data: Partial<Assignment>) {
    try {
      // First check for conflicts if changing dates or resources
      if (
        data.start_date ||
        data.end_date ||
        data.bus_id ||
        data.conductor_id
      ) {
        const { data: conflicts, error: checkError } = await supabase
          .from('assignments')
          .select('id')
          .neq('id', id)
          .or(`bus_id.eq.${data.bus_id},conductor_id.eq.${data.conductor_id}`)
          .eq('status', 'active')
          .overlaps(
            'start_date',
            'end_date',
            data.start_date || '',
            data.end_date || ''
          );

        if (checkError) throw checkError;
        if (conflicts?.length > 0) {
          throw new Error(
            'Bus or conductor already assigned during this time period'
          );
        }
      }

      // Update the assignment
      const { error: updateError } = await supabase
        .from('assignments')
        .update(data)
        .eq('id', id);

      if (updateError) throw updateError;

      // Handle status changes
      if (data.status === 'completed' || data.status === 'cancelled') {
        // Get the current assignment
        const { data: currentAssignment } = await supabase
          .from('assignments')
          .select('conductor_id, bus_id')
          .eq('id', id)
          .single();

        if (currentAssignment) {
          // Clear the conductor's current assignments
          await supabase
            .from('conductors')
            .update({
              current_route_id: null,
              current_bus_id: null
            })
            .eq('id', currentAssignment.conductor_id);

          // Clear the bus's current assignments
          await supabase
            .from('buses')
            .update({
              current_route_id: null,
              current_conductor_id: null
            })
            .eq('id', currentAssignment.bus_id);
        }
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  },

  async deleteAssignment(id: string) {
    const { error } = await supabase.from('assignments').delete().eq('id', id);

    if (error) throw error;
  },

  async getAllAssignments() {
    const { data, error } = await supabase
      .from('assignments')
      .select(
        `
        *,
        conductor:conductor_id (
          id,
          user_id,
          license_number,
          phone,
          status,
          user:user_id (
            id,
            name,
            email
          )
        ),
        bus:bus_id (*),
        route:route_id (*)
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }

    console.log('Fetched assignments:', data);
    return data;
  },

  async getAssignmentById(id: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select(
        `
        *,
        conductor:conductor_id (
          id,
          user_id,
          license_number,
          phone,
          status,
          user:user_id (
            id,
            name,
            email
          )
        ),
        bus:bus_id (*),
        route:route_id (*)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createAssignment(
    assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>
  ) {
    console.log('Creating assignment with data:', assignment);

    const { data, error } = await supabase
      .from('assignments')
      .insert([assignment])
      .select()
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }

    // Update the conductor's current assignments
    await supabase
      .from('conductors')
      .update({
        current_route_id: assignment.route_id,
        current_bus_id: assignment.bus_id
      })
      .eq('id', assignment.conductor_id);

    // Update the bus's current assignments
    await supabase
      .from('buses')
      .update({
        current_route_id: assignment.route_id,
        current_conductor_id: assignment.conductor_id
      })
      .eq('id', assignment.bus_id);

    return data;
  },

  async getAssignmentsByDate(date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('assignments')
      .select(
        `
        *,
        conductor:conductor_id (
          id,
          user_id,
          license_number,
          phone,
          status,
          user:user_id (
            id,
            name,
            email
          )
        ),
        bus:bus_id (*),
        route:route_id (*)
      `
      )
      .gte('start_date', startOfDay.toISOString())
      .lte('start_date', endOfDay.toISOString());

    if (error) throw error;
    return data;
  },

  async getAssignmentsByConductor(conductorId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select(
        `
        *,
        conductor:conductor_id (
          id,
          user_id,
          license_number,
          phone,
          status,
          user:user_id (
            id,
            name,
            email
          )
        ),
        bus:bus_id (*),
        route:route_id (*)
      `
      )
      .eq('conductor_id', conductorId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAssignmentsByBus(busId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select(
        `
        *,
        conductor:conductor_id (
          id,
          user_id,
          license_number,
          phone,
          status,
          user:user_id (
            id,
            name,
            email
          )
        ),
        bus:bus_id (*),
        route:route_id (*)
      `
      )
      .eq('bus_id', busId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAssignmentsByRoute(routeId: string) {
    const { data, error } = await supabase
      .from('assignments')
      .select(
        `
        *,
        conductor:conductor_id (
          id,
          user_id,
          license_number,
          phone,
          status,
          user:user_id (
            id,
            name,
            email
          )
        ),
        bus:bus_id (*),
        route:route_id (*)
      `
      )
      .eq('route_id', routeId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getActiveAssignments() {
    const { data, error } = await supabase
      .from('assignments')
      .select(
        `
        *,
        conductor:conductor_id (
          id,
          user_id,
          license_number,
          phone,
          status,
          user:user_id (
            id,
            name,
            email
          )
        ),
        bus:bus_id (*),
        route:route_id (*)
      `
      )
      .eq('status', 'active')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  }
};
