import { IconCart, IconPlus, IconMinus } from "./icons";

export default function ProductCard({ product, qty = 0, onAdd, onUpdateQty }) {
  const img = product.imagenes?.[0] || "https://placehold.co/400x500?text=Sin+imagen";

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <img src={img} alt={product.nombre} className="product-img visible-img" />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.nombre}</h3>

        <div className="product-footer">
          <span className="product-price">${product.precio.toFixed(2)}</span>

          {qty === 0 ? (
            <button
              className="btn-cart-add"
              onClick={() => onAdd(product)}
              title="Agregar al carrito"
            >
              <IconCart size={18} />
            </button>
          ) : (
            <div className="qty-ctrl qty-ctrl-card">
              <button className="qty-btn" onClick={() => onUpdateQty(product.id, -1)}>
                <IconMinus />
              </button>
              <span className="qty-num">{qty}</span>
              <button className="qty-btn" onClick={() => onUpdateQty(product.id, 1)}>
                <IconPlus />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
