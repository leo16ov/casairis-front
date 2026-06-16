import { useState } from "react";
import { register, googleLoginUrl } from "../api/api";
import { GoogleIcon } from "../components/icons";

export default function RegisterPage({ setPage, onLogin }) {
  const [form,    setForm]    = useState({ name: "", surname: "", email: "", pass: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.pass) {
      setError("Completá nombre, email y contraseña.");
      return;
    }
    setLoading(true);
    try {
      const user = await register({
        nombre:   form.name,
        apellido: form.surname,
        email:    form.email,
        password: form.pass,
      });
      onLogin({ name: user.nombre, email: user.email, rol: user.rol });
      setPage("home");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Crear cuenta</h1>

        {error && <p className="auth-error">{error}</p>}

        <div className="form-row">
          <div className="form-group form-group--narrow">
            <label className="form-label">Nombre</label>
            <input className="form-input" value={form.name} onChange={set("name")} />
          </div>
          <div className="form-group form-group--narrow">
            <label className="form-label">Apellido</label>
            <input className="form-input" value={form.surname} onChange={set("surname")} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={set("email")} />
        </div>

        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input className="form-input" type="password" value={form.pass} onChange={set("pass")} />
        </div>

        <button className="btn-auth" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creando…" : "Registrarme"}
        </button>

        <div className="auth-divider"><span>o</span></div>

        <button className="btn-google" onClick={() => (window.location.href = googleLoginUrl())}>
          <GoogleIcon />
          Continuar con Google
        </button>

        <p className="auth-switch">
          ¿Ya tenés cuenta?{" "}
          <button className="link-btn" onClick={() => setPage("login")}>Iniciá sesión</button>
        </p>
      </div>
    </main>
  );
}
