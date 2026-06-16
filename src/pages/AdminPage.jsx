import { useState, useEffect, useCallback } from "react";
import {
  getAdminProducts, createProduct, updateProduct, deleteProduct,
  uploadProductImages, getCategories, createCategory,
  getAllOrders, updateOrderStatus,
} from "../api/api";
import "../App.css";

const ESTADOS = ["pendiente", "pagada", "en_preparacion", "enviada", "entregada", "cancelada", "reembolsada"];
const ESTADO_LABEL = {
  pendiente: "Pendiente", pagada: "Pagada", en_preparacion: "En preparación",
  enviada: "Enviada", entregada: "Entregada", cancelada: "Cancelada", reembolsada: "Reembolsada",
};

const emptyForm = {
  nombre: "", descripcion: "", precio: "", stock: "",
  talles: "", colores: "", id_categoria: "", activo: true,
};

export default function AdminPage({ user, setPage, onLogout }) {
  const [tab, setTab] = useState("productos");

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-logo">ÉLUME</span>
          <span className="admin-logo-sub">PANEL</span>
        </div>
        <nav className="admin-nav">
          <button className={tab === "productos"  ? "active" : ""} onClick={() => setTab("productos")}>Productos</button>
          <button className={tab === "pedidos"    ? "active" : ""} onClick={() => setTab("pedidos")}>Pedidos</button>
          <button className={tab === "categorias" ? "active" : ""} onClick={() => setTab("categorias")}>Categorías</button>
        </nav>
        <div className="admin-sidebar-foot">
          <button className="admin-store-btn" onClick={() => setPage("home")}>
            ← Ver tienda
          </button>
          <button className="admin-link" onClick={onLogout}>Cerrar sesión</button>
          <span className="admin-user">{user?.email}</span>
        </div>
      </aside>

      <main className="admin-main">
        {tab === "productos"  && <ProductsTab />}
        {tab === "pedidos"    && <OrdersTab />}
        {tab === "categorias" && <CategoriesTab />}
      </main>
    </div>
  );
}

/* ─────────────────────────── PRODUCTOS ─────────────────────────── */
function ProductsTab() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [editing,    setEditing]    = useState(null); // null | "new" | producto
  const [form,       setForm]       = useState(emptyForm);
  const [saving,     setSaving]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getAdminProducts(), getCategories()]);
      setProducts(p || []);
      setCategories(c || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm({ ...emptyForm, id_categoria: categories[0]?.id || "" });
    setEditing("new");
  };

  const openEdit = (p) => {
    setForm({
      nombre: p.nombre, descripcion: p.descripcion || "",
      precio: p.precio, stock: p.stock,
      talles: p.talles || "", colores: p.colores || "",
      id_categoria: p.id_categoria, activo: p.activo,
    });
    setEditing(p);
  };

  const closeForm = () => { setEditing(null); setForm(emptyForm); };

  const handleSave = async () => {
    setSaving(true); setError("");
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio) || 0,
      stock: parseInt(form.stock, 10) || 0,
      talles: form.talles,
      colores: form.colores,
      id_categoria: parseInt(form.id_categoria, 10) || 0,
      activo: !!form.activo,
    };
    try {
      if (editing === "new") {
        const created = await createProduct(payload);
        await load();
        // Pasa a edición del producto creado para poder cargarle imágenes.
        openEdit({ ...created, id_categoria: payload.id_categoria, activo: true });
      } else {
        await updateProduct(editing.id, payload);
        await load();
        closeForm();
      }
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!confirm(`¿Dar de baja "${p.nombre}"?`)) return;
    try { await deleteProduct(p.id); await load(); }
    catch (e) { setError(e.message); }
  };

  const handleUpload = async (productId, files) => {
    if (!files?.length) return;
    try {
      await uploadProductImages(productId, files);
      const list = await getAdminProducts();
      setProducts(list || []);
      // Actualiza el producto en edición para ver las miniaturas al instante.
      const fresh = (list || []).find(p => p.id === productId);
      if (fresh) setEditing(fresh);
    } catch (e) { setError(e.message); }
  };

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
  };

  return (
    <section>
      <div className="admin-head">
        <h1>Productos</h1>
        <button className="admin-btn" onClick={openNew}>+ Nuevo producto</button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loading ? <p>Cargando…</p> : (
        <table className="admin-table">
          <thead>
            <tr><th></th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className={p.activo ? "" : "row-inactive"}>
                <td className="cell-img">
                  <img src={(p.imagenes && p.imagenes[0]) || "https://placehold.co/80x100?text=—"} alt="" />
                </td>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>${p.precio}</td>
                <td>{p.stock}</td>
                <td>{p.activo ? <span className="badge-on">Activo</span> : <span className="badge-off">Inactivo</span>}</td>
                <td className="cell-actions">
                  <button className="admin-link" onClick={() => openEdit(p)}>Editar</button>
                  <button className="admin-link danger" onClick={() => handleDelete(p)}>Baja</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan="7">No hay productos.</td></tr>}
          </tbody>
        </table>
      )}

      {editing && (
        <div className="admin-modal" onClick={closeForm}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <h2>{editing === "new" ? "Nuevo producto" : `Editar: ${editing.nombre}`}</h2>

            <label>Nombre</label>
            <input value={form.nombre} onChange={set("nombre")} />

            <label>Descripción</label>
            <textarea value={form.descripcion} onChange={set("descripcion")} rows={3} />

            <div className="admin-form-row">
              <div>
                <label>Precio</label>
                <input type="number" step="0.01" value={form.precio} onChange={set("precio")} />
              </div>
              <div>
                <label>Stock</label>
                <input type="number" value={form.stock} onChange={set("stock")} />
              </div>
            </div>

            <label>Categoría</label>
            <select value={form.id_categoria} onChange={set("id_categoria")}>
              <option value="">— elegí —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>

            <div className="admin-form-row">
              <div>
                <label>Talles (separá con , o -)</label>
                <input value={form.talles} onChange={set("talles")} placeholder="S,M,L" />
              </div>
              <div>
                <label>Colores (separá con , o -)</label>
                <input value={form.colores} onChange={set("colores")} placeholder="#000,#fff" />
              </div>
            </div>

            {editing !== "new" && (
              <label className="admin-check">
                <input type="checkbox" checked={form.activo} onChange={set("activo")} /> Activo (visible en la tienda)
              </label>
            )}

            {/* Imágenes: solo cuando el producto ya existe (tiene id) */}
            {editing !== "new" && (
              <div className="admin-images">
                <label>Imágenes</label>
                <div className="admin-thumbs">
                  {(editing.imagenes || []).map((url, i) => <img key={i} src={url} alt="" />)}
                  {(!editing.imagenes || editing.imagenes.length === 0) && <span className="admin-muted">Sin imágenes</span>}
                </div>
                <input type="file" accept="image/*" multiple
                  onChange={e => handleUpload(editing.id, e.target.files)} />
              </div>
            )}

            <div className="admin-modal-actions">
              <button className="admin-link" onClick={closeForm}>Cerrar</button>
              <button className="admin-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
            {editing === "new" && <p className="admin-muted">Al guardar vas a poder cargarle imágenes.</p>}
          </div>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────── PEDIDOS ─────────────────────────── */
function OrdersTab() {
  const [orders,  setOrders]  = useState([]);
  const [filter,  setFilter]  = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setOrders(await getAllOrders(filter) || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, estado) => {
    try {
      await updateOrderStatus(id, estado);
      setOrders(os => os.map(o => o.id === id ? { ...o, estado } : o));
    } catch (e) { setError(e.message); }
  };

  return (
    <section>
      <div className="admin-head"><h1>Pedidos</h1></div>

      <div className="admin-filters">
        <button className={filter === "" ? "active" : ""} onClick={() => setFilter("")}>Todos</button>
        {ESTADOS.map(s => (
          <button key={s} className={filter === s ? "active" : ""} onClick={() => setFilter(s)}>
            {ESTADO_LABEL[s]}
          </button>
        ))}
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loading ? <p>Cargando…</p> : orders.length === 0 ? <p>No hay pedidos.</p> : (
        <div className="admin-orders">
          {orders.map(o => (
            <div className="admin-order" key={o.id}>
              <div className="admin-order-top">
                <div>
                  <strong>Orden #{o.id}</strong>
                  <span className="admin-muted"> · {o.usuario_nombre} ({o.usuario_email})</span>
                </div>
                <select value={o.estado} onChange={e => changeStatus(o.id, e.target.value)}>
                  {ESTADOS.map(s => <option key={s} value={s}>{ESTADO_LABEL[s]}</option>)}
                </select>
              </div>
              <div className="admin-order-items">
                {(o.items || []).map(it => (
                  <div key={it.id} className="admin-order-item">
                    <span>{it.nombre_producto} ×{it.cantidad}
                      {it.talle_seleccionado ? ` · ${it.talle_seleccionado}` : ""}
                      {it.color_seleccionado ? ` · ${it.color_seleccionado}` : ""}
                    </span>
                    <span>${it.precio_unitario * it.cantidad}</span>
                  </div>
                ))}
              </div>
              <div className="admin-order-foot">
                <span>{new Date(o.fecha_emision).toLocaleString()}</span>
                <strong>Total: ${o.total}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────── CATEGORÍAS ─────────────────────────── */
function CategoriesTab() {
  const [cats,    setCats]    = useState([]);
  const [nombre,  setNombre]  = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCats(await getCategories() || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!nombre.trim()) return;
    try { await createCategory(nombre.trim()); setNombre(""); await load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <section>
      <div className="admin-head"><h1>Categorías</h1></div>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-cat-form">
        <input value={nombre} onChange={e => setNombre(e.target.value)}
          placeholder="Nombre de la categoría"
          onKeyDown={e => e.key === "Enter" && handleCreate()} />
        <button className="admin-btn" onClick={handleCreate}>Crear</button>
      </div>

      {loading ? <p>Cargando…</p> : (
        <ul className="admin-cat-list">
          {cats.map(c => <li key={c.id}>{c.nombre}</li>)}
          {cats.length === 0 && <li className="admin-muted">No hay categorías.</li>}
        </ul>
      )}
    </section>
  );
}
