
import React, { useEffect, useRef } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import WelcomeState from "./WelcomeState";
import MessageFlow from "./MessageFlow";

export default function ChatViewport() {
  const { messages, currentThreadId, currentThreadStatus } = useWorkspace();
  const viewportRef = useRef(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  const isWelcome = messages.length === 0 && currentThreadId === null;
  const isHistoryLoading = messages.length === 0 && currentThreadId !== null && currentThreadStatus.includes("Fetching");

  return (
    <div ref={viewportRef} id="chat-messages" className="chat-viewport">
      {isWelcome ? (
        <WelcomeState />
      ) : isHistoryLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <span className="spinner"></span>
        </div>
      ) : (
        <MessageFlow />
      )}
    </div>
  );
}
