
import React from "react";
import WorkspaceHeader from "./WorkspaceHeader";
import ChatViewport from "./ChatViewport";
import InputPanel from "./InputPanel";

export default function ChatWorkspace() {
  return (
    <main className="chat-workspace">
      {}
      <WorkspaceHeader />

      {}
      <ChatViewport />

      {}
      <InputPanel />
    </main>
  );
}
