// AES-256-GCM encryption + PBKDF2 key derivation + SHA-256/HMAC via WebCrypto.
// Requires a secure context (HTTPS). In non-secure contexts it degrades to the
// previous demo passthrough so the app keeps working in http://localhost dev.

const DEMO_SECRET = 'abiaway-absin-change-me';
const SALT = new TextEncoder().encode('abiaway-absin-v1');
const PBKDF2_ITERATIONS = 100000;

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');

const supportsWebCrypto = (): boolean =>
  typeof window !== 'undefined' && !!window.crypto?.subtle;

export class ABSINEncryption {
  private key: CryptoKey | null = null;
  private initialized = false;

  async initialize(secretKey?: string): Promise<boolean> {
    if (!supportsWebCrypto()) return false;
    try {
      const secret = secretKey || DEMO_SECRET;
      const baseKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(`abiaway-absin:${secret}`),
        'PBKDF2',
        false,
        ['deriveKey']
      );
      this.key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: SALT, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      this.initialized = true;
      return true;
    } catch {
      this.key = null;
      this.initialized = false;
      return false;
    }
  }

  async encrypt(data: unknown): Promise<{ iv: number[]; data: number[] }> {
    if (!this.initialized || !this.key) {
      // Non-secure context fallback: passthrough (demo only).
      return {
        iv: [],
        data: Array.from(new TextEncoder().encode(JSON.stringify(data))),
      };
    }
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      new TextEncoder().encode(JSON.stringify(data))
    );
    return { iv: Array.from(iv), data: Array.from(new Uint8Array(ciphertext)) };
  }

  async decrypt(encryptedData: { iv: number[]; data: number[] }): Promise<unknown> {
    if (!this.initialized || !this.key || !encryptedData.iv?.length) {
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(new Uint8Array(encryptedData.data)));
    }
    const iv = new Uint8Array(encryptedData.iv);
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.key,
      new Uint8Array(encryptedData.data)
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
  }

  async hashData(data: string): Promise<string> {
    if (!supportsWebCrypto()) {
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data.charCodeAt(i);
        hash |= 0;
      }
      return hash.toString(16);
    }
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    return toHex(new Uint8Array(digest));
  }

  async generateHMAC(data: string, secret: string): Promise<string> {
    if (!supportsWebCrypto()) return 'demo-hmac';
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(`abiaway-hmac:${secret}`),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
    return toHex(new Uint8Array(signature));
  }
}
