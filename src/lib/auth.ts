export type AuthUser = {
  id: number;
  username: string;
  email: string;
};

const TOKEN_KEY = "codearena_token";
const USER_KEY = "codearena_user";
const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const isBrowser = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

export function getToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken() && getCurrentUser());
}

export function saveSession(token: string, user: AuthUser) {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logout() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function readResponse(res: Response) {
  const text = await res.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function register(payload: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await readResponse(res);
  if (!res.ok) throw new Error(data.message || "Registration failed");

  saveSession(data.token, data.user);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await readResponse(res);
  if (!res.ok) throw new Error(data.message || "Login failed");

  saveSession(data.token, data.user);
  return data;
}
