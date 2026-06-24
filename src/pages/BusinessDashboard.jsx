import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Store, Package, Plus, Edit, Trash2, ToggleLeft, ToggleRight, DollarSign, ShoppingCart, Star, Clock, Loader2, Check, X, Camera, Settings } from "lucide-react";
import Navbar from "@/components/tiligo/Navbar";
import { ORDER_STATUSES } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { LOGO_URL } from "@/lib/constants";
import TiliGoSpinner from "@/components/TiliGoSpinner";

export default function BusinessDashboard() {
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("orders");
  const [showRegister, setShowRegister] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingBiz, setEditingBiz] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProductImg, setUploadingProductImg] = useState(false);
  const { toast } = useToast();

  const [regForm, setRegForm] = useState({ name: "", description: "", category: "Restorante", address: "", phone: "", delivery_time: 30, delivery_fee: 1, min_order: 5 });
  const [prodForm, setProdForm] = useState({ name: "", description: "", price: 0, category: "", image: "" });

  useEffect(() => {
    loadData();
    const unsub = base44.entities.Order.subscribe(() => { if (business) loadOrdersForBiz(business.id); });
    return unsub;
  }, []);

  useEffect(() => {
    if (business) {
      const unsub = base44.entities.Order.subscribe(() => loadOrdersForBiz(business.id));
      return unsub;
    }
  }, [business?.id]);

  const loadData = async () => {
    const user = await base44.auth.me();
    const myBiz = await base44.entities.Business.filter({ owner_id: user.id });
    if (myBiz.length > 0) {
      setBusiness(myBiz[0]);
      setRegForm(myBiz[0]);
      await loadProducts(myBiz[0].id);
      await loadOrdersForBiz(myBiz[0].id);
    }
    setLoading(false);
  };

  const loadProducts = async (bizId) => {
    const p = await base44.entities.Product.filter({ business_id: bizId });
    setProducts(p);
  };

  const loadOrdersForBiz = async (bizId) => {
    const o = await base44.entities.Order.filter({ business_id: bizId }, "-created_date", 50);
    setOrders(o);
  };

  const registerBusiness = async () => {
    const user = await base44.auth.me();
    const biz = await base44.entities.Business.create({ ...regForm, owner_id: user.id, status: "active", is_open: true, rating: 5 });
    setBusiness(biz);
    setShowRegister(false);
    toast({ title: "Biznesi u regjistrua! 🎉" });
  };

  const saveBizSettings = async () => {
    const updated = await base44.entities.Business.update(business.id, regForm);
    setBusiness(updated);
    setEditingBiz(false);
    toast({ title: "Cilësimet u ruajtën! ✅" });
  };

  const uploadBizImage = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (field === "cover_image") setUploadingCover(true); else setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updated = await base44.entities.Business.update(business.id, { [field]: file_url });
      setBusiness(updated);
      toast({ title: "Foto u ndryshua! 📸" });
    } catch { toast({ title: "Gabim gjatë ngarkimit", variant: "destructive" }); }
    if (field === "cover_image") setUploadingCover(false); else setUploadingLogo(false);
  };

  const uploadProductImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingProductImg(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProdForm(p => ({ ...p, image: file_url }));
    } catch { toast({ title: "Gabim gjatë ngarkimit", variant: "destructive" }); }
    setUploadingProductImg(false);
  };

  const toggleOpen = async () => {
    const updated = await base44.entities.Business.update(business.id, { is_open: !business.is_open });
    setBusiness(updated);
    toast({ title: business.is_open ? "Dyqani u mbyll" : "Dyqani u hap! ✅" });
  };

  const addProduct = async () => {
    await base44.entities.Product.create({ ...prodForm, business_id: business.id, is_available: true });
    setProdForm({ name: "", description: "", price: 0, category: "", image: "" });
    setShowAddProduct(false);
    await loadProducts(business.id);
    toast({ title: "Produkti u shtua! ✅" });
  };

  const updateProduct = async () => {
    await base44.entities.Product.update(editingProduct.id, prodForm);
    setEditingProduct(null);
    setProdForm({ name: "", description: "", price: 0, category: "", image: "" });
    await loadProducts(business.id);
    toast({ title: "Produkti u përditësua ✅" });
  };

  const deleteProduct = async (id) => {
    await base44.entities.Product.delete(id);
    await loadProducts(business.id);
    toast({ title: "Produkti u fshi" });
  };

  const toggleAvailability = async (p) => {
    await base44.entities.Product.update(p.id, { is_available: !p.is_available });
    await loadProducts(business.id);
  };

  const updateOrderStatus = async (orderId, status) => {
    const data = { status };
    if (status === "accepted") data.accepted_at = new Date().toISOString();
    if (status === "preparing") data.prepared_at = new Date().toISOString();
    await base44.entities.Order.update(orderId, data);
    await loadOrdersForBiz(business.id);
    toast({ title: `Statusi: ${ORDER_STATUSES[status]?.label}` });
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar /><TiliGoSpinner />
    </div>
  );

  if (!business && !showRegister) return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-16 text-center">
        <img src={LOGO_URL} alt="" className="w-20 h-20 rounded-3xl mx-auto mb-6 object-cover shadow-xl shadow-primary/20" />
        <h2 className="font-heading font-black text-2xl text-foreground mb-2">Regjistro Biznesin Tënd</h2>
        <p className="text-sm text-muted-foreground mb-8">Fillo të shesësh me TiliGo dhe arrij mijëra klientë në Kosovë</p>
        <button onClick={() => setShowRegister(true)} className="gradient-btn px-10 py-4 rounded-2xl font-bold text-base">
          Regjistrohu Tani 🚀
        </button>
      </div>
    </div>
  );

  if (showRegister) return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-4">
        <h2 className="font-heading font-bold text-xl text-foreground mb-6">Regjistro Biznesin</h2>
        <div className="glass rounded-2xl p-6 space-y-4">
          {[
            { key: "name", label: "Emri i biznesit", type: "text" },
            { key: "description", label: "Përshkrimi", type: "text" },
            { key: "address", label: "Adresa", type: "text" },
            { key: "phone", label: "Telefoni", type: "text" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm text-muted-foreground mb-1 block">{f.label}</label>
              <input value={regForm[f.key] || ""} onChange={e => setRegForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none" />
            </div>
          ))}
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Kategoria</label>
            <select value={regForm.category} onChange={e => setRegForm(p => ({ ...p, category: e.target.value }))}
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none">
              {["Restorante", "Pica", "Burgera", "Sushi", "Supermarket", "Farmaci", "Kafe", "Ushqim"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{ key: "delivery_time", label: "Koha (min)" }, { key: "delivery_fee", label: "Tarifa (€)" }, { key: "min_order", label: "Min (€)" }].map(f => (
              <div key={f.key}>
                <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                <input type="number" value={regForm[f.key] || 0} onChange={e => setRegForm(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none" />
              </div>
            ))}
          </div>
          <button onClick={registerBusiness} className="gradient-btn w-full py-3 rounded-2xl font-bold">Regjistro ✅</button>
        </div>
      </div>
    </div>
  );

  const pendingOrders = orders.filter(o => o.status === "placed");
  const activeOrders = orders.filter(o => ["accepted", "preparing", "ready"].includes(o.status));
  const todayOrders = orders.filter(o => new Date(o.created_date).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.filter(o => o.status === "delivered").reduce((a, o) => a + (o.total || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-4">

        {/* Business Header with cover image */}
        <div className="glass rounded-3xl overflow-hidden mb-6">
          <div className="relative h-32 bg-gradient-to-r from-primary/20 to-accent/20">
            {business.cover_image && <img src={business.cover_image} alt="" className="w-full h-full object-cover" />}
            <label className="absolute top-3 right-3 gradient-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              {uploadingCover ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} Foto Kopertinë
              <input type="file" accept="image/*" onChange={e => uploadBizImage(e, "cover_image")} className="hidden" />
            </label>
          </div>
          <div className="p-5 flex items-start gap-4">
            <div className="relative -mt-10">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted border-4 border-card">
                {business.logo ? <img src={business.logo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🏪</div>}
              </div>
              <label className="absolute -bottom-1 -right-1 w-6 h-6 gradient-btn rounded-lg flex items-center justify-center cursor-pointer">
                {uploadingLogo ? <Loader2 size={10} className="animate-spin" /> : <Camera size={10} />}
                <input type="file" accept="image/*" onChange={e => uploadBizImage(e, "logo")} className="hidden" />
              </label>
            </div>
            <div className="flex-1 pt-2">
              <h1 className="font-heading font-bold text-lg text-foreground">{business.name}</h1>
              <p className="text-xs text-muted-foreground">{business.category} • {business.address}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={toggleOpen}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${business.is_open ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                {business.is_open ? <><ToggleRight size={16} /> Hapur</> : <><ToggleLeft size={16} /> Mbyllur</>}
              </button>
              <button onClick={() => setEditingBiz(!editingBiz)}
                className="p-2 rounded-xl glass text-muted-foreground hover:text-foreground transition-colors">
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* Edit business settings inline */}
          {editingBiz && (
            <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[{ key: "name", label: "Emri" }, { key: "description", label: "Përshkrimi" }, { key: "address", label: "Adresa" }, { key: "phone", label: "Telefoni" }].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                    <input value={regForm[f.key] || ""} onChange={e => setRegForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm text-foreground outline-none" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ key: "delivery_time", label: "Koha (min)" }, { key: "delivery_fee", label: "Tarifa (€)" }, { key: "min_order", label: "Min (€)" }].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                    <input type="number" value={regForm[f.key] || 0} onChange={e => setRegForm(p => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm text-foreground outline-none" />
                  </div>
                ))}
              </div>
              <button onClick={saveBizSettings} className="gradient-btn px-6 py-2 rounded-xl text-sm font-bold">Ruaj Cilësimet</button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Të ardhurat sot", value: `€${todayRevenue.toFixed(2)}`, icon: DollarSign, color: "text-primary" },
            { label: "Porosi sot", value: todayOrders.length, icon: ShoppingCart, color: "text-accent" },
            { label: "Në pritje", value: pendingOrders.length, icon: Clock, color: "text-yellow-400" },
            { label: "Vlerësimi", value: business.rating?.toFixed(1) || "5.0", icon: Star, color: "text-yellow-400" },
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
          {[
            { id: "orders", label: "Porositë", badge: pendingOrders.length },
            { id: "menu", label: "Menuja" },
            { id: "history", label: "Historia" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${tab === t.id ? "gradient-btn" : "glass text-muted-foreground"}`}>
              {t.label}
              {t.badge > 0 && <span className="w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center pulse-badge">{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="space-y-3">
            {pendingOrders.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-yellow-400 mb-3">⏳ Në Pritje ({pendingOrders.length})</h3>
                {pendingOrders.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={updateOrderStatus} />)}
              </div>
            )}
            {activeOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-primary mb-3">🔄 Aktive ({activeOrders.length})</h3>
                {activeOrders.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={updateOrderStatus} />)}
              </div>
            )}
            {pendingOrders.length === 0 && activeOrders.length === 0 && (
              <div className="text-center py-16"><span className="text-4xl mb-3 block">📭</span><p className="text-muted-foreground">Nuk ka porosi të reja</p></div>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {tab === "menu" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Produktet ({products.length})</h3>
              <button onClick={() => { setShowAddProduct(true); setEditingProduct(null); setProdForm({ name: "", description: "", price: 0, category: "", image: "" }); }}
                className="gradient-btn px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <Plus size={16} /> Shto
              </button>
            </div>

            {(showAddProduct || editingProduct) && (
              <div className="glass rounded-2xl p-5 mb-4 space-y-3">
                <h4 className="font-semibold text-sm text-foreground">{editingProduct ? "Ndrysho Produktin" : "Shto Produkt të Ri"}</h4>

                {/* Product image upload */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-muted/50 overflow-hidden flex items-center justify-center shrink-0">
                    {prodForm.image ? <img src={prodForm.image} alt="" className="w-full h-full object-cover" /> : <Package size={24} className="text-muted-foreground" />}
                  </div>
                  <div>
                    <label className="gradient-btn px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer w-fit">
                      {uploadingProductImg ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />} Ngarko Foto
                      <input type="file" accept="image/*" onChange={uploadProductImage} className="hidden" />
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">ose vendos URL:</p>
                    <input value={prodForm.image} onChange={e => setProdForm(p => ({ ...p, image: e.target.value }))}
                      placeholder="https://..." className="bg-muted/50 rounded-lg px-3 py-1.5 text-xs text-foreground outline-none w-full mt-1 placeholder:text-muted-foreground" />
                  </div>
                </div>

                <input value={prodForm.name} onChange={e => setProdForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Emri" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <input value={prodForm.description} onChange={e => setProdForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Përshkrimi" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="0.01" value={prodForm.price} onChange={e => setProdForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="Çmimi (€)" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                  <input value={prodForm.category} onChange={e => setProdForm(p => ({ ...p, category: e.target.value }))}
                    placeholder="Kategoria" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  <button onClick={editingProduct ? updateProduct : addProduct} className="gradient-btn flex-1 py-2.5 rounded-xl text-sm font-bold">
                    {editingProduct ? "Ruaj Ndryshimet" : "Shto Produktin"} ✅
                  </button>
                  <button onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}
                    className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm">Anulo</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {products.map(p => (
                <div key={p.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                  {p.image ? <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" /> : <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-xl">🍽️</div>}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">{p.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                    <p className="text-xs text-muted-foreground">{p.category} • <span className="font-mono text-primary font-bold">€{p.price?.toFixed(2)}</span></p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleAvailability(p)}
                      className={`p-2 rounded-lg transition-colors ${p.is_available !== false ? "text-primary" : "text-muted-foreground"}`}>
                      {p.is_available !== false ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => { setEditingProduct(p); setProdForm({ name: p.name, description: p.description || "", price: p.price, category: p.category || "", image: p.image || "" }); setShowAddProduct(false); }}
                      className="p-2 rounded-lg text-accent hover:bg-accent/10 transition-colors"><Edit size={16} /></button>
                    <button onClick={() => deleteProduct(p.id)}
                      className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <div className="text-center py-12"><span className="text-4xl mb-3 block">📦</span><p className="text-muted-foreground text-sm">Nuk keni produkte. Shtoni produktin e parë!</p></div>}
            </div>
          </div>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <div className="space-y-2">
            {orders.filter(o => ["delivered", "cancelled"].includes(o.status)).map(o => {
              const items = (() => { try { return JSON.parse(o.items); } catch { return []; } })();
              const info = ORDER_STATUSES[o.status];
              return (
                <div key={o.id} className="glass rounded-2xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">#{o.id?.slice(-6)}</p>
                      <p className="text-sm text-foreground">{o.customer_name || "Klient"} • {items.length} artikuj • <span className="font-mono font-bold text-primary">€{o.total?.toFixed(2)}</span></p>
                    </div>
                    <span className={`text-xs font-semibold ${info?.color}`}>{info?.icon} {info?.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(o.created_date).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus }) {
  const items = (() => { try { return JSON.parse(order.items); } catch { return []; } })();
  const info = ORDER_STATUSES[order.status];
  const nextStatus = order.status === "placed" ? "accepted" : order.status === "accepted" ? "preparing" : order.status === "preparing" ? "ready" : null;

  return (
    <div className="glass rounded-2xl p-4 mb-2 border-l-4" style={{ borderColor: order.status === "placed" ? "#facc15" : "#39FF6B" }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-mono text-xs text-muted-foreground">#{order.id?.slice(-6)}</p>
          <p className="text-sm font-semibold text-foreground">{order.customer_name || "Klient"}</p>
          <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
        </div>
        <div className="text-right">
          <span className={`text-xs font-semibold ${info?.color}`}>{info?.label}</span>
          <p className="font-mono font-bold text-primary text-sm">€{order.total?.toFixed(2)}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-1">📦 {items.map(i => `${i.quantity}x ${i.name}`).join(", ")}</p>
      <p className="text-xs text-muted-foreground mb-3">📍 {order.delivery_address}</p>
      {order.notes && <p className="text-xs text-muted-foreground mb-3 italic">💬 {order.notes}</p>}
      <div className="flex gap-2">
        {order.status === "placed" && (
          <>
            <button onClick={() => onUpdateStatus(order.id, "accepted")}
              className="gradient-btn flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
              <Check size={14} /> Prano
            </button>
            <button onClick={() => onUpdateStatus(order.id, "cancelled")}
              className="flex-1 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-bold flex items-center justify-center gap-1">
              <X size={14} /> Refuzo
            </button>
          </>
        )}
        {nextStatus && order.status !== "placed" && (
          <button onClick={() => onUpdateStatus(order.id, nextStatus)}
            className="gradient-btn flex-1 py-2 rounded-xl text-xs font-bold">
            {ORDER_STATUSES[nextStatus]?.icon} {ORDER_STATUSES[nextStatus]?.label}
          </button>
        )}
      </div>
    </div>
  );
}