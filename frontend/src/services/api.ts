import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000/api" : "http://localhost:3000/api";
export const API_ORIGIN = API_URL.replace(/\/api$/, "");

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function getToken() {
  return AsyncStorage.getItem("materialpro_token");
}

export async function setSession(token: string, usuario: unknown) {
  await AsyncStorage.setItem("materialpro_token", token);
  await AsyncStorage.setItem("materialpro_user", JSON.stringify(usuario));
}

export async function getSessionUser<T = unknown>() {
  const value = await AsyncStorage.getItem("materialpro_user");
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.multiRemove(["materialpro_token", "materialpro_user"]);
}

export async function apiRequest<T>(
  path: string,
  options: { method?: ApiMethod; body?: Record<string, unknown> } = {}
): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Error en la peticion");
  }

  return data;
}

export async function apiFormRequest<T>(
  path: string,
  options: { method?: ApiMethod; body?: Record<string, unknown>; imageKey?: string } = {}
): Promise<T> {
  const token = await getToken();
  const formData = new FormData();
  const imageKey = options.imageKey || "imagen_url";

  const extensionFromMime = (mime = "") => {
    const clean = mime.toLowerCase().split(";")[0];
    const map: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/svg+xml": "svg",
      "image/avif": "avif",
      "image/heic": "heic",
      "image/heif": "heif",
      "image/bmp": "bmp",
      "image/tiff": "tiff",
      "image/x-icon": "ico",
    };
    return map[clean] || clean.replace("image/", "").replace("+xml", "") || "jpg";
  };

  for (const [key, value] of Object.entries(options.body || {})) {
    if (value === undefined || value === null) continue;

    if (key === imageKey && typeof value === "string" && /^(blob:|file:|data:)/.test(value)) {
      try {
        if (Platform.OS === "web") {
          const blob = await fetch(value).then((response) => response.blob());
          const extension = extensionFromMime(blob.type);
          formData.append("imagen", blob, `imagen-${Date.now()}.${extension}`);
        } else {
          const extension = value.split(".").pop()?.split("?")[0] || "jpg";
          const type = `image/${extension === "jpg" ? "jpeg" : extension}`;
          formData.append("imagen", { uri: value, name: `imagen-${Date.now()}.${extension}`, type } as unknown as Blob);
        }
      } catch {
        formData.append(key, "");
      }
      continue;
    }

    formData.append(key, String(value));
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Error en la peticion");
  }

  return data;
}
