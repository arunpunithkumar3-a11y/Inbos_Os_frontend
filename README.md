# Inbox OS - AI Email Workspace Frontend

A production-grade, highly responsive, and modular React.js frontend migrated from a static HTML/CSS/JS single-page application (SPA). This application provides a premium minimal AI workspace for secure Google Gmail integration and email thread coordination.

---

## Key Features

- **Centralized React State**: Built on React Context (`WorkspaceContext`) managing authentication, JWT claims, Server-Sent Events (SSE) streaming, and unified tool traces.
- **AI Reasoning Traces**: Real-time display of the AI agent's multi-step decision pipeline showing exactly which nodes and skills are executing.
- **Action Gateway (HITL)**: Safety clearance mechanism requiring explicit approval (Approve & Execute / Reject & Cancel) for sensitive mail operations (e.g., sending, replying, archiving).
- **Command Palette (`Ctrl + K`)**: Universal action palette supporting keyboard-driven navigation (Arrow keys, Enter, Esc) to trigger core workflows.
- **Premium Guided Tour**: Stepped onboarding tour utilizing dynamic spotlight highlighting, resizing calculations, and focus trapping.
- **Custom Dialog & Notification Systems**: Pure React-based confirm dialog cards and dynamic slide-out toast banners.

---

## Tech Stack

- **Core**: React 19+
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (maximum visual fidelity to the original design)
- **Quality Assurance**: ESLint

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the displayed local URL (typically **`http://localhost:5173`**).

---

## Production Build

To generate and preview the production-ready optimized asset bundle:

```bash
npm run build
npm run preview
```

The build output will be compiled into the `dist/` directory.
