import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Truck, ToggleLeft, ToggleRight, DollarSign, MapPin, Package, Check, Star, Loader2, Navigation } from "lucide-react";
import Navbar from "@/components/tiligo/Navbar";
import { ORDER_STATUSES } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { LOGO_URL } from "@/lib/constants";

export default function CourierDashboard() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [businesses, setBusinesses] = useState({});
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [tab, setTab] = useState("available");
  const { toast } = useToast();

  const [regForm, setRegForm] = useState({ full_name: "", phone: "", vehicle_type: "Motoçikletë", plate_number: "" });

  useEffect(() => {
    loadData();
    const unsub = base44.entities.Order.subscribe(() => loadOrders());
    return unsub;
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const profiles = await base44.entities.CourierProfile.filter({ user_id: user.id });
    if (profiles.length > 0) {
      setProfile(profiles[0]);
      await loadOrders();
    }
    setLoading(false);
  };

  const loadOrders = async () => {
    const user = await base44.auth.me();
    const available = await base44.entities.Order.filter({ status: "ready" }, "-created_date", 20);
    const myActive = await base44.entities.Order.filter({ courier_id: user.id }, "-created_date", 20);
    setOrders([...available, ...myActive.filter(o => !available.find(a => a.id === o.id))]);

    const bIds = [...new Set([...available, ...myActive].map(o => o.business_id).filter(Boolean))];
    if (bIds.length > 0) {
      const allB = await base44.entities.Business.list("-created_date", 100);
      const map = {};
      allB.forEach(b => { map[b.id] = b; });
      setBusinesses(map);
    }
  };

  const registerCourier = async () => {
    const user = await base44.auth.me();
    const p = await base44.entities.CourierProfile.create({ ...regForm, user_id: user.id, status: "active", is_online: false, rating: 5, total_deliveries: 0, total_earnings: 0 });
    setProfile(p);
    setShowRegister(false);
    toast({ title: "U regjistrove si korrier! 🎉" });
  };

  const toggleOnline = async () => {
    const updated = await base44.entities.CourierProfile.update(profile.id, { is_online: !profile.is_online });
    setProfile(updated);
    toast({ title: profile.is_online ? "Dole jashtë linje" : "Je online! 🟢" });
  };

  useEffect(() => {
    if (!profile?.is_online || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(async (pos) => {
      await base44.entities.CourierProfile.update(profile.id, {
        current_lat: pos.coords.latitude,
        current_lng: pos.coords.longitude,
      });
    }, null, { enableHighAccuracy: true, maximumAge: 10000 });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [profile?.is_online]);

  const acceptOrder = async (orderId) => {
    const user = await base44.auth.me();
    await base44.entities.Order.update(orderId, { courier_id: user.id, status: "assigned" });
    await loadOrders();
    toast({ title: "Porosia u pranua! 🚀" });
  };

  const updateDeliveryStatus = async (orderId, status) => {
    const data = { status };
    if (status === "picked_up") data.picked_up_at = new Date().toISOString();
    if (status === "delivered") data.delivered_at = new Date().toISOString();
    await base44.entities.Order.update(orderId, data);

    if (status === "delivered") {
      await base44.entities.CourierProfile.update(profile.id, {
        total_deliveries: (profile.total_deliveries || 0) + 1,
        total_earnings: (profile.total_earnings || 0) + 2,
      });
      setProfile(p => ({ ...p, total_deliveries: (p.total_deliveries || 0) + 1, total_earnings: (p.total_earnings || 0) + 2 }));
    }
    await loadOrders();
    toast({ title: `Statusi: ${ORDER_STATUSES[status]?.label}` });
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar /><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!profile && !showRegister) return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-4 text-center py-20">
        <img src={LOGO_URL} alt="" className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover" />
        <h2 className="font-heading font-bold text-xl text-foreground mb-2">Bëhu Korrier me TiliGo</h2>
        <p className="text-sm text-muted-foreground mb-6">Fito para duke dërguar porosi në qytetin tënd</p>
        <button onClick={() => setShowRegister(true)} className="gradient-btn px-8 py-3 rounded-2xl font-bold">
          Regjistrohu si Korrier 🛵
        </button>
      </div>
    </div>
  );

  if (showRegister) return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-4">
        <h2 className="font-heading font-bold text-xl text-foreground mb-6">Regjistrohu si Korrier</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Emri i plotë</label>
            <input value={regForm.full_name} onChange={e => setRegForm(p => ({ ...p, full_name: e.target.value }))}
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Telefoni</label>
            <input value={regForm.phone} onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Lloji i mjetit</label>
            <select value={regForm.vehicle_type} onChange={e => setRegForm(p => ({ ...p, vehicle_type: e.target.value }))}
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none">
              <option value="Biçikletë">Biçikletë</option>
              <option value="Motoçikletë">Motoçikletë</option>
              <option value="Veturë">Veturë</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Targa</label>
            <input value={regForm.plate_number} onChange={e => setRegForm(p => ({ ...p, plate_number: e.target.value }))}
              className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none" />
          </div>
          <button onClick={registerCourier} className="gradient-btn w-full py-3 rounded-2xl font-bold">Regjistrohu ✅</button>
        </div>
      </div>
    </div>
  );

  const userId = profile.user_id;
  const availableOrders = orders.filter(o => o.status === "ready" && !o.courier_id);
  const myOrders = orders.filter(o => o.courier_id === userId && !["delivered", "cancelled"].includes(o.status));
  const completedOrders = orders.filter(o => o.courier_id === userId && o.status === "delivered");

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Truck size={24} className="text-primary" />
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">{profile.full_name}</h1>
              <p className="text-xs text-muted-foreground">{profile.vehicle_type} • {profile.plate_number}</p>
            </div>
          </div>
          <button onClick={toggleOnline}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${profile.is_online ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {profile.is_online ? <><ToggleRight size={18} /> Online</> : <><ToggleLeft size={18} /> Offline</>}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass rounded-2xl p-4 text-center">
            <DollarSign size={18} className="text-primary mx-auto mb-1" />
            <p className="font-mono font-bold text-xl text-foreground">€{(profile.total_earnings || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Fitimet</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <Package size={18} className="text-accent mx-auto mb-1" />
            <p className="font-mono font-bold text-xl text-foreground">{profile.total_deliveries || 0}</p>
            <p className="text-xs text-muted-foreground">Dërgesa</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <Star size={18} className="text-yellow-400 mx-auto mb-1" />
            <p className="font-mono font-bold text-xl text-foreground">{profile.rating?.toFixed(1) || "5.0"}</p>
            <p className="text-xs text-muted-foreground">Vlerësimi</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "available", label: "Disponueshme", count: availableOrders.length },
            { id: "active", label: "Aktive", count: myOrders.length },
            { id: "history", label: "Historia" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${tab === t.id ? "gradient-btn" : "glass text-muted-foreground"}`}>
              {t.label}
              {t.count > 0 && <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Available */}
        {tab === "available" && (
          <div className="space-y-3">
            {availableOrders.length > 0 ? availableOrders.map(o => {
              const biz = businesses[o.business_id];
              const items = (() => { try { return JSON.parse(o.items); } catch { return []; } })();
              return (
                <div key={o.id} className="glass rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{biz?.name || "Dyqan"}</p>
                      <p className="text-xs text-muted-foreground">{items.length} artikuj</p>
                    </div>
                    <span className="font-mono font-bold text-primary">€{o.total?.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3 space-y-1">
                    <p>📍 Marrja: {biz?.address || "—"}</p>
                    <p>🏠 Dërgesa: {o.delivery_address}</p>
                  </div>
                  <button onClick={() => acceptOrder(o.id)}
                    className="gradient-btn w-full py-2.5 rounded-xl text-sm font-bold">
                    Prano Porosinë 🚀
                  </button>
                </div>
              );
            }) : (
              <div className="text-center py-16">
                <span className="text-4xl mb-3 block">📭</span>
                <p className="text-muted-foreground">Nuk ka porosi disponueshme</p>
                {!profile.is_online && <p className="text-xs text-primary mt-2">Shko online për të marrë porosi</p>}
              </div>
            )}
          </div>
        )}

        {/* Active deliveries */}
        {tab === "active" && (
          <div className="space-y-3">
            {myOrders.length > 0 ? myOrders.map(o => {
              const biz = businesses[o.business_id];
              const items = (() => { try { return JSON.parse(o.items); } catch { return []; } })();
              const nextStatus = o.status === "assigned" ? "picked_up" : o.status === "picked_up" ? "in_transit" : o.status === "in_transit" ? "delivered" : null;
              return (
                <div key={o.id} className="glass rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{biz?.name || "Dyqan"}</p>
                      <p className="text-xs text-muted-foreground font-mono">#{o.id?.slice(-6)}</p>
                    </div>
                    <span className={`text-xs font-semibold ${ORDER_STATUSES[o.status]?.color}`}>
                      {ORDER_STATUSES[o.status]?.icon} {ORDER_STATUSES[o.status]?.label}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3 space-y-1">
                    <p>📍 {biz?.address || "—"}</p>
                    <p>🏠 {o.delivery_address}</p>
                    <p>📦 {items.map(i => `${i.quantity}x ${i.name}`).join(", ")}</p>
                    {o.notes && <p className="italic">💬 {o.notes}</p>}
                  </div>
                  {nextStatus && (
                    <button onClick={() => updateDeliveryStatus(o.id, nextStatus)}
                      className="gradient-btn w-full py-2.5 rounded-xl text-sm font-bold">
                      {ORDER_STATUSES[nextStatus]?.icon} {ORDER_STATUSES[nextStatus]?.label}
                    </button>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-16">
                <span className="text-4xl mb-3 block">🛵</span>
                <p className="text-muted-foreground">Nuk keni dërgesa aktive</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {tab === "history" && (
          <div className="space-y-2">
            {completedOrders.length > 0 ? completedOrders.map(o => {
              const biz = businesses[o.business_id];
              return (
                <div key={o.id} className="glass rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{biz?.name || "Dyqan"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_date).toLocaleDateString("sq-AL")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-primary text-sm">€{o.total?.toFixed(2)}</p>
                    <p className="text-xs text-green-400">✅ Dërguar</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-16">
                <span className="text-4xl mb-3 block">📋</span>
                <p className="text-muted-foreground">Nuk keni dërgesa të përfunduara</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}