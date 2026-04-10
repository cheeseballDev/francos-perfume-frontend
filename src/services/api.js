/*
  api.js — Shared HTTP client
  ─────────────────────────────────────────────────────────────────────────────
  WHY THIS FILE EXISTS:
    Every service (InventoryService, EmployeeService, etc.) needs to:
      1. Prepend the correct base URL
      2. Attach the JWT Authorization header
      3. Convert non-2xx HTTP responses into thrown Errors

    Without this wrapper you'd repeat those 10 lines in every function.
    This is the "DRY principle" (Don't Repeat Yourself) in practice.

  HOW IT WORKS:
    All service functions call `apiFetch(endpoint, options)` instead of
    calling `fetch()` directly. apiFetch handles the shared logic and
    either returns parsed JSON or throws an Error.

  TOKEN STORAGE:
    The JWT is stored in localStorage under the key "token".
    It's put there by LoginService.jsx right after a successful login.
    It's cleared by LoginService.jsx on logout.

  BASE URL:
    Matches the .NET dev server port in src/api/Properties/launchSettings.json.
    Change to your production domain before deploying.
  ─────────────────────────────────────────────────────────────────────────────
*/

export const API_BASE = "http://localhost:5019/api";

// Reads the stored JWT — returns null if not logged in
const getToken = () => localStorage.getItem("token");

/**
 * apiFetch
 *
 * @param {string} endpoint  — relative path, e.g. "/inventory/displayAll"
 * @param {object} options   — same shape as the native fetch() options object
 * @returns {Promise<any>}   — parsed JSON body, or null for 204 No Content
 *
 * Throws an Error with the server's error message on any non-2xx response.
 * Catch this in the calling component to show UI error feedback.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // Only attach Authorization header if a token exists
      // (login endpoint doesn't need it, so this handles that case)
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Allow callers to pass extra headers (e.g. different Content-Type)
      ...options.headers,
    },
  });

  // Non-OK: read the response body as text (the .NET API returns error strings)
  // and throw it so the calling component can display it to the user
  if (!response.ok) {
    const errorText = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(errorText || `Request failed: HTTP ${response.status}`);
  }

  // 204 No Content (used by some DELETE/PATCH responses) — nothing to parse
  if (response.status === 204) return null;

  return response.json();
};
