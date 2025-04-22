'use client';

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
import { ArrowLeft, Bus, Mail } from 'lucide-react';
import { resetPasswordForEmail } from '@/lib/supabase/auth';
import { ClientLayout } from '@/components/client-layout';

export default function ForgotPassword() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email) {
        toast({
          title: 'Error',
          description: 'Please enter your email address',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Request password reset email
      await resetPasswordForEmail(email);

      // Show success message
      setEmailSent(true);
      toast({
        title: 'Email Sent',
        description: 'Check your email for the password reset link',
        duration: 5000
      });
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                Reset Password
              </CardTitle>
              <CardDescription className="text-center">
                Enter your email to receive a password reset link
              </CardDescription>
            </CardHeader>

            {!emailSent ? (
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              </CardContent>
            ) : (
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Mail className="mx-auto h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm text-green-800">
                    Email sent! Check your inbox for the password reset link.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/sign-in')}>
                  Back to Sign In
                </Button>
              </CardContent>
            )}

            <CardFooter className="flex justify-center">
              <div className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link
                  href="/sign-in"
                  className="text-primary underline underline-offset-4">
                  Sign In
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
