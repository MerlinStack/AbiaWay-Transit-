import React from 'react';

export interface SegmentedOption {
  label: React.ReactNode;
  value: string;
  activeClass?: string;
}

interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange?: (value: string) => void;
  fill?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}

const SegmentedControl = ({ options, value, onChange, fill = false, size = 'sm', className = '', ariaLabel }: SegmentedControlProps) => (
  <div className={`flex gap-1 bg-white/10 rounded-lg p-1 ${fill ? 'w-full' : ''} ${className}`} role={onChange ? 'tablist' : undefined} aria-label={ariaLabel}>
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        role={onChange ? 'tab' : undefined}
        aria-selected={onChange ? value === opt.value : undefined}
        onClick={onChange ? () => onChange(opt.value) : undefined}
        className={`transition whitespace-nowrap ${
          size === 'md' ? 'py-2.5 rounded-md text-sm font-semibold' : 'px-3 py-1 rounded-lg text-xs'
        } ${
          value === opt.value
            ? opt.activeClass || 'bg-primary text-white'
            : 'text-gray-300 hover:bg-white/10'
        } ${fill ? 'flex-1 text-center' : ''}`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export default SegmentedControl;