
import React from "react";
import { parseMarkdown } from "../../utils/markdown";

export default function MessageBubble({ message }) {
  const { type, content, isStreaming } = message;
  const isUser = type === "user";

  const renderAvatar = () => (
    <div className="message-avatar">
      {isUser ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "block" }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "block" }}>
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M22 6l-10 7L2 6"></path>
        </svg>
      )}
    </div>
  );

  return (
    <div className={`message-row ${isUser ? "user" : "agent"}`}>
      {!isUser && renderAvatar()}

      <div
        className={`message-bubble ${isStreaming ? "streaming-cursor" : ""}`}
        {...(isUser
          ? { children: content }
          : { dangerouslySetInnerHTML: { __html: parseMarkdown(content) } })}
      />

      {isUser && renderAvatar()}
    </div>
  );
}
