'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { ArrowLeft, Bus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { signIn } from '@/lib/supabase/auth';
import type { Role } from '@/types';
import { ClientLayout } from '@/components/client-layout';

// Mock user data for demo purposes
const MOCK_USERS = {
  passenger: {
    email: 'passenger@example.com',
    password: 'password123',
    role: 'passenger',
    name: 'John Doe'
  },
  conductor: {
    email: 'conductor@example.com',
    password: 'password123',
    role: 'conductor',
    name: 'James Smith',
    conductorId: 'CON-2024-001'
  },
  admin: {
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    name: 'Admin User',
    adminId: 'ADM-2024-001'
  }
};

export default function SignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    role: 'passenger'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({ ...prev, role: role as Role }));
    // Auto-fill credentials based on role for demo purposes
    const mockUser = MOCK_USERS[role as keyof typeof MOCK_USERS];
    setFormData(prev => ({
      ...prev,
      email: mockUser.email,
      password: mockUser.password,
      role: mockUser.role as Role
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.email || !formData.password) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Sign in with Supabase
      const { session, user } = await signIn(formData.email, formData.password);

      if (!session || !user) {
        throw new Error('Authentication failed');
      }

      // Get user role from metadata
      const role = (user.user_metadata.role as Role) || formData.role;

      // Show toast
      toast({
        title: 'Success',
        description: `Logged in successfully as ${role}`,
        duration: 2000
      });

      // Wait for session to be set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use window.location for navigation to ensure full page reload
      const redirectPath =
        role === 'passenger'
          ? '/dashboard'
          : role === 'conductor'
          ? '/conductor'
          : role === 'admin'
          ? '/admin'
          : '/dashboard';

      // Use replace to prevent back navigation to sign-in
      window.location.replace(redirectPath);
    } catch (error) {
      console.error('Sign-in error:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
        duration: 3000
      });
      setIsLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-maroon-700 to-maroon-900">
        <header className="p-4">
          <Button variant="ghost" size="icon" asChild className="text-white">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary mb-6">
            <Bus className="w-8 h-8" />
          </div>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to your BusGo account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passenger">Passenger</SelectItem>
                      <SelectItem value="conductor">Conductor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="text-sm text-right">
                  <Link
                    href="/forgot-password"
                    className="text-primary underline underline-offset-4">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                  href="/sign-up"
                  className="text-primary underline underline-offset-4">
                  Sign Up
                </Link>
              </div>
            </CardFooter>
          </Card>

          {/* Demo credentials */}
          <Card className="w-full max-w-md mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Demo Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="font-medium">Passenger:</p>
                <p className="text-muted-foreground">
                  Email: efurnish.03@gmail.com
                </p>
                <p className="text-muted-foreground">Password: password123</p>
              </div>
              <div>
                <p className="font-medium">Conductor:</p>
                <p className="text-muted-foreground">
                  Email: newdexm@gmail.com
                </p>
                <p className="text-muted-foreground">Password: password</p>
              </div>
              <div>
                <p className="font-medium">Admin:</p>
                <p className="text-muted-foreground">
                  Email: mdexter958@gmail.com
                </p>
                <p className="text-muted-foreground">Password: password</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
