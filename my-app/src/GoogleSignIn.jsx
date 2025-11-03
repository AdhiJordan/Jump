import React, { useCallback } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const clientId =
  "72374069200-sbn1vic1mkm9iapsdi8ilvre057t4k6r.apps.googleusercontent.com";

export default function GoogleSignIn({
  onLoginSuccess = () => {},
  onLoginError = () => {},
}) {
  // Handles Google login success
  const handleSuccess = useCallback(
    async (credentialResponse) => {
      const { credential } = credentialResponse;
      if (!credential) {
        onLoginError("Missing Google credential");
        return;
      }

      try {
        const response = await fetch("http://localhost:4000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: credential }),
        });
        const data = await response.json();

        if (data.success) {
          // Pass both backend user info and the id token to parent
          onLoginSuccess(data.user, credential);
        } else {
          onLoginError(data.error || "Login failed");
        }
      } catch (err) {
        onLoginError(err.message || "Network error during Google login");
      }
    },
    [onLoginSuccess, onLoginError]
  );

  // Handles Google login error
  const handleError = useCallback(
    (error) => {
      onLoginError(error?.error || "Google login failed");
    },
    [onLoginError]
  );

  return (
    <div>
      <button
        onClick={() =>
          (window.location.href = "http://localhost:4000/auth/google")
        }
      >
        Sign in with Google (Redirect)
      </button>
    </div>
    // <GoogleOAuthProvider clientId={clientId}>
    //   <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    // </GoogleOAuthProvider>
  );
}
