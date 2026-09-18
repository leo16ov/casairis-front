import { CONTACT_PHONE_DISPLAY } from "../config";

export default function Footer({ setPage, adminAuthed, onAdminLogout }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo-text" style={{ fontSize: "1.5rem", color: "#fff" }}>Casa Iris</span>
          <p>Perfumes seleccionados, atención cercana y envíos a todo el país.</p>
        </div>
        <div className="footer-links">
          <h4>Tienda</h4>
          <ul><li>Perfumes</li><li>Novedades</li><li>Ofertas</li></ul>
        </div>
        <div className="footer-links">
          <h4>Ayuda</h4>
          <ul><li>Envíos</li><li>Cambios y devoluciones</li><li>{CONTACT_PHONE_DISPLAY}</li></ul>
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
        <p>© {new Date().getFullYear()} Casa Iris. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}