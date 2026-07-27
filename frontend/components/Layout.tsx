import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { currentUser, logout } from "../lib/store";
import { useTheme } from "./Theme";
import awsLogo from "../assets/aws-logo@2x.7c50e6f9.png";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    setUser(currentUser());
    setSidebarOpen(false);
    if (!localStorage.getItem("route53_token")) {
      router.replace("/login");
    }
  }, [router]);

  const getPageTitle = () => {
    if (router.pathname.startsWith("/hosted-zones")) return "Hosted zones";
    if (router.pathname.startsWith("/health-checks")) return "Health checks";
    if (router.pathname.startsWith("/traffic-policies")) return "Traffic policies";
    if (router.pathname.startsWith("/resolver")) return "Resolver";
    if (router.pathname.startsWith("/profiles")) return "Profiles";
    return "Dashboard";
  };

  const logoSrc = typeof awsLogo === "string" ? awsLogo : awsLogo.src;

  const getAccountDisplay = () => {
    if (!mounted || !user?.email) return "AWS Account";
    const username = user.email.split("@")[0];
    let hash = 0;
    for (let i = 0; i < user.email.length; i++) {
      hash = (hash << 5) - hash + user.email.charCodeAt(i);
      hash |= 0;
    }
    const accountId = Math.abs((hash % 900000000000) + 100000000000);
    return `${username} (${accountId})`;
  };

  return (
    <div className="aws-console-shell">
      {/* Top Header */}
      <header className="aws-console-top-header">
        <div className="aws-top-left">
          <Link href="/dashboard" className="aws-top-logo">
            <img src={logoSrc} alt="AWS" style={{ height: "24px", filter: "brightness(0) invert(1)" }} />
          </Link>
          <div className="aws-cloudshell-btn">
            <span>[›_]</span>
          </div>
          <div className="aws-search-bar">
            <input placeholder="Search" />
            <span className="aws-search-shortcut">[Alt+S] 🔍</span>
          </div>
        </div>

        <div className="aws-top-right">
          <span
            className="aws-top-icon"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={toggleTheme}
            style={{ cursor: "pointer" }}
          >
            {theme === "dark" ? "☀" : "☾"}
          </span>
          <span className="aws-top-icon" title="CloudShell">[›_]</span>
          <span className="aws-top-icon" title="Notifications">🔔</span>
          <span className="aws-top-icon" title="Help">❓</span>
          <span className="aws-top-icon" title="Settings">⚙️</span>
          <span className="aws-region-selector">Global ▼</span>
          
          <div className="aws-user-dropdown" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
            <span suppressHydrationWarning>{getAccountDisplay()} ▼</span>

            {userDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "42px",
                  right: "16px",
                  background: "#16191f",
                  border: "1px solid #485666",
                  borderRadius: "4px",
                  padding: "8px 0",
                  width: "220px",
                  zIndex: 2000,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                }}
              >
                <div style={{ padding: "8px 16px", borderBottom: "1px solid #232f3e", fontSize: "12px", color: "#aab7b8" }}>
                  Signed in as <b style={{ color: "#ffffff", display: "block" }} suppressHydrationWarning>{user?.email || "User"}</b>
                </div>

                <button
                  onClick={toggleTheme}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 16px",
                    background: "none",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "13px",
                    cursor: "pointer",
                    borderBottom: "1px solid #232f3e",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span>{theme === "dark" ? "☀" : "☾"}</span>
                  <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 16px",
                    background: "none",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Subheader / Breadcrumb Bar */}
      <div className="aws-console-subheader">
        <div className="aws-sub-left">
          <button className="aws-menu-circle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className="aws-breadcrumbs">
            <Link href="/dashboard" className="aws-breadcrumb-link">
              Route 53
            </Link>
            <span>›</span>
            <span>{getPageTitle()}</span>
          </div>
        </div>
        <div className="aws-sub-right">ⓘ</div>
      </div>

      {/* Main Layout Body */}
      <div className="aws-console-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="aws-main-content">{children}</main>
      </div>


      {/* Dark Footer */}
      <footer className="aws-console-footer">
        <div className="aws-footer-left">
          <a href="#" onClick={e => e.preventDefault()}>[›_] CloudShell</a>
          <span>|</span>
          <a href="#" onClick={e => e.preventDefault()}>Agent Toolkit for AWS</a>
          <span>|</span>
          <a href="#" onClick={e => e.preventDefault()}>Feedback</a>
          <span>|</span>
          <a href="#" onClick={e => e.preventDefault()}>Console Mobile App</a>
        </div>
        <div className="aws-footer-right">
          <span>© 2026, Amazon Web Services, Inc. or its affiliates.</span>
          <a href="#" onClick={e => e.preventDefault()}>Privacy</a>
          <a href="#" onClick={e => e.preventDefault()}>Terms</a>
          <a href="#" onClick={e => e.preventDefault()}>Cookie preferences</a>
        </div>
      </footer>
    </div>
  );
}

