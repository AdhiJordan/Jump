import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Read user and token from query params
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get("user");
    const tokenParam = params.get("token");

    if (userParam && tokenParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        setUser(userData);
        setToken(tokenParam);

        // Clean URL to remove tokens from address bar
        window.history.replaceState({}, document.title, "/");
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }, []);

  return (
    <div>
      {!user ? (
        <button
          onClick={() =>
            (window.location.href = "https://jump-mcmg.vercel.app/auth/google")
          }
        >
          Sign in with Google (Redirect)
        </button>
      ) : (
        <>
          <h2>Welcome, {user.email}</h2>
          {/* Pass token and user to Dashboard */}
          <Dashboard token={token} user={user} />
        </>
      )}
    </div>
  );
}

export default App;
