
import React from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import GmailStatus from "./GmailStatus";
import ThreadList from "./ThreadList";
import UserProfile from "./UserProfile";

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, startNewConversationState } = useWorkspace();

  return (
    <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
      {}
      <div className="sidebar-header">
        <div className="logo-group">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "var(--accent-primary)" }}>
            <rect width="24" height="24" rx="5" fill="currentColor"/>
            <path d="M4.5 7.5L12 12.5L19.5 7.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.5 7.5V16.5C4.5 17.0523 4.94772 17.5 5.5 17.5H18.5C19.0523 17.5 19.5 17.0523 19.5 16.5V7.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <span className="sidebar-logo-text">Inbox OS</span>
          </div>
        </div>
        <button
          id="btn-close-sidebar"
          className="btn-icon mobile-only"
          title="Close Sidebar"
          onClick={() => setSidebarOpen(false)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {}
      <GmailStatus />

      {}
      <button
        id="btn-new-thread"
        className="btn btn-primary btn-block new-thread-btn"
        onClick={startNewConversationState}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Conversation
      </button>

      {}
      <div className="threads-section">
        <h3 className="section-title">Recent Chats</h3>
        <ThreadList />
      </div>

      {}
      <UserProfile />
    </aside>
  );
}
