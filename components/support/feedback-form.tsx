'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Star } from 'lucide-react';

export function FeedbackForm() {
  const { toast } = useToast();
  const [rating, setRating] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the feedback to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
        duration: 3000
      });

      setRating('');
      setFeedback('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Share Your Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              How was your experience?
            </label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map(value => (
                  <SelectItem key={value} value={value.toString()}>
                    <div className="flex items-center gap-2">
                      <span>{value}</span>
                      <div className="flex">
                        {Array(value)
                          .fill(null)
                          .map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-primary text-primary"
                            />
                          ))}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your feedback</label>
            <Textarea
              placeholder="Tell us about your experience..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!rating || !feedback || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
