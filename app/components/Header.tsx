"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Button from "./ui/Button";

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

  return (
    <header
      style={{
        width: "100%",
        height: 60,
        padding: "0 20px",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* LEFT: LOGO */}
      <div
        style={{ fontWeight: 700, cursor: "pointer" }}
        onClick={() => router.push("/dashboard")}
      >
        Reverse Logistics
      </div>

      {/* RIGHT: NAV + USER */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* NAV */}
        <Button
          variant={pathname === "/dashboard" ? "primary" : "ghost"}
          onClick={() => router.push("/dashboard")}
        >
          Create RMA
        </Button>

        <Button
          variant={pathname === "/rma" ? "primary" : "ghost"}
          onClick={() => router.push("/rma")}
        >
          My RMAs
        </Button>

        {/* USER SECTION */}
        {!loading && user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginLeft: 10,
              paddingLeft: 10,
              borderLeft: "1px solid #e5e7eb",
            }}
          >
            {/* PROFILE ICON */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#1d4ed8",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {user.email?.charAt(0).toUpperCase()}
            </div>

            {/* EMAIL */}
            <span
              style={{
                fontSize: 12,
                color: "#6b7280",
                maxWidth: 140,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </span>

            {/* LOGOUT */}
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}