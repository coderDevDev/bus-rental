'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Bus,
  Clock,
  MapPin,
  TicketIcon,
  Pencil
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SignOutButton } from '@/components/sign-out-button';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { conductorDashboardService } from '@/services/conductor-dashboard-service';

interface ConductorProfile {
  name: string;
  email: string;
  phone: string;
  license_number: string;
  experience_years: number;
  profile_image?: string;
}

export default function ConductorProfile() {
  const { user } = useAuth();

  console.log({ user });
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<ConductorProfile>({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    experience_years: 0,
    profile_image: undefined
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        license_number: user.user_metadata?.license_number || '',
        experience_years: user.user_metadata?.experience_years || 0,
        profile_image: user.user_metadata?.profile_image
      });
      setIsLoaded(true);
    }
  }, [user]);

  console.log({ profile });

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);

      // Update profile in Supabase auth metadata
      const { error } = await conductorDashboardService.updateConductorProfile({
        id: user?.id as string,
        metadata: {
          name: profile.name,
          phone: profile.phone,
          license_number: profile.license_number,
          experience_years: profile.experience_years,
          profile_image: profile.profile_image
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
          <div className="container flex items-center h-14 px-4">
            <Button variant="ghost" size="icon" asChild className="text-white">
              <Link href="/conductor">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">
              Profile
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4">
          <Card className="mb-4">
            <CardContent className="flex items-center justify-center h-[200px]">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-700" />
                <p className="text-sm text-muted-foreground">
                  Loading profile...
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" asChild className="text-white">
            <Link href="/conductor">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">
            Profile
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-white"
            onClick={() => setIsEditing(true)}>
            <Pencil className="h-5 w-5" />
            <span className="sr-only">Edit Profile</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={profile.profile_image || '/placeholder.svg'}
                  alt={profile.name}
                />
                <AvatarFallback>{profile.name?.[0] || 'C'}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{profile.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <Badge className="mt-2">
                {user?.user_metadata?.status || 'Active'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">License</p>
                <p className="font-medium">{profile.license_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-medium">{profile.experience_years} years</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Current Assignment</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {user?.user_metadata?.current_route || 'No active route'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {user?.user_metadata?.current_shift || 'Not on shift'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {user?.user_metadata?.current_bus || 'No bus assigned'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Today's Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <TicketIcon className="h-8 w-8 text-maroon-700 mb-2" />
                    <p className="text-2xl font-bold">
                      {user?.user_metadata?.today_tickets || '0'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tickets Issued
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center">
                    <Clock className="h-8 w-8 text-maroon-700 mb-2" />
                    <p className="text-2xl font-bold">
                      {user?.user_metadata?.today_hours || '0'}h
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Hours Active
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/conductor/settings">Settings</Link>
            </Button>
            <SignOutButton />
          </CardFooter>
        </Card>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={e =>
                  setProfile(prev => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={e =>
                  setProfile(prev => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input
                id="license"
                value={profile.license_number}
                onChange={e =>
                  setProfile(prev => ({
                    ...prev,
                    license_number: e.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={profile.experience_years}
                onChange={e =>
                  setProfile(prev => ({
                    ...prev,
                    experience_years: parseInt(e.target.value) || 0
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
