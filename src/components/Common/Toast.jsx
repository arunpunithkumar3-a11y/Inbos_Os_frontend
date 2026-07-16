
import React from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

function ToastCard({ toast }) {
  const { message, type } = toast;

  let iconSvg;
  if (type === "success") {
    iconSvg = (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    );
  } else if (type === "error") {
    iconSvg = (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    );
  } else if (type === "warning") {
    iconSvg = (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    );
  } else {

    iconSvg = (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    );
  }

  return (
    <div className={`toast-card ${type}`}>
      <span className="toast-icon">{iconSvg}</span>
      <span className="toast-content">{message}</span>
    </div>
  );
}

export default function Toast() {
  const { toasts } = useWorkspace();

  return (
    <div className="toast-container" id="toast-container">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
