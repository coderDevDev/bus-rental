'use client';

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
import { ArrowLeft, Settings, Camera, Pencil, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SignOutButton } from '@/components/sign-out-button';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProfileLayoutProps {
  backHref: string;
  role: 'admin' | 'conductor' | 'passenger';
  stats?: React.ReactNode;
  recentActivity?: React.ReactNode;
}

export function ProfileLayout({
  backHref,
  role,
  stats,
  recentActivity
}: ProfileLayoutProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.name || '',
    phone: user?.user_metadata?.phone || '',
    avatar: user?.user_metadata?.avatar_url || '/placeholder.svg'
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl }
      } = supabase.storage.from('profiles').getPublicUrl(filePath);

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          avatar_url: publicUrl
        }
      });

      if (updateError) throw updateError;

      // Update local state
      setProfileData(prev => ({
        ...prev,
        avatar: publicUrl
      }));

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          phone: profileData.phone,
          avatar_url: profileData.avatar
        }
      });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  // Add validation
  const validateProfile = () => {
    const errors: string[] = [];

    if (!profileData.name.trim()) {
      errors.push('Name is required');
    }

    if (profileData.phone && !/^\+?[\d\s-]{10,}$/.test(profileData.phone)) {
      errors.push('Invalid phone number format');
    }

    return errors;
  };

  // Update the save button to include validation
  const handleSaveClick = async () => {
    const errors = validateProfile();
    if (errors.length > 0) {
      errors.forEach(error => {
        toast({
          title: 'Validation Error',
          description: error,
          variant: 'destructive'
        });
      });
      return;
    }

    await handleSaveProfile();
  };

  const getRoleLabel = () => {
    console.log({ role });
    switch (role) {
      case 'admin':
        return 'System Administrator';
      case 'conductor':
        return 'Bus Conductor';
      case 'passenger':
        return 'Passenger';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={backHref}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg ml-4">My Profile</h1>
        </div>
      </header>

      <main className="flex-1 container max-w-4xl p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="relative group">
              <Avatar className="h-32 w-32 ring-4 ring-white shadow-lg">
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  </div>
                ) : (
                  <>
                    <AvatarImage
                      src={profileData.avatar}
                      alt={profileData.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl">
                      {profileData.name?.[0] ||
                        user?.email?.[0]?.toUpperCase() ||
                        '?'}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => fileInputRef.current?.click()}>
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Change photo</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Change profile photo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-between gap-2">
                  <h2 className="text-2xl font-bold">{profileData.name}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit profile</span>
                  </Button>
                </div>
                <p className="text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary">{getRoleLabel()}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">
                    {profileData.phone || 'Not set'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Member since</p>
                  <p className="font-medium">
                    {new Date(
                      user?.created_at || Date.now()
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* {stats && <div className="mt-8 pt-8 border-t">{stats}</div>}

          {recentActivity && (
            <div className="mt-8 pt-8 border-t">{recentActivity}</div>
          )} */}
        </div>
      </main>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] px-1">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={e =>
                    setProfileData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))
                  }
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={e =>
                    setProfileData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))
                  }
                  placeholder="+639"
                />
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setProfileData({
                  name: user?.user_metadata?.name || '',
                  phone: user?.user_metadata?.phone || '',
                  avatar: user?.user_metadata?.avatar_url || '/placeholder.svg'
                });
              }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveClick}
              disabled={!profileData.name.trim()}>
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
