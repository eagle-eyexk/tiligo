export const LOGO_URL = "https://media.base44.com/images/public/user_69e68678ce0d9fdef245009b/8f0358955_IMG_0105.jpeg";

export const CATEGORIES = [
  { id: "Pica", label: "Pica", emoji: "🍕" },
  { id: "Burgera", label: "Burgera", emoji: "🍔" },
  { id: "Sushi", label: "Sushi", emoji: "🍣" },
  { id: "Supermarket", label: "Supermarket", emoji: "🛒" },
  { id: "Farmaci", label: "Farmaci", emoji: "💊" },
  { id: "Kafe", label: "Kafe", emoji: "☕" },
  { id: "Ushqim", label: "Ushqim", emoji: "🍽️" },
  { id: "Restorante", label: "Restorante", emoji: "🏪" },
];

export const ORDER_STATUSES = {
  placed: { label: "Porositur", icon: "📋", color: "text-blue-400" },
  accepted: { label: "Pranuar", icon: "✅", color: "text-green-400" },
  preparing: { label: "Duke u Përgatitur", icon: "👨‍🍳", color: "text-yellow-400" },
  ready: { label: "Gati për Marrje", icon: "📦", color: "text-orange-400" },
  assigned: { label: "Korrier i Caktuar", icon: "🛵", color: "text-cyan-400" },
  picked_up: { label: "Marrë nga Korrieri", icon: "📤", color: "text-purple-400" },
  in_transit: { label: "Në Rrugë", icon: "🚀", color: "text-primary" },
  delivered: { label: "Dërguar", icon: "🏠", color: "text-green-500" },
  cancelled: { label: "Anuluar", icon: "❌", color: "text-red-400" },
};

export const STATUS_FLOW = ["placed", "accepted", "preparing", "ready", "assigned", "picked_up", "in_transit", "delivered"];

export const COMPANY_INFO = {
  legalName: "TiliGo Delivery L.L.C.",
  tradeName: "TiliGo",
  type: "Shoqëri me përgjegjësi të kufizuara",
  uniqueId: "812426957",
  employees: 5,
  registrationDate: "15/06/2026",
  municipality: "Vushtrri",
  address: "VICIANA, 4",
  registry: "ARBK",
  website: "https://tili-go.com",
  email: "info@tili-go.com",
  phone: "+383 49 000 000",
  facebook: "https://www.facebook.com/tiligoo",
  appStoreId: "6740427580",
};