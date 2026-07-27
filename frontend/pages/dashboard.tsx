import Link from "next/link";
import { useState } from "react";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <Layout>
      {/* Alert Error Banner */}
      {showAlert && (
        <div className="aws-alert-banner">
          <div className="aws-alert-left">
            <span className="aws-alert-icon">☒</span>
            <div className="aws-alert-body">
              <strong>Route 53 couldn't update the page</strong>
              <p>Route 53 encountered an unknown error and couldn't update your page. Try refreshing the page.</p>
              <div className="aws-alert-details">
                <span>▶ API error messages</span>
              </div>
            </div>
          </div>
          <div className="aws-alert-right">
            <button className="aws-btn-refresh" onClick={() => window.location.reload()}>
              Refresh page
            </button>
            <button className="aws-alert-close" onClick={() => setShowAlert(false)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="aws-dashboard-header">
        <h1>Route 53 Dashboard</h1>
        <a href="#" onClick={e => e.preventDefault()} className="aws-info-link">
          Info
        </a>
      </div>

      {/* 4-Section Service Overview Card Grid */}
      <section className="aws-service-grid-card">
        {/* Section 1: DNS management */}
        <div className="aws-grid-section">
          <h2>DNS management</h2>
          <p>A hosted zone tells Route 53 how to respond to DNS queries for a domain such as example.com.</p>
          <Link href="/hosted-zones" className="aws-btn-pill-outline">
            Create hosted zone
          </Link>
        </div>

        {/* Section 2: Availability monitoring */}
        <div className="aws-grid-section">
          <h2>Availability monitoring</h2>
          <p>Health checks monitor your applications and web resources, and direct DNS queries to healthy resources.</p>
          <Link href="/health-checks" className="aws-btn-pill-outline">
            Create health check
          </Link>
        </div>

        {/* Section 3: Traffic management */}
        <div className="aws-grid-section">
          <h2>Traffic management</h2>
          <p>A visual tool that lets you easily create policies for multiple endpoints in complex configurations.</p>
          <Link href="/traffic-policies" className="aws-btn-pill-outline">
            Create policy
          </Link>
        </div>

        {/* Section 4: Domain registration */}
        <div className="aws-grid-section">
          <h2>Domain registration</h2>
          <div style={{ color: "#0073bb", fontSize: "18px", fontWeight: 700, marginTop: "12px" }}>
            Operational
          </div>
          <Link href="/hosted-zones" className="aws-info-link" style={{ marginTop: "8px" }}>
            Domains
          </Link>
        </div>
      </section>
    </Layout>
  );
}


