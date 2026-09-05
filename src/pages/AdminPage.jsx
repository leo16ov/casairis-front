import { useState, useEffect, useCallback } from "react";
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory, uploadImage, getOrders,
} from "../api/api";
import { IconClose } from "../components/icons";
import "../App.css";

const emptyForm = {
  nombre: "", descripcion: "", precio: "", stock: "",
  categoria: "", imagenes: [], activo: true,
};

export default function AdminPage({ setPage, onLogout }) {
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
          <button className={tab === "categorias" ? "active" : ""} onClick={() => setTab("categorias")}>Categorías</button>
          <button className={tab === "pedidos" ? "active" : ""} onClick={() => setTab("pedidos")}>Pedidos</button>
        </nav>
        <div className="admin-sidebar-foot">
          <button className="admin-store-btn" onClick={() => setPage("home")}>← Ver tienda</button>
          <button className="admin-link" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === "productos"  && <ProductsTab />}
        {tab === "categorias" && <CategoriesTab />}
        {tab === "pedidos" && <OrdersTab />}
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
  const [uploading,  setUploading]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getProducts(), getCategories()]);
      setProducts(p || []);
      setCategories(c || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm({ ...emptyForm, categoria: categories[0]?.key || "" });
    setEditing("new");
  };

  const openEdit = (p) => {
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: p.precio,
      stock: p.stock,
      categoria: p.categoria,
      imagenes: p.imagenes || [],
      activo: p.activo,
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
      categoria: form.categoria,
      imagenes: form.imagenes,
      activo: !!form.activo,
    };
    try {
      if (editing === "new") {
        await createProduct(payload);
      } else {
        await updateProduct(editing.id, payload);
      }
      await load();
      closeForm();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    try { await deleteProduct(p.id); await load(); }
    catch (e) { setError(e.message); }
  };

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [k]: v }));
  };

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true); setError("");
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setForm(f => ({ ...f, imagenes: [...f.imagenes, ...urls] }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (url) => {
    setForm(f => ({ ...f, imagenes: f.imagenes.filter(u => u !== url) }));
  };

  const labelFor = (key) => categories.find(c => c.key === key)?.label || key;

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
                <td>{labelFor(p.categoria)}</td>
                <td>${p.precio}</td>
                <td>{p.stock}</td>
                <td>{p.activo ? <span className="badge-on">Activo</span> : <span className="badge-off">Inactivo</span>}</td>
                <td className="cell-actions">
                  <button className="admin-link" onClick={() => openEdit(p)}>Editar</button>
                  <button className="admin-link danger" onClick={() => handleDelete(p)}>Eliminar</button>
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
            <select value={form.categoria} onChange={set("categoria")}>
              <option value="">— elegí —</option>
              {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>

            <label>Imágenes</label>
            <div className="admin-thumbs">
              {form.imagenes.map((url) => (
                <div key={url} className="admin-thumb-item">
                  <img src={url} alt="" />
                  <button
                    type="button"
                    className="btn-remove-item admin-thumb-remove"
                    onClick={() => removeImage(url)}
                    title="Quitar imagen"
                  >
                    <IconClose size={10} />
                  </button>
                </div>
              ))}
              {form.imagenes.length === 0 && <span className="admin-muted">Sin imágenes</span>}
            </div>
            <input type="file" accept="image/*" multiple onChange={handleFilesSelected} disabled={uploading} />
            {uploading && <p className="admin-muted">Subiendo imágenes…</p>}

            {editing !== "new" && (
              <label className="admin-check">
                <input type="checkbox" checked={form.activo} onChange={set("activo")} /> Activo (visible en la tienda)
              </label>
            )}

            <div className="admin-modal-actions">
              <button className="admin-link" onClick={closeForm}>Cerrar</button>
              <button className="admin-btn" onClick={handleSave} disabled={saving || uploading}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────── CATEGORÍAS ─────────────────────────── */
function CategoriesTab() {
  const [cats,      setCats]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [editing,   setEditing]   = useState(null); // null | "new" | categoria
  const [form,      setForm]      = useState({ label: "", imagen: "" });
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCats(await getCategories() || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew  = () => { setForm({ label: "", imagen: "" }); setEditing("new"); };
  const openEdit = (c) => { setForm({ label: c.label, imagen: c.imagen || "" }); setEditing(c); };
  const closeForm = () => { setEditing(null); setForm({ label: "", imagen: "" }); };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    try {
      const url = await uploadImage(file, "categories");
      setForm(f => ({ ...f, imagen: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.label.trim()) { setError("Ponele un nombre a la categoría."); return; }
    setSaving(true); setError("");
    try {
      if (editing === "new") {
        await createCategory({ label: form.label.trim(), imagen: form.imagen });
      } else {
        await updateCategory(editing.id, { label: form.label.trim(), imagen: form.imagen });
      }
      await load();
      closeForm();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta categoría? Los productos que la usen quedarán sin categoría válida.")) return;
    try { await deleteCategory(id); await load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <section>
      <div className="admin-head">
        <h1>Categorías</h1>
        <button className="admin-btn" onClick={openNew}>+ Nueva categoría</button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {loading ? <p>Cargando…</p> : (
        <table className="admin-table">
          <thead><tr><th></th><th>Nombre</th><th></th></tr></thead>
          <tbody>
            {cats.map(c => (
              <tr key={c.id}>
                <td className="cell-img">
                  <img src={c.imagen || "https://placehold.co/80x80?text=—"} alt="" />
                </td>
                <td>{c.label}</td>
                <td className="cell-actions">
                  <button className="admin-link" onClick={() => openEdit(c)}>Editar</button>
                  <button className="admin-link danger" onClick={() => handleDelete(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {cats.length === 0 && <tr><td colSpan="3">No hay categorías.</td></tr>}
          </tbody>
        </table>
      )}

      {editing && (
        <div className="admin-modal" onClick={closeForm}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <h2>{editing === "new" ? "Nueva categoría" : `Editar: ${editing.label}`}</h2>

            <label>Nombre</label>
            <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />

            <label>Imagen</label>
            <div className="admin-thumbs">
              {form.imagen ? (
                <div className="admin-thumb-item">
                  <img src={form.imagen} alt="" />
                  <button
                    type="button"
                    className="btn-remove-item admin-thumb-remove"
                    onClick={() => setForm(f => ({ ...f, imagen: "" }))}
                    title="Quitar imagen"
                  >
                    <IconClose size={10} />
                  </button>
                </div>
              ) : (
                <span className="admin-muted">Sin imagen</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleFileSelected} disabled={uploading} />
            {uploading && <p className="admin-muted">Subiendo imagen…</p>}

            <div className="admin-modal-actions">
              <button className="admin-link" onClick={closeForm}>Cerrar</button>
              <button className="admin-btn" onClick={handleSave} disabled={saving || uploading}>
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────── PEDIDOS ─────────────────────────── */
function OrdersTab() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [from,    setFrom]    = useState("");
  const [to,      setTo]      = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setOrders(await getOrders({ from, to }) || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const fmtFecha = (fecha) => {
    if (!fecha) return "—";
    const d = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return d.toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const totalFiltrado = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <section>
      <div className="admin-head">
        <h1>Pedidos</h1>
      </div>

      <div className="admin-form-row" style={{ maxWidth: 420, marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label">Desde</label>
          <input className="form-input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Hasta</label>
          <input className="form-input" type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>
      {(from || to) && (
        <button className="admin-link" onClick={() => { setFrom(""); setTo(""); }}>Limpiar filtro</button>
      )}

      {error && <p className="admin-error">{error}</p>}

      {loading ? <p>Cargando…</p> : (
        <>
          <p className="admin-muted" style={{ marginBottom: 12 }}>
            {orders.length} pedido(s) — total: ${totalFiltrado.toFixed(2)}
          </p>
          <table className="admin-table">
            <thead>
              <tr><th>Fecha</th><th>Cliente</th><th>Contacto</th><th>Items</th><th>Total</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{fmtFecha(o.fecha)}</td>
                  <td>{o.cliente?.name}</td>
                  <td>{o.cliente?.email}<br />{o.cliente?.phone}</td>
                  <td>
                    {(o.items || []).map((it, idx) => (
                      <div key={idx}>{it.nombre} × {it.qty}</div>
                    ))}
                  </td>
                  <td>${(o.total || 0).toFixed(2)}</td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="5">No hay pedidos en este rango.</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}