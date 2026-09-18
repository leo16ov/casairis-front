export default function Hero({ setPage }) {
  return (
    <section className="hero">
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-sub">Nueva Colección 2026</p>
        <h1 className="hero-title">Fragrancia que<br /><em>Se sienten</em></h1>
        <p className="hero-desc">Descubrí las últimas tendencias en frangancias femenina y masculina. Calidad y estilo en cada perfume.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => setPage("home")}>Ver colección</button>
          <button className="btn-outline-light">Novedades</button>
        </div>
      </div>
    </section>
  );
}