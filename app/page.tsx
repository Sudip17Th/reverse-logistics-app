"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🚀 AUTO REDIRECT IF LOGGED IN
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        window.location.href = "/dashboard";
      }
    };

    checkUser();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Login successful 🎉 Redirecting...");
      window.location.href = "/dashboard";
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: "120px auto", textAlign: "center" }}>
      <h1>Reverse Logistics Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 20 }}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
}