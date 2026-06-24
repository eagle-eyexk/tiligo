import React, { useState, useEffect } from "react";
import { Bell, MapPin, X, ChevronRight } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";

export default function PermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [notifStatus, setNotifStatus] = useState("default");
  const [locStatus, setLocStatus] = useState("default");
  const [step, setStep] = useState("idle"); // idle | asking_notif | asking_loc | done

  useEffect(() => {
    // Show prompt after 3s on first visit if permissions not yet decided
    const dismissed = localStorage.getItem("tiligo_perms_dismissed");
    if (dismissed) return;

    const notif = typeof Notification !== "undefined" ? Notification.permission : "denied";
    setNotifStatus(notif);

    if (notif === "default") {
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("tiligo_perms_dismissed", "1");
    setVisible(false);
  };

  const handleNotif = async () => {
    setStep("asking_notif");
    if (typeof Notification !== "undefined") {
      const result = await Notification.requestPermission();
      setNotifStatus(result);
    }
    setStep("asking_loc");
  };

  const handleLocation = () => {
    setStep("asking_loc");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { setLocStatus("granted"); setStep("done"); dismiss(); },
        () => { setLocStatus("denied"); setStep("done"); dismiss(); },
        { timeout: 10000 }
      );
    } else {
      dismiss();
    }
  };

  const skipLocation = () => dismiss();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center p-4 md:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* iOS-style sheet */}
      <div className="relative w-full max-w-sm ios-sheet animate-in slide-in-from-bottom-4 duration-300">
        <button onClick={dismiss} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <X size={14} className="text-white/70" />
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center pt-6 pb-4">
          <div className="relative mb-3">
            <img src={LOGO_URL} alt="TiliGo" className="w-16 h-16 rounded-2xl object-cover shadow-xl shadow-primary/30" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
              <Bell size={12} className="text-primary-foreground" />
            </div>
          </div>
          <h2 className="font-heading font-black text-lg text-white text-center">TiliGo ka nevojë</h2>
          <p className="text-white/60 text-xs text-center mt-1">për të të ofruar përvojën më të mirë</p>
        </div>

        {step === "idle" && (
          <div className="px-5 pb-6 space-y-3">
            <div className="ios-permission-row" onClick={handleNotif}>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                <Bell size={20} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Njoftime për Porosi</p>
                <p className="text-xs text-white/50">Njoftohu kur porosia jote është gati</p>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </div>

            <div className="ios-permission-row" onClick={handleLocation}>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Vendndodhja</p>
                <p className="text-xs text-white/50">Për dërgesa të shpejta te dera jote</p>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </div>

            <button onClick={handleNotif}
              className="w-full gradient-btn py-3.5 rounded-2xl font-bold text-sm mt-2">
              Lejo Aksesin
            </button>
            <button onClick={dismiss}
              className="w-full text-center text-xs text-white/40 py-2 hover:text-white/60 transition-colors">
              Jo tani
            </button>
          </div>
        )}

        {step === "asking_notif" && (
          <div className="px-5 pb-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Bell size={24} className="text-primary" />
            </div>
            <p className="text-white text-sm font-semibold">Duke kërkuar leje njoftimesh...</p>
            <p className="text-white/50 text-xs mt-1">Kliko "Lejo" në kutinë që shfaqet</p>
          </div>
        )}

        {step === "asking_loc" && (
          <div className="px-5 pb-6 space-y-3">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <MapPin size={24} className="text-blue-400" />
              </div>
              <p className="text-white text-sm font-semibold">Lejo Vendndodhjen?</p>
              <p className="text-white/50 text-xs mt-1">Për të gjetur restorantet pranë teje dhe për dërgesa të shpejta</p>
            </div>
            <button onClick={handleLocation}
              className="w-full gradient-btn py-3.5 rounded-2xl font-bold text-sm">
              Lejo Vendndodhjen
            </button>
            <button onClick={skipLocation}
              className="w-full text-center text-xs text-white/40 py-2 hover:text-white/60 transition-colors">
              Anulo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}