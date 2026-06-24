import React from "react";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/lib/cartStore.jsx";

export default function ProductCard({ product, business }) {
  const { cart, addItem, removeItem } = useCart();
  const inCart = cart.items.find(i => i.id === product.id);
  const qty = inCart?.quantity || 0;

  return (
    <div className="glass rounded-2xl overflow-hidden glass-hover transition-all duration-300 flex flex-col">
      {product.image ? (
        <div className="h-36 overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <span className="text-3xl">🍽️</span>
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h4 className="font-heading font-bold text-sm text-foreground">{product.name}</h4>
          {product.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono font-bold text-primary text-base">€{product.price?.toFixed(2)}</span>
          {qty === 0 ? (
            <button onClick={() => addItem(product, business)}
              className="gradient-btn w-9 h-9 rounded-xl flex items-center justify-center">
              <Plus size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => removeItem(product.id)}
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground hover:bg-destructive/20 transition-colors">
                <Minus size={14} />
              </button>
              <span className="font-mono font-bold text-sm w-5 text-center">{qty}</span>
              <button onClick={() => addItem(product, business)}
                className="gradient-btn w-8 h-8 rounded-lg flex items-center justify-center">
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
      {!product.is_available && (
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-2xl">
          <span className="text-sm font-semibold text-muted-foreground">Jashtë stokut</span>
        </div>
      )}
    </div>
  );
}