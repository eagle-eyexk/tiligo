import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Phone, Check, Clock, MapPin, FileText } from "lucide-react";
import Navbar from "@/components/tiligo/Navbar";
import { ORDER_STATUSES, STATUS_FLOW } from "@/lib/constants";
import { useNotifications } from "@/hooks/useNotifications";
import TiliGoSpinner from "@/components/TiliGoSpinner";
import LiveETA from "@/components/tiligo/LiveETA";
import CourierMapPin from "@/components/tiligo/CourierMapPin";

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [business, setBusiness] = useState(null);
  const [courier, setCourier] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotifications();
  const prevStatus = useRef(null);

  useEffect(() => {
    loadOrder();
    const unsub = base44.entities.Order.subscribe(event => {
      if (event.data?.id === id) {
        setOrder(event.data);
        // load courier when assigned
        if (event.data?.courier_id) {
          base44.entities.CourierProfile.filter({ user_id: event.data.courier_id }).then(r => setCourier(r[0]));
        }
      }
    });
    return unsub;
  }, [id]);

  useEffect(() => {
    if (courier?.id) {
      const unsub = base44.entities.CourierProfile.subscribe(event => {
        if (event.data?.id === courier.id) setCourier(event.data);
      });
      return unsub;
    }
  }, [courier?.id]);

  useEffect(() => {
    if (order && prevStatus.current !== null && prevStatus.current !== order.status) {
      const info = ORDER_STATUSES[order.status];
      notify(`Porosia #${order.id?.slice(-6)}`, `${info?.icon} ${info?.label}`);
    }
    if (order) prevStatus.current = order.status;
  }, [order?.status]);

  const loadOrder = async () => {
    const orders = await base44.entities.Order.filter({ id });
    const o = orders[0];
    if (o) {
      setOrder(o);
      const b = await base44.entities.Business.filter({ id: o.business_id });
      setBusiness(b[0]);
      if (o.courier_id) {
        const c = await base44.entities.CourierProfile.filter({ user_id: o.courier_id });
        setCourier(c[0]);
      }
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar /><TiliGoSpinner />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Navbar />
      <div className="text-center">
        <span className="text-5xl mb-4 block">😕</span>
        <p className="text-muted-foreground">Porosia nuk u gjet</p>
        <Link to="/orders" className="gradient-btn px-6 py-2 rounded-xl mt-4 inline-block text-sm">Porositë e Mia</Link>
      </div>
    </div>
  );

  const items = (() => { try { return JSON.parse(order.items); } catch { return []; } })();
  const currentIdx = STATUS_FLOW.indexOf(order.status);

  const deliveryAddr = order.delivery_address;
  const businessAddr = business?.address || "";

  // Apple Maps — direction from courier/business to delivery address
  const saddr = courier?.current_lat
    ? `${courier.current_lat},${courier.current_lng}`
    : businessAddr;
  const appleMapsDirectionsURL = `https://maps.apple.com/?daddr=${encodeURIComponent(deliveryAddr)}&saddr=${encodeURIComponent(saddr)}&dirflg=d`;

  // Apple Maps static-style embed (uses maps.apple.com with ll param for centering)
  const mapLat = courier?.current_lat || business?.lat;
  const mapLng = courier?.current_lng || business?.lng;
  const appleMapsEmbedURL = mapLat
    ? `https://maps.apple.com/?ll=${mapLat},${mapLng}&z=15&t=m`
    : null;

  // Fallback OSM embed only if no coords at all
  const osmEmbedURL = !appleMapsEmbedURL && business?.lat
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${business.lng - 0.01},${business.lat - 0.01},${business.lng + 0.01},${business.lat + 0.01}&layer=mapnik&marker=${business.lat},${business.lng}`
    : null;

  const showMap = appleMapsEmbedURL || osmEmbedURL;

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-16">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/orders" className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-xl text-foreground">Gjurmimi i Porosisë</h1>
            <p className="text-xs text-muted-foreground font-mono">#{order.id?.slice(-8)}</p>
          </div>
          <Link to={`/invoice/${order.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <FileText size={14} /> Fatura
          </Link>
        </div>

        {/* Live ETA — shown at top as soon as courier is assigned */}
        <LiveETA order={order} courier={courier} business={business} />

        {/* Map — Apple Maps primary, OSM fallback */}
        {showMap && (
          <div className="glass rounded-2xl overflow-hidden mb-6">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {courier?.current_lat ? "📍 Korrieri tani — Live" : "📍 Vendndodhja"}
                </span>
                {courier?.current_lat && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
              </div>
              <a href={appleMapsDirectionsURL} target="_blank" rel="noopener noreferrer"
                className="gradient-btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                🗺️ Hap Apple Maps
              </a>
            </div>

            {/* Courier character banner */}
            {courier && (
              <div className="flex items-center gap-4 px-4 py-3 bg-primary/5 border-b border-border">
                <div style={{ animation: "bounce 1.2s infinite" }}>
                  <CourierMapPin vehicleType={courier.vehicle_type} size={64} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{courier.full_name}</p>
                  <p className="text-xs text-muted-foreground">{courier.vehicle_type} • {courier.plate_number}</p>
                  <p className="text-xs text-primary font-semibold mt-0.5">
                    {courier.is_online ? "🟢 Online — Po dërgon" : "⚪ Duke u afruar..."}
                  </p>
                </div>
              </div>
            )}

            {/* Apple Maps iframe embed */}
            {appleMapsEmbedURL ? (
              <div className="relative">
                <iframe
                  src={`https://maps.apple.com/maps?output=embed&daddr=${encodeURIComponent(deliveryAddr)}&saddr=${encodeURIComponent(saddr)}`}
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  title="Apple Maps Live"
                  allowFullScreen
                  onError={(e) => {
                    // Graceful fallback: show a link card if iframe is blocked
                    e.target.style.display = "none";
                  }}
                />
                {/* Tap-to-open overlay when iframe is blocked on some devices */}
                <a
                  href={appleMapsDirectionsURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm gap-3 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <span className="text-4xl">🗺️</span>
                  <span className="font-semibold text-sm text-foreground">Hap Apple Maps</span>
                </a>
                {courier?.current_lat && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div style={{ marginTop: "-30px", animation: "bounce 1.5s infinite" }}>
                      <CourierMapPin vehicleType={courier.vehicle_type} size={56} />
                    </div>
                  </div>
                )}
              </div>
            ) : osmEmbedURL ? (
              <iframe
                src={osmEmbedURL}
                width="100%"
                height="280"
                style={{ border: 0 }}
                title="Harta"
                allowFullScreen
              />
            ) : null}

            {/* iOS-style deep-link button */}
            <a
              href={appleMapsDirectionsURL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors border-t border-border"
            >
              <MapPin size={15} /> Udhëzime Drejtpërdrejt në Apple Maps
            </a>
          </div>
        )}

        {/* Status timeline */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="space-y-0">
            {STATUS_FLOW.map((status, idx) => {
              const info = ORDER_STATUSES[status];
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              const isLast = idx === STATUS_FLOW.length - 1;
              return (
                <div key={status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all duration-500 ${isCompleted ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground"} ${isCurrent ? "pulse-badge" : ""}`}>
                      {isCompleted ? <Check size={16} /> : <Clock size={14} />}
                    </div>
                    {!isLast && <div className={`w-0.5 h-8 transition-all duration-500 ${isCompleted ? "bg-primary" : "bg-muted"}`} />}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-semibold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {info.icon} {info.label}
                    </p>
                    {isCurrent && order.status !== "delivered" && order.status !== "cancelled" && (
                      <p className="text-xs text-primary mt-0.5 animate-pulse">Duke u procesuar...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courier info */}
        {courier && (
          <div className="glass rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Korrieri yt 🛵</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden">
                {courier.photo ? <img src={courier.photo} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">🛵</span>}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{courier.full_name}</p>
                <p className="text-xs text-muted-foreground">{courier.vehicle_type} • {courier.plate_number}</p>
                <p className="text-xs text-muted-foreground">⭐ {courier.rating?.toFixed(1)} • {courier.total_deliveries} dërgesa</p>
              </div>
              {courier.phone && (
                <a href={`tel:${courier.phone}`} className="w-11 h-11 rounded-2xl gradient-btn flex items-center justify-center shadow-lg">
                  <Phone size={18} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Business info */}
        {business && (
          <div className="glass rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Biznesi</h3>
            <div className="flex items-center gap-3">
              {business.logo ? <img src={business.logo} alt="" className="w-12 h-12 rounded-xl object-cover" /> : <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">🏪</div>}
              <div>
                <p className="font-semibold text-sm text-foreground">{business.name}</p>
                <p className="text-xs text-muted-foreground">{business.address}</p>
                {business.phone && <p className="text-xs text-muted-foreground">{business.phone}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="glass rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Artikujt</h3>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                <span className="font-mono font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Nëntotali</span><span className="font-mono">€{order.subtotal?.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Dërgesa</span><span className="font-mono">€{order.delivery_fee?.toFixed(2)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-sm text-primary"><span>Zbritje</span><span className="font-mono">-€{order.discount?.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold pt-1"><span>Totali</span><span className="font-mono gradient-text text-lg">€{order.total?.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">📍 Adresa e dërgesës</h3>
          <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
          {order.notes && <p className="text-xs text-muted-foreground mt-2 italic">💬 {order.notes}</p>}
        </div>
      </div>
    </div>
  );
}