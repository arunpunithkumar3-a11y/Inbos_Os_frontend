import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { WorkspaceProvider, useWorkspace } from "./contexts/WorkspaceContext";

import LandingPage from "./components/Landing/LandingPage";
import LoginPage from "./components/Auth/LoginPage";

import Sidebar from "./components/Sidebar/Sidebar";
import ChatWorkspace from "./components/Chat/ChatWorkspace";
import SettingsModal from "./components/Modals/SettingsModal";
import SkillsModal from "./components/Modals/SkillsModal";
import CommandPalette from "./components/Common/CommandPalette";
import OnboardingTour from "./components/Common/OnboardingTour";
import Toast from "./components/Common/Toast";
import CustomDialog from "./components/Common/CustomDialog";

import GlobalBackground from "./components/Common/GlobalBackground";

import "./index.css";

/* ─── Protected App Workspace (/app) ──────────────────────────────────────── */

function AppWorkspace() {
  const { token } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div id="app-workspace" className="workspace-container active">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace */}
      <ChatWorkspace />

      {/* Overlays & Modals */}
      <SettingsModal />
      <SkillsModal />
      <CommandPalette />
      <OnboardingTour />
      <Toast />
      <CustomDialog />
    </div>
  );
}

/* ─── Landing route: redirect authenticated users to /app ─────────────────── */

function LandingRoute() {
  const { token } = useWorkspace();
  if (token) return <Navigate to="/app" replace />;
  return <LandingPage />;
}

/* ─── Root App ────────────────────────────────────────────────────────────── */

export default function App() {
  return (
    <BrowserRouter>
      <WorkspaceProvider>
        <GlobalBackground />
        <Routes>
          {/* Public landing page — always accessible */}
          <Route path="/" element={<LandingRoute />} />

          {/* Login route — redirects to /app if already authenticated */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected workspace */}
          <Route path="/app" element={<AppWorkspace />} />

          {/* Catch-all → landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </WorkspaceProvider>
    </BrowserRouter>
  );
}
