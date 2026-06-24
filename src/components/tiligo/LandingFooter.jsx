import React from "react";
import { Link } from "react-router-dom";
import { Store, Truck, Info, FileText, Shield, Phone, MapPin, Star, Clock, Package, Facebook } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";

export default function LandingFooter() {
  return (
    <footer className="mt-16">
      {/* Partner / Role CTA section */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="text-center mb-8">
          <h2 className="font-heading font-black text-2xl text-foreground mb-2">
            Bashkohu me <span className="gradient-text">TiliGo</span>
          </h2>
          <p className="text-muted-foreground text-sm">Zgjedh rolin tënd dhe fillo sot</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Business */}
          <div className="glass rounded-2xl p-6 border border-border hover:border-primary/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Store size={24} className="text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">Biznesi yt online</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Regjistro dyqanin, restorantin ose farmacin tënde. Merr porosi online dhe rrit shitjet.
            </p>
            <div className="flex gap-2">
              <Link to="/business/register" className="flex-1 gradient-btn py-2.5 rounded-xl text-sm font-bold text-center">
                Regjistro Biznesin
              </Link>
              <Link to="/business/login" className="flex-1 glass py-2.5 rounded-xl text-sm font-semibold text-center text-muted-foreground hover:text-foreground transition-colors">
                Hyr si Biznes
              </Link>
            </div>
          </div>

          {/* Courier */}
          <div className="glass rounded-2xl p-6 border border-border hover:border-primary/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Truck size={24} className="text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">Bëhu Korrier</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fitime fleksibël, orare të lira. Dërgon me biçikletë, motor ose veturë — ti vendos.
            </p>
            <div className="flex gap-2">
              <Link to="/courier/register" className="flex-1 gradient-btn py-2.5 rounded-xl text-sm font-bold text-center">
                Apliko Tani
              </Link>
              <Link to="/courier/login" className="flex-1 glass py-2.5 rounded-xl text-sm font-semibold text-center text-muted-foreground hover:text-foreground transition-colors">
                Hyr si Korrier
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SEO info strip */}
      <div className="bg-muted/30 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Star size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">Cilësia</span>
              </div>
              <p className="text-xs text-muted-foreground">Partnerë të verifikuar, produkte të freskëta, dërgesa të sigurta.</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">Shpejtësia</span>
              </div>
              <p className="text-xs text-muted-foreground">Dërgesa brenda 30 minutash. Gjurmo porosinë tënde live.</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Package size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">Shumëllojshmëri</span>
              </div>
              <p className="text-xs text-muted-foreground">Ushqim, pije, farmaci, supermarket — gjithçka në një vend.</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary mb-1">
                <MapPin size={16} />
                <span className="text-xs font-bold uppercase tracking-wide">Mbulimi</span>
              </div>
              <p className="text-xs text-muted-foreground">Vushtrri dhe qytetet kryesore të Kosovës 🇽🇰</p>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6 mb-6">
            {[
              { to: "/about", icon: Info, label: "Rreth TiliGo" },
              { to: "/about", icon: FileText, label: "Impressum" },
              { to: "/about", icon: Shield, label: "Kushtet e Shërbimit" },
              { to: "/about", icon: Shield, label: "Politika e Privatësisë" },
              { to: "/business/register", icon: Store, label: "Regjistro Biznesin" },
              { to: "/courier/register", icon: Truck, label: "Bëhu Korrier" },
              { to: "/login", icon: Phone, label: "Kontakti" },
            ].map((l, i) => (
              <Link key={i} to={l.to} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <l.icon size={12} />
                {l.label}
              </Link>
            ))}
          </div>

          {/* Brand + legal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="TiliGo" className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <p className="font-heading font-bold text-sm gradient-text">TiliGo</p>
                <p className="text-[10px] text-muted-foreground">Dërgesa #1 në Kosovë 🇽🇰 · Selia: Vushtrri</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <a href="https://www.facebook.com/tiligoo" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={14} /> <span>facebook.com/tiligoo</span>
              </a>
              <div className="text-center sm:text-right">
                <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} TiliGo SH.P.K — Vushtrri, Kosovë</p>
                <p className="text-[10px] text-muted-foreground">ARBK: 812426957 · info@tili-go.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}