import { motion } from "framer-motion";

const LETTERS = ["T", "i", "l", "i", "G", "o"];
const COLORS  = ["#00BFFF","#00BFFF","#00BFFF","#00BFFF","#39FF6B","#39FF6B"];

const sizes = {
  sm: { imgH: "h-7",  font: 13, moto: 17 },
  md: { imgH: "h-9",  font: 17, moto: 22 },
  lg: { imgH: "h-14", font: 28, moto: 36 },
  xl: { imgH: "h-20", font: 42, moto: 52 },
};

export default function TiliGoLogo({ size = "md", className = "" }) {
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2 select-none overflow-hidden ${className}`}>

      {/* Logo image — static */}
      <picture className="flex-shrink-0">
        <source srcSet="https://media.base44.com/images/public/69d519273be8cf966434f77a/51149fad3_IMG_0106.jpeg" media="(prefers-color-scheme: dark)" />
        <img src="https://media.base44.com/images/public/69d519273be8cf966434f77a/f678192b5_IMG_0105.jpeg"
          alt="TiliGo" className={`${s.imgH} w-auto object-contain rounded-lg flex-shrink-0`} />
      </picture>

      {/* Animated wordmark + moto */}
      <div className="flex items-center gap-0.5">

        {/* Letters: each drops in from above, bounces, then idles */}
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ y: -40, opacity: 0, scale: 0.6 }}
            animate={[
              // Phase 1: drop in with bounce
              { y: 0, opacity: 1, scale: 1,
                transition: { type: "spring", stiffness: 500, damping: 18, delay: 0.3 + i * 0.08 } },
            ]}
            style={{
              fontSize: s.font,
              fontWeight: 900,
              fontFamily: "'Poppins','Inter',sans-serif",
              color: COLORS[i],
              textShadow: `0 0 18px ${COLORS[i]}bb`,
              lineHeight: 1,
              display: "inline-block",
            }}
          >
            {/* Idle float after landing */}
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.9 + i * 0.1 }}
              style={{ display: "inline-block" }}
            >
              {letter}
            </motion.span>
          </motion.span>
        ))}

        {/* Motorcycle: blasts in from the right, decelerates sharply, then idles */}
        <motion.span
          initial={{ x: 160, opacity: 0, scaleX: 1.5 }}
          animate={{ x: 0, opacity: 1, scaleX: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.1 }}
          style={{ fontSize: s.moto, lineHeight: 1, display: "inline-block", marginLeft: 4 }}
        >
          <motion.span
            animate={{ y: [0, -3, 0], rotate: [0, -2, 0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            style={{ display: "inline-block", filter: "drop-shadow(0 0 10px #39FF6B99)" }}
          >
            🛵
          </motion.span>
        </motion.span>

        {/* Speed lines — burst out then fade */}
        <div className="flex flex-col gap-0.5 ml-0.5">
          {[10, 16, 8].map((w, i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1, 0], opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.5, delay: 0.18 + i * 0.06, repeat: Infinity, repeatDelay: 3.5, ease: "easeOut" }}
              style={{
                width: w, height: 2, borderRadius: 2,
                background: i % 2 === 0 ? "#00BFFF" : "#39FF6B",
                transformOrigin: "left center",
                boxShadow: `0 0 4px ${i % 2 === 0 ? "#00BFFF" : "#39FF6B"}`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}