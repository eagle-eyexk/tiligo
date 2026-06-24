import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { LOGO_URL, COMPANY_INFO } from "@/lib/constants";
import { Check, MapPin, Printer, Navigation } from "lucide-react";

export default function Invoice() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const orders = await base44.entities.Order.filter({ id });
      const o = orders[0];
      if (o) {
        setOrder(o);
        const b = await base44.entities.Business.filter({ id: o.business_id });
        setBusiness(b[0]);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <span className="text-5xl mb-4 block">😕</span>
        <p className="text-gray-500">Fatura nuk u gjet</p>
        <Link to="/orders" className="mt-4 inline-block bg-green-500 text-white px-6 py-2 rounded-xl text-sm font-bold">Porositë e Mia</Link>
      </div>
    </div>
  );

  const items = (() => { try { return JSON.parse(order.items); } catch { return []; } })();
  const date = new Date(order.created_date).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const orderId = order.id?.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success banner */}
        <div className="no-print text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-3 shadow-lg shadow-green-500/30">
            <Check size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Porosia u Pranua!</h1>
          <p className="text-gray-500 text-sm mt-1">Ruaj ID-në e porosisë për gjurmim</p>
        </div>

        {/* Invoice card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="TiliGo" className="w-14 h-14 rounded-2xl object-cover" />
                <div>
                  <h2 className="text-2xl font-bold">Faturë</h2>
                  <p className="text-white/80 text-sm">{date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-xs uppercase">ID e Porosisë</p>
                <p className="font-mono font-bold text-lg">#{orderId}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            {/* Customer & Business info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Klienti</p>
                <p className="text-gray-800 font-bold">{order.customer_name || "—"}</p>
                <p className="text-gray-600 text-sm">{order.customer_phone || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Biznesi</p>
                <p className="text-gray-800 font-bold">{business?.name || "—"}</p>
                <p className="text-gray-600 text-sm">{business?.address || ""}</p>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <MapPin size={18} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Adresa e Dërgesës</p>
                  <p className="text-gray-800 text-sm">{order.delivery_address}</p>
                </div>
              </div>
            </div>

            {/* Items table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-xs text-gray-500 uppercase font-semibold">Artikulli</th>
                    <th className="text-center p-3 text-xs text-gray-500 uppercase font-semibold">Sasia</th>
                    <th className="text-right p-3 text-xs text-gray-500 uppercase font-semibold">Çmimi</th>
                    <th className="text-right p-3 text-xs text-gray-500 uppercase font-semibold">Totali</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="p-3 text-sm text-gray-800">{item.name}</td>
                      <td className="p-3 text-center text-sm text-gray-600">{item.quantity}</td>
                      <td className="p-3 text-right text-sm text-gray-600 font-mono">€{item.price?.toFixed(2)}</td>
                      <td className="p-3 text-right text-sm text-gray-800 font-mono font-semibold">€{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nëntotali</span>
                <span className="text-gray-800 font-mono">€{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dërgesa</span>
                <span className="text-gray-800 font-mono">€{order.delivery_fee?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Zbritje</span>
                  <span className="text-green-600 font-mono">-€{order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-800 font-bold text-lg">Totali</span>
                <span className="text-gray-900 font-mono font-bold text-2xl">€{order.total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Status */}
            <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-4">
              <div>
                <p className="text-gray-400 text-xs uppercase font-semibold">Pagesa</p>
                <p className="text-gray-800 font-semibold">{order.payment_method === "card" ? "Kartë 💳" : "Cash 💵"}</p>
              </div>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                ✅ Pranuar
              </span>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-yellow-50 rounded-2xl p-4">
                <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Shënim</p>
                <p className="text-gray-700 text-sm italic">"{order.notes}"</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="px-8 pb-8 space-y-3 no-print">
            <Link to={`/order/${order.id}`}
              className="block w-full text-center bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Navigation size={18} className="inline mr-2" />
              Gjurmo Porosinë
            </Link>
            <button onClick={() => window.print()}
              className="w-full border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <Printer size={18} />
              Printo Faturën
            </button>
          </div>

          {/* Footer - Company info */}
          <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
            <img src={LOGO_URL} alt="TiliGo" className="w-10 h-10 rounded-xl mx-auto mb-2 object-cover" />
            <p className="text-gray-800 font-bold text-sm">{COMPANY_INFO.legalName}</p>
            <p className="text-gray-500 text-xs mt-1">{COMPANY_INFO.type}</p>
            <div className="flex justify-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
              <span>NUI: {COMPANY_INFO.uniqueId}</span>
              <span>•</span>
              <span>ARBK</span>
              <span>•</span>
              <span>{COMPANY_INFO.municipality}</span>
            </div>
            <p className="text-gray-400 text-xs mt-1">
              {COMPANY_INFO.address} • Regjistruar më: {COMPANY_INFO.registrationDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}