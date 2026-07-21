import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import AuthScreen from "./AuthScreen";

/**
 * LoginPage — route: /login
 *
 * Renders the existing AuthScreen for unauthenticated users.
 * Redirects authenticated users straight to /app.
 */
export default function LoginPage() {
  const { token } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/app", { replace: true });
    }
  }, [token, navigate]);

  // Don't flash auth screen while redirect is in flight
  if (token) return null;

  return (
    <>
      <AuthScreen />
    </>
  );
}
