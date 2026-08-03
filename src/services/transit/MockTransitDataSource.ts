import { TransitDataSource, FleetSummary, CardValidationResult, BalanceResult, RideDetails, PaymentResult } from './TransitDataSource';
import { BusStop, FleetBus } from '../../types/abssin';
import { TelemetryPacket } from '../../utils/telemetrySync';
import { TERMINALS, BUS_STOPS, ALL_STOPS, SOLAR_STOPS } from '../../data/stops';
import { FLEET, ACTIVE_FLEET, getFleetSummary, getBatteryColor } from '../../data/fleet';
import { ROUTE_FARES, FARES, getFare, getFareType } from '../../data/fares';
import { TelemetrySyncEngine, type SyncEngineConfig } from '../../utils/telemetrySync';
import config from '../../config';

const DEMO_PIN = import.meta.env.VITE_DEMO_ABSIN_PIN || '1234';
const DEMO_CARDS = JSON.parse(import.meta.env.VITE_DEMO_ABSIN_CARDS || '{}');
const DEFAULT_CARDS = {
  '1234567890123456': { cardholder: 'Abuoma David', balance: 12450, tier: 'Premium', phone: '+234-801-234-5678', email: 'abuoma@example.com' },
  '1111222233334444': { cardholder: 'Chidi Okonkwo', balance: 5000, tier: 'Standard', phone: '+234-802-345-6789', email: 'chidi@example.com' },
  '5555666677778888': { cardholder: 'Ngozi Eze', balance: 25000, tier: 'Platinum', phone: '+234-803-456-7890', email: 'ngozi@example.com' }
};

const CARDS = Object.keys(DEMO_CARDS).length > 0 ? DEMO_CARDS : DEFAULT_CARDS;

let activeCardState: { cardId: string; balance: number } | null = null;

export class MockTransitDataSource implements TransitDataSource {
  private telemetryEngine: TelemetrySyncEngine | null = null;

  async getTerminals(): Promise<BusStop[]> {
    await this.simulateDelay(50);
    return [...TERMINALS];
  }

  async getStops(routeId?: string): Promise<BusStop[]> {
    await this.simulateDelay(50);
    if (!routeId) return [...BUS_STOPS];
    return BUS_STOPS.filter(stop => stop.routes.includes(routeId));
  }

  async getAllStops(): Promise<BusStop[]> {
    await this.simulateDelay(50);
    return [...ALL_STOPS];
  }

  async getSolarStops(): Promise<BusStop[]> {
    await this.simulateDelay(50);
    return [...SOLAR_STOPS];
  }

  async getRouteFare(from: string, to: string): Promise<number> {
    await this.simulateDelay(30);
    return getFare(from, to);
  }

  async getFareType(from: string, to: string): Promise<'local' | 'inter-city'> {
    await this.simulateDelay(30);
    return getFareType(from, to);
  }

  async getActiveFleet(): Promise<FleetBus[]> {
    await this.simulateDelay(100);
    return [...ACTIVE_FLEET];
  }

  async getFleetSummary(): Promise<FleetSummary> {
    await this.simulateDelay(50);
    return getFleetSummary();
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
    await this.simulateDelay(800);
    const cleanAbssin = abssin.replace(/\s/g, '');
    const card = CARDS[cleanAbssin] || CARDS['1234567890123456'];

    if (!card || pin !== DEMO_PIN) {
      return { success: false, error: 'Invalid card or PIN' };
    }

    activeCardState = { cardId: cleanAbssin, balance: card.balance };

    return {
      success: true,
      cardId: cleanAbssin,
      cardholder: {
        name: card.cardholder,
        phone: card.phone,
        email: card.email
      },
      balance: card.balance,
      tier: card.tier
    };
  }

  async getBalance(cardId: string): Promise<BalanceResult> {
    await this.simulateDelay(500);
    const cleanId = cardId.replace(/\s/g, '');
    const card = CARDS[cleanId] || CARDS['1234567890123456'];

    if (activeCardState && activeCardState.cardId === cleanId) {
      return {
        success: true,
        balance: activeCardState.balance,
        currency: 'NGN',
        available: true
      };
    }

    return {
      success: true,
      balance: card.balance,
      currency: 'NGN',
      available: true
    };
  }

  async processPayment(cardId: string, amount: number, rideDetails: RideDetails): Promise<PaymentResult> {
    await this.simulateDelay(1500);

    if (!activeCardState || activeCardState.cardId !== cardId.replace(/\s/g, '')) {
      return { success: false, error: 'No active card' };
    }

    const totalAmount = amount + 50;

    if (activeCardState.balance < totalAmount) {
      return {
        success: false,
        error: 'Insufficient balance',
        balance: activeCardState.balance,
        required: totalAmount
      };
    }

    activeCardState.balance -= totalAmount;

    const receipt = {
      receiptId: `RCP-${Date.now()}`,
      date: new Date().toISOString(),
      merchant: 'Abia Way Transit System',
      merchantId: config.absin.merchantId,
      cardNumber: `****${cardId.slice(-4)}`,
      cardholder: CARDS[cardId.replace(/\s/g, '')]?.cardholder || 'Unknown',
      amount,
      fee: 50,
      total: totalAmount,
      currency: 'NGN',
      route: `${rideDetails.from} → ${rideDetails.to}`,
      busId: rideDetails.busId,
      seats: rideDetails.seats || [],
      passengers: rideDetails.passengers || 1,
      balanceAfter: activeCardState.balance,
      pointsEarned: Math.floor(amount / 10),
      transactionId: `TXN-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      transactionId: receipt.transactionId,
      receipt,
      balance: activeCardState.balance,
      pointsEarned: receipt.pointsEarned
    };
  }

  async getCardPoints(cardId: string): Promise<{ total: number; nextTier: number; tier: string }> {
    await this.simulateDelay(300);
    return {
      total: 450,
      nextTier: 600,
      tier: 'Premium'
    };
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}