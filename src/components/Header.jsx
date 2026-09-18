import { useState, useEffect, useRef } from "react";
import { IconCart, IconSearch, IconWhatsApp } from "./icons";
import CartDropdown from "./CartDropdown";
import { CONTACT_PHONE_DISPLAY } from "../config";

export default function Header({
  setPage, cart, onUpdateQty, onRemoveFromCart,
  search, setSearch, setActiveCategory,
}) {
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef(null);

  const cartTotal = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const handler = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) setCartOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goHome = () => { setActiveCategory("todos"); setSearch(""); setPage("home"); };

  return (
    <header className="site-header">
      <div className="header-top">
        <button className="logo-btn" onClick={goHome}>
          <span className="logo-text">Casa Iris</span>
          <span className="logo-tagline">Perfumería</span>
        </button>

        <div className="search-wrap">
          <input
            className="search-input"
            type="text"
            inputMode="search"
            aria-label="Buscar perfumes"
            placeholder="Buscar perfumes… ej: Eros, Sauvage, 212 VIP"
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveCategory("todos"); setPage("home"); }}
          />
          {search && (
            <button
              className="search-clear-btn"
              aria-label="Limpiar búsqueda"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
          <span className="search-icon"><IconSearch /></span>
        </div>

        <nav className="nav-actions">
          <div className="cart-wrap" ref={cartRef}>
            <button className="nav-btn cart-btn" onClick={() => setCartOpen(o => !o)}>
              <span className="cart-icon-wrap">
                <IconCart size={20} />
                {cartTotal > 0 && <span className="cart-badge">{cartTotal}</span>}
              </span>
            </button>
            {cartOpen && (
              <CartDropdown
                cart={cart}
                onUpdateQty={onUpdateQty}
                onRemove={onRemoveFromCart}
                onClose={() => setCartOpen(false)}
                onCheckout={() => { setCartOpen(false); setPage("checkout"); }}
              />
            )}
          </div>
        </nav>
      </div>

      <div className="header-contact-bar">
        <IconWhatsApp size={16} />
        <span>{CONTACT_PHONE_DISPLAY}</span>
      </div>
    </header>
  );
}