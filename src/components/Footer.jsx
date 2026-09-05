export default function Footer({ setPage, adminAuthed, onAdminLogout }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo-text" style={{ fontSize: "1.5rem", color: "#fff" }}>ÉLUME</span>
          <p>Moda que inspira, calidad que dura.</p>
        </div>
        <div className="footer-links">
          <h4>Tienda</h4>
          <ul><li>Novedades</li><li>Invierno</li><li>Verano</li><li>Ofertas</li></ul>
        </div>
        <div className="footer-links">
          <h4>Ayuda</h4>
          <ul><li>Envíos</li><li>Devoluciones</li><li>FAQ</li></ul>
        </div>
        <div className="footer-links">
          <h4>Empresa</h4>
          <ul>
            <li><button className="link-btn" onClick={() => setPage("contact")}>Contacto</button></li>
            {adminAuthed ? (
              <>
                <li><button className="link-btn" onClick={() => setPage("admin")}>Panel admin</button></li>
                <li><button className="link-btn" onClick={onAdminLogout}>Cerrar sesión</button></li>
              </>
            ) : (
              <li><button className="link-btn" onClick={() => setPage("admin")}>Iniciar sesión</button></li>
            )}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 ÉLUME Fashion. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
