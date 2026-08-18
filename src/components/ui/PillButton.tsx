import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'success';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-green-600 text-white hover:bg-green-700',
  secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
  danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
  success: 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20',
};

const PillButton = ({ variant = 'secondary', className = '', children, ...rest }: PillButtonProps) => (
  <button
    className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium transition pressable whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default PillButton;