'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Wallet } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onSuccess: (transactionId: string) => void;
}

export function PaymentForm({ amount, onSuccess }: PaymentFormProps) {
  const { toast } = useToast();
  const [method, setMethod] = useState<'card' | 'ewallet'>('card');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const transactionId = `TXN-${Date.now()}`;
      onSuccess(transactionId);

      toast({
        title: 'Payment Successful',
        description: `Transaction ID: ${transactionId}`
      });
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: 'Please try again or use a different payment method',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={method}
              onValueChange={(value: 'card' | 'ewallet') => setMethod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Credit/Debit Card
                  </div>
                </SelectItem>
                <SelectItem value="ewallet">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    E-Wallet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {method === 'card' ? (
            <>
              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input placeholder="4111 1111 1111 1111" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input placeholder="123" />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label>E-Wallet Number</Label>
              <Input placeholder="Enter your e-wallet number" />
            </div>
          )}

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : `Pay ₱${amount.toFixed(2)}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
