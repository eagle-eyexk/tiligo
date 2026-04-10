import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Lock, Phone, Gift } from "lucide-react";
import { base44 } from "@/api/base44Client";
import TiliGoLogo from "@/components/TiliGoLogo";
import { motion } from "framer-motion";

export default function UserRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Fjalëkalimet nuk përputhen!"); return; }
    if (form.password.length < 4) { setError("Fjalëkalimi duhet të ketë së paku 4 karaktere!"); return; }
    setLoading(true);
    const existing = await base44.entities.Customer.filter({ phone: form.phone });
    if (existing.length > 0) { setError("Ky numër telefoni është tashmë i regjistruar!"); setLoading(false); return; }
    const customer = await base44.entities.Customer.create({ name: form.name, phone: form.phone, password: form.password });
    // Auto welcome coupon
    const welcomeCode = "WELCOME-" + form.phone;
    const already = await base44.entities.Coupon.filter({ code: welcomeCode });
    if (already.length === 0) {
      await base44.entities.Coupon.create({ code: welcomeCode, description: "Bonus Mirëseardhjes 🎁", discount_amount: 2, is_active: true, uses_left: 1 });
    }
    const profile = { id: customer.id, name: form.name, phone: form.phone };
    localStorage.setItem("tiligo_user_profile", JSON.stringify(profile));
    setLoading(false);
    navigate("/porositjet-e-mia");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-body)' }}>
      <div className="px-4 h-14 flex items-center gap-3" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)' }}>
        <Link to="/" style={{ color: '#00BFFF' }}><ArrowLeft size={22} /></Link>
        <TiliGoLogo size="sm" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-4">

          {/* Promo card */}
          <div className="rounded-3xl p-5 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#020c1b,#0a2a4a)', border: '1px solid rgba(57,255,107,0.4)' }}>
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle,#39FF6B,transparent 70%)', transform: 'translate(30%,-30%)' }} />
            <div className="text-3xl mb-2">🎁</div>
            <p className="font-black text-lg" style={{ color: '#39FF6B' }}>Fiton 2€ Falas!</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(125,211,252,0.8)' }}>Krijo llogarinë tënde dhe merr 2€ bonus për porosinë e parë</p>
          </div>

          {/* Form card */}
          <div className="rounded-3xl p-6" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(57,255,107,0.15)', border: '2px solid rgba(57,255,107,0.4)' }}>
                <User size={24} style={{ color: '#39FF6B' }} />
              </div>
              <h1 className="text-xl font-black" style={{ color: 'var(--text-heading)' }}>Regjistrohu</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Krijo llogarinë tënde TiliGo</p>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 mb-4 text-sm font-medium"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
              {[
                { key: "name", label: "Emri i Plotë", placeholder: "Arben Krasniqi", icon: <User size={14} />, type: "text" },
                { key: "phone", label: "Numri i Telefonit", placeholder: "+383 44 000 000", icon: <Phone size={14} />, type: "tel" },
                { key: "password", label: "Fjalëkalimi", placeholder: "••••••••", icon: <Lock size={14} />, type: "password" },
                { key: "confirm", label: "Konfirmo Fjalëkalimin", placeholder: "••••••••", icon: <Lock size={14} />, type: "password" },
              ].map(({ key, label, placeholder, icon, type }) => (
                <div key={key}>
                  <label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    {icon} {label}
                  </label>
                  <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder} required
                    className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                    style={{ background: 'var(--input-bg)', border: '1.5px solid var(--card-border)', color: 'var(--text-primary)' }} />
                </div>
              ))}

              <button type="submit" disabled={loading}
                className="w-full font-black py-3.5 rounded-2xl text-sm transition-all active:scale-95 mt-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b', boxShadow: '0 0 20px rgba(57,255,107,0.3)' }}>
                {loading ? "Duke u regjistruar..." : "🎁 Regjistrohu & Merr 2€"}
              </button>
            </form>

            <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              Keni llogari?{" "}
              <Link to="/user/login" className="font-bold" style={{ color: '#00BFFF' }}>Hyni</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}