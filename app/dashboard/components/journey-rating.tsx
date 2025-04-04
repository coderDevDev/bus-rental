import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JourneyRatingProps {
  ticketId: string;
  onSubmit: (rating: number, feedback: string) => Promise<void>;
}

export function JourneyRating({ ticketId, onSubmit }: JourneyRatingProps) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(rating, feedback);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Rate Your Journey</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map(value => (
            <button
              key={value}
              onClick={() => setRating(value)}
              className="focus:outline-none">
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  value <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Share your feedback (optional)"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          className="h-24"
        />
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}>
          Submit Rating
        </Button>
      </CardContent>
    </Card>
  );
}
