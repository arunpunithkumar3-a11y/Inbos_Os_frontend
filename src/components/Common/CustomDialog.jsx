
import React, { useEffect, useRef } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function CustomDialog() {
  const { dialogConfig } = useWorkspace();
  const confirmBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!dialogConfig) return;

    if (dialogConfig.variant === "danger") {
      if (cancelBtnRef.current) cancelBtnRef.current.focus();
    } else {
      if (confirmBtnRef.current) confirmBtnRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !dialogConfig.critical) {
        e.preventDefault();
        dialogConfig.resolve(false);
      } else if (e.key === "Enter") {
        if (document.activeElement === cancelBtnRef.current) {
          dialogConfig.resolve(false);
        } else {
          dialogConfig.resolve(true);
        }
      } else if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === cancelBtnRef.current) {
            e.preventDefault();
            if (confirmBtnRef.current) confirmBtnRef.current.focus();
          }
        } else {
          if (document.activeElement === confirmBtnRef.current) {
            e.preventDefault();
            if (cancelBtnRef.current) cancelBtnRef.current.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dialogConfig]);

  if (!dialogConfig) return null;

  const { title, description, variant, confirmText, cancelText, critical, resolve } = dialogConfig;

  let iconSvg;
  if (variant === "danger") {
    iconSvg = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    );
  } else if (variant === "warning") {
    iconSvg = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    );
  } else if (variant === "success") {
    iconSvg = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    );
  } else {

    iconSvg = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    );
  }

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("dialog-overlay") && !critical) {
      resolve(false);
    }
  };

  return (
    <div className="dialog-overlay active" onClick={handleBackdropClick}>
      <div className={`dialog-card ${variant}`}>
        <div className="dialog-icon-wrapper">{iconSvg}</div>
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-description">{description}</p>
        <div className="dialog-actions">
          <button
            ref={cancelBtnRef}
            className="dialog-btn dialog-btn-secondary"
            onClick={() => resolve(false)}
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            className="dialog-btn dialog-btn-primary"
            onClick={() => resolve(true)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
