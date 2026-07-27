import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
import awsLogo from "../assets/aws-logo@2x.7c50e6f9.png";

export default function Login() {
  const router = useRouter();
  const [userType, setUserType] = useState<"root" | "iam">("root");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api<{ access_token: string; user: { email: string } }>("/api/auth/login-demo", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("route53_token", result.access_token);
      localStorage.setItem("route53_user", JSON.stringify(result.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const logoSrc = typeof awsLogo === "string" ? awsLogo : awsLogo.src;

  return (
    <div className="aws-login-page">
      {/* Top Header */}
      <header className="aws-login-header">
        <div className="aws-header-logo">
          <img src={logoSrc} alt="AWS Logo" style={{ height: "44px", width: "auto" }} />
        </div>
        <div className="aws-header-links">


          <a href="#" onClick={e => e.preventDefault()}>Provide feedback</a>
          <a href="#" onClick={e => e.preventDefault()}>Multi-session disabled ▼</a>
          <a href="#" onClick={e => e.preventDefault()}>English ▼</a>
        </div>
      </header>

      {/* Main Container */}
      <main className="aws-login-container">
        {/* Sign In Card */}
        <div className="aws-card">
          <h1>Sign In</h1>
          <p className="aws-subtitle">Access your AWS account by user type.</p>

          <div className="aws-user-type-header">
            <span>User type</span>
            <a href="#" onClick={e => e.preventDefault()} className="aws-link">
              (not sure?)
            </a>
          </div>

          {/* Radio Selector Cards */}
          <div className="aws-radio-group">
            <div
              className={`aws-radio-card ${userType === "root" ? "selected" : ""}`}
              onClick={() => setUserType("root")}
            >
              <div className="aws-radio-input">
                <span className={`aws-radio-bullet ${userType === "root" ? "active" : ""}`} />
              </div>
              <div className="aws-radio-content">
                <strong>Root user</strong>
                <p>Account owner that performs tasks requiring unrestricted access.</p>
              </div>
            </div>

            <div
              className={`aws-radio-card ${userType === "iam" ? "selected" : ""}`}
              onClick={() => setUserType("iam")}
            >
              <div className="aws-radio-input">
                <span className={`aws-radio-bullet ${userType === "iam" ? "active" : ""}`} />
              </div>
              <div className="aws-radio-content">
                <strong>IAM user</strong>
                <p>User within an account that performs daily tasks.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="aws-login-form">
            <label className="aws-label">
              <span>Email address</span>
              <input
                required
                type="email"
                className="aws-input"
                placeholder="username@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>

            <label className="aws-label">
              <span>Password</span>
              <input
                required
                minLength={6}
                type="password"
                className="aws-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </label>

            {error && <div className="aws-error">{error}</div>}

            <button type="submit" className="aws-btn-primary" disabled={loading}>
              {loading ? "Signing in…" : "Next"}
            </button>

            <button
              type="button"
              className="aws-btn-demo"
              onClick={() => {
                setEmail("");
                setPassword("");
              }}
            >
              Clear form inputs
            </button>

          </form>
        </div>

        {/* Promo Banner Card */}
        <div className="aws-promo-card">
          <div className="aws-promo-lines">
            <span className="dot dot-1" />
            <span className="dot dot-2" />
            <span className="dot dot-3" />
            <span className="dot dot-4" />
          </div>
          <div className="aws-promo-content">
            <h2>Your SQL Server &amp; Oracle databases, AI-ready</h2>
            <p>Amazon RDS lets you lift and shift with no rewrites. 34% lower costs.</p>
            <a href="#" onClick={e => e.preventDefault()} className="aws-promo-link">
              Learn why customers migrate &rarr;
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

