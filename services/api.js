import Constants from "expo-constants";
import { Platform } from "react-native";

let authToken = null;

function getExpoHost() {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.manifest?.debuggerHost,
  ];

  const matchedHost = hostCandidates.find((value) => typeof value === "string" && value.length > 0);

  return matchedHost?.split(":")[0] ?? null;
}

function getDefaultBaseUrl() {
  const detectedHost = getExpoHost();
  const fallbackHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
  const host = detectedHost || fallbackHost;

  return `http://${host}:8080`;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || getDefaultBaseUrl();

async function request(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const rawBody = await response.text();
  const data = rawBody ? JSON.parse(rawBody) : null;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return {
    data,
    status: response.status,
  };
}

export function setAuthToken(token) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

const api = {
  get(path, options) {
    return request(path, {
      method: "GET",
      ...options,
    });
  },
  post(path, body, options) {
    return request(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },
};

export default api;
