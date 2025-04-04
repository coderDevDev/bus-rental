'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onResult: (result: string) => void;
  onError?: (error: Error) => void;
}

export function QrScanner({ onResult, onError }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          decodedText => {
            onResult(decodedText);
            scanner.stop();
          },
          errorMessage => {
            console.error(errorMessage);
            onError?.(new Error(errorMessage));
          }
        );
      } catch (error) {
        console.error('Error starting scanner:', error);
        onError?.(
          error instanceof Error ? error : new Error('Failed to start scanner')
        );
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onResult, onError]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <div id="qr-reader" className="w-full aspect-square" />
    </div>
  );
}
