import { motion } from "framer-motion";

/* ─── Inline SVG wordmark ─────────────────────────────────── */
function WordmarkSVG({ width }) {
  return (
    <svg width={width} height={width * 0.28} viewBox="0 0 320 90"
      xmlns="http://www.w3.org/2000/svg" aria-label="TiliGo">
      <defs>
        <linearGradient id="lgBlue" x1="0%" y1="30%" x2="100%" y2="70%">
          <stop offset="0%" stopColor="#00BFFF"/>
          <stop offset="100%" stopColor="#0066FF"/>
        </linearGradient>
        <linearGradient id="lgGreen" x1="0%" y1="30%" x2="100%" y2="70%">
          <stop offset="0%" stopColor="#7FFF00"/>
          <stop offset="100%" stopColor="#00FF7F"/>
        </linearGradient>
      </defs>
      <text x="0" y="68"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="68" fontWeight="900" letterSpacing="-3"
        fill="url(#lgBlue)">Tili</text>
      <text x="185" y="68"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="68" fontWeight="900" letterSpacing="-2.5"
        fill="url(#lgGreen)">Go</text>
    </svg>
  );
}

/* ─── Icon badge (small square/circle logo) ──────────────── */
export function TiliGoBadge({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg" aria-label="TiliGo badge">
      <defs>
        <linearGradient id="badgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a2a4a"/>
          <stop offset="100%" stopColor="#020c1b"/>
        </linearGradient>
        <linearGradient id="badgeBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00BFFF"/>
          <stop offset="100%" stopColor="#0066FF"/>
        </linearGradient>
        <linearGradient id="badgeGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7FFF00"/>
          <stop offset="100%" stopColor="#00FF7F"/>
        </linearGradient>
      </defs>
      {/* Background pill */}
      <rect width="80" height="80" rx="20" fill="url(#badgeBg)"/>
      {/* "T" blue */}
      <text x="8" y="52"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="46" fontWeight="900"
        fill="url(#badgeBlue)">T</text>
      {/* "G" green */}
      <text x="40" y="52"
        fontFamily="Arial Black, Helvetica, sans-serif"
        fontSize="46" fontWeight="900"
        fill="url(#badgeGreen)">G</text>
      {/* bottom neon line accent */}
      <rect x="8" y="62" width="28" height="3" rx="1.5" fill="url(#badgeBlue)" opacity="0.7"/>
      <rect x="40" y="62" width="28" height="3" rx="1.5" fill="url(#badgeGreen)" opacity="0.7"/>
    </svg>
  );
}

/* ─── Main logo component ────────────────────────────────── */
const widths = { sm: 130, md: 180, lg: 240, xl: 320 };

export default function TiliGoLogo({ size = "md", className = "" }) {
  const w = widths[size] || widths.md;
  return (
    <motion.div
      className={`flex items-center gap-2 select-none ${className}`}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <TiliGoBadge size={w * 0.22} />
      <WordmarkSVG width={w} />
    </motion.div>
  );
}