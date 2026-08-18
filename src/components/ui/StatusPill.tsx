import React from 'react';

interface StatusPillProps {
  icon?: React.ReactNode;
  dot?: boolean;
  dotClass?: string;
  className?: string;
  children: React.ReactNode;
}

const StatusPill = ({ icon, dot = false, dotClass = 'bg-green-500 animate-pulse', className = '', children }: StatusPillProps) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-gray-300 whitespace-nowrap ${className}`}
  >
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />}
    {icon}
    {children}
  </span>
);

export default StatusPill;