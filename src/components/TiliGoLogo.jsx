import { motion } from "framer-motion";

const LETTERS = ["T", "i", "l", "i", "G", "o"];
const LETTER_COLORS = ["#00BFFF", "#00BFFF", "#00BFFF", "#00BFFF", "#39FF6B", "#39FF6B"];

const sizes = {
  sm: { imgH: "h-7",  font: 13, moto: 16, gap: 6 },
  md: { imgH: "h-9",  font: 17, moto: 20, gap: 8 },
  lg: { imgH: "h-14", font: 28, moto: 34, gap: 12 },
  xl: { imgH: "h-20", font: 42, moto: 50, gap: 16 },
};

// Staggered wave: each letter lags behind the one before it
function LetterWave({ letter, index, color, font }) {
  return (
    <motion.span
      animate={{
        y: [0, -5, 1, -3, 0],
        rotate: [-4, 0, -5, 1, -4],
        skewX: [-6, -2, -7, -1, -6],
      }}
      transition={{
        duration: 1.6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.09,
      }}
      style={{
        fontSize: font,
        fontWeight: 900,
        fontFamily: "'Poppins','Inter',sans-serif",
        color,
        textShadow: `0 0 14px ${color}cc, 0 2px 8px rgba(0,0,0,0.4)`,
        lineHeight: 1,
        display: "inline-block",
        transformOrigin: "bottom left",
        letterSpacing: "-0.01em",
      }}
    >
      {letter}
    </motion.span>
  );
}

export default function TiliGoLogo({ size = "md", className = "" }) {
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>

      {/* ── Logo image — static ── */}
      <picture className="flex-shrink-0">
        <source
          srcSet="https://media.base44.com/images/public/69d519273be8cf966434f77a/51149fad3_IMG_0106.jpeg"
          media="(prefers-color-scheme: dark)"
        />
        <img
          src="https://media.base44.com/images/public/69d519273be8cf966434f77a/f678192b5_IMG_0105.jpeg"
          alt="TiliGo"
          className={`${s.imgH} w-auto object-contain rounded-lg flex-shrink-0`}
        />
      </picture>

      {/* ── Animated unit: letters → rope → moto ── */}
      <motion.div
        className="flex items-center"
        animate={{ y: [0, -3, 0, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Letters trailing, skewed back like dragged by speed */}
        <div className="flex items-end pb-0.5" style={{ gap: 1 }}>
          {LETTERS.map((letter, i) => (
            <LetterWave key={i} letter={letter} index={i} color={LETTER_COLORS[i]} font={s.font} />
          ))}
        </div>

        {/* Tow rope — a glowing dashed line */}
        <motion.div
          animate={{ opacity: [0.7, 1, 0.6, 1, 0.7], scaleX: [1, 0.88, 1, 0.92, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: s.gap,
            height: 2,
            transformOrigin: "left center",
            background: `linear-gradient(90deg, #39FF6B, #00BFFF)`,
            borderRadius: 2,
            boxShadow: "0 0 6px #00BFFF88",
            flexShrink: 0,
          }}
        />

        {/* 🛵 Motorcycle — faces right, leaning forward */}
        <motion.span
          animate={{
            rotate: [-3, 0, -4, 1, -3],
            scaleY: [1, 1.05, 1, 1.03, 1],
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            fontSize: s.moto,
            lineHeight: 1,
            display: "inline-block",
            filter: `drop-shadow(0 0 8px #39FF6Baa) drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
            transformOrigin: "bottom center",
          }}
        >
          🛵
        </motion.span>

        {/* Speed streaks — tiny exhaust lines */}
        <div className="flex flex-col gap-0.5 ml-0.5 opacity-70">
          {[8, 14, 6].map((w, i) => (
            <motion.div
              key={i}
              animate={{ scaleX: [1, 0.3, 1, 0.5, 1], opacity: [0.7, 0.2, 0.8, 0.3, 0.7] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
              style={{
                width: w,
                height: 1.5,
                borderRadius: 2,
                background: i % 2 === 0 ? "#00BFFF" : "#39FF6B",
                transformOrigin: "right center",
                boxShadow: `0 0 4px ${i % 2 === 0 ? "#00BFFF" : "#39FF6B"}`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}