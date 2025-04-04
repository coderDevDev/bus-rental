import { HelpCenter } from '@/components/support/help-center';
import { FeedbackForm } from '@/components/support/feedback-form';

export default function SupportPage() {
  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <HelpCenter />
      <FeedbackForm />
    </div>
  );
}
