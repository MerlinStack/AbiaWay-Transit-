import { BusStop, FleetBus } from '../../types/abssin';
import { TelemetryPacket } from '../../utils/telemetrySync';

export interface FleetSummary {
  total: number;
  active: number;
  charging: number;
  maintenance: number;
  idle: number;
  avgBattery: number;
}

export interface CardValidationResult {
  success: boolean;
  cardId?: string;
  cardholder?: {
    name: string;
    phone: string;
    email: string;
  };
  balance?: number;
  tier?: string;
  error?: string;
}

export interface BalanceResult {
  success: boolean;
  balance?: number;
  currency?: string;
  available?: boolean;
  error?: string;
}

export interface RideDetails {
  from: string;
  to: string;
  busId: string;
  seats?: string[];
  passengers?: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  receipt?: {
    receiptId: string;
    date: string;
    merchant: string;
    merchantId: string;
    cardNumber: string;
    cardholder: string;
    amount: number;
    fee: number;
    total: number;
    currency: string;
    route: string;
    busId: string;
    seats: string[];
    passengers: number;
    balanceAfter: number;
    pointsEarned: number;
    transactionId: string;
    timestamp: string;
  };
  balance?: number;
  pointsEarned?: number;
  required?: number;
  error?: string;
}

export interface TransitDataSource {
  getTerminals(): Promise<BusStop[]>;
  getStops(routeId?: string): Promise<BusStop[]>;
  getAllStops(): Promise<BusStop[]>;
  getSolarStops(): Promise<BusStop[]>;
  getRouteFare(from: string, to: string): Promise<number>;
  getFareType(from: string, to: string): Promise<'local' | 'inter-city'>;
  getActiveFleet(): Promise<FleetBus[]>;
  getFleetSummary(): Promise<FleetSummary>;
  subscribeToTelemetry(onPacket: (packet: TelemetryPacket) => void): () => void;
  validateCard(abssin: string, pin?: string): Promise<CardValidationResult>;
  getBalance(cardId: string): Promise<BalanceResult>;
  processPayment(cardId: string, amount: number, rideDetails: RideDetails): Promise<PaymentResult>;
  getCardPoints(cardId: string): Promise<{ total: number; nextTier: number; tier: string }>;
}

export type DataSourceType = 'mock' | 'real';