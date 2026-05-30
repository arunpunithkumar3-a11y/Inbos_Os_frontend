/* ==========================================================================
   INBOX OS HIGH-PERFORMANCE APPLICATION LOGIC
   Architecture: Pure ES6+ Single-Page Application (SPA)
   Built by BROKEN CODE
   ========================================================================== */

(function () {
    'use strict';

    // ── CONFIGURATION & STATE ──
    // Automatically detect backend port.
    // If the frontend is loaded from the backend itself (port 8000 OR if on a production server), use relative paths (origin).
    // Otherwise (e.g. running standalone or via file:// protocol), point to the deployed Render URL.
    const API_BASE = (window.location.hostname === 'inbox-os-ai.onrender.com' || window.location.port === '8000')
        ? window.location.origin
        : 'https://inbox-os-ai.onrender.com';


    const state = {
        token: localStorage.getItem('inbox_os_token') || null,
        user: null, // Decoded payload: { email, user_id }
        gmailConnected: false,
        gmailEmail: null,
        threads: [],
        currentThreadId: null,
        isStreaming: false,
        activeController: null,
        
        // Developer settings and states
        confidenceScore: 1.0,
        showTimeline: false,
        enableToasts: true,
        attachments: [] // List of { file, name, size, id }
    };

    // ── DOM ELEMENTS ──
    const authScreen = document.getElementById('auth-screen');
    const appWorkspace = document.getElementById('app-workspace');
    
    // Auth Forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toggleToSignup = document.getElementById('toggle-to-signup');
    const toggleToLogin = document.getElementById('toggle-to-login');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    
    // Sidebar Elements
    const threadList = document.getElementById('thread-list');
    const btnNewThread = document.getElementById('btn-new-thread');
    const btnConnectGmail = document.getElementById('btn-connect-gmail');
    const gmailDot = document.getElementById('gmail-dot');
    const gmailEmailText = document.getElementById('gmail-email');
    const userAvatar = document.getElementById('user-avatar');
    const userDisplayName = document.getElementById('user-display-name');
    const userEmailAddress = document.getElementById('user-email-address');
    const btnLogout = document.getElementById('btn-logout');
    const btnOpenTour = document.getElementById('btn-open-tour');
    const btnSettingsRestartTour = document.getElementById('btn-settings-restart-tour');
    
    // Workspace Header Elements
    const activeThreadTitle = document.getElementById('active-thread-title');
    const activeThreadStatus = document.getElementById('active-thread-status');
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const btnCloseSidebar = document.getElementById('btn-close-sidebar');
    const appSidebar = document.querySelector('.app-sidebar');
    
    // Chat Area Elements
    const chatViewport = document.getElementById('chat-messages');
    const welcomeState = document.getElementById('welcome-state');
    const gmailAlertBox = document.getElementById('gmail-alert-box');
    const messageFlow = document.getElementById('message-flow');
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    
    // Input Bar Elements
    const chatInput = document.getElementById('chat-input');
    const btnSendMessage = document.getElementById('btn-send-message');

    // Developer Settings Elements
    const settingsModal = document.getElementById('settings-modal');
    const btnOpenSettings = document.getElementById('btn-open-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const btnSaveSettings = document.getElementById('btn-save-settings');
    const settingsConfidenceInput = document.getElementById('settings-confidence-input');
    const confidenceValue = document.getElementById('confidence-value');
    const settingsToggleTimeline = document.getElementById('settings-toggle-timeline');
    const settingsToggleToasts = document.getElementById('settings-toggle-toasts');
    const utilityPanel = document.querySelector('.utility-panel');
    const btnToggleUtility = document.getElementById('btn-toggle-utility');
    
    // AI Skills Modal Elements
    const skillsModal = document.getElementById('skills-modal');
    const btnOpenSkills = document.getElementById('btn-open-skills');
    const btnViewCapabilities = document.getElementById('btn-view-capabilities');
    const btnCloseSkills = document.getElementById('btn-close-skills');
    const btnCloseSkillsFooter = document.getElementById('btn-close-skills-footer');
    
    // Input Attachment Elements
    const btnAttachFile = document.getElementById('btn-attach-file');
    const fileAttachmentInput = document.getElementById('file-attachment');
    const attachmentChips = document.getElementById('attachment-chips');

    // ── BULLETPROOF API CLIENT WRAPPER ──
    async function apiRequest(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
        
        // Setup options
        if (!options.headers) options.headers = {};
        if (state.token && !options.headers['Authorization']) {
            options.headers['Authorization'] = `Bearer ${state.token}`;
        }
        
        try {
            const res = await fetch(url, options);
            const contentType = res.headers.get('content-type');
            let data = null;
            let text = '';
            
            // Check if JSON response exists to parse safely
            if (contentType && contentType.includes('application/json')) {
                text = await res.text();
                if (text && text.trim().length > 0) {
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        console.error('Failed to parse response JSON despite content-type header:', e);
                        throw new Error('Malformed JSON response from server');
                    }
                }
            } else {
                text = await res.text();
            }
            
            if (!res.ok) {
                // Automatically clear local session and redirect if token is expired/revoked
                if (res.status === 401) {
                    if (!options._isRetry) {
                        const refreshed = await refreshAccessToken();
                        if (refreshed) {
                            options._isRetry = true;
                            options.headers['Authorization'] = `Bearer ${state.token}`;
                            return await apiRequest(endpoint, options);
                        }
                    }

                    console.warn("Authentication session expired (401). Signing out...");
                    localStorage.removeItem('inbox_os_token');
                    localStorage.removeItem('inbox_os_refresh_token');
                    state.token = null;
                    state.user = null;
                    setTimeout(() => {
                        renderScreenState();
                    }, 0);
                }

                let errorMsg = 'Request failed';
                
                if (data) {
                    if (data.detail) {
                        if (typeof data.detail === 'string') {
                            errorMsg = data.detail;
                        } else if (typeof data.detail === 'object') {
                            if (Array.isArray(data.detail)) {
                                // Extract and format FastAPI validation errors array (e.g. "email: invalid email format")
                                errorMsg = data.detail.map(err => {
                                    const field = err.loc ? err.loc[err.loc.length - 1] : '';
                                    return field ? `${field}: ${err.msg}` : err.msg;
                                }).join(', ');
                            } else {
                                // Unpack custom detail dictionaries like {"message": "..."} or {"error": "..."}
                                errorMsg = data.detail.message || data.detail.error || JSON.stringify(data.detail);
                            }
                        }
                    } else if (data.message) {
                        errorMsg = data.message;
                    } else {
                        errorMsg = JSON.stringify(data);
                    }
                } else if (text) {
                    errorMsg = text;
                } else {
                    errorMsg = `Request failed with status ${res.status}`;
                }
                
                throw new Error(errorMsg);
            }
            
            return data;
        } catch (err) {
            console.error(`API Client Error [${endpoint}]:`, err);
            throw err;
        }
    }

    // ── JWT DECODER WITH ACTIVE EXPIRATION CHECK ──
    function decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            
            // Proactively verify the token's exp (expiration) Unix claim
            if (payload.exp) {
                const currentTime = Math.floor(Date.now() / 1000);
                if (currentTime >= payload.exp) {
                    console.warn("Stored JWT token has expired according to its claim.");
                    return null;
                }
            }
            
            return payload.user_data || null;
        } catch (e) {
            console.error('Failed to decode JWT token:', e);
            return null;
        }
    }

    // ── AUTOMATIC TOKEN REFRESH HELPER ──
    async function refreshAccessToken() {
        const refreshToken = localStorage.getItem('inbox_os_refresh_token');
        if (!refreshToken) {
            return false;
        }
        
        try {
            console.log("Attempting token refresh...");
            const res = await fetch(`${API_BASE}/api/auth/refresh_token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${refreshToken}`
                }
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data && data.access_token) {
                    console.log("Token refresh successful!");
                    localStorage.setItem('inbox_os_token', data.access_token);
                    state.token = data.access_token;
                    state.user = decodeToken(data.access_token);
                    return true;
                }
            }
        } catch (err) {
            console.error("Token refresh API call error:", err);
        }
        
        return false;
    }

    // ── GORGEOUS MARKDOWN & EMAIL DRAFT PARSER ──
    function parseMarkdown(text) {
        if (!text) return '';
        
        let html = text;
        
        // Escape standard HTML tags to avoid script injections
        html = html
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
            
        // 1. Process Code Blocks: ```code```
        html = html.replace(/```([\s\S]*?)```/gm, function(match, code) {
            return `<pre><code>${code.trim()}</code></pre>`;
        });
        
        // 2. Process Inline Code: `code`
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 3. Process Bold: **text**
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // 4. Process Email Drafts Structure (Intelligent visual transformation)
        // Match structure: "Subject: [subject]\nBody: [body]"
        const draftRegex = /(?:Subject|Draft Subject):\s*([^\n]+)\n+(?:Body|Draft Body):\s*([\s\S]+?)(?=\n*(?:Subject|Draft Subject|###|---|$))/i;
        html = html.replace(draftRegex, function(match, subjectText, bodyText) {
            // Remove code block endings or HTML trails if nested
            let subject = subjectText.replace(/<\/?[^>]+(>|$)/g, "").trim();
            let body = bodyText.trim();
            body = body.replace(/<\/?[^>]+(>|$)/g, ""); // clear HTML tags
            body = body.replace(/<\/code><\/pre>/, ""); // clear trailing code elements
            body = body.replace(/`+$/, ""); // clear backticks
            
            return `
                <div class="email-draft-card glass-panel">
                    <div class="draft-card-header">
                        <div class="draft-title-row">
                            <span class="draft-pill">Email Draft</span>
                            <span class="draft-brand">Inbox OS</span>
                        </div>
                        <button class="copy-draft-btn" title="Copy Email Body">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span class="copy-text" style="margin-left: 4px;">Copy</span>
                        </button>
                    </div>
                    <div class="draft-fields">
                        <div class="draft-field">
                            <span class="field-key">Subject:</span>
                            <span class="field-val">${subject}</span>
                        </div>
                    </div>
                    <div class="draft-body-content">${body}</div>
                </div>
            `;
        });

        // 5. Process Headers: ### Heading
        html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
        html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
        html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

        // 6. Process Blockquotes: > quote
        html = html.replace(/^\>\s+(.*)$/gm, '<blockquote>$1</blockquote>');

        // 7. Process Horizontal Divider Lines: ---
        html = html.replace(/^\-\-\-$/gm, '<hr class="agent-divider">');

        // 8. Process Markdown Tables: | th |
        const tableRowRegex = /^\|(.+)\|$/gm;
        if (html.match(tableRowRegex)) {
            const lines = html.split('\n');
            let insideTable = false;
            let tableHtml = '<table>';
            let formattedLines = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('|') && line.endsWith('|')) {
                    if (!insideTable) {
                        insideTable = true;
                        tableHtml = '<table>';
                    }
                    const cells = line.split('|').slice(1, -1).map(c => c.trim());
                    if (cells.every(c => /^:-*|-*:-*|-*:$/.test(c))) {
                        continue;
                    }
                    const tag = tableHtml.includes('<thead>') ? 'td' : 'th';
                    const wrapper = tag === 'th' ? '<thead>' : '';
                    const closeWrapper = tag === 'th' ? '</thead>' : '';
                    
                    let rowHtml = `${wrapper}<tr>`;
                    cells.forEach(cell => {
                        rowHtml += `<${tag}>${cell}</${tag}>`;
                    });
                    rowHtml += `</tr>${closeWrapper}`;
                    tableHtml += rowHtml;
                } else {
                    if (insideTable) {
                        insideTable = false;
                        tableHtml += '</table>';
                        formattedLines.push(tableHtml);
                    }
                    formattedLines.push(lines[i]);
                }
            }
            if (insideTable) {
                tableHtml += '</table>';
                formattedLines.push(tableHtml);
            }
            html = formattedLines.join('\n');
        }

        // 9. Process Lists: - item or * item
        html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        html = html.replace(/<\/ul>\s*<ul>/g, ''); // Clean double wrapped lists

        // 10. Process Paragraph breaks
        const paragraphs = html.split('\n\n');
        html = paragraphs.map(p => {
            if (p.startsWith('<pre>') || p.startsWith('<ul>') || p.startsWith('<li>') || p.startsWith('<div class="email-draft-card') || p.startsWith('<blockquote>') || p.startsWith('<table>') || p.startsWith('<hr>') || p.startsWith('<h1>') || p.startsWith('<h2>') || p.startsWith('<h3>')) {
                return p;
            }
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }).join('');
        
        return html;
    }

    // ── UTILITIES ──
    function showSpinner(button) {
        button.disabled = true;
        button.querySelector('.btn-text').classList.add('hidden');
        button.querySelector('.spinner').classList.remove('hidden');
    }

    function hideSpinner(button) {
        button.disabled = false;
        button.querySelector('.btn-text').classList.remove('hidden');
        button.querySelector('.spinner').classList.add('hidden');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        let utcStr = dateStr;
        if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(dateStr)) {
            utcStr = dateStr.replace(' ', 'T') + 'Z';
        }
        const d = new Date(utcStr);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // ── SCREEN TRANSITIONS STATE ──
    function renderScreenState() {
        if (state.token) {
            state.user = decodeToken(state.token);
            if (state.user) {
                // Populate Profile
                userDisplayName.textContent = state.user.email.split('@')[0];
                userEmailAddress.textContent = state.user.email;
                userAvatar.textContent = state.user.email.substring(0, 2).toUpperCase();
                
                authScreen.classList.remove('active');
                appWorkspace.classList.add('active');
                
                // Initialize Application Data
                checkGmailConnection();
                loadThreads();
                startNewConversationState();
                checkOnboardingStatus();
                return;
            }
        }
        
        // Clear session on error/signout
        localStorage.removeItem('inbox_os_token');
        localStorage.removeItem('inbox_os_refresh_token');
        state.token = null;
        state.user = null;
        appWorkspace.classList.remove('active');
        authScreen.classList.add('active');
    }

    // ── API HANDLERS ──

    // Signup submission
    async function handleSignup(e) {
        e.preventDefault();
        signupError.classList.add('hidden');
        
        const username = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        
        if (!username || !email || !password) return;
        
        showSpinner(submitBtn);
        
        try {
            await apiRequest('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    user_name: username
                })
            });
            
            // Success -> transition to login & preset fields
            signupForm.reset();
            document.getElementById('login-email').value = email;
            signupError.classList.add('hidden');
            
            showToast('Account created successfully! Please sign in.', 'success');
            appendConsoleLog('New profile registered.', 'success');
            toggleToLogin.click();
        } catch (err) {
            signupError.textContent = err.message;
            signupError.classList.remove('hidden');
        } finally {
            hideSpinner(submitBtn);
        }
    }

    // Login submission
    async function handleLogin(e) {
        e.preventDefault();
        loginError.classList.add('hidden');
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        if (!email || !password) return;
        
        showSpinner(submitBtn);
        
        try {
            const data = await apiRequest('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            // Login Successful
            localStorage.setItem('inbox_os_token', data.access_token);
            localStorage.setItem('inbox_os_refresh_token', data.refresh_token);
            state.token = data.access_token;
            showToast('Welcome back to Inbox OS!', 'success');
            appendConsoleLog('User authenticated successfully.', 'success');
            renderScreenState();
        } catch (err) {
            loginError.textContent = err.message;
            loginError.classList.remove('hidden');
        } finally {
            hideSpinner(submitBtn);
        }
    }

    // Check Google Gmail Connection Status
    async function checkGmailConnection() {
        if (!state.user || !state.user.user_id) return;
        
        try {
            // Under apiRequest, 404 automatically throws an error
            const data = await apiRequest(`/gmail/g/user/${state.user.user_id}`);
            
            if (data && data.google_email) {
                state.gmailConnected = true;
                state.gmailEmail = data.google_email;
                
                // Update UI Indicators
                gmailDot.className = 'status-dot connected';
                gmailEmailText.textContent = data.google_email;
                btnConnectGmail.innerHTML = `
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    Re-Authenticate
                `;
                gmailAlertBox.classList.add('hidden');
                appendConsoleLog(`Gmail integration active for ${data.google_email}.`, 'success');
            }
        } catch (err) {
            // Gracefully catch 404 (user not found / not connected to Google OAuth)
            state.gmailConnected = false;
            state.gmailEmail = null;
            
            gmailDot.className = 'status-dot disconnected';
            gmailEmailText.textContent = 'Not connected';
            btnConnectGmail.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14L21 3"></path>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                </svg>
                Connect Gmail
            `;
            gmailAlertBox.classList.remove('hidden');
            appendConsoleLog('Gmail integration inactive.', 'warning');
        }
    }

    // Connect Gmail Flow Redirect
    function handleGmailConnectRedirect() {
        if (!state.token) return;
        window.location.href = `${API_BASE}/gmail/g/login?token=${state.token}&redirect_uri=${encodeURIComponent(window.location.href)}`;
    }

    // Load Chat Threads List
    async function loadThreads() {
        if (!state.token) return;
        
        try {
            const data = await apiRequest('/ai/thread');
            state.threads = data || [];
            renderThreadList();
        } catch (err) {
            console.error('Failed to load thread history list:', err);
        }
    }

    // Render Recent Conversations in Sidebar
    function renderThreadList() {
        threadList.innerHTML = '';
        
        if (state.threads.length === 0) {
            threadList.innerHTML = `
                <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 2rem 0;">
                    No recent conversations.
                </div>
            `;
            return;
        }
        
        state.threads.forEach(thread => {
            const isActive = thread.thread_id === state.currentThreadId;
            const titleText = thread.chat_title && thread.chat_title.trim() !== ''
                ? thread.chat_title
                : 'Conversation';
                
            const item = document.createElement('div');
            item.className = `thread-item ${isActive ? 'active' : ''}`;
            item.setAttribute('data-id', thread.thread_id);
            
            item.innerHTML = `
                <div class="thread-icon-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div class="thread-metadata">
                    <span class="thread-title">${titleText}</span>
                    <span class="thread-time">${formatDate(thread.created_at)}</span>
                </div>
                <button class="btn-delete-thread" title="Delete Conversation">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;
            
            item.addEventListener('click', () => switchThread(thread.thread_id, titleText));
            
            const btnDelete = item.querySelector('.btn-delete-thread');
            if (btnDelete) {
                btnDelete.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleDeleteThread(thread.thread_id, titleText);
                });
            }
            
            threadList.appendChild(item);
        });
    }

    // Delete Chat Thread Helper
    async function handleDeleteThread(threadId, title) {
        const approved = await CustomDialog.show({
            title: 'Delete Conversation',
            description: `Are you sure you want to delete the conversation "${title}"? All chat history in this thread will be permanently deleted.`,
            variant: 'danger',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });
        if (!approved) {
            return;
        }
        
        try {
            await apiRequest(`/ai/thread/${threadId}`, {
                method: 'DELETE'
            });
            
            showToast('Conversation deleted successfully', 'success');
            appendConsoleLog(`Thread "${title}" deleted.`, 'success');
            
            // If the deleted thread was the active one, start a new thread state
            if (state.currentThreadId === threadId) {
                startNewConversationState();
            } else {
                await loadThreads();
            }
        } catch (err) {
            showToast(`Failed to delete thread: ${err.message}`, 'error');
            appendConsoleLog(`Failed to delete thread: ${err.message}`, 'error');
        }
    }

    // Switch active conversation and load logs
    async function switchThread(threadId, optionalTitle = '') {
        if (state.isStreaming) {
            if (state.activeController) {
                state.activeController.abort();
            }
            state.isStreaming = false;
        }

        state.currentThreadId = threadId;
        renderThreadList();
        
        activeThreadTitle.textContent = optionalTitle || 'Loading...';
        activeThreadStatus.textContent = 'Fetching conversation history...';
        
        welcomeState.classList.add('hidden');
        messageFlow.classList.remove('hidden');
        messageFlow.innerHTML = `
            <div style="display: flex; justify-content: center; padding: 4rem 0;">
                <span class="spinner"></span>
            </div>
        `;
        
        try {
            const messages = await apiRequest(`/ai/chats/${threadId}`);
            renderChats(messages);
            
            // Set Titles
            activeThreadTitle.textContent = optionalTitle || (messages.length > 0 ? messages[0].content.substring(0, 30) + '...' : 'Conversation');
            activeThreadStatus.textContent = `Conversation history loaded (${messages.length} messages)`;
            appendConsoleLog(`Conversation loaded: "${optionalTitle || 'Thread'}"`, 'info');
        } catch (err) {
            messageFlow.innerHTML = `
                <div class="error-banner">
                    Error loading messages: ${err.message}. Please try again.
                </div>
            `;
            activeThreadTitle.textContent = 'Error Loading';
            activeThreadStatus.textContent = 'Workspace error';
        }
        
        scrollToBottom();
        
        // Close sidebar layout on mobile
        if (appSidebar.classList.contains('open')) {
            appSidebar.classList.remove('open');
        }
    }

    // Render message arrays
    function renderChats(messages) {
        messageFlow.innerHTML = '';
        
        if (messages.length === 0) {
            messageFlow.innerHTML = `
                <div style="font-size: 0.8125rem; color: var(--text-muted); text-align: center; padding: 2rem 0;">
                    Empty conversation. Send a message to start.
                </div>
            `;
            return;
        }
        
        messages.forEach(msg => {
            appendMessageBubble(msg.role === 'user' ? 'user' : 'agent', msg.content);
        });
    }

    // Append single bubble DOM with clean flat vector SVGs
    function appendMessageBubble(sender, content, isStreamingPlaceholder = false) {
        const row = document.createElement('div');
        row.className = `message-row ${sender}`;
        
        // Create Avatar Element
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (sender === 'agent') {
            avatar.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: block;">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="M22 6l-10 7L2 6"></path>
                </svg>
            `;
            row.appendChild(avatar);
        } else {
            avatar.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: block;">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            `;
        }
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        if (isStreamingPlaceholder) {
            bubble.classList.add('streaming-cursor');
        }
        
        if (sender === 'user') {
            bubble.textContent = content;
        } else {
            bubble.innerHTML = parseMarkdown(content);
        }
        
        row.appendChild(bubble);
        
        // Place user avatar on the right side of the bubble
        if (sender === 'user') {
            row.appendChild(avatar);
        }
        
        messageFlow.appendChild(row);
        return bubble;
    }


    // Start New Conversation State
    function startNewConversationState() {
        if (state.isStreaming && state.activeController) {
            state.activeController.abort();
        }
        
        state.currentThreadId = null;
        state.isStreaming = false;
        
        renderThreadList();
        
        activeThreadTitle.textContent = 'New Conversation';
        activeThreadStatus.textContent = 'Inbox OS is ready';
        
        messageFlow.classList.add('hidden');
        messageFlow.innerHTML = '';
        welcomeState.classList.remove('hidden');
        
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatInput.focus();
        updateSendButtonState();
    }

    // Send Message and handle real-time SSE stream chunks
    async function sendMessage(text) {
        if (!state.token || !text || state.isStreaming) return;
        
        if (!state.gmailConnected) {
            showToast('Please connect your Gmail account first to use this AI agent!', 'warning');
            appendConsoleLog('Gmail connection missing on prompt dispatch.', 'warning');
            return;
        }

        const query = text.trim();
        chatInput.value = '';
        chatInput.style.height = 'auto';
        updateSendButtonState();
        
        if (!welcomeState.classList.contains('hidden')) {
            welcomeState.classList.add('hidden');
            messageFlow.innerHTML = '';
            messageFlow.classList.remove('hidden');
        }
        
        // Append attachments metadata if there are any
        let fullQuery = query;
        let attachmentDisplay = '';
        if (state.attachments && state.attachments.length > 0) {
            const filesList = state.attachments.map(att => `${att.name} (${att.size})`).join(', ');
            fullQuery = `[Workspace Attached Files: ${filesList}]\n\n${query}`;
            attachmentDisplay = `\n\n*📎 Attached: ${filesList}*`;
        }
        
        // Append User Bubble
        appendMessageBubble('user', query + attachmentDisplay);
        scrollToBottom();
        
        appendConsoleLog(`User prompt dispatched: "${query.substring(0, 30)}..."`, 'info');
        
        // Clear active attachments
        state.attachments = [];
        renderAttachmentChips();
        
        state.isStreaming = true;
        
        // Append Reasoning Panel
        const reasoningPanelId = 'reasoning-' + Math.random().toString(36).substring(2, 11);
        const reasoningRow = document.createElement('div');
        reasoningRow.className = 'message-row agent';
        reasoningRow.id = reasoningPanelId + '-row';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: block;">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="M22 6l-10 7L2 6"></path>
            </svg>
        `;
        reasoningRow.appendChild(avatar);
        
        const reasoningPanel = document.createElement('div');
        reasoningPanel.className = 'reasoning-panel';
        reasoningPanel.id = reasoningPanelId;
        reasoningPanel.innerHTML = `
            <div class="reasoning-header">
                <div class="reasoning-header-left">
                    <span class="pulse-indicator"></span>
                    <span class="reasoning-title">Reasoning trace</span>
                </div>
                <span class="reasoning-status-pill">Thinking...</span>
            </div>
            <div class="reasoning-steps" id="${reasoningPanelId}-steps">
                <div class="reasoning-step active" id="${reasoningPanelId}-step-init">
                    <span class="reasoning-step-icon">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" style="animation: spin 2.2s linear infinite;">
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.06)"></circle>
                            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-linecap="round"></path>
                        </svg>
                    </span>
                    <span class="reasoning-step-text">Contextualizing conversation workspace...</span>
                </div>
            </div>
            <div class="reasoning-tools-container hidden" id="${reasoningPanelId}-tools"></div>
        `;
        
        reasoningRow.appendChild(reasoningPanel);
        messageFlow.appendChild(reasoningRow);
        scrollToBottom();
        
        state.activeController = new AbortController();
        const signal = state.activeController.signal;
        
        try {
            activeThreadStatus.textContent = 'AI Agent thinking...';
            
            // Call fetch directly for stream reader
            let response = await fetch(`${API_BASE}/ai/agent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.token}`
                },
                body: JSON.stringify({
                    data: {
                        query: fullQuery,
                        thread_id: state.currentThreadId
                    },
                    state: {
                        confidence_score: state.confidenceScore
                    }
                }),
                signal: signal
            });
            
            if (!response.ok && response.status === 401) {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // Retry streaming request with the refreshed token
                    response = await fetch(`${API_BASE}/ai/agent`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${state.token}`
                        },
                        body: JSON.stringify({
                            data: {
                                query: fullQuery,
                                thread_id: state.currentThreadId
                            },
                            state: {
                                confidence_score: state.confidenceScore
                            }
                        }),
                        signal: signal
                    });
                }
            }
            
            if (!response.ok) {
                // Intercept 401 Unauthorized during stream sessions to clear expired tokens
                if (response.status === 401) {
                    console.warn("Authentication session expired (401) during messaging. Signing out...");
                    localStorage.removeItem('inbox_os_token');
                    localStorage.removeItem('inbox_os_refresh_token');
                    state.token = null;
                    state.user = null;
                    setTimeout(() => {
                        renderScreenState();
                    }, 0);
                }

                const errText = await response.text();
                let errorMsg = `Server error (${response.status})`;
                try {
                    const errData = JSON.parse(errText);
                    if (errData) {
                        if (errData.detail) {
                            if (typeof errData.detail === 'string') {
                                errorMsg = errData.detail;
                            } else if (typeof errData.detail === 'object') {
                                if (Array.isArray(errData.detail)) {
                                    errorMsg = errData.detail.map(err => {
                                        const field = err.loc ? err.loc[err.loc.length - 1] : '';
                                        return field ? `${field}: ${err.msg}` : err.msg;
                                    }).join(', ');
                                } else {
                                    errorMsg = errData.detail.message || errData.detail.error || JSON.stringify(errData.detail);
                                }
                            }
                        } else if (errData.message) {
                            errorMsg = errData.message;
                        } else {
                            errorMsg = JSON.stringify(errData);
                        }
                    }
                } catch (e) {
                    if (errText) errorMsg = errText;
                }
                throw new Error(errorMsg);
            }
            
            // Read active thread-id from header
            const headerThreadId = response.headers.get('x-thread-id');
            const isNewThread = state.currentThreadId === null;
            if (headerThreadId) {
                state.currentThreadId = headerThreadId;
            }
            
            activeThreadTitle.textContent = isNewThread ? (query.length > 30 ? query.substring(0, 30) + '...' : query) : activeThreadTitle.textContent;
            activeThreadStatus.textContent = 'Streaming answers...';
            appendConsoleLog('Agent reasoning stream initialized.', 'info');
            
            // Use the new robust line-buffered SSE stream parser!
            await processSSEStream(
                response,
                reasoningPanelId,
                (interruptVal) => {
                    // Interrupt received! Hide active loaders, mark panel as gateway validation
                    const panel = document.getElementById(reasoningPanelId);
                    if (panel) {
                        panel.classList.remove('completed');
                        const pill = panel.querySelector('.reasoning-status-pill');
                        if (pill) pill.textContent = 'Gateway validation required';
                    }
                    
                    state.isStreaming = false;
                    activeThreadStatus.textContent = 'Awaiting your approval...';
                    
                    let appBubble = document.getElementById(reasoningPanelId + '-bubble');
                    if (!appBubble) {
                        appBubble = appendMessageBubble('agent', '', true);
                        appBubble.id = reasoningPanelId + '-bubble';
                        scrollToBottom();
                    }
                    renderApprovalCard(interruptVal, appBubble);
                },
                (completedText) => {
                    state.isStreaming = false;
                    activeThreadStatus.textContent = 'Response complete';
                    showToast('Response completed successfully!', 'success');
                    appendConsoleLog('Agent task finished.', 'success');
                }
            );
            
            if (isNewThread) {
                await loadThreads();
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('Stream aborted');
                return;
            }
            
            console.error('Error during messaging:', err);
            
            const el = document.getElementById('streaming-typing-indicator');
            if (el) el.remove();
            
            appendMessageBubble('agent', `⚠️ **Error:** ${err.message || 'Failed to connect. Please try again.'}`);
            state.isStreaming = false;
            activeThreadStatus.textContent = 'Streaming failed';
            showToast('Agent task failed!', 'error');
            appendConsoleLog(`Agent execution error: ${err.message}`, 'error');
        } finally {
            scrollToBottom();
            updateSendButtonState();
        }
    }

    // ── SSE LINE-BUFFERED PARSER & HUMAN-IN-THE-LOOP (HITL) RENDERING ──
    async function processSSEStream(response, panelOrBubble, onInterrupt, onComplete) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let fullResponseText = '';
        let streamStopped = false;
        
        let isPanelMode = typeof panelOrBubble === 'string';
        let reasoningPanelId = isPanelMode ? panelOrBubble : '';
        let responseBubble = isPanelMode ? null : panelOrBubble;
        let lastToolBlockId = null;

        const nodeNames = {
            'memory': 'Retrieving workspace context...',
            'router': 'Evaluating workflow pipeline...',
            'planner': 'Structuring execution roadmap...',
            'ex': 'Synthesizing details...',
            'tool': 'Executing integrated skills...',
            'val': 'Verifying facts & formatting...',
            'direct': 'Authoring direct response...',
            'approval_gate': 'Securing safety gateway clearance...'
        };

        const toolNames = {
            'send_email': 'Drafting email response...',
            'reply_to_email': 'Replying to thread...',
            'trash_email': 'Moving email to trash...',
            'archive_email': 'Archiving thread...'
        };

        function markLastStepCompleted() {
            if (!isPanelMode) return;
            const stepsContainer = document.getElementById(`${reasoningPanelId}-steps`);
            if (!stepsContainer) return;
            const activeStep = stepsContainer.querySelector('.reasoning-step.active');
            if (activeStep) {
                activeStep.classList.remove('active');
                activeStep.classList.add('completed');
                const iconSpan = activeStep.querySelector('.reasoning-step-icon');
                if (iconSpan) {
                    iconSpan.innerHTML = `
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    `;
                }
            }
        }

        function appendActiveStep(text) {
            if (!isPanelMode) return;
            const stepsContainer = document.getElementById(`${reasoningPanelId}-steps`);
            if (!stepsContainer) return;
            
            markLastStepCompleted();
            
            const stepId = 'step-' + Math.random().toString(36).substring(2, 9);
            const step = document.createElement('div');
            step.className = 'reasoning-step active';
            step.id = stepId;
            step.innerHTML = `
                <span class="reasoning-step-icon">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" style="animation: spin 2.2s linear infinite;">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.06)"></circle>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-linecap="round"></path>
                    </svg>
                </span>
                <span class="reasoning-step-text">${text}</span>
            `;
            stepsContainer.appendChild(step);
            scrollToBottom();
        }

        try {
            while (!streamStopped) {
                const { done, value } = await reader.read();
                if (done) {
                    if (buffer.trim()) {
                        processLines(buffer);
                    }
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Save partial line

                for (const line of lines) {
                    if (streamStopped) break;
                    processLine(line);
                }
            }
            
            // Mark last active step completed on stream termination
            if (isPanelMode) {
                markLastStepCompleted();
                const panel = document.getElementById(reasoningPanelId);
                if (panel) {
                    panel.classList.add('completed');
                    const pill = panel.querySelector('.reasoning-status-pill');
                    if (pill) pill.textContent = 'Completed';
                }
            }
            
            if (onComplete && !streamStopped) {
                onComplete(fullResponseText);
            }
        } catch (err) {
            console.error('Stream processing error:', err);
            throw err;
        }

        function processLine(line) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) return;
            
            const jsonStr = trimmed.substring(6);
            try {
                const event = JSON.parse(jsonStr);
                
                if (event.type === 'node_start') {
                    const friendlyText = nodeNames[event.node];
                    if (friendlyText) {
                        appendActiveStep(friendlyText);
                        appendConsoleLog(`Node transition: ${event.node}`, 'info');
                    }
                } 
                else if (event.type === 'tool_start') {
                    let readableTool = event.tool;
                    if (readableTool.includes('__')) readableTool = readableTool.split('__').pop();
                    
                    const friendlyText = toolNames[readableTool] || `Running Gmail ${readableTool} skill...`;
                    appendActiveStep(friendlyText);
                    appendConsoleLog(`Calling tool: ${readableTool}`, 'info');
                    
                    // Render Tool Execution Card in Panel Mode
                    if (isPanelMode) {
                        const toolsContainer = document.getElementById(`${reasoningPanelId}-tools`);
                        if (toolsContainer) {
                            toolsContainer.classList.remove('hidden');
                            
                            const toolBlockId = 'tool-card-' + Math.random().toString(36).substring(2, 9);
                            lastToolBlockId = toolBlockId;
                            
                            const toolBlock = document.createElement('div');
                            toolBlock.className = 'reasoning-tool-block';
                            toolBlock.id = toolBlockId;
                            toolBlock.innerHTML = `
                                <div class="reasoning-tool-header">
                                    <div class="reasoning-tool-header-left">
                                        <span class="reasoning-tool-icon">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <polyline points="16 18 22 12 16 6"></polyline>
                                                <polyline points="8 6 2 12 8 18"></polyline>
                                            </svg>
                                        </span>
                                        <span class="reasoning-tool-name">${readableTool}</span>
                                    </div>
                                    <span class="reasoning-tool-chevron">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </span>
                                </div>
                                <div class="reasoning-tool-body">
                                    <div class="tool-io-section">
                                        <span class="tool-io-label">Output</span>
                                        <div class="tool-io-content" id="${toolBlockId}-output">Executing tool ...</div>
                                    </div>
                                </div>
                            `;
                            
                            toolBlock.querySelector('.reasoning-tool-header').addEventListener('click', () => {
                                toolBlock.classList.toggle('expanded');
                            });
                            
                            toolsContainer.appendChild(toolBlock);
                            scrollToBottom();
                        }
                    }
                } 
                else if (event.type === 'tool_end') {
                    let readableTool = event.tool;
                    if (readableTool.includes('__')) readableTool = readableTool.split('__').pop();
                    appendConsoleLog(`Tool completed: ${readableTool}`, 'success');
                    
                    if (isPanelMode && lastToolBlockId) {
                        const outDiv = document.getElementById(`${lastToolBlockId}-output`);
                        if (outDiv) {
                            let cleanOutput = event.output;
                            try {
                                const parsed = JSON.parse(event.output);
                                cleanOutput = JSON.stringify(parsed, null, 2);
                            } catch (e) {}
                            outDiv.textContent = cleanOutput;
                        }
                    }
                }
                else if (event.type === 'token') {
                    // Lazily append the answer stream bubble when first chunk arrives
                    if (!responseBubble) {
                        if (isPanelMode) {
                            markLastStepCompleted();
                            const panel = document.getElementById(reasoningPanelId);
                            if (panel) {
                                panel.classList.add('completed');
                                const pill = panel.querySelector('.reasoning-status-pill');
                                if (pill) pill.textContent = 'Completed';
                            }
                        }
                        
                        responseBubble = appendMessageBubble('agent', '', true);
                        if (isPanelMode) {
                            responseBubble.id = reasoningPanelId + '-bubble';
                        }
                        scrollToBottom();
                    }
                    
                    if (responseBubble) {
                        const indicator = document.getElementById('streaming-typing-indicator');
                        if (indicator) indicator.remove();
                        
                        responseBubble.classList.remove('typing-bubble');
                        fullResponseText += event.content;
                        responseBubble.innerHTML = parseMarkdown(fullResponseText);
                        scrollToBottom();
                    }
                } 
                else if (event.type === 'interrupt') {
                    streamStopped = true;
                    showToast('Action approval required', 'warning');
                    appendConsoleLog('Agent requires action validation.', 'warning');
                    if (onInterrupt) {
                        onInterrupt(event.value);
                    }
                } 
                else if (event.type === 'error') {
                    streamStopped = true;
                    
                    if (isPanelMode) {
                        markLastStepCompleted();
                        const panel = document.getElementById(reasoningPanelId);
                        if (panel) {
                            const pill = panel.querySelector('.reasoning-status-pill');
                            if (pill) {
                                pill.textContent = 'Failed';
                                pill.style.color = 'var(--color-error)';
                                pill.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                            }
                        }
                    }
                    
                    if (responseBubble) {
                        responseBubble.classList.remove('streaming-cursor');
                        responseBubble.innerHTML = parseMarkdown(`⚠️ **Error:** ${event.content}`);
                    } else {
                        appendMessageBubble('agent', `⚠️ **Error:** ${event.content}`);
                    }
                    state.isStreaming = false;
                    activeThreadStatus.textContent = 'Execution failed';
                }
            } catch (e) {
                console.error('Error parsing SSE line:', e, trimmed);
            }
        }
        
        function processLines(text) {
            const lines = text.split('\n');
            for (const line of lines) {
                if (streamStopped) break;
                processLine(line);
            }
        }
    }

    function renderApprovalCard(interruptVal, streamBubble) {
        console.log("[HITL] renderApprovalCard entered. interruptVal:", interruptVal);

        if (!interruptVal) {
            console.warn("[HITL] interruptVal is falsy");
            return;
        }

        let parsedVal = interruptVal;
        if (typeof interruptVal === 'string') {
            try {
                parsedVal = JSON.parse(interruptVal);
                console.log("[HITL] Parsed string interruptVal successfully:", parsedVal);
            } catch (e) {
                console.error("[HITL] Failed to parse string interruptVal:", e);
                return;
            }
        }

        if (!parsedVal || parsedVal.type !== 'tool_approval') {
            console.warn("[HITL] parsedVal type is not 'tool_approval':", parsedVal ? parsedVal.type : null);
            return;
        }

        const toolCalls = parsedVal.tool_calls || [];
        if (toolCalls.length === 0) {
            console.warn("[HITL] parsedVal.tool_calls is empty");
            return;
        }

        try {
            // Flawless UI transition: if current streamed bubble is empty, clear it
            if (streamBubble && streamBubble.innerHTML.trim() === '') {
                const row = streamBubble.closest('.message-row');
                if (row) row.remove();
            } else if (streamBubble) {
                streamBubble.classList.remove('streaming-cursor');
            }

            const card = document.createElement('div');
            card.className = 'hitl-approval-card glass-panel';
            
            const cardId = 'hitl-' + Math.random().toString(36).substring(2, 11);
            card.id = cardId;

            let toolCallsHtml = '';
            toolCalls.forEach(call => {
                const toolName = call.tool || '';
                let baseToolName = toolName;
                if (baseToolName.includes('__')) {
                    baseToolName = baseToolName.split('__').pop();
                }
                const args = call.args || {};
                let argsHtml = '';
                
                if (baseToolName === 'send_email' || baseToolName === 'reply_to_email') {
                    const to = args.to || args.recipient || 'N/A';
                    const subject = args.subject || 'N/A';
                    let body = args.body || args.content || '';
                    if (typeof body !== 'string') {
                        body = typeof body === 'object' ? JSON.stringify(body) : String(body);
                    }
                    
                    argsHtml = `
                        <div class="hitl-arg-row">
                            <span class="hitl-arg-label">Recipient:</span>
                            <span class="hitl-arg-value" style="font-family: monospace; color: var(--accent-blue);">${to}</span>
                        </div>
                        <div class="hitl-arg-row">
                            <span class="hitl-arg-label">Subject:</span>
                            <span class="hitl-arg-value" style="font-weight: 600;">${subject}</span>
                        </div>
                        ${body ? `
                        <div class="hitl-arg-row">
                            <span class="hitl-arg-label">Message Body:</span>
                            <div class="hitl-arg-value-scroll">${body.replace(/\n/g, '<br>')}</div>
                        </div>
                        ` : ''}
                    `;
                } else if (baseToolName === 'trash_email' || baseToolName === 'archive_email') {
                    const messageId = args.message_id || args.email_id || 'N/A';
                    argsHtml = `
                        <div class="hitl-arg-row">
                            <span class="hitl-arg-label">Email ID:</span>
                            <span class="hitl-arg-value" style="font-family: monospace; color: var(--accent-pink);">${messageId}</span>
                        </div>
                    `;
                } else {
                    Object.entries(args).forEach(([key, val]) => {
                        argsHtml += `
                            <div class="hitl-arg-row">
                                <span class="hitl-arg-label">${key}:</span>
                                <span class="hitl-arg-value">${typeof val === 'object' ? JSON.stringify(val) : val}</span>
                            </div>
                        `;
                    });
                }

                let readableToolName = baseToolName;
                if (baseToolName === 'send_email') readableToolName = 'Send New Email';
                else if (baseToolName === 'reply_to_email') readableToolName = 'Reply to Email';
                else if (baseToolName === 'trash_email') readableToolName = 'Move to Trash';
                else if (baseToolName === 'archive_email') readableToolName = 'Archive Email';

                toolCallsHtml += `
                    <div class="hitl-tool-call">
                        <span class="hitl-tool-name">${readableToolName}</span>
                        <div class="hitl-args-grid" style="margin-top: 0.75rem;">
                            ${argsHtml}
                        </div>
                    </div>
                `;
            });

            card.innerHTML = `
                <div class="hitl-header">
                    <div class="hitl-header-left">
                        <div class="hitl-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <span class="hitl-title">Action Gateway Approval</span>
                    </div>
                    <span class="hitl-status-pill">Pending Approval</span>
                </div>
                <div class="hitl-body">
                    <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.5rem; line-height: 1.4;">
                        The AI agent requires your explicit confirmation before calling this skill:
                    </p>
                    ${toolCallsHtml}
                </div>
                <div class="hitl-actions">
                    <button class="btn btn-secondary btn-hitl-reject" id="${cardId}-reject">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Reject & Cancel
                    </button>
                    <button class="btn btn-primary btn-hitl-approve" id="${cardId}-approve">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Approve & Execute
                    </button>
                </div>
            `;

            const row = document.createElement('div');
            row.className = 'message-row agent';
            
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: block;">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="M22 6l-10 7L2 6"></path>
                </svg>
            `;
            row.appendChild(avatar);
            row.appendChild(card);
            
            messageFlow.appendChild(row);
            scrollToBottom();

            const btnApprove = document.getElementById(`${cardId}-approve`);
            const btnReject = document.getElementById(`${cardId}-reject`);

            const handleChoice = async (approved) => {
                btnApprove.disabled = true;
                btnReject.disabled = true;

                const clickedBtn = approved ? btnApprove : btnReject;
                const originalContent = clickedBtn.innerHTML;
                clickedBtn.innerHTML = `
                    <span class="spinner" style="width: 12px; height: 12px; margin-right: 6px; border-width: 1.5px;"></span>
                    Processing...
                `;

                try {
                    const res = await fetch(`${API_BASE}/ai/resume`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${state.token}`
                        },
                        body: JSON.stringify({
                            thread_id: state.currentThreadId,
                            resume_data: { approved: approved }
                        })
                    });

                    if (!res.ok) {
                        throw new Error(`Failed to resume loop: ${res.statusText}`);
                    }

                    card.classList.add(approved ? 'resolved-approved' : 'resolved-rejected');
                    const statusPill = card.querySelector('.hitl-status-pill');
                    statusPill.textContent = approved ? 'Approved' : 'Rejected';

                    const actionsDiv = card.querySelector('.hitl-actions');
                    actionsDiv.innerHTML = approved ? `
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-green); font-size: 0.8125rem; font-weight: 700; font-family: 'Outfit', sans-serif;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Action Approved & Executed
                        </div>
                    ` : `
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: #ef4444; font-size: 0.8125rem; font-weight: 700; font-family: 'Outfit', sans-serif;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Action Rejected & Cancelled
                        </div>
                    `;

                    state.isStreaming = true;
                    showToast('Action approval sent!', 'info');
                    appendConsoleLog('Action gateway confirmation submitted.', 'info');
                    
                    // Append Resumed Reasoning Panel
                    const reasoningPanelId = 'reasoning-' + Math.random().toString(36).substring(2, 11);
                    const reasoningRow = document.createElement('div');
                    reasoningRow.className = 'message-row agent';
                    reasoningRow.id = reasoningPanelId + '-row';
                    
                    const avatar = document.createElement('div');
                    avatar.className = 'message-avatar';
                    avatar.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: block;">
                            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                            <path d="M22 6l-10 7L2 6"></path>
                        </svg>
                    `;
                    reasoningRow.appendChild(avatar);
                    
                    const reasoningPanel = document.createElement('div');
                    reasoningPanel.className = 'reasoning-panel';
                    reasoningPanel.id = reasoningPanelId;
                    reasoningPanel.innerHTML = `
                        <div class="reasoning-header">
                            <div class="reasoning-header-left">
                                <span class="pulse-indicator"></span>
                                <span class="reasoning-title">Reasoning trace</span>
                            </div>
                            <span class="reasoning-status-pill">Thinking...</span>
                        </div>
                        <div class="reasoning-steps" id="${reasoningPanelId}-steps">
                            <div class="reasoning-step active" id="${reasoningPanelId}-step-init">
                                <span class="reasoning-step-icon">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" style="animation: spin 2.2s linear infinite;">
                                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.06)"></circle>
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-linecap="round"></path>
                                    </svg>
                                </span>
                                <span class="reasoning-step-text">Resuming agent execution node...</span>
                            </div>
                        </div>
                        <div class="reasoning-tools-container hidden" id="${reasoningPanelId}-tools"></div>
                    `;
                    
                    reasoningRow.appendChild(reasoningPanel);
                    messageFlow.appendChild(reasoningRow);
                    scrollToBottom();

                    await processSSEStream(
                        res,
                        reasoningPanelId,
                        (nextInterrupt) => {
                            const panel = document.getElementById(reasoningPanelId);
                            if (panel) {
                                panel.classList.remove('completed');
                                const pill = panel.querySelector('.reasoning-status-pill');
                                if (pill) pill.textContent = 'Gateway validation required';
                            }
                            state.isStreaming = false;
                            activeThreadStatus.textContent = 'Awaiting your approval...';
                            
                            let appBubble = document.getElementById(reasoningPanelId + '-bubble');
                            if (!appBubble) {
                                appBubble = appendMessageBubble('agent', '', true);
                                appBubble.id = reasoningPanelId + '-bubble';
                                scrollToBottom();
                            }
                            renderApprovalCard(nextInterrupt, appBubble);
                        },
                        (completedText) => {
                            state.isStreaming = false;
                            activeThreadStatus.textContent = 'Response complete';
                        }
                    );

                } catch (err) {
                    console.error('Error resuming graph:', err);
                    clickedBtn.innerHTML = originalContent;
                    btnApprove.disabled = false;
                    btnReject.disabled = false;
                    showToast(`Error resuming: ${err.message}`, 'error');
                    appendConsoleLog(`Resume request failed: ${err.message}`, 'error');
                }
            };

            btnApprove.addEventListener('click', () => handleChoice(true));
            btnReject.addEventListener('click', () => handleChoice(false));
        } catch (err) {
            console.error("[HITL] Error occurred while rendering or binding approval card:", err);
        }
    }

    function scrollToBottom() {
        chatViewport.scrollTop = chatViewport.scrollHeight;
    }

    function updateSendButtonState() {
        const hasText = chatInput.value.trim().length > 0;
        btnSendMessage.disabled = !hasText || state.isStreaming;
    }

    // ── PREMIUM TOAST NOTIFICATIONS ──
    function showToast(message, type = 'info') {
        if (!state.enableToasts) return; // Toast notifications toggle preference
        const container = document.getElementById('toast-container');
        if (!container) return;

        const card = document.createElement('div');
        card.className = `toast-card ${type}`;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        } else if (type === 'warning') {
            iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        } else {
            iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }

        card.innerHTML = `
            <span class="toast-icon">${iconSvg}</span>
            <span class="toast-content">${message}</span>
        `;

        container.appendChild(card);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            setTimeout(() => card.remove(), 400);
        }, 4000);
    }

    // ── DETAILED CONSOLE LOGS TIMELINE ──
    function appendConsoleLog(message, type = 'info') {
        console.log(`[Inbox OS: ${type}] > ${message}`);
        const timeline = document.getElementById('console-timeline');
        if (!timeline) return;

        const row = document.createElement('div');
        row.className = 'console-log-row';
        
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];

        row.innerHTML = `
            <span class="console-log-time">${timeStr}</span>
            <span class="console-log-text ${type}">&gt; ${message}</span>
        `;

        timeline.appendChild(row);
        timeline.scrollTop = timeline.scrollHeight;
    }
    // ── SETTINGS MANAGEMENT ──
    function loadSavedSettings() {
        const savedConfidence = localStorage.getItem('inbox_os_confidence');
        const savedModel = localStorage.getItem('inbox_os_model');
        const savedTimeline = localStorage.getItem('inbox_os_show_timeline');
        const savedToasts = localStorage.getItem('inbox_os_enable_toasts');

        if (savedConfidence !== null) {
            state.confidenceScore = parseFloat(savedConfidence);
            if (settingsConfidenceInput) {
                settingsConfidenceInput.value = state.confidenceScore;
                confidenceValue.textContent = state.confidenceScore.toFixed(1);
            }
        }
        if (savedTimeline !== null) {
            state.showTimeline = savedTimeline === 'true';
        } else {
            // First load: false on mobile/tablet to avoid covering screen, true on desktop
            state.showTimeline = false;
        }
        if (settingsToggleTimeline) settingsToggleTimeline.checked = state.showTimeline;
        applyTimelineState();
        if (savedToasts !== null) {
            state.enableToasts = savedToasts === 'true';
            if (settingsToggleToasts) settingsToggleToasts.checked = state.enableToasts;
        }
    }

    function applyTimelineState() {
        if (utilityPanel) {
            if (state.showTimeline) {
                utilityPanel.classList.remove('collapsed');
            } else {
                utilityPanel.classList.add('collapsed');
            }
        }
    }

    function openSettings() {
        if (settingsModal) {
            settingsModal.classList.add('active');
            if (settingsConfidenceInput) settingsConfidenceInput.value = state.confidenceScore;
            if (confidenceValue) confidenceValue.textContent = state.confidenceScore.toFixed(1);
            if (settingsToggleTimeline) settingsToggleTimeline.checked = state.showTimeline;
            if (settingsToggleToasts) settingsToggleToasts.checked = state.enableToasts;
        }
    }

    function closeSettings() {
        if (settingsModal) {
            settingsModal.classList.remove('active');
        }
    }

    function openSkills() {
        if (skillsModal) {
            skillsModal.classList.add('active');
            appendConsoleLog('AI capabilities reviewed.', 'info');
        }
    }

    function closeSkills() {
        if (skillsModal) {
            skillsModal.classList.remove('active');
        }
    }

    function savePreferences() {
        if (settingsConfidenceInput) {
            state.confidenceScore = parseFloat(settingsConfidenceInput.value);
            localStorage.setItem('inbox_os_confidence', state.confidenceScore);
        }
        if (settingsToggleTimeline) {
            state.showTimeline = settingsToggleTimeline.checked;
            localStorage.setItem('inbox_os_show_timeline', state.showTimeline);
        }
        if (settingsToggleToasts) {
            state.enableToasts = settingsToggleToasts.checked;
            localStorage.setItem('inbox_os_enable_toasts', state.enableToasts);
        }

        applyTimelineState();
        closeSettings();
        
        showToast('Workspace settings saved!', 'success');
        appendConsoleLog(`Settings updated`, 'success');
    }

    // ── ATTACHMENTS WORKSPACE ──
    function handleFileSelection(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const attachmentId = 'attach-' + Math.random().toString(36).substring(2, 9);
            state.attachments.push({
                id: attachmentId,
                file: file,
                name: file.name,
                size: formatBytes(file.size)
            });
        }
        
        fileAttachmentInput.value = '';
        renderAttachmentChips();
        showToast('File(s) attached successfully!', 'success');
        appendConsoleLog(`${files.length} file(s) attached to input workspace.`, 'info');
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function removeAttachment(id) {
        state.attachments = state.attachments.filter(item => item.id !== id);
        renderAttachmentChips();
        appendConsoleLog('Attachment removed.', 'info');
    }

    function renderAttachmentChips() {
        if (state.attachments.length === 0) {
            attachmentChips.innerHTML = '';
            attachmentChips.classList.add('hidden');
            return;
        }

        attachmentChips.innerHTML = '';
        attachmentChips.classList.remove('hidden');

        state.attachments.forEach(item => {
            const chip = document.createElement('div');
            chip.className = 'attachment-chip';
            chip.innerHTML = `
                <span class="attachment-chip-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                </span>
                <span class="attachment-chip-name" title="${item.name}">${item.name}</span>
                <span class="attachment-chip-size">${item.size}</span>
                <button class="btn-remove-attachment" title="Remove attachment">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            
            chip.querySelector('.btn-remove-attachment').addEventListener('click', () => removeAttachment(item.id));
            attachmentChips.appendChild(chip);
        });
    }



    // Fetch onboarding status from localStorage (frontend-only)
    async function checkOnboardingStatus() {
        if (!state.user || !state.user.email) return;
        try {
            const completed = localStorage.getItem(`inbox_os_onboarding_completed_${state.user.email}`);
            if (completed !== 'true') {
                // First-time user: automatically start onboarding tour
                setTimeout(() => {
                    OnboardingTour.start();
                }, 800);
            }
        } catch (err) {
            console.error('Failed to fetch onboarding status:', err);
        }
    }

    // Save onboarding completion to localStorage (frontend-only)
    async function saveOnboardingCompletion() {
        if (!state.user || !state.user.email) return;
        try {
            localStorage.setItem(`inbox_os_onboarding_completed_${state.user.email}`, 'true');
        } catch (err) {
            console.error('Failed to save onboarding completion state:', err);
        }
    }

    // ── PREMIUM GUIDED ONBOARDING TOUR ENGINE ──
    const OnboardingTour = {
        currentStep: 0,
        spotlight: null,
        tooltip: null,
        blocker: null,
        
        steps: [
            {
                title: 'Welcome to Inbox OS',
                description: 'Your premium minimal workspace for AI-powered email management. Let\'s show you around in 5 quick steps!',
                target: '#welcome-state',
                placement: 'bottom'
            },
            {
                title: 'Gmail Authentication',
                description: 'Connect your Google account here. Once connected, Inbox OS gains secure capabilities to read, compose, and manage your emails.',
                target: '#btn-connect-gmail',
                placement: 'bottom'
            },
            {
                title: 'AI Chat Core Interface',
                description: 'Draft professional replies, search receipts, summarize recent invoices, or coordinate alerts using conversational AI queries.',
                target: '.input-container',
                placement: 'top'
            },
            {
                title: 'Recent Conversations History',
                description: 'Switch between ongoing email conversations, delete finished histories safely, or start fresh conversation slates.',
                target: '.threads-section',
                placement: 'right'
            },
            {
                title: 'Workspace Settings',
                description: 'Open this panel to toggle presentation properties (like floating toast alerts) to match your workflow.',
                target: '#btn-open-settings',
                placement: 'top'
            }
        ],

        async start() {
            this.destroy();
            this.currentStep = 0;

            this.blocker = document.createElement('div');
            this.blocker.className = 'tour-backdrop-blocker';
            document.body.appendChild(this.blocker);

            this.spotlight = document.createElement('div');
            this.spotlight.className = 'tour-spotlight';
            document.body.appendChild(this.spotlight);

            this.tooltip = document.createElement('div');
            this.tooltip.className = 'tour-tooltip';
            document.body.appendChild(this.tooltip);

            this.handleResize = this.showStep.bind(this);
            this.handleKeydown = this.onKeydown.bind(this);
            window.addEventListener('resize', this.handleResize);
            document.addEventListener('keydown', this.handleKeydown);

            await this.showStep();
            appendConsoleLog('Guided onboarding tour initiated.', 'info');
        },

        async showStep() {
            if (this.currentStep >= this.steps.length) {
                this.finish();
                return;
            }

            const step = this.steps[this.currentStep];
            const targetEl = document.querySelector(step.target);

            if (!targetEl) {
                console.warn(`Tour target element missing: ${step.target}`);
                this.next();
                return;
            }

            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(r => setTimeout(r, 200));

            const rect = targetEl.getBoundingClientRect();
            this.spotlight.style.top = (rect.top + window.scrollY - 6) + 'px';
            this.spotlight.style.left = (rect.left + window.scrollX - 6) + 'px';
            this.spotlight.style.width = (rect.width + 12) + 'px';
            this.spotlight.style.height = (rect.height + 12) + 'px';

            const isLastStep = this.currentStep === this.steps.length - 1;
            const nextButtonText = isLastStep ? 'Finish' : 'Next';
            const prevButtonHtml = this.currentStep > 0 ? `<button class="tour-btn tour-btn-prev">Prev</button>` : '';

            this.tooltip.innerHTML = `
                <div class="tour-tooltip-arrow"></div>
                <div>
                    <h4 class="tour-tooltip-title">${step.title}</h4>
                    <p class="tour-tooltip-desc">${step.description}</p>
                </div>
                <div class="tour-tooltip-footer">
                    <span class="tour-tooltip-progress">Step ${this.currentStep + 1} of ${this.steps.length}</span>
                    <div class="tour-tooltip-actions">
                        <button class="tour-btn tour-btn-skip">Skip</button>
                        ${prevButtonHtml}
                        <button class="tour-btn tour-btn-next">${nextButtonText}</button>
                    </div>
                </div>
            `;

            this.tooltip.setAttribute('data-placement', step.placement);

            this.tooltip.querySelector('.tour-btn-skip').addEventListener('click', () => this.skip());
            if (this.currentStep > 0) {
                this.tooltip.querySelector('.tour-btn-prev').addEventListener('click', () => this.prev());
            }
            this.tooltip.querySelector('.tour-btn-next').addEventListener('click', () => this.next());

            this.positionTooltip(rect, step.placement);
            this.tooltip.classList.add('active');
        },

        positionTooltip(targetRect, placement) {
            const tooltipRect = this.tooltip.getBoundingClientRect();
            const gap = 14;

            let top = 0;
            let left = 0;

            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            if (placement === 'top') {
                top = targetRect.top + scrollY - tooltipRect.height - gap;
                left = targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2;
            } else if (placement === 'bottom') {
                top = targetRect.bottom + scrollY + gap;
                left = targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2;
            } else if (placement === 'left') {
                top = targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.left + scrollX - tooltipRect.width - gap;
            } else if (placement === 'right') {
                top = targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.right + scrollX + gap;
            }

            const padding = 10;
            left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
            top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));

            this.tooltip.style.top = top + 'px';
            this.tooltip.style.left = left + 'px';
        },

        next() {
            this.tooltip.classList.remove('active');
            this.currentStep++;
            setTimeout(() => this.showStep(), 150);
        },

        prev() {
            this.tooltip.classList.remove('active');
            this.currentStep--;
            setTimeout(() => this.showStep(), 150);
        },

        async skip() {
            this.destroy();
            await saveOnboardingCompletion();
            showToast('Tour skipped. Welcome to Inbox OS!', 'success');
            appendConsoleLog('Guided onboarding tour skipped by user.', 'info');
        },

        async finish() {
            this.destroy();
            await saveOnboardingCompletion();
            showToast('Workspace guide completed! Enjoy Inbox OS.', 'success');
            appendConsoleLog('Guided onboarding tour finished successfully.', 'success');
        },

        onKeydown(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.skip();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.next();
            } else if (e.key === 'ArrowLeft' && this.currentStep > 0) {
                e.preventDefault();
                this.prev();
            }
        },

        destroy() {
            if (this.blocker) this.blocker.remove();
            if (this.spotlight) this.spotlight.remove();
            if (this.tooltip) this.tooltip.remove();
            
            this.blocker = null;
            this.spotlight = null;
            this.tooltip = null;

            window.removeEventListener('resize', this.handleResize);
            document.removeEventListener('keydown', this.handleKeydown);
        }
    };


    // ── PREMIUM CUSTOM CONFIRMATION DIALOG SYSTEM ──
    const CustomDialog = {
        show(options = {}) {
            return new Promise((resolve) => {
                const {
                    title = 'Confirm Action',
                    description = 'Are you sure you want to proceed?',
                    variant = 'info', // 'danger' | 'warning' | 'success' | 'info'
                    confirmText = 'Confirm',
                    cancelText = 'Cancel',
                    critical = false // If true, disable click-outside to close
                } = options;

                // Create overlay element
                const overlay = document.createElement('div');
                overlay.className = 'dialog-overlay';
                
                // Get icon based on variant
                let iconSvg = '';
                let variantClass = variant; // 'danger', 'warning', 'success', 'info'
                
                if (variant === 'danger') {
                    iconSvg = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    `;
                } else if (variant === 'warning') {
                    iconSvg = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    `;
                } else if (variant === 'success') {
                    iconSvg = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    `;
                } else {
                    // info
                    iconSvg = `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    `;
                }

                overlay.innerHTML = `
                    <div class="dialog-card ${variantClass}">
                        <div class="dialog-icon-wrapper">
                            ${iconSvg}
                        </div>
                        <h3 class="dialog-title">${title}</h3>
                        <p class="dialog-description">${description}</p>
                        <div class="dialog-actions">
                            <button class="dialog-btn dialog-btn-secondary" id="dialog-cancel-btn">${cancelText}</button>
                            <button class="dialog-btn dialog-btn-primary" id="dialog-confirm-btn">${confirmText}</button>
                        </div>
                    </div>
                `;

                document.body.appendChild(overlay);

                // Focus on buttons by default
                const confirmBtn = overlay.querySelector('#dialog-confirm-btn');
                const cancelBtn = overlay.querySelector('#dialog-cancel-btn');
                
                if (variant === 'danger') {
                    cancelBtn.focus();
                } else {
                    confirmBtn.focus();
                }

                // Trigger reflow
                overlay.getBoundingClientRect();
                overlay.classList.add('active');

                function dismiss(result) {
                    overlay.classList.remove('active');
                    document.removeEventListener('keydown', handleKeyDown);
                    setTimeout(() => {
                        overlay.remove();
                        resolve(result);
                    }, 200);
                }

                confirmBtn.addEventListener('click', () => dismiss(true));
                cancelBtn.addEventListener('click', () => dismiss(false));

                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay && !critical) {
                        dismiss(false);
                    }
                });

                function handleKeyDown(e) {
                    if (e.key === 'Escape' && !critical) {
                        e.preventDefault();
                        dismiss(false);
                    } else if (e.key === 'Enter') {
                        if (document.activeElement === cancelBtn) {
                            dismiss(false);
                        } else {
                            dismiss(true);
                        }
                    } else if (e.key === 'Tab') {
                        if (e.shiftKey) {
                            if (document.activeElement === cancelBtn) {
                                e.preventDefault();
                                confirmBtn.focus();
                            }
                        } else {
                            if (document.activeElement === confirmBtn) {
                                e.preventDefault();
                                cancelBtn.focus();
                            }
                        }
                    }
                }

                document.addEventListener('keydown', handleKeyDown);
            });
        }
    };


    // ── DOM EVENT REGISTER BINDINGS ──
    function registerEvents() {
        // Onboarding Tour manual restart triggers
        if (btnOpenTour) {
            btnOpenTour.addEventListener('click', () => {
                OnboardingTour.start();
            });
        }
        if (btnSettingsRestartTour) {
            btnSettingsRestartTour.addEventListener('click', () => {
                closeSettings();
                OnboardingTour.start();
            });
        }

        // Toggle view
        toggleToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
            signupError.classList.add('hidden');
        });
        
        toggleToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.classList.remove('active');
            loginForm.classList.add('active');
            loginError.classList.add('hidden');
        });
        
        // Form submits
        loginForm.addEventListener('submit', handleLogin);
        signupForm.addEventListener('submit', handleSignup);
        
        // Start thread
        btnNewThread.addEventListener('click', startNewConversationState);
        
        // Gmail connection trigger
        btnConnectGmail.addEventListener('click', handleGmailConnectRedirect);
        
        // Logout trigger
        btnLogout.addEventListener('click', async () => {
            const approved = await CustomDialog.show({
                title: 'Sign Out Profile',
                description: 'Are you sure you want to sign out of Inbox OS? Your active session credentials will be cleared.',
                variant: 'warning',
                confirmText: 'Sign Out',
                cancelText: 'Cancel'
            });
            if (approved) {
                localStorage.removeItem('inbox_os_token');
                localStorage.removeItem('inbox_os_refresh_token');
                state.token = null;
                state.user = null;
                showToast('Signed out of Inbox OS', 'info');
                appendConsoleLog('Session terminated.', 'info');
                renderScreenState();
            }
        });
        
        // Textarea resize & bindings
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 'px';
            updateSendButtonState();
        });
        
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                const text = chatInput.value.trim();
                if (text && !state.isStreaming) {
                    sendMessage(text);
                }
            }
        });
        
        btnSendMessage.addEventListener('click', () => {
            const text = chatInput.value.trim();
            if (text && !state.isStreaming) {
                sendMessage(text);
            }
        });
        
        // Suggestions prompts
        suggestionCards.forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.getAttribute('data-prompt');
                if (prompt && !state.isStreaming) {
                    chatInput.value = prompt;
                    chatInput.focus();
                    chatInput.style.height = 'auto';
                    chatInput.style.height = chatInput.scrollHeight + 'px';
                    updateSendButtonState();
                    sendMessage(prompt);
                }
            });
        });

        // Collapsible Timeline Toggler removed as the timeline has been deleted.

        // Settings Modal event bindings
        if (btnOpenSettings) {
            btnOpenSettings.addEventListener('click', openSettings);
        }
        if (btnCloseSettings) {
            btnCloseSettings.addEventListener('click', closeSettings);
        }
        if (btnSaveSettings) {
            btnSaveSettings.addEventListener('click', savePreferences);
        }
        if (settingsConfidenceInput) {
            settingsConfidenceInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                confidenceValue.textContent = val.toFixed(1);
            });
        }
        
        // Hide modal when backdrop is clicked
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    closeSettings();
                }
            });
        }

        // AI Skills Modal event bindings
        if (btnOpenSkills) {
            btnOpenSkills.addEventListener('click', openSkills);
        }
        if (btnViewCapabilities) {
            btnViewCapabilities.addEventListener('click', openSkills);
        }
        if (btnCloseSkills) {
            btnCloseSkills.addEventListener('click', closeSkills);
        }
        if (btnCloseSkillsFooter) {
            btnCloseSkillsFooter.addEventListener('click', closeSkills);
        }
        if (skillsModal) {
            skillsModal.addEventListener('click', (e) => {
                if (e.target === skillsModal) {
                    closeSkills();
                }
            });
        }

        // File selection triggers
        if (btnAttachFile) {
            btnAttachFile.addEventListener('click', () => {
                fileAttachmentInput.click();
            });
        }
        if (fileAttachmentInput) {
            fileAttachmentInput.addEventListener('change', handleFileSelection);
        }
        
        // Command Palette Logic
        const commandPalette = document.getElementById('command-palette');
        const paletteSearch = document.getElementById('palette-search');
        const paletteResults = document.getElementById('palette-results');
        
        const commands = [
            { id: 'summarize', title: 'Summarize Inbox', icon: '📥', shortcut: '⌘S', action: () => sendMessage("Check my latest 5 emails and summarize them") },
            { id: 'unread', title: 'List Unread Emails', icon: '⚡', shortcut: '⌘U', action: () => sendMessage("List unread emails from today") },
            { id: 'settings', title: 'Workspace Settings', icon: '⚙️', shortcut: '⌘P', action: () => openSettings() },
            { id: 'new', title: 'New Conversation', icon: '💬', shortcut: '⌘N', action: () => startNewConversationState() },
            { id: 'connect', title: 'Connect Google Gmail', icon: '🔑', shortcut: '⌘G', action: () => handleGmailConnectRedirect() },
            { id: 'logout', title: 'Sign Out Profile', icon: '🚪', shortcut: '⌘Q', action: () => btnLogout.click() }
        ];

        function renderPaletteResults(filter = '') {
            paletteResults.innerHTML = '';
            const filtered = commands.filter(c => c.title.toLowerCase().includes(filter.toLowerCase()));
            
            if (filtered.length === 0) {
                paletteResults.innerHTML = `<div style="font-size: 0.8125rem; color: var(--text-muted); text-align: center; padding: 1.5rem 0;">No commands found</div>`;
                return;
            }

            filtered.forEach((cmd, idx) => {
                const item = document.createElement('div');
                item.className = 'palette-result-item';
                if (idx === 0) item.classList.add('selected');
                item.innerHTML = `
                    <div class="palette-result-left">
                        <span class="palette-result-icon">${cmd.icon}</span>
                        <span class="palette-result-title">${cmd.title}</span>
                    </div>
                    <span class="palette-result-shortcut">${cmd.shortcut}</span>
                `;
                item.addEventListener('click', () => {
                    closePalette();
                    cmd.action();
                });
                paletteResults.appendChild(item);
            });
        }

        function openPalette() {
            commandPalette.classList.add('active');
            paletteSearch.value = '';
            renderPaletteResults();
            setTimeout(() => paletteSearch.focus(), 50);
        }

        function closePalette() {
            commandPalette.classList.remove('active');
        }

        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (commandPalette.classList.contains('active')) {
                    closePalette();
                } else {
                    openPalette();
                }
            } else if (e.key === 'Escape') {
                closePalette();
            }
        });

        commandPalette.addEventListener('click', (e) => {
            if (e.target === commandPalette) {
                closePalette();
            }
        });

        paletteSearch.addEventListener('input', (e) => {
            renderPaletteResults(e.target.value);
        });

        paletteSearch.addEventListener('keydown', (e) => {
            const items = paletteResults.querySelectorAll('.palette-result-item');
            if (items.length === 0) return;

            let selectedIdx = -1;
            items.forEach((item, idx) => {
                if (item.classList.contains('selected')) selectedIdx = idx;
            });

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                items[selectedIdx].classList.remove('selected');
                const nextIdx = (selectedIdx + 1) % items.length;
                items[nextIdx].classList.add('selected');
                items[nextIdx].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                items[selectedIdx].classList.remove('selected');
                const prevIdx = (selectedIdx - 1 + items.length) % items.length;
                items[prevIdx].classList.add('selected');
                items[prevIdx].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selectedItem = items[selectedIdx];
                if (selectedItem) {
                    const title = selectedItem.querySelector('.palette-result-title').textContent;
                    const cmd = commands.find(c => c.title === title);
                    if (cmd) {
                        closePalette();
                        cmd.action();
                    }
                }
            }
        });

        // Mobile sidebar trigger
        btnToggleSidebar.addEventListener('click', () => {
            appSidebar.classList.toggle('open');
        });
        
        btnCloseSidebar.addEventListener('click', () => {
            appSidebar.classList.remove('open');
        });
        
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!appSidebar.contains(e.target) && !btnToggleSidebar.contains(e.target) && appSidebar.classList.contains('open')) {
                    appSidebar.classList.remove('open');
                }
            }
            if (window.innerWidth <= 1024) {
                if (utilityPanel && btnToggleUtility && !utilityPanel.contains(e.target) && !btnToggleUtility.contains(e.target) && !utilityPanel.classList.contains('collapsed')) {
                    state.showTimeline = false;
                    localStorage.setItem('inbox_os_show_timeline', 'false');
                    applyTimelineState();
                    if (settingsToggleTimeline) {
                        settingsToggleTimeline.checked = false;
                    }
                }
            }
        });
        
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                appSidebar.classList.remove('open');
            }
            if (window.innerWidth > 1024) {
                applyTimelineState();
            }
        });

        // Copy Draft Email contents click listener
        document.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('.copy-draft-btn');
            if (copyBtn) {
                const draftCard = copyBtn.closest('.email-draft-card');
                const bodyText = draftCard.querySelector('.draft-body-content').innerText;
                
                navigator.clipboard.writeText(bodyText).then(() => {
                    const copyText = copyBtn.querySelector('.copy-text');
                    if (copyText) {
                        copyText.textContent = 'Copied!';
                        copyBtn.style.borderColor = 'var(--color-success)';
                        copyBtn.style.color = '#ffffff';
                        copyBtn.style.background = 'rgba(16, 185, 129, 0.1)';
                        showToast('Email draft body copied!', 'success');
                        appendConsoleLog('Draft contents copied to clipboard.', 'success');
                        
                        setTimeout(() => {
                            copyText.textContent = 'Copy';
                            copyBtn.style.borderColor = 'var(--border-light)';
                            copyBtn.style.color = 'var(--text-secondary)';
                            copyBtn.style.background = 'rgba(255, 255, 255, 0.02)';
                        }, 2000);
                    }
                }).catch(err => {
                    console.error('Failed to copy draft body content:', err);
                });
            }
        });
    }

    // ── INITIALIZATION ──
    function init() {
        registerEvents();
        loadSavedSettings();
        renderScreenState();
    }

    document.addEventListener('DOMContentLoaded', init);

    // Make some utilities globally accessible if needed for debug
    window.InboxOS = {
        state: state,
        loadSettings: loadSavedSettings
    };

})();
