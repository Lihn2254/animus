import API_BASE_URL from "../api";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import { User } from "../types/user";

export async function login(credentials: string, password: string): Promise<{message: string, user: User, token: string}> {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: credentials, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Invalid credentials.");
  }

  const data = await res.json();
  return data.user;
}

export async function register(user: User): Promise<{message: string, user: User, token: string}> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
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
    throw new Error(errorData.message);
  }

  const isAvailable: boolean = await res.json();
  return isAvailable;
}

export async function deleteAccount(userId: number): Promise<void> {
  const res = await fetchWithAuth(`/account/${userId}`, {
    method: "DELETE",
  const data = await res.json();
  return data.user;
}

export async function deleteAccount(email: string, password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/account/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }

  const data = await res.json();
  return Boolean(data);
}

export async function getUser(userId: number): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/account/${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }
}

  return res.json();
}

export async function updateUser(userId: number, updates: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/account/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message);
  }

  const data = await res.json();
  return data.user;
}
