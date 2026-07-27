import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { currentUser, logout } from "../lib/store";
import { useTheme } from "./Theme";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/hosted-zones", label: "Hosted zones" },
  { href: "/traffic-policies", label: "Traffic policies" },
  { href: "/health-checks", label: "Health checks" },
  { href: "/resolver", label: "Resolver" },
  { href: "/profiles", label: "Profiles" },
];

export default function Sidebar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = typeof window !== "undefined" ? currentUser() : null;
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  return (
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-header">
        <Link href="/dashboard" className="brand">
          <span className="brand-mark">53</span>
          <span>
            Route 53 <small>DNS management</small>
          </span>
        </Link>
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className="sidebar-content">
        <span className="nav-caption">ROUTE 53</span>
        <nav>
          {navigation.map(item => {
            const isActive =
              router.pathname === item.href ||
              (item.href === "/hosted-zones" && router.pathname.startsWith("/hosted-zones"));
            return (
              <Link
                key={item.href}
                className={isActive ? "active" : ""}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="account">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            <span>{theme === "dark" ? "☀" : "☾"}</span>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <span>{user?.email || "Signed in"}</span>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

