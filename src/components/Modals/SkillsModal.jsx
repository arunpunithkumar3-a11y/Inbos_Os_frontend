
import React from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function SkillsModal() {
  const { skillsOpen, setSkillsOpen } = useWorkspace();

  if (!skillsOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("settings-backdrop")) {
      setSkillsOpen(false);
    }
  };

  return (
    <div className="settings-backdrop active" onClick={handleBackdropClick}>
      <div className="settings-card skills-card-modal">
        <div className="settings-header">
          <div style={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <div style={{ color: "var(--accent-primary)", display: "flex", marginRight: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <h3 className="settings-title">AI Capabilities & Skills</h3>
          </div>
          <button
            className="btn-icon"
            title="Close Capabilities"
            onClick={() => setSkillsOpen(false)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="settings-body" style={{ maxHeight: "58vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem", paddingRight: "4px" }}>
          <div className="settings-section">
            <h4 class="settings-section-title">Core Capabilities</h4>
            <p class="settings-section-desc">Inbox OS is equipped with standard Gmail and tool integration skillsets:</p>

            <div className="skills-grid">
              <div className="skill-card">
                <span className="skill-icon">📥</span>
                <div className="skill-details">
                  <span className="skill-name">Email Search & Ingestion</span>
                  <span className="skill-desc">Query and fetch email threads matching specific search criteria (e.g. from, subject, unread).</span>
                </div>
              </div>
              <div className="skill-card">
                <span className="skill-icon">✉️</span>
                <div className="skill-details">
                  <span className="skill-name">Secure Email Compose</span>
                  <span className="skill-desc">Compose and dispatch brand new emails directly via your Google Gmail account.</span>
                </div>
              </div>
              <div className="skill-card">
                <span className="skill-icon">✍️</span>
                <div className="skill-details">
                  <span className="skill-name">Threaded Reply Routing</span>
                  <span className="skill-desc">Draft and send replies directly chained to an ongoing email thread ID safely.</span>
                </div>
              </div>
              <div className="skill-card">
                <span className="skill-icon">📖</span>
                <div className="skill-details">
                  <span className="skill-name">Unread/Read Reciprocation</span>
                  <span className="skill-desc">Update read/unread read receipts and message statuses inside your inbox.</span>
                </div>
              </div>
              <div className="skill-card">
                <span className="skill-icon">🧹</span>
                <div className="skill-details">
                  <span className="skill-name">Inbox Organization & Clean Up</span>
                  <span className="skill-desc">Clean up your primary inbox by archiving threads or moving items to trash.</span>
                </div>
              </div>
              <div className="skill-card">
                <span className="skill-icon">🏷️</span>
                <div className="skill-details">
                  <span className="skill-name">Custom Labels & Folder Organization</span>
                  <span className="skill-desc">Attach or remove custom tags and folders to categorize specific threads.</span>
                </div>
              </div>
              <div className="skill-card">
                <span className="skill-icon">📜</span>
                <div className="skill-details">
                  <span className="skill-name">Label Hierarchy Discovery</span>
                  <span className="skill-desc">Retrieve and browse all custom organizational labels currently active in Gmail.</span>
                </div>
              </div>
              <div className="skill-card">
                <span className="skill-icon">📝</span>
                <div className="skill-details">
                  <span className="skill-name">Save Pending Drafts</span>
                  <span className="skill-desc">Draft emails and save them directly in Gmail Drafts for your final manual review.</span>
                </div>
              </div>
              <div className="skill-card">
                <span className="skill-icon">📊</span>
                <div className="skill-details">
                  <span className="skill-name">Analytical Mailbox Telemetry</span>
                  <span className="skill-desc">Analyze mailbox stats, fetch inbox counts, and view key productivity metrics.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section border-top">
            <h4 class="settings-section-title">Safety & Confidence Protocol</h4>
            <p class="settings-section-desc">Inbox OS utilizes advanced multi-agent governance to ensure safety and precision:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
              <div className="protocol-row">
                <span className="protocol-badge shield">Action Gateway</span>
                <span className="protocol-text">Any destructive actions (like sending emails, deleting, or archiving) require your explicit final approval.</span>
              </div>
              <div className="protocol-row">
                <span className="protocol-badge info">Confidence Scaling</span>
                <span className="protocol-text">Destructive actions are automatically scaled by a confidence score. If understanding is low, the system stops and requests clarification.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="settings-footer">
          <button className="btn btn-primary btn-block" onClick={() => setSkillsOpen(false)}>
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
