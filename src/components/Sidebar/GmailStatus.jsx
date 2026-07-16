
import React from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function GmailStatus() {
  const { gmailConnected, gmailEmail, handleGmailConnectRedirect } = useWorkspace();

  return (
    <div className="gmail-status-item" id="gmail-status-item">
      <div className="gmail-status-item-left">
        <div
          id="gmail-dot"
          className={`status-dot ${gmailConnected ? "connected" : "disconnected"}`}
        ></div>
        <span id="gmail-email" className="gmail-subtitle">
          {gmailConnected ? gmailEmail : "Gmail disconnected"}
        </span>
      </div>
      <button
        id="btn-connect-gmail"
        className="btn-icon"
        title="Connect Gmail"
        onClick={handleGmailConnectRedirect}
      >
        {gmailConnected ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "4px" }}>
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "4px" }}>
            <path d="M15 3h6v6"></path>
            <path d="M10 14L21 3"></path>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          </svg>
        )}
      </button>
    </div>
  );
}
