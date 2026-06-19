import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ToggleLeft, ToggleRight, LogOut, Bell, CheckCircle, MapPin,
  Phone, AlertTriangle, Navigation, DollarSign,
  Package, Clock, TrendingUp, Bike, User, ArrowRight, Zap
} from "lucide-react";
import StatementGenerator from "@/components/StatementGenerator";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import LiveRouteMap from "@/components/LiveRouteMap";
import "leaflet/dist/leaflet.css";

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const VEHICLE_LABEL = { motor: "Motorcycle", biciklete: "Bicycle", makine: "Car" };
const VEHICLE_ICON = { motor: "🛵", biciklete: "🚲", makine: "🚗" };

// Animated waiting state for available tab when empty
function IdleScreen({ isAvailable, onGoActive }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <motion.div
          animate={{ scale: [1,1.08,1], rotate: [0,5,-5,0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="text-8xl">
          {isAvailable ? "🛵" : "😴"}
        </motion.div>
        {isAvailable && (
          <motion.div animate={{ scale: [1,1.5,1], opacity: [0.5,0,0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400" />
        )}
      </div>
      {isAvailable ? (
        <>
          <p className="font-black text-xl text-gray-800 mb-1">You're Active & Ready!</p>
          <p className="text-gray-400 text-sm mb-4">Scanning for nearby orders...</p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.1),rgba(52,211,153,0.1))", border: "1.5px solid rgba(16,185,129,0.3)" }}>
            <motion.div animate={{ scale: [1,1.4,1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-bold text-emerald-600">Listening for orders...</span>
          </div>
        </>
      ) : (
        <>
          <p className="font-black text-xl text-gray-800 mb-1">You're Offline</p>
          <p className="text-gray-400 text-sm mb-5">Go active to start receiving orders</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGoActive}
            className="font-black px-8 py-4 rounded-2xl text-white text-sm shadow-xl"
            style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 8px 32px rgba(16,185,129,0.4)" }}>
            Go Active 🚀
          </motion.button>
        </>
      )}
    </div>
  );
}

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tiligo_delivery") || "null"); } catch { return null; }
  });
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [newOrderData, setNewOrderData] = useState(null);
  const [driverCoords, setDriverCoords] = useState(null);
  const gpsRef = useRef(null);

  useEffect(() => {
    if (!driver) { navigate("/dorezuesi/login"); return; }
    loadOrders();
    if (navigator.geolocation) {
      gpsRef.current = navigator.geolocation.watchPosition(
        pos => setDriverCoords([pos.coords.latitude, pos.coords.longitude]),
        null, { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
    return () => { if (gpsRef.current) navigator.geolocation.clearWatch(gpsRef.current); };
  }, [driver]);

  useEffect(() => {
    if (!driver) return;
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.data?.status === "gati_per_dorezim" && !event.data?.delivery_id) {
        setNewOrderData(event.data);
        setNewOrderAlert(true);
        setTimeout(() => setNewOrderAlert(false), 8000);
      }
      if (event.type === "update") loadOrders();
    });
    return unsub;
  }, [driver]);

  const availableOrdersSnapshot = orders.filter(o => o.status === "gati_per_dorezim" && !o.delivery_id);
  const myOrdersSnapshot = orders.filter(o => o.delivery_id === driver?.id && o.status === "ne_rruge");

  useEffect(() => {
    if (!driverCoords || myOrdersSnapshot.length === 0) return;
    myOrdersSnapshot.forEach(o => base44.entities.Order.update(o.id, { delivery_lat: driverCoords[0], delivery_lng: driverCoords[1] }));
  }, [driverCoords]);

  const loadOrders = async () => {
    setLoading(true);
    const data = await base44.entities.Order.list("-created_date", 100);
    setOrders(data); setLoading(false);
  };

  const toggleAvailable = async () => {
    const upd = { ...driver, is_available: !driver.is_available };
    await base44.entities.Delivery.update(driver.id, { is_available: upd.is_available });
    setDriver(upd); localStorage.setItem("tiligo_delivery", JSON.stringify(upd));
  };

  const acceptOrder = async (order) => {
    const upd = { status: "ne_rruge", delivery_id: driver.id, delivery_name: driver.name };
    if (driverCoords) { upd.delivery_lat = driverCoords[0]; upd.delivery_lng = driverCoords[1]; }
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...upd } : o));
    await base44.entities.Order.update(order.id, upd);
  };

  const completeOrder = async (order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "dorezuar" } : o));
    await base44.entities.Order.update(order.id, { status: "dorezuar" });
  };

  const logout = () => { localStorage.removeItem("tiligo_delivery"); navigate("/"); };
  if (!driver) return null;

  const availableOrders = orders.filter(o => o.status === "gati_per_dorezim" && !o.delivery_id);
  const myOrders = orders.filter(o => o.delivery_id === driver?.id && o.status === "ne_rruge");
  const myHistory = orders.filter(o => o.delivery_id === driver?.id && o.status === "dorezuar");
  const todayHistory = myHistory.filter(o => new Date(o.created_date).toDateString() === new Date().toDateString());
  const todayEarnings = todayHistory.reduce((s, o) => s + (o.delivery_fee || 1.5), 0);
  const totalEarnings = myHistory.reduce((s, o) => s + (o.delivery_fee || 1.5), 0);

  const TABS = [
    { key: "available", icon: "📦", label: "Available", badge: availableOrders.length },
    { key: "mine", icon: "🛵", label: "Active", badge: myOrders.length },
    { key: "history", icon: "📋", label: "History" },
    { key: "statement", icon: "📄", label: "Statement" },
    { key: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F0FDF4" }}>

      {/* ── NEW ORDER ALERT ── */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
            <motion.div
              animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 0.6 }}
              className="rounded-3xl p-4 shadow-2xl flex items-center gap-4"
              style={{ background: "linear-gradient(135deg,#064e3b,#10b981)", border: "2px solid rgba(255,255,255,0.3)" }}>
              <motion.div animate={{ rotate: [0,20,-20,0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="text-3xl">📦</motion.div>
              <div className="flex-1">
                <p className="font-black text-white text-sm">New Order Ready!</p>
                {newOrderData && <p className="text-white/70 text-xs">{newOrderData.business_name} · +{(newOrderData.delivery_fee || 1.5).toFixed(2)}€ earnings</p>}
              </div>
              <button onClick={() => { setNewOrderAlert(false); setTab("available"); }} className="px-3 py-1.5 rounded-xl bg-white/20 text-white font-black text-xs">View</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 shadow-sm" style={{ background: "rgba(240,253,244,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {driver.image_url
                ? <img src={driver.image_url} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md" />
                : <div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl shadow-md" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>{VEHICLE_ICON[driver.vehicle] || "🛵"}</div>
              }
              <motion.span
                animate={driver.is_available ? { scale: [1,1.4,1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${driver.is_available ? "bg-emerald-400" : "bg-gray-300"}`} />
            </div>
            <div>
              <p className="font-black text-sm text-gray-900">{driver.name}</p>
              <p className="text-xs font-semibold" style={{ color: driver.is_available ? "#10b981" : "#9ca3af" }}>
                {VEHICLE_ICON[driver.vehicle]} {VEHICLE_LABEL[driver.vehicle]} · {driver.is_available ? "Active" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleAvailable}
              className="flex items-center gap-2 text-sm font-black px-4 py-2 rounded-xl shadow-md transition-all"
              style={driver.is_available
                ? { background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }
                : { background: "#F3F4F6", color: "#374151" }}>
              {driver.is_available ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
              {driver.is_available ? "Active" : "Go Active"}
            </motion.button>
            <button onClick={logout} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors">
              <LogOut size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="max-w-3xl mx-auto px-4 pt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { emoji: "💵", label: "Today's Earnings", value: `${todayEarnings.toFixed(2)}€`, grad: "linear-gradient(135deg,#065f46,#10b981)", glow: "rgba(16,185,129,0.35)" },
            { emoji: "🛵", label: "Today's Rides", value: todayHistory.length, grad: "linear-gradient(135deg,#1e40af,#3b82f6)", glow: "rgba(59,130,246,0.3)" },
            { emoji: "💰", label: "Total Earned", value: `${totalEarnings.toFixed(2)}€`, grad: "linear-gradient(135deg,#5b21b6,#8b5cf6)", glow: "rgba(139,92,246,0.3)" },
            { emoji: "✅", label: "All Deliveries", value: myHistory.length, grad: "linear-gradient(135deg,#92400e,#f59e0b)", glow: "rgba(245,158,11,0.3)" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, type: "spring" }}
              className="rounded-3xl p-5 text-white relative overflow-hidden shadow-lg"
              style={{ background: s.grad, boxShadow: `0 8px 32px ${s.glow}` }}>
              <div className="absolute -top-4 -right-4 text-5xl opacity-20">{s.emoji}</div>
              <p className="text-2xl mb-0.5">{s.emoji}</p>
              <p className="font-black text-2xl">{s.value}</p>
              <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="sticky top-16 z-30 shadow-sm" style={{ background: "rgba(240,253,244,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-3xl mx-auto px-4 flex overflow-x-auto no-scrollbar gap-1 py-2">
          {TABS.map(t => (
            <motion.button key={t.key} onClick={() => setTab(t.key)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="relative flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap"
              style={tab === t.key
                ? { background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", boxShadow: "0 4px 16px rgba(16,185,129,0.4)" }
                : { background: "rgba(0,0,0,0.04)", color: "#6B7280" }}>
              {t.icon} {t.label}
              {t.badge > 0 && <span className="ml-0.5 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">{t.badge}</span>}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">

        {/* ── AVAILABLE ── */}
        {tab === "available" && (
          loading ? [1,2].map(i => <div key={i} className="rounded-3xl h-48 animate-pulse shadow-sm" style={{ background: "rgba(0,0,0,0.06)" }} />) :
          availableOrders.length === 0
            ? <IdleScreen isAvailable={driver.is_available} onGoActive={toggleAvailable} />
            : availableOrders.map((order, idx) => (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.07, type: "spring" }}
                whileHover={{ y: -4, boxShadow: "0 24px 60px rgba(16,185,129,0.2)" }}
                className="rounded-3xl overflow-hidden shadow-xl bg-white"
                style={{ border: "1.5px solid rgba(16,185,129,0.2)" }}>
                {/* Header */}
                <div className="p-5 pb-4" style={{ background: "linear-gradient(135deg,#064e3b,#10b981)" }}>
                  <div className="absolute-inset-0" />
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-xl text-white">#{order.order_code}</span>
                        <motion.span animate={{ scale: [1,1.2,1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                          className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">🔥 Hot</motion.span>
                      </div>
                      <p className="text-white/90 font-bold text-sm">📍 {order.business_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-2xl text-white">+{(order.delivery_fee || 1.5).toFixed(2)}€</p>
                      <p className="text-white/70 text-xs">your earnings</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#f0fdf4", border: "1.5px solid rgba(16,185,129,0.2)" }}>
                    <MapPin size={16} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{order.customer_address}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#f0f9ff", border: "1.5px solid rgba(59,130,246,0.2)" }}>
                    <User size={16} className="text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-bold text-gray-800 flex-1">{order.customer_name}</span>
                    <a href={`tel:${order.customer_phone}`} className="text-sm font-black text-blue-600">{order.customer_phone}</a>
                  </div>
                  <div className="rounded-2xl p-3 space-y-1.5" style={{ background: "#fafafa", border: "1px solid #f3f4f6" }}>
                    {order.items?.map((item, i) => <p key={i} className="text-xs text-gray-600 flex items-center gap-2"><span className="w-5 h-5 bg-gray-200 rounded-lg flex items-center justify-center text-xs font-black">{item.qty}</span>{item.name}</p>)}
                    <div className="border-t border-gray-100 mt-1 pt-2 flex justify-between">
                      <span className="text-xs text-gray-500 font-bold">Cash from customer</span>
                      <span className="font-black text-sm text-gray-900">{order.total?.toFixed(2)}€</span>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => acceptOrder(order)}
                    className="w-full font-black py-4 rounded-2xl text-white flex items-center justify-center gap-3 text-sm shadow-lg transition-all"
                    style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 8px 28px rgba(16,185,129,0.45)" }}>
                    <Bike size={18}/> Accept This Delivery <ArrowRight size={16}/>
                  </motion.button>
                </div>
              </motion.div>
            ))
        )}

        {/* ── MY ACTIVE ── */}
        {tab === "mine" && (
          myOrders.length === 0 ? (
            <div className="text-center py-20">
              <motion.div animate={{ rotate: [0,10,-10,0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-7xl mb-4">🛵</motion.div>
              <p className="font-black text-xl text-gray-700 mb-1">No Active Deliveries</p>
              <p className="text-sm text-gray-400">Accept an order from the Available tab</p>
            </div>
          ) : myOrders.map((order, idx) => (
            <motion.div key={order.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, type: "spring" }}
              className="rounded-3xl overflow-hidden shadow-xl bg-white"
              style={{ border: "1.5px solid rgba(139,92,246,0.25)" }}>
              {/* Purple header for active */}
              <div className="p-5 pb-4" style={{ background: "linear-gradient(135deg,#5b21b6,#8b5cf6)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black text-xl text-white">#{order.order_code}</span>
                    <p className="text-white/80 text-sm mt-0.5">🏪 {order.business_name}</p>
                  </div>
                  <motion.div
                    animate={{ scale: [1,1.05,1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                    className="px-3 py-1.5 rounded-full text-xs font-black bg-white/20 text-white flex items-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="inline-block">🛵</motion.span>
                    On the Way
                  </motion.div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#faf5ff", border: "1.5px solid rgba(139,92,246,0.2)" }}>
                  <MapPin size={16} className="text-purple-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 flex-1">{order.customer_address}</span>
                  {order.customer_lat && (
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${order.customer_lat},${order.customer_lng}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>
                      <Navigation size={11}/> Navigate
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "#f0fdf4", border: "1.5px solid rgba(16,185,129,0.2)" }}>
                  <Phone size={16} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-gray-800 flex-1">{order.customer_name}</span>
                  <a href={`tel:${order.customer_phone}`} className="font-black text-sm text-emerald-600">{order.customer_phone}</a>
                </div>
                {order.customer_lat && (
                  <div className="rounded-2xl overflow-hidden shadow-sm">
                    <LiveRouteMap driverCoords={driverCoords} customerCoords={[order.customer_lat, order.customer_lng]} customerName={order.customer_name} customerAddress={order.customer_address} vehicle={driver.vehicle} />
                  </div>
                )}
                {order.customer_lat && driverCoords && (
                  <div className="rounded-2xl px-4 py-3 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#faf5ff,#ede9fe)", border: "1.5px solid rgba(139,92,246,0.2)" }}>
                    <span className="text-purple-700 font-bold text-sm flex items-center gap-2">📏 Distance</span>
                    <span className="font-black text-gray-900">{haversineKm(driverCoords[0],driverCoords[1],order.customer_lat,order.customer_lng).toFixed(1)} km · ~{Math.ceil(haversineKm(driverCoords[0],driverCoords[1],order.customer_lat,order.customer_lng)/30*60)} min</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="font-black text-2xl text-gray-900">{order.total?.toFixed(2)}€</p>
                    <p className="text-xs text-gray-500">cash + <span className="font-black text-emerald-600">+{(order.delivery_fee||1.5).toFixed(2)}€ yours</span></p>
                  </div>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => completeOrder(order)}
                    className="font-black px-6 py-3.5 rounded-2xl text-white flex items-center gap-2 text-sm shadow-xl"
                    style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 6px 24px rgba(16,185,129,0.4)" }}>
                    <CheckCircle size={18}/> Delivered! 🎉
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* ── HISTORY ── */}
        {tab === "history" && (
          myHistory.length === 0 ? (
            <div className="text-center py-20 rounded-3xl" style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.05),rgba(59,130,246,0.05))", border: "2px dashed rgba(16,185,129,0.2)" }}>
              <div className="text-5xl mb-3">📋</div>
              <p className="font-black text-gray-700">No deliveries yet</p>
            </div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl p-6 text-white shadow-xl"
                style={{ background: "linear-gradient(135deg,#064e3b,#10b981)", boxShadow: "0 8px 32px rgba(16,185,129,0.3)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm font-bold">Total Earned 💰</p>
                    <p className="font-black text-4xl mt-0.5">{totalEarnings.toFixed(2)}€</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-sm font-bold">Total Deliveries 🛵</p>
                    <p className="font-black text-4xl mt-0.5">{myHistory.length}</p>
                  </div>
                </div>
              </motion.div>
              <div className="space-y-2">
                {myHistory.map((order, i) => (
                  <motion.div key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-4 border border-gray-100">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm flex-shrink-0" style={{ background: "linear-gradient(135deg,#dcfce7,#bbf7d0)" }}>✅</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-gray-900">#{order.order_code}</p>
                      <p className="text-sm text-gray-600 truncate">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.business_name} · {new Date(order.created_date).toLocaleDateString()}</p>
                    </div>
                    <p className="font-black text-base flex-shrink-0" style={{ color: "#10b981" }}>+{(order.delivery_fee||1.5).toFixed(2)}€</p>
                  </motion.div>
                ))}
              </div>
            </>
          )
        )}

        {tab === "statement" && <StatementGenerator orders={myHistory.concat(myOrders)} mode="delivery" entityName={driver.name} isAdmin={false} />}

        {/* ── SETTINGS ── */}
        {tab === "settings" && (
          <div className="space-y-4 max-w-lg">
            <div className="rounded-3xl overflow-hidden shadow-lg">
              <div className="p-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#064e3b,#10b981)" }}>
                <div className="absolute -top-6 -right-6 text-8xl opacity-20">{VEHICLE_ICON[driver.vehicle]}</div>
                <div className="flex items-center gap-4 relative z-10">
                  {driver.image_url
                    ? <img src={driver.image_url} className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-xl" />
                    : <div className="w-20 h-20 rounded-full flex items-center justify-center text-5xl border-4 border-white/30">{VEHICLE_ICON[driver.vehicle]}</div>
                  }
                  <div>
                    <p className="font-black text-xl">{driver.name}</p>
                    <p className="text-white/70 text-sm">{VEHICLE_ICON[driver.vehicle]} {VEHICLE_LABEL[driver.vehicle]}</p>
                    <span className="text-xs px-3 py-1 rounded-full font-black mt-1 inline-block"
                      style={{ background: driver.is_available ? "#10b981" : "#6b7280" }}>
                      {driver.is_available ? "● Active" : "○ Offline"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 space-y-3">
                {[["📞 Phone", driver.phone], ["🏍️ Vehicle", `${VEHICLE_ICON[driver.vehicle]} ${VEHICLE_LABEL[driver.vehicle]}`], ["🚦 Status", driver.status]].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-50 text-sm">
                    <span className="text-gray-500 font-semibold">{k}</span>
                    <span className="font-black text-gray-900">{v}</span>
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
              <p className="text-red-500 text-sm mb-4">Irreversible. All your data will be permanently deleted.</p>
              <button onClick={async () => {
                if (!confirm("Are you absolutely sure?")) return;
                await base44.entities.Delivery.delete(driver.id);
                localStorage.removeItem("tiligo_delivery"); navigate("/");
              }} className="w-full font-black py-3 rounded-xl text-sm text-white" style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)" }}>
                🗑️ Delete Account Permanently
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}