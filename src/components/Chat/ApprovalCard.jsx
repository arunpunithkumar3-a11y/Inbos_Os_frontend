
import React, { useState } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";

export default function ApprovalCard({ message }) {
  const { handleApprovalChoice } = useWorkspace();
  const { id: approvalId, interruptVal, status } = message;
  const [isProcessing, setIsProcessing] = useState(null); 

  console.log("[HITL DEBUG] ApprovalCard rendering. Message:", message);

  if (!interruptVal) {
    console.warn("[HITL DEBUG] interruptVal is null/falsy");
    return null;
  }

  let parsedVal = interruptVal;
  if (typeof interruptVal === "string") {
    try {
      parsedVal = JSON.parse(interruptVal);
      console.log("[HITL DEBUG] Parsed string interruptVal successfully:", parsedVal);
    } catch (e) {
      console.error("[HITL DEBUG] Failed to parse string interruptVal:", e);
      return null;
    }
  }

  if (!parsedVal || parsedVal.type !== "tool_approval") {
    console.warn("[HITL DEBUG] parsedVal is null or type is not 'tool_approval':", parsedVal);
    return null;
  }

  const toolCalls = parsedVal.tool_calls || [];

  const handleChoice = async (approved) => {
    console.log("[HITL DEBUG] handleChoice clicked. Approved:", approved, "ApprovalID:", approvalId);
    setIsProcessing(approved ? "approve" : "reject");
    try {
      await handleApprovalChoice(approvalId, approved);
    } catch (err) {
      console.error("[HITL DEBUG] handleChoice error:", err);
    } finally {
      setIsProcessing(null);
    }
  };

  const getStatusText = () => {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending Approval";
  };

  const renderToolCalls = () => {
    return toolCalls.map((call, idx) => {
      const toolName = call.tool || "";
      let baseToolName = toolName;
      if (baseToolName.includes("__")) {
        baseToolName = baseToolName.split("__").pop();
      }
      const args = call.args || {};
      let argsHtml = [];

      if (baseToolName === "send_email" || baseToolName === "reply_to_email" || baseToolName === "create_draft") {
        const to = args.to || args.recipient || "N/A";
        const subject = args.subject || "N/A";
        let body = args.body || args.content || "";
        if (typeof body !== "string") {
          body = typeof body === "object" ? JSON.stringify(body) : String(body);
        }

        argsHtml.push(
          <div key="to" className="hitl-arg-row">
            <span className="hitl-arg-label">Recipient:</span>
            <span className="hitl-arg-value" style={{ fontFamily: "monospace", color: "var(--accent-blue)" }}>
              {to}
            </span>
          </div>,
          <div key="subject" className="hitl-arg-row">
            <span className="hitl-arg-label">Subject:</span>
            <span className="hitl-arg-value" style={{ fontWeight: 600 }}>
              {subject}
            </span>
          </div>
        );

        if (args.cc) {
          argsHtml.push(
            <div key="cc" className="hitl-arg-row">
              <span className="hitl-arg-label">Cc:</span>
              <span className="hitl-arg-value" style={{ fontFamily: "monospace" }}>{args.cc}</span>
            </div>
          );
        }

        if (args.bcc) {
          argsHtml.push(
            <div key="bcc" className="hitl-arg-row">
              <span className="hitl-arg-label">Bcc:</span>
              <span className="hitl-arg-value" style={{ fontFamily: "monospace" }}>{args.bcc}</span>
            </div>
          );
        }

        if (body) {
          argsHtml.push(
            <div key="body" className="hitl-arg-row">
              <span className="hitl-arg-label">Message Body:</span>
              <div
                className="hitl-arg-value-scroll"
                dangerouslySetInnerHTML={{ __html: body.replace(/\n/g, "<br>") }}
              />
            </div>
          );
        }
      } else if (baseToolName === "trash_email" || baseToolName === "archive_email" || baseToolName === "mark_as_read") {
        const messageId = args.message_id || args.email_id || "N/A";
        argsHtml.push(
          <div key="msgId" className="hitl-arg-row">
            <span className="hitl-arg-label">Email ID:</span>
            <span className="hitl-arg-value" style={{ fontFamily: "monospace", color: "var(--accent-pink)" }}>
              {messageId}
            </span>
          </div>
        );
      } else if (baseToolName === "add_label" || baseToolName === "remove_label") {
        const messageId = args.message_id || args.email_id || "N/A";
        const labelName = args.label_name || args.label_id || "N/A";
        argsHtml.push(
          <div key="msgId" className="hitl-arg-row">
            <span className="hitl-arg-label">Email ID:</span>
            <span className="hitl-arg-value" style={{ fontFamily: "monospace", color: "var(--accent-pink)" }}>
              {messageId}
            </span>
          </div>,
          <div key="label" className="hitl-arg-row">
            <span className="hitl-arg-label">Label:</span>
            <span className="hitl-arg-value" style={{ fontWeight: 600, color: "var(--accent-primary)" }}>
              {labelName}
            </span>
          </div>
        );
      } else {
        Object.entries(args).forEach(([key, val]) => {
          argsHtml.push(
            <div key={key} className="hitl-arg-row">
              <span className="hitl-arg-label">{key}:</span>
              <span className="hitl-arg-value">
                {typeof val === "object" ? JSON.stringify(val) : String(val)}
              </span>
            </div>
          );
        });
      }

      let readableToolName = baseToolName;
      if (baseToolName === "send_email") readableToolName = "Send New Email";
      else if (baseToolName === "reply_to_email") readableToolName = "Reply to Email";
      else if (baseToolName === "trash_email") readableToolName = "Move to Trash";
      else if (baseToolName === "archive_email") readableToolName = "Archive Email";
      else if (baseToolName === "mark_as_read") readableToolName = "Mark as Read";
      else if (baseToolName === "create_draft") readableToolName = "Create Email Draft";
      else if (baseToolName === "add_label") readableToolName = "Add Label to Email";
      else if (baseToolName === "remove_label") readableToolName = "Remove Label from Email";
      else if (baseToolName === "list_labels") readableToolName = "List Gmail Labels";
      else if (baseToolName === "get_email_stats") readableToolName = "Get Mailbox Telemetry";
      else if (baseToolName === "read_emails") readableToolName = "Read Emails";
      else if (baseToolName === "search_emails") readableToolName = "Search Emails";

      return (
        <div key={idx} className="hitl-tool-call">
          <span className="hitl-tool-name">{readableToolName}</span>
          <div className="hitl-args-grid" style={{ marginTop: "0.75rem" }}>
            {argsHtml}
          </div>
        </div>
      );
    });
  };

  const getCardClass = () => {
    if (status === "approved") return "hitl-approval-card glass-panel resolved-approved";
    if (status === "rejected") return "hitl-approval-card glass-panel resolved-rejected";
    return "hitl-approval-card glass-panel";
  };

  return (
    <div className="message-row agent">
      <div className="message-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ display: "block" }}>
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <path d="M22 6l-10 7L2 6"></path>
        </svg>
      </div>

      <div className={getCardClass()}>
        <div className="hitl-header">
          <div className="hitl-header-left">
            <div className="hitl-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <span className="hitl-title">Action Gateway Approval</span>
          </div>
          <span className="hitl-status-pill">{getStatusText()}</span>
        </div>

        <div className="hitl-body">
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "0.5rem", lineHeight: 1.4 }}>
            The AI agent requires your explicit confirmation before calling this skill:
          </p>
          {renderToolCalls()}
        </div>

        <div className="hitl-actions">
          {status === "pending" ? (
            <>
              <button
                className="btn btn-secondary btn-hitl-reject"
                disabled={isProcessing !== null}
                onClick={() => handleChoice(false)}
              >
                {isProcessing === "reject" ? (
                  <>
                    <span className="spinner" style={{ width: "12px", height: "12px", marginRight: "6px", borderWidth: "1.5px" }}></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Reject & Cancel
                  </>
                )}
              </button>
              <button
                className="btn btn-primary btn-hitl-approve"
                disabled={isProcessing !== null}
                onClick={() => handleChoice(true)}
              >
                {isProcessing === "approve" ? (
                  <>
                    <span className="spinner" style={{ width: "12px", height: "12px", marginRight: "6px", borderWidth: "1.5px" }}></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Approve & Execute
                  </>
                )}
              </button>
            </>
          ) : status === "approved" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-green)", fontSize: "0.8125rem", fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Action Approved & Executed
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ef4444", fontSize: "0.8125rem", fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Action Rejected & Cancelled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
