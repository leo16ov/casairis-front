import ProductCard from "../components/ProductCard";

const PLACEHOLDER = "https://placehold.co/400x500?text=Sin+imagen";

export default function HomePage({
  products = [],
  categories = [],
  loading,
  loadError,
  cart,
  onAddToCart,
  onUpdateQty,
  search,
  setSearch,
  activeCategory,
  setActiveCategory,
}) {
  const qtyFor = (id) => cart.find(i => i.id === id)?.qty || 0;

  const showingList = !!search || activeCategory !== "todos";

  const visibleProducts = products.filter(p => p.activo !== false);

  const filtered = visibleProducts.filter(p => {
    const matchCat = activeCategory === "todos" || p.categoria === activeCategory;
    const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleBack = () => { setActiveCategory("todos"); setSearch(""); };

  if (loading) return <main className="home-status"><p>Cargando productos…</p></main>;
  if (loadError) return <main className="home-status"><p>No se pudieron cargar los productos: {loadError}</p></main>;

  // ── Landing: grilla de categorías ──────────────────────────────────────────
  if (!showingList) {
    return (
      <main>
        <div className="section-header">
          <h2 className="section-title">Conocé nuestros productos</h2>
        </div>
        <div className="category-tiles-grid">
          {categories.map(cat => (
            <button key={cat.key} className="category-tile" onClick={() => setActiveCategory(cat.key)}>
              <div className="category-tile-img-wrap">
                <img src={cat.imagen || PLACEHOLDER} alt={cat.label} />
              </div>
              <span className="category-tile-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  // ── Vista de categoría / resultados de búsqueda ─────────────────────────────
  const activeCatData = categories.find(c => c.key === activeCategory);

  return (
    <main>
      <div className="category-detail-header">
        <button className="btn-cat-back" onClick={handleBack} title="Volver a categorías">‹</button>

        {activeCategory !== "todos" && !search && (
          <span className="category-thumb">
            <img src={activeCatData?.imagen || PLACEHOLDER} alt="" />
          </span>
        )}

        <div className="section-header category-banner">
          <h2 className="section-title">
            {search ? `Resultados: "${search}"` : activeCatData?.label}
          </h2>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="no-results"><p>No se encontraron productos.</p></div>
      ) : (
        <div className="products-grid">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              qty={qtyFor(p.id)}
              onAdd={onAddToCart}
              onUpdateQty={onUpdateQty}
            />
          ))}
        </div>
      )}
    </main>
  );
}
