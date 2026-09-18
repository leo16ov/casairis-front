import { useState, useEffect, useCallback } from "react";
import { IconChevronLeft, IconChevronRight, IconClose } from "../components/icons";

export default function ProductPage({ products = [], productId, onAddToCart, setPage }) {
  const product = products.find(p => p.id === productId);

  const [selectedSize,  setSelectedSize]  = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [qty,           setQty]           = useState(1);
  const [activeImg,     setActiveImg]     = useState(0);
  const [added,         setAdded]         = useState(false);
  const [lightbox,      setLightbox]      = useState(false);

  const images     = product?.images?.length ? product.images : [];
  const outOfStock = product?.stock <= 0;

  const prevImg = useCallback(
    () => setActiveImg(i => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const nextImg = useCallback(
    () => setActiveImg(i => (i + 1) % images.length),
    [images.length]
  );

  // Teclado: Escape cierra, flechas navegan
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape")      setLightbox(false);
      if (e.key === "ArrowLeft")   prevImg();
      if (e.key === "ArrowRight")  nextImg();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prevImg, nextImg]);

  if (!product) {
    return (
      <main className="product-page">
        <div className="no-results">
          <p>Producto no encontrado.</p>
          <button className="btn-back" onClick={() => setPage("home")}>← Volver al inicio</button>
        </div>
      </main>
    );
  }

  const buildItem = () => ({
    ...product,
    qty,
    selectedSize,
    selectedColor,
    image1: images[0],
  });

  const handleAddToCart = () => {
    onAddToCart(buildItem());
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    onAddToCart(buildItem());
    setPage("checkout");
  };

  return (
    <main className="product-page">

      {/* Breadcrumb */}
      <nav className="product-breadcrumb">
        <button className="breadcrumb-link" onClick={() => setPage("home")}>Inicio</button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      <div className="product-detail-grid">

        {/* ── Carousel ── */}
        <div className="carousel-wrap">
          {images.length > 1 && (
            <div className="carousel-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`carousel-thumb-btn ${i === activeImg ? "thumb-active" : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}

          <div className="carousel-main" onClick={() => setLightbox(true)}>
            <img className="carousel-main-img" src={images[activeImg]} alt={product.name} />
            {images.length > 1 && (
              <>
                <button
                  className="carousel-arrow carousel-arrow-left"
                  onClick={e => { e.stopPropagation(); prevImg(); }}
                >
                  <IconChevronLeft size={18} />
                </button>
                <button
                  className="carousel-arrow carousel-arrow-right"
                  onClick={e => { e.stopPropagation(); nextImg(); }}
                >
                  <IconChevronRight size={18} />
                </button>
                <span className="carousel-counter">{activeImg + 1} / {images.length}</span>
              </>
            )}
          </div>
        </div>

        {/* ── Panel derecho ── */}
        <div className="product-detail-right">
          {product.badge && <span className="pd-badge">{product.badge}</span>}

          <p className="detail-category">{product.category.toUpperCase()}</p>
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-price-row">
            <span className="pd-price">${product.price}</span>
          </div>

          <div className="pd-stock">
            <span
              className="pd-stock-dot"
              style={{ background: outOfStock ? "#e53" : "#4caf50" }}
            />
            <span style={{ fontSize: 13, color: outOfStock ? "#e53" : "#555" }}>
              {outOfStock ? "Sin stock" : `${product.stock} disponibles`}
            </span>
          </div>

          <div className="pd-divider" />

          {/* Talles */}
          {product.sizes?.length > 0 && (
            <div className="pd-section">
              <p className="pd-label">
                Talle
                {selectedSize && <span className="pd-selection-hint"> — {selectedSize}</span>}
              </p>
              <div className="pd-sizes">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    className={`pd-size-btn ${selectedSize === s ? "pd-size-active" : ""}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colores */}
          {product.colors?.length > 0 && (
            <div className="pd-section">
              <p className="pd-label">
                Color
                {selectedColor && <span className="pd-selection-hint"> — {selectedColor}</span>}
              </p>
              <div className="pd-colors">
                {product.colors.map(c => (
                  <button
                    key={c}
                    title={c}
                    className={`pd-color-btn ${selectedColor === c ? "pd-color-active" : ""}`}
                    style={{ background: c }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cantidad */}
          <div className="pd-section">
            <p className="pd-label">Cantidad</p>
            <div className="pd-qty-row">
              <div className="pd-qty-ctrl">
                <button
                  className="pd-qty-btn"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  −
                </button>
                <span className="pd-qty-num">{qty}</span>
                <button
                  className="pd-qty-btn"
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock || outOfStock}
                >
                  +
                </button>
              </div>
              {!outOfStock && <span className="pd-qty-hint">{product.stock} en stock</span>}
            </div>
          </div>

          <div className="pd-divider" />

          {/* CTA */}
          <div className="pd-actions">
            <button className="btn-buy-now" onClick={handleBuyNow} disabled={outOfStock}>
              Comprar ahora
            </button>
            <button
              className={`btn-add-cart-pd ${added ? "btn-added" : ""}`}
              onClick={handleAddToCart}
              disabled={outOfStock}
            >
              {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
            </button>
          </div>

          {outOfStock && (
            <p className="pd-no-stock-msg">Este producto no tiene stock disponible.</p>
          )}

          {/* Info de envío */}
          <div className="pd-shipping-info">
            <div className="pd-shipping-item">
              <span>🚚</span>
              <span>Envío a todo el país</span>
            </div>
            <div className="pd-shipping-item">
              <span>↩️</span>
              <span>Devoluciones dentro de los 30 días</span>
            </div>
            <div className="pd-shipping-item">
              <span>🔒</span>
              <span>Pago seguro con Mercado Pago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      {product.description && (
        <div className="pd-description-section">
          <h2 className="pd-desc-title">Descripción</h2>
          <p className="pd-desc-text">{product.description}</p>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <img
            className="lightbox-img"
            src={images[activeImg]}
            alt={product.name}
            onClick={e => e.stopPropagation()}
          />

          <button className="lightbox-close" onClick={() => setLightbox(false)}>
            <IconClose size={18} />
          </button>

          {images.length > 1 && (
            <>
              <button
                className="lightbox-arrow lightbox-left"
                onClick={e => { e.stopPropagation(); prevImg(); }}
              >
                <IconChevronLeft size={28} />
              </button>
              <button
                className="lightbox-arrow lightbox-right"
                onClick={e => { e.stopPropagation(); nextImg(); }}
              >
                <IconChevronRight size={28} />
              </button>
              <span className="lightbox-counter">{activeImg + 1} / {images.length}</span>
            </>
          )}
        </div>
      )}

    </main>
  );
}
