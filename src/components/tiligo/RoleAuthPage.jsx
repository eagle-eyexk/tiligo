import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Loader2, Eye, EyeOff, Store, Truck, ArrowLeft } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";
import GoogleIcon from "@/components/GoogleIcon";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { setIntent } from "@/lib/roleRedirect";

const META = {
  business: {
    label: "Biznes",
    Icon: Store,
    title: "TiliGo Biznes",
    subLogin: "Hyr në panelin e biznesit",
    subRegister: "Krijo llogari biznesi — fillo të shesësh",
    dash: "/business-dashboard",
    loginPath: "/business/login",
    registerPath: "/business/register",
  },
  courier: {
    label: "Korrier",
    Icon: Truck,
    title: "TiliGo Korrier",
    subLogin: "Hyr në panelin e korrierit",
    subRegister: "Krijo llogari korrieri — fillo të fitosh",
    dash: "/courier-dashboard",
    loginPath: "/courier/login",
    registerPath: "/courier/register",
  },
};

export default function RoleAuthPage({ kind, mode }) {
  const m = META[kind];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      setIntent(kind);
      window.location.href = m.dash;
    } catch (err) {
      setError(err.message || "Email ose fjalëkalimi i gabuar");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Fjalëkalimet nuk përputhen"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Regjistrimi dështoi");
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setError(""); setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      setIntent(kind);
      window.location.href = m.dash;
    } catch (err) {
      setError(err.message || "Kodi i gabuar");
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
    setIntent(kind);
    base44.auth.loginWithProvider("google", m.dash);
  };

  if (showOtp) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="TiliGo" className="w-20 h-20 rounded-3xl object-cover mx-auto mb-4 shadow-2xl shadow-primary/30" />
          <h1 className="font-heading font-black text-2xl gradient-text">Verifiko Email-in</h1>
          <p className="text-muted-foreground text-sm mt-1">Kodin e dërguat te <span className="text-foreground font-medium">{email}</span></p>
        </div>
        <div className="glass rounded-3xl p-8 space-y-6">
          {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">{error}</div>}
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
              <InputOTPGroup>
                <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <button onClick={handleVerify} disabled={loading || otpCode.length < 6}
            className="gradient-btn w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Duke verifikuar...</> : "Verifiko ✅"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Nuk e more kodin?{" "}
            <button onClick={() => base44.auth.resendOtp(email)} className="text-primary font-semibold hover:underline">Dërgo përsëri</button>
          </p>
        </div>
      </div>
    </div>
  );

  const isRegister = mode === "register";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <m.Icon size={28} className="text-primary" />
          </div>
          <h1 className="font-heading font-black text-3xl gradient-text">{m.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isRegister ? m.subRegister : m.subLogin}</p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-5">
          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-border bg-background hover:bg-muted transition-colors font-semibold text-sm text-foreground">
            <GoogleIcon className="w-5 h-5" />
            Vazhdo me Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground rounded">ose</span></div>
          </div>

          {error && <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">{error}</div>}

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
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
              <label className="text-sm font-medium text-foreground mb-1.5 block">Fjalëkalimi</label>
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
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Konfirmo Fjalëkalimin</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-muted/50 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground transition-all" />
                </div>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="gradient-btn w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> {isRegister ? "Duke u regjistruar..." : "Duke hyrë..."}</>
                : isRegister ? `Regjistrohu si ${m.label} 🚀` : `Hyr si ${m.label}`}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? "Ke llogari? " : "Nuk ke llogari? "}
            <Link to={isRegister ? m.loginPath : m.registerPath} className="text-primary font-semibold hover:underline">
              {isRegister ? `Hyr si ${m.label}` : `Regjistrohu si ${m.label}`}
            </Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={12} /> Kthehu te hyrja e klientit
          </Link>
        </div>
      </div>
    </div>
  );
}