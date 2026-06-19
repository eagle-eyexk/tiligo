import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Lock, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import TiliGoLogo from "@/components/TiliGoLogo";
import { motion } from "framer-motion";

export default function UserLogin() {
  const navigate = useNavigate();
  const saved = (() => { try { return JSON.parse(localStorage.getItem("tiligo_user_remember") || "null"); } catch { return null; } })();
  const [form, setForm] = useState({ phone: saved?.phone || "", password: saved?.password || "" });
  const [remember, setRemember] = useState(!!saved);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const results = await base44.entities.Customer.filter({ phone: form.phone });
    if (results.length === 0) { setError("Numri i telefonit nuk u gjet!"); setLoading(false); return; }
    const customer = results[0];
    if (customer.password !== form.password) { setError("Fjalëkalimi është i gabuar!"); setLoading(false); return; }
    if (remember) localStorage.setItem("tiligo_user_remember", JSON.stringify({ phone: form.phone, password: form.password }));
    else localStorage.removeItem("tiligo_user_remember");
    localStorage.setItem("tiligo_user_profile", JSON.stringify({ id: customer.id, name: customer.name, phone: customer.phone }));
    setLoading(false);
    navigate("/porositjet-e-mia");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-body)' }}>
      <div className="px-4 h-14 flex items-center gap-3" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)' }}>
        <Link to="/" style={{ color: '#00BFFF' }}><ArrowLeft size={22} /></Link>
        <TiliGoLogo size="sm" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 w-full max-w-sm"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(0,191,255,0.15)', border: '2px solid rgba(0,191,255,0.4)' }}>
              <User size={24} style={{ color: '#00BFFF' }} />
            </div>
            <h1 className="text-xl font-black" style={{ color: 'var(--text-heading)' }}>Hyrja e Klientit</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Hyni në llogarinë tuaj TiliGo</p>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-4 text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <Phone size={13} /> Numri i Telefonit
              </label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+383 44 000 000" required
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ background: '#fff', border: '1.5px solid #bfdbfe', color: '#1e3a5f' }} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                <Lock size={13} /> Fjalëkalimi
              </label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" required
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ background: '#fff', border: '1.5px solid #bfdbfe', color: '#1e3a5f' }} />
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div onClick={() => setRemember(!remember)}
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: remember ? '#00BFFF' : 'transparent', border: remember ? '2px solid #00BFFF' : '2px solid rgba(0,191,255,0.3)' }}>
                {remember && <span className="text-white text-xs font-black">✓</span>}
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Mbaj mend të dhënat e hyrjes</span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full font-black py-3.5 rounded-2xl text-sm transition-all active:scale-95 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#39FF6B,#00BFFF)', color: '#020c1b', boxShadow: '0 0 20px rgba(57,255,107,0.3)' }}>
              {loading ? "Duke hyrë..." : "Hyni"}
            </button>
          </form>

          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Nuk keni llogari?{" "}
            <Link to="/user/register" className="font-bold" style={{ color: '#39FF6B' }}>Regjistrohu & merr 2€ 🎁</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}