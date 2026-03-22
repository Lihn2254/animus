import API_BASE_URL from "../api";
import { fetchWithAuth } from "../lib/fetchWithAuth";
import { User } from "../types/user";

export async function deleteAccount(email: string, password: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/account/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "Could not delete account.");
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
        throw new Error(errorData.error || errorData.message || "Could not fetch user.");
    }

    return res.json();
}

export async function updateUser(userId: number, updates: Partial<User>): Promise<{message: string, user: User}> {
    const res = await fetchWithAuth(`/account/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.message || "Could not update user.");
    }

    return res.json();
}