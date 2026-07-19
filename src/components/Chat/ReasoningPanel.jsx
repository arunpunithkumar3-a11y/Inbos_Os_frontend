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
  const [isExpanded, setIsExpanded] = useState(false);

  const activeStep = steps.find((s) => s.status === "active") || steps[steps.length - 1];
  const activeStepText = activeStep ? activeStep.text : "";

  return (
    <div className="message-row agent">
      <div className="message-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "block" }}>
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M22 6l-10 7L2 6"></path>
        </svg>
      </div>
      <div className="reasoning-panel">
        {status === "thinking" ? (
          <div className="thinking-buffering-bar">
            <span className="thinking-dot-pulse"></span>
            <span className="thinking-label">Thinking</span>
            {activeStepText && <span className="thinking-active-step">• {activeStepText}</span>}
          </div>
        ) : (
          <div 
            className="thinking-toggle-header" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="thinking-toggle-title">
              {status === "failed" ? "Reasoning failed" : "Thought process"}
            </span>
            <svg 
              className={`thinking-chevron ${isExpanded ? "open" : ""}`}
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        )}

        {isExpanded && status !== "thinking" && (
          <div className="thinking-accordion-body">
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
