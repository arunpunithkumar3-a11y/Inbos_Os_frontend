
import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    sendMessage,
    setSettingsOpen,
    startNewConversationState,
    handleGmailConnectRedirect,
    handleLogout,
  } = useWorkspace();

  const [filter, setFilter] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const commands = [
    {
      id: "summarize",
      title: "Summarize Inbox",
      icon: "📥",
      shortcut: "⌘S",
      action: () => sendMessage("Check my latest 5 emails and summarize them"),
    },
    {
      id: "unread",
      title: "List Unread Emails",
      icon: "⚡",
      shortcut: "⌘U",
      action: () => sendMessage("List unread emails from today"),
    },
    {
      id: "settings",
      title: "Workspace Settings",
      icon: "⚙️",
      shortcut: "⌘P",
      action: () => setSettingsOpen(true),
    },
    {
      id: "new",
      title: "New Conversation",
      icon: "💬",
      shortcut: "⌘N",
      action: () => startNewConversationState(),
    },
    {
      id: "connect",
      title: "Connect Google Gmail",
      icon: "🔑",
      shortcut: "⌘G",
      action: () => handleGmailConnectRedirect(),
    },
    {
      id: "logout",
      title: "Sign Out Profile",
      icon: "🚪",
      shortcut: "⌘Q",
      action: () => handleLogout(),
    },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === "Escape" && commandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [commandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setFilter("");
      setSelectedIdx(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [commandPaletteOpen]);

  const handleKeyDown = (e) => {
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[selectedIdx];
      if (cmd) {
        setCommandPaletteOpen(false);
        cmd.action();
      }
    }
  };

  useEffect(() => {
    if (resultsRef.current) {
      const activeEl = resultsRef.current.querySelector(".palette-result-item.selected");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIdx]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="command-palette-backdrop active"
      onClick={(e) => {
        if (e.target.classList.contains("command-palette-backdrop")) {
          setCommandPaletteOpen(false);
        }
      }}
    >
      <div className="command-palette-card">
        <div className="palette-search-container">
          <svg className="palette-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={inputRef}
            className="palette-search-input"
            type="text"
            placeholder="Type a command or search..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setSelectedIdx(0);
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          <span className="palette-badge">ESC to close</span>
        </div>
        <div ref={resultsRef} className="palette-results-container">
          {filtered.length === 0 ? (
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center", padding: "1.5rem 0" }}>
              No commands found
            </div>
          ) : (
            filtered.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`palette-result-item ${idx === selectedIdx ? "selected" : ""}`}
                onClick={() => {
                  setCommandPaletteOpen(false);
                  cmd.action();
                }}
              >
                <div className="palette-result-left">
                  <span className="palette-result-icon">{cmd.icon}</span>
                  <span className="palette-result-title">{cmd.title}</span>
                </div>
                <span className="palette-result-shortcut">{cmd.shortcut}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
