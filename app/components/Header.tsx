"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // FETCH USER
  // -----------------------------
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  // -----------------------------
  // ACTIVE LINK HELPER
  // -----------------------------
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header style={styles.header}>
      {/* LEFT: LOGO */}
      <div style={styles.left}>
        <span
          style={styles.logo}
          onClick={() => router.push("/dashboard")}
        >
          Reverse Logistics
        </span>
      </div>

      {/* RIGHT: NAV + USER */}
      <div style={styles.right}>
        {/* NAV LINKS */}
        <nav style={styles.nav}>
          <button
            style={{
              ...styles.link,
              ...(isActive("/dashboard") ? styles.active : {}),
            }}
            onClick={() => router.push("/dashboard")}
          >
            Create RMA
          </button>

          <button
            style={{
              ...styles.link,
              ...(pathname.startsWith("/rma") &&
              pathname === "/rma"
                ? styles.active
                : {}),
            }}
            onClick={() => router.push("/rma")}
          >
            My RMAs
          </button>
        </nav>

        {/* USER INFO */}
        {!loading && user && (
          <div style={styles.user}>
            <span style={styles.email}>
              {user.email}
            </span>

            <button
              style={styles.logout}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const styles: any = {
  header: {
    width: "100%",
    height: 60,
    padding: "0 24px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ffffff",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },

  left: {
    display: "flex",
    alignItems: "center",
  },

  logo: {
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 24,
  },

  nav: {
    display: "flex",
    gap: 16,
  },

  link: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    padding: "6px 10px",
    borderRadius: 6,
    color: "#374151",
  },

  active: {
    background: "#e0e7ff",
    color: "#1d4ed8",
  },

  user: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  email: {
    fontSize: 12,
    color: "#6b7280",
  },

  logout: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
};