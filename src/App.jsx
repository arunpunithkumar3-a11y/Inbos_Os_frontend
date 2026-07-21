
import React from "react";
import { WorkspaceProvider, useWorkspace } from "./contexts/WorkspaceContext";
import AuthScreen from "./components/Auth/AuthScreen";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatWorkspace from "./components/Chat/ChatWorkspace";

import SettingsModal from "./components/Modals/SettingsModal";
import SkillsModal from "./components/Modals/SkillsModal";
import PrivacyPolicyModal from "./components/Modals/PrivacyPolicyModal";
import TermsModal from "./components/Modals/TermsModal";
import CommandPalette from "./components/Common/CommandPalette";
import OnboardingTour from "./components/Common/OnboardingTour";
import Toast from "./components/Common/Toast";
import CustomDialog from "./components/Common/CustomDialog";

import "./index.css";

function AppContent() {
  const { token } = useWorkspace();

  if (!token) {
    return (
      <>
        <AuthScreen />
        <PrivacyPolicyModal />
        <TermsModal />
      </>
    );
  }

  return (
    <div id="app-workspace" className="workspace-container active">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace */}
      <ChatWorkspace />

      {/* Overlays & Modals */}
      <SettingsModal />
      <SkillsModal />
      <PrivacyPolicyModal />
      <TermsModal />
      <CommandPalette />
      <OnboardingTour />
      <Toast />
      <CustomDialog />
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
}
