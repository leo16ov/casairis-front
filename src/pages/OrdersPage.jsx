import { useEffect, useState } from "react";
import { getOrders, isLoggedIn } from "../api/api";

// Etiquetas legibles para los estados del ENUM estado_orden.
const ESTADOS = {
  pendiente:      "Pendiente",
  pagada:         "Pagada",
  en_preparacion: "En preparación",
  enviada:        "Enviada",
  entregada:      "Entregada",
  cancelada:      "Cancelada",
  reembolsada:    "Reembolsada",
};

export default function OrdersPage({ setPage }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false);
      setError("Iniciá sesión para ver tus compras.");
      return;
    }
    getOrders()
      .then(data => setOrders(data || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="orders-page">
      <h1 className="section-title">Mis compras</h1>

      {loading ? (
        <p>Cargando…</p>
      ) : error ? (
        <div className="no-results">
          <p>{error}</p>
          {!isLoggedIn() && (
            <button className="btn btn-primary" onClick={() => setPage("login")}>
              Iniciar sesión
            </button>
          )}
        </div>
      ) : orders.length === 0 ? (
        <div className="no-results"><p>Todavía no tenés compras.</p></div>
      ) : (
        <div className="orders-list">
          {orders.map(o => (
            <div className="order-card" key={o.id}>
              <div className="order-head">
                <span className="order-id">Orden #{o.id}</span>
                <span className={`order-status status-${o.estado}`}>
                  {ESTADOS[o.estado] || o.estado}
                </span>
              </div>
              <div className="order-items">
                {(o.items || []).map(it => (
                  <div className="order-item" key={it.id}>
                    <span>{it.nombre_producto} ×{it.cantidad}</span>
                    <span>${it.precio_unitario * it.cantidad}</span>
                  </div>
                ))}
              </div>
              <div className="order-total">
                <strong>Total</strong>
                <strong>${o.total}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
