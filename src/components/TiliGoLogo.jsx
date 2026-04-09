import { motion } from "framer-motion";

const LETTERS = ["T", "i", "l", "i", "G", "o"];
// G and o are green (logo colors), rest are blue
const LETTER_COLORS = ["#00BFFF", "#00BFFF", "#00BFFF", "#00BFFF", "#39FF6B", "#39FF6B"];

const sizes = {
  sm: { height: 28, font: 18, moto: 22, gap: 4 },
  md: { height: 36, font: 22, moto: 26, gap: 5 },
  lg: { height: 56, font: 36, moto: 40, gap: 7 },
  xl: { height: 80, font: 52, moto: 56, gap: 9 },
};

export default function TiliGoLogo({ size = "md", className = "" }) {
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center overflow-hidden ${className}`}
      style={{ height: s.height, minWidth: 0 }}>

      {/* Motorcycle — leads the pack */}
      <motion.div
        initial={{ x: -120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0 }}
        style={{ fontSize: s.moto, lineHeight: 1, display: "inline-block", flexShrink: 0 }}
      >
        🛵
      </motion.div>

      {/* Letters trail behind the moto */}
      <div className="flex items-center" style={{ marginLeft: s.gap }}>
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ x: -180, opacity: 0, scale: 0.4 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
              delay: 0.06 + i * 0.07,
            }}
            style={{
              fontSize: s.font,
              fontWeight: 900,
              fontFamily: "'Poppins', 'Inter', sans-serif",
              color: LETTER_COLORS[i],
              lineHeight: 1,
              textShadow: `0 0 12px ${LETTER_COLORS[i]}88`,
              letterSpacing: "-0.01em",
              display: "inline-block",
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </div>
  );
}