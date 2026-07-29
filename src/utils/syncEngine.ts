export interface SyncRecord {
  id: string;
  payload: unknown;
  retryCount: number;
  lastAttempt: number | null;
}

const BATCH_SIZE = 15;
const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 2000;

export function calculateBackoff(attempt: number): number {
  return Math.min(BASE_BACKOFF_MS * Math.pow(2, attempt), 60000);
}

export class LeakyBucketSync<T extends SyncRecord> {
  private queue: T[] = [];
  private isFlushing = false;

  enqueue(record: T): void {
    this.queue.push(record);
  }

  enqueueMany(records: T[]): void {
    this.queue.push(...records);
  }

  get pending(): number {
    return this.queue.length;
  }

  async flush(sendFn: (batch: T[]) => Promise<boolean>): Promise<{ synced: number; failed: number }> {
    if (this.isFlushing) return { synced: 0, failed: 0 };
    this.isFlushing = true;
    let synced = 0;
    let failed = 0;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, BATCH_SIZE);
      try {
        const ok = await sendFn(batch);
        if (ok) {
          synced += batch.length;
        } else {
          failed += batch.length;
          this.queue.unshift(...batch);
          break;
        }
      } catch {
        batch.forEach((r) => r.retryCount++);
        const retryable = batch.filter((r) => r.retryCount <= MAX_RETRIES);
        const dead = batch.filter((r) => r.retryCount > MAX_RETRIES);
        failed += dead.length;
        if (retryable.length > 0) {
          const delay = calculateBackoff(retryable[0].retryCount);
          this.queue.unshift(...retryable);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    this.isFlushing = false;
    return { synced, failed };
  }
}

export async function atomicIndexedDbWrite<T>(dbName: string, storeName: string, records: T[]): Promise<boolean> {
  return new Promise((resolve) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      let completed = 0;
      let hasError = false;
      tx.onerror = () => { hasError = true; };
      tx.onabort = () => { hasError = true; };
      records.forEach((rec, i) => {
        const req = store.put(rec);
        req.onsuccess = () => {
          completed++;
          if (completed === records.length) {
            if (hasError) { tx.abort(); resolve(false); }
            else resolve(true);
          }
        };
        req.onerror = () => { hasError = true; };
      });
    };
    request.onerror = () => resolve(false);
  });
}
