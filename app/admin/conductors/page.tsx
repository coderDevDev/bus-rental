'use client';

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
  Edit,
  MoreHorizontal,
  Phone,
  Search,
  Trash2,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { conductorService } from '@/services/conductor-service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/admin/stat-card';
import { adminService } from '@/services/admin-service';
import { supabase } from '@/lib/supabase/client';
import { assignmentService } from '@/services/assignment-service';

export default function ConductorsPage() {
  const [conductors, setConductors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConductor, setSelectedConductor] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadConductors();
  }, []);

  const loadConductors = async () => {
    try {
      setIsLoading(true);
      const data = await conductorService.getAllConductors();
      setConductors(data);
    } catch (error) {
      console.error('Error fetching conductors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conductors',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTicketWithDependencies = async (ticketId: string) => {
    console.log(`Working with ticket ${ticketId}`);

    try {
      // First check what ratings exist
      const { data: ratings, error: checkError } = await supabase
        .from('journey_ratings')
        .select('id, ticket_id, created_at')
        .eq('ticket_id', ticketId);

      if (checkError) {
        console.error(
          `Error fetching ratings for ticket ${ticketId}:`,
          checkError
        );
      } else {
        console.log(
          `Found ${ratings?.length || 0} ratings for ticket ${ticketId}:`,
          ratings
        );

        // Try updating instead of deleting to break the foreign key constraint
        if (ratings && ratings.length > 0) {
          console.log(
            `Attempting to update ticket_id to null for ${ratings.length} ratings`
          );

          const { error: updateError } = await supabase
            .from('journey_ratings')
            .update({ ticket_id: null })
            .eq('ticket_id', ticketId);

          if (updateError) {
            console.error(`Failed to update ticket_id to null:`, updateError);
            throw updateError;
          }

          console.log(
            `Successfully updated ratings to break foreign key reference`
          );
        }
      }
    } catch (error) {
      console.error(`Critical error handling journey ratings:`, error);
      throw error;
    }
  };

  const confirmDeleteConductor = async (conductorId: string) => {
    try {
      setIsLoading(true);

      // First check if the conductor has any assignments
      const assignmentsData = await assignmentService.getAssignmentsByConductor(
        conductorId
      );

      // Check for tickets directly linked to the conductor
      const { data: conductorTickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id')
        .eq('conductor_id', conductorId);

      if (ticketsError) {
        console.error('Error fetching conductor tickets:', ticketsError);
        throw ticketsError;
      }

      // Calculate total number of records to be deleted
      const totalTickets = conductorTickets?.length || 0;
      const totalAssignments = assignmentsData?.length || 0;
      const activeAssignments =
        assignmentsData?.filter(a => a.status === 'active') || [];
      const hasActiveAssignments = activeAssignments.length > 0;

      // Create a detailed warning message
      let warningMessage = `This conductor has ${totalTickets} tickets and ${totalAssignments} assignment(s) in the system.`;

      if (hasActiveAssignments) {
        warningMessage += ` WARNING: ${activeAssignments.length} of these assignments are currently ACTIVE.`;
      }

      warningMessage += ` Deleting this conductor will remove all their tickets, assignment history, time records, and may affect ongoing operations.`;
      warningMessage += ` Are you absolutely sure you want to proceed?`;

      const confirmed = window.confirm(warningMessage);

      if (!confirmed) {
        setIsLoading(false);
        setIsDeleteDialogOpen(false);
        return;
      }

      // Delete all tickets associated with this conductor
      if (conductorTickets && conductorTickets.length > 0) {
        // First delete all dependencies for each ticket
        for (const ticket of conductorTickets) {
          await deleteTicketWithDependencies(ticket.id);
        }

        // Then delete the tickets themselves
        const { error: deleteTicketsError } = await supabase
          .from('tickets')
          .delete()
          .eq('conductor_id', conductorId);

        if (deleteTicketsError) {
          console.error(
            'Error deleting conductor tickets:',
            deleteTicketsError
          );
          throw deleteTicketsError;
        }
      }

      // Now handle assignments and their dependent records
      if (assignmentsData && assignmentsData.length > 0) {
        for (const assignment of assignmentsData) {
          // 1. Delete tickets associated with this assignment
          const { data: assignmentTickets, error: fetchTicketsError } =
            await supabase
              .from('tickets')
              .select('id')
              .eq('assignment_id', assignment.id);

          if (fetchTicketsError) {
            console.error(
              'Error fetching assignment tickets:',
              fetchTicketsError
            );
            throw fetchTicketsError;
          }

          // Delete dependencies for each ticket
          if (assignmentTickets && assignmentTickets.length > 0) {
            for (const ticket of assignmentTickets) {
              await deleteTicketWithDependencies(ticket.id);
            }

            // Then delete the tickets
            const { error: assignmentTicketsError } = await supabase
              .from('tickets')
              .delete()
              .eq('assignment_id', assignment.id);

            if (assignmentTicketsError) {
              console.error(
                'Error deleting assignment tickets:',
                assignmentTicketsError
              );
              throw assignmentTicketsError;
            }
          }

          // 2. Delete location updates associated with this assignment
          const { error: locationUpdatesError } = await supabase
            .from('location_updates')
            .delete()
            .eq('assignment_id', assignment.id);

          if (locationUpdatesError) {
            console.error(
              'Error deleting location updates:',
              locationUpdatesError
            );
            throw locationUpdatesError;
          }

          // 3. Delete time records associated with this assignment
          const { error: timeRecordsError } = await supabase
            .from('time_records')
            .delete()
            .eq('assignment_id', assignment.id);

          if (timeRecordsError) {
            console.error('Error deleting time records:', timeRecordsError);
            throw timeRecordsError;
          }

          // 4. Finally delete the assignment
          await assignmentService.deleteAssignment(assignment.id);
        }
      }

      // Now delete the conductor
      await conductorService.deleteConductor(conductorId);

      // Update the UI
      setConductors(
        conductors.filter(conductor => conductor.id !== conductorId)
      );

      toast({
        title: 'Success',
        description: 'Conductor deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting conductor:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete conductor',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedConductor(null);
    }
  };

  const handleDeleteConductor = (conductor: any) => {
    setSelectedConductor(conductor);
    setIsDeleteDialogOpen(true);
  };

  const filteredConductors = conductors.filter(
    conductor =>
      conductor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conductor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conductor.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conductor.conductor_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConductors = filteredConductors.filter(
    conductor => conductor.status === 'active'
  );
  const inactiveConductors = filteredConductors.filter(
    conductor => conductor.status === 'inactive'
  );
  const onLeaveConductors = filteredConductors.filter(
    conductor => conductor.status === 'on_leave'
  );

  const displayConductors =
    activeTab === 'all'
      ? filteredConductors
      : activeTab === 'active'
      ? activeConductors
      : activeTab === 'inactive'
      ? inactiveConductors
      : onLeaveConductors;

  // Calculate average experience
  const totalExperience = conductors.reduce(
    (sum, conductor) => sum + (conductor.experience_years || 0),
    0
  );
  const averageExperience =
    conductors.length > 0
      ? (totalExperience / conductors.length).toFixed(1)
      : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'on_leave':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  const actions = (
    <Button asChild className="ml-auto" size="sm" variant="secondary">
      <Link href="/admin/conductors/add">
        <UserPlus className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Add Conductor</span>
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <AdminLayout title="Conductor Management" actions={actions}>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700"></div>
        </CardContent>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Conductor Management" actions={actions}>
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-maroon-700 text-2xl">Conductors</CardTitle>
          <CardDescription>Manage your bus conductors</CardDescription>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <StatCard
            title="Total Conductors"
            value={conductors.length}
            icon={Users}
            description="All registered conductors"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Conductors"
            value={activeConductors.length}
            icon={UserCheck}
            description="Currently on duty"
            iconClassName="bg-green-100"
          />
          <StatCard
            title="On Leave"
            value={onLeaveConductors.length}
            icon={UserX}
            description="Temporarily unavailable"
            iconClassName="bg-amber-100"
          />
          <StatCard
            title="Avg. Experience"
            value={`${averageExperience} years`}
            icon={Clock}
            description="Average conductor experience"
            iconClassName="bg-blue-100"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conductors..."
              className="pl-8 w-full border-maroon-200 focus-visible:ring-maroon-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs
            defaultValue="all"
            className="w-full sm:w-auto"
            onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {filteredConductors.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                <Badge variant="secondary" className="ml-2">
                  {activeConductors.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Inactive
                <Badge variant="secondary" className="ml-2">
                  {inactiveConductors.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="on_leave">
                On Leave
                <Badge variant="secondary" className="ml-2">
                  {onLeaveConductors.length}
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
              {displayConductors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'No conductors found matching your search'
                    : 'No conductors found'}
                </div>
              ) : (
                <div className="divide-y divide-maroon-100">
                  {displayConductors.map(conductor => (
                    <div key={conductor.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-maroon-800">
                            {conductor.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {conductor.email}
                          </p>
                        </div>
                        <Badge
                          className={`${getStatusColor(
                            conductor.status
                          )} text-white`}>
                          {conductor.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <p>{conductor.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">License</p>
                          <p>{conductor.license_number}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">ID</p>
                          <p>{conductor.conductor_id}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Experience</p>
                          <p>{conductor.experience_years} years</p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-maroon-200 hover:bg-maroon-50"
                          asChild>
                          <Link href={`/admin/conductors/edit/${conductor.id}`}>
                            <Edit className="h-4 w-4 mr-2 text-maroon-600" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteConductor(conductor)}>
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
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    License
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Experience
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayConductors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchQuery
                        ? 'No conductors found matching your search'
                        : 'No conductors found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayConductors.map(conductor => (
                    <TableRow key={conductor.id} className="hover:bg-maroon-50">
                      <TableCell className="font-medium text-maroon-800">
                        {conductor.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {conductor.email}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {conductor.phone}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {conductor.license_number}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {conductor.experience_years} years
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusColor(
                            conductor.status
                          )} text-white`}>
                          {conductor.status?.replace('_', ' ')}
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
                              <Link href={`/admin/conductors/${conductor.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/conductors/edit/${conductor.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteConductor(conductor)}>
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
              This will permanently delete the conductor{' '}
              {selectedConductor?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                confirmDeleteConductor(selectedConductor?.id || '')
              }>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
