import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Store, Package, Truck, ClipboardList, Users, Trash2, LogOut, Loader2, DollarSign, TrendingUp, Star, Edit, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { verifyAdmin, setAdminSession, checkAdminSession, clearAdminSession } from "@/lib/adminAuth";
import { LOGO_URL } from "@/lib/constants";
import { ORDER_STATUSES } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import TiliGoSpinner from "@/components/TiliGoSpinner";

export default function Admin() {
  const [authed, setAuthed] = useState(checkAdminSession());
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const { toast } = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    if (verifyAdmin(loginForm.user, loginForm.pass)) {
      setAdminSession();
      setAuthed(true);
      setError("");
    } else {
      setError("Kredenciale të gabuara");
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setAuthed(false);
    setLoginForm({ user: "", pass: "" });
  };

  const loadAll = async () => {
    setLoading(true);
    const [businesses, orders, couriers, products, users] = await Promise.all([
      base44.entities.Business.list("-created_date", 200),
      base44.entities.Order.list("-created_date", 200),
      base44.entities.CourierProfile.list("-created_date", 200),
      base44.entities.Product.list("-created_date", 200),
      base44.entities.User.list("-created_date", 200),
    ]);
    setData({ businesses, orders, couriers, products, users });
    setLoading(false);
  };

  useEffect(() => { if (authed) loadAll(); }, [authed]);

  const deleteEntity = async (entity, id) => {
    if (!window.confirm("Konfirmo fshirjen?")) return;
    await base44.entities[entity].delete(id);
    toast({ title: "U fshi ✅" });
    loadAll();
  };

  const startEdit = (entity, record) => {
    setEditingId(record.id);
    setEditForm({ ...record, _entity: entity });
  };

  const saveEdit = async () => {
    const { _entity, id, created_date, updated_date, created_by_id, ...fields } = editForm;
    await base44.entities[_entity].update(id, fields);
    setEditingId(null);
    setEditForm({});
    toast({ title: "U ruajt ✅" });
    loadAll();
  };

  if (!authed) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="glass rounded-3xl p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <img src={LOGO_URL} alt="TiliGo" className="w-16 h-16 rounded-3xl mx-auto mb-3 object-cover shadow-xl shadow-primary/20" />
          <h1 className="font-heading font-black text-2xl gradient-text">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">Qasje e kufizuar — vetëm admin</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-3">
          <input value={loginForm.user} onChange={e => setLoginForm(p => ({ ...p, user: e.target.value }))}
            placeholder="Përdoruesi" className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          <input type="password" value={loginForm.pass} onChange={e => setLoginForm(p => ({ ...p, pass: e.target.value }))}
            placeholder="Fjalëkalimi" className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          <button type="submit" className="gradient-btn w-full py-3 rounded-xl font-bold text-sm">Hyr si Admin 🔐</button>
        </form>
      </div>
    </div>
  );

  const stats = {
    revenue: (data.orders || []).filter(o => o.status === "delivered").reduce((a, o) => a + (o.total || 0), 0),
    orders: (data.orders || []).length,
    businesses: (data.businesses || []).length,
    couriers: (data.couriers || []).length,
    products: (data.products || []).length,
    users: (data.users || []).length,
    activeOrders: (data.orders || []).filter(o => !["delivered", "cancelled"].includes(o.status)).length,
  };

  const tabs = [
    { id: "overview", label: "Përmbledhje", icon: TrendingUp },
    { id: "businesses", label: "Bizneset", icon: Store },
    { id: "orders", label: "Porositë", icon: ClipboardList },
    { id: "couriers", label: "Korrierët", icon: Truck },
    { id: "products", label: "Produktet", icon: Package },
    { id: "users", label: "Përdoruesit", icon: Users },
  ];

  const Field = ({ label, value, field, type = "text" }) => {
    if (editingId === editForm.id && editForm._entity) {
      return (
        <input type={type} value={editForm[field] ?? ""} onChange={e => setEditForm(p => ({ ...p, [field]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
          className="bg-muted/50 rounded-lg px-2 py-1 text-xs text-foreground outline-none w-full" placeholder={label} />
      );
    }
    return <span className="text-xs text-muted-foreground">{value ?? "—"}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="" className="w-10 h-10 rounded-2xl object-cover" />
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">TiliGo Control Center — Root Access</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={loadAll} className="px-4 py-2 rounded-xl glass text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">↻ Rifresko</button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold">
              <LogOut size={16} /> Dil
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><TiliGoSpinner /></div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Të ardhura totale", value: `€${stats.revenue.toFixed(0)}`, icon: DollarSign, color: "text-primary" },
                { label: "Porosi gjithsej", value: stats.orders, icon: ClipboardList, color: "text-accent" },
                { label: "Bizneset", value: stats.businesses, icon: Store, color: "text-yellow-400" },
                { label: "Përdoruesit", value: stats.users, icon: Users, color: "text-blue-400" },
              ].map((s, i) => (
                <div key={i} className="glass rounded-2xl p-4">
                  <s.icon size={18} className={`${s.color} mb-2`} />
                  <p className="font-mono font-bold text-xl text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${tab === t.id ? "gradient-btn" : "glass text-muted-foreground"}`}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>

            {/* Overview */}
            {tab === "overview" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Porosi aktive", value: stats.activeOrders, color: "text-primary" },
                  { label: "Korrierë", value: stats.couriers, color: "text-cyan-400" },
                  { label: "Produkte", value: stats.products, color: "text-yellow-400" },
                  { label: "Biznese aktive", value: (data.businesses || []).filter(b => b.status === "active").length, color: "text-green-400" },
                  { label: "Porosi sot", value: (data.orders || []).filter(o => new Date(o.created_date).toDateString() === new Date().toDateString()).length, color: "text-accent" },
                  { label: "Korrierë online", value: (data.couriers || []).filter(c => c.is_online).length, color: "text-primary" },
                ].map((s, i) => (
                  <div key={i} className="glass rounded-2xl p-5">
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className={`font-mono font-black text-3xl ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Businesses */}
            {tab === "businesses" && (
              <div className="space-y-2">
                {(data.businesses || []).map(b => (
                  <div key={b.id} className="glass rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      {b.logo ? <img src={b.logo} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" /> : <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">🏪</div>}
                      <div className="flex-1 min-w-0">
                        {editingId === b.id ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              {[["name","Emri"],["category","Kategoria"],["address","Adresa"],["phone","Telefoni"]].map(([f,l]) => (
                                <input key={f} value={editForm[f] ?? ""} onChange={e => setEditForm(p => ({ ...p, [f]: e.target.value }))}
                                  placeholder={l} className="bg-muted/50 rounded-lg px-2 py-1 text-xs text-foreground outline-none" />
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                                className="bg-muted/50 rounded-lg px-2 py-1 text-xs text-foreground outline-none">
                                {["active","pending","suspended"].map(s => <option key={s}>{s}</option>)}
                              </select>
                              <input type="number" step="0.01" value={editForm.delivery_fee ?? 0} onChange={e => setEditForm(p => ({ ...p, delivery_fee: parseFloat(e.target.value) || 0 }))}
                                placeholder="Tarifa" className="bg-muted/50 rounded-lg px-2 py-1 text-xs text-foreground outline-none w-20" />
                              <input type="number" value={editForm.delivery_time ?? 30} onChange={e => setEditForm(p => ({ ...p, delivery_time: parseInt(e.target.value) || 30 }))}
                                placeholder="Min" className="bg-muted/50 rounded-lg px-2 py-1 text-xs text-foreground outline-none w-20" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-semibold text-sm text-foreground truncate">{b.name}</p>
                            <p className="text-xs text-muted-foreground">{b.category} • {b.status} • {b.is_open ? "🟢 Hapur" : "🔴 Mbyllur"} • ⭐{b.rating?.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground">{b.address} • Tarifa: €{b.delivery_fee}</p>
                          </>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {editingId === b.id ? (
                          <>
                            <button onClick={saveEdit} className="p-2 rounded-lg text-primary hover:bg-primary/10"><Check size={16} /></button>
                            <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><X size={16} /></button>
                          </>
                        ) : (
                          <button onClick={() => startEdit("Business", b)} className="p-2 rounded-lg text-accent hover:bg-accent/10"><Edit size={16} /></button>
                        )}
                        <button onClick={() => base44.entities.Business.update(b.id, { is_open: !b.is_open }).then(loadAll)}
                          className={`p-2 rounded-lg ${b.is_open ? "text-primary" : "text-muted-foreground"}`}>
                          {b.is_open ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => deleteEntity("Business", b.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Orders */}
            {tab === "orders" && (
              <div className="space-y-2">
                {(data.orders || []).map(o => {
                  const info = ORDER_STATUSES[o.status] || ORDER_STATUSES.placed;
                  const items = (() => { try { return JSON.parse(o.items); } catch { return []; } })();
                  return (
                    <div key={o.id} className="glass rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-mono text-xs text-muted-foreground">#{o.id?.slice(-6)}</p>
                            <span className={`text-xs font-semibold ${info.color}`}>{info.icon} {info.label}</span>
                            <span className="font-mono font-bold text-primary text-sm">€{o.total?.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-foreground">{o.customer_name} • {o.customer_phone}</p>
                          <p className="text-xs text-muted-foreground truncate">📍 {o.delivery_address}</p>
                          <p className="text-xs text-muted-foreground">{items.length} artikuj • {new Date(o.created_date).toLocaleDateString("sq-AL")}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {editingId === o.id ? (
                            <>
                              <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                                className="bg-muted/50 rounded-lg px-2 py-1 text-xs text-foreground outline-none">
                                {Object.keys(ORDER_STATUSES).map(s => <option key={s}>{s}</option>)}
                              </select>
                              <button onClick={saveEdit} className="p-2 rounded-lg text-primary hover:bg-primary/10"><Check size={16} /></button>
                              <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><X size={16} /></button>
                            </>
                          ) : (
                            <button onClick={() => startEdit("Order", o)} className="p-2 rounded-lg text-accent hover:bg-accent/10"><Edit size={16} /></button>
                          )}
                          <button onClick={() => deleteEntity("Order", o.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Couriers */}
            {tab === "couriers" && (
              <div className="space-y-2">
                {(data.couriers || []).map(c => (
                  <div key={c.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">🛵</div>
                    <div className="flex-1 min-w-0">
                      {editingId === c.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {[["full_name","Emri"],["phone","Telefoni"],["plate_number","Targa"]].map(([f,l]) => (
                              <input key={f} value={editForm[f] ?? ""} onChange={e => setEditForm(p => ({ ...p, [f]: e.target.value }))}
                                placeholder={l} className="bg-muted/50 rounded-lg px-2 py-1 text-xs text-foreground outline-none" />
                            ))}
                            <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                              className="bg-muted/50 rounded-lg px-2 py-1 text-xs text-foreground outline-none">
                              {["active","pending","suspended"].map(s => <option key={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-sm text-foreground truncate">{c.full_name}</p>
                          <p className="text-xs text-muted-foreground">{c.vehicle_type} • {c.plate_number} • {c.is_online ? "🟢 Online" : "⚫ Offline"} • ⭐{c.rating?.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">Dërgesa: {c.total_deliveries} • Fitimet: €{c.total_earnings?.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {editingId === c.id ? (
                        <>
                          <button onClick={saveEdit} className="p-2 rounded-lg text-primary hover:bg-primary/10"><Check size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><X size={16} /></button>
                        </>
                      ) : (
                        <button onClick={() => startEdit("CourierProfile", c)} className="p-2 rounded-lg text-accent hover:bg-accent/10"><Edit size={16} /></button>
                      )}
                      <button onClick={() => deleteEntity("CourierProfile", c.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Products */}
            {tab === "products" && (
              <div className="space-y-2">
                {(data.products || []).map(p => (
                  <div key={p.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                    {p.image ? <img src={p.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" /> : <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">🍽️</div>}
                    <div className="flex-1 min-w-0">
                      {editingId === p.id ? (
                        <div className="grid grid-cols-2 gap-2">
                          {[["name","Emri"],["category","Kategoria"]].map(([f,l]) => (
                            <input key={f} value={editForm[f] ?? ""} onChange={e => setEditForm(p => ({ ...p, [f]: e.target.value }))}
                              placeholder={l} className="bg-muted/50 rounded-lg px-2 py-1 text-xs text-foreground outline-none" />
                          ))}
                          <input type="number" step="0.01" value={editForm.price ?? 0} onChange={e => setEditForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                            placeholder="Çmimi" className="bg-muted/50 rounded-lg px-2 py-1 text-xs text-foreground outline-none" />
                        </div>
                      ) : (
                        <>
                          <p className="font-semibold text-sm text-foreground truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">€{p.price?.toFixed(2)} • {p.category} • {p.is_available !== false ? "✅ Disponueshëm" : "❌ Jashtë stoku"}</p>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {editingId === p.id ? (
                        <>
                          <button onClick={saveEdit} className="p-2 rounded-lg text-primary hover:bg-primary/10"><Check size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><X size={16} /></button>
                        </>
                      ) : (
                        <button onClick={() => startEdit("Product", p)} className="p-2 rounded-lg text-accent hover:bg-accent/10"><Edit size={16} /></button>
                      )}
                      <button onClick={() => deleteEntity("Product", p.id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Users */}
            {tab === "users" && (
              <div className="space-y-2">
                {(data.users || []).map(u => (
                  <div key={u.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {u.avatar ? <img src={u.avatar} alt="" className="w-12 h-12 rounded-full object-cover" /> : <Users size={20} className="text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{u.full_name || "(pa emër)"}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${u.role === "admin" ? "bg-red-500/20 text-red-400" : "bg-primary/10 text-primary"}`}>{u.role}</span>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">{new Date(u.created_date).toLocaleDateString("sq-AL")}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}