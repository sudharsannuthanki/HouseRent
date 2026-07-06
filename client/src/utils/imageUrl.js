const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:8000";

export function getImageUrl(path) {
  if (!path) return "";

  const normalizedPath = String(path).replace(/\\/g, "/");
  if (/^(https?:|data:|blob:)/i.test(normalizedPath)) return normalizedPath;

  const uploadIndex = normalizedPath.indexOf("/uploads/");
  if (uploadIndex >= 0) {
    return `${API_ORIGIN}${normalizedPath.slice(uploadIndex)}`;
  }

  if (normalizedPath.startsWith("uploads/")) {
    return `${API_ORIGIN}/${normalizedPath}`;
  }

  return normalizedPath;
}
