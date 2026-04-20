"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const isMounted = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Track mount status (fix for your error)
  useEffect(() => {
    isMounted.current = true;

    const savedEmail = localStorage.getItem("rma_email");
    if (savedEmail) setEmail(savedEmail);

    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetState = (fn: () => void) => {
    if (isMounted.current) fn();
  };

  // ✅ Login handler (safe)
  const handleLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      setMessage("Email and password are required");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Enter a valid email");
      return;
    }

    safeSetState(() => {
      setLoading(true);
      setMessage("");
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      safeSetState(() => {
        if (error.message.toLowerCase().includes("invalid")) {
          setMessage("Invalid email or password");
        } else {
          setMessage("Login failed. Try again.");
        }
        setLoading(false);
      });
      return;
    }

    if (!data.session?.user) {
      safeSetState(() => {
        setMessage("Login failed. No session.");
        setLoading(false);
      });
      return;
    }

    if (remember) {
      localStorage.setItem("rma_email", email);
    } else {
      localStorage.removeItem("rma_email");
    }

    // No state update after this → safe redirect
    router.replace("/dashboard");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Reverse Logistics</h1>
        <p style={styles.subtitle}>Sign in to continue</p>

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember me
        </label>

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
          onClick={handleLogin}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f2f5",
    fontFamily: "sans-serif",
  },
  card: {
    width: 360,
    padding: 24,
    background: "white",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },
  checkbox: {
    display: "flex",
    gap: 8,
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#1d4ed8",
    color: "white",
    border: "none",
    borderRadius: 8,
  },
  message: {
    marginTop: 10,
    fontSize: 13,
    color: "#555",
  },
};