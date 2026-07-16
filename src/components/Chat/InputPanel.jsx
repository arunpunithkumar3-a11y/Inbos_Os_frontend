
import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function InputPanel() {
  const {
    sendMessage,
    isStreaming,
    attachments,
    addAttachment,
    removeAttachment,
    setCommandPaletteOpen,
  } = useWorkspace();

  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleSend = () => {
    if (text.trim() && !isStreaming) {
      sendMessage(text);
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      addAttachment(files[i]);
    }

    e.target.value = "";
  };

  const hasText = text.trim().length > 0;
  const isSendDisabled = !hasText || isStreaming;

  return (
    <footer className="input-panel">
      <div className="input-container">
        {}
        {attachments.length > 0 && (
          <div id="attachment-chips" className="attachment-chips-container">
            {attachments.map((item) => (
              <div key={item.id} className="attachment-chip">
                <span className="attachment-chip-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                </span>
                <span className="attachment-chip-name" title={item.name}>
                  {item.name}
                </span>
                <span className="attachment-chip-size">{item.size}</span>
                <button
                  className="btn-remove-attachment"
                  title="Remove attachment"
                  onClick={() => removeAttachment(item.id)}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          id="chat-input"
          placeholder="Ask Inbox OS to draft, search, or organize emails..."
          rows="1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        ></textarea>

        <div className="input-toolbar">
          <div style={{ display: "flex", alignSet: "center", alignItems: "center", gap: "0.5rem" }}>
            <button
              id="btn-attach-file"
              className="btn-icon"
              title="Attach Files"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              id="file-attachment"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <div className="shortcut-tip">
              <span className="keyboard-badge" onClick={() => setCommandPaletteOpen(true)} style={{ cursor: "pointer" }}>
                Ctrl+K
              </span>{" "}
              Actions &bull;{" "}
              <span className="keyboard-badge">
                Ctrl+Enter
              </span>{" "}
              Send
            </div>
          </div>

          <button
            id="btn-send-message"
            className="btn btn-primary btn-circle"
            title="Send Message"
            disabled={isSendDisabled}
            onClick={handleSend}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
