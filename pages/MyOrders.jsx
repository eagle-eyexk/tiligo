import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, X, Package, ChevronDown, ChevronUp, LogOut, MapPin, Download, User, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { generateOrderPDF } from "@/lib/pdfGenerator";

const STATUS_META = {
  e_re:             { label: "E Re",           emoji: "🆕", color: "#60A5FA", bg: "linear-gradient(135deg,#1e3a8a22,#3b82f622)" },
  pranuar:          { label: "Pranuar",         emoji: "✅", color: "#818CF8", bg: "linear-gradient(135deg,#4c1d9522,#8b5cf622)" },
  ne_pergatitje:    { label: "Në Përgatitje",   emoji: "👨‍🍳", color: "#FCD34D", bg: "linear-gradient(135deg,#78350f22,#f59e0b22)" },
  gati_per_dorezim: { label: "Gati",            emoji: "📦", color: "#FB923C", bg: "linear-gradient(135deg,#9a341222,#f9731622)" },
  ne_rruge:         { label: "Në Rrugë",        emoji: "🛵", color: "#C084FC", bg: "linear-gradient(135deg,#6b21a822,#a855f722)" },
  dorezuar:         { label: "Dorëzuar",        emoji: "🎉", color: "#34D399", bg: "linear-gradient(135deg,#065f4622,#10b98122)" },
  anuluar:          { label: "Anuluar",         emoji: "❌", color: "#F87171", bg: "linear-gradient(135deg,#7f1d1d22,#ef444422)" },
};

const PROGRESS_STEPS = [
  { key: "e_re", emoji: "🆕", label: "E Re" },
  { key: "pranuar", emoji: "✅", label: "Pranuar" },
  { key: "ne_pergatitje", emoji: "👨‍🍳", label: "Gatim" },
  { key: "gati_per_dorezim", emoji: "📦", label: "Gati" },
  { key: "ne_rruge", emoji: "🛵", label: "Rrugës" },
  { key: "dorezuar", emoji: "🎉", label: "Arriti" },
];

function OrderProgressBar({ status }) {
  const idx = PROGRESS_STEPS.findIndex(s => s.key === status);
  if (status === "anuluar") return (
    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-bold" style={{ background: "rgba(239,68,68,0.1)", color: "#F87171" }}>❌ Anuluar</div>
  );
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
      {PROGRESS_STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-1 flex-shrink-0">
          <motion.div
            animate={i === idx ? { scale: [1,1.15,1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center gap-0.5">
            <span className={`text-lg transition-all ${i <= idx ? "opacity-100" : "opacity-25"}`}>{step.emoji}</span>
            <span className={`text-[9px] font-black transition-all ${i <= idx ? "opacity-100" : "opacity-30"}`} style={{ color: i <= idx ? STATUS_META[status]?.color : "#9ca3af" }}>{step.label}</span>
          </motion.div>
          {i < PROGRESS_STEPS.length - 1 && (
            <div className="w-4 h-0.5 flex-shrink-0 rounded-full transition-all mx-0.5"
              style={{ background: i < idx ? STATUS_META[status]?.color : "rgba(0,0,0,0.1)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// Creative waiting animation for active orders
function WaitingAnimation({ status }) {
  const meta = STATUS_META[status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 text-center"
      style={{ background: meta.bg, border: `1.5px solid ${meta.color}44` }}>
      <motion.div animate={{ scale: [1,1.2,1], rotate: [0,10,-10,0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="text-3xl mb-2">{meta.emoji}</motion.div>
      <p className="font-black text-sm" style={{ color: meta.color }}>{meta.label}</p>
      <div className="flex justify-center gap-1.5 mt-2">
        {[0,1,2].map(i => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
            style={{ background: meta.color }}
            animate={{ scale: [1,1.6,1], opacity: [0.4,1,0.4] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
        ))}
      </div>
    </motion.div>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tiligo_user_profile") || "null"); } catch { return null; }
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [coupons, setCoupons] = useState([]);
  const [loginForm, setLoginForm] = useState({ phone: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    const data = await base44.entities.Order.filter({ customer_phone: profile.phone }, "-created_date");
    setOrders(data);
    setLoading(false);
    const c = await base44.entities.Coupon.list();
    setCoupons(c.filter(x => x.code.startsWith("WELCOME-" + profile.phone) && x.is_active));
  };

  useEffect(() => { if (profile) loadOrders(); }, [profile]);

  // Real-time order updates
  useEffect(() => {
    if (!profile) return;
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.data?.customer_phone === profile.phone) loadOrders();
    });
    return unsub;
  }, [profile]);

  const logout = () => { localStorage.removeItem("tiligo_user_profile"); setProfile(null); setOrders([]); };

  const startEdit = (order) => {
    setEditOrder(order.id);
    setEditForm({ customer_name: order.customer_name, customer_phone: order.customer_phone, customer_address: order.customer_address, notes: order.notes || "" });
  };

  const saveEdit = async (order) => {
    await base44.entities.Order.update(order.id, editForm);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...editForm } : o));
    setEditOrder(null);
  };

  const completedOrders = orders.filter(o => o.status === "dorezuar");
  const activeOrders = orders.filter(o => !["dorezuar","anuluar"].includes(o.status));
  const totalSpent = completedOrders.reduce((s, o) => s + (o.total || 0), 0);
  const initials = profile?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) || "TG";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(""); setLoginLoading(true);
    const results = await base44.entities.Customer.filter({ phone: loginForm.phone });
    if (results.length === 0) { setLoginError("Numri i telefonit nuk u gjet!"); setLoginLoading(false); return; }
    const customer = results[0];
    if (customer.password !== loginForm.password) { setLoginError("Fjalëkalimi është i gabuar!"); setLoginLoading(false); return; }
    const p = { id: customer.id, name: customer.name, phone: customer.phone };
    localStorage.setItem("tiligo_user_profile", JSON.stringify(p));
    setProfile(p); setLoginLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (profile?.id) await base44.entities.Customer.delete(profile.id);
    localStorage.removeItem("tiligo_user_profile");
    setProfile(null); setOrders([]); setShowDeleteModal(false);
  };

  // ─── LOGIN ──────────────────────────────────────────────────
  if (!profile) return (
    <div className="min-h-screen" style={{ background: "var(--bg-body)" }}>
      <div className="sticky top-0 z-50" style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--nav-border)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} style={{ color: "#00BFFF" }}><ArrowLeft size={22} /></button>
          <h1 className="font-black text-sm" style={{ color: "var(--text-heading)" }}>Llogaria Ime</h1>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden mb-6 relative text-center p-10"
          style={{ background: "linear-gradient(160deg,#020c1b 0%,#0a2a4a 50%,#001830 100%)", border: "1px solid rgba(0,191,255,0.2)" }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20" style={{ background: "radial-gradient(circle,#39FF6B,transparent 70%)", transform: "translate(30%,-30%)" }} />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-15" style={{ background: "radial-gradient(circle,#00BFFF,transparent 70%)", transform: "translate(-30%,30%)" }} />
          </div>
          <motion.div animate={{ y: [0,-10,0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} className="text-6xl mb-4">🛵</motion.div>
          <h2 className="font-black text-3xl mb-2" style={{ color: "#fff" }}>Mirë se vini!</h2>
          <p className="text-sm" style={{ color: "rgba(125,211,252,0.8)" }}>Hyni për të parë porositë dhe kuponat tuaj</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            {["🍕","🍔","🍱","🛒","💊","☕"].map((e, i) => (
              <motion.span key={i} animate={{ y: [0,-6,0] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.25 }} className="text-xl">{e}</motion.span>
            ))}
          </div>
        </motion.div>

        {/* Login form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-3xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          <h3 className="font-black text-lg mb-5 flex items-center gap-2" style={{ color: "var(--text-heading)" }}>🔐 Hyrja e Klientit</h3>
          {loginError && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl px-4 py-3 mb-4 text-sm font-bold flex items-center gap-2"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#F87171" }}>
              ⚠️ {loginError}
            </motion.div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: "var(--text-muted)" }}>
                <User size={12} /> Numri i Telefonit
              </label>
              <input type="tel" value={loginForm.phone} onChange={e => setLoginForm({ ...loginForm, phone: e.target.value })}
                placeholder="+383 44 000 000" required
                className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-all"
                style={{ background: "var(--input-bg)", border: "2px solid var(--card-border)", color: "var(--text-primary)" }}
                onFocus={e => e.target.style.borderColor = "#00BFFF"}
                onBlur={e => e.target.style.borderColor = "var(--card-border)"} />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-2" style={{ color: "var(--text-muted)" }}>
                <Lock size={12} /> Fjalëkalimi
              </label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••" required
                className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-all"
                style={{ background: "var(--input-bg)", border: "2px solid var(--card-border)", color: "var(--text-primary)" }}
                onFocus={e => e.target.style.borderColor = "#39FF6B"}
                onBlur={e => e.target.style.borderColor = "var(--card-border)"} />
            </div>
            <motion.button type="submit" disabled={loginLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full font-black py-4 rounded-2xl text-sm transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#39FF6B,#00BFFF)", color: "#020c1b", boxShadow: "0 8px 28px rgba(57,255,107,0.35)" }}>
              {loginLoading ? "Duke hyrë... ⏳" : "Hyr në Llogari →"}
            </motion.button>
          </form>
          <p className="text-center text-xs mt-5" style={{ color: "var(--text-muted)" }}>
            Nuk keni llogari?{" "}
            <Link to="/user/register" className="font-black" style={{ color: "#39FF6B" }}>Regjistrohu & merr 2€ 🎁</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );

  // ─── DASHBOARD ──────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--bg-body)" }}>
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ background: "var(--nav-bg)", borderBottom: "1px solid var(--nav-border)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} style={{ color: "#00BFFF" }}><ArrowLeft size={22} /></button>
          <div className="flex-1">
            <h1 className="font-black text-sm" style={{ color: "var(--text-heading)" }}>Llogaria Ime</h1>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all"
            style={{ background: "rgba(255,255,255,0.07)", color: "var(--text-muted)", border: "1px solid var(--nav-border)" }}>
            <LogOut size={13} /> Dil
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ─── Profile Card ─── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(160deg,#020c1b 0%,#0a2a4a 60%,#001830 100%)", border: "1px solid rgba(0,191,255,0.2)" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle,#39FF6B,transparent 70%)", transform: "translate(30%,-30%)" }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle,#00BFFF,transparent 70%)", transform: "translate(-30%,30%)" }} />
          <div className="relative z-10 p-5">
            <div className="flex items-center gap-4 mb-4">
              <motion.div animate={{ boxShadow: ["0 0 20px rgba(57,255,107,0.2)", "0 0 40px rgba(57,255,107,0.5)", "0 0 20px rgba(57,255,107,0.2)"] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-xl"
                style={{ background: "linear-gradient(135deg,#39FF6B33,#00BFFF33)", border: "2px solid rgba(57,255,107,0.5)", color: "#39FF6B" }}>
                {initials}
              </motion.div>
              <div className="flex-1">
                <p className="text-xs font-black tracking-widest uppercase mb-0.5" style={{ color: "#00BFFF" }}>TiliGo · Cliente</p>
                <h2 className="font-black text-xl text-white">{profile.name}</h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(125,211,252,0.7)" }}>{profile.phone}</p>
              </div>
              {activeOrders.length > 0 && (
                <motion.div animate={{ scale: [1,1.08,1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex flex-col items-center px-3 py-2 rounded-2xl flex-shrink-0"
                  style={{ background: "rgba(57,255,107,0.15)", border: "1.5px solid rgba(57,255,107,0.4)" }}>
                  <span className="font-black text-sm" style={{ color: "#39FF6B" }}>{activeOrders.length}</span>
                  <span className="text-[10px]" style={{ color: "rgba(57,255,107,0.7)" }}>Aktive</span>
                </motion.div>
              )}
            </div>
            {/* Mini stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Porosi", value: orders.length, emoji: "📦" },
                { label: "Dorëzuara", value: completedOrders.length, emoji: "✅" },
                { label: "Shpenzuar", value: `${totalSpent.toFixed(0)}€`, emoji: "💰" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                  className="rounded-2xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p className="text-lg mb-0.5">{s.emoji}</p>
                  <p className="font-black text-base text-white">{s.value}</p>
                  <p className="text-[10px]" style={{ color: "rgba(125,211,252,0.6)" }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Active order live tracker ─── */}
        {activeOrders.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-4 overflow-hidden relative"
            style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.18),rgba(57,255,107,0.1))", border: "2px solid rgba(139,92,246,0.4)" }}>
            <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg,transparent,rgba(255,255,255,0.03))" }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.span animate={{ rotate: [0,15,-15,0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-2xl">🛵</motion.span>
                  <div>
                    <p className="font-black text-sm" style={{ color: "#A78BFA" }}>Porosia Aktive</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>#{activeOrders[0].order_code} · {activeOrders[0].business_name}</p>
                  </div>
                </div>
                <Link to={`/gjurmo/${activeOrders[0].order_code}`}
                  className="px-4 py-2 rounded-xl font-black text-xs text-white shadow-lg"
                  style={{ background: "linear-gradient(135deg,#A78BFA,#7C3AED)", boxShadow: "0 4px 16px rgba(139,92,246,0.4)" }}>
                  Gjurmo Live →
                </Link>
              </div>
              <OrderProgressBar status={activeOrders[0].status} />
            </div>
          </motion.div>
        )}

        {/* ─── Welcome coupon ─── */}
        {coupons.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="rounded-3xl p-4 flex items-center gap-4 cursor-pointer"
            style={{ background: "linear-gradient(135deg,rgba(57,255,107,0.15),rgba(0,191,255,0.1))", border: "2px solid rgba(57,255,107,0.45)", boxShadow: "0 0 30px rgba(57,255,107,0.15)" }}>
            <motion.div animate={{ rotate: [0,-10,10,-10,0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-4xl flex-shrink-0">🎁</motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm" style={{ color: "#39FF6B" }}>Kuponi Juaj i Mirëseardhjes!</p>
              <p className="font-mono font-black text-lg tracking-widest" style={{ color: "var(--text-heading)" }}>{coupons[0].code}</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Zbritje: <span className="font-black" style={{ color: "#39FF6B" }}>-{coupons[0].discount_amount?.toFixed(2)}€</span></p>
            </div>
          </motion.div>
        )}

        {/* ─── Orders list ─── */}
        <div>
          <h3 className="font-black text-xs tracking-widest uppercase mb-4 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
            📦 Historia e Porosive
          </h3>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="rounded-2xl h-18 animate-pulse" style={{ background: "var(--card-bg)", height: 64 }} />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <motion.div animate={{ y: [0,-10,0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-6xl mb-3">📭</motion.div>
              <p className="font-black text-base" style={{ color: "var(--text-primary)" }}>Nuk keni porosi akoma</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Bëni porosinë tuaj të parë tani!</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/")}
                className="mt-5 font-black px-8 py-3.5 rounded-2xl text-sm shadow-xl"
                style={{ background: "linear-gradient(135deg,#39FF6B,#00BFFF)", color: "#020c1b", boxShadow: "0 8px 28px rgba(57,255,107,0.35)" }}>
                Porosit Tani 🚀
              </motion.button>
            </div>
          ) : orders.map((order, i) => {
            const meta = STATUS_META[order.status] || STATUS_META.e_re;
            const isActive = !["dorezuar","anuluar"].includes(order.status);
            return (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-3xl overflow-hidden mb-3 transition-all"
                style={{ background: "var(--card-bg)", border: `1.5px solid ${expanded === order.id ? meta.color + "55" : "var(--card-border)"}`, boxShadow: expanded === order.id ? `0 8px 32px ${meta.color}22` : "none" }}>

                {/* Row header */}
                <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <motion.div whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                    style={{ background: meta.bg }}>
                    {meta.emoji}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-sm" style={{ color: "#FBBF24" }}>#{order.order_code}</p>
                      {isActive && (
                        <motion.span animate={{ scale: [1,1.1,1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: meta.color + "22", color: meta.color }}>LIVE</motion.span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{order.business_name} · {new Date(order.created_date).toLocaleDateString("sq-AL")}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                    <span className="font-black text-sm" style={{ color: "#39FF6B" }}>{order.total?.toFixed(2)}€</span>
                    {expanded === order.id ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />}
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === order.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ borderTop: `1px solid ${meta.color}22` }}>
                      <div className="p-4 space-y-4">
                        {/* Progress bar */}
                        <OrderProgressBar status={order.status} />

                        {/* Waiting animation for active */}
                        {isActive && <WaitingAnimation status={order.status} />}

                        {editOrder === order.id ? (
                          <div className="space-y-3">
                            {[
                              { key: "customer_name", label: "Emri", placeholder: "Emri i plotë" },
                              { key: "customer_phone", label: "Telefoni", placeholder: "+383..." },
                              { key: "customer_address", label: "Adresa", placeholder: "Adresa" },
                              { key: "notes", label: "Shënime", placeholder: "Shënime..." },
                            ].map(({ key, label, placeholder }) => (
                              <div key={key}>
                                <label className="text-xs font-black block mb-1" style={{ color: "var(--text-muted)" }}>{label}</label>
                                <input value={editForm[key] || ""} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                                  placeholder={placeholder}
                                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                                  style={{ background: "var(--input-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-primary)" }} />
                              </div>
                            ))}
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => setEditOrder(null)} className="flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-1"
                                style={{ background: "rgba(255,255,255,0.07)", color: "var(--text-muted)", border: "1px solid var(--nav-border)" }}>
                                <X size={14} /> Anulo
                              </button>
                              <button onClick={() => saveEdit(order)} className="flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-1"
                                style={{ background: "linear-gradient(135deg,#39FF6B,#00BFFF)", color: "#020c1b" }}>
                                <Save size={14} /> Ruaj
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="rounded-2xl p-3 space-y-1.5" style={{ background: "rgba(0,40,80,0.3)", border: "1px solid var(--divider)" }}>
                              {order.items?.map((item, j) => (
                                <div key={j} className="flex justify-between text-xs items-center">
                                  <span className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                                    <span className="w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px]" style={{ background: "rgba(0,191,255,0.15)", color: "#00BFFF" }}>{item.qty}</span>
                                    {item.name}
                                  </span>
                                  <span className="font-black" style={{ color: "var(--text-primary)" }}>{(item.price * item.qty).toFixed(2)}€</span>
                                </div>
                              ))}
                              <div className="flex justify-between font-black text-sm pt-2" style={{ borderTop: "1px solid var(--divider)", color: "var(--text-heading)" }}>
                                <span>Total</span><span style={{ color: "#39FF6B" }}>{order.total?.toFixed(2)}€</span>
                              </div>
                            </div>
                            {order.customer_address && (
                              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                <span className="font-black" style={{ color: "var(--text-muted)" }}>📍 </span>{order.customer_address}
                              </p>
                            )}
                            {order.notes && (
                              <p className="text-xs px-3 py-2 rounded-xl" style={{ background: "rgba(251,191,36,0.1)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.2)" }}>
                                📝 {order.notes}
                              </p>
                            )}
                            <div className="flex gap-2 flex-wrap">
                              {["e_re","pranuar","ne_pergatitje"].includes(order.status) && (
                                <button onClick={() => startEdit(order)}
                                  className="flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl"
                                  style={{ background: "rgba(0,191,255,0.12)", color: "#00BFFF", border: "1px solid rgba(0,191,255,0.25)" }}>
                                  ✏️ Ndrysho Info
                                </button>
                              )}
                              <Link to={`/gjurmo/${order.order_code}`}
                                className="flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl"
                                style={{ background: "rgba(57,255,107,0.12)", color: "#39FF6B", border: "1px solid rgba(57,255,107,0.25)" }}>
                                <MapPin size={12} /> Gjurmo
                              </Link>
                              <button onClick={() => generateOrderPDF(order)}
                                className="flex items-center gap-1.5 text-xs font-black px-3 py-2 rounded-xl"
                                style={{ background: "rgba(251,191,36,0.12)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.25)" }}>
                                <Download size={12} /> Fatura
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Delete Account ─── */}
        <div className="rounded-2xl p-5" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)" }}>
          <p className="font-black text-sm mb-1" style={{ color: "#F87171" }}>⚠️ Fshi Llogarinë</p>
          <p className="text-xs mb-3" style={{ color: "rgba(248,113,113,0.7)" }}>Ky veprim është i pakthyeshëm. Të gjitha të dhënat do të fshihen.</p>
          <button onClick={() => setShowDeleteModal(true)}
            className="w-full font-black py-2.5 rounded-xl text-sm transition-all active:scale-95"
            style={{ background: "rgba(220,38,38,0.15)", color: "#F87171", border: "1px solid rgba(239,68,68,0.35)" }}>
            🗑️ Fshi Llogarinë Permanentisht
          </button>
        </div>
      </div>

      {/* ─── Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }}
            onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-sm rounded-3xl p-6"
              style={{ background: "var(--card-bg)", border: "2px solid rgba(239,68,68,0.4)" }}
              onClick={e => e.stopPropagation()}>
              <div className="text-5xl text-center mb-3">🗑️</div>
              <h3 className="font-black text-lg text-center mb-2" style={{ color: "var(--text-heading)" }}>Fshi Llogarinë?</h3>
              <p className="text-sm text-center mb-6" style={{ color: "var(--text-muted)" }}>Ky veprim është permanent dhe nuk mund të kthehet.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)}
                  className="flex-1 font-black py-3 rounded-2xl text-sm"
                  style={{ background: "rgba(255,255,255,0.07)", color: "var(--text-primary)", border: "1px solid var(--nav-border)" }}>
                  Anulo
                </button>
                <button onClick={handleDeleteAccount}
                  className="flex-1 font-black py-3 rounded-2xl text-sm text-white transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}>
                  Po, Fshi!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}