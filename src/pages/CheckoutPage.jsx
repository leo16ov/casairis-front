import { useState } from "react";
import { IconCart } from "../components/icons";
import { createOrder } from "../api/api";     // ← nuevo import
import { WHATSAPP_NUMBER } from "../config";
import { formatPrice } from "../utils/format";

export default function CheckoutPage({ cart = [], setPage, onOrderComplete }) {
  const [form, setForm] = useState({ name: "", email: "", areaCode: "", phone: "", message: "" });
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);   // ← nuevo estado

  const total = cart.reduce((s, i) => s + i.precio * i.qty, 0);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {               // ← ahora es async
    setError("");
    if (cart.length === 0) { setError("Tu carrito está vacío."); return; }
    if (!form.name || !form.email || !form.phone) {
      setError("Completá nombre, email y teléfono.");
      return;
    }

    setSending(true);

    // Registramos el pedido en Firestore con fecha y monto
    try {
      await createOrder({
        items: cart,
        total,
        cliente: {
          name: form.name,
          email: form.email,
          phone: `${form.areaCode} ${form.phone}`,
          message: form.message,
        },
      });
    } catch (e) {
      console.error("No se pudo guardar el pedido en Firestore:", e);
      // Seguimos igual: no queremos bloquear el envío por WhatsApp
      // por un error de guardado.
    }

    const lines = cart.map(i => `• ${i.nombre} x${i.qty} — ${formatPrice(i.precio * i.qty)}`).join("\n");
    const message =
`¡Hola! Quiero hacer un pedido:

${lines}

Total: ${formatPrice(total)}

Nombre: ${form.name}
Email: ${form.email}
Teléfono: ${form.areaCode} ${form.phone}${form.message ? `\nMensaje: ${form.message}` : ""}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    setSending(false);
    onOrderComplete?.();
    setPage("home");
  };

  return (
    <main className="checkout-page checkout-simple">
      <div className="checkout-side-panel" aria-hidden="true" />

      <div className="checkout-form-card">
        <button className="btn-back" onClick={() => setPage("home")}>← Atrás</button>

        <h1 className="checkout-form-title">Completá los datos y enviá tu pedido</h1>

        {error && <p className="auth-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Nombre y apellido</label>
          <input className="form-input" value={form.name} onChange={set("name")} />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={set("email")} />
        </div>

        <p className="delivery-section-title">Teléfono</p>
        <div className="form-row">
          <div className="form-group form-group--narrow">
            <label className="form-label">Código de área</label>
            <input className="form-input" value={form.areaCode} onChange={set("areaCode")} />
          </div>
          <div className="form-group form-group--narrow">
            <label className="form-label">Número</label>
            <input className="form-input" value={form.phone} onChange={set("phone")} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">¿Querés dejarle un mensaje al vendedor?</label>
          <textarea className="form-input form-textarea" rows={3} value={form.message} onChange={set("message")} />
        </div>

        <button className="btn-confirm" onClick={handleSubmit} disabled={sending}>
          {sending ? "Enviando…" : "Enviar pedido por WhatsApp →"}
        </button>
        <p className="checkout-trust-note">🔒 Coordinamos el pago y el envío directamente por WhatsApp.</p>

        <div className="checkout-order-detail">
          <div className="cart-drop-header">
            <span className="cart-drop-title"><IconCart size={18} /> Detalle del pedido</span>
            <span className="cart-drop-total">{formatPrice(total)}</span>
          </div>

          {cart.length === 0 ? (
            <p className="cart-empty">Carrito vacío.</p>
          ) : (
            <div className="cart-items cart-items-static">
              {cart.map(i => (
                <div className="cart-drop-item" key={i.id}>
                  <img className="cart-thumb" src={i.imagenes?.[0]} alt={i.nombre} />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{i.nombre}</p>
                    <p className="cart-item-price">× {i.qty}</p>
                  </div>
                  <span className="cart-item-price">{formatPrice(i.precio * i.qty)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="checkout-side-panel" aria-hidden="true" />
    </main>
  );
}