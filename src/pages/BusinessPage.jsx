import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingCart, Tag, Flame, Percent, ChevronRight, MapPin, Phone } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/lib/useCart";

// Mock offers — in production these would come from an Offer entity
const MOCK_OFFERS = [
  { id: 1, label: "🎉 20% zbritje për porosinë e parë", color: "from-blue-600 to-blue-800" },
  { id: 2, label: "🛵 Dërgesa falas mbi 10€", color: "from-green-600 to-green-800" },
  { id: 3, label: "🔥 Combo i ditës: 2+1 falas", color: "from-orange-500 to-red-600" },
];

export default function BusinessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeOffer, setActiveOffer] = useState(0);
  const { cart, addToCart, removeFromCart, clearCart } = useCart();

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => setActiveOffer(p => (p + 1) % MOCK_OFFERS.length), 3500);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [bizList, prods] = await Promise.all([
      base44.entities.Business.filter({ id }),
      base44.entities.Product.filter({ business_id: id, is_available: true }),
    ]);
    if (bizList.length > 0) setBusiness(bizList[0]);
    setProducts(prods);
    setLoading(false);
  };

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered = activeCategory === "all" ? products : products.filter(p => p.category === activeCategory);
  const getQty = (pid) => cart.find(i => i.id === pid)?.qty || 0;

  // Featured products (first 3)
  const featured = products.slice(0, 3);

  if (loading) return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar cart={cart} onCartClick={() => setCartOpen(true)} />
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 w-full" />
        <div className="max-w-3xl mx-auto px-4 pt-4 space-y-3">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-24 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (!business) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Biznesi nuk u gjet</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Navbar cart={cart} onCartClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} onAdd={addToCart} onRemove={removeFromCart} onClear={clearCart} />

      {/* Hero image */}
      <div className="relative h-60 md:h-72 overflow-hidden">
        <img
          src={business.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"}
          alt={business.name} className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:bg-white transition-colors">
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        {business.is_open && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Hapur Tani
          </div>
        )}
        {/* Bottom hero info */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-black text-white drop-shadow">{business.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-amber-400 font-bold text-sm">
              <Star size={14} fill="currentColor" /> {business.rating?.toFixed(1) || "4.5"}
            </span>
            <span className="text-white/70 text-sm flex items-center gap-1">
              <Clock size={13} /> {business.delivery_time || "20-35 min"}
            </span>
            <span className="text-white/70 text-sm">Dërgesa {business.delivery_fee?.toFixed(2) || "1.50"}€</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-md -mt-4 relative z-10 p-5 mb-4">
          <p className="text-gray-500 text-sm mb-3">{business.description}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Clock size={16} className="text-blue-600" />, label: business.delivery_time || "20-35 min", sub: "Kohë dorëzimi" },
              { icon: <Tag size={16} className="text-green-600" />, label: `${business.delivery_fee?.toFixed(2) || "1.50"}€`, sub: "Tarifë dërgese" },
              { icon: <Percent size={16} className="text-orange-500" />, label: `${business.min_order?.toFixed(0) || "3"}€`, sub: "Min. porosi" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1">{item.icon}</div>
                <p className="font-black text-gray-900 text-sm">{item.label}</p>
                <p className="text-gray-400 text-xs">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Offers Banner */}
        <div className="mb-4 overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeOffer}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className={`bg-gradient-to-r ${MOCK_OFFERS[activeOffer].color} text-white px-5 py-4 flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Flame size={18} className="text-white" />
                </div>
                <span className="font-bold text-sm">{MOCK_OFFERS[activeOffer].label}</span>
              </div>
              <div className="flex gap-1">
                {MOCK_OFFERS.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === activeOffer ? "bg-white" : "bg-white/40"}`} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Featured Products */}
        {featured.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={16} className="text-red-500" />
              <h2 className="font-black text-gray-900">Shumë të kërkuara</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {featured.map((prod, i) => (
                <motion.div key={prod.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex-shrink-0 bg-white rounded-2xl shadow-sm overflow-hidden w-40 cursor-pointer"
                  onClick={() => {
                    const qty = getQty(prod.id);
                    if (qty === 0) addToCart({ ...prod, delivery_fee: business.delivery_fee });
                  }}>
                  {prod.image_url ? (
                    <img src={prod.image_url} alt={prod.name} className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-4xl">🍽️</div>
                  )}
                  <div className="p-3">
                    <p className="font-bold text-gray-900 text-xs line-clamp-1">{prod.name}</p>
                    <p className="text-blue-700 font-black text-sm mt-0.5">{prod.price?.toFixed(2)}€</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`category-pill flex-shrink-0 ${activeCategory === cat ? "active" : "inactive"}`}>
                {cat === "all" ? "✨ Të gjitha" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Products list */}
        <div className="space-y-3 pb-32">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">🍽️</div>
              <p>Nuk ka produkte</p>
            </div>
          ) : filtered.map((prod, i) => {
            const qty = getQty(prod.id);
            return (
              <motion.div key={prod.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm card-hover">
                <div className="flex gap-0 items-stretch">
                  {prod.image_url && (
                    <img src={prod.image_url} alt={prod.name}
                      className="w-28 h-28 object-cover flex-shrink-0" />
                  )}
                  <div className={`flex-1 p-4 flex flex-col justify-between ${!prod.image_url ? "pl-4" : ""}`}>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug">{prod.name}</h3>
                      <p className="text-gray-400 text-xs line-clamp-2 mt-0.5">{prod.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-blue-700 font-black text-base">{prod.price?.toFixed(2)}€</p>
                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart({ ...prod, delivery_fee: business.delivery_fee })}
                          className="w-9 h-9 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-all shadow-md hover:scale-110 active:scale-95">
                          <Plus size={18} />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-blue-50 rounded-full px-1 py-1">
                          <button onClick={() => removeFromCart(prod.id)}
                            className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:text-red-500 transition-colors">
                            <Minus size={13} />
                          </button>
                          <span className="font-black text-blue-700 w-5 text-center text-sm">{qty}</span>
                          <button onClick={() => addToCart({ ...prod, delivery_fee: business.delivery_fee })}
                            className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition-colors">
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating cart */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 font-bold z-40 hover:bg-blue-800 transition-colors min-w-[280px]"
          >
            <div className="bg-white/20 rounded-xl px-2 py-1 text-sm font-black">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </div>
            <span className="flex-1 text-center">Shiko Shportën</span>
            <span className="text-blue-200 font-black text-sm">
              {(cart.reduce((s, i) => s + i.price * i.qty, 0) + (cart[0]?.delivery_fee || 1.5)).toFixed(2)}€
            </span>
            <ChevronRight size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}