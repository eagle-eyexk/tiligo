import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Trash2, Edit2, Package, ToggleLeft, ToggleRight, Upload,
  LogOut, Bell, TrendingUp, Clock, CheckCircle2, XCircle, ChefHat,
  Bike, BarChart2, Settings, AlertTriangle, FileText, ArrowRight,
  ShoppingBag, DollarSign, Flame, Sparkles, Zap, Star
} from "lucide-react";
import StatementGenerator from "@/components/StatementGenerator";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

const STATUS = {
  e_re:             { label: "🆕 New",         bg: "linear-gradient(135deg,#1e40af,#3b82f6)", color: "#fff", dot: "#60A5FA", glow: "rgba(59,130,246,0.5)" },
  pranuar:          { label: "✅ Accepted",    bg: "linear-gradient(135deg,#5b21b6,#8b5cf6)", color: "#fff", dot: "#A78BFA", glow: "rgba(139,92,246,0.5)" },
  ne_pergatitje:    { label: "👨‍🍳 Preparing",   bg: "linear-gradient(135deg,#92400e,#f59e0b)", color: "#fff", dot: "#FCD34D", glow: "rgba(245,158,11,0.5)" },
  gati_per_dorezim: { label: "📦 Ready",       bg: "linear-gradient(135deg,#9a3412,#f97316)", color: "#fff", dot: "#FB923C", glow: "rgba(249,115,22,0.5)" },
  ne_rruge:         { label: "🛵 On the way",  bg: "linear-gradient(135deg,#6b21a8,#a855f7)", color: "#fff", dot: "#C084FC", glow: "rgba(168,85,247,0.5)" },
  dorezuar:         { label: "🎉 Delivered",   bg: "linear-gradient(135deg,#065f46,#10b981)", color: "#fff", dot: "#34D399", glow: "rgba(16,185,129,0.5)" },
  anuluar:          { label: "❌ Cancelled",   bg: "linear-gradient(135deg,#7f1d1d,#ef4444)", color: "#fff", dot: "#F87171", glow: "rgba(239,68,68,0.5)" },
};

const NEXT = { e_re: "pranuar", pranuar: "ne_pergatitje", ne_pergatitje: "gati_per_dorezim" };
const NEXT_LABEL = { e_re: "✅ Accept Order", pranuar: "👨‍🍳 Start Preparing", ne_pergatitje: "📦 Mark Ready" };
const NEXT_COLOR = { e_re: "#3B82F6", pranuar: "#F59E0B", ne_pergatitje: "#F97316" };

// Animated waiting dots
function WaitingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0,1,2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full"
          style={{ background: "#F97316" }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
      ))}
    </div>
  );
}

// Creative order card with animated status timeline
function OrderCard({ order, onAdvance }) {
  const st = STATUS[order.status];
  const steps = ["e_re","pranuar","ne_pergatitje","gati_per_dorezim","ne_rruge","dorezuar"];
  const stepIdx = steps.indexOf(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-3xl overflow-hidden shadow-xl"
      style={{ background: "#fff", border: "1.5px solid rgba(0,0,0,0.06)" }}
      whileHover={{ y: -3, boxShadow: `0 20px 60px ${st.glow}` }}
      transition={{ type: "spring", damping: 20 }}>

      {/* Gradient header */}
      <div className="relative p-5 pb-4" style={{ background: st.bg }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{ background: "rgba(255,255,255,0.3)", transform: "translate(30%,-40%)" }} />
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-2xl text-white">#{order.order_code}</span>
              {order.payment_method === "cash" && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">💵 Cash</span>}
            </div>
            <p className="text-white/90 font-semibold">{order.customer_name}</p>
            <p className="text-white/70 text-xs mt-0.5">📍 {order.customer_address}</p>
          </div>
          <div className="text-right">
            <p className="font-black text-3xl text-white">{order.total?.toFixed(2)}€</p>
            <p className="text-white/70 text-xs">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-1.5">
          {steps.slice(0,5).map((s, i) => (
            <div key={s} className="flex-1 h-1.5 rounded-full transition-all duration-500"
              style={{ background: i <= stepIdx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)" }} />
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-3 space-y-1.5">
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-gray-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-600">{item.qty}</span>
              {item.name}
            </span>
            <span className="font-bold text-gray-900">{(item.price * item.qty).toFixed(2)}€</span>
          </div>
        ))}
        {order.notes && (
          <div className="mt-2 px-3 py-2 rounded-xl text-xs font-medium flex items-start gap-2" style={{ background: "#FFF7ED", color: "#C2410C" }}>
            📝 {order.notes}
          </div>
        )}
      </div>

      {/* Action */}
      <div className="px-5 pb-5 pt-2">
        {order.status === "gati_per_dorezim" ? (
          <div className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg,#fff7ed,#fed7aa)", border: "2px solid #f97316" }}>
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-2xl">🛵</motion.div>
              <div>
                <p className="font-black text-sm text-orange-800">Waiting for Courier</p>
                <div className="mt-1"><WaitingDots /></div>
              </div>
            </div>
            <Bike size={22} className="text-orange-500" />
          </div>
        ) : NEXT[order.status] ? (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => onAdvance(order)}
            className="w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-sm text-white shadow-lg transition-all"
            style={{ background: `linear-gradient(135deg, ${NEXT_COLOR[order.status]}, ${NEXT_COLOR[order.status]}cc)`, boxShadow: `0 8px 24px ${NEXT_COLOR[order.status]}55` }}>
            {NEXT_LABEL[order.status]} <ArrowRight size={16} />
          </motion.button>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [biz, setBiz] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tiligo_business") || "null"); } catch { return null; }
  });
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editOffer, setEditOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newOrderBanner, setNewOrderBanner] = useState(false);
  const [newOrderData, setNewOrderData] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", category: "", image_url: "" });
  const [offerForm, setOfferForm] = useState({ title: "", description: "", original_price: "", offer_price: "", image_url: "", items_included: "", badge: "🔥 Hot Deal", valid_until: "" });

  useEffect(() => {
    if (!biz) { navigate("/biznesi/login"); return; }
    loadData();
  }, [biz]);

  useEffect(() => {
    if (!biz) return;
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.data?.business_id === biz.id) {
        if (event.type === "create") {
          setNewOrderData(event.data);
          setNewOrderBanner(true);
          setTimeout(() => setNewOrderBanner(false), 7000);
          sendPushNotification("Porosi e Re! 🎉", `#${event.data?.order_code} · ${event.data?.total?.toFixed(2)}€ · ${event.data?.customer_name}`, "🛒");
        }
        loadOrders();
      }
    });
    return unsub;
  }, [biz]);

  // Request push notification permission for businesses
  useEffect(() => {
    if (!biz) return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [biz]);

  const sendPushNotification = (title, body, icon = "🔔") => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${icon} ${title}`, { body, icon: "https://media.base44.com/images/public/69d519273be8cf966434f77a/9ac65c451_IMG_0066.png", badge: "https://media.base44.com/images/public/69d519273be8cf966434f77a/9ac65c451_IMG_0066.png" });
    }
  };

  const loadData = async () => { setLoading(true); await Promise.all([loadOrders(), loadProducts(), loadOffers()]); setLoading(false); };
  const loadOrders = async () => { const d = await base44.entities.Order.filter({ business_id: biz.id }, "-created_date"); setOrders(d); };
  const loadProducts = async () => { const d = await base44.entities.Product.filter({ business_id: biz.id }); setProducts(d); };
  const loadOffers = async () => { const d = await base44.entities.Offer.filter({ business_id: biz.id }); setOffers(d); };

  const toggleOpen = async () => {
    await base44.entities.Business.update(biz.id, { is_open: !biz.is_open });
    const nb = { ...biz, is_open: !biz.is_open };
    setBiz(nb); localStorage.setItem("tiligo_business", JSON.stringify(nb));
  };

  const updateOrderStatus = async (order) => {
    const next = NEXT[order.status]; if (!next) return;
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next } : o));
    await base44.entities.Order.update(order.id, { status: next });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setProductForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    const data = { ...productForm, price: parseFloat(productForm.price), business_id: biz.id, business_name: biz.name, is_available: true };
    if (editProduct) await base44.entities.Product.update(editProduct.id, data);
    else await base44.entities.Product.create(data);
    setShowProductForm(false); setEditProduct(null);
    setProductForm({ name: "", description: "", price: "", category: "", image_url: "" });
    loadProducts();
  };

  const deleteProduct = async (id) => { if (!confirm("Delete this item?")) return; await base44.entities.Product.delete(id); loadProducts(); };

  const openEditProduct = (prod) => {
    setEditProduct(prod);
    setProductForm({ name: prod.name, description: prod.description || "", price: String(prod.price), category: prod.category || "", image_url: prod.image_url || "" });
    setShowProductForm(true);
  };

  const saveOffer = async (e) => {
    e.preventDefault();
    const data = {
      ...offerForm,
      original_price: parseFloat(offerForm.original_price) || 0,
      offer_price: parseFloat(offerForm.offer_price),
      items_included: offerForm.items_included.split(",").map(s => s.trim()).filter(Boolean),
      business_id: biz.id, business_name: biz.name, is_active: true
    };
    if (editOffer) await base44.entities.Offer.update(editOffer.id, data);
    else await base44.entities.Offer.create(data);
    setShowOfferForm(false); setEditOffer(null);
    setOfferForm({ title: "", description: "", original_price: "", offer_price: "", image_url: "", items_included: "", badge: "🔥 Hot Deal", valid_until: "" });
    loadOffers();
  };
  const deleteOffer = async (id) => { if (!confirm("Delete this offer?")) return; await base44.entities.Offer.delete(id); loadOffers(); };
  const openEditOffer = (offer) => {
    setEditOffer(offer);
    setOfferForm({ title: offer.title, description: offer.description || "", original_price: String(offer.original_price || ""), offer_price: String(offer.offer_price), image_url: offer.image_url || "", items_included: (offer.items_included || []).join(", "), badge: offer.badge || "🔥 Hot Deal", valid_until: offer.valid_until || "" });
    setShowOfferForm(true);
  };
  const toggleOffer = async (offer) => { await base44.entities.Offer.update(offer.id, { is_active: !offer.is_active }); loadOffers(); };

  const logout = () => { localStorage.removeItem("tiligo_business"); navigate("/"); };
  if (!biz) return null;

  const pendingOrders = orders.filter(o => ["e_re","pranuar","ne_pergatitje","gati_per_dorezim"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "dorezuar");
  const cancelledOrders = orders.filter(o => o.status === "anuluar");
  const todayOrders = completedOrders.filter(o => new Date(o.created_date).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalRevenue = completedOrders.reduce((s, o) => s + (o.total || 0), 0);

  const TABS = [
    { key: "orders", icon: "🛒", label: "Orders", badge: pendingOrders.length },
    { key: "products", icon: "🍽️", label: "Menu" },
    { key: "offers", icon: "🎯", label: "Offers", badge: offers.filter(o => o.is_active).length || undefined },
    { key: "analytics", icon: "📊", label: "Analytics" },
    { key: "history", icon: "📋", label: "History" },
    { key: "statement", icon: "📄", label: "Statement" },
    { key: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F0F4FF" }}>

      {/* ── NEW ORDER ALERT ── */}
      <AnimatePresence>
        {newOrderBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
            <motion.div
              animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
              className="rounded-3xl p-4 shadow-2xl flex items-center gap-4"
              style={{ background: "linear-gradient(135deg,#1e40af,#7c3aed)", border: "2px solid rgba(255,255,255,0.3)" }}>
              <motion.div animate={{ rotate: [0,15,-15,0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="text-3xl">🔔</motion.div>
              <div className="flex-1">
                <p className="font-black text-white text-sm">New Order Arrived!</p>
                {newOrderData && <p className="text-white/70 text-xs">#{newOrderData.order_code} · {newOrderData.total?.toFixed(2)}€</p>}
              </div>
              <button onClick={() => setNewOrderBanner(false)} className="text-white/60 hover:text-white text-lg">✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 shadow-sm" style={{ background: "rgba(240,244,255,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {biz.image_url
                ? <img src={biz.image_url} className="w-11 h-11 rounded-2xl object-cover shadow-md" />
                : <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md" style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>🍽️</div>
              }
              <motion.span
                animate={biz.is_open ? { scale: [1,1.3,1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${biz.is_open ? "bg-emerald-400" : "bg-gray-300"}`} />
            </div>
            <div>
              <p className="font-black text-sm text-gray-900">{biz.name}</p>
              <p className="text-xs font-semibold" style={{ color: biz.is_open ? "#10b981" : "#9ca3af" }}>
                {biz.is_open ? "✦ Open · Accepting orders" : "● Closed"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingOrders.length > 0 && (
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#fef3c7,#fde68a)" }}>
                <Bell size={17} style={{ color: "#d97706" }} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md">{pendingOrders.length}</span>
              </motion.div>
            )}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleOpen}
              className="flex items-center gap-2 text-sm font-black px-4 py-2 rounded-xl shadow-md transition-all"
              style={biz.is_open
                ? { background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }
                : { background: "#F3F4F6", color: "#374151" }}>
              {biz.is_open ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
              {biz.is_open ? "Open" : "Closed"}
            </motion.button>
            <button onClick={logout} className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-colors">
              <LogOut size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="max-w-5xl mx-auto px-4 pt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { emoji: "🛒", label: "Active Orders", value: pendingOrders.length, grad: "linear-gradient(135deg,#1e40af,#3b82f6)", glow: "rgba(59,130,246,0.3)" },
            { emoji: "💰", label: "Today's Revenue", value: `${todayRevenue.toFixed(2)}€`, grad: "linear-gradient(135deg,#065f46,#10b981)", glow: "rgba(16,185,129,0.3)" },
            { emoji: "✅", label: "Delivered", value: completedOrders.length, grad: "linear-gradient(135deg,#5b21b6,#8b5cf6)", glow: "rgba(139,92,246,0.3)" },
            { emoji: "🍽️", label: "Menu Items", value: products.length, grad: "linear-gradient(135deg,#92400e,#f59e0b)", glow: "rgba(245,158,11,0.3)" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: "spring" }}
              className="rounded-3xl p-5 text-white relative overflow-hidden shadow-lg"
              style={{ background: s.grad, boxShadow: `0 8px 32px ${s.glow}` }}>
              <div className="absolute -top-4 -right-4 text-5xl opacity-20">{s.emoji}</div>
              <p className="text-3xl mb-0.5">{s.emoji}</p>
              <p className="font-black text-2xl">{s.value}</p>
              <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="sticky top-16 z-30 shadow-sm" style={{ background: "rgba(240,244,255,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto no-scrollbar gap-1 py-2">
          {TABS.map(t => (
            <motion.button key={t.key} onClick={() => setTab(t.key)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="relative flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap"
              style={tab === t.key
                ? { background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", color: "#fff", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }
                : { background: "rgba(0,0,0,0.04)", color: "#6B7280" }}>
              {t.icon} {t.label}
              {t.badge > 0 && <span className="ml-0.5 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">{t.badge}</span>}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div className="space-y-4">
            {loading ? (
              [1,2].map(i => <div key={i} className="rounded-3xl h-48 animate-pulse shadow-sm" style={{ background: "rgba(0,0,0,0.06)" }} />)
            ) : pendingOrders.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 rounded-3xl shadow-sm"
                style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.06),rgba(139,92,246,0.06))", border: "2px dashed rgba(99,102,241,0.2)" }}>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl mb-4">🧑‍🍳</motion.div>
                <p className="font-black text-gray-700 text-lg">All Caught Up!</p>
                <p className="text-sm text-gray-400 mt-2">New orders will appear here in real-time ⚡</p>
                {!biz.is_open && (
                  <motion.button whileHover={{ scale: 1.05 }} onClick={toggleOpen}
                    className="mt-5 font-black px-6 py-3 rounded-2xl text-white text-sm shadow-lg"
                    style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                    Open Your Store 🏪
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {pendingOrders.map(order => (
                    <OrderCard key={order.id} order={order} onAdvance={updateOrderStatus} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="font-black text-gray-900 text-lg">Your Menu 🍽️</h2>
                <p className="text-sm text-gray-400">{products.length} items live</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setEditProduct(null); setProductForm({ name: "", description: "", price: "", category: "", image_url: "" }); setShowProductForm(true); }}
                className="flex items-center gap-2 text-sm font-black px-5 py-3 rounded-2xl text-white shadow-lg"
                style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
                <Plus size={16} /> Add Item
              </motion.button>
            </div>

            <AnimatePresence>
              {showProductForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center px-4 pb-4 md:pb-0 backdrop-blur-md">
                  <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className="rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
                    style={{ background: "#fff" }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>🍽️</div>
                      <div>
                        <h3 className="font-black text-xl text-gray-900">{editProduct ? "Edit Item" : "New Menu Item"}</h3>
                        <p className="text-xs text-gray-400">Fill in the details below</p>
                      </div>
                    </div>
                    <form onSubmit={saveProduct} className="space-y-4">
                      {[
                        { key: "name", label: "Item Name *", placeholder: "e.g. Margherita Pizza 🍕", required: true },
                        { key: "description", label: "Description", placeholder: "What makes it special..." },
                        { key: "category", label: "Category", placeholder: "e.g. Pizza, Burger, Dessert" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">{f.label}</label>
                          <input value={productForm[f.key]} onChange={e => setProductForm({...productForm, [f.key]: e.target.value})}
                            placeholder={f.placeholder} required={f.required}
                            className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-2xl px-4 py-3 text-sm outline-none transition-colors bg-gray-50" />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Price (€) *</label>
                        <input type="number" step="0.01" min="0" value={productForm.price}
                          onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="0.00" required
                          className="w-full border-2 border-gray-100 focus:border-indigo-400 rounded-2xl px-4 py-3 text-sm outline-none bg-gray-50" />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Photo 📸</label>
                        <label className="flex items-center gap-3 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-4 cursor-pointer transition-colors bg-indigo-50/50">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>📸</div>
                          <span className="text-sm text-gray-500">{uploading ? "Uploading..." : productForm.image_url ? "✓ Photo ready!" : "Upload product photo"}</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {productForm.image_url && <img src={productForm.image_url} className="mt-2 w-full h-36 object-cover rounded-2xl" />}
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowProductForm(false)}
                          className="flex-1 bg-gray-100 text-gray-700 font-black py-3.5 rounded-2xl text-sm">Cancel</button>
                        <motion.button whileHover={{ scale: 1.02 }} type="submit"
                          className="flex-1 font-black py-3.5 rounded-2xl text-sm text-white shadow-lg"
                          style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                          {editProduct ? "Save Changes ✓" : "Add to Menu 🚀"}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {products.length === 0 ? (
              <div className="text-center py-20 rounded-3xl" style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.06),rgba(249,115,22,0.06))", border: "2px dashed rgba(245,158,11,0.3)" }}>
                <div className="text-6xl mb-3">🍽️</div>
                <p className="font-black text-gray-700 text-lg">Empty Menu</p>
                <p className="text-sm text-gray-400 mt-1">Add your first item and start selling!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((prod, i) => (
                  <motion.div key={prod.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -3, boxShadow: "0 16px 40px rgba(0,0,0,0.12)" }}
                    className="bg-white rounded-3xl shadow-md flex items-center overflow-hidden border border-gray-100 transition-all">
                    {prod.image_url
                      ? <img src={prod.image_url} className="w-28 h-28 object-cover flex-shrink-0" />
                      : <div className="w-28 h-28 flex items-center justify-center flex-shrink-0 text-4xl" style={{ background: "linear-gradient(135deg,#f3f4f6,#e5e7eb)" }}>🍽️</div>
                    }
                    <div className="flex-1 px-4 py-3 min-w-0">
                      <p className="font-black text-sm text-gray-900">{prod.name}</p>
                      {prod.category && <span className="text-[11px] px-2 py-0.5 rounded-full font-black inline-block mt-0.5" style={{ background: "linear-gradient(135deg,#3b82f622,#8b5cf622)", color: "#4F46E5" }}>{prod.category}</span>}
                      <p className="text-xs text-gray-400 line-clamp-1 mt-1">{prod.description}</p>
                      <p className="font-black text-lg mt-1" style={{ color: "#10b981" }}>{prod.price?.toFixed(2)}€</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 pr-4">
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => openEditProduct(prod)} className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "linear-gradient(135deg,#dbeafe,#ede9fe)" }}><Edit2 size={14} className="text-indigo-600"/></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => deleteProduct(prod.id)} className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "#fee2e2" }}><Trash2 size={14} className="text-red-500"/></motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── OFFERS / COMBOS ── */}
        {tab === "offers" && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="font-black text-gray-900 text-lg">Ofertat & Combo 🎯</h2>
                <p className="text-sm text-gray-400">{offers.filter(o=>o.is_active).length} aktive · {offers.length} gjithsej</p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { setEditOffer(null); setOfferForm({ title: "", description: "", original_price: "", offer_price: "", image_url: "", items_included: "", badge: "🔥 Hot Deal", valid_until: "" }); setShowOfferForm(true); }}
                className="flex items-center gap-2 text-sm font-black px-5 py-3 rounded-2xl text-white shadow-lg"
                style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}>
                <Plus size={16} /> New Offer
              </motion.button>
            </div>

            <AnimatePresence>
              {showOfferForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center px-4 pb-4 md:pb-0 backdrop-blur-md">
                  <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className="rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto bg-white">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}>🎯</div>
                      <div>
                        <h3 className="font-black text-xl text-gray-900">{editOffer ? "Edit Offer" : "Create Offer / Combo"}</h3>
                        <p className="text-xs text-gray-400">Attract customers with amazing deals</p>
                      </div>
                    </div>
                    <form onSubmit={saveOffer} className="space-y-4">
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Offer Title *</label>
                        <input value={offerForm.title} onChange={e => setOfferForm({...offerForm, title: e.target.value})} placeholder="e.g. Family Feast Combo 🍕🍔" required className="w-full border-2 border-gray-100 focus:border-orange-400 rounded-2xl px-4 py-3 text-sm outline-none bg-gray-50" />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Description</label>
                        <input value={offerForm.description} onChange={e => setOfferForm({...offerForm, description: e.target.value})} placeholder="What's included, why it's special..." className="w-full border-2 border-gray-100 focus:border-orange-400 rounded-2xl px-4 py-3 text-sm outline-none bg-gray-50" />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Items Included (comma separated)</label>
                        <input value={offerForm.items_included} onChange={e => setOfferForm({...offerForm, items_included: e.target.value})} placeholder="Pizza, Burger, Cola, Fries" className="w-full border-2 border-gray-100 focus:border-orange-400 rounded-2xl px-4 py-3 text-sm outline-none bg-gray-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Original Price (€)</label>
                          <input type="number" step="0.01" min="0" value={offerForm.original_price} onChange={e => setOfferForm({...offerForm, original_price: e.target.value})} placeholder="15.00" className="w-full border-2 border-gray-100 focus:border-orange-400 rounded-2xl px-4 py-3 text-sm outline-none bg-gray-50" />
                        </div>
                        <div>
                          <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Offer Price (€) *</label>
                          <input type="number" step="0.01" min="0" value={offerForm.offer_price} onChange={e => setOfferForm({...offerForm, offer_price: e.target.value})} placeholder="9.99" required className="w-full border-2 border-gray-100 focus:border-orange-400 rounded-2xl px-4 py-3 text-sm outline-none bg-gray-50" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Badge</label>
                          <select value={offerForm.badge} onChange={e => setOfferForm({...offerForm, badge: e.target.value})} className="w-full border-2 border-gray-100 focus:border-orange-400 rounded-2xl px-4 py-3 text-sm outline-none bg-gray-50">
                            {["🔥 Hot Deal","⚡ Flash Sale","💎 Premium","🎉 Special","🆕 New"].map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Valid Until</label>
                          <input type="date" value={offerForm.valid_until} onChange={e => setOfferForm({...offerForm, valid_until: e.target.value})} className="w-full border-2 border-gray-100 focus:border-orange-400 rounded-2xl px-4 py-3 text-sm outline-none bg-gray-50" />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowOfferForm(false)} className="flex-1 bg-gray-100 text-gray-700 font-black py-3.5 rounded-2xl text-sm">Cancel</button>
                        <motion.button whileHover={{ scale: 1.02 }} type="submit"
                          className="flex-1 font-black py-3.5 rounded-2xl text-sm text-white shadow-lg"
                          style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}>
                          {editOffer ? "Save Changes ✓" : "Launch Offer 🚀"}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {offers.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 rounded-3xl" style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.06),rgba(239,68,68,0.06))", border: "2px dashed rgba(245,158,11,0.3)" }}>
                <motion.div animate={{ rotate: [0,-5,5,0], scale: [1,1.1,1] }} transition={{ repeat: Infinity, duration: 3 }} className="text-6xl mb-3">🎯</motion.div>
                <p className="font-black text-gray-700 text-lg">No Offers Yet</p>
                <p className="text-sm text-gray-400 mt-1">Create combo deals to boost sales!</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.map((offer, i) => {
                  const discount = offer.original_price ? Math.round((1 - offer.offer_price / offer.original_price) * 100) : null;
                  return (
                    <motion.div key={offer.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      whileHover={{ y: -4, boxShadow: "0 20px 50px rgba(245,158,11,0.2)" }}
                      className="rounded-3xl overflow-hidden shadow-lg bg-white border border-orange-100">
                      <div className="p-5 relative" style={{ background: offer.is_active ? "linear-gradient(135deg,#92400e,#f59e0b)" : "linear-gradient(135deg,#374151,#6b7280)" }}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20" style={{ background: "rgba(255,255,255,0.4)", transform: "translate(30%,-30%)" }} />
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs bg-white/20 text-white font-black px-2 py-0.5 rounded-full mb-2 inline-block">{offer.badge}</span>
                            <p className="font-black text-white text-lg leading-tight">{offer.title}</p>
                            {offer.description && <p className="text-white/75 text-xs mt-1">{offer.description}</p>}
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            {offer.original_price > 0 && <p className="text-white/50 text-xs line-through">{offer.original_price?.toFixed(2)}€</p>}
                            <p className="font-black text-2xl text-white">{offer.offer_price?.toFixed(2)}€</p>
                            {discount && <span className="text-xs bg-red-500 text-white font-black px-2 py-0.5 rounded-full">-{discount}%</span>}
                          </div>
                        </div>
                        {offer.items_included?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {offer.items_included.map((item, j) => (
                              <span key={j} className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">{item}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-3 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2">
                          {offer.valid_until && <span className="text-xs text-gray-400">📅 Until {offer.valid_until}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button whileHover={{ scale: 1.05 }} onClick={() => toggleOffer(offer)}
                            className="text-xs font-black px-3 py-1.5 rounded-full transition-all"
                            style={offer.is_active ? { background: "#dcfce7", color: "#16a34a" } : { background: "#f3f4f6", color: "#6b7280" }}>
                            {offer.is_active ? "● Active" : "○ Inactive"}
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} onClick={() => openEditOffer(offer)} className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "#dbeafe" }}><Edit2 size={13} className="text-blue-600"/></motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} onClick={() => deleteOffer(offer.id)} className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "#fee2e2" }}><Trash2 size={13} className="text-red-500"/></motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === "analytics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: "💰", label: "Total Revenue", value: `${totalRevenue.toFixed(2)}€`, grad: "linear-gradient(135deg,#065f46,#10b981)", glow: "rgba(16,185,129,0.3)" },
                { emoji: "✅", label: "Delivered Orders", value: completedOrders.length, grad: "linear-gradient(135deg,#1e40af,#3b82f6)", glow: "rgba(59,130,246,0.3)" },
                { emoji: "❌", label: "Cancelled", value: cancelledOrders.length, grad: "linear-gradient(135deg,#7f1d1d,#ef4444)", glow: "rgba(239,68,68,0.3)" },
                { emoji: "📈", label: "Avg Order Value", value: completedOrders.length ? `${(totalRevenue/completedOrders.length).toFixed(2)}€` : "—", grad: "linear-gradient(135deg,#5b21b6,#8b5cf6)", glow: "rgba(139,92,246,0.3)" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08, type: "spring" }}
                  className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
                  style={{ background: s.grad, boxShadow: `0 8px 32px ${s.glow}` }}>
                  <div className="absolute -top-3 -right-3 text-5xl opacity-20">{s.emoji}</div>
                  <p className="text-3xl mb-1">{s.emoji}</p>
                  <p className="font-black text-2xl">{s.value}</p>
                  <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <h3 className="font-black text-gray-900 mb-5 flex items-center gap-2 text-base">📊 Performance Overview</h3>
              {[
                { label: "Active Products", val: products.length, max: Math.max(products.length, 10), emoji: "🍽️", color: "#3b82f6" },
                { label: "Delivered Orders", val: completedOrders.length, max: Math.max(orders.length, 1), emoji: "✅", color: "#10b981" },
                { label: "Cancelled Orders", val: cancelledOrders.length, max: Math.max(orders.length, 1), emoji: "❌", color: "#ef4444" },
              ].map((item, i) => (
                <div key={i} className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">{item.emoji} {item.label}</span>
                    <span className="font-black text-gray-900 text-lg">{item.val}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((item.val/item.max)*100, 100)}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 1, ease: "easeOut" }}
                      className="h-3 rounded-full" style={{ background: `linear-gradient(90deg,${item.color},${item.color}88)` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === "history" && (
          <div className="space-y-3">
            {orders.filter(o => ["dorezuar","anuluar"].includes(o.status)).length === 0 ? (
              <div className="text-center py-20 rounded-3xl" style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.06))", border: "2px dashed rgba(99,102,241,0.2)" }}>
                <div className="text-5xl mb-3">📋</div>
                <p className="font-black text-gray-700">No order history yet</p>
              </div>
            ) : orders.filter(o => ["dorezuar","anuluar"].includes(o.status)).map((order, i) => {
              const isDelivered = order.status === "dorezuar";
              return (
                <motion.div key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-4 border border-gray-100">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm flex-shrink-0"
                    style={{ background: isDelivered ? "linear-gradient(135deg,#dcfce7,#bbf7d0)" : "linear-gradient(135deg,#fee2e2,#fecaca)" }}>
                    {isDelivered ? "✅" : "❌"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-gray-900">#{order.order_code}</p>
                    <p className="text-sm text-gray-600 truncate">{order.customer_name}</p>
                    <p className="text-xs text-gray-400">{order.items?.length} items · {new Date(order.created_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-base" style={{ color: isDelivered ? "#10b981" : "#ef4444" }}>{order.total?.toFixed(2)}€</p>
                    <p className="text-xs text-gray-400">{isDelivered ? "Delivered" : "Cancelled"}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {tab === "statement" && <StatementGenerator orders={orders} mode="business" entityName={biz.name} isAdmin={false} />}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <div className="space-y-4 max-w-lg">
            <div className="rounded-3xl overflow-hidden shadow-lg">
              <div className="p-6 text-white" style={{ background: "linear-gradient(135deg,#1e40af,#7c3aed)" }}>
                <div className="flex items-center gap-4">
                  {biz.image_url
                    ? <img src={biz.image_url} className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl" />
                    : <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-4 border-white/30">🍽️</div>
                  }
                  <div>
                    <p className="font-black text-xl">{biz.name}</p>
                    <p className="text-white/70 text-sm">{biz.category}</p>
                    <span className="text-xs px-3 py-1 rounded-full font-black mt-1 inline-block" style={{ background: biz.is_open ? "#10b981" : "#6b7280" }}>{biz.is_open ? "● Open" : "○ Closed"}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 space-y-3">
                {[["📞 Phone", biz.phone], ["📍 Address", biz.address], ["🏷️ Status", biz.status]].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                    <span className="text-gray-500 font-semibold">{k}</span>
                    <span className="font-black text-gray-900 text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} onClick={logout}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors">
              <LogOut size={16}/> Sign Out
            </motion.button>
            <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,rgba(239,68,68,0.06),rgba(220,38,38,0.04))", border: "2px solid rgba(239,68,68,0.2)" }}>
              <p className="font-black text-red-700 mb-1 flex items-center gap-2"><AlertTriangle size={16}/> ⚠️ Danger Zone</p>
              <p className="text-red-500 text-sm mb-4">This action is irreversible. All your data will be permanently deleted.</p>
              <button onClick={async () => {
                if (!confirm("Are you absolutely sure? This cannot be undone!")) return;
                await base44.entities.Business.delete(biz.id);
                localStorage.removeItem("tiligo_business"); navigate("/");
              }} className="w-full font-black py-3 rounded-xl text-sm text-white transition-all" style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}>
                🗑️ Delete Account Permanently
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}