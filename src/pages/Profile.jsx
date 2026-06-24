import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, MapPin, Plus, Trash2, LogOut, Loader2, Edit2, Save, X, Camera, ClipboardList, Store, Truck, ShieldCheck } from "lucide-react";
import Navbar from "@/components/tiligo/Navbar";
import { LOGO_URL, COMPANY_INFO } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import TiliGoSpinner from "@/components/TiliGoSpinner";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "" });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [hasCourier, setHasCourier] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setEditForm({ full_name: u.full_name || "" });
      base44.entities.Address.filter({ user_id: u.id }).then(setAddresses);
      base44.entities.Order.filter({ customer_id: u.id }, "-created_date", 5).then(setOrders);
      base44.entities.Business.filter({ owner_id: u.id }).then(r => setHasBusiness(r.length > 0));
      base44.entities.CourierProfile.filter({ user_id: u.id }).then(r => setHasCourier(r.length > 0));
    });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    await base44.auth.updateMe(editForm);
    setUser(u => ({ ...u, ...editForm }));
    setEditing(false);
    setSaving(false);
    toast({ title: "Profili u ruajt! ✅" });
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar: file_url });
      setUser(u => ({ ...u, avatar: file_url }));
      toast({ title: "Foto e profilit u ndryshua! 📸" });
    } catch {
      toast({ title: "Gabim gjatë ngarkimit", variant: "destructive" });
    }
    setUploadingAvatar(false);
  };

  const addAddress = async () => {
    if (!newAddr.label || !newAddr.address) return;
    setSaving(true);
    const addr = await base44.entities.Address.create({ ...newAddr, user_id: user.id });
    setAddresses(prev => [...prev, addr]);
    setNewAddr({ label: "", address: "" });
    setShowAddForm(false);
    setSaving(false);
    toast({ title: "Adresa u shtua! 📍" });
  };

  const deleteAddress = async (id) => {
    await base44.entities.Address.delete(id);
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast({ title: "Adresa u fshi" });
  };

  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <TiliGoSpinner />
    </div>
  );

  const dashboardLinks = [
    { to: "/orders", icon: ClipboardList, label: "Porositë e Mia", color: "text-primary" },
    ...(hasBusiness || user.role === "admin" ? [{ to: "/business-dashboard", icon: Store, label: "Paneli i Biznesit", color: "text-yellow-400" }] : []),
    ...(hasCourier || user.role === "admin" ? [{ to: "/courier-dashboard", icon: Truck, label: "Paneli i Korrierit", color: "text-cyan-400" }] : []),
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-4">

        {/* Avatar & Profile Card */}
        <div className="glass rounded-3xl p-6 mb-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/20 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-primary" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 gradient-btn rounded-xl flex items-center justify-center cursor-pointer shadow-lg">
                {uploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="Emri i plotë"
                    className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm text-foreground outline-none" />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} disabled={saving}
                      className="gradient-btn px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Ruaj
                    </button>
                    <button onClick={() => setEditing(false)} className="px-4 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs">
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-heading font-bold text-xl text-foreground">{user.full_name || "Përdoruesi"}</h2>
                    <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                      <Edit2 size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === "admin" ? "bg-red-500/20 text-red-400" : "bg-primary/10 text-primary"}`}>
                    {user.role === "admin" ? "👑 Admin" : user.role === "business" ? "🏪 Biznes" : user.role === "courier" ? "🛵 Korrier" : "👤 Klient"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Links */}
        <div className="glass rounded-2xl p-4 mb-6 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Panelet</p>
          {dashboardLinks.map(l => (
            <Link key={l.to} to={l.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <l.icon size={18} className={l.color} />
              <span className="text-sm font-medium text-foreground">{l.label}</span>
              <svg className="ml-auto w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><ClipboardList size={16} className="text-primary" /> Porositë e Fundit</h3>
              <Link to="/orders" className="text-xs text-primary hover:underline">Shiko të gjitha</Link>
            </div>
            <div className="space-y-2">
              {orders.slice(0, 3).map(o => (
                <Link key={o.id} to={`/order/${o.id}`} className="flex justify-between items-center p-3 bg-muted/20 rounded-xl hover:bg-muted/40 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground font-mono">#{o.id?.slice(-6)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_date).toLocaleDateString("sq-AL")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-primary text-sm">€{o.total?.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{o.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Addresses */}
        <div className="glass rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Adresat e Ruajtura</h3>
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
              <Plus size={16} />
            </button>
          </div>

          {showAddForm && (
            <div className="space-y-3 mb-4 p-4 bg-muted/30 rounded-xl">
              <input value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))}
                placeholder="Emri (p.sh. Shtëpia)" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <input value={newAddr.address} onChange={e => setNewAddr(p => ({ ...p, address: e.target.value }))}
                placeholder="Adresa e plotë" className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
              <button onClick={addAddress} disabled={saving}
                className="gradient-btn w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : null} Ruaj Adresën
              </button>
            </div>
          )}

          {addresses.length > 0 ? (
            <div className="space-y-2">
              {addresses.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                  <div><p className="text-sm font-semibold text-foreground">{a.label}</p><p className="text-xs text-muted-foreground">{a.address}</p></div>
                  <button onClick={() => deleteAddress(a.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nuk keni adresa të ruajtura</p>
          )}
        </div>

        {/* Company info */}
        <div className="glass rounded-2xl p-5 mb-6 text-center">
          <img src={LOGO_URL} alt="TiliGo" className="w-10 h-10 rounded-xl mx-auto mb-2 object-cover" />
          <p className="text-sm font-bold text-foreground">{COMPANY_INFO.legalName}</p>
          <p className="text-xs text-muted-foreground">Dërgesa më e shpejtë në Kosovë 🇽🇰</p>
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-1 text-left">
            {[
              ["NUI", COMPANY_INFO.uniqueId], ["Regjistri", COMPANY_INFO.registry],
              ["Komuna", COMPANY_INFO.municipality], ["Adresa", COMPANY_INFO.address],
              ["Regjistruar", COMPANY_INFO.registrationDate], ["Lloji", "SH.P.K."],
            ].map(([k, v]) => (
              <p key={k} className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{k}:</span> {v}</p>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button onClick={() => base44.auth.logout("/login")}
          className="w-full py-3 rounded-2xl bg-destructive/10 text-destructive font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors mb-4">
          <LogOut size={18} /> Dil nga llogaria
        </button>
      </div>
    </div>
  );
}