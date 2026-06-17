import { useState } from "react";
import { createCheckout, isLoggedIn } from "../api/api";

export default function CheckoutPage({ cart = [], user, setPage, onOrderComplete }) {
  const [delivery, setDelivery] = useState("envio");
  const [addr,     setAddr]     = useState({ street: "", number: "", city: "", province: "", postal: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const set = (k) => (e) => setAddr(a => ({ ...a, [k]: e.target.value }));

  const handleConfirm = async () => {
    setError("");
    if (!isLoggedIn()) {
      setError("Iniciá sesión para finalizar la compra.");
      setPage("login");
      return;
    }
    if (cart.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }
    if (delivery === "envio" && (!addr.street || !addr.city)) {
      setError("Completá la dirección de envío.");
      return;
    }

    const payload = {
      items: cart.map(i => ({
        product_id: i.id,
        quantity:   i.qty,
        talle:      i.selectedSize  || "",
        color:      i.selectedColor || "",
      })),
      delivery,
      address: delivery === "envio" ? addr : null,
    };

    setLoading(true);
    try {
      const { checkout_url } = await createCheckout(payload);
      onOrderComplete?.();
      window.location.href = checkout_url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <main className="checkout-page">
      <button className="btn-back" onClick={() => setPage("home")}>← Seguir comprando</button>

      {error && <p className="auth-error">{error}</p>}

      <div className="checkout-inner">

        {/* ── Columna izquierda ── */}
        <div>
          <p className="delivery-section-title">Método de entrega</p>
          <div className="delivery-toggle">
            <button
              className={`toggle-opt ${delivery === "envio" ? "toggle-active" : ""}`}
              onClick={() => setDelivery("envio")}
            >
              <span className="toggle-icon">🚚</span>
              Envío a domicilio
            </button>
            <button
              className={`toggle-opt ${delivery === "retiro" ? "toggle-active" : ""}`}
              onClick={() => setDelivery("retiro")}
            >
              <span className="toggle-icon">🏪</span>
              Retiro en local
            </button>
          </div>

          {delivery === "envio" && (
            <div className="delivery-body">
              <p className="delivery-section-title">Dirección de envío</p>
              <div className="form-row">
                <div className="form-group form-group--narrow">
                  <label className="form-label">Calle</label>
                  <input className="form-input" value={addr.street} onChange={set("street")} />
                </div>
                <div className="form-group form-group--narrow">
                  <label className="form-label">Número</label>
                  <input className="form-input" value={addr.number} onChange={set("number")} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group form-group--narrow">
                  <label className="form-label">Ciudad</label>
                  <input className="form-input" value={addr.city} onChange={set("city")} />
                </div>
                <div className="form-group form-group--narrow">
                  <label className="form-label">Provincia</label>
                  <input className="form-input" value={addr.province} onChange={set("province")} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Código postal</label>
                <input className="form-input" value={addr.postal} onChange={set("postal")} />
              </div>
            </div>
          )}

          {delivery === "retiro" && (
            <div className="delivery-body">
              <div className="pickup-wrap">
                <div className="pickup-info">
                  <span className="pickup-icon">📍</span>
                  <div className="pickup-details">
                    <p className="pickup-title">Sucursal Central</p>
                    <p className="pickup-address">Av. Corrientes 1234, Buenos Aires</p>
                    <p className="pickup-hours">Lun–Vie 10:00–20:00 · Sáb 10:00–14:00</p>
                    <p className="pickup-note">
                      Traé tu número de orden. El pedido estará listo en 24–48 hs hábiles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button className="btn-confirm" onClick={handleConfirm} disabled={loading}>
            {loading ? "Redirigiendo a Mercado Pago…" : "Confirmar y pagar"}
          </button>
        </div>

        {/* ── Columna derecha: resumen ── */}
        <aside className="order-summary">
          <h2 className="summary-title">Tu pedido</h2>

          {cart.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: 13 }}>Carrito vacío.</p>
          ) : (
            <div className="summary-list">
              {cart.map(i => (
                <div className="summary-item" key={i.id}>
                  <img
                    className="summary-thumb"
                    src={i.images?.[0] || i.image1}
                    alt={i.name}
                  />
                  <div className="summary-item-info">
                    <p className="summary-item-name">{i.name}</p>
                    <p className="summary-item-qty">× {i.qty}</p>
                  </div>
                  <span className="summary-item-price">${i.price * i.qty}</span>
                </div>
              ))}
            </div>
          )}

          <div className="summary-total">
            <span>Total</span>
            <span className="total-price">${total}</span>
          </div>
        </aside>

      </div>
    </main>
  );
}
