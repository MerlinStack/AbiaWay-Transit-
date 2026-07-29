import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNFCReader } from '../useNFCReader';

describe('useNFCReader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).NDEFReader;
  });

  it('returns isSupported as false when NDEFReader is not available', () => {
    const { result } = renderHook(() => useNFCReader());
    expect(result.current.isSupported).toBe(false);
  });

  it('returns isSupported as true when NDEFReader is available', () => {
    (window as any).NDEFReader = vi.fn();
    const { result } = renderHook(() => useNFCReader());
    expect(result.current.isSupported).toBe(true);
  });

  it('sets error when startReading is called without support', async () => {
    const { result } = renderHook(() => useNFCReader());
    await act(async () => {
      await result.current.startReading();
    });
    expect(result.current.error).toBe('NFC not supported');
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useNFCReader());
    expect(result.current.isReading).toBe(false);
    expect(result.current.cardData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('stopReading resets state', () => {
    const { result } = renderHook(() => useNFCReader());
    act(() => {
      result.current.stopReading();
    });
    expect(result.current.isReading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.cardData).toBeNull();
  });
});
