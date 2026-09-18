import { IconClose, IconPlus, IconMinus, IconCart } from "./icons";
import { formatPrice } from "../utils/format";

export default function CartDropdown({ cart, onUpdateQty, onRemove, onClose, onCheckout }) {
  const total = cart.reduce((s, i) => s + i.precio * i.qty, 0);

  return (
    <div className="cart-dropdown">
      <div className="cart-drop-header">
        <span className="cart-drop-title"><IconCart size={18} /> Detalle del pedido</span>
        <span className="cart-drop-total">{formatPrice(total)}</span>
      </div>

      {cart.length === 0 ? (
        <p className="cart-empty">Tu carrito está vacío</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-drop-item">
                <button className="btn-remove-item" onClick={() => onRemove(item.id)} title="Quitar">
                  <IconClose size={11} />
                </button>
                <img src={item.imagenes?.[0]} alt={item.nombre} className="cart-thumb" />
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.nombre}</p>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)}><IconMinus /></button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)}><IconPlus /></button>
                </div>
                <span className="cart-item-price">{formatPrice(item.precio * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="cart-drop-footer">
            <button className="btn-checkout" onClick={onCheckout}>Enviar pedido</button>
          </div>
        </>
      )}
    </div>
  );
}