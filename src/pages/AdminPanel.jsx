import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogOut, Check, X, Edit2, Trash2, ChevronDown, ChevronUp, Upload, TrendingUp, Users, Package, Store, Bike, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import TiliGoLogo from "@/components/TiliGoLogo";

const ADMIN_USER = "root";
const ADMIN_PASS = "Jari!!2018";

const STATUS_COLORS = {
  e_re: "bg-blue-100 text-blue-700", pranuar: "bg-indigo-100 text-indigo-700",
  ne_pergatitje: "bg-amber-100 text-amber-700", gati_per_dorezim: "bg-orange-100 text-orange-700",
  ne_rruge: "bg-purple-100 text-purple-700", dorezuar: "bg-green-100 text-green-700",
  anuluar: "bg-red-100 text-red-700",
};
const STATUS_LABELS = {
  e_re: "E Re", pranuar: "Pranuar", ne_pergatitje: "Në Përgatitje",
  gati_per_dorezim: "Gati", ne_rruge: "Në Rrugë", dorezuar: "Dorëzuar", anuluar: "Anuluar"
};

export default function AdminPanel() {
  const [authed, setAuthed] = useState(() => localStorage.getItem("tiligo_admin") === "1");
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [businesses, setBusinesses] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed]);

  const loadAll = async () => {
    setLoading(true);
    const [b, d, o] = await Promise.all([
      base44.entities.Business.list(),
      base44.entities.Delivery.list(),
      base44.entities.Order.list("-created_date", 200),
    ]);
    setBusinesses(b);
    setDeliveries(d);
    setOrders(o);
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.user === ADMIN_USER && loginForm.pass === ADMIN_PASS) {
      localStorage.setItem("tiligo_admin", "1");
      setAuthed(true);
    } else {
      setLoginError("Kredencialet janë të gabuara!");
    }
  };

  const logout = () => {
    localStorage.removeItem("tiligo_admin");
    setAuthed(false);
  };

  const approveBiz = async (id) => { await base44.entities.Business.update(id, { status: "approved" }); loadAll(); };
  const rejectBiz = async (id) => { await base44.entities.Business.update(id, { status: "rejected" }); loadAll(); };
  const deleteBiz = async (id) => { if (!confirm("Jeni i sigurt?")) return; await base44.entities.Business.delete(id); loadAll(); };
  const approveDriver = async (id) => { await base44.entities.Delivery.update(id, { status: "approved" }); loadAll(); };
  const rejectDriver = async (id) => { await base44.entities.Delivery.update(id, { status: "rejected" }); loadAll(); };
  const deleteDriver = async (id) => { if (!confirm("Jeni i sigurt?")) return; await base44.entities.Delivery.delete(id); loadAll(); };
  const updateOrderStatus = async (id, status) => { await base44.entities.Order.update(id, { status }); loadAll(); };
  const deleteOrder = async (id) => { if (!confirm("Jeni i sigurt?")) return; await base44.entities.Order.delete(id); loadAll(); };

  const startEdit = (item, type) => { setEditItem({ ...item, _type: type }); setEditForm({ ...item }); };

  const saveEdit = async () => {
    const { _type, id } = editItem;
    if (_type === "business") await base44.entities.Business.update(id, editForm);
    else if (_type === "delivery") await base44.entities.Delivery.update(id, editForm);
    setEditItem(null);
    loadAll();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  if (!authed) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <TiliGoLogo size="md" className="justify-center mb-4" />
          <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield size={28} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Paneli Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Hyrja e sigurt e administratorit</p>
        </div>
        {loginError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{loginError}</div>
        )}
        <form onSubmit={handleLogin} className="space-y-3">
          <input value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})}
            placeholder="Përdoruesi" required
            className="w-full border-2 border-gray-100 focus:border-gray-900 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors" />
          <input type="password" value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
            placeholder="Fjalëkalimi" required
            className="w-full border-2 border-gray-100 focus:border-gray-900 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors" />
          <button type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-black py-4 rounded-xl transition-colors shadow-lg mt-2">
            🔐 Hyr si Admin
          </button>
        </form>
      </motion.div>
    </div>
  );

  const pendingBiz = businesses.filter(b => b.status === "pending").length;
  const pendingDrivers = deliveries.filter(d => d.status === "pending").length;
  const activeOrders = orders.filter(o => !["dorezuar", "anuluar"].includes(o.status)).length;
  const totalRevenue = orders.filter(o => o.status === "dorezuar").reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-md">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <span className="font-black text-white text-lg">Admin Panel</span>
              <p className="text-gray-400 text-xs">TiliGo Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors" title="Rifresko">
              <RefreshCw size={15} className="text-white" />
            </button>
            <button onClick={logout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-3 py-2 rounded-xl transition-colors">
              <LogOut size={15} /> Dil
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { label: "Biznese", value: businesses.length, sub: `${businesses.filter(b => b.status === "approved").length} aktive`, emoji: "🏪", gradient: "from-blue-500 to-blue-700" },
            { label: "Dorëzues", value: deliveries.length, sub: `${deliveries.filter(d => d.status === "approved").length} aprovuar`, emoji: "🛵", gradient: "from-green-500 to-green-700" },
            { label: "Porosi Aktive", value: activeOrders, sub: `${orders.length} totale`, emoji: "📦", gradient: "from-amber-500 to-orange-600" },
            { label: "Të ardhura", value: `${totalRevenue.toFixed(0)}€`, sub: `${orders.filter(o => o.status === "dorezuar").length} dorëzuar`, emoji: "💰", gradient: "from-purple-500 to-purple-700" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`bg-gradient-to-br ${s.gradient} text-white rounded-2xl p-5 shadow-md`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.emoji}</span>
                {(s.label === "Biznese" && pendingBiz > 0) && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-black">{pendingBiz} pritje</span>
                )}
                {(s.label === "Dorëzues" && pendingDrivers > 0) && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-black">{pendingDrivers} pritje</span>
                )}
              </div>
              <p className="font-black text-2xl">{s.value}</p>
              <p className="text-white/60 text-xs">{s.label}</p>
              <p className="text-white/50 text-xs mt-0.5">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto">
          {[
            { key: "dashboard", label: "📊 Dashboard" },
            { key: "businesses", label: `🏪 Biznese`, badge: pendingBiz },
            { key: "deliveries", label: `🛵 Dorëzuesit`, badge: pendingDrivers },
            { key: "orders", label: `📦 Porositë`, badge: activeOrders },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative px-5 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${tab === t.key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t.label}
              {t.badge > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-black">{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="font-black text-xl mb-5">✏️ Ndrysho të dhënat</h3>
              <div className="space-y-3">
                {Object.keys(editForm).filter(k => !["id","created_date","updated_date","created_by"].includes(k)).map(key => (
                  <div key={key}>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">{key.replace(/_/g, " ")}</label>
                    {key === "image_url" ? (
                      <div>
                        <label className="flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-3 cursor-pointer text-sm text-gray-500 transition-colors">
                          <Upload size={16} className="text-blue-500" />
                          {uploading ? "Duke ngarkuar..." : editForm.image_url ? "Ndrysho foton" : "Ngarko foto"}
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {editForm.image_url && <img src={editForm.image_url} className="mt-2 h-24 w-full object-cover rounded-xl" />}
                      </div>
                    ) : key === "status" ? (
                      <select value={editForm[key]} onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                        className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors">
                        {editItem._type === "business" || editItem._type === "delivery"
                          ? ["pending","approved","rejected"].map(s => <option key={s}>{s}</option>)
                          : Object.keys(STATUS_LABELS).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)
                        }
                      </select>
                    ) : typeof editForm[key] === "boolean" ? (
                      <select value={String(editForm[key])} onChange={e => setEditForm({...editForm, [key]: e.target.value === "true"})}
                        className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                        <option value="true">Po</option><option value="false">Jo</option>
                      </select>
                    ) : (
                      <input value={editForm[key] || ""} onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                        className="w-full border-2 border-gray-100 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setEditItem(null)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 text-sm">Anulo</button>
                <button onClick={saveEdit}
                  className="flex-1 bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 text-sm shadow-md">Ruaj</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-4">
        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />)}</div>
        ) : (
          <>
            {/* DASHBOARD */}
            {tab === "dashboard" && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Recent Orders */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Package size={18} className="text-blue-600" /> Porositë e Fundit
                    </h3>
                    <div className="space-y-2">
                      {orders.slice(0, 5).map(o => (
                        <div key={o.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <div>
                            <p className="font-bold text-amber-600 text-sm">#{o.order_code}</p>
                            <p className="text-gray-500 text-xs">{o.customer_name} · {o.business_name}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                            <p className="text-gray-900 font-black text-sm mt-0.5">{o.total?.toFixed(2)}€</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Pending Approvals */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <RefreshCw size={18} className="text-amber-500" /> Aprovime Pritëse
                    </h3>
                    {pendingBiz === 0 && pendingDrivers === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="text-sm">Të gjitha janë aprovuar</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {businesses.filter(b => b.status === "pending").map(biz => (
                          <div key={biz.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">🏪 {biz.name}</p>
                              <p className="text-gray-500 text-xs">{biz.phone}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => approveBiz(biz.id)} className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-full flex items-center justify-center"><Check size={14} /></button>
                              <button onClick={() => rejectBiz(biz.id)} className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center"><X size={14} /></button>
                            </div>
                          </div>
                        ))}
                        {deliveries.filter(d => d.status === "pending").map(del => (
                          <div key={del.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">🛵 {del.name}</p>
                              <p className="text-gray-500 text-xs">{del.phone}</p>
                            </div>
                            <div className="flex gap-1.5">
                              <button onClick={() => approveDriver(del.id)} className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-700 rounded-full flex items-center justify-center"><Check size={14} /></button>
                              <button onClick={() => rejectDriver(del.id)} className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center"><X size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* BUSINESSES */}
            {tab === "businesses" && (
              <div className="space-y-3">
                {businesses.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">Nuk ka biznese</div>
                ) : businesses.map((biz, i) => (
                  <motion.div key={biz.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      {biz.image_url ? (
                        <img src={biz.image_url} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-2xl">🏪</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-gray-900">{biz.name}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${biz.status === "approved" ? "bg-green-100 text-green-700" : biz.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                            {biz.status === "approved" ? "✓ Aprovuar" : biz.status === "rejected" ? "✗ Refuzuar" : "⏳ Pritje"}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${biz.is_open ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                            {biz.is_open ? "🟢 Hapur" : "🔴 Mbyllur"}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">{biz.phone}</p>
                        <p className="text-gray-400 text-xs">{biz.address} · {biz.category}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {biz.status === "pending" && (
                          <>
                            <button onClick={() => approveBiz(biz.id)}
                              className="w-9 h-9 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl flex items-center justify-center transition-colors" title="Aprovo">
                              <Check size={16} />
                            </button>
                            <button onClick={() => rejectBiz(biz.id)}
                              className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl flex items-center justify-center transition-colors" title="Refuzo">
                              <X size={16} />
                            </button>
                          </>
                        )}
                        <button onClick={() => startEdit(biz, "business")}
                          className="w-9 h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center transition-colors">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => deleteBiz(biz.id)}
                          className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* DELIVERIES */}
            {tab === "deliveries" && (
              <div className="space-y-3">
                {deliveries.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">Nuk ka dorëzues</div>
                ) : deliveries.map((del, i) => (
                  <motion.div key={del.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-4">
                      {del.image_url ? (
                        <img src={del.image_url} className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-gray-100" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-2xl">🛵</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-bold text-gray-900">{del.name}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${del.status === "approved" ? "bg-green-100 text-green-700" : del.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}>
                            {del.status === "approved" ? "✓ Aprovuar" : del.status === "rejected" ? "✗ Refuzuar" : "⏳ Pritje"}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">{del.phone}</p>
                        <p className="text-gray-400 text-xs">{del.vehicle === "motor" ? "🛵 Motor" : del.vehicle === "biciklete" ? "🚲 Biçikletë" : "🚗 Makinë"} · {del.is_available ? "🟢 Aktiv" : "⚫ Jo aktiv"}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {del.status === "pending" && (
                          <>
                            <button onClick={() => approveDriver(del.id)}
                              className="w-9 h-9 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl flex items-center justify-center transition-colors">
                              <Check size={16} />
                            </button>
                            <button onClick={() => rejectDriver(del.id)}
                              className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl flex items-center justify-center transition-colors">
                              <X size={16} />
                            </button>
                          </>
                        )}
                        <button onClick={() => startEdit(del, "delivery")}
                          className="w-9 h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center transition-colors">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => deleteDriver(del.id)}
                          className="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ORDERS */}
            {tab === "orders" && (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">Nuk ka porosi</div>
                ) : orders.map((order, i) => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                          <Package size={18} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="font-black text-amber-600">#{order.order_code}</p>
                          <p className="text-gray-700 text-sm font-medium">{order.customer_name} · <span className="text-gray-500">{order.business_name}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                        <span className="font-black text-gray-900 text-sm">{order.total?.toFixed(2)}€</span>
                        {expandedOrder === order.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </div>
                    </div>
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-100 px-4 pb-4">
                          <div className="pt-3 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-gray-400 text-xs mb-0.5">Telefoni</p>
                                <p className="font-bold text-gray-900">{order.customer_phone}</p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-gray-400 text-xs mb-0.5">Adresa</p>
                                <p className="font-bold text-gray-900 text-xs">{order.customer_address}</p>
                              </div>
                            </div>
                            {order.delivery_name && (
                              <p className="text-sm text-gray-600 bg-purple-50 px-3 py-2 rounded-xl">🛵 <strong>Dorëzuesi:</strong> {order.delivery_name}</p>
                            )}
                            <div className="bg-gray-50 rounded-xl p-3">
                              {order.items?.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm py-0.5">
                                  <span className="text-gray-600">{item.qty}× {item.name}</span>
                                  <span className="font-semibold text-gray-900">{(item.price * item.qty).toFixed(2)}€</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.keys(STATUS_LABELS).map(s => (
                                <button key={s} onClick={() => updateOrderStatus(order.id, s)}
                                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${order.status === s ? STATUS_COLORS[s] + " ring-2 ring-offset-1" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                  {STATUS_LABELS[s]}
                                </button>
                              ))}
                              <button onClick={() => deleteOrder(order.id)}
                                className="text-xs px-3 py-1.5 rounded-full font-medium bg-red-100 text-red-600 hover:bg-red-200 flex items-center gap-1">
                                <Trash2 size={11} /> Fshi
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}