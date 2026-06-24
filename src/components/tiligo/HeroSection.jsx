import React, { useState, useEffect } from "react";
import { Search, MapPin, Info } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";
import { Link } from "react-router-dom";

const HERO_IMAGES = [
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/7594f645f_IMG_0085.jpeg",
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/063e5673b_IMG_0099.jpg",
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/af35b0d9e_IMG_0103.jpg",
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/fbcea18ca_IMG_0101.jpg",
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/c4008c533_IMG_0100.jpg",
  "https://media.base44.com/images/public/6a381c14e4aa9004665edfee/f2c279261_IMG_0102.jpg",
];

const SUGGESTIONS = [
  "Pica e nxehtë 🍕", "Burger juicy 🍔", "Sushi premium 🍣",
  "Farmaci urgjente 💊", "Kafe e mëngjesit ☕", "Supermarket 🛒",
];

export default function HeroSection({ onSearch }) {
  const [query, setQuery] = useState("");
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImg(i => (i + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative overflow-hidden mx-4 mt-4 rounded-3xl" style={{ minHeight: "340px" }}>
      {/* Background image slideshow */}
      {HERO_IMAGES.map((img, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === currentImg ? 1 : 0 }}>
          <img src={img} alt="" className="w-full h-full object-cover"
            style={{ filter: "blur(3px) brightness(0.62) saturate(1.3) contrast(1.05)", transform: "scale(1.06)" }} />
        </div>
      ))}

      {/* Cinematic gradient overlay — lighter, warm at top, deep at bottom */}
      <div className="absolute inset-0 rounded-3xl" style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.22) 40%, rgba(0,0,0,0.55) 100%)"
      }} />

      {/* Content */}
      <div className="relative px-6 py-10 md:py-14 text-center space-y-5">
        <div className="flex justify-center">
          <img src={LOGO_URL} alt="TiliGo"
            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-2xl shadow-primary/40" />
        </div>
        <div>
          <h1 className="font-heading font-black text-2xl md:text-4xl text-white">
            TiliGo — <span className="gradient-text">Shpejt</span>, me Dashuri
          </h1>
          <p className="text-white/70 text-sm md:text-base mt-2">
            Dërgesa më e shpejtë në Kosovë 🇽🇰
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="flex items-center glass rounded-2xl px-4 py-3 bg-black/30 border border-white/10">
            <MapPin size={18} className="text-primary shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); onSearch(e.target.value); }}
              placeholder="Kërko restorante, produkte... 🔍"
              className="flex-1 bg-transparent text-white placeholder:text-white/50 text-sm px-3 outline-none"
            />
            <button type="submit" className="gradient-btn px-5 py-2 rounded-xl text-sm font-bold">
              Kërko
            </button>
          </div>
        </form>

        {/* Suggestion pills */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => { setQuery(s.split(" ")[0]); onSearch(s.split(" ")[0]); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-white/80 border border-white/20 bg-white/10 hover:bg-primary/20 hover:border-primary/50 hover:text-white transition-all">
              {s}
            </button>
          ))}
        </div>

        {/* About link */}
        <div className="flex justify-center">
          <Link to="/about" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-primary transition-colors">
            <Info size={12} /> Rreth TiliGo · Impressum
          </Link>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {HERO_IMAGES.map((_, i) => (
          <button key={i} onClick={() => setCurrentImg(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImg ? "bg-primary w-4" : "bg-white/30"}`} />
        ))}
      </div>
    </div>
  );
}