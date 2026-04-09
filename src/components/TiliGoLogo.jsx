import { motion } from "framer-motion";

const sizes = {
  sm: "h-7",
  md: "h-10",
  lg: "h-14",
  xl: "h-20",
};

export default function TiliGoLogo({ size = "md", className = "" }) {
  const h = sizes[size] || sizes.md;

  return (
    <motion.div
      className={`flex items-center select-none ${className}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <img
        src="https://media.base44.com/images/public/69d519273be8cf966434f77a/e19f2a0ad_IMG_0107.jpeg"
        alt="TiliGo"
        className={`${h} w-auto object-contain`}
        style={{ maxWidth: 160 }}
      />
    </motion.div>
  );
}