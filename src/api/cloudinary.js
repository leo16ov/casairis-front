// Pegá acá tu Cloud Name y el nombre del upload preset "unsigned" que creaste
const CLOUD_NAME    = "deyjiiuvs";
const UPLOAD_PRESET = "elume-ar";

export async function uploadToCloudinary(file, folder = "products") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder); // organiza en carpetas dentro de Cloudinary

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Error al subir la imagen a Cloudinary");
  }

  const data = await res.json();
  return data.secure_url; // esta es la URL que se guarda en Firestore
}