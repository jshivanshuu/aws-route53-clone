const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Zone = { id: string; domain_name: string; description?: string | null; is_private: boolean; created_at: string; record_count: number; nameservers: string[] };
export type Record = { id: string; name: string; type: string; value: string; ttl: number; description?: string | null; created_at: string };
export type User = { id: string; email: string };

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("route53_token") : null;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || "Something went wrong. Please try again.");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
