import { TransitDataSource, FleetSummary, CardValidationResult, BalanceResult, RideDetails, PaymentResult } from './TransitDataSource';
import { BusStop, FleetBus } from '../../types/abssin';
import { TelemetryPacket } from '../../utils/telemetrySync';
import { TelemetrySyncEngine, type SyncEngineConfig } from '../../utils/telemetrySync';
import config from '../../config';

export class RealTransitDataSource implements TransitDataSource {
  private telemetryEngine: TelemetrySyncEngine | null = null;

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const baseUrl = config.absin.apiUrl;
    if (!baseUrl) {
      throw new Error('VITE_ABSIN_API_URL not configured');
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.absin.apiKey}`,
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getTerminals(): Promise<BusStop[]> {
    return this.request<BusStop[]>('/v1/terminals');
  }

  async getStops(routeId?: string): Promise<BusStop[]> {
    const params = routeId ? `?route=${encodeURIComponent(routeId)}` : '';
    return this.request<BusStop[]>(`/v1/stops${params}`);
  }

  async getAllStops(): Promise<BusStop[]> {
    return this.request<BusStop[]>('/v1/stops');
  }

  async getSolarStops(): Promise<BusStop[]> {
    return this.request<BusStop[]>('/v1/stops?solar=true');
  }

  async getRouteFare(from: string, to: string): Promise<number> {
    const data = await this.request<{ fare: number }>(`/v1/fares?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    return data.fare;
  }

  async getFareType(from: string, to: string): Promise<'local' | 'inter-city'> {
    const data = await this.request<{ type: 'local' | 'inter-city' }>(`/v1/fares/type?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    return data.type;
  }

  async getActiveFleet(): Promise<FleetBus[]> {
    return this.request<FleetBus[]>('/v1/fleet/active');
  }

  async getFleetSummary(): Promise<FleetSummary> {
    return this.request<FleetSummary>('/v1/fleet/summary');
  }

  subscribeToTelemetry(onPacket: (packet: TelemetryPacket) => void): () => void {
    const engineConfig: SyncEngineConfig = {
      wsUrl: config.absin.apiUrl ? config.absin.apiUrl.replace(/^http/, 'ws') + '/ws' : 'wss://telemetry.abiaway.gov.ng/ws',
      sseUrl: config.absin.apiUrl ? config.absin.apiUrl + '/sse' : 'https://telemetry.abiaway.gov.ng/sse',
      pollUrl: config.absin.apiUrl ? config.absin.apiUrl + '/poll' : 'https://telemetry.abiaway.gov.ng/poll',
      pollIntervalMs: 5000,
      maxRetries: 2,
    };

    this.telemetryEngine = new TelemetrySyncEngine(
      engineConfig,
      onPacket,
      () => {}
    );
    this.telemetryEngine.connect();

    return () => {
      this.telemetryEngine?.cleanup();
      this.telemetryEngine = null;
    };
  }

  async validateCard(abssin: string, pin?: string): Promise<CardValidationResult> {
    const data = await this.request<CardValidationResult>('/v1/cards/validate', {
      method: 'POST',
      body: JSON.stringify({ abssin, pin }),
    });
    return data;
  }

  async getBalance(cardId: string): Promise<BalanceResult> {
    return this.request<BalanceResult>(`/v1/cards/${encodeURIComponent(cardId)}/balance`);
  }

  async processPayment(cardId: string, amount: number, rideDetails: RideDetails): Promise<PaymentResult> {
    return this.request<PaymentResult>('/v1/payments', {
      method: 'POST',
      body: JSON.stringify({ cardId, amount, rideDetails }),
    });
  }

  async getCardPoints(cardId: string): Promise<{ total: number; nextTier: number; tier: string }> {
    return this.request<{ total: number; nextTier: number; tier: string }>(`/v1/cards/${encodeURIComponent(cardId)}/points`);
  }
}