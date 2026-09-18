export default function Hero({ setPage }) {
  return (
    <section className="hero">
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="hero-sub">Nueva Colección 2025</p>
        <h1 className="hero-title">Moda que<br /><em>Inspira</em></h1>
        <p className="hero-desc">Descubrí las últimas tendencias en moda femenina y masculina. Calidad y estilo en cada prenda.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => setPage("home")}>Ver colección</button>
          <button className="btn-outline-light">Novedades</button>
        </div>
      </div>
    </section>
  );
}