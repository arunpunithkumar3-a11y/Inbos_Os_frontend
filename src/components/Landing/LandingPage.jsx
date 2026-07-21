import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/logo.png";
import "./LandingPage.css";

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: "✦",
    iconBg: "rgba(99,102,241,0.12)",
    iconColor: "#818CF8",
    title: "AI Email Summaries",
    desc: "Get concise, AI-generated summaries of long email threads so you can catch up in seconds instead of minutes.",
  },
  {
    icon: "⌕",
    iconBg: "rgba(6,182,212,0.12)",
    iconColor: "#22D3EE",
    title: "Semantic Email Search",
    desc: "Search your inbox using natural language. Ask questions like 'emails about the Q3 budget' and get precise results.",
  },
  {
    icon: "✎",
    iconBg: "rgba(139,92,246,0.12)",
    iconColor: "#C084FC",
    title: "AI Draft Replies",
    desc: "Let Inbox-Os draft context-aware email replies for you. Review, edit, and send — in one smooth flow.",
  },
  {
    icon: "⊞",
    iconBg: "rgba(245,158,11,0.12)",
    iconColor: "#FCD34D",
    title: "Inbox Organization",
    desc: "Apply labels, archive threads, and manage inbox workflows through simple conversational commands.",
  },
  {
    icon: "◈",
    iconBg: "rgba(16,185,129,0.12)",
    iconColor: "#34D399",
    title: "Email Insights",
    desc: "Understand your inbox at a glance with mailbox statistics, sender activity, and communication patterns.",
  },
  {
    icon: "⬡",
    iconBg: "rgba(239,68,68,0.12)",
    iconColor: "#F87171",
    title: "Secure Gmail Integration",
    desc: "Connects to Gmail using Google's official OAuth 2.0 — your credentials are never stored by Inbox-Os.",
  },
];

const GMAIL_PERMISSIONS = [
  {
    label: "Read Gmail messages",
    detail: "Only when you explicitly ask Inbox-Os to read them",
  },
  {
    label: "Search your emails",
    detail: "Queries are run on your behalf, results stay private",
  },
  {
    label: "Generate AI summaries",
    detail: "Content is processed to produce a summary, then discarded",
  },
  {
    label: "Draft email replies",
    detail: "Drafts are created locally for your review before sending",
  },
  {
    label: "Organize inbox workflows",
    detail: "Labels and archive actions are applied only with your approval",
  },
];

const SECURITY_ITEMS = [
  {
    icon: "🔐",
    title: "OAuth 2.0 Authentication",
    desc: "Industry-standard OAuth 2.0 — your Google password is never seen or stored by Inbox-Os.",
  },
  {
    icon: "🟢",
    title: "Google Sign-In",
    desc: "Authentication flows through Google's own secure login system, giving you full visibility and control.",
  },
  {
    icon: "🔒",
    title: "Encrypted Communication",
    desc: "All data in transit is protected with TLS encryption. Inbox-Os never exposes your email data.",
  },
  {
    icon: "🎛️",
    title: "User-Controlled Permissions",
    desc: "You decide exactly what Inbox-Os can access. Permissions are granted explicitly through Google's consent screen.",
  },
  {
    icon: "↩",
    title: "Revoke Access Anytime",
    desc: "You can revoke Inbox-Os's access to your Gmail at any time from your Google Account security settings.",
  },
  {
    icon: "🚫",
    title: "No Data Selling",
    desc: "Your email data is never sold, rented, shared with advertisers, or used for any purpose outside your requests.",
  },
];

const OAUTH_SCOPES = [
  { icon: "📧", text: "gmail.readonly — read email content" },
  { icon: "✉️", text: "gmail.send — send emails on your behalf" },
  { icon: "🏷️", text: "gmail.labels — manage labels and organization" },
  { icon: "👤", text: "userinfo.email — identify your account" },
];

/* ─── Intersection Observer hook ───────────────────────────────────────────── */

function useScrollReveal(selector, threshold = 0.15) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold }
    );

    const els = document.querySelectorAll(selector);
    els.forEach((el, i) => {
      el.style.transitionDelay = `${i * 80}ms`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selector, threshold]);
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate();

  useScrollReveal(".lp-feature-card");
  useScrollReveal(".lp-security-card");
  useScrollReveal(".lp-permission-row", 0.1);

  return (
    <div className="landing-root">
      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="lp-nav" aria-label="Main navigation">
        <a className="lp-nav-brand" href="/" aria-label="Inbox-Os home">
          <img src={logoImg} alt="Inbox-Os logo" className="lp-nav-logo" />
          <span className="lp-nav-name">Inbox-Os</span>
        </a>

        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#permissions" className="lp-nav-link">Privacy</a>
          <a href="#security" className="lp-nav-link">Security</a>
          <a href="/privacy-policy" className="lp-nav-link">Privacy Policy</a>
        </div>

        <button
          id="nav-signin-btn"
          className="lp-nav-cta"
          onClick={() => navigate("/login")}
          aria-label="Sign in to Inbox-Os"
        >
          Sign in
        </button>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="lp-hero" aria-labelledby="hero-heading">
        <div className="lp-hero-bg" aria-hidden="true">
          <div className="lp-hero-orb lp-hero-orb-1" />
          <div className="lp-hero-orb lp-hero-orb-2" />
          <div className="lp-hero-orb lp-hero-orb-3" />
          <div className="lp-hero-grid" />
        </div>

        <div className="lp-hero-content">
          <div className="lp-hero-badge" aria-label="App status">
            <span className="lp-hero-badge-dot" aria-hidden="true" />
            Now live — AI-powered Gmail workspace
          </div>

          <h1 id="hero-heading" className="lp-hero-title">
            Meet{" "}
            <span className="lp-hero-title-accent">Inbox-Os</span>
          </h1>

          <p className="lp-hero-tagline">AI-powered Gmail Workspace</p>

          <p className="lp-hero-description">
            Inbox-Os helps you manage your Gmail inbox using AI. Summarize email threads,
            search by meaning, draft replies, and organize your inbox — all through a
            simple conversational interface. No switching tabs. No email fatigue.
          </p>

          <div className="lp-hero-ctas">
            <button
              id="hero-signin-btn"
              className="lp-btn-primary"
              onClick={() => navigate("/login")}
              aria-label="Sign in with Google to get started"
            >
              {/* Google "G" SVG */}
              <svg
                className="lp-google-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="#fff"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="rgba(255,255,255,0.75)"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="rgba(255,255,255,0.5)"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="rgba(255,255,255,0.9)"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <a
              id="hero-learn-more-btn"
              href="#features"
              className="lp-btn-secondary"
              aria-label="Learn more about Inbox-Os features"
            >
              Learn More
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div className="lp-hero-scroll" aria-hidden="true">
          <div className="lp-scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section
        id="features"
        className="lp-section lp-features"
        aria-labelledby="features-heading"
      >
        <div className="lp-section-inner">
          <div className="lp-features-header">
            <div className="lp-section-label" aria-hidden="true">
              ✦ Features
            </div>
            <h2 id="features-heading" className="lp-section-heading">
              Everything your inbox needs
            </h2>
            <p className="lp-section-subheading">
              Inbox-Os combines the power of large language models with your Gmail account
              to give you a fully AI-assisted email experience.
            </p>
          </div>

          <div className="lp-features-grid" role="list">
            {FEATURES.map((feat, i) => (
              <article
                key={i}
                className="lp-feature-card"
                role="listitem"
                aria-label={feat.title}
              >
                <div
                  className="lp-feature-icon"
                  style={{ background: feat.iconBg, color: feat.iconColor }}
                  aria-hidden="true"
                >
                  {feat.icon}
                </div>
                <h3 className="lp-feature-card-title">{feat.title}</h3>
                <p className="lp-feature-card-desc">{feat.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Gmail Access ──────────────────────────────────────── */}
      <section
        id="permissions"
        className="lp-section lp-gmail-access"
        aria-labelledby="permissions-heading"
      >
        <div className="lp-section-inner">
          <div className="lp-gmail-layout">
            {/* Left — Text */}
            <div className="lp-gmail-content">
              <div className="lp-section-label" aria-hidden="true">
                🔒 Transparency
              </div>
              <h2 id="permissions-heading" className="lp-section-heading">
                Why Gmail access is needed
              </h2>
              <p className="lp-section-subheading">
                Inbox-Os requests Gmail permissions <strong>only after you give explicit
                consent</strong> through Google's secure authorization screen. Here is
                exactly what those permissions are used for:
              </p>

              <div className="lp-gmail-permissions" role="list">
                {GMAIL_PERMISSIONS.map((perm, i) => (
                  <div
                    key={i}
                    className="lp-permission-row"
                    role="listitem"
                  >
                    <span className="lp-permission-check" aria-hidden="true">✓</span>
                    <p className="lp-permission-text">
                      <strong>{perm.label}</strong> — {perm.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="lp-gmail-guarantee"
                role="note"
                aria-label="Privacy guarantee"
              >
                <span className="lp-guarantee-icon" aria-hidden="true">🛡️</span>
                <div className="lp-guarantee-text">
                  We never access Gmail without the user's authorization.
                  <em>
                    Your data is never sold, rented, or shared with third parties.
                    Inbox-Os only reads what you explicitly ask it to.
                  </em>
                </div>
              </div>
            </div>

            {/* Right — OAuth Card */}
            <div className="lp-gmail-visual" aria-hidden="true">
              <div className="lp-gmail-card">
                <div className="lp-gmail-card-header">
                  <div className="lp-gmail-card-logo">🔑</div>
                  <div>
                    <div className="lp-gmail-card-title">Google OAuth Consent</div>
                    <div className="lp-gmail-card-sub">
                      Inbox-Os is requesting access to:
                    </div>
                  </div>
                </div>
                <div className="lp-oauth-scope">
                  {OAUTH_SCOPES.map((scope, i) => (
                    <div key={i} className="lp-scope-item">
                      <span className="lp-scope-icon">{scope.icon}</span>
                      <span className="lp-scope-text">{scope.text}</span>
                    </div>
                  ))}
                </div>
                <div className="lp-scope-consent">
                  ✓ You authorize on Google's secure page — not on Inbox-Os
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Security ───────────────────────────────────────────────── */}
      <section
        id="security"
        className="lp-section lp-security"
        aria-labelledby="security-heading"
      >
        <div className="lp-section-inner">
          <div className="lp-security-header">
            <div className="lp-section-label" aria-hidden="true">
              🛡️ Security & Privacy
            </div>
            <h2 id="security-heading" className="lp-section-heading">
              Built with your privacy first
            </h2>
            <p className="lp-section-subheading">
              Security is not an afterthought at Inbox-Os. Every layer of the product is
              designed to keep your data safe and in your control.
            </p>
          </div>

          <div className="lp-security-grid" role="list">
            {SECURITY_ITEMS.map((item, i) => (
              <article
                key={i}
                className="lp-security-card"
                role="listitem"
                aria-label={item.title}
              >
                <span className="lp-security-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <h3 className="lp-security-title">{item.title}</h3>
                <p className="lp-security-desc">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Band ───────────────────────────────────────────────── */}
      <div className="lp-cta-band" aria-labelledby="cta-heading">
        <div className="lp-cta-band-bg" aria-hidden="true" />
        <div className="lp-cta-band-inner">
          <h2 id="cta-heading" className="lp-cta-band-title">
            Ready to take control of your inbox?
          </h2>
          <p className="lp-cta-band-sub">
            Sign in with your Google account and let Inbox-Os transform the way you handle email.
          </p>
          <button
            id="cta-band-signin-btn"
            className="lp-btn-primary"
            onClick={() => navigate("/login")}
            aria-label="Sign in with Google to get started"
          >
            <svg
              className="lp-google-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="rgba(255,255,255,0.75)" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="rgba(255,255,255,0.5)" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="rgba(255,255,255,0.9)" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Get Started — It's Free
          </button>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="lp-footer" role="contentinfo" aria-label="Site footer">
        <div className="lp-footer-inner">
          <div>
            <a className="lp-footer-brand" href="/" aria-label="Inbox-Os home">
              <img src={logoImg} alt="" className="lp-footer-logo" aria-hidden="true" />
              <span className="lp-footer-name">Inbox-Os</span>
            </a>
            <p className="lp-footer-copy" style={{ marginTop: "0.5rem" }}>
              © {new Date().getFullYear()} Inbox-Os. All rights reserved.
            </p>
          </div>

          <nav className="lp-footer-links" aria-label="Footer links">
            <a
              href="/privacy-policy"
              className="lp-footer-link"
              id="footer-privacy-link"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-and-conditions"
              className="lp-footer-link"
              id="footer-terms-link"
            >
              Terms of Service
            </a>
            <a
              href="mailto:contact@inbox-os.com"
              className="lp-footer-link"
              id="footer-contact-link"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
