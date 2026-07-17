import React, { useState } from "react";

function ToolBlock({ tool }) {
  const [expanded, setExpanded] = useState(false);
  const { name, output } = tool;

  return (
    <div className={`reasoning-tool-block ${expanded ? "expanded" : ""}`}>
      <div className="reasoning-tool-header" onClick={() => setExpanded(!expanded)}>
        <div className="reasoning-tool-header-left">
          <span className="reasoning-tool-icon">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </span>
          <span className="reasoning-tool-name">{name}</span>
        </div>
        <span className="reasoning-tool-chevron">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </div>
      <div className="reasoning-tool-body">
        <div className="tool-io-section">
          <span className="tool-io-label">Output</span>
          <pre className="tool-io-content">{output}</pre>
        </div>
      </div>
    </div>
  );
}

export default function ReasoningPanel({ message }) {
  const { steps = [], tools = [], status } = message;

  const [isExpanded, setIsExpanded] = useState(status === "thinking" || status === "gateway");
  const [prevStatus, setPrevStatus] = useState(status);

  if (status !== prevStatus) {
    setPrevStatus(status);
    if (status === "completed" || status === "failed") {
      setIsExpanded(false);
    } else if (status === "thinking" || status === "gateway") {
      setIsExpanded(true);
    }
  }

  let statusText = "Thinking...";
  if (status === "completed") statusText = "Completed";
  else if (status === "failed") statusText = "Failed";
  else if (status === "gateway") statusText = "Gateway validation required";

  const getStatusPillStyle = () => {
    if (status === "failed") {
      return {
        color: "var(--color-error)",
        borderColor: "rgba(239, 68, 68, 0.2)",
      };
    }
    return {};
  };

  return (
    <div className="message-row agent">
      <div className="message-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "block" }}>
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M22 6l-10 7L2 6"></path>
        </svg>
      </div>
      <div className="reasoning-panel">
        <div 
          className="reasoning-header" 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          <div className="reasoning-header-left">
            {status === "thinking" ? (
              <span className="pulse-indicator"></span>
            ) : status === "completed" ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : status === "failed" ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", flexShrink: 0 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            )}
            <span className="reasoning-title">
              {status === "thinking" ? "Thinking process" : "Thought process"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="reasoning-status-pill" style={getStatusPillStyle()}>
              {statusText}
            </span>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                color: "var(--text-muted)",
                alignSelf: "center",
                flexShrink: 0
              }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        {isExpanded && (
          <div className="reasoning-body" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.02)" }}>
            <div className="reasoning-steps">
              {steps.map((step, idx) => {
                const isLast = idx === steps.length - 1;
                const isFailed = step.status === "failed" || (status === "failed" && isLast);
                const isActive = step.status === "active" && !isFailed;
                const stepClass = isFailed ? "failed" : (isActive ? "active" : "completed");

                return (
                  <div key={idx} className={`reasoning-step ${stepClass}`}>
                    <span className="reasoning-step-icon">
                      {isFailed ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      ) : isActive ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" style={{ animation: "spin 2.2s linear infinite" }}>
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.06)"></circle>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeLinecap="round"></path>
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </span>
                    <span className="reasoning-step-text">{step.text}</span>
                  </div>
                );
              })}
            </div>

            {tools.length > 0 && (
              <div className="reasoning-tools-container">
                {tools.map((tool) => (
                  <ToolBlock key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
