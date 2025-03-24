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
  Calendar,
  Edit,
  MoreHorizontal,
  Search,
  Trash2,
  User,
  Bus,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  MapPin
} from 'lucide-react';
import { assignmentService } from '@/services/assignment-service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/admin/stat-card';
import { adminService } from '@/services/admin-service';
import type { Assignment } from '@/types';
import { useRouter } from 'next/navigation';

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadAssignments();
  }, [toast]);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignments',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      await assignmentService.deleteAssignment(selectedAssignment.id);
      setAssignments(assignments.filter(a => a.id !== selectedAssignment.id));
      toast({
        title: 'Success',
        description: 'Assignment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete assignment',
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedAssignment(null);
    }
  };

  const filteredAssignments = assignments.filter(
    assignment =>
      (assignment.route?.name || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (assignment.bus?.bus_number || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (assignment.conductor?.user?.name || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const activeAssignments = filteredAssignments.filter(
    assignment => assignment.status === 'active'
  );
  const scheduledAssignments = filteredAssignments.filter(
    assignment => assignment.status === 'scheduled'
  );
  const completedAssignments = filteredAssignments.filter(
    assignment => assignment.status === 'completed'
  );
  const cancelledAssignments = filteredAssignments.filter(
    assignment => assignment.status === 'cancelled'
  );

  const displayAssignments =
    activeTab === 'all'
      ? filteredAssignments
      : activeTab === 'active'
      ? activeAssignments
      : activeTab === 'scheduled'
      ? scheduledAssignments
      : activeTab === 'completed'
      ? completedAssignments
      : cancelledAssignments;

  // Calculate assignment statistics
  const totalHours = assignments.reduce((sum, assignment) => {
    const start = new Date(assignment.start_date).getTime();
    const end = new Date(assignment.end_date).getTime();
    return sum + (end - start) / (1000 * 60 * 60);
  }, 0);

  const averageShiftLength =
    activeAssignments.length > 0
      ? (
          activeAssignments.reduce((sum, assignment) => {
            const start = new Date(assignment.start_date).getTime();
            const end = new Date(assignment.end_date).getTime();
            return sum + (end - start) / (1000 * 60 * 60);
          }, 0) / activeAssignments.length
        ).toFixed(1)
      : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500 text-white">Scheduled</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500 text-white">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  const actions = (
    <Button asChild className="ml-auto" size="sm" variant="secondary">
      <Link href="/admin/assignments/add">
        <Plus className="mr-2 h-4 w-4" />
        Add Assignment
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <AdminLayout title="Shift Assignments" actions={actions}>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700"></div>
        </CardContent>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Shift Assignments" actions={actions}>
      <CardHeader className="space-y-4">
        <div>
          <CardTitle className="text-maroon-700 text-2xl">
            Shift Assignments
          </CardTitle>
          <CardDescription>Manage conductor shift assignments</CardDescription>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <StatCard
            title="Total Assignments"
            value={assignments.length}
            icon={Calendar}
            description="All time assignments"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Active Shifts"
            value={activeAssignments.length}
            icon={CheckCircle}
            description="Currently on duty"
            iconClassName="bg-green-100"
          />
          <StatCard
            title="Avg. Shift Length"
            value={`${averageShiftLength} hrs`}
            icon={Clock}
            description="Average active shift duration"
            iconClassName="bg-blue-100"
          />
          <StatCard
            title="Upcoming Shifts"
            value={scheduledAssignments.length}
            icon={AlertCircle}
            description="Scheduled for future"
            iconClassName="bg-amber-100"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search assignments..."
              className="pl-8 w-full border-maroon-200 focus-visible:ring-maroon-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs
            defaultValue="all"
            className="w-full sm:w-auto"
            onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full sm:w-auto">
              <TabsTrigger value="all">
                All
                <Badge variant="secondary" className="ml-2">
                  {filteredAssignments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active">
                Active
                <Badge variant="secondary" className="ml-2">
                  {activeAssignments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="scheduled">
                Scheduled
                <Badge variant="secondary" className="ml-2">
                  {scheduledAssignments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge variant="secondary" className="ml-2">
                  {completedAssignments.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Cancelled
                <Badge variant="secondary" className="ml-2">
                  {cancelledAssignments.length}
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
              {displayAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'No assignments found matching your search'
                    : 'No assignments found'}
                </div>
              ) : (
                <div className="divide-y divide-maroon-100">
                  {displayAssignments.map(assignment => (
                    <div key={assignment.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-maroon-800">
                            {assignment.route?.name || 'Unknown Route'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            ID: {assignment.id.substring(0, 8)}
                          </p>
                        </div>
                        {getStatusBadge(assignment.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <p>{assignment.conductor?.user?.name || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bus className="h-3 w-3 text-muted-foreground" />
                          <p>{assignment.bus?.bus_number || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p>{formatDate(assignment.start_date)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <p>{formatDate(assignment.end_date)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-maroon-200 hover:bg-maroon-50"
                          asChild>
                          <Link
                            href={`/admin/assignments/edit/${assignment.id}`}>
                            <Edit className="h-4 w-4 mr-2 text-maroon-600" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setIsDeleteDialogOpen(true);
                          }}>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Conductor</TableHead>
                  <TableHead className="hidden md:table-cell">Route</TableHead>
                  <TableHead className="hidden md:table-cell">Bus</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Start Time
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    End Time
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {searchQuery
                        ? 'No assignments found matching your search'
                        : 'No assignments found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayAssignments.map(assignment => (
                    <TableRow
                      key={assignment.id}
                      className="hover:bg-maroon-50">
                      <TableCell className="font-medium">
                        {assignment.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>
                        {assignment.conductor?.user?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {assignment.route?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {assignment.bus?.bus_number || 'N/A'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatDate(assignment.start_date)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatDate(assignment.end_date)}
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
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
                              <Link
                                href={`/admin/assignments/${assignment.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/assignments/edit/${assignment.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setIsDeleteDialogOpen(true);
                              }}>
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
              This will permanently delete this assignment. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAssignment}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
