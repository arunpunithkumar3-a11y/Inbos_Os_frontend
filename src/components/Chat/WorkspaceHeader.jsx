
import React from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function WorkspaceHeader() {
  const { currentThreadTitle, currentThreadStatus, setSidebarOpen } = useWorkspace();

  return (
    <header className="workspace-header">
      <div className="header-left">
        <button
          id="btn-toggle-sidebar"
          className="btn-icon mobile-only"
          title="Toggle Sidebar"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="active-thread-info">
          <h2 id="active-thread-title" className="active-title">
            {currentThreadTitle}
          </h2>
          <span id="active-thread-status" className="active-subtitle">
            {currentThreadStatus}
          </span>
        </div>
      </div>
      <div className="header-right" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div className="header-badge" id="system-badge">
          OS ACTIVE
        </div>
      </div>
    </header>
  );
}
