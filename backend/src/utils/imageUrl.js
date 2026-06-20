const limpiarImagenUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const value = url.trim();
  return value.startsWith("/uploads/") ? value : null;
};

const limpiarFilaImagen = (row) => {
  if (!row || !Object.prototype.hasOwnProperty.call(row, "imagen_url")) return row;
  return { ...row, imagen_url: limpiarImagenUrl(row.imagen_url) };
};

module.exports = {
  limpiarImagenUrl,
  limpiarFilaImagen,
};
