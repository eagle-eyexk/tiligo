import React from "react";
import { Link } from "react-router-dom";
import { Star, Clock, MapPin } from "lucide-react";

export default function BusinessCard({ business }) {
  return (
    <Link to={`/business/${business.id}`}
      className="group block rounded-2xl overflow-hidden glass glass-hover transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        {business.cover_image ? (
          <img src={business.cover_image} alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <span className="text-4xl">🏪</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-background/80 text-foreground backdrop-blur-sm">
            {business.category}
          </span>
        </div>
        {business.is_open && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-primary/90 text-primary-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-pulse" />
              Hapur
            </span>
          </div>
        )}
        {!business.is_open && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-sm font-semibold text-muted-foreground">Mbyllur</span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-heading font-bold text-base text-foreground truncate">{business.name}</h3>
          {business.rating > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-mono font-semibold text-yellow-400">{business.rating?.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{business.delivery_time || 30} min</span>
          </div>
          <span>•</span>
          <span>Dërgesa {business.delivery_fee ? `€${business.delivery_fee.toFixed(2)}` : "Falas"}</span>
          {business.min_order > 0 && (
            <>
              <span>•</span>
              <span>Min €{business.min_order?.toFixed(2)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}