import {
  collection, getDocs, doc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp, serverTimestamp,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { uploadToCloudinary } from "./cloudinary";

const PRODUCTS_COL   = "productos";
const CATEGORIES_COL = "categorias";
const ORDERS_COL     = "pedidos";

/* ─────────────────────── PRODUCTOS (CRUD) ─────────────────────── */
export async function getProducts() {
  const snap = await getDocs(collection(db, PRODUCTS_COL));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createProduct(payload) {
  const docRef = await addDoc(collection(db, PRODUCTS_COL), payload);
  return { id: docRef.id, ...payload };
}

export async function updateProduct(id, payload) {
  await updateDoc(doc(db, PRODUCTS_COL, id), payload);
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, PRODUCTS_COL, id));
}

/* ─────────────────────── CATEGORÍAS (CRUD) ─────────────────────── */
// El id del documento de Firestore se usa como "key" de la categoría.
export async function getCategories() {
  const snap = await getDocs(collection(db, CATEGORIES_COL));
  return snap.docs.map(d => ({ id: d.id, key: d.id, ...d.data() }));
}

export async function createCategory(payload) {
  const docRef = await addDoc(collection(db, CATEGORIES_COL), payload);
  return { id: docRef.id, key: docRef.id, ...payload };
}

export async function updateCategory(id, payload) {
  await updateDoc(doc(db, CATEGORIES_COL, id), payload);
}

export async function deleteCategory(id) {
  await deleteDoc(doc(db, CATEGORIES_COL, id));
}

/* ─────────────────────── IMÁGENES (Cloudinary) ─────────────────────── */
export async function uploadImage(file, folder = "products") {
  return uploadToCloudinary(file, folder);
}

/* ─────────────────────── PEDIDOS ─────────────────────── */
// Se crea desde CheckoutPage cuando el cliente envía el pedido.
export async function createOrder({ items, total, cliente }) {
  const payload = {
    items: items.map(i => ({ id: i.id, nombre: i.nombre, precio: i.precio, qty: i.qty })),
    total,
    cliente, // { name, email, phone, message }
    fecha: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, ORDERS_COL), payload);
  return { id: docRef.id, ...payload };
}

// from / to son strings "YYYY-MM-DD" (lo que devuelve un <input type="date">)
export async function getOrders({ from, to } = {}) {
  const constraints = [orderBy("fecha", "desc")];

  if (from) {
    constraints.push(where("fecha", ">=", Timestamp.fromDate(new Date(`${from}T00:00:00`))));
  }
  if (to) {
    constraints.push(where("fecha", "<=", Timestamp.fromDate(new Date(`${to}T23:59:59`))));
  }

  const q = query(collection(db, ORDERS_COL), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/* ─────────────────────── ADMIN AUTH ─────────────────────── */
export async function adminLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export function adminLogout() {
  return signOut(auth);
}

export function onAdminAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => callback(!!user));
}

/*import { db, auth, storage } from "../firebase";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ── Productos ────────────────────────────────────────────────────────────────
export async function getProducts() {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createProduct(data) {
  const payload = { activo: true, imagenes: [], ...data };
  const ref = await addDoc(collection(db, "products"), payload);
  return { id: ref.id, ...payload };
}

export async function updateProduct(id, data) {
  await updateDoc(doc(db, "products", id), data);
  return { id, ...data };
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

// ── Imágenes (Firebase Storage) ──────────────────────────────────────────────
export async function uploadImage(file, folder = "products") {
  const path = `${folder}/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

// ── Categorías ───────────────────────────────────────────────────────────────
export async function getCategories() {
  const snap = await getDocs(collection(db, "categories"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createCategory({ label, imagen = "" }) {
  const key = slugify(label);
  const payload = { key, label, imagen };
  const ref = await addDoc(collection(db, "categories"), payload);
  return { id: ref.id, ...payload };
}

export async function updateCategory(id, data) {
  await updateDoc(doc(db, "categories", id), data);
  return { id, ...data };
}

export async function deleteCategory(id) {
  await deleteDoc(doc(db, "categories", id));
}

// ── Admin: sesión (Firebase Auth) ────────────────────────────────────────────
export function adminLogin(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function adminLogout() {
  return signOut(auth);
}

// callback(true|false) cada vez que cambia el estado de sesión
export function onAdminAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => callback(!!user));
}*/
