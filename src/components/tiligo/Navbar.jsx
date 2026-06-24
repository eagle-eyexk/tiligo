import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Home, ClipboardList, Store, Truck, Info, X } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";
import { useCart } from "@/lib/cartStore.jsx";
import { base44 } from "@/api/base44Client";

export default function Navbar() {
  const location = useLocation();
  const { getItemCount } = useCart();
  const count = getItemCount();
  const path = location.pathname;
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading
  const [bannerDismissed, setBannerDismissed] = useState(
    () => sessionStorage.getItem("tiligo_banner_dismissed") === "1"
  );

  useEffect(() => {
    base44.auth.me().then(() => setIsLoggedIn(true)).catch(() => setIsLoggedIn(false));
  }, []);

  const dismissBanner = () => {
    sessionStorage.setItem("tiligo_banner_dismissed", "1");
    setBannerDismissed(true);
  };

  const showBanner = isLoggedIn === false && !bannerDismissed;

  const links = [
    { to: "/", icon: Home, label: "Kryefaqja" },
    { to: "/orders", icon: ClipboardList, label: "Porositë" },
    { to: "/about", icon: Info, label: "Rreth Nesh" },
  ];

  return (
    <>
      {/* Guest welcome banner — shown only to unauthenticated visitors */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-primary/95 backdrop-blur-sm px-4 py-2 flex items-center justify-between gap-3">
          <p className="text-primary-foreground text-xs font-medium flex-1 text-center">
            👋 Mirë se vjen! <span className="font-bold">Porosit si mysafir</span> ose{" "}
            <Link to="/register" className="underline font-bold hover:opacity-80 transition-opacity">
              Regjistrohu falas
            </Link>
            {" "}·{" "}
            <Link to="/login" className="underline font-bold hover:opacity-80 transition-opacity">
              Hyr
            </Link>
          </p>
          <button onClick={dismissBanner} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Desktop top nav */}
      <nav className={`hidden md:flex fixed left-0 right-0 z-50 glass h-16 items-center px-6 justify-between transition-all ${showBanner ? "top-9" : "top-0"}`}>
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="TiliGo" className="w-10 h-10 rounded-xl object-cover" />
          <span className="font-heading font-bold text-xl gradient-text">TiliGo</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${path === l.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <l.icon size={18} />
              <span>{l.label}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative p-2 rounded-xl hover:bg-muted transition-colors">
            <ShoppingCart size={22} className="text-foreground" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center pulse-badge">
                {count}
              </span>
            )}
          </Link>
          {isLoggedIn ? (
            <Link to="/profile" className="p-2 rounded-xl hover:bg-muted transition-colors">
              <User size={22} className="text-foreground" />
            </Link>
          ) : (
            <Link to="/profile" className="p-2 rounded-xl hover:bg-muted transition-colors">
              <User size={22} className="text-muted-foreground" />
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 pb-safe">
        <div className="flex items-center justify-around h-16">
          {[
            { to: "/", icon: Home, label: "Kryefaqja" },
            { to: "/orders", icon: ClipboardList, label: "Porositë" },
            { to: "/cart", icon: ShoppingCart, label: "Shporta", badge: count },
            { to: "/about", icon: Info, label: "Rreth" },
            { to: "/profile", icon: User, label: "Profili" },
          ].map(l => (
            <Link key={l.to} to={l.to}
              className={`flex flex-col items-center gap-0.5 relative ${path === l.to ? "text-primary" : "text-muted-foreground"}`}>
              <div className="relative">
                <l.icon size={20} />
                {l.badge > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center pulse-badge">
                    {l.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{l.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}