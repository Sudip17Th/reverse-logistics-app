"use client";

/**
 * Login Page
 * ---------------------
 * Allows users to log in
 */


import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("rma_email");
    const savedPassword = localStorage.getItem("rma_password");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) window.location.href = "/dashboard";
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
      if (remember) {
        localStorage.setItem("rma_email", email);
        localStorage.setItem("rma_password", password);
      } else {
        localStorage.removeItem("rma_email");
        localStorage.removeItem("rma_password");
      }

      setMessage("Login successful. Redirecting...");
      window.location.href = "/dashboard";
    }

    setLoading(false);
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div className="login-page">
        <div className="login-container">
          <div className="login-card">

            <div className="login-header">
              <h1>Reverse Logistics</h1>
              <p>Sign in to your account</p>
            </div>

            <input
              className="login-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="login-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <button
              className={`login-btn ${loading ? "loading" : ""}`}
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {message && <div className="login-message">{message}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

/* ================= GLOBAL STYLES (MATCH RMA SYSTEM) ================= */

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'DM Sans', sans-serif;
}

.login-page {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.login-header {
  text-align: center;
  margin-bottom: 18px;
}

.login-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.login-header p {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.login-input {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13.5px;
  background: white;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.login-input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
}

.login-remember {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  margin: 8px 0 14px;
}

.login-btn {
  width: 100%;
  background: #1d4ed8;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  box-shadow: 0 1px 3px rgba(29,78,216,0.25);
}

.login-btn:hover:not(:disabled) {
  background: #1e40af;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-message {
  margin-top: 12px;
  font-size: 13px;
  text-align: center;
  color: #6b7280;
}
`;