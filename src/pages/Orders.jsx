import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ClipboardList, ChevronRight } from "lucide-react";
import Navbar from "@/components/tiligo/Navbar";
import { ORDER_STATUSES } from "@/lib/constants";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [businesses, setBusinesses] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");

  useEffect(() => {
    loadOrders();
    const unsub = base44.entities.Order.subscribe(() => loadOrders());
    return unsub;
  }, []);

  const loadOrders = async () => {
    const user = await base44.auth.me();
    const allOrders = await base44.entities.Order.filter({ customer_id: user.id }, "-created_date", 50);
    setOrders(allOrders);
    const bIds = [...new Set(allOrders.map(o => o.business_id).filter(Boolean))];
    if (bIds.length > 0) {
      const allB = await base44.entities.Business.list("-created_date", 100);
      const map = {};
      allB.forEach(b => { map[b.id] = b; });
      setBusinesses(map);
    }
    setLoading(false);
  };

  const active = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
  const completed = orders.filter(o => o.status === "delivered");
  const cancelled = orders.filter(o => o.status === "cancelled");

  const tabs = [
    { id: "active", label: "Aktive", count: active.length },
    { id: "completed", label: "Përfunduara", count: completed.length },
    { id: "cancelled", label: "Anuluara", count: cancelled.length },
  ];

  const currentList = tab === "active" ? active : tab === "completed" ? completed : cancelled;

  const renderOrder = (order) => {
    const biz = businesses[order.business_id];
    const info = ORDER_STATUSES[order.status] || ORDER_STATUSES.placed;
    const items = (() => { try { return JSON.parse(order.items); } catch { return []; } })();
    return (
      <Link key={order.id} to={`/order/${order.id}`} className="glass rounded-2xl p-4 block glass-hover transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {biz?.logo ? <img src={biz.logo} alt="" className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">🏪</div>}
            <div>
              <h3 className="font-semibold text-sm text-foreground">{biz?.name || "Dyqan"}</h3>
              <p className="text-xs text-muted-foreground">{items.length} artikuj • €{order.total?.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${info.color}`}>{info.icon} {info.label}</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{new Date(order.created_date).toLocaleDateString("sq-AL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          <span className="font-mono">#{order.id?.slice(-6)}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList size={24} className="text-primary" />
          <h1 className="font-heading font-bold text-xl text-foreground">Porositë e Mia</h1>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? "gradient-btn" : "glass text-muted-foreground"}`}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : currentList.length > 0 ? (
          <div className="space-y-3">
            {currentList.map(renderOrder)}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">📋</span>
            <p className="text-muted-foreground text-lg">Nuk ka porosi {tab === "active" ? "aktive" : tab === "completed" ? "të përfunduara" : "të anuluara"}</p>
            <Link to="/" className="gradient-btn px-6 py-2 rounded-xl mt-4 inline-block text-sm font-bold">
              Porosit tani
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}