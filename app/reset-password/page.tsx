'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ArrowLeft, Bus, Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';
import { updatePassword } from '@/lib/supabase/auth';
import { ClientLayout } from '@/components/client-layout';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/client-only';

// Use dynamic import with SSR disabled
export default dynamic(() => Promise.resolve(ResetPasswordPage), {
  ssr: false
});

function ResetPasswordPage() {
  return (
    <ClientOnly>
      <Suspense fallback={<div>Loading reset password form...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </ClientOnly>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Get access token from URL or check for error in the hash
  const accessToken = searchParams?.get('access_token');

  useEffect(() => {
    // Debug current URL
    console.log(
      'Current URL:',
      typeof window !== 'undefined' ? window.location.href : 'Server side'
    );

    // Check for errors in the URL hash
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      console.log('URL hash:', hash);

      // First check if there's an error in the hash
      if (hash.includes('error=')) {
        const errorParams = new URLSearchParams(hash.substring(1));
        const errorMessage = errorParams
          .get('error_description')
          ?.replace(/\+/g, ' ');
        console.log('Error in hash:', errorMessage);

        if (errorMessage) {
          setLinkError(errorMessage);
        } else {
          setLinkError('The password reset link is invalid or has expired.');
        }
      }
      // Sometimes Supabase includes the access_token in the fragment instead of as a query param
      else if (hash.includes('access_token=')) {
        const tokenParams = new URLSearchParams(hash.substring(1));
        const hashToken = tokenParams.get('access_token');
        console.log(
          'Found token in hash:',
          hashToken ? 'Token present' : 'No token'
        );

        if (hashToken) {
          // If we find the token in the hash fragment, manually navigate to the URL with the token as a query param
          router.replace(`/reset-password?access_token=${hashToken}`);
          return;
        }
      }
    }

    console.log(
      'Access token in query params:',
      accessToken ? 'Token present' : 'No token'
    );

    // If no access token and no error detected, redirect to forgot-password
    if (!accessToken && !linkError) {
      router.push('/forgot-password');
      toast({
        title: 'Error',
        description: 'Invalid or missing reset token',
        variant: 'destructive'
      });
    }
  }, [accessToken, router, toast, linkError]);

  const validatePassword = (): boolean => {
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return false;
    }

    // Check password length
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    try {
      if (!accessToken) {
        throw new Error('No reset token found');
      }

      // Update password
      await updatePassword(accessToken, newPassword);

      // Show success message
      toast({
        title: 'Success',
        description: 'Your password has been reset successfully',
        duration: 5000
      });

      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (linkError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Link Expired</CardTitle>
            <CardDescription className="text-center">
              Your password reset link is no longer valid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <RefreshCw className="mx-auto h-8 w-8 text-amber-600 mb-2" />
              <p className="text-sm text-amber-800">{linkError}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push('/forgot-password')}>
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-maroon-700 to-maroon-900">
        <header className="p-4">
          <Button variant="ghost" size="icon" asChild className="text-white">
            <Link href="/sign-in">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Sign In</span>
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
                Create New Password
              </CardTitle>
              <CardDescription className="text-center">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }>
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
