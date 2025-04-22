'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import createClientComponent from '@/app/dynamic-wrap';
import ClientOnly from '@/components/client-only';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/use-auth';

// Use dynamic import with SSR disabled
export default dynamic(() => Promise.resolve(ProfilePage), {
  ssr: false
});

function ProfilePage() {
  return (
    <ClientOnly>
      <ProfileContent />
    </ClientOnly>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect based on user role
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin/profile');
      } else if (user.role === 'conductor') {
        router.push('/conductor/profile');
      } else {
        router.push('/dashboard/profile');
      }
    }
  }, [user, router]);

  // Simple loading state while we redirect
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-600">Redirecting to your profile...</p>
    </div>
  );
}

export default function Profile() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" asChild className="mr-auto">
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="font-bold text-lg absolute left-1/2 -translate-x-1/2">
            Profile
          </h1>
          <Button variant="ghost" size="icon" asChild className="ml-auto">
            <Link href="/settings">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">User Name</h2>
          <p className="text-muted-foreground">@username</p>
          <div className="flex gap-4 mt-4">
            <Button asChild>
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>
            <Button variant="outline">Share Profile</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is a sample user bio. The user can edit this in their profile
              settings. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map(item => (
                <div
                  key={item}
                  className="aspect-square bg-muted rounded-md flex items-center justify-center">
                  Post {item}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                {[1, 2, 3].map(item => (
                  <div
                    key={item}
                    className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <Avatar>
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">You</span> liked a post
                        from <span className="font-medium">User {item}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 days ago
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(item => (
                <div
                  key={item}
                  className="aspect-square bg-muted rounded-md flex items-center justify-center">
                  Saved {item}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
