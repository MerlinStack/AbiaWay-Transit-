import { Map, Wallet, Ticket, IdCard, CarFront, ClipboardCheck, Bug, QrCode, Bus, Shield, Users } from 'lucide-react';
import type React from 'react';
import type { User } from '../types';

export type AccessRole = User['role'] | 'guest';

export interface NavItem {
  path: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  section: 'passenger' | 'operations' | 'administration';
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/map', label: 'Live Tracking', shortLabel: 'Live', icon: Map, section: 'passenger', badge: 'LIVE' },
  { path: '/wallet', label: 'My Wallet', shortLabel: 'Wallet', icon: Wallet, section: 'passenger' },
  { path: '/booking', label: 'Book & Pay', shortLabel: 'Book', icon: Ticket, section: 'passenger' },
  { path: '/register', label: 'ABSSIN Register', shortLabel: 'ABSSIN', icon: IdCard, section: 'passenger' },
  { path: '/driver', label: 'Driver Dashboard', shortLabel: 'Drive', icon: CarFront, section: 'operations' },
  { path: '/checkin', label: 'Driver Check-in', shortLabel: 'Check-in', icon: ClipboardCheck, section: 'operations' },
  { path: '/conductor', label: 'Conductor Tap', shortLabel: 'Tap', icon: QrCode, section: 'operations' },
  { path: '/diagnostics', label: 'Diagnostics', shortLabel: 'Diag', icon: Bug, section: 'operations' },
  { path: '/fleet', label: 'Fleet Mgmt', shortLabel: 'Fleet', icon: Bus, section: 'administration' },
  { path: '/admin', label: 'Admin Dashboard', shortLabel: 'Admin', icon: Shield, section: 'administration' },
  { path: '/admin/drivers', label: 'Driver Management', shortLabel: 'Drivers', icon: Users, section: 'administration' },
];

export const SECTION_LABELS: Record<NavItem['section'], string> = {
  passenger: 'Passenger',
  operations: 'Fleet Operations',
  administration: 'Administration',
};

export const ROLE_ACCESS: Record<AccessRole, string[]> = {
  guest: ['/map', '/wallet', '/booking', '/register'],
  passenger: ['/map', '/wallet', '/booking', '/register'],
  driver: ['/driver', '/checkin', '/diagnostics'],
  conductor: ['/conductor', '/diagnostics'],
  admin: ['/fleet', '/admin', '/admin/drivers', '/diagnostics'],
};

export const HOME_ROUTE: Record<AccessRole, string> = {
  guest: '/map',
  passenger: '/map',
  driver: '/driver',
  conductor: '/conductor',
  admin: '/admin',
};

export const getRole = (user: User | null): AccessRole => user?.role ?? 'guest';

export const allowedNavItems = (role: AccessRole): NavItem[] =>
  NAV_ITEMS.filter((item) => ROLE_ACCESS[role].includes(item.path));

export const isRouteAllowed = (path: string, role: AccessRole): boolean =>
  ROLE_ACCESS[role].some((route) => path === route || path.startsWith(route + '/'));
