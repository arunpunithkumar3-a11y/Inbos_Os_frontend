
import React from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import { formatDate } from "../../utils/helpers";

export default function ThreadList() {
  const {
    threads,
    currentThreadId,
    switchThread,
    handleDeleteThread,
    isThreadsLoading,
  } = useWorkspace();

  if (isThreadsLoading && threads.length === 0) {
    return (
      <div className="thread-loading-shim">
        <div className="shim-item"></div>
        <div className="shim-item"></div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>
        No recent conversations.
      </div>
    );
  }

  return (
    <div className="thread-list-container" id="thread-list">
      {threads.map((thread) => {
        const isActive = thread.thread_id === currentThreadId;
        const titleText =
          thread.chat_title && thread.chat_title.trim() !== ""
            ? thread.chat_title
            : "Conversation";

        return (
          <div
            key={thread.thread_id}
            className={`thread-item ${isActive ? "active" : ""}`}
            onClick={() => switchThread(thread.thread_id, titleText)}
          >
            <div className="thread-icon-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div className="thread-metadata">
              <span className="thread-title">{titleText}</span>
              <span className="thread-time">{formatDate(thread.created_at)}</span>
            </div>
            <button
              className="btn-delete-thread"
              title="Delete Conversation"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteThread(thread.thread_id, titleText);
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
