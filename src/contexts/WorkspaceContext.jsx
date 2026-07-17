
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { apiRequest, decodeToken, API_BASE } from "../services/api";

const WorkspaceContext = createContext(null);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

export function WorkspaceProvider({ children }) {

  const [token, setToken] = useState(() => localStorage.getItem("inbox_os_token") || null);
  const [user, setUser] = useState(null);

  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState(null);

  const [threads, setThreads] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [currentThreadTitle, setCurrentThreadTitle] = useState("New Conversation");
  const [currentThreadStatus, setCurrentThreadStatus] = useState("Inbox OS is ready");
  const [messages, setMessages] = useState([]); 
  const [isThreadsLoading, setIsThreadsLoading] = useState(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const activeControllerRef = useRef(null);

  const [confidenceScore, setConfidenceScore] = useState(() => {
    const saved = localStorage.getItem("inbox_os_confidence");
    return saved !== null ? parseFloat(saved) : 1.0;
  });
  const [showTimeline, setShowTimeline] = useState(false); 
  const [enableToasts, setEnableToasts] = useState(() => {
    const saved = localStorage.getItem("inbox_os_enable_toasts");
    return saved !== null ? saved === "true" : true;
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [attachments, setAttachments] = useState([]);

  const [toasts, setToasts] = useState([]);

  const [consoleLogs, setConsoleLogs] = useState([]);

  const [dialogConfig, setDialogConfig] = useState(null);

  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        localStorage.setItem("inbox_os_token", token);
        setUser(decoded);
      } else {
        localStorage.removeItem("inbox_os_token");
        localStorage.removeItem("inbox_os_refresh_token");
        setToken(null);
        setUser(null);
        setGmailConnected(false);
        setGmailEmail(null);
        setThreads([]);
        setCurrentThreadId(null);
        setMessages([]);
      }
    } else {
      localStorage.removeItem("inbox_os_token");
      localStorage.removeItem("inbox_os_refresh_token");
      setUser(null);
      setGmailConnected(false);
      setGmailEmail(null);
      setThreads([]);
      setCurrentThreadId(null);
      setMessages([]);
    }
  }, [token]);


  const appendConsoleLog = (message, type = "info") => {
    console.log(`[Inbox OS: ${type}] > ${message}`);
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setConsoleLogs((prev) => [
      ...prev,
      { id: Math.random().toString(), time: timeStr, text: message, type },
    ]);
  };

  const showToast = (message, type = "info") => {
    if (!enableToasts) return;
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const showDialog = (options = {}) => {
    return new Promise((resolve) => {
      setDialogConfig({
        title: options.title || "Confirm Action",
        description: options.description || "Are you sure?",
        variant: options.variant || "info",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        critical: options.critical || false,
        resolve: (result) => {
          setDialogConfig(null);
          resolve(result);
        },
      });
    });
  };

  const handleAuthSuccess = (accessToken, refreshToken, isSignup = false) => {
    localStorage.setItem("inbox_os_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("inbox_os_refresh_token", refreshToken);
    }
    setToken(accessToken);
    showToast(isSignup ? "Account created successfully! Please sign in." : "Welcome back to Inbox OS!", "success");
    appendConsoleLog(isSignup ? "New profile registered." : "User authenticated successfully.", "success");
  };

  const handleAuthFailure = () => {
    setToken(null);
    setMessages([]);
  };

  const handleLogout = async () => {
    const approved = await showDialog({
      title: "Sign Out Profile",
      description: "Are you sure you want to sign out of Inbox OS? Your active session credentials will be cleared.",
      variant: "warning",
      confirmText: "Sign Out",
      cancelText: "Cancel",
    });

    if (approved) {
      setToken(null);
      showToast("Signed out of Inbox OS", "info");
      appendConsoleLog("Session terminated.", "info");
    }
  };

  const checkGmailConnection = async () => {
    const decoded = decodeToken(localStorage.getItem("inbox_os_token"));
    if (!decoded || !decoded.user_id) return;

    try {
      const data = await apiRequest(`/gmail/g/user/${decoded.user_id}`, {}, handleAuthFailure);
      if (data && data.google_email) {
        setGmailConnected(true);
        setGmailEmail(data.google_email);
        appendConsoleLog(`Gmail integration active for ${data.google_email}.`, "success");
      }
    } catch {
      setGmailConnected(false);
      setGmailEmail(null);
      appendConsoleLog("Gmail integration inactive.", "warning");
    }
  };

  const handleGmailConnectRedirect = () => {
    const currentToken = localStorage.getItem("inbox_os_token");
    if (!currentToken) return;
    window.location.href = `${API_BASE}/gmail/g/login?token=${currentToken}&redirect_uri=${encodeURIComponent(window.location.href)}`;
  };

  const loadThreads = async () => {
    const currentToken = localStorage.getItem("inbox_os_token");
    if (!currentToken) return;

    setIsThreadsLoading(true);
    try {
      const data = await apiRequest("/ai/thread", {}, handleAuthFailure);
      setThreads(data || []);
    } catch (err) {
      console.error("Failed to load thread history list:", err);
    } finally {
      setIsThreadsLoading(false);
    }
  };

  const startNewConversationState = () => {
    if (isStreaming && activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    setCurrentThreadId(null);
    setIsStreaming(false);
    setCurrentThreadTitle("New Conversation");
    setCurrentThreadStatus("Inbox OS is ready");
    setMessages([]);
    setAttachments([]);
    appendConsoleLog("New conversation session active.", "info");
  };

  const switchThread = async (threadId, optionalTitle = "") => {
    if (isStreaming && activeControllerRef.current) {
      activeControllerRef.current.abort();
    }

    setCurrentThreadId(threadId);
    setIsStreaming(false);
    setCurrentThreadTitle(optionalTitle || "Loading...");
    setCurrentThreadStatus("Fetching conversation history...");
    setMessages([]);

    try {
      const messagesData = await apiRequest(`/ai/chats/${threadId}`, {}, handleAuthFailure);

      const mappedMessages = [];
      messagesData.forEach((msg) => {
        mappedMessages.push({
          id: Math.random().toString(),
          type: msg.role === "user" ? "user" : "agent",
          content: msg.content,
        });
      });
      setMessages(mappedMessages);

      setCurrentThreadTitle(
        optionalTitle ||
        (messagesData.length > 0
          ? messagesData[0].content.substring(0, 30) + "..."
          : "Conversation")
      );
      setCurrentThreadStatus(`Conversation history loaded (${messagesData.length} messages)`);
      appendConsoleLog(`Conversation loaded: "${optionalTitle || "Thread"}"`, "info");
    } catch (err) {
      setCurrentThreadTitle("Error Loading");
      setCurrentThreadStatus("Workspace error");
      showToast(`Failed to load chats: ${err.message}`, "error");
    }
  };

  const handleDeleteThread = async (threadId, title) => {
    const approved = await showDialog({
      title: "Delete Conversation",
      description: `Are you sure you want to delete the conversation "${title}"? All chat history in this thread will be permanently deleted.`,
      variant: "danger",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!approved) return;

    try {
      await apiRequest(`/ai/thread/${threadId}`, { method: "DELETE" }, handleAuthFailure);
      showToast("Conversation deleted successfully", "success");
      appendConsoleLog(`Thread "${title}" deleted.`, "success");

      if (currentThreadId === threadId) {
        startNewConversationState();
      }
      loadThreads();
    } catch (err) {
      showToast(`Failed to delete thread: ${err.message}`, "error");
      appendConsoleLog(`Failed to delete thread: ${err.message}`, "error");
    }
  };

  const checkOnboardingStatus = async () => {
    const decoded = decodeToken(localStorage.getItem("inbox_os_token"));
    if (!decoded || !decoded.email) return;

    try {
      const completed = localStorage.getItem(`inbox_os_onboarding_completed_${decoded.email}`);
      if (completed !== "true") {
        setTimeout(() => {
          setTourActive(true);
          setTourStep(0);
        }, 800);
      }
    } catch (err) {
      console.error("Failed to fetch onboarding status:", err);
    }
  };

  const saveOnboardingCompletion = () => {
    const decoded = decodeToken(localStorage.getItem("inbox_os_token"));
    if (!decoded || !decoded.email) return;
    try {
      localStorage.setItem(`inbox_os_onboarding_completed_${decoded.email}`, "true");
    } catch (err) {
      console.error("Failed to save onboarding completion state:", err);
    }
  };

  useEffect(() => {
    if (token) {
      checkGmailConnection();
      loadThreads();
      checkOnboardingStatus();
    }
  }, [token]);

  const processSSEStream = async (response, reasoningId, updateCallback, nextApprovalCallback) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let streamStopped = false;
    let lastToolBlockId = null;

    const nodeNames = {
      memory: "Retrieving workspace context...",
      router: "Evaluating workflow pipeline...",
      planner: "Structuring execution roadmap...",
      ex: "Synthesizing details...",
      tool: "Executing integrated skills...",
      val: "Verifying facts & formatting...",
      direct: "Authoring direct response...",
      approval_gate: "Securing safety gateway clearance...",
    };

    const toolNames = {
      send_email: "Drafting email response...",
      reply_to_email: "Replying to thread...",
      trash_email: "Moving email to trash...",
      archive_email: "Archiving thread...",
    };

    const updateReasoningStep = (updates) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.type === "reasoning" && msg.id === reasoningId) {
            return { ...msg, ...updates };
          }
          return msg;
        })
      );
    };

    const processLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) return;

      const jsonStr = trimmed.substring(6);
      try {
        const event = JSON.parse(jsonStr);

        if (event.type === "node_start") {
          const friendlyText = nodeNames[event.node];
          if (friendlyText) {
            appendConsoleLog(`Node transition: ${event.node}`, "info");
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.type === "reasoning" && msg.id === reasoningId) {
                  const updatedSteps = msg.steps.map((s) =>
                    s.status === "active" ? { ...s, status: "completed" } : s
                  );
                  return {
                    ...msg,
                    steps: [...updatedSteps, { text: friendlyText, status: "active" }],
                  };
                }
                return msg;
              })
            );
          }
        } else if (event.type === "tool_start") {
          let readableTool = event.tool;
          if (readableTool.includes("__")) {
            readableTool = readableTool.split("__").pop();
          }

          const friendlyText = toolNames[readableTool] || `Running Gmail ${readableTool} skill...`;
          appendConsoleLog(`Calling tool: ${readableTool}`, "info");

          const toolBlockId = "tool-card-" + Math.random().toString(36).substring(2, 9);
          lastToolBlockId = toolBlockId;

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.type === "reasoning" && msg.id === reasoningId) {
                const updatedSteps = msg.steps.map((s) =>
                  s.status === "active" ? { ...s, status: "completed" } : s
                );
                return {
                  ...msg,
                  steps: [...updatedSteps, { text: friendlyText, status: "active" }],
                  tools: [
                    ...msg.tools,
                    { id: toolBlockId, name: readableTool, output: "Executing tool ...", expanded: false },
                  ],
                };
              }
              return msg;
            })
          );
        } else if (event.type === "tool_end") {
          let readableTool = event.tool;
          if (readableTool.includes("__")) {
            readableTool = readableTool.split("__").pop();
          }
          appendConsoleLog(`Tool completed: ${readableTool}`, "success");

          let cleanOutput = event.output;
          try {
            const parsed = JSON.parse(event.output);
            cleanOutput = JSON.stringify(parsed, null, 2);
          } catch {
            cleanOutput = event.output;
          }

          const currentToolId = lastToolBlockId;
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.type === "reasoning" && msg.id === reasoningId) {
                return {
                  ...msg,
                  tools: msg.tools.map((t) => (t.id === currentToolId ? { ...t, output: cleanOutput } : t)),
                };
              }
              return msg;
            })
          );
        } else if (event.type === "token") {

          updateReasoningStep({ status: "completed" });
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.type === "reasoning" && msg.id === reasoningId) {
                return {
                  ...msg,
                  steps: msg.steps.map((s) => ({ ...s, status: "completed" })),
                };
              }
              return msg;
            })
          );

          setMessages((prev) => {
            const agentIdx = prev.findIndex((m) => m.type === "agent" && m.reasoningId === reasoningId);
            if (agentIdx === -1) {
              return [
                ...prev,
                {
                  id: Math.random().toString(),
                  type: "agent",
                  content: event.content,
                  isStreaming: true,
                  reasoningId: reasoningId,
                },
              ];
            } else {
              return prev.map((m, idx) =>
                idx === agentIdx ? { ...m, content: m.content + event.content } : m
              );
            }
          });
        } else if (event.type === "interrupt") {
          streamStopped = true;
          showToast("Action approval required", "warning");
          appendConsoleLog("Agent requires action validation.", "warning");

          updateReasoningStep({ status: "gateway" });

          setMessages((prev) => [
            ...prev,
            {
              id: "approval-" + Math.random().toString(36).substring(2, 11),
              type: "approval",
              interruptVal: event.value,
              status: "pending",
              reasoningId: reasoningId,
            },
          ]);

          if (nextApprovalCallback) {
            nextApprovalCallback(event.value);
          }
        } else if (event.type === "error") {
          streamStopped = true;
          updateReasoningStep({ status: "failed" });
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              type: "agent",
              content: "An error occurred. Please try again later.",
              isStreaming: false,
            },
          ]);
          setIsStreaming(false);
          setCurrentThreadStatus("Execution failed");
        }
      } catch (e) {
        console.error("Error parsing SSE line:", e, trimmed);
      }
    };

    try {
      while (!streamStopped) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer.trim()) {
            const lines = buffer.split("\n");
            for (const line of lines) {
              if (streamStopped) break;
              processLine(line);
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); 

        for (const line of lines) {
          if (streamStopped) break;
          processLine(line);
        }
      }

      if (!streamStopped) {

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.type === "reasoning" && msg.id === reasoningId) {
              return {
                ...msg,
                status: "completed",
                steps: msg.steps.map((s) => ({ ...s, status: "completed" })),
              };
            }
            if (msg.type === "agent" && msg.reasoningId === reasoningId) {
              return { ...msg, isStreaming: false };
            }
            return msg;
          })
        );

        setIsStreaming(false);
        setCurrentThreadStatus("Response complete");
        showToast("Response completed successfully!", "success");
        appendConsoleLog("Agent task finished.", "success");
      }
    } catch (err) {
      console.error("Stream processing error:", err);
      throw err;
    }
  };

  const sendMessage = async (text) => {
    const currentToken = localStorage.getItem("inbox_os_token");
    if (!currentToken || !text || isStreaming) return;

    if (!gmailConnected) {
      showToast("Please connect your Gmail account first to use this AI agent!", "warning");
      appendConsoleLog("Gmail connection missing on prompt dispatch.", "warning");
      return;
    }

    const query = text.trim();
    setIsStreaming(true);

    let fullQuery = query;
    let attachmentDisplay = "";
    if (attachments.length > 0) {
      const filesList = attachments.map((att) => `${att.name} (${att.size})`).join(", ");
      fullQuery = `[Workspace Attached Files: ${filesList}]\n\n${query}`;
      attachmentDisplay = `\n\n*📎 Attached: ${filesList}*`;
    }

    const userMsgId = Math.random().toString();
    setMessages((prev) => [...prev, { id: userMsgId, type: "user", content: query + attachmentDisplay }]);
    setAttachments([]); 

    appendConsoleLog(`User prompt dispatched: "${query.substring(0, 30)}..."`, "info");

    const reasoningId = "reasoning-" + Math.random().toString(36).substring(2, 11);

    setMessages((prev) => [
      ...prev,
      {
        id: reasoningId,
        type: "reasoning",
        status: "thinking",
        steps: [{ text: "Contextualizing conversation workspace...", status: "active" }],
        tools: [],
      },
    ]);

    activeControllerRef.current = new AbortController();
    const signal = activeControllerRef.current.signal;

    try {
      setCurrentThreadStatus("AI Agent thinking...");

      let response = await fetch(`${API_BASE}/ai/agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          data: {
            query: fullQuery,
            thread_id: currentThreadId,
          },
          state: {
            confidence_score: confidenceScore,
          },
        }),
        signal: signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Server error (${response.status})`);
      }

      const headerThreadId = response.headers.get("x-thread-id");
      const isNewThread = currentThreadId === null;
      if (headerThreadId) {
        setCurrentThreadId(headerThreadId);
      }

      if (isNewThread) {
        setCurrentThreadTitle(query.length > 30 ? query.substring(0, 30) + "..." : query);
      }
      setCurrentThreadStatus("Streaming answers...");
      appendConsoleLog("Agent reasoning stream initialized.", "info");

      await processSSEStream(response, reasoningId, null, null);

      if (isNewThread) {
        loadThreads();
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Stream aborted");
        return;
      }
      showToast("An error occurred. Please try again later.", "error");
      appendConsoleLog(`Agent execution error: ${err.message}`, "error");

      setMessages((prev) =>
        prev.map((m) => (m.id === reasoningId ? { ...m, status: "failed" } : m))
      );
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          type: "agent",
          content: "An error occurred. Please try again later.",
        },
      ]);
      setIsStreaming(false);
      setCurrentThreadStatus("Streaming failed");
    }
  };

  const handleApprovalChoice = async (approvalId, approved) => {
    const currentToken = localStorage.getItem("inbox_os_token");
    if (!currentToken) return;

    setMessages((prev) =>
      prev.map((msg) => (msg.id === approvalId ? { ...msg, status: approved ? "approved" : "rejected" } : msg))
    );

    setIsStreaming(true);
    showToast("Action approval sent!", "info");
    appendConsoleLog("Action gateway confirmation submitted.", "info");

    const reasoningId = "reasoning-" + Math.random().toString(36).substring(2, 11);
    setMessages((prev) => [
      ...prev,
      {
        id: reasoningId,
        type: "reasoning",
        status: "thinking",
        steps: [{ text: "Resuming agent execution node...", status: "active" }],
        tools: [],
      },
    ]);

    try {
      const res = await fetch(`${API_BASE}/ai/resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          thread_id: currentThreadId,
          resume_data: { approved: approved },
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to resume: ${res.statusText}`);
      }

      await processSSEStream(res, reasoningId, null, null);
    } catch (err) {
      showToast("An error occurred. Please try again later.", "error");
      appendConsoleLog(`Resume request failed: ${err.message}`, "error");
      setMessages((prev) =>
        prev.map((m) => (m.id === reasoningId ? { ...m, status: "failed" } : m))
      );
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          type: "agent",
          content: "An error occurred. Please try again later.",
        },
      ]);
      setIsStreaming(false);
    }
  };

  const wakeUpMCPServer = () => {
    const mcpUrl = "https://ai-gmail-mcp-server-11.onrender.com/mcp";
    console.log(`Waking up MCP server at: ${mcpUrl}`);
    fetch(mcpUrl, {
      method: "GET",
      mode: "no-cors",
      cache: "no-cache",
    })
      .then(() => {
        console.log("MCP server pinged for wake up.");
      })
      .catch((err) => {
        console.warn("MCP server ping returned/failed (expected if CORS restricted):", err);
      });
  };

  useEffect(() => {
    wakeUpMCPServer();
  }, []);

  const addAttachment = (file) => {
    const id = "attach-" + Math.random().toString(36).substring(2, 9);
    const formatBytes = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    setAttachments((prev) => [
      ...prev,
      {
        id,
        file,
        name: file.name,
        size: formatBytes(file.size),
      },
    ]);
    showToast("File attached successfully!", "success");
    appendConsoleLog(`File "${file.name}" attached.`, "info");
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
    appendConsoleLog("Attachment removed.", "info");
  };

  const skipTour = () => {
    setTourActive(false);
    saveOnboardingCompletion();
    showToast("Tour skipped. Welcome to Inbox OS!", "success");
    appendConsoleLog("Guided onboarding tour skipped by user.", "info");
  };

  const finishTour = () => {
    setTourActive(false);
    saveOnboardingCompletion();
    showToast("Workspace guide completed! Enjoy Inbox OS.", "success");
    appendConsoleLog("Guided onboarding tour finished successfully.", "success");
  };

  const nextTourStep = () => {
    setTourStep((prev) => prev + 1);
  };

  const prevTourStep = () => {
    setTourStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <WorkspaceContext.Provider
      value={{
        token,
        setToken,
        user,
        gmailConnected,
        gmailEmail,
        checkGmailConnection,
        handleGmailConnectRedirect,
        threads,
        currentThreadId,
        currentThreadTitle,
        currentThreadStatus,
        messages,
        isThreadsLoading,
        loadThreads,
        switchThread,
        handleDeleteThread,
        startNewConversationState,
        sendMessage,
        handleApprovalChoice,
        isStreaming,

        confidenceScore,
        setConfidenceScore,
        showTimeline,
        setShowTimeline,
        enableToasts,
        setEnableToasts,

        settingsOpen,
        setSettingsOpen,
        skillsOpen,
        setSkillsOpen,
        commandPaletteOpen,
        setCommandPaletteOpen,
        sidebarOpen,
        setSidebarOpen,

        attachments,
        addAttachment,
        removeAttachment,

        toasts,
        showToast,

        consoleLogs,
        appendConsoleLog,

        dialogConfig,
        showDialog,

        tourActive,
        setTourActive,
        tourStep,
        setTourStep,
        skipTour,
        finishTour,
        nextTourStep,
        prevTourStep,
        handleAuthSuccess,
        handleAuthFailure,
        handleLogout,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
