import React, { useState, useEffect } from "react";
import { Clock, Navigation } from "lucide-react";

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LiveETA({ order, courier, business }) {
  const [etaMinutes, setEtaMinutes] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const calc = () => {
      let eta = null;

      if (courier?.current_lat && courier?.current_lng) {
        // Courier is live — calculate distance to customer
        // We don't have customer coords stored, so estimate from pickup distance
        const businessLat = business?.lat || 42.82;
        const businessLng = business?.lng || 20.97;
        const distKm = haversineDistance(
          courier.current_lat, courier.current_lng,
          businessLat, businessLng
        );
        // Average speed 25 km/h in city
        const minutesToBusiness = (distKm / 25) * 60;
        const prep = business?.delivery_time || 20;

        if (["in_transit", "picked_up"].includes(order?.status)) {
          // Already picked up — estimate remaining delivery time
          eta = Math.max(1, Math.round(minutesToBusiness));
        } else {
          eta = Math.round(prep + minutesToBusiness);
        }
      } else {
        // No live courier — use business delivery time
        const prep = business?.delivery_time || 25;
        const statusBump = {
          placed: prep + 10,
          accepted: prep + 5,
          preparing: prep,
          ready: 10,
          assigned: 8,
          picked_up: 6,
          in_transit: 3,
          delivered: 0,
        };
        eta = statusBump[order?.status] ?? prep;
      }

      setEtaMinutes(eta);
    };

    calc();
    const interval = setInterval(calc, 30000); // recalc every 30s
    return () => clearInterval(interval);
  }, [courier?.current_lat, courier?.current_lng, order?.status, business]);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000 / 60));
    }, 60000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (order?.status === "delivered" || order?.status === "cancelled") return null;

  const isLive = courier?.current_lat && ["in_transit", "picked_up", "assigned"].includes(order?.status);

  return (
    <div className={`glass rounded-2xl p-5 mb-6 border ${isLive ? "border-primary/40 bg-primary/5" : "border-border/30"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isLive ? "bg-primary/20" : "bg-muted"}`}>
            <Clock size={20} className={isLive ? "text-primary animate-pulse" : "text-muted-foreground"} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
              {isLive ? "⚡ Kohë e Mbetur (Live)" : "⏱ Koha e Parashikuar"}
            </p>
            <p className="font-mono font-black text-3xl text-foreground">
              {etaMinutes !== null ? (
                etaMinutes === 0 ? "Tani!" : `${etaMinutes} min`
              ) : "—"}
            </p>
          </div>
        </div>

        {isLive && (
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-primary text-xs font-semibold mb-1">
              <Navigation size={12} className="animate-pulse" />
              Gjurmim Live
            </div>
            <p className="text-xs text-muted-foreground">
              {elapsed > 0 ? `${elapsed} min nga porosia` : "Sapo porositur"}
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {etaMinutes !== null && etaMinutes > 0 && (
        <div className="mt-4">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (elapsed / (elapsed + etaMinutes)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}