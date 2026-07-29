// Simplified encryption that doesn't require crypto.subtle
export class ABSINEncryption {
  private key: string | null = null;

  constructor() {
    this.key = null;
  }

  async initialize(secretKey) {
    // Just return true - no actual encryption for demo
    console.log('✅ ABSIN Encryption initialized (demo mode)');
    return true;
  }

  async encrypt(data) {
    // Return data as-is (no encryption for demo)
    return { 
      iv: [], 
      data: Array.from(new TextEncoder().encode(JSON.stringify(data))) 
    };
  }

  async decrypt(encryptedData) {
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(new Uint8Array(encryptedData.data)));
  }

  async hashData(data) {
    // Simple hash for demo
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(16);
  }

  generateHMAC(data, secret) {
    return Promise.resolve('demo-hmac');
  }
}