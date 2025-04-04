import { QrScanner } from '@/components/qr-scanner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface TicketScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: (result: string) => Promise<void>;
}

export function TicketScanner({
  open,
  onOpenChange,
  onScanComplete
}: TicketScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (result: string) => {
    try {
      setScanning(true);
      setError(null);
      await onScanComplete(result);
      // Success state will show briefly before dialog closes
      setTimeout(() => onOpenChange(false), 1000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to validate ticket'
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4">
        <DialogHeader className="pb-4">
          <DialogTitle>Scan Ticket QR Code</DialogTitle>
          <DialogDescription>
            Position the QR code within the scanner frame
          </DialogDescription>
        </DialogHeader>

        {/* Scanner container */}
        <div className="bg-black rounded-lg overflow-hidden">
          {/* QR Scanner with dimensions */}
          <div className="relative w-full aspect-square max-w-sm mx-auto">
            <QrScanner
              onResult={result => handleScan(result.getText())}
              onError={error => setError('Failed to access camera')}
              className="w-full h-full rounded-lg overflow-hidden"
              constraints={{
                facingMode: 'environment',
                aspectRatio: 1,
                width: { min: 300, ideal: 400, max: 500 },
                height: { min: 300, ideal: 400, max: 500 }
              }}
              scanDelay={500}
              videoStyle={{ objectFit: 'cover' }}
            />

            {/* Scanning Frame Overlay */}
            <div className="absolute inset-0 border-2 border-white/30 rounded-lg">
              <div className="absolute inset-12 border-2 border-white/50 rounded-lg" />
            </div>

            {/* Scanning Overlay */}
            {scanning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}

            {/* Success Overlay */}
            {!scanning && !error && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center p-4">
                <XCircle className="h-16 w-16 text-red-500 mb-2" />
                <p className="text-sm text-center text-red-700">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setError(null)}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
