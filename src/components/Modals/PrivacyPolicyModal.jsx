import React from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function PrivacyPolicyModal() {
  const { privacyModalOpen, setPrivacyModalOpen } = useWorkspace();

  if (!privacyModalOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("settings-backdrop")) {
      setPrivacyModalOpen(false);
    }
  };

  return (
    <div className="settings-backdrop active" onClick={handleBackdropClick}>
      <div className="settings-card legal-modal-card">
        <div className="settings-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img src="/logo.png" alt="Inbox OS Logo" className="modal-header-logo" />
            <div>
              <h3 className="settings-title">Privacy Policy</h3>
              <p className="legal-subtitle">Inbox OS • Effective Date: July 20, 2026</p>
            </div>
          </div>
          <button
            className="btn-icon"
            title="Close Privacy Policy"
            onClick={() => setPrivacyModalOpen(false)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-body legal-modal-body">
          <section className="legal-section">
            <h4>1. Introduction</h4>
            <p>
              Inbox OS is an AI-powered email assistant designed to help users manage their Gmail accounts efficiently.
              This Privacy Policy explains what information we collect, how we use it, and how we protect it.
            </p>
          </section>

          <section className="legal-section">
            <h4>2. Information We Access</h4>
            <p>When you sign in with your Google account, Inbox OS may request access to:</p>
            <ul>
              <li>Basic profile information (name and email address)</li>
              <li>Gmail account data required to provide requested features, including reading, sending, replying to, drafting, and organizing emails</li>
            </ul>
            <p className="legal-note">
              Inbox OS only accesses the data necessary to perform actions explicitly requested by the user.
            </p>
          </section>

          <section className="legal-section">
            <h4>3. How We Use Your Information</h4>
            <p>Your information is used solely to:</p>
            <ul>
              <li>Authenticate your Google account</li>
              <li>Read and manage your emails based on your instructions</li>
              <li>Send or draft emails on your behalf</li>
              <li>Improve the reliability and functionality of the application</li>
            </ul>
            <p className="legal-highlight">
              We do not use your Gmail data for advertising or profiling.
            </p>
          </section>

          <section className="legal-section">
            <h4>4. Data Storage</h4>
            <p>
              OAuth access tokens are stored securely and are used only to provide the requested functionality. We implement reasonable security measures to protect user data.
            </p>
          </section>

          <section className="legal-section">
            <h4>5. Data Sharing</h4>
            <p>
              Inbox OS does not sell, rent, or share your personal information or Gmail data with third parties, except when required by law.
            </p>
          </section>

          <section className="legal-section">
            <h4>6. Data Retention</h4>
            <p>
              We retain only the information necessary to operate the service. Users may revoke Inbox OS's access at any time through their Google Account permissions.
            </p>
          </section>

          <section className="legal-section">
            <h4>7. Your Rights</h4>
            <p>You may:</p>
            <ul>
              <li>Revoke Google account access at any time.</li>
              <li>Request deletion of your stored data by contacting us.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h4>8. Contact</h4>
            <p>
              If you have any questions regarding this Privacy Policy, please contact:
              <br />
              <strong>Email:</strong> <a href="mailto:inboxosai@gmail.com" className="legal-link">inboxosai@gmail.com</a>
            </p>
          </section>

          <section className="legal-section">
            <h4>9. Changes to This Policy</h4>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be published on this page with an updated effective date.
            </p>
          </section>
        </div>

        <div className="settings-footer" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={() => setPrivacyModalOpen(false)}>
            Close Policy
          </button>
        </div>
      </div>
    </div>
  );
}
