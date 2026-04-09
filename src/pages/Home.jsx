import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Star, Clock, ChevronRight, Shield, MapPin, Zap, TrendingUp, RefreshCw, Facebook, Instagram, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/lib/useCart";

const CATEGORIES = [
  { label: "Të gjitha", emoji: "🍽️", key: "all" },
  { label: "Ushqim", emoji: "🥘", key: "Ushqim" },
  { label: "Pica", emoji: "🍕", key: "Pica" },
  { label: "Sushi", emoji: "🍱", key: "Sushi" },
  { label: "Burgera", emoji: "🍔", key: "Burgera" },
  { label: "Kafe & Ëmbëlsira", emoji: "☕", key: "Kafe & Ëmbëlsira" },
  { label: "Farmaci", emoji: "💊", key: "Farmaci" },
  { label: "Supermarket", emoji: "🛒", key: "Supermarket" },
];

const HERO_IMAGES = [
  "https://media.base44.com/images/public/69d519273be8cf966434f77a/dd754594c_IMG_0100.jpg",
  "https://media.base44.com/images/public/69d519273be8cf966434f77a/267962dbe_IMG_0103.jpg",
  "https://media.base44.com/images/public/69d519273be8cf966434f77a/b84f16779_IMG_0101.jpg",
  "https://media.base44.com/images/public/69d519273be8cf966434f77a/f0eaae1bd_IMG_0102.jpg",
  "https://media.base44.com/images/public/69d519273be8cf966434f77a/037c93d34_IMG_0099.jpg",
];

const MOTTOS = [
  { text: "Porosit. Ne vrapojmë.", sub: "Ushqimi yt tek dera — brenda 30 minutave." },
  { text: "E freskët. E shpejtë. Vetëm për ty.", sub: "Sepse çdo minutë e kursyer ka vlerë." },
  { text: "Nuk ke nevojë të dalësh.", sub: "Ne sjellim gjithçka që dëshiron." },
  { text: "Nga restoranti drejt zemrës sate.", sub: "Shija e vërtetë, me dorëzim që ke besim." },
  { text: "Kënaqja jote, misioni ynë.", sub: "Mbi 10,000 porosi — çdo herë me buzëqeshje." },
];

function usePullToRefresh(onRefresh) {
  const startY = useRef(0);
  const [pulling, setPulling] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const threshold = 72;
  const onTouchStart = (e) => { startY.current = e.touches[0].clientY; };
  const onTouchMove = (e) => {
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0 && window.scrollY === 0) { setPulling(true); setPullDist(Math.min(dy * 0.45, threshold + 20)); }
  };
  const onTouchEnd = () => {
    if (pullDist >= threshold) onRefresh();
    setPulling(false); setPullDist(0);
  };
  return { pulling, pullDist, threshold, onTouchStart, onTouchMove, onTouchEnd };
}

export default function Home() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState(null);
  const [mottoIdx, setMottoIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadBusinesses();
    requestLocation();
    requestNotifications();
    const timer = setInterval(() => {
      setMottoIdx(p => (p + 1) % MOTTOS.length);
      setImgIdx(p => (p + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb;
          if (city) setUserCity(city);
        } catch {}
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') await Notification.requestPermission();
  };

  const handleRefresh = async () => { await loadBusinesses(); };
  const ptr = usePullToRefresh(handleRefresh);

  const loadBusinesses = async () => {
    setLoading(true);
    const data = await base44.entities.Business.filter({ status: "approved" });
    setBusinesses(data);
    setLoading(false);
  };

  const filtered = businesses.filter(b => {
    const matchSearch = b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || b.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}
      onTouchStart={ptr.onTouchStart} onTouchMove={ptr.onTouchMove} onTouchEnd={ptr.onTouchEnd}>

      <AnimatePresence>
        {ptr.pulling && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: ptr.pullDist }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center overflow-hidden" style={{ background: 'var(--stat-bg)' }}>
            <RefreshCw size={18} className={`text-emerald-500 ${ptr.pullDist >= ptr.threshold ? "animate-spin" : ""}`} />
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar cart={cart} onCartClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart} />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden" style={{ minHeight: 580 }}>
        {/* Photo crossfade */}
        <div className="absolute inset-0">
          {HERO_IMAGES.map((src, i) => (
            <motion.div key={src} className="absolute inset-0"
              animate={{ opacity: i === imgIdx ? 1 : 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}>
              <img src={src} alt="TiliGo" className="w-full h-full object-cover object-center" />
            </motion.div>
          ))}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(2,10,22,0.62) 0%, rgba(2,10,22,0.28) 45%, rgba(2,10,22,0.75) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,60,120,0.3) 0%, rgba(0,160,80,0.08) 100%)' }} />
        </div>

        {/* Live city badge */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="absolute top-5 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', color: '#d1fae5' }}>
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          {userCity || "Prishtinë & Kosovë"}
          {userCity && <MapPin size={11} className="text-emerald-300" />}
        </motion.div>

        {/* Image dots top-right */}
        <div className="absolute top-5 right-4 z-20 flex gap-1.5">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setImgIdx(i)} className="rounded-full transition-all duration-500"
              style={{ width: i === imgIdx ? 20 : 6, height: 6, background: i === imgIdx ? '#00ff87' : 'rgba(255,255,255,0.35)' }} />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl mx-auto px-5 pt-20 pb-28 flex flex-col items-center text-center">
          <div className="mb-7 min-h-[120px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={mottoIdx}
                initial={{ opacity: 0, y: 22, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="text-center">
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3"
                  style={{ color: '#6ee7b7', textShadow: '0 0 20px rgba(0,255,135,0.6)' }}>
                  TiliGo — Dorëzim Express
                </p>
                <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight mb-4 text-white"
                  style={{ textShadow: '0 2px 40px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.5)' }}>
                  {MOTTOS[mottoIdx].text}
                </h1>
                <p className="text-base md:text-lg font-medium max-w-md mx-auto leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.82)', textShadow: '0 1px 12px rgba(0,0,0,0.7)' }}>
                  {MOTTOS[mottoIdx].sub}
                </p>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-1.5 mt-6">
              {MOTTOS.map((_, i) => (
                <button key={i} onClick={() => setMottoIdx(i)} className="rounded-full transition-all duration-300"
                  style={{ width: i === mottoIdx ? 24 : 7, height: 7, background: i === mottoIdx ? '#fbbf24' : 'rgba(255,255,255,0.3)' }} />
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-2.5 w-full max-w-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={17} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && navigate(`/?search=${search}`)}
                placeholder="Kërko ushqim ose restorante..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.22)', color: '#ffffff' }} />
            </div>
            <button className="px-6 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-xl"
              style={{ background: 'linear-gradient(135deg,#00ff87,#00b4d8)', color: '#020c1b', boxShadow: '0 0 22px rgba(0,255,135,0.45)' }}>
              Kërko
            </button>
          </div>
        </div>

        {/* Scooter lane */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none">
          {[{ delay: 0, duration: 7, y: 8, scale: 1.1 }, { delay: 3, duration: 10, y: 0, scale: 0.8 }].map((s, i) => (
            <motion.div key={i} className="absolute" style={{ bottom: `${s.y}px`, scale: s.scale, opacity: 0.7 }}
              initial={{ x: "-80px" }} animate={{ x: "calc(100vw + 80px)" }}
              transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, repeatDelay: s.duration * 0.5, ease: "linear" }}>
              <span className="text-2xl">🛵</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b" style={{ background: 'var(--section-bg)', borderColor: 'var(--divider)' }}>
        <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-3 gap-4">
          {[
            { icon: <Zap size={18} className="text-amber-500" />, title: "Dërgim Express", sub: "20–35 min" },
            { icon: <Shield size={18} className="text-emerald-600" />, title: "100% i Sigurt", sub: "Biznese të verifikuara" },
            { icon: <TrendingUp size={18} className="text-blue-600" />, title: "10,000+ Porosi", sub: "Klientë të kënaqur" },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--stat-bg)' }}>{f.icon}</div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>{f.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-7">
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)}
              className={`category-pill flex-shrink-0 ${category === cat.key ? "active" : ""}`}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Store header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
            <span className="text-xl">🏪</span> Të gjitha Dyqanet
            <span className="ml-1 font-normal text-sm" style={{ color: 'var(--text-muted)' }}>({filtered.length})</span>
          </h2>
          {businesses.length > 0 && (
            <span className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {businesses.filter(b => b.is_open).length} hapur tani
            </span>
          )}
        </div>

        {loading ? (
          <div className="biz-grid">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className={`rounded-2xl overflow-hidden animate-pulse ${i === 0 ? 'biz-featured' : ''}`}
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="h-44" style={{ background: 'var(--stat-bg)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-5 rounded w-2/3" style={{ background: 'var(--stat-bg)' }} />
                  <div className="h-4 rounded w-1/2" style={{ background: 'var(--stat-bg)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>Nuk u gjetën dyqane</p>
          </div>
        ) : (
          <div className="biz-grid">
            {filtered.map((biz, i) => (
              <motion.div key={biz.id}
                className={i === 0 || (i % 7 === 3) ? 'biz-featured' : ''}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}>
                <Link to={`/dyqani/${biz.id}`} className="block h-full group">
                  <div className="rounded-2xl overflow-hidden h-full flex flex-col relative"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,135,0.35)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,255,135,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; }}>
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ height: i === 0 || (i % 7 === 3) ? 220 : 175 }}>
                      <img src={biz.image_url || `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80`}
                        alt={biz.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

                      {/* Category badge */}
                      <span className="absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.55)', color: '#e0f2fe', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)' }}>
                        {biz.category || "Ushqim"}
                      </span>

                      {/* Rating */}
                      <span className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg"
                        style={{ background: 'rgba(251,191,36,0.95)', color: '#78350f' }}>
                        <Star size={9} fill="currentColor" /> {biz.rating?.toFixed(1) || "4.8"}
                      </span>

                      {/* Open/Closed */}
                      {biz.is_open ? (
                        <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(5,150,105,0.9)', color: '#ffffff' }}>
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Hapur
                        </span>
                      ) : (
                        <span className="absolute bottom-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.5)' }}>Mbyllur</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-black text-sm leading-tight mb-1" style={{ color: 'var(--text-heading)' }}>{biz.name}</h3>
                        <p className="text-xs line-clamp-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{biz.description || "Shije të zgjedhura për ty"}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          <Clock size={10} /> {biz.delivery_time || "25 min"}
                        </span>
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(0,255,135,0.1)', color: 'var(--price-color)', border: '1px solid rgba(0,255,135,0.2)' }}>
                          {biz.delivery_fee?.toFixed(2) || "1.50"}€ dërgesa
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Register CTA */}
        <div className="mt-16 grid md:grid-cols-2 gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-3xl p-8 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#020c1b 0%,#0a2a4a 50%,#0077b6 100%)', border: '1px solid rgba(0,229,255,0.25)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="text-2xl font-black mb-2">Rrit Biznesin Tënd</h3>
            <p className="text-white/75 text-sm mb-5 leading-relaxed">Bashkohu me TiliGo dhe rriti shitjet çdo ditë. Mijëra klientë të rinj në majë të gishtave.</p>
            <Link to="/biznesi/register"
              className="inline-flex items-center gap-2 font-black px-6 py-3 rounded-xl text-sm shadow-lg hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg,#00ff87,#00b4d8)', color: '#020c1b' }}>
              Fillo Sot <ChevronRight size={16} />
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="text-5xl mb-4">🛵</div>
            <h3 className="text-2xl font-black mb-2">Bëhu Dorëzues Elitar</h3>
            <p className="text-white/75 text-sm mb-5 leading-relaxed">Fiton para reale duke bërë diçka të thjeshtë. Oraret tuaja, rrugët tuaja.</p>
            <Link to="/dorezuesi/register"
              className="inline-flex items-center gap-2 font-black px-6 py-3 rounded-xl text-sm shadow-lg hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg,#ffffff,#d1fae5)', color: '#064e3b' }}>
              Apliko Tani <ChevronRight size={16} />
            </Link>
          </motion.div>
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="mt-12 pb-28 md:pb-0" style={{ background: '#020c1b', borderTop: '1px solid rgba(0,180,216,0.1)' }}>
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <img src="https://media.base44.com/images/public/69d519273be8cf966434f77a/9ac65c451_IMG_0066.png"
            alt="TiliGo" className="h-12 mx-auto mb-6 object-contain opacity-90" />

          {/* Social links */}
          <SocialLinks />

          {/* App install — below social */}
          <div className="mt-8">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Instalo Aplikacionin
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/shkarko-app"
                className="flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}>
                <span className="text-xl">🍎</span>
                <div className="text-left">
                  <p className="text-[10px] leading-none" style={{ color: 'rgba(255,255,255,0.45)' }}>Shkarko për</p>
                  <p className="font-bold leading-tight">iPhone / iPad</p>
                </div>
              </Link>
              <Link to="/shkarko-app"
                className="flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                style={{ background: 'rgba(0,255,135,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,255,135,0.18)', color: '#ffffff' }}>
                <span className="text-xl">🤖</span>
                <div className="text-left">
                  <p className="text-[10px] leading-none" style={{ color: 'rgba(255,255,255,0.45)' }}>Shkarko për</p>
                  <p className="font-bold leading-tight">Android</p>
                </div>
              </Link>
            </div>
          </div>

          <p className="text-xs mt-8" style={{ color: 'rgba(255,255,255,0.2)' }}>© 2025 TiliGo · Prishtinë, Kosovë</p>
        </div>
      </footer>
    </div>
  );
}

function SocialLinks() {
  const [links, setLinks] = useState({ facebook: "https://facebook.com/tiligoo", instagram: "", tiktok: "", website: "" });
  useEffect(() => {
    base44.entities.AppSettings.list().then(data => {
      const map = {};
      data.forEach(s => { map[s.key] = s.value; });
      setLinks(prev => ({ ...prev, ...map }));
    });
  }, []);

  const ICONS = [
    { key: "facebook", icon: <Facebook size={20} />, color: "#1877f2", bg: "rgba(24,119,242,0.12)", border: "rgba(24,119,242,0.3)" },
    { key: "instagram", icon: <Instagram size={20} />, color: "#e1306c", bg: "rgba(225,48,108,0.1)", border: "rgba(225,48,108,0.25)" },
    { key: "tiktok", icon: <span className="text-lg leading-none">🎵</span>, color: "#ffffff", bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.15)" },
    { key: "website", icon: <Globe size={20} />, color: "#00b4d8", bg: "rgba(0,180,216,0.1)", border: "rgba(0,180,216,0.25)" },
  ].filter(item => links[item.key]);

  if (!ICONS.length) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      {ICONS.map(({ key, icon, color, bg, border }) => (
        <motion.a key={key} href={links[key]} target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.15, y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
          style={{ background: bg, color, border: `1px solid ${border}`, boxShadow: `0 4px 20px ${bg}` }}>
          {icon}
        </motion.a>
      ))}
    </div>
  );
}