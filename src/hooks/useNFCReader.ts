import { useState, useEffect, useCallback, useRef } from 'react';

export const useNFCReader = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState(null);
  const isReadingRef = useRef(false);
  const nfcRef = useRef<any>(null);

  useEffect(() => {
    if ('NDEFReader' in window) {
      setIsSupported(true);
    }
  }, []);

  const startReading = useCallback(async () => {
    if (!isSupported) {
      setError('NFC not supported');
      return;
    }

    setIsReading(true);
    isReadingRef.current = true;
    setError(null);
    setCardData(null);

    try {
      const nfc = new (window as any).NDEFReader();
      nfcRef.current = nfc;
      await nfc.scan();

      const handleError = () => {
        setError('Failed to read NFC tag');
        setIsReading(false);
        isReadingRef.current = false;
      };

      const handleReading = (event: any) => {
        const decoder = new TextDecoder();
        let data = '';

        for (const record of event.message.records) {
          if (record.recordType === 'text') {
            data += decoder.decode(record.data);
          }
        }

        const parts = data.split('|');
        setCardData({
          cardId: parts[0],
          userId: parts[1],
          balance: parseFloat(parts[2]),
          timestamp: parts[3],
          signature: parts[4],
        });

        setIsReading(false);
        isReadingRef.current = false;
      };

      nfc.addEventListener('readingerror', handleError);
      nfc.addEventListener('reading', handleReading);

      setTimeout(() => {
        if (isReadingRef.current) {
          setError('Timeout waiting for card');
          setIsReading(false);
          isReadingRef.current = false;
        }
      }, 30000);
    } catch (err: any) {
      setError(err.message);
      setIsReading(false);
      isReadingRef.current = false;
    }
  }, [isSupported]);

  useEffect(() => {
    return () => {
      isReadingRef.current = false;
      nfcRef.current = null;
    };
  }, []);

  const stopReading = useCallback(() => {
    setIsReading(false);
    isReadingRef.current = false;
    setError(null);
    nfcRef.current = null;
  }, []);

  return {
    isSupported,
    isReading,
    cardData,
    error,
    startReading,
    stopReading,
  };
};
