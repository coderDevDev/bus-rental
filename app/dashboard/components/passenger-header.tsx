import { User } from '@/types';

import { UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, Menu } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { Support } from '@/components/support/support';
import { FeedbackForm } from '@/components/support/feedback-form';
import { signOut } from '@/lib/supabase/auth';
import { useAuth } from '@/hooks/use-auth';
interface PassengerHeaderProps {
  user: User | null;
}

export function PassengerHeader({ user }: PassengerHeaderProps) {
  const { signOut } = useAuth();
  return (
    <header className="border-b sticky top-0 bg-maroon-700 text-white z-10">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg">NorthPoint Passenger</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-maroon-600 text-[10px] font-medium text-white flex items-center justify-center">
              2
            </span>
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <UserIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/support">Support</Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  signOut();
                }}
                className="text-red-600">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
