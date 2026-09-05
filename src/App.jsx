import { useState, useEffect } from "react";
import Header       from "./components/Header";
import Footer       from "./components/Footer";
import HomePage     from "./pages/HomePage";
import ContactPage  from "./pages/ContactPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage    from "./pages/AdminPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import { IconCart, IconWhatsApp } from "./components/icons";
import { getProducts, getCategories, adminLogout, onAdminAuthChange } from "./api/api";

// TODO: reemplazá por tu número real de WhatsApp (formato internacional, sin +, sin espacios)
const WHATSAPP_NUMBER = "5491133704879";

export default function App() {
  const [page,           setPage]           = useState("home");
  const [cart,           setCart]           = useState([]);
  const [search,         setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");

  // null = todavía no sabemos si hay sesión; true/false una vez que Firebase responde
  const [adminAuthed, setAdminAuthed] = useState(null);

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [loadError,  setLoadError]  = useState("");

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => { setProducts(p || []); setCategories(c || []); })
      .catch(e => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsub = onAdminAuthChange(setAdminAuthed);
    return unsub;
  }, []);

  // ── Cart helpers ────────────────────────────────────────────────────────────
  const addToCart = (p) => {
    setCart(c => {
      const existing = c.find(i => i.id === p.id);
      if (existing) return c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...p, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(c =>
      c.reduce((acc, i) => {
        if (i.id !== id) return [...acc, i];
        const newQty = i.qty + delta;
        return newQty > 0 ? [...acc, { ...i, qty: newQty }] : acc;
      }, [])
    );
  };

  const removeFromCart = (id) => setCart(c => c.filter(i => i.id !== id));
  const handleOrderComplete = () => setCart([]);
  const handleAdminLogout = () => { adminLogout(); setPage("home"); };

  // ── Page routing ────────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (page) {
      case "home":     return homeView();
      case "contact":  return <ContactPage />;
      case "checkout": return <CheckoutPage cart={cart} setPage={setPage} onOrderComplete={handleOrderComplete} />;
      default:         return homeView();
    }
  };

  const homeView = () => (
    <HomePage
      products={products}
      categories={categories}
      loading={loading}
      loadError={loadError}
      cart={cart}
      onAddToCart={addToCart}
      onUpdateQty={updateQty}
      search={search}
      setSearch={setSearch}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
    />
  );

  // El panel admin (y su login) se muestran sin el header/footer de la tienda.
  if (page === "admin") {
    if (adminAuthed === null) {
      return <main className="home-status"><p>Cargando…</p></main>;
    }
    if (!adminAuthed) {
      return <AdminLoginPage setPage={setPage} />;
    }
    return <AdminPage setPage={setPage} onLogout={handleAdminLogout} />;
  }

  const cartTotal = cart.reduce((s, i) => s + i.precio * i.qty, 0);
  const showFloatingCart = cart.length > 0 && page !== "checkout";

  const openWhatsApp = () => {
    const msg = "¡Hola! Tengo una consulta.";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="app-root">
      <Header
        setPage={setPage}
        cart={cart}
        onUpdateQty={updateQty}
        onRemoveFromCart={removeFromCart}
        search={search}
        setSearch={setSearch}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      {renderPage()}
      <Footer setPage={setPage} adminAuthed={!!adminAuthed} onAdminLogout={handleAdminLogout} />

      {showFloatingCart && (
        <button className="floating-cart-bar" onClick={() => setPage("checkout")}>
          <span className="floating-cart-total">${cartTotal.toFixed(2)}</span>
          <span className="floating-cart-cta"><IconCart size={16} /> Terminar pedido</span>
        </button>
      )}

      <button className="floating-whatsapp-btn" onClick={openWhatsApp} title="Escribinos por WhatsApp">
        <IconWhatsApp size={26} />
      </button>
    </div>
  );
}
