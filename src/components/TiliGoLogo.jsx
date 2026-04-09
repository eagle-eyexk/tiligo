import { motion } from "framer-motion";

const LETTERS = ["T", "i", "l", "i", "G", "o"];
const LETTER_COLORS = ["#00BFFF", "#00BFFF", "#00BFFF", "#00BFFF", "#39FF6B", "#39FF6B"];

const sizes = {
  sm: { imgH: "h-7",  font: 16, moto: 18 },
  md: { imgH: "h-9",  font: 20, moto: 22 },
  lg: { imgH: "h-14", font: 32, moto: 36 },
  xl: { imgH: "h-20", font: 46, moto: 50 },
};

export default function TiliGoLogo({ size = "md", className = "" }) {
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-1.5 overflow-hidden ${className}`}>

      {/* ── Static logo image ── */}
      <picture className="flex-shrink-0">
        <source
          srcSet="https://media.base44.com/images/public/69d519273be8cf966434f77a/51149fad3_IMG_0106.jpeg"
          media="(prefers-color-scheme: dark)"
        />
        <img
          src="https://media.base44.com/images/public/69d519273be8cf966434f77a/f678192b5_IMG_0105.jpeg"
          alt="TiliGo"
          className={`${s.imgH} w-auto object-contain rounded-lg`}
        />
      </picture>

      {/* ── Motorcycle bursts out of logo + drags letters ── */}
      <div className="flex items-center relative overflow-hidden">
        {/* Moto — launches from x=0 (logo edge) to final pos */}
        <motion.span
          initial={{ x: -60, opacity: 0, scale: 0.5 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.1 }}
          style={{ fontSize: s.moto, lineHeight: 1, display: "inline-block" }}
        >
          🛵
        </motion.span>

        {/* Letters trail behind the moto one by one */}
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ x: -80, opacity: 0, y: -4 }}
            animate={{ x: 0, opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 22,
              delay: 0.18 + i * 0.07,
            }}
            style={{
              fontSize: s.font,
              fontWeight: 900,
              fontFamily: "'Poppins','Inter',sans-serif",
              color: LETTER_COLORS[i],
              lineHeight: 1,
              textShadow: `0 0 10px ${LETTER_COLORS[i]}99`,
              letterSpacing: "-0.01em",
              display: "inline-block",
              marginLeft: i === 0 ? 3 : 0,
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </div>
  );
}