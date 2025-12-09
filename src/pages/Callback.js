import React, { useEffect } from "react";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

function Callback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      console.error("Spotify error:", error);
      window.location.href = "/";
      return;
    }

    if (code) {
      fetch(`${API_BASE_URL}/api/auth/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem("spotify_token", data.access_token);
          }
          window.location.href = "/";
        })
        .catch((err) => {
          console.error("Exchange error:", err);
          window.location.href = "/";
        });
    } else {
      window.location.href = "/";
    }
  }, []);

  return <div>Authenticating...</div>;
}

export default Callback;
