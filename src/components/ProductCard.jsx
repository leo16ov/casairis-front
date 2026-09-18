import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  IconCart, IconPlus, IconMinus,
  IconChevronLeft, IconChevronRight, IconClose,
} from "./icons";
import { formatPrice } from "../utils/format";

const HOVER_INTERVAL_MS = 1800;
const PLACEHOLDER = "https://placehold.co/400x500?text=Sin+imagen";

export default function ProductCard({ product, qty = 0, onAdd, onUpdateQty }) {
  const images = product.imagenes?.length ? product.imagenes : [PLACEHOLDER];
  const [imgIndex, setImgIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const intervalRef = useRef(null);

  const startCycle = () => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setImgIndex(i => (i + 1) % images.length);
    }, HOVER_INTERVAL_MS);
  };

  const stopCycle = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const handleCardLeave = () => {
    stopCycle();
    if (!lightbox) setImgIndex(0);
  };

  const openLightbox = (e) => {
    e.stopPropagation();
    stopCycle();
    setLightbox(true);
  };

  const closeLightbox = () => setLightbox(false);

  const prevImg = useCallback(
    () => setImgIndex(i => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const nextImg = useCallback(
    () => setImgIndex(i => (i + 1) % images.length),
    [images.length]
  );

  // Teclado: Escape cierra, flechas navegan
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape")     closeLightbox();
      if (e.key === "ArrowLeft")  prevImg();
      if (e.key === "ArrowRight") nextImg();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prevImg, nextImg]);

  return (
    <div className="product-card" onMouseEnter={startCycle} onMouseLeave={handleCardLeave}>
      <div className="product-img-wrap" onClick={openLightbox} title="Ver imágenes">
        <img
          key={imgIndex}
          src={images[imgIndex]}
          alt={product.nombre}
          className="product-img"
        />
        {images.length > 1 && (
          <div className="product-img-dots">
            {images.map((_, i) => (
              <span key={i} className={`product-img-dot ${i === imgIndex ? "active" : ""}`} />
            ))}
          </div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.nombre}</h3>

        <div className="product-footer">
          <span className="product-price">{formatPrice(product.precio)}</span>

          {qty === 0 ? (
            <button className="btn-cart-add" onClick={() => onAdd(product)} title="Agregar al carrito" aria-label={`Agregar ${product.nombre} al carrito`}>
              <IconCart size={18} />
            </button>
          ) : (
            <div className="qty-ctrl qty-ctrl-card">
              <button className="qty-btn" onClick={() => onUpdateQty(product.id, -1)} aria-label="Quitar unidad"><IconMinus /></button>
              <span className="qty-num">{qty}</span>
              <button className="qty-btn" onClick={() => onUpdateQty(product.id, 1)} aria-label="Agregar unidad"><IconPlus /></button>
            </div>
          )}
        </div>
      </div>

      {lightbox && createPortal(
        <div className="lightbox" onClick={closeLightbox}>
          <img
            key={imgIndex}
            className="lightbox-img"
            src={images[imgIndex]}
            alt={product.nombre}
            onClick={e => e.stopPropagation()}
          />

          <button className="lightbox-close" onClick={closeLightbox}>
            <IconClose size={18} />
          </button>

          {images.length > 1 && (
            <>
              <button className="lightbox-arrow lightbox-left" onClick={e => { e.stopPropagation(); prevImg(); }}>
                <IconChevronLeft size={28} />
              </button>
              <button className="lightbox-arrow lightbox-right" onClick={e => { e.stopPropagation(); nextImg(); }}>
                <IconChevronRight size={28} />
              </button>
              <span className="lightbox-counter">{imgIndex + 1} / {images.length}</span>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}