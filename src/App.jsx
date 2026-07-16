
import React from "react";
import { WorkspaceProvider, useWorkspace } from "./contexts/WorkspaceContext";
import AuthScreen from "./components/Auth/AuthScreen";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatWorkspace from "./components/Chat/ChatWorkspace";

import SettingsModal from "./components/Modals/SettingsModal";
import SkillsModal from "./components/Modals/SkillsModal";
import CommandPalette from "./components/Common/CommandPalette";
import OnboardingTour from "./components/Common/OnboardingTour";
import Toast from "./components/Common/Toast";
import CustomDialog from "./components/Common/CustomDialog";

import "./index.css";

function AppContent() {
  const { token } = useWorkspace();

  if (!token) {
    return <AuthScreen />;
  }

  return (
    <div id="app-workspace" className="workspace-container active">
      {}
      <Sidebar />

      {}
      <ChatWorkspace />

      {}
      <SettingsModal />
      <SkillsModal />
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
