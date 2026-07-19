import React from "react";

export default function ReasoningPanel({ message }) {
  const { status } = message;

  if (status === "completed") {
    return null;
  }

  if (status === "failed") {
    return (
      <div className="message-row agent">
        <div className="message-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "block" }}>
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="M22 6l-10 7L2 6"></path>
          </svg>
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--color-error)", padding: "0.2rem 0" }}>
          Execution failed
        </div>
      </div>
    );
  }

  return (
    <div className="message-row agent">
      <div className="message-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "block" }}>
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M22 6l-10 7L2 6"></path>
        </svg>
      </div>
      <div className="simple-buffering-indicator">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </div>
  );
}
