
import React from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import MessageBubble from "./MessageBubble";
import ReasoningPanel from "./ReasoningPanel";
import ApprovalCard from "./ApprovalCard";

export default function MessageFlow() {
  const { messages } = useWorkspace();

  if (messages.length === 0) {
    return (
      <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>
        Empty conversation. Send a message to start.
      </div>
    );
  }

  return (
    <div id="message-flow" className="message-flow-container">
      {messages.map((message) => {
        if (message.type === "user" || message.type === "agent") {
          return <MessageBubble key={message.id} message={message} />;
        }
        if (message.type === "reasoning") {
          return <ReasoningPanel key={message.id} message={message} />;
        }
        if (message.type === "approval") {
          return <ApprovalCard key={message.id} message={message} />;
        }
        return null;
      })}
    </div>
  );
}
