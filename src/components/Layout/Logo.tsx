function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F5132" />
          <stop offset="100%" stopColor="#0D6EFD" />
        </linearGradient>
        <linearGradient id="busGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
      </defs>

      {/* Outer ring */}
      <circle cx="24" cy="24" r="23" stroke="url(#ringGrad)" strokeWidth="2" fill="none" />

      {/* Inner ring glow */}
      <circle cx="24" cy="24" r="21" fill="#0F5132" fillOpacity="0.15" />

      {/* Leaf accent top-right */}
      <path d="M34 10C34 10 30 12 30 16C30 20 34 22 34 22C34 22 38 20 38 16C38 12 34 10 34 10Z"
        fill="#22C55E" fillOpacity="0.6" />
      <path d="M34 12C34 12 32 13.5 32 16C32 18.5 34 20 34 20C34 20 36 18.5 36 16C36 13.5 34 12 34 12Z"
        fill="#22C55E" />

      {/* Bus body */}
      <rect x="12" y="24" width="24" height="12" rx="3" fill="url(#busGrad)" />

      {/* Bus windshield */}
      <rect x="30" y="26" width="4" height="6" rx="1" fill="#0D6EFD" fillOpacity="0.3" />
      <rect x="14" y="26" width="4" height="6" rx="1" fill="#0D6EFD" fillOpacity="0.2" />

      {/* Bus side windows */}
      <rect x="20" y="26" width="8" height="5" rx="1" fill="#0D6EFD" fillOpacity="0.25" />

      {/* Bus roof highlight */}
      <rect x="14" y="22" width="20" height="3" rx="1.5" fill="#0F5132" />

      {/* Bus wheels */}
      <circle cx="18" cy="37" r="2.5" fill="#1E293B" />
      <circle cx="30" cy="37" r="2.5" fill="#1E293B" />
      <circle cx="18" cy="37" r="1" fill="#475569" />
      <circle cx="30" cy="37" r="1" fill="#475569" />

      {/* Lightning bolt accent on bus */}
      <path d="M24 24 L22 28 L26 28 L23 34 L28 27 L24 27 L25 24Z"
        fill="#0D6EFD" fillOpacity="0.8" />

      {/* Ground line */}
      <line x1="10" y1="40" x2="38" y2="40" stroke="#0F5132" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="10" y1="42" x2="38" y2="42" stroke="#0F5132" strokeWidth="1" strokeLinecap="round" opacity="0.2" />

      {/* Abbreviation */}
      <text x="24" y="14" textAnchor="middle" fill="#22C55E" fontSize="6" fontWeight="bold" fontFamily="Inter, sans-serif">
        AWS
      </text>
    </svg>
  );
}

export default Logo;
