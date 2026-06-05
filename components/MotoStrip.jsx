import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOTOS = ["🛵", "🏍️", "🚗", "🚕", "🛺", "🚐", "🛻", "🚚", "🚴", "🛴"];

const MESSAGES = [
  "Dorëzim i shpejtë! 🚀",
  "Shijoje ushqimin tënd! ❤️",
  "TiliGo — gjithmonë pranë teje!",
  "Porosit. Priti. Shijo! 😋",
  "Dërgojmë me dashuri! 💚",
  "Çdo porosit rëndësi! ⭐",
  "Shpejtë si era! 💨",
  "Partneri yt i dorëzimit!",
  "Nga ne tek ti, me kujdes! 🙏",
  "Prishtina's #1 delivery! 🇽🇰",
];

export default function MotoStrip() {
  const [idx, setIdx] = useState(0);
  const [motoIdx, setMotoIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(Math.floor(Math.random() * MESSAGES.length));
      setMotoIdx(Math.floor(Math.random() * MOTOS.length));
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-bold overflow-hidden"
      style={{
        background: "linear-gradient(90deg,#0066FF,#00BFFF 40%,#00FF7F 70%,#7FFF00)",
        color: "#020c1b",
        letterSpacing: "0.03em",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={motoIdx}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 30, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="text-base"
        >
          {MOTOS[motoIdx]}
        </motion.span>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {MESSAGES[idx]}
        </motion.span>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.span
          key={motoIdx + 100}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="text-base"
        >
          {MOTOS[(motoIdx + 3) % MOTOS.length]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}