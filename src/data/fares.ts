export const FARES = {
  LOCAL_FLAT: 800,
  INTER_CITY_BASE: 800,
  INTER_CITY_MAX: 1000,
  TOPUP_FEE: 50,
} as const;

export const ROUTE_FARES: Record<string, { type: 'local' | 'inter-city'; fare: number }> = {
  'Umuahia-Aba': { type: 'inter-city', fare: 800 },
  'Aba-Umuahia': { type: 'inter-city', fare: 800 },
  'Umuahia-Ohafia': { type: 'inter-city', fare: 1000 },
  'Ohafia-Umuahia': { type: 'inter-city', fare: 1000 },
  'Umuahia-Ugwogo': { type: 'local', fare: 800 },
  'Ugwogo-Umuahia': { type: 'local', fare: 800 },
  'Aba-Owerri': { type: 'inter-city', fare: 900 },
  'Owerri-Aba': { type: 'inter-city', fare: 900 },
} as const;

export const getFare = (from: string, to: string): number => {
  const key = `${from}-${to}`;
  const route = ROUTE_FARES[key];
  if (route) return route.fare;
  return FARES.INTER_CITY_BASE;
};

export const getFareType = (from: string, to: string): 'local' | 'inter-city' => {
  const key = `${from}-${to}`;
  const route = ROUTE_FARES[key];
  return route?.type || 'inter-city';
};
