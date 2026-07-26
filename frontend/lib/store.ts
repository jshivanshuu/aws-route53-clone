export function logout() { localStorage.removeItem("route53_token"); localStorage.removeItem("route53_user"); }
export function currentUser() { try { return JSON.parse(localStorage.getItem("route53_user") || "null") as { email: string } | null; } catch { return null; } }
