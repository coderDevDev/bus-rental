import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/sign-out-button';
import Link from 'next/link';

interface ProfileCardProps {
  profile: any; // Type this properly based on your user profile structure
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/placeholder.svg" alt={profile?.name} />
            <AvatarFallback>{profile?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="font-semibold text-lg">{profile?.name}</h3>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 border rounded-lg">
            <p className="text-2xl font-bold">{profile?.trips || 0}</p>
            <p className="text-sm text-muted-foreground">Total Trips</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-2xl font-bold">
              {profile?.total_distance || 0} km
            </p>
            <p className="text-sm text-muted-foreground">Distance Traveled</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/profile/edit">Edit Profile</Link>
          </Button>
          <SignOutButton />
        </div>
      </CardContent>
    </Card>
  );
}
