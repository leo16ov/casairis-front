import { useState } from "react";
import { createCheckout, isLoggedIn } from "../api/api";

export default function CheckoutPage({ cart = [], user, setPage, onOrderComplete }) {
  const [delivery, setDelivery] = useState("envio"); // "envio" | "retiro"
  const [addr,     setAddr]     = useState({ street: "", number: "", city: "", province: "", postal: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const set = (k) => (e) => setAddr(a => ({ ...a, [k]: e.target.value }));

  const handleConfirm = async () => {
    setError("");

    // El checkout exige usuario logueado (la orden requiere id_usuario en la DB).
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
        talle:      i.selectedSize || "",
        color:      i.selectedColor || "",
      })),
      delivery,
      address: delivery === "envio" ? addr : null,
    };

    setLoading(true);
    try {
      const { checkout_url } = await createCheckout(payload);
      onOrderComplete?.();
      // Redirige al checkout de Mercado Pago.
      window.location.href = checkout_url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <main className="checkout-page">
      <h1 className="section-title">Finalizar compra</h1>

      {error && <p className="auth-error">{error}</p>}

      <div className="checkout-grid">
        {/* Resumen */}
        <section className="checkout-summary">
          <h2>Resumen</h2>
          {cart.length === 0 ? (
            <p>Carrito vacío.</p>
          ) : (
            cart.map(i => (
              <div className="summary-item" key={i.id}>
                <img src={i.image1 || (i.images && i.images[0])} alt={i.name} />
                <div>
                  <p className="summary-name">{i.name}</p>
                  <p className="summary-qty">x{i.qty}</p>
                </div>
                <span>${i.price * i.qty}</span>
              </div>
            ))
          )}
          <div className="summary-total">
            <strong>Total</strong>
            <strong>${total}</strong>
          </div>
        </section>

        {/* Datos de entrega */}
        <section className="checkout-form">
          <h2>Entrega</h2>
          <div className="option-list">
            <button
              className={`option-btn ${delivery === "envio" ? "active" : ""}`}
              onClick={() => setDelivery("envio")}
            >
              Envío a domicilio
            </button>
            <button
              className={`option-btn ${delivery === "retiro" ? "active" : ""}`}
              onClick={() => setDelivery("retiro")}
            >
              Retiro en local
            </button>
          </div>

          {delivery === "envio" && (
            <div className="address-form">
              <label>Calle</label>
              <input value={addr.street} onChange={set("street")} />
              <label>Número</label>
              <input value={addr.number} onChange={set("number")} />
              <label>Ciudad</label>
              <input value={addr.city} onChange={set("city")} />
              <label>Provincia</label>
              <input value={addr.province} onChange={set("province")} />
              <label>Código postal</label>
              <input value={addr.postal} onChange={set("postal")} />
            </div>
          )}

          <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
            {loading ? "Redirigiendo…" : "Ir al pago"}
          </button>
        </section>
      </div>
    </main>
  );
}
