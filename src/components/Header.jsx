import { useState, useEffect, useRef } from "react";
import {
  IconCart, IconUser, IconSearch,
  IconHome, IconBag, IconMsg, IconMenu, IconClose, IconAdmin,
} from "./icons";
import { CATEGORIES } from "../data/data";
import CartDropdown from "./CartDropdown";

// ─── Account dropdown ─────────────────────────────────────────────────────────
const isAdmin = (u) => u && (u.rol || "").toLowerCase() === "admin";

function AccountDropdown({ user, onLogout, onLogin, onGoAdmin, onClose }) {
  return (
    <div className="account-dropdown">
      {user ? (
        <>
          <div className="account-info">
            <div className="account-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="account-details">
              <p className="account-name">{user.name}</p>
              <p className="account-email">{user.email}</p>
            </div>
          </div>
          <div className="account-divider" />
          {isAdmin(user) && (
            <button
              className="btn-account-action btn-admin-drop"
              onClick={() => { onGoAdmin(); onClose(); }}
            >
              Panel de administración
            </button>
          )}
          <button
            className="btn-account-action btn-logout"
            onClick={() => { onLogout(); onClose(); }}
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <p className="account-guest-msg">¡Hola! Ingresá a tu cuenta</p>
          <button
            className="btn-account-action btn-login-drop"
            onClick={() => { onLogin(); onClose(); }}
          >
            Iniciar sesión
          </button>
        </>
      )}
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
export default function Header({
  page, setPage, cart, onUpdateQty, user, onLogout,
  search, setSearch, activeCategory, setActiveCategory,
}) {
  const [cartOpen,    setCartOpen]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const cartRef    = useRef(null);
  const accountRef = useRef(null);

  const cartTotal = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const handler = (e) => {
      if (cartRef.current    && !cartRef.current.contains(e.target))    setCartOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goTo = (p) => { setPage(p); setMenuOpen(false); };

  return (
    <header className="site-header">

      {/* Top bar */}
      <div className="header-top">
        <button className="logo-btn" onClick={() => goTo("home")}>
          <span className="logo-text">ÉLUME</span>
          <span className="logo-sub">fashion</span>
        </button>

        <div className="search-wrap">
          <span className="search-icon"><IconSearch /></span>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage("home"); }}
          />
        </div>

        <nav className="nav-actions">
          <button
            className={`nav-btn desktop-only ${page === "home" ? "active" : ""}`}
            onClick={() => goTo("home")}
          >
            <IconHome size={20} />
            <span className="nav-label">Inicio</span>
          </button>

          <button
            className={`nav-btn desktop-only ${page === "orders" ? "active" : ""}`}
            onClick={() => goTo("orders")}
          >
            <IconBag size={20} />
            <span className="nav-label">Compras</span>
          </button>

          <button
            className={`nav-btn desktop-only ${page === "contact" ? "active" : ""}`}
            onClick={() => goTo("contact")}
          >
            <IconMsg size={20} />
            <span className="nav-label">Contacto</span>
          </button>

          {isAdmin(user) && (
            <button
              className={`nav-btn desktop-only nav-btn-admin ${page === "admin" ? "active" : ""}`}
              onClick={() => goTo("admin")}
            >
              <IconAdmin size={20} />
              <span className="nav-label">Admin</span>
            </button>
          )}

          {/* Cart */}
          <div className="cart-wrap" ref={cartRef}>
            <button
              className="nav-btn cart-btn"
              onClick={() => { setCartOpen(o => !o); setAccountOpen(false); }}
            >
              <span className="cart-icon-wrap">
                <IconCart size={20} />
                {cartTotal > 0 && <span className="cart-badge">{cartTotal}</span>}
              </span>
              <span className="nav-label">Carrito</span>
            </button>
            {cartOpen && (
              <CartDropdown
                cart={cart}
                onUpdateQty={onUpdateQty}
                onClose={() => setCartOpen(false)}
                onCheckout={() => { setCartOpen(false); goTo("checkout"); }}
              />
            )}
          </div>

          {/* Account */}
          <div className="account-wrap" ref={accountRef}>
            <button
              className={`nav-btn ${accountOpen ? "active" : ""}`}
              onClick={() => { setAccountOpen(o => !o); setCartOpen(false); }}
            >
              <IconUser size={20} />
              <span className="nav-label">{user ? user.name.split(" ")[0] : "Cuenta"}</span>
            </button>
            {accountOpen && (
              <AccountDropdown
                user={user}
                onLogout={onLogout}
                onLogin={() => goTo("login")}
                onGoAdmin={() => goTo("admin")}
                onClose={() => setAccountOpen(false)}
              />
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="nav-btn mobile-only"
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <IconClose size={22} /> : <IconMenu />}
          </button>
        </nav>
      </div>

      {/* Category bar */}
      <div className={`cat-bar ${menuOpen ? "open" : ""}`}>
        <div className="cat-bar-mobile-header">
          <span>Categorías</span>
          <button className="btn-icon-plain" onClick={() => setMenuOpen(false)}>
            <IconClose size={18} />
          </button>
        </div>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`cat-btn ${activeCategory === cat.key ? "cat-active" : ""}`}
            onClick={() => { setActiveCategory(cat.key); goTo("home"); }}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </header>
  );
}
