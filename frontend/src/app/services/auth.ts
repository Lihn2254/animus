import API_BASE_URL from "../api";
import { User } from "../types/user";

export async function login(credentials: string, password: string): Promise<{message: string, user: User, token: string}> {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: credentials, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.message || "Invalid credentials.");
  }

  const data = await res.json();
  return data;
}

export async function register(user: User): Promise<{message: string, user: User, token: string}> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.message || "Registration failed.");
  }

  return res.json();
}

export async function checkDuplicate(text: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/user/check-duplicate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.message || "Could not validate duplicate.");
  }

  const isAvailable: boolean = await res.json();
  return isAvailable;
}
