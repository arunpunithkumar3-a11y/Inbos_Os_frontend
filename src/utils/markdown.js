
export function parseMarkdown(text) {
  if (!text) return "";

  let html = text;

  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/```([\s\S]*?)```/gm, function (match, code) {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // 3. Process Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // 4. Process Email Drafts Structure (Intelligent visual transformation)
  // Match structure: "Subject: [subject]\nBody: [body]"
  const draftRegex =
    /(?:Subject|Draft Subject):\s*([^\n]+)\n+(?:Body|Draft Body):\s*([\s\S]+?)(?=\n*(?:Subject|Draft Subject|###|---|$))/i;
  html = html.replace(draftRegex, function (match, subjectText, bodyText) {
    // Remove code block endings or HTML trails if nested
    let subject = subjectText.replace(/<\/?[^>]+(>|$)/g, "").trim();
    let body = bodyText.trim();
    body = body.replace(/<\/?[^>]+(>|$)/g, ""); // clear HTML tags
    body = body.replace(/<\/code><\/pre>/, ""); // clear trailing code elements
    body = body.replace(/`+$/, ""); 

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

  html = html.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");

  html = html.replace(/^>\s+(.*)$/gm, "<blockquote>$1</blockquote>");

  html = html.replace(/^---$/gm, '<hr class="agent-divider">');

  const tableRowRegex = /^\|(.+)\|$/gm;
  if (html.match(tableRowRegex)) {
    const lines = html.split("\n");
    let insideTable = false;
    let tableHtml = "<table>";
    let formattedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("|") && line.endsWith("|")) {
        if (!insideTable) {
          insideTable = true;
          tableHtml = "<table>";
        }
        const cells = line
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        if (cells.every((c) => /^:-*|-*:-*|-*:$/.test(c))) {
          continue;
        }
        const tag = tableHtml.includes("<thead>") ? "td" : "th";
        const wrapper = tag === "th" ? "<thead>" : "";
        const closeWrapper = tag === "th" ? "</thead>" : "";

        let rowHtml = `${wrapper}<tr>`;
        cells.forEach((cell) => {
          rowHtml += `<${tag}>${cell}</${tag}>`;
        });
        rowHtml += `</tr>${closeWrapper}`;
        tableHtml += rowHtml;
      } else {
        if (insideTable) {
          insideTable = false;
          tableHtml += "</table>";
          formattedLines.push(tableHtml);
        }
        formattedLines.push(lines[i]);
      }
    }
    if (insideTable) {
      tableHtml += "</table>";
      formattedLines.push(tableHtml);
    }
    html = formattedLines.join("\n");
  }

  html = html.replace(/^\s*[-*]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
  html = html.replace(/<\/ul>\s*<ul>/g, ""); 

  const paragraphs = html.split("\n\n");
  html = paragraphs
    .map((p) => {
      if (
        p.startsWith("<pre>") ||
        p.startsWith("<ul>") ||
        p.startsWith("<li>") ||
        p.startsWith('<div class="email-draft-card') ||
        p.startsWith("<blockquote>") ||
        p.startsWith("<table>") ||
        p.startsWith("<hr>") ||
        p.startsWith("<h1>") ||
        p.startsWith("<h2>") ||
        p.startsWith("<h3>")
      ) {
        return p;
      }
      return `<p>${p.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");

  return html;
}
