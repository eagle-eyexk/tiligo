export const ROLE_DASHBOARD = {
  user: "/",
  business: "/business-dashboard",
  courier: "/courier-dashboard",
};

export function setIntent(role) {
  try { sessionStorage.setItem("tiligo_intent", role); } catch (e) {}
}
export function getIntent() {
  try { return sessionStorage.getItem("tiligo_intent"); } catch (e) { return null; }
}
export function clearIntent() {
  try { sessionStorage.removeItem("tiligo_intent"); } catch (e) {}
}