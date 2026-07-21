import React from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function TermsModal() {
  const { termsModalOpen, setTermsModalOpen } = useWorkspace();

  if (!termsModalOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("settings-backdrop")) {
      setTermsModalOpen(false);
    }
  };

  return (
    <div className="settings-backdrop active" onClick={handleBackdropClick}>
      <div className="settings-card legal-modal-card">
        <div className="settings-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img src="/logo.png" alt="Inbox OS Logo" className="modal-header-logo" />
            <div>
              <h3 className="settings-title">Terms and Conditions</h3>
              <p className="legal-subtitle">Inbox OS • Effective Date: July 20, 2026</p>
            </div>
          </div>
          <button
            className="btn-icon"
            title="Close Terms and Conditions"
            onClick={() => setTermsModalOpen(false)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-body legal-modal-body">
          <section className="legal-section">
            <h4>1. Acceptance</h4>
            <p>
              By using Inbox OS, you agree to these Terms and Conditions.
            </p>
          </section>

          <section className="legal-section">
            <h4>2. Service Description</h4>
            <p>
              Inbox OS is an AI-powered assistant that helps users interact with their Gmail accounts by reading, drafting, replying to, sending, and organizing emails after receiving user authorization.
            </p>
          </section>

          <section className="legal-section">
            <h4>3. User Responsibilities</h4>
            <p>You agree to:</p>
            <ul>
              <li>Use Inbox OS only for lawful purposes.</li>
              <li>Maintain the security of your Google account.</li>
              <li>Not misuse the service or attempt unauthorized access.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h4>4. Google Account Authorization</h4>
            <p>
              Inbox OS requires authorization through Google's OAuth system. You may revoke access at any time through your Google Account settings.
            </p>
          </section>

          <section className="legal-section">
            <h4>5. Availability</h4>
            <p>
              We strive to keep Inbox OS available but do not guarantee uninterrupted or error-free service.
            </p>
          </section>

          <section className="legal-section">
            <h4>6. Limitation of Liability</h4>
            <p>
              Inbox OS is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages resulting from the use of the service.
            </p>
          </section>

          <section className="legal-section">
            <h4>7. Privacy</h4>
            <p>
              Your use of Inbox OS is also governed by our Privacy Policy.
            </p>
          </section>

          <section className="legal-section">
            <h4>8. Termination</h4>
            <p>
              We reserve the right to suspend or terminate access if these Terms are violated.
            </p>
          </section>

          <section className="legal-section">
            <h4>9. Changes</h4>
            <p>
              We may modify these Terms from time to time. Continued use of the service constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="legal-section">
            <h4>10. Contact</h4>
            <p>
              For questions regarding these Terms, please contact:
              <br />
              <strong>Email:</strong> <a href="mailto:inboxosai@gmail.com" className="legal-link">inboxosai@gmail.com</a>
            </p>
          </section>
        </div>

        <div className="settings-footer" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={() => setTermsModalOpen(false)}>
            Close Terms
          </button>
        </div>
      </div>
    </div>
  );
}
