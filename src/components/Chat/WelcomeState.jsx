
import React from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function WelcomeState() {
  const { gmailConnected, setSkillsOpen, sendMessage, isStreaming, setPrivacyModalOpen, setTermsModalOpen } = useWorkspace();

  const suggestions = [
    {
      icon: "📥",
      title: "Summarize Recent Emails",
      desc: '"Check my latest 5 emails and summarize them"',
      prompt: "Check my latest 5 emails and summarize them",
    },
    {
      icon: "⚡",
      title: "List Unread Alerts",
      desc: '"List unread emails from today"',
      prompt: "List unread emails from today",
    },
    {
      icon: "💳",
      title: "Search Stripe Invoices",
      desc: '"Search my emails for Stripe invoices from last month"',
      prompt: "Search my emails for Stripe invoices or payment receipts from the last month",
    },
    {
      icon: "✍️",
      title: "Draft AI Reply",
      desc: '"Create a draft reply to the last email I received"',
      prompt: "Create a draft reply to the last email I received",
    },
    {
      icon: "✉️",
      title: "Draft Task Summary",
      desc: '"Draft a task summary email to myself..."',
      prompt: "Draft a task summary email to myself based on my calendar and today's alerts",
    },
    {
      icon: "🧹",
      title: "Archive Notifications",
      desc: '"Find old notification emails and archive them"',
      prompt: "Find old newsletter or notification emails and archive them",
    },
  ];

  const handleSuggestionClick = (prompt) => {
    if (!isStreaming) {
      sendMessage(prompt);
    }
  };

  return (
    <div id="welcome-state" className="welcome-container">
      <div className="welcome-branding">
        <div className="big-logo-ring">
          <img src="/logo.png" alt="Inbox OS Logo" className="welcome-logo-img" />
        </div>
        <h2 className="welcome-title">Inbox OS Workspace</h2>
        <p className="welcome-subtitle">
          Ask questions, search details, or draft replies. AI-powered workspace for your Google Gmail.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", marginTop: "0.75rem" }}>
          <button
            id="btn-view-capabilities"
            className="btn btn-secondary"
            style={{ gap: "0.35rem" }}
            onClick={() => setSkillsOpen(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            Explore AI Capabilities
          </button>
          <button
            className="btn btn-ghost"
            style={{ gap: "0.35rem", fontSize: "0.8rem", opacity: 0.85 }}
            onClick={() => setPrivacyModalOpen(true)}
          >
            Privacy Policy
          </button>
          <button
            className="btn btn-ghost"
            style={{ gap: "0.35rem", fontSize: "0.8rem", opacity: 0.85 }}
            onClick={() => setTermsModalOpen(true)}
          >
            Terms & Conditions
          </button>
        </div>
      </div>

      {!gmailConnected && (
        <div id="gmail-alert-box" className="welcome-alert warning">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: "var(--color-warning)" }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div className="alert-content">
            <h4>Gmail Authentication Required</h4>
            <p>To activate skills like reading threads, drafting replies, and listing mailboxes, connect your Gmail above.</p>
          </div>
        </div>
      )}

      <div className="welcome-suggestions">
        <h3>Suggested Workflows</h3>
        <div className="suggestions-grid">
          {suggestions.map((card, idx) => (
            <div
              key={idx}
              className="suggestion-card"
              onClick={() => handleSuggestionClick(card.prompt)}
            >
              <span className="card-icon">{card.icon}</span>
              <div className="suggestion-meta">
                <span className="suggestion-title">{card.title}</span>
                <span className="suggestion-desc">{card.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
