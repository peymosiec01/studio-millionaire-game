const APP_CONFIG = typeof window !== "undefined" && window.__APP_CONFIG__ ? window.__APP_CONFIG__ : {};
const BUILD_ENV = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};

export const cleanConfigValue = (value) => {
  if (typeof value !== "string") return "";
  let normalized = value.trim();
  if (!normalized) return "";
  if (normalized.endsWith(";")) normalized = normalized.slice(0, -1).trim();
  if ((normalized.startsWith("\"") && normalized.endsWith("\"")) || (normalized.startsWith("'") && normalized.endsWith("'"))) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
};

export const getConfig = (keys, fallback = "") => {
  const names = Array.isArray(keys) ? keys : [keys];
  for (const name of names) {
    const appValue = cleanConfigValue(APP_CONFIG[name]);
    if (appValue) return appValue;
    const buildValue = cleanConfigValue(BUILD_ENV[name]);
    if (buildValue) return buildValue;
    const vitePrefixedValue = cleanConfigValue(BUILD_ENV[`VITE_${name}`]);
    if (vitePrefixedValue) return vitePrefixedValue;
  }
  return fallback;
};

export const clone = (value) => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export function makeKey(value, fallback) {
  const key = cleanConfigValue(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
  return key || fallback;
}

export function normalizeEndpoint(endpoint) {
  const trimmed = cleanConfigValue(endpoint);
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}
