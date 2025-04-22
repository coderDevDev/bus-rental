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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ArrowLeft,
  ArrowRight,
  Bus,
  MapPin,
  CreditCard,
  Bell,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Wallet,
  Smartphone,
  Building2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import ClientOnly from '@/components/client-only';

const DynamicOnboardingPage = dynamic(
  () => Promise.resolve(OnboardingContent),
  { ssr: false }
);

export default function OnboardingPage() {
  return (
    <ClientOnly>
      <DynamicOnboardingPage />
    </ClientOnly>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingSteps = [
    {
      title: 'Welcome to NorthPoint Bus',
      description: 'Your one-stop solution for convenient bus travel',
      icon: Bus,
      content: (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">What you can do:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary/5 rounded-xl flex items-start space-x-3">
              <Search className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium">Search Routes</h4>
                <p className="text-sm text-muted-foreground">
                  Find the perfect route for your journey
                </p>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-xl flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium">Book Tickets</h4>
                <p className="text-sm text-muted-foreground">
                  Reserve seats in advance
                </p>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-xl flex items-start space-x-3">
              <Clock className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium">Real-time Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Know your bus location
                </p>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-xl flex items-start space-x-3">
              <Bell className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Get updates about your trips
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Find Your Route',
      description: 'Search and book tickets easily',
      icon: MapPin,
      content: (
        <div className="space-y-6">
          <div className="bg-primary/5 rounded-xl p-6">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Building2 className="h-8 w-8 text-primary" />
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary">1</span>
                </div>
                <p>Choose your departure and destination</p>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary">2</span>
                </div>
                <p>Select your preferred date and time</p>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary">3</span>
                </div>
                <p>Choose number of passengers</p>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary">4</span>
                </div>
                <p>Confirm your booking details</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Payment Methods',
      description: 'Multiple payment options available',
      icon: CreditCard,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 border rounded-xl text-center space-y-3 hover:border-primary/50 transition-colors">
              <Wallet className="h-8 w-8 mx-auto text-primary" />
              <div>
                <h4 className="font-medium">Online Payment</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Credit/Debit Cards
                  <br />
                  E-wallets
                </p>
              </div>
            </div>
            <div className="p-6 border rounded-xl text-center space-y-3 hover:border-primary/50 transition-colors">
              <Smartphone className="h-8 w-8 mx-auto text-primary" />
              <div>
                <h4 className="font-medium">Cash Payment</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Pay at the terminal
                  <br />
                  No booking fees
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Stay Updated',
      description: 'Get real-time notifications',
      icon: Bell,
      content: (
        <div className="space-y-6">
          <div className="bg-primary/5 rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Booking Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Instant confirmations
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Trip Reminders</h4>
                  <p className="text-sm text-muted-foreground">
                    Never miss your bus
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Schedule Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time changes
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Promotions</h4>
                  <p className="text-sm text-muted-foreground">
                    Special offers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      toast({
        title: 'Welcome aboard!',
        description: 'You are all set to start booking your trips.'
      });
      router.push('/dashboard');
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const StepIcon = onboardingSteps[currentStep]?.icon || Bus;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-maroon-700 to-maroon-900">
      <header className="p-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={handleSkip}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Skip</span>
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <StepIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {onboardingSteps[currentStep]?.title || 'Welcome'}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {onboardingSteps[currentStep]?.description || "Let's get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {onboardingSteps[currentStep]?.content || null}

            <div className="flex justify-center mt-8 space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    currentStep === index ? 'bg-primary' : 'bg-primary/30'
                  }`}
                />
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-center gap-4">
            <Button variant="outline" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleNext}>
              {currentStep < onboardingSteps.length - 1
                ? 'Next'
                : 'Get Started'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
