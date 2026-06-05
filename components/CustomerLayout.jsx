import { Outlet } from "react-router-dom";
import MobileBottomNav from "./MobileBottomNav";

/**
 * Persistent layout for all customer-facing screens.
 * Renders MobileBottomNav on mobile for all child routes.
 */
export default function CustomerLayout() {
  return (
    <div>
      <Outlet />
      <MobileBottomNav />
    </div>
  );
}