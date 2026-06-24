import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Star, Clock, MapPin, ShoppingCart } from "lucide-react";
import ProductCard from "@/components/tiligo/ProductCard";
import SkeletonCard from "@/components/tiligo/SkeletonCard";
import Navbar from "@/components/tiligo/Navbar";
import { useCart } from "@/lib/cartStore.jsx";

export default function BusinessPage() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null);
  const { getItemCount, getTotal } = useCart();
  const cartCount = getItemCount();

  useEffect(() => {
    Promise.all([
      base44.entities.Business.filter({ id }),
      base44.entities.Product.filter({ business_id: id })
    ]).then(([bList, pList]) => {
      setBusiness(bList[0] || null);
      setProducts(pList.filter(p => p.is_available !== false));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background pt-16 px-4">
      <Navbar />
      <SkeletonCard count={6} />
    </div>
  );

  if (!business) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <span className="text-5xl mb-4 block">😕</span>
        <p className="text-muted-foreground text-lg">Biznesi nuk u gjet</p>
        <Link to="/" className="gradient-btn px-6 py-2 rounded-xl mt-4 inline-block text-sm">Kthehu</Link>
      </div>
    </div>
  );

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const filteredProducts = selectedCat ? products.filter(p => p.category === selectedCat) : products;

  return (
    <div className="min-h-screen bg-background pb-28 md:pt-16">
      <Navbar />
      
      {/* Header */}
      <div className="relative">
        {business.cover_image ? (
          <div className="h-48 md:h-64 overflow-hidden">
            <img src={business.cover_image} alt={business.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        ) : (
          <div className="h-48 md:h-64 bg-gradient-to-br from-primary/20 to-accent/10">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}
        
        <div className="absolute top-4 left-4 md:top-20">
          <Link to="/" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-foreground">
            <ArrowLeft size={20} />
          </Link>
        </div>

        <div className="relative -mt-12 px-4 max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-start gap-4">
              {business.logo ? (
                <img src={business.logo} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🏪</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="font-heading font-black text-xl md:text-2xl text-foreground">{business.name}</h1>
                {business.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{business.description}</p>}
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                  {business.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-mono font-semibold text-yellow-400">{business.rating?.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1"><Clock size={12} /><span>{business.delivery_time || 30} min</span></div>
                  <span>Dërgesa {business.delivery_fee ? `€${business.delivery_fee.toFixed(2)}` : "Falas"}</span>
                  {business.min_order > 0 && <span>Min €{business.min_order.toFixed(2)}</span>}
                  <span className={`font-semibold ${business.is_open ? "text-primary" : "text-destructive"}`}>
                    {business.is_open ? "● Hapur" : "● Mbyllur"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => setSelectedCat(null)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!selectedCat ? "gradient-btn" : "glass text-muted-foreground"}`}>
              Të gjitha
            </button>
            {categories.map(c => (
              <button key={c} onClick={() => setSelectedCat(c)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedCat === c ? "gradient-btn" : "glass text-muted-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {filteredProducts.map(p => <ProductCard key={p.id} product={p} business={business} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-4xl mb-3 block">📦</span>
            <p className="text-muted-foreground">Nuk ka produkte të disponueshme</p>
          </div>
        )}
      </div>

      {/* Floating cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40">
          <Link to="/cart"
            className="gradient-btn rounded-2xl px-5 py-4 flex items-center justify-between w-full shadow-lg shadow-primary/30">
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} />
              <span className="font-bold">{cartCount} artikuj</span>
            </div>
            <span className="font-mono font-bold">€{getTotal().toFixed(2)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}