import React from "react";
import { CATEGORIES } from "@/lib/constants";

export default function CategoryPills({ selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect(null)}
        className={`shrink-0 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${!selected ? "gradient-btn" : "glass text-muted-foreground hover:text-foreground"}`}
      >
        Të gjitha
      </button>
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center gap-1.5 ${selected === cat.id ? "gradient-btn" : "glass text-muted-foreground hover:text-foreground"}`}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}