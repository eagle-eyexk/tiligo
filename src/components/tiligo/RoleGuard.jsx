import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import TiliGoSpinner from "@/components/TiliGoSpinner";

const CONFIG = {
  business: {
    allowedRoles: ["business", "admin"],
    entityCheck: (uid) => base44.entities.Business.filter({ owner_id: uid }),
    intent: "business",
  },
  courier: {
    allowedRoles: ["courier", "admin"],
    entityCheck: (uid) => base44.entities.CourierProfile.filter({ user_id: uid }),
    intent: "courier",
  },
};

export default function RoleGuard({ kind, loginPath, children }) {
  const cfg = CONFIG[kind];
  const navigate = useNavigate();
  const [state, setState] = useState("loading");

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (cfg.allowedRoles.includes(user.role)) return setState("ok");
        const recs = await cfg.entityCheck(user.id);
        if (recs.length > 0) return setState("ok");
        const intent = sessionStorage.getItem("tiligo_intent");
        if (intent === cfg.intent) return setState("ok");
        navigate(loginPath, { replace: true });
      } catch {
        navigate(loginPath, { replace: true });
      }
    })();
  }, [kind]);

  if (state !== "ok") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <TiliGoSpinner />
      </div>
    );
  }
  return children;
}