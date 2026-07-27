import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Sidebar() {
  const router = useRouter();
  const [globalOpen, setGlobalOpen] = useState(true);
  const [vpcOpen, setVpcOpen] = useState(true);

  const isNavActive = (href: string) => {
    return router.pathname === href || (href === "/hosted-zones" && router.pathname.startsWith("/hosted-zones"));
  };

  return (
    <aside className="aws-light-sidebar">
      <div className="aws-sidebar-title">
        <span>Route 53</span>
        <span style={{ cursor: "pointer", fontSize: "14px", color: "#545b64" }}>‹</span>
      </div>

      <nav className="aws-sidebar-nav">
        <Link href="/dashboard" className={`aws-sidebar-item ${isNavActive("/dashboard") ? "active" : ""}`}>
          <span>Dashboard</span>
        </Link>
        <Link href="/hosted-zones" className={`aws-sidebar-item ${isNavActive("/hosted-zones") ? "active" : ""}`}>
          <span>Hosted zones</span>
        </Link>
        <Link href="/health-checks" className={`aws-sidebar-item ${isNavActive("/health-checks") ? "active" : ""}`}>
          <span>Health checks</span>
        </Link>
        <Link href="/profiles" className={`aws-sidebar-item ${isNavActive("/profiles") ? "active" : ""}`}>
          <span>Profiles</span>
        </Link>

        {/* Global Resolver Group */}
        <div className="aws-sidebar-section-header" onClick={() => setGlobalOpen(!globalOpen)}>
          <span>{globalOpen ? "▼" : "▶"}</span>
          <span>Global Resolver</span>
        </div>
        {globalOpen && (
          <div style={{ paddingLeft: "12px" }}>
            <Link href="/resolver" className={`aws-sidebar-item ${isNavActive("/resolver") ? "active" : ""}`}>
              <span>
                Global resolvers <span className="aws-badge-new">New</span>
              </span>
            </Link>
            <a href="#" onClick={e => e.preventDefault()} className="aws-sidebar-item">
              <span>
                Shared DNS views <span className="aws-badge-new">New</span>
              </span>
            </a>
          </div>
        )}

        {/* VPC Resolver Group */}
        <div className="aws-sidebar-section-header" onClick={() => setVpcOpen(!vpcOpen)}>
          <span>{vpcOpen ? "▼" : "▶"}</span>
          <span>VPC Resolver</span>
        </div>
        {vpcOpen && (
          <div style={{ paddingLeft: "12px" }}>
            <a href="#" onClick={e => e.preventDefault()} className="aws-sidebar-item">
              <span>VPCs</span>
            </a>
            <a href="#" onClick={e => e.preventDefault()} className="aws-sidebar-item">
              <span>Inbound endpoints</span>
            </a>
            <a href="#" onClick={e => e.preventDefault()} className="aws-sidebar-item">
              <span>Outbound endpoints</span>
            </a>
            <a href="#" onClick={e => e.preventDefault()} className="aws-sidebar-item">
              <span>Rules</span>
            </a>
            <a href="#" onClick={e => e.preventDefault()} className="aws-sidebar-item">
              <span>Query logging</span>
            </a>
            <a href="#" onClick={e => e.preventDefault()} className="aws-sidebar-item">
              <span>Outposts</span>
            </a>
          </div>
        )}
      </nav>
    </aside>
  );
}


