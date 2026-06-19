import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

/**
 * Native-feeling bottom-sheet select for mobile.
 * Props: value, onChange, options=[{value, label}], label, placeholder
 */
export default function SelectDrawer({ value, onChange, options = [], label, placeholder = "Zgjidhni...", accentColor = "blue" }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  const ringColor = accentColor === "green" ? "focus:ring-green-500" : "focus:ring-blue-500";
  const checkColor = accentColor === "green" ? "text-green-600" : "text-blue-700";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className={`w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 ${ringColor}`}>
        <span className={selected ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-[61] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 mb-4" />
              {label && <p className="text-center font-bold text-gray-900 dark:text-gray-100 text-base pb-3 border-b border-gray-100 dark:border-gray-800 px-5">{label}</p>}
              <div className="py-2 max-h-72 overflow-y-auto">
                {options.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="text-gray-800 dark:text-gray-100 font-medium">{opt.label}</span>
                    {value === opt.value && <Check size={18} className={checkColor} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}