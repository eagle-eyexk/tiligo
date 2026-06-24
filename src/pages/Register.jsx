import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Loader2, Eye, EyeOff, ShoppingBag } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";
import GoogleIcon from "@/components/GoogleIcon";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Fjalëkalimet nuk përputhen"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Regjistrimi dështoi");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Kodi i gabuar");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", "/");

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="TiliGo" className="w-20 h-20 rounded-3xl object-cover mx-auto mb-4 shadow-2xl shadow-primary/30" />
          <h1 className="font-heading font-black text-3xl gradient-text">TiliGo</h1>
          <p className="text-muted-foreground text-sm mt-1">Krijo llogarinë e klientit falas</p>
        </div>

        <div className="glass rounded-3xl p-8 space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/20">
            <ShoppingBag size={20} className="text-primary shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">Llogari Klienti</p>
              <p className="text-xs text-muted-foreground">Porosit ushqim & produkte. Bizneset & korrierët regjistrohen përmes <Link to="/about" className="text-primary hover:underline">portaleve të tyre</Link>.</p>
            </div>
          </div>

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
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Konfirmo Fjalëkalimin</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-muted/50 text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground transition-all" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="gradient-btn w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Duke u regjistruar...</> : "Krijo Llogarinë 🚀"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Ke llogari?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Hyr</Link>
          </p>
        </div>
      </div>
    </div>
  );
}