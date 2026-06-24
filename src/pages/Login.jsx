import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Email ose fjalëkalimi i gabuar");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", "/");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="TiliGo" className="w-20 h-20 rounded-3xl object-cover mx-auto mb-4 shadow-2xl shadow-primary/30" />
          <h1 className="font-heading font-black text-3xl gradient-text">TiliGo</h1>
          <p className="text-muted-foreground text-sm mt-1">Hyr në llogarinë tënde</p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-5">
          {/* Google */}
          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-border bg-background hover:bg-muted transition-colors font-semibold text-sm text-foreground">
            <GoogleIcon className="w-5 h-5" />
            Vazhdo me Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground rounded">ose</span></div>
          </div>

          {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                  placeholder="ti@example.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-muted/50 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground transition-all" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-foreground">Fjalëkalimi</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Harrova fjalëkalimin</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3.5 rounded-2xl bg-muted/50 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="gradient-btn w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Duke hyrë...</> : "Hyr në Llogari"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Nuk ke llogari?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Regjistrohu</Link>
          </p>
        </div>
      </div>
    </div>
  );
}