import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Trash2, Edit2, Package, ToggleLeft, ToggleRight, Upload,
  LogOut, Bell, TrendingUp, Clock, CheckCircle2, XCircle, ChefHat,
  Bike, BarChart2, Settings, AlertTriangle, FileText, ArrowRight,
  ShoppingBag, Star, Zap, DollarSign, Users, RefreshCw
} from "lucide-react";
import StatementGenerator from "@/components/StatementGenerator";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

const W = "#009DE0"; // Wolt blue
const G = "#30C48D"; // Wolt green

const STATUS = {
  e_re:             { label: "New",         bg: "#EBF5FF", color: "#0066CC", dot: "#3B82F6" },
  pranuar:          { label: "Accepted",    bg: "#EDE9FE", color: "#5B21B6", dot: "#8B5CF6" },
  ne_pergatitje:    { label: "Preparing",   bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  gati_per_dorezim: { label: "Ready",       bg: "#FFF7ED", color: "#9A3412", dot: "#F97316" },
  ne_rruge:         { label: "On the way",  bg: "#F3E8FF", color: "#6B21A8", dot: "#A855F7" },
  dorezuar:         { label: "Delivered",   bg: "#DCFCE7", color: "#14532D", dot: "#22C55E" },
  anuluar:          { label: "Cancelled",   bg: "#FEE2E2", color: "#7F1D1D", dot: "#EF4444" },
};

const NEXT = { e_re: "pranuar", pranuar: "ne_pergatitje", ne_pergatitje: "gati_per_dorezim" };
const NEXT_LABEL = { e_re: "Accept Order", pranuar: "Start Preparing", ne_pergatitje: "Mark Ready" };

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [biz, setBiz] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tiligo_business") || "null"); } catch { return null; }
  });
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newOrderBanner, setNewOrderBanner] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", category: "", image_url: "" });

  useEffect(() => {
    if (!biz) { navigate("/biznesi/login"); return; }
    loadData();
  }, [biz]);

  useEffect(() => {
    if (!biz) return;
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.data?.business_id === biz.id) {
        if (event.type === "create") { setNewOrderBanner(true); setTimeout(() => setNewOrderBanner(false), 6000); }
        loadOrders();
      }
    });
    return unsub;
  }, [biz]);

  const loadData = async () => { setLoading(true); await Promise.all([loadOrders(), loadProducts()]); setLoading(false); };
  const loadOrders = async () => { const d = await base44.entities.Order.filter({ business_id: biz.id }, "-created_date"); setOrders(d); };
  const loadProducts = async () => { const d = await base44.entities.Product.filter({ business_id: biz.id }); setProducts(d); };

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

  const deleteProduct = async (id) => { if (!confirm("Delete this product?")) return; await base44.entities.Product.delete(id); loadProducts(); };

  const openEditProduct = (prod) => {
    setEditProduct(prod);
    setProductForm({ name: prod.name, description: prod.description || "", price: String(prod.price), category: prod.category || "", image_url: prod.image_url || "" });
    setShowProductForm(true);
  };

  const logout = () => { localStorage.removeItem("tiligo_business"); navigate("/"); };
  if (!biz) return null;

  const pendingOrders = orders.filter(o => ["e_re","pranuar","ne_pergatitje","gati_per_dorezim"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "dorezuar");
  const cancelledOrders = orders.filter(o => o.status === "anuluar");
  const todayOrders = completedOrders.filter(o => new Date(o.created_date).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalRevenue = completedOrders.reduce((s, o) => s + (o.total || 0), 0);

  const TABS = [
    { key: "orders", icon: <ShoppingBag size={16}/>, label: "Orders", badge: pendingOrders.length },
    { key: "products", icon: <ChefHat size={16}/>, label: "Menu" },
    { key: "analytics", icon: <BarChart2 size={16}/>, label: "Analytics" },
    { key: "history", icon: <Clock size={16}/>, label: "History" },
    { key: "statement", icon: <FileText size={16}/>, label: "Statement" },
    { key: "settings", icon: <Settings size={16}/>, label: "Settings" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F5F7FA" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {biz.image_url
                ? <img src={biz.image_url} className="w-10 h-10 rounded-2xl object-cover border-2 border-gray-100" />
                : <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: W + "20" }}><ChefHat size={20} style={{ color: W }} /></div>
              }
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${biz.is_open ? "bg-green-400" : "bg-gray-300"}`} />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 leading-tight">{biz.name}</p>
              <p className="text-xs" style={{ color: biz.is_open ? G : "#9CA3AF" }}>{biz.is_open ? "Open · Accepting orders" : "Closed"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleOpen}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all"
              style={biz.is_open
                ? { background: G, color: "#fff" }
                : { background: "#F3F4F6", color: "#374151", border: "1.5px solid #E5E7EB" }}>
              {biz.is_open ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
              {biz.is_open ? "Open" : "Closed"}
            </button>
            {pendingOrders.length > 0 && (
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FEF3C7" }}>
                <Bell size={18} style={{ color: "#F59E0B" }} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">{pendingOrders.length}</span>
              </div>
            )}
            <button onClick={logout} className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
              <LogOut size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* New order banner */}
      <AnimatePresence>
        {newOrderBanner && (
          <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-white font-bold text-sm"
            style={{ background: W }}>
            <Bell size={18} className="animate-bounce" /> New order arrived!
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPIs */}
      <div className="max-w-5xl mx-auto px-4 pt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: <ShoppingBag size={20}/>, label: "Active Orders", value: pendingOrders.length, color: W, bg: W + "12" },
            { icon: <DollarSign size={20}/>, label: "Today's Revenue", value: `${todayRevenue.toFixed(2)}€`, color: G, bg: G + "18" },
            { icon: <CheckCircle2 size={20}/>, label: "Delivered", value: completedOrders.length, color: "#6366F1", bg: "#EEF2FF" },
            { icon: <ChefHat size={20}/>, label: "Menu Items", value: products.length, color: "#F59E0B", bg: "#FEF3C7" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </div>
              <p className="font-black text-2xl text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="relative flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap"
              style={tab === t.key ? { borderColor: W, color: W } : { borderColor: "transparent", color: "#6B7280" }}>
              {t.icon} {t.label}
              {t.badge > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* ORDERS */}
        {tab === "orders" && (
          <div className="space-y-3">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse shadow-sm" />)
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: W + "15" }}>
                  <ShoppingBag size={28} style={{ color: W }} />
                </div>
                <p className="font-bold text-gray-900">No active orders</p>
                <p className="text-sm text-gray-400 mt-1">New orders will appear here in real-time</p>
              </div>
            ) : pendingOrders.map((order, idx) => {
              const st = STATUS[order.status];
              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="h-1" style={{ background: st.dot }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-lg text-gray-900">#{order.order_code}</span>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: st.dot }} />{st.label}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-800">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_phone}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.customer_address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xl" style={{ color: G }}>{order.total?.toFixed(2)}€</p>
                        <p className="text-xs text-gray-400">cash</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.qty}× {item.name}</span>
                          <span className="font-semibold text-gray-900">{(item.price * item.qty).toFixed(2)}€</span>
                        </div>
                      ))}
                      {order.notes && <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg mt-1">Note: {order.notes}</p>}
                    </div>
                    {NEXT[order.status] && (
                      <button onClick={() => updateOrderStatus(order)}
                        className="w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-98 text-white"
                        style={{ background: W }}>
                        {NEXT_LABEL[order.status]} <ArrowRight size={15} />
                      </button>
                    )}
                    {order.status === "gati_per_dorezim" && (
                      <div className="py-3 text-center font-semibold text-sm rounded-xl" style={{ background: "#FFF7ED", color: "#EA580C" }}>
                        <Bike size={16} className="inline mr-1.5" /> Ready · Waiting for courier
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* PRODUCTS */}
        {tab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-gray-900">Your Menu</h2>
                <p className="text-sm text-gray-500">{products.length} items</p>
              </div>
              <button onClick={() => { setEditProduct(null); setProductForm({ name: "", description: "", price: "", category: "", image_url: "" }); setShowProductForm(true); }}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-all"
                style={{ background: W }}>
                <Plus size={16} /> Add Item
              </button>
            </div>

            <AnimatePresence>
              {showProductForm && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center px-4 pb-4 md:pb-0 backdrop-blur-sm">
                  <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="font-bold text-xl text-gray-900 mb-5">{editProduct ? "Edit Item" : "New Menu Item"}</h3>
                    <form onSubmit={saveProduct} className="space-y-4">
                      {[
                        { key: "name", label: "Name *", placeholder: "e.g. Margherita Pizza", required: true, type: "text" },
                        { key: "description", label: "Description", placeholder: "Describe the item...", type: "text" },
                        { key: "category", label: "Category", placeholder: "e.g. Pizza", type: "text" },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
                          <input value={productForm[f.key]} onChange={e => setProductForm({...productForm, [f.key]: e.target.value})}
                            placeholder={f.placeholder} required={f.required}
                            className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Price (€) *</label>
                        <input type="number" step="0.01" min="0" value={productForm.price}
                          onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="0.00" required
                          className="w-full border border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-sm outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Photo</label>
                        <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-4 cursor-pointer transition-colors">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: W + "15" }}>
                            <Upload size={16} style={{ color: W }} />
                          </div>
                          <span className="text-sm text-gray-500">{uploading ? "Uploading..." : productForm.image_url ? "✓ Photo uploaded" : "Upload product photo"}</span>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {productForm.image_url && <img src={productForm.image_url} className="mt-2 w-full h-32 object-cover rounded-xl" />}
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setShowProductForm(false)}
                          className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl text-sm">Cancel</button>
                        <button type="submit" className="flex-1 font-bold py-3.5 rounded-xl text-sm text-white" style={{ background: W }}>
                          {editProduct ? "Save Changes" : "Add Item"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "#FEF3C7" }}>
                  <ChefHat size={28} style={{ color: "#F59E0B" }} />
                </div>
                <p className="font-bold text-gray-900">No menu items yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first item to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((prod, i) => (
                  <motion.div key={prod.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl shadow-sm flex items-center overflow-hidden">
                    {prod.image_url
                      ? <img src={prod.image_url} className="w-24 h-24 object-cover flex-shrink-0" />
                      : <div className="w-24 h-24 flex items-center justify-center flex-shrink-0 bg-gray-100"><ChefHat size={28} className="text-gray-300" /></div>
                    }
                    <div className="flex-1 px-4 py-3 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{prod.name}</p>
                      {prod.category && <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: W + "15", color: W }}>{prod.category}</span>}
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{prod.description}</p>
                      <p className="font-black text-base mt-1" style={{ color: G }}>{prod.price?.toFixed(2)}€</p>
                    </div>
                    <div className="flex flex-col items-center gap-2 pr-3">
                      <button onClick={() => openEditProduct(prod)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"><Edit2 size={14}/></button>
                      <button onClick={() => deleteProduct(prod.id)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {tab === "analytics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <DollarSign size={22}/>, label: "Total Revenue", value: `${totalRevenue.toFixed(2)}€`, color: G, bg: G+"18" },
                { icon: <CheckCircle2 size={22}/>, label: "Delivered Orders", value: completedOrders.length, color: W, bg: W+"15" },
                { icon: <XCircle size={22}/>, label: "Cancelled", value: cancelledOrders.length, color: "#EF4444", bg: "#FEE2E2" },
                { icon: <TrendingUp size={22}/>, label: "Avg Order Value", value: completedOrders.length ? `${(totalRevenue/completedOrders.length).toFixed(2)}€` : "—", color: "#8B5CF6", bg: "#F3E8FF" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                    <span style={{ color: s.color }}>{s.icon}</span>
                  </div>
                  <p className="font-black text-2xl text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BarChart2 size={18} style={{ color: W }}/> Performance</h3>
              {[
                { label: "Active products", val: products.length, max: Math.max(products.length, 10), color: W },
                { label: "Delivered orders", val: completedOrders.length, max: Math.max(orders.length, 1), color: G },
                { label: "Cancelled orders", val: cancelledOrders.length, max: Math.max(orders.length, 1), color: "#EF4444" },
              ].map((item, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-bold text-gray-900">{item.val}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((item.val/item.max)*100, 100)}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }} className="h-2 rounded-full" style={{ background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY */}
        {tab === "history" && (
          <div className="space-y-2">
            {orders.filter(o => ["dorezuar","anuluar"].includes(o.status)).length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
                <Clock size={36} className="mx-auto mb-3 text-gray-300" />
                <p className="font-bold text-gray-900">No order history yet</p>
              </div>
            ) : orders.filter(o => ["dorezuar","anuluar"].includes(o.status)).map((order, i) => {
              const st = STATUS[order.status];
              return (
                <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: st.bg }}>
                      {order.status === "dorezuar" ? <CheckCircle2 size={18} style={{ color: st.dot }}/> : <XCircle size={18} style={{ color: st.dot }}/>}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">#{order.order_code}</p>
                      <p className="text-sm text-gray-600">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.items?.length} items · {new Date(order.created_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    <p className="font-black text-base mt-1" style={{ color: G }}>{order.total?.toFixed(2)}€</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {tab === "statement" && <StatementGenerator orders={orders} mode="business" entityName={biz.name} isAdmin={false} />}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div className="space-y-4 max-w-lg">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              {biz.image_url && <img src={biz.image_url} className="w-20 h-20 rounded-2xl object-cover mb-4 border border-gray-100" />}
              <h3 className="font-bold text-gray-900 mb-1">Account Info</h3>
              <div className="space-y-2 text-sm mt-3">
                {[["Name", biz.name], ["Phone", biz.phone], ["Address", biz.address]].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={logout} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors">
              <LogOut size={16}/> Sign Out
            </button>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
              <h3 className="font-bold text-red-700 mb-1 flex items-center gap-2"><AlertTriangle size={16}/> Delete Account</h3>
              <p className="text-red-500 text-sm mb-4">This action is irreversible. All data will be permanently deleted.</p>
              <button onClick={async () => {
                if (!confirm("Are you absolutely sure?")) return;
                await base44.entities.Business.delete(biz.id);
                localStorage.removeItem("tiligo_business"); navigate("/");
              }} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                Delete Account Permanently
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}