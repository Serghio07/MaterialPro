import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const API_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000/api" : "http://localhost:3000/api";

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function getToken() {
  return AsyncStorage.getItem("materialpro_token");
}

export async function setSession(token: string, usuario: unknown) {
  await AsyncStorage.setItem("materialpro_token", token);
  await AsyncStorage.setItem("materialpro_user", JSON.stringify(usuario));
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
