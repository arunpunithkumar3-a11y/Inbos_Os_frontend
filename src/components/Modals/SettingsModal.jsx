
import React, { useState, useEffect } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function SettingsModal() {
  const {
    settingsOpen,
    setSettingsOpen,
    enableToasts,
    setEnableToasts,
    setTourActive,
    setTourStep,
    showToast,
    appendConsoleLog,
  } = useWorkspace();

  const [localEnableToasts, setLocalEnableToasts] = useState(enableToasts);

  useEffect(() => {
    if (settingsOpen) {
      setLocalEnableToasts(enableToasts);
    }
  }, [settingsOpen, enableToasts]);

  if (!settingsOpen) return null;

  const handleSave = () => {
    setEnableToasts(localEnableToasts);
    localStorage.setItem("inbox_os_enable_toasts", localEnableToasts);

    setSettingsOpen(false);
    showToast("Workspace settings saved!", "success");
    appendConsoleLog("Settings updated", "success");
  };

  const handleRestartTour = () => {
    setSettingsOpen(false);
    setTourActive(true);
    setTourStep(0);
    appendConsoleLog("Guided onboarding tour restarted by user.", "info");
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("settings-backdrop")) {
      setSettingsOpen(false);
    }
  };

  return (
    <div className="settings-backdrop active" onClick={handleBackdropClick}>
      <div className="settings-card">
        <div className="settings-header">
          <h3 className="settings-title">Workspace Settings</h3>
          <button
            className="btn-icon"
            title="Close Settings"
            onClick={() => setSettingsOpen(false)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="settings-body">
          <div className="settings-section">
            <h4 class="settings-section-title">Interface Preferences</h4>
            <p class="settings-section-desc">Tailor your workspace appearance and interactive elements.</p>
            <div className="settings-toggle-group">
              <div className="toggle-info">
                <span className="toggle-title">Enable Floating Toasts</span>
                <span className="toggle-desc">Show micro-notifications for workspace events.</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={localEnableToasts}
                  onChange={(e) => setLocalEnableToasts(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-section border-top" style={{ marginTop: "1.5rem", paddingTop: "1.5rem" }}>
            <h4 className="settings-section-title">Help & Onboarding</h4>
            <p className="settings-section-desc">Need assistance or want to review the workspace features?</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
              <span className="toggle-title" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                Interactive Guided Tour
              </span>
              <button
                className="btn btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}
                onClick={handleRestartTour}
              >
                Restart Tutorial
              </button>
            </div>
          </div>


        </div>
        <div className="settings-footer">
          <button className="btn btn-primary" onClick={handleSave}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
