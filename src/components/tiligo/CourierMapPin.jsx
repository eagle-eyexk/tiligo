import React from "react";

/**
 * Animated SVG courier character — green TiliGo outfit.
 * Shows bike, motorcycle, or car based on vehicle_type.
 */
export default function CourierMapPin({ vehicleType = "Biçikletë", size = 80 }) {
  const isBike = vehicleType === "Biçikletë";
  const isMoto = vehicleType === "Motocikletë";
  const isCar  = vehicleType === "Veturë";

  return (
    <div style={{ width: size, height: size + 20 }} className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 4px 12px rgba(57,255,107,0.5))" }}
      >
        {/* ── Body / torso ── */}
        <rect x="28" y="34" width="24" height="18" rx="5" fill="#39FF6B" />

        {/* ── Head ── */}
        <circle cx="40" cy="26" r="10" fill="#FFDBA4" />

        {/* ── Helmet ── */}
        <path d="M30 24 Q40 12 50 24" fill="#39FF6B" stroke="#1aaa45" strokeWidth="1.5" />
        <rect x="30" y="23" width="20" height="6" rx="3" fill="#39FF6B" />

        {/* ── Eyes ── */}
        <circle cx="36.5" cy="25.5" r="1.5" fill="#1a1a2e" />
        <circle cx="43.5" cy="25.5" r="1.5" fill="#1a1a2e" />

        {/* ── Arms ── */}
        <rect x="18" y="36" width="10" height="5" rx="2.5" fill="#39FF6B" />
        <rect x="52" y="36" width="10" height="5" rx="2.5" fill="#39FF6B" />

        {/* ── Legs ── */}
        <rect x="30" y="50" width="7" height="12" rx="3" fill="#1a1a2e" />
        <rect x="43" y="50" width="7" height="12" rx="3" fill="#1a1a2e" />

        {/* ── Vehicle ── */}
        {(isBike || isMoto) && (
          <g>
            {/* rear wheel */}
            <circle cx="24" cy="66" r={isMoto ? 9 : 7} stroke="#1aaa45" strokeWidth="3" fill="none" />
            <circle cx="24" cy="66" r="3" fill="#1aaa45" />
            {/* front wheel */}
            <circle cx="56" cy="66" r={isMoto ? 9 : 7} stroke="#1aaa45" strokeWidth="3" fill="none" />
            <circle cx="56" cy="66" r="3" fill="#1aaa45" />
            {/* frame */}
            <line x1="24" y1="66" x2="40" y2="54" stroke="#39FF6B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="54" x2="56" y2="66" stroke="#39FF6B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="54" x2="40" y2="60" stroke="#39FF6B" strokeWidth="2" strokeLinecap="round" />
            {/* handlebar */}
            <line x1="50" y1="54" x2="62" y2="52" stroke="#39FF6B" strokeWidth="2.5" strokeLinecap="round" />
            {/* moto engine block */}
            {isMoto && <rect x="32" y="57" width="16" height="8" rx="2" fill="#1aaa45" />}
          </g>
        )}

        {isCar && (
          <g>
            {/* car body */}
            <rect x="10" y="58" width="60" height="16" rx="5" fill="#1aaa45" />
            {/* car roof */}
            <rect x="20" y="50" width="40" height="12" rx="5" fill="#39FF6B" />
            {/* windows */}
            <rect x="23" y="52" width="14" height="8" rx="2" fill="#00BFFF" opacity="0.7" />
            <rect x="43" y="52" width="14" height="8" rx="2" fill="#00BFFF" opacity="0.7" />
            {/* wheels */}
            <circle cx="22" cy="74" r="6" fill="#111" stroke="#39FF6B" strokeWidth="2" />
            <circle cx="58" cy="74" r="6" fill="#111" stroke="#39FF6B" strokeWidth="2" />
            {/* hubcaps */}
            <circle cx="22" cy="74" r="2" fill="#39FF6B" />
            <circle cx="58" cy="74" r="2" fill="#39FF6B" />
          </g>
        )}
      </svg>

      {/* Pulsing pin dot */}
      <div className="relative mt-1">
        <div className="w-3 h-3 bg-primary rounded-full shadow-lg shadow-primary/60" />
        <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping opacity-60" />
      </div>
    </div>
  );
}