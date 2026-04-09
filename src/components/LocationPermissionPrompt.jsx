import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, X } from "lucide-react";

export default function LocationPermissionPrompt() {
  const [show, setShow] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") { setGranted(true); return; }
        if (result.state === "prompt") setTimeout(() => setShow(true), 1200);
      });
    } else {
      setTimeout(() => setShow(true), 1200);
    }
  }, []);

  const handleAllow = () => {
    setRequesting(true);
    navigator.geolocation.getCurrentPosition(
      () => { setGranted(true); setShow(false); },
      () => { setRequesting(false); setShow(false); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <AnimatePresence>
      {show && !granted && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
            onClick={() => setShow(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-sm px-4"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(135deg,#0a2a4a,#020c1b)', border: '1.5px solid rgba(0,191,255,0.35)' }}>

              {/* Animated GPS pulse visual */}
              <div className="relative h-36 flex items-center justify-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg,rgba(0,191,255,0.08),rgba(57,255,107,0.08))' }}>
                {[60,90,120].map((s, i) => (
                  <motion.div key={i}
                    className="absolute rounded-full border-2"
                    style={{ width: s, height: s, borderColor: i === 0 ? '#39FF6B' : '#00BFFF', opacity: 0.3 - i * 0.07 }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3 - i*0.07, 0.1, 0.3 - i*0.07] }}
                    transition={{ repeat: Infinity, duration: 2 + i * 0.4, delay: i * 0.3 }}
                  />
                ))}
                <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', boxShadow: '0 0 30px rgba(57,255,107,0.5)' }}>
                  <Navigation size={26} className="text-[#020c1b]" />
                </div>
              </div>

              <div className="px-6 pb-6">
                <h2 className="text-xl font-black text-white mb-1 mt-1">Lejo Lokacionin GPS</h2>
                <p className="text-sm mb-5" style={{ color: 'rgba(125,211,252,0.8)' }}>
                  TiliGo ka nevojë për lokacionin tuaj të saktë GPS për të:
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    { icon: "🛵", text: "Dorëzuesi të gjejë adresën tuaj saktë" },
                    { icon: "📍", text: "Llogaritje e saktë e kohës së mbërritjes" },
                    { icon: "🗺️", text: "Shikoni dorëzuesin live në hartë" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm" style={{ color: '#e0f2fe' }}>
                      <span className="text-base">{item.icon}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={handleAllow} disabled={requesting}
                  className="w-full py-4 rounded-2xl font-black text-base transition-all hover:scale-105 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b', boxShadow: '0 0 24px rgba(57,255,107,0.4)' }}>
                  <MapPin size={18} />
                  {requesting ? "Duke kërkuar..." : "Lejo Lokacionin"}
                </button>
                <button onClick={() => setShow(false)}
                  className="w-full mt-3 py-2.5 rounded-2xl text-sm font-medium transition-colors hover:bg-white/10"
                  style={{ color: 'rgba(125,211,252,0.6)' }}>
                  Jo tani
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}