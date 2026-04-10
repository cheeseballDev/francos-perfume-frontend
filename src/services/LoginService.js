import { API_BASE } from "./api";

/*
  LoginService.jsx
  ─────────────────────────────────────────────────────────────────────────────
  Handles authentication. Does NOT use apiFetch() because the login endpoint
  is the only one that works without a JWT — it's what produces the token.

  TOKEN LIFECYCLE:
    • login()  → stores the accessToken in localStorage["token"]
    • logout() → removes it from localStorage
    • Every other service reads it via: localStorage.getItem("token")

  WHY localStorage?
    It persists across page refreshes. The alternative is React state (lost on
    refresh) or sessionStorage (cleared when the tab closes). For an internal
    inventory app, localStorage is appropriate.
  ─────────────────────────────────────────────────────────────────────────────
*/

/**
 * login — authenticates an employee and stores the JWT.
 *
 * @param {string} email
 * @param {string} password
 * @param {string|null} newPassword — required when password_status = "temporary"
 * @returns {object} — LoginResponseModel: { accessToken, email, role, branch_id, requiresPasswordChange }
 */
export const login = async (email, password, newPassword = null) => {
  // Build body conditionally — spread keeps the object shape predictable
  const body = {
    email,
    password,
    ...(newPassword ? { newPassword } : {}),
  };

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error("Invalid credentials");

  const data = await response.json();

  // ── Store token immediately so all subsequent apiFetch() calls work ───────
  // If the server said the password must change, there's no accessToken yet —
  // we'll call login() again with a newPassword once the user sets one.
  if (data.accessToken) {
    localStorage.setItem("token", data.accessToken);
  }

  return data; // full shape: { accessToken, email, role, branch_id, requiresPasswordChange }
};

/**
 * logout — clears the stored JWT so the user is treated as unauthenticated.
 * Call this from App.jsx's handleLogout.
 */
export const logout = () => {
  localStorage.removeItem("token");
};
