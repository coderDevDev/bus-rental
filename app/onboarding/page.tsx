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
import { ArrowLeft, Bus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);

  // Simplified content without dynamic components
  const steps = [
    {
      title: 'Welcome to NorthPoint Bus',
      description: 'Your one-stop solution for convenient bus travel',
      content: (
        <div className="text-center p-6">
          <p className="mb-4">
            Find routes, book tickets, and travel with ease using our app.
          </p>
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Bus className="h-8 w-8 text-primary" />
          </div>
        </div>
      )
    },
    {
      title: 'Find Your Route',
      description: 'Search and book tickets easily',
      content: (
        <div className="text-center p-6">
          <p className="mb-4">
            Choose your departure and destination, select your preferred date
            and time.
          </p>
          <p className="text-sm text-muted-foreground">
            Booking a bus has never been easier!
          </p>
        </div>
      )
    },
    {
      title: 'Ready to Go!',
      description: 'Start your journey with NorthPoint',
      content: (
        <div className="text-center p-6">
          <p className="mb-4">
            You're all set to use NorthPoint Bus for your travel needs.
          </p>
          <p className="text-sm text-muted-foreground">Enjoy your journey!</p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-maroon-700 to-maroon-900 p-4 flex flex-col">
      <header className="mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={handleSkip}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Skip</span>
        </Button>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>

          <CardContent>{steps[currentStep].content}</CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
            </Button>
          </CardFooter>

          <div className="flex justify-center pb-4 space-x-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === currentStep ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
