export const getBatteryColor = (soc: number): string => {
  if (soc >= 80) return '#22c55e';
  if (soc >= 60) return '#eab308';
  if (soc >= 40) return '#f97316';
  return '#ef4444';
};