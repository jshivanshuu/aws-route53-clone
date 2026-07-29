const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Zone = { id: string; domain_name: string; description?: string | null; is_private: boolean; created_at: string; record_count: number; nameservers: string[] };
export type Record = { id: string; name: string; type: string; value: string; ttl: number; description?: string | null; created_at: string };
export type User = { id: string; email: string };

export type BackendStatus = "ready" | "warming" | "offline";

let cachedStatus: BackendStatus = "warming";
const statusListeners: Set<(status: BackendStatus) => void> = new Set();

export function subscribeBackendStatus(listener: (status: BackendStatus) => void): () => void {
  statusListeners.add(listener);
  listener(cachedStatus);
  return () => statusListeners.delete(listener);
}

function setStatus(status: BackendStatus) {
  cachedStatus = status;
  statusListeners.forEach((fn) => fn(status));
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("route53_token") : null;
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.detail || "Something went wrong. Please try again.");
    }
    setStatus("ready");
    return response.status === 204 ? (undefined as T) : response.json();
  } catch (err: any) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error("Unable to reach backend server. It may be starting up (Render free tier cold start). Please wait a few seconds and try again.");
    }
    throw err;
  }
}

export async function prewarmBackend(maxRetries = 12): Promise<BackendStatus> {
  if (typeof window === "undefined") return "ready";
  if (cachedStatus === "ready") return "ready";

  setStatus("warming");

  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_URL}/health`, { method: "GET", signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        setStatus("ready");
        return "ready";
      }
    } catch {
      // Backend container waking up...
    }
    await new Promise((r) => setTimeout(r, 2500));
  }

  setStatus("offline");
  return "offline";
}

export async function downloadExport(zoneId: string, domainName: string, format: "bind" | "json") {
  const token = typeof window !== "undefined" ? localStorage.getItem("route53_token") : null;
  const res = await fetch(`${API_URL}/api/hosted-zones/${zoneId}/export?format=${format}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) {
    throw new Error("Unable to export hosted zone.");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = format === "bind" ? `${domainName}.zone` : `${domainName}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

