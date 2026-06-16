// src/api/api.js
// Capa única de acceso al backend. Adapta la respuesta (en español, según la DB)
// a la forma que ya usan los componentes del frontend.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const PLACEHOLDER = "https://placehold.co/600x800?text=Sin+imagen";

// ── Token (persistido en localStorage) ────────────────────────────
const TOKEN_KEY = "elume_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => !!getToken();

// ── Request genérico con manejo de errores y auth ──────────────────
async function request(path, { method = "GET", body, auth = false, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (auth && getToken()) headers["Authorization"] = `Bearer ${getToken()}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch (_) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Helpers de mapeo ───────────────────────────────────────────────
// Divide la cadena de talles/colores por "," o "-".
const splitList = (s) =>
  s ? s.split(/[,-]/).map((x) => x.trim()).filter(Boolean) : [];

// Convierte un producto del backend a la forma del frontend (tienda).
function mapProduct(p) {
  return {
    id: p.id,
    name: p.nombre,
    category: (p.categoria || "").toLowerCase(),
    price: p.precio,
    stock: p.stock,
    description: p.descripcion || "",
    sizes: splitList(p.talles),
    colors: splitList(p.colores),
    images: p.imagenes && p.imagenes.length ? p.imagenes : [PLACEHOLDER],
    badge: null,
  };
}

// ── Productos (tienda pública) ─────────────────────────────────────
export async function getProducts() {
  const data = await request("/v1/products");
  return (data || []).map(mapProduct);
}

export async function getProduct(id) {
  return mapProduct(await request(`/v1/products/${id}`));
}

export async function getCategories() {
  return request("/v1/categories");
}

// ── Auth ───────────────────────────────────────────────────────────
export async function login({ email, password }) {
  const data = await request("/v1/login", {
    method: "POST",
    body: { email, contrasena: password },
  });
  if (data.token) setToken(data.token);
  return data.user; // {id, nombre, apellido, email, rol}
}

export async function register({ nombre, apellido, email, password }) {
  // El backend crea el usuario pero no devuelve token: hacemos login a continuación.
  await request("/v1/signup", {
    method: "POST",
    body: { nombre, apellido, email, contrasena: password },
  });
  return login({ email, password });
}

export async function getProfile() {
  return request("/v1/profile", { auth: true }); // {user_id, email, rol}
}

export const googleLoginUrl = () => `${API_URL}/v1/oauth`;

// ── Checkout / Órdenes (cliente) ───────────────────────────────────
export async function createCheckout(payload) {
  return request("/v1/payment", { method: "POST", body: payload, auth: true });
}

export async function getOrders() {
  return request("/v1/orders", { auth: true });
}

// ── Admin: productos ───────────────────────────────────────────────
// Devuelve los productos crudos (claves en español) para el panel.
export async function getAdminProducts() {
  return request("/v1/admin/products", { auth: true });
}

// payload: { nombre, descripcion, precio, stock, talles, colores, id_categoria }
export async function createProduct(payload) {
  return request("/v1/products", { method: "POST", body: payload, auth: true });
}

// payload incluye además { activo }
export async function updateProduct(id, payload) {
  return request(`/v1/products/${id}`, { method: "PUT", body: payload, auth: true });
}

export async function deleteProduct(id) {
  return request(`/v1/products/${id}`, { method: "DELETE", auth: true });
}

export async function createCategory(nombre) {
  return request("/v1/admin/categories", { method: "POST", body: { nombre }, auth: true });
}

// Sube una o varias imágenes a un producto (admin).
export async function uploadProductImages(productId, fileList) {
  const form = new FormData();
  Array.from(fileList).forEach((f) => form.append("images", f));
  return request(`/v1/products/${productId}/images`, {
    method: "POST",
    body: form,
    auth: true,
    isForm: true,
  });
}

// ── Admin: órdenes ─────────────────────────────────────────────────
export async function getAllOrders(estado = "") {
  const qs = estado ? `?estado=${encodeURIComponent(estado)}` : "";
  return request(`/v1/admin/orders${qs}`, { auth: true });
}

export async function updateOrderStatus(id, estado) {
  return request(`/v1/admin/orders/${id}/status`, {
    method: "PUT",
    body: { estado },
    auth: true,
  });
}
