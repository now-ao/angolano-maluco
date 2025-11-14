import { useEffect, useRef } from 'react';

interface UseBarcodeScanner {
  onScan: (barcode: string) => void;
  minLength?: number;
  timeout?: number;
}

export const useBarcodeScanner = ({ onScan, minLength = 3, timeout = 100 }: UseBarcodeScanner) => {
  const barcodeRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Enter key means scan is complete
      if (e.key === 'Enter') {
        if (barcodeRef.current.length >= minLength) {
          onScan(barcodeRef.current);
        }
        barcodeRef.current = '';
        return;
      }

      // Accumulate characters
      if (e.key.length === 1) {
        barcodeRef.current += e.key;

        // Set timeout to reset if scanning stops
        timeoutRef.current = setTimeout(() => {
          barcodeRef.current = '';
        }, timeout);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onScan, minLength, timeout]);
};
