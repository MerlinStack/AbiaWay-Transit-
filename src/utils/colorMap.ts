// Problem: Tailwind JIT purges classes that aren't literal strings.
// `bg-${status}-500` disappears in production. Fix: map values to literal classes.

export const STATUS_COLOR_MAP = {
  active: 'bg-green-500 text-white',
  pending: 'bg-yellow-500 text-black',
  cancelled: 'bg-red-500 text-white',
  completed: 'bg-blue-500 text-white',
  default: 'bg-gray-400 text-white',
};

export function getStatusClasses(status) {
  return STATUS_COLOR_MAP[status] ?? STATUS_COLOR_MAP.default;
}

export const ROUTE_COLOR_MAP = {
  1: 'bg-indigo-500 border-indigo-600',
  2: 'bg-emerald-500 border-emerald-600',
  3: 'bg-amber-500 border-amber-600',
  default: 'bg-slate-400 border-slate-500',
};

export function getRouteClasses(routeId) {
  return ROUTE_COLOR_MAP[routeId] ?? ROUTE_COLOR_MAP.default;
}

export const PAYMENT_COLOR_MAP = {
  green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500', solid: 'bg-green-500' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500', solid: 'bg-blue-500' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500', solid: 'bg-purple-500' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500', solid: 'bg-yellow-500' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500', solid: 'bg-red-500' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500', solid: 'bg-orange-500' },
  indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500', solid: 'bg-indigo-500' },
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-400', border: 'border-teal-500', solid: 'bg-teal-500' },
};

export function getPaymentColorClasses(color) {
  return PAYMENT_COLOR_MAP[color] ?? PAYMENT_COLOR_MAP.green;
}
