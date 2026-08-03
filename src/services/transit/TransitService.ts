import { TransitDataSource, DataSourceType, FleetSummary, CardValidationResult, BalanceResult, RideDetails, PaymentResult } from './TransitDataSource';
import { BusStop, FleetBus } from '../../types/abssin';
import { TelemetryPacket } from '../../utils/telemetrySync';
import { MockTransitDataSource } from './MockTransitDataSource';
import { RealTransitDataSource } from './RealTransitDataSource';

export class TransitService {
  private source: TransitDataSource;
  private sourceType: DataSourceType;

  constructor() {
    this.sourceType = (import.meta.env.VITE_USE_REAL_TRANSIT === 'true') ? 'real' : 'mock';
    this.source = this.createSource(this.sourceType);
    console.log(`[TransitService] Initialized with ${this.sourceType} data source`);
  }

  private createSource(type: DataSourceType): TransitDataSource {
    switch (type) {
      case 'real':
        return new RealTransitDataSource();
      case 'mock':
      default:
        return new MockTransitDataSource();
    }
  }

  getSourceType(): DataSourceType {
    return this.sourceType;
  }

  setSourceType(type: DataSourceType): void {
    if (this.sourceType !== type) {
      this.sourceType = type;
      this.source = this.createSource(type);
      console.log(`[TransitService] Switched to ${type} data source`);
    }
  }

  async getTerminals(): Promise<BusStop[]> {
    return this.source.getTerminals();
  }

  async getStops(routeId?: string): Promise<BusStop[]> {
    return this.source.getStops(routeId);
  }

  async getAllStops(): Promise<BusStop[]> {
    return this.source.getAllStops();
  }

  async getSolarStops(): Promise<BusStop[]> {
    return this.source.getSolarStops();
  }

  async getRouteFare(from: string, to: string): Promise<number> {
    return this.source.getRouteFare(from, to);
  }

  async getFareType(from: string, to: string): Promise<'local' | 'inter-city'> {
    return this.source.getFareType(from, to);
  }

  async getActiveFleet(): Promise<FleetBus[]> {
    return this.source.getActiveFleet();
  }

  async getFleetSummary(): Promise<FleetSummary> {
    return this.source.getFleetSummary();
  }

  subscribeToTelemetry(onPacket: (packet: TelemetryPacket) => void): () => void {
    return this.source.subscribeToTelemetry(onPacket);
  }

  async validateCard(abssin: string, pin?: string): Promise<CardValidationResult> {
    return this.source.validateCard(abssin, pin);
  }

  async getBalance(cardId: string): Promise<BalanceResult> {
    return this.source.getBalance(cardId);
  }

  async processPayment(cardId: string, amount: number, rideDetails: RideDetails): Promise<PaymentResult> {
    return this.source.processPayment(cardId, amount, rideDetails);
  }

  async getCardPoints(cardId: string): Promise<{ total: number; nextTier: number; tier: string }> {
    return this.source.getCardPoints(cardId);
  }
}

let transitServiceInstance: TransitService | null = null;

export const getTransitService = (): TransitService => {
  if (!transitServiceInstance) {
    transitServiceInstance = new TransitService();
  }
  return transitServiceInstance;
};

export const resetTransitService = (): void => {
  transitServiceInstance = null;
};