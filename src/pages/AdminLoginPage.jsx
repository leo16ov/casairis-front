import { useState } from "react";
import { adminLogin } from "../api/api";

export default function AdminLoginPage({ setPage }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Completá email y contraseña."); return; }
    setLoading(true);
    try {
      await adminLogin(email, password);
      // El listener onAdminAuthChange en App.jsx detecta la sesión y navega solo.
    } catch {
      setError("Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Panel de administración</h1>

        {error && <p className="auth-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <button className="btn-auth" onClick={handleSubmit} disabled={loading}>
          {loading ? "Ingresando…" : "Ingresar"}
        </button>

        <p className="auth-switch">
          <button className="link-btn" onClick={() => setPage("home")}>← Volver a la tienda</button>
        </p>
      </div>
    </main>
  );
}
