
import React, { useState } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { apiRequest } from "../../services/api";

export default function AuthScreen() {
  const { handleAuthSuccess } = useWorkspace();

  const [mode, setMode] = useState("login"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      handleAuthSuccess(data.access_token, data.refresh_token, false);
    } catch (err) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!displayName || !email || !password) return;

    setIsLoading(true);
    setError("");

    try {
      await apiRequest("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          user_name: displayName,
        }),
      });

      setPassword("");
      setError("");
      setMode("login");
      handleAuthSuccess("", "", true);
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (targetMode) => {
    setMode(targetMode);
    setError("");
    setPassword("");
  };

  return (
    <div id="auth-screen" className="screen-overlay active">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="5" fill="currentColor"/>
              <path d="M4.5 7.5L12 12.5L19.5 7.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.5 7.5V16.5C4.5 17.0523 4.94772 17.5 5.5 17.5H18.5C19.0523 17.5 19.5 17.0523 19.5 16.5V7.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="brand-name">Inbox OS</h1>
          <p className="brand-subtitle">Minimal AI Email Workspace</p>
        </div>

        {}
        {mode === "login" && (
          <form id="login-form" className="auth-form active" onSubmit={handleLoginSubmit}>
            <h2 className="form-title">Welcome Back</h2>
            <p className="form-description">Enter your credentials to access your workspace.</p>

            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                required
                placeholder="name@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div id="login-error" className="error-banner">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              <span className={`btn-text ${isLoading ? "hidden" : ""}`}>Sign In</span>
              <span className={`spinner ${isLoading ? "" : "hidden"}`}></span>
            </button>

            <p className="auth-toggle">
              Don't have an account?{" "}
              <a href="#" id="toggle-to-signup" onClick={(e) => { e.preventDefault(); toggleMode("signup"); }}>
                Sign up
              </a>
            </p>
          </form>
        )}

        {}
        {mode === "signup" && (
          <form id="signup-form" className="auth-form active" onSubmit={handleSignupSubmit}>
            <h2 className="form-title">Create Account</h2>
            <p className="form-description">Register a new profile to get started.</p>

            <div className="form-group">
              <label htmlFor="signup-name">Display Name</label>
              <input
                type="text"
                id="signup-name"
                required
                placeholder="John Doe"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email Address</label>
              <input
                type="email"
                id="signup-email"
                required
                placeholder="name@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                type="password"
                id="signup-password"
                required
                placeholder="Min 6 characters"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div id="signup-error" className="error-banner">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              <span className={`btn-text ${isLoading ? "hidden" : ""}`}>Create Account</span>
              <span className={`spinner ${isLoading ? "" : "hidden"}`}></span>
            </button>

            <p className="auth-toggle">
              Already have an account?{" "}
              <a href="#" id="toggle-to-login" onClick={(e) => { e.preventDefault(); toggleMode("login"); }}>
                Sign in
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
