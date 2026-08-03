declare global {
  interface Window {
    NDEFReader: new () => { scan: (options?: { signal?: AbortSignal }) => Promise<void>; addEventListener: (event: string, handler: EventListener) => void };
  }
}

export class ABSINCardReader {
  private nfc: any;
  private isNFCSupported: boolean;
  private isQRSupported: boolean;

  constructor() {
    this.nfc = null;
    this.isNFCSupported = false;
    this.isQRSupported = false;
  }

  async initialize() {
    // Check for NFC support
    if ('NDEFReader' in window) {
      this.nfc = new window.NDEFReader();
      this.isNFCSupported = true;
    }
    
    // Check for camera/QR support
    if (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices) {
      this.isQRSupported = true;
    }
    
    return {
      nfc: this.isNFCSupported,
      qr: this.isQRSupported
    };
  }

  async readWithNFC() {
    if (!this.isNFCSupported) {
      throw new Error('NFC not supported on this device');
    }

    return new Promise((resolve, reject) => {
      const abortController = new AbortController();
      
      this.nfc.scan({ signal: abortController.signal })
        .catch(reject);
      
      this.nfc.addEventListener('readingerror', (event) => {
        abortController.abort();
        reject(new Error('Failed to read NFC tag'));
      });
      
      this.nfc.addEventListener('reading', (event) => {
        const decoder = new TextDecoder();
        let cardData = '';
        
        for (const record of event.message.records) {
          if (record.recordType === 'text') {
            cardData += decoder.decode(record.data);
          }
        }
        
        abortController.abort();
        resolve(this.parseCardData(cardData));
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        abortController.abort();
        reject(new Error('NFC read timeout'));
      }, 30000);
    });
  }

  async readWithQR() {
    if (!this.isQRSupported) {
      throw new Error('Camera not available for QR scanning');
    }

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          video.srcObject = stream;
          video.setAttribute('playsinline', 'true');
          video.play();
          
          const scanInterval = setInterval(() => {
            if (video.videoWidth && video.videoHeight) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              const imageData = canvas.toDataURL('image/png');
              this.decodeQRCode(imageData).then(qrResult => {
                if (qrResult) {
                  clearInterval(scanInterval);
                  stream.getTracks().forEach(track => track.stop());
                  video.remove();
                  resolve(this.parseQRData(qrResult));
                }
              });
            }
          }, 500);
          
          // Timeout after 30 seconds
          setTimeout(() => {
            clearInterval(scanInterval);
            stream.getTracks().forEach(track => track.stop());
            video.remove();
            reject(new Error('QR scan timeout'));
          }, 30000);
        })
        .catch(reject);
    });
  }

  async decodeQRCode(imageData) {
    // Using a QR code library like jsQR
    // This is a simplified version - you'll need to include jsQR
    try {
      // For demo purposes - in production, use proper QR decoding
      const img = new Image();
      img.src = imageData;
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Use jsQR library here
          // const code = jsQR(imageData, ...);
          // resolve(code?.data);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('QR decode error:', error);
      return null;
    }
  }

  parseCardData(rawData) {
    // ABSIN NFC format: ABN|CARD_ID|USER_ID|BALANCE|TIMESTAMP|SIGNATURE
    const parts = rawData.split('|');
    
    return {
      cardId: parts[0]?.includes('ABN') ? parts[0] : null,
      userId: parts[1],
      balance: parseFloat(parts[2]),
      timestamp: parts[3],
      signature: parts[4],
      method: 'nfc'
    };
  }

  parseQRData(qrData) {
    // ABSIN QR format: ABN://card/{cardId}/{token}/{timestamp}
    try {
      const url = new URL(qrData);
      const parts = url.pathname.split('/');
      
      return {
        cardId: parts[2],
        token: parts[3],
        timestamp: parts[4],
        method: 'qr'
      };
    } catch {
      // Try parsing as simple text
      const parts = qrData.split('|');
      return {
        cardId: parts[0],
        token: parts[1],
        timestamp: parts[2],
        method: 'qr'
      };
    }
  }
}