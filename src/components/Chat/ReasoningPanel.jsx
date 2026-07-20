import React, { useState } from "react";

export default function ReasoningPanel({ message }) {
  const { status, steps = [] } = message;
  const [isExpanded, setIsExpanded] = useState(false);

  if (status === "completed") {
    return null;
  }

  if (status === "failed") {
    return (
      <div className="message-row agent simple-thinking-row">
        <div className="message-avatar error-avatar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div className="simple-thinking-bubble error">
          <span className="thinking-text" style={{ color: "var(--color-error, #ef4444)" }}>Execution failed</span>
        </div>
      </div>
    );
  }

  const activeStep = steps.find((s) => s.status === "active") || steps[steps.length - 1];
  const thinkingText = activeStep?.text || "Thinking...";

  return (
    <div className="message-row agent simple-thinking-row">
      <div className="message-avatar thinking-avatar">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="thinking-sparkle">
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
        </svg>
      </div>

      <div className="simple-thinking-bubble">
        <div className="simple-thinking-content" onClick={() => steps.length > 1 && setIsExpanded(!isExpanded)} style={{ cursor: steps.length > 1 ? "pointer" : "default" }}>
          <span className="thinking-shimmer-text">{thinkingText}</span>
          <div className="simple-buffering-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>

          {steps.length > 1 && (
            <button className="thinking-expand-btn" title="Toggle reasoning steps">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>

        {isExpanded && steps.length > 0 && (
          <div className="simple-thinking-steps-drawer">
            {steps.map((step, idx) => (
              <div key={idx} className={`simple-step-item ${step.status || ""}`}>
                <span className="step-bullet">•</span>
                <span className="step-text">{step.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
