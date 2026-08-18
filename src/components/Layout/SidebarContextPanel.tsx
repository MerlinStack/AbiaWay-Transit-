import React, { useEffect, useState } from 'react';
import { Leaf, Wallet, Ticket, Bus, Shield, Radar, WifiOff, IdCard, Activity, Zap } from 'lucide-react';
import useMapStore from '../../stores/mapStore';
import useWalletStore from '../../stores/walletStore';
import useTripStore from '../../stores/tripStore';
import useAuthStore from '../../stores/authStore';
import { getTransitService } from '../../services/transit';
import type { FleetSummary } from '../../services/transit/TransitDataSource';
import StatusPill from '../ui/StatusPill';

interface SidebarContextPanelProps {
  pathname: string;
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 bg-[rgba(255,255,255,0.04)] border border-[rgba(148,163,184,0.10)] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-green-400" />
        </span>
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{title}</p>
      </div>
      <div className="text-sm space-y-2">{children}</div>
    </div>
  );
}

function StatRow({ label, value, valueClass = 'text-white font-semibold tabular-nums' }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function StatusRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-gray-500 text-sm">{label}</span>
      {children}
    </div>
  );
}

const Hint = ({ children }: { children: React.ReactNode }) => <p className="text-xs text-gray-500 pt-1">{children}</p>;

function MapContext() {
  const busCount = useMapStore((s) => s.busMarkers.length);
  const isTracking = useMapStore((s) => s.isTracking);
  return (
    <Section icon={Radar} title="Live Tracking">
      <StatRow label="Buses on map" value={busCount} />
      <StatusRow label="Simulation">
        <StatusPill dot dotClass={isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}
          className={isTracking ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gray-500/10 border-gray-500/30 text-gray-400'}>
          {isTracking ? 'Tracking' : 'Standby'}
        </StatusPill>
      </StatusRow>
      <Hint>Tap a bus marker for ETA and battery profile.</Hint>
    </Section>
  );
}

function WalletContext() {
  const balance = useWalletStore((s) => s.balance);
  return (
    <Section icon={Wallet} title="Wallet">
      <div className="flex items-end justify-between gap-2">
        <span className="text-gray-500 text-sm">Balance</span>
        <span className="text-xl font-bold text-white tabular-nums">₦{balance.toLocaleString()}</span>
      </div>
      <Hint>Fund via Paystack or ABSIN card in the wallet page.</Hint>
    </Section>
  );
}

function BookingContext() {
  return (
    <Section icon={Ticket} title="Book &amp; Pay">
      <p className="text-sm text-gray-300">Search routes, pick seats, and pay with wallet or ABSSIN card.</p>
      <Hint>Flat fare: ₦300 · Reservations held 10 min</Hint>
    </Section>
  );
}

function FleetContext() {
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  useEffect(() => {
    let mounted = true;
    getTransitService()
      .getFleetSummary()
      .then((s) => { if (mounted) setSummary(s); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);
  return (
    <Section icon={Bus} title="Fleet Health">
      {summary ? (
        <>
          <StatRow label="Active" value={summary.active} valueClass="text-green-400 font-semibold tabular-nums" />
          <StatRow label="Charging" value={summary.charging} valueClass="text-blue-400 font-semibold tabular-nums" />
          <StatRow label="Maintenance" value={summary.maintenance} valueClass="text-red-400 font-semibold tabular-nums" />
          <StatRow label="Idle" value={summary.idle} valueClass="text-gray-300 font-semibold tabular-nums" />
          <div className="flex justify-between items-center gap-2 pt-1 border-t border-white/5">
            <span className="text-gray-500 text-sm">Avg battery</span>
            <span className="text-white font-semibold tabular-nums">{Math.round(summary.avgBattery)}%</span>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500">Loading fleet summary…</p>
      )}
    </Section>
  );
}

function DriverContext() {
  const { status, distanceKm, passengers, fareCollected, lastSummary } = useTripStore();
  const co2Saved = Math.max(0, lastSummary?.distanceKm ? Math.round(lastSummary.distanceKm * 0.05 * 100) / 100 : 0);
  const liveCo2 = Math.max(0, Math.round(distanceKm * 0.05 * 100) / 100);
  const active = status === 'active' || status === 'paused';
  return (
    <Section icon={Leaf} title="Shift Impact">
      <StatusRow label="Trip status">
        <StatusPill dot dotClass={active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}
          className={`capitalize ${active ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gray-500/10 border-gray-500/30 text-gray-400'}`}>
          {status}
        </StatusPill>
      </StatusRow>
      <StatRow label="Distance" value={`${distanceKm.toFixed(1)} km`} />
      <StatRow label="Riders" value={passengers} />
      <StatRow label="Fare collected" value={`₦${fareCollected.toLocaleString()}`} />
      <div className="flex justify-between items-center gap-2 pt-1 border-t border-white/5">
        <span className="text-gray-500 text-sm">CO₂ avoided</span>
        <span className="text-green-400 font-semibold tabular-nums">{Math.max(liveCo2, co2Saved).toFixed(2)} kg</span>
      </div>
    </Section>
  );
}

function AdminContext() {
  const user = useAuthStore((s) => s.user);
  return (
    <Section icon={Shield} title="Administration">
      <p className="text-sm text-gray-300">Signed in as <span className="text-white font-semibold">{user?.name}</span></p>
      <Hint>Manage drivers, fleet status, and operations from the admin dashboard.</Hint>
    </Section>
  );
}

function ABSSINContext() {
  return (
    <Section icon={IdCard} title="ABSSIN">
      <p className="text-sm text-gray-300">Link your Abia State ID to pay by card tap and unlock the gold tier.</p>
      <Hint>12-digit number · issued by the state identity ledger</Hint>
    </Section>
  );
}

function ConductorContext() {
  return (
    <Section icon={WifiOff} title="Offline Mode">
      <p className="text-sm text-gray-300">Taps store locally in IndexedDB and sync via the leaky-bucket queue.</p>
      <Hint>Validates tickets even with no network — no revenue lost.</Hint>
    </Section>
  );
}

function CheckinContext() {
  return (
    <Section icon={Zap} title="Pre-Trip">
      <p className="text-sm text-gray-300">Complete the 8-point safety checklist before your vehicle leaves the depot.</p>
      <Hint>3 consecutive fails auto-locks the vehicle.</Hint>
    </Section>
  );
}

function DiagnosticsContext() {
  return (
    <Section icon={Activity} title="Diagnostics">
      <p className="text-sm text-gray-300">Run the 23-assertion suite to verify core integrity, telemetry fallback, and storage quotas.</p>
    </Section>
  );
}

function SidebarContextPanel({ pathname }: SidebarContextPanelProps) {
  if (pathname.startsWith('/map')) return <MapContext />;
  if (pathname.startsWith('/wallet')) return <WalletContext />;
  if (pathname.startsWith('/booking')) return <BookingContext />;
  if (pathname.startsWith('/fleet')) return <FleetContext />;
  if (pathname.startsWith('/driver')) return <DriverContext />;
  if (pathname.startsWith('/checkin')) return <CheckinContext />;
  if (pathname.startsWith('/conductor')) return <ConductorContext />;
  if (pathname.startsWith('/register')) return <ABSSINContext />;
  if (pathname.startsWith('/diagnostics')) return <DiagnosticsContext />;
  if (pathname.startsWith('/admin')) return <AdminContext />;
  return null;
}

export default SidebarContextPanel;