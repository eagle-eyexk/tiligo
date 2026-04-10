import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Edit2, Save, X, User, Phone, Package, ChevronDown, ChevronUp, LogOut, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_LABELS = {
  e_re:"E Re", pranuar:"Pranuar", ne_pergatitje:"Në Përgatitje",
  gati_per_dorezim:"Gati", ne_rruge:"Në Rrugë", dorezuar:"Dorëzuar", anuluar:"Anuluar"
};
const STATUS_COLORS = {
  e_re:"bg-blue-100 text-blue-700", pranuar:"bg-indigo-100 text-indigo-700",
  ne_pergatitje:"bg-amber-100 text-amber-700", gati_per_dorezim:"bg-orange-100 text-orange-700",
  ne_rruge:"bg-purple-100 text-purple-700", dorezuar:"bg-green-100 text-green-700",
  anuluar:"bg-red-100 text-red-700"
};

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

  // Login form for non-logged users
  const [loginForm, setLoginForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (profile) loadOrders();
  }, [profile]);

  const loadOrders = async () => {
    setLoading(true);
    const data = await base44.entities.Order.filter({ customer_phone: profile.phone }, "-created_date");
    setOrders(data);
    setLoading(false);
    // Load coupons for this user
    const c = await base44.entities.Coupon.list();
    setCoupons(c.filter(x => x.code.startsWith("WELCOME-" + profile.phone)));
  };

  const login = (e) => {
    e.preventDefault();
    if (!loginForm.name || !loginForm.phone) return;
    const p = { name: loginForm.name, phone: loginForm.phone };
    localStorage.setItem("tiligo_user_profile", JSON.stringify(p));
    setProfile(p);
  };

  const logout = () => {
    localStorage.removeItem("tiligo_user_profile");
    setProfile(null);
    setOrders([]);
  };

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
  const totalSpent = completedOrders.reduce((s, o) => s + (o.total || 0), 0);

  if (!profile) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
        <div className="sticky top-0 z-50" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', backdropFilter: 'blur(20px)' }}>
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
            <button onClick={() => navigate("/")} style={{ color: '#00BFFF' }}><ArrowLeft size={22} /></button>
            <h1 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Porositë e Mia</h1>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-7" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🛵</div>
              <h2 className="font-black text-xl" style={{ color: 'var(--text-heading)' }}>Hyr në Llogarinë Tënde</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Shiko të gjitha porositë dhe menaxho informacionin tënd</p>
              <div className="mt-3 px-4 py-2 rounded-2xl inline-block" style={{ background: 'rgba(57,255,107,0.12)', border: '1px solid rgba(57,255,107,0.3)' }}>
                <p className="text-xs font-bold" style={{ color: '#39FF6B' }}>🎁 Bonus mirëseardhje 2€ për porosinë e parë!</p>
              </div>
            </div>
            <form onSubmit={login} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-muted)' }}>Emri i Plotë</label>
                <input value={loginForm.name} onChange={e => setLoginForm({ ...loginForm, name: e.target.value })}
                  placeholder="Arben Krasniqi" required
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  style={{ background: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-muted)' }}>Numri i Telefonit</label>
                <input value={loginForm.phone} onChange={e => setLoginForm({ ...loginForm, phone: e.target.value })}
                  placeholder="+383 44 000 000" required
                  className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                  style={{ background: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-primary)' }} />
              </div>
              <button type="submit"
                className="w-full font-black py-3.5 rounded-2xl text-sm transition-all active:scale-95 mt-2"
                style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b', boxShadow: '0 0 18px rgba(57,255,107,0.3)' }}>
                Hyr / Regjistrohu
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate("/")} style={{ color: '#00BFFF' }}><ArrowLeft size={22} /></button>
          <div className="flex-1">
            <h1 className="font-black text-sm" style={{ color: 'var(--text-heading)' }}>Porositë e Mia</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{profile.name}</p>
          </div>
          <button onClick={logout} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid var(--nav-border)' }}>
            <LogOut size={15} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Porosi", value: orders.length, icon: "📦" },
            { label: "Dorëzuara", value: completedOrders.length, icon: "✅" },
            { label: "Shpenzuar", value: `${totalSpent.toFixed(2)}€`, icon: "💰" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-3 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="text-xl mb-1">{s.icon}</div>
              <p className="font-black text-sm" style={{ color: 'var(--text-heading)' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Welcome coupon */}
        {coupons.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg,rgba(57,255,107,0.15),rgba(0,191,255,0.1))', border: '1px solid rgba(57,255,107,0.4)' }}>
            <div className="text-2xl">🎁</div>
            <div className="flex-1">
              <p className="font-black text-sm" style={{ color: '#39FF6B' }}>Kuponi Juaj i Mirëseardhjes</p>
              <p className="font-mono font-black text-lg tracking-widest" style={{ color: 'var(--text-heading)' }}>{coupons[0].code}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Zbritje: -{coupons[0].discount_amount?.toFixed(2)}€ · Përdore në checkout</p>
            </div>
          </motion.div>
        )}

        {/* Orders list */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: 'var(--card-bg)' }} />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Nuk keni porosi akoma</p>
            <button onClick={() => navigate("/")}
              className="mt-4 font-bold px-6 py-3 rounded-2xl text-sm"
              style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b' }}>
              Porosit Tani →
            </button>
          </div>
        ) : orders.map((order, i) => (
          <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            {/* Row */}
            <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(251,191,36,0.15)' }}>
                <Package size={17} style={{ color: '#FBBF24' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-black text-sm" style={{ color: '#FBBF24' }}>#{order.order_code}</p>
                  {order.priority && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171' }}>⚡ Priority</span>}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{order.business_name} · {new Date(order.created_date).toLocaleDateString("sq-AL")}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                {expanded === order.id ? <ChevronUp size={15} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />}
              </div>
            </div>

            <AnimatePresence>
              {expanded === order.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  style={{ borderTop: '1px solid var(--divider)' }}>
                  <div className="p-4 space-y-3">
                    {editOrder === order.id ? (
                      <div className="space-y-2">
                        {[
                          { key: "customer_name", label: "Emri", placeholder: "Emri i plotë" },
                          { key: "customer_phone", label: "Telefoni", placeholder: "+383..." },
                          { key: "customer_address", label: "Adresa", placeholder: "Adresa" },
                          { key: "notes", label: "Shënime", placeholder: "Shënime..." },
                        ].map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label className="text-xs font-bold block mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
                            <input value={editForm[key] || ""} onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                              placeholder={placeholder}
                              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                              style={{ background: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-primary)' }} />
                          </div>
                        ))}
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => setEditOrder(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1"
                            style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)', border: '1px solid var(--nav-border)' }}>
                            <X size={14} /> Anulo
                          </button>
                          <button onClick={() => saveEdit(order)} className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1"
                            style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b' }}>
                            <Save size={14} /> Ruaj
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm space-y-1">
                          <p style={{ color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-muted)' }}>Adresa:</span> {order.customer_address}</p>
                          {order.notes && <p style={{ color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-muted)' }}>Shënime:</span> {order.notes}</p>}
                        </div>
                        <div className="rounded-xl p-3 space-y-1" style={{ background: 'rgba(0,40,80,0.4)', border: '1px solid var(--divider)' }}>
                          {order.items?.map((item, j) => (
                            <div key={j} className="flex justify-between text-xs">
                              <span style={{ color: 'var(--text-secondary)' }}>{item.qty}× {item.name}</span>
                              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{(item.price * item.qty).toFixed(2)}€</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-black text-sm pt-1" style={{ borderTop: '1px solid var(--divider)', color: 'var(--text-heading)' }}>
                            <span>Total</span><span style={{ color: '#39FF6B' }}>{order.total?.toFixed(2)}€</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {["e_re","pranuar","ne_pergatitje"].includes(order.status) && (
                            <button onClick={() => startEdit(order)}
                              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
                              style={{ background: 'rgba(0,191,255,0.12)', color: '#00BFFF', border: '1px solid rgba(0,191,255,0.25)' }}>
                              <Edit2 size={12} /> Ndrysho Info
                            </button>
                          )}
                          <Link to={`/gjurmo/${order.order_code}`}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
                            style={{ background: 'rgba(57,255,107,0.12)', color: '#39FF6B', border: '1px solid rgba(57,255,107,0.25)' }}>
                            <MapPin size={12} /> Gjurmo
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}