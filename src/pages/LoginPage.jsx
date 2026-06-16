import { useState } from "react";
import { login, googleLoginUrl } from "../api/api";
import { GoogleIcon } from "../components/icons";

export default function LoginPage({ setPage, onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) {
      setError("Completá email y contraseña.");
      return;
    }
    setLoading(true);
    try {
      const user = await login({ email, password });
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
        <h1 className="auth-title">Iniciar sesión</h1>

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

        <div className="auth-divider"><span>o</span></div>

        <button className="btn-google" onClick={() => (window.location.href = googleLoginUrl())}>
          <GoogleIcon />
          Continuar con Google
        </button>

        <p className="auth-switch">
          ¿No tenés cuenta?{" "}
          <button className="link-btn" onClick={() => setPage("register")}>Registrate</button>
        </p>
      </div>
    </main>
  );
}
