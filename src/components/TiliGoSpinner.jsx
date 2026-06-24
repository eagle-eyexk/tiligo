import React from "react";
import { LOGO_URL } from "@/lib/constants";

export default function TiliGoSpinner({ size = 64, text = "Duke ngarkuar..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        {/* Logo in center */}
        <img
          src={LOGO_URL}
          alt="TiliGo"
          className="absolute inset-1 rounded-2xl object-cover"
          style={{ width: size - 8, height: size - 8 }}
        />
      </div>
      {text && <p className="text-sm text-muted-foreground font-medium animate-pulse">{text}</p>}
    </div>
  );
}