import { motion } from "framer-motion";
import { Zap, ArrowRight, Code2 } from "lucide-react";

const REF_URL = "https://app.base44.com/register?ref=PI4Q312YUWD8L9AC";

export default function Base44RefBanner() {
  return (
    <section className="max-w-2xl mx-auto px-4 py-8">
      <motion.a
        href={REF_URL}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(57,255,107,0.25)" }}
        whileTap={{ scale: 0.98 }}
        className="block rounded-3xl overflow-hidden cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #020c1b 0%, #0a2a4a 50%, #001830 100%)",
          border: "1.5px solid rgba(57,255,107,0.35)",
          boxShadow: "0 8px 32px rgba(57,255,107,0.12)",
        }}
      >
        {/* Top accent line */}
        <div style={{ height: 3, background: "linear-gradient(90deg, #39FF6B, #00BFFF, transparent)" }} />

        <div className="p-6 flex items-center gap-5">
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(57,255,107,0.15)", border: "1.5px solid rgba(57,255,107,0.4)" }}>
            <Code2 size={26} style={{ color: "#39FF6B" }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={13} style={{ color: "#00BFFF" }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#00BFFF" }}>
                Ndërto me Base44
              </span>
            </div>
            <p className="font-black text-base leading-tight mb-1" style={{ color: "#f0fffe" }}>
              TiliGo është ndërtuar me <span style={{ color: "#39FF6B" }}>Base44</span>
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(125,211,252,0.7)" }}>
              Platforma AI që transformon idetë në aplikacione reale — pa kod · pa kompleksitet
            </p>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-sm"
              style={{
                background: "linear-gradient(135deg, #39FF6B, #00BFFF)",
                color: "#020c1b",
                boxShadow: "0 4px 16px rgba(57,255,107,0.4)"
              }}>
              Provo <ArrowRight size={14} />
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {["🚀 Falas për fillim", "⚡ Ndërtim me AI", "📱 iOS & Android", "🌍 Deploy instant"].map((tag) => (
              <span key={tag} className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(125,211,252,0.8)", border: "1px solid rgba(0,191,255,0.2)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.a>
    </section>
  );
}