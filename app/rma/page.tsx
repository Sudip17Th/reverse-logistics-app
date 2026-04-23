"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function MyRMAsPage() {
  const router = useRouter();

  const [rmas, setRmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH RMAs
  useEffect(() => {
    const fetchRmas = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      // ✅ JOIN ITEMS PROPERLY
      const { data, error } = await supabase
        .from("rma_requests")
        .select(`
          *,
          rma_items (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching RMAs:", error);
        setLoading(false);
        return;
      }

      // ✅ COMPUTE ITEM COUNT
      const enriched = (data || []).map((rma: any) => ({
        ...rma,
        total_items: rma.rma_items?.length || 0,
      }));

      setRmas(enriched);
      setLoading(false);
    };

    fetchRmas();
  }, [router]);

  // ✅ CANCEL RMA (FIXED: now uses RPC)
  const handleCancel = async (rmaId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this RMA?"
    );

    if (!confirmCancel) return;

    const { error } = await supabase.rpc("cancel_rma", {
      p_rma_id: rmaId,
      p_reason: "User cancelled",
      p_comments: "",
    });

    if (error) {
      console.error("Cancel error:", error);
      alert("Failed to cancel RMA");
      return;
    }

    // ✅ Update UI instantly
    setRmas((prev) =>
      prev.map((rma) =>
        rma.id === rmaId
          ? { ...rma, status: "cancelled" }
          : rma
      )
    );
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My RMAs</h1>

      {rmas.length === 0 ? (
        <p>No RMAs found.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>RMA Number</th>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rmas.map((rma) => (
              <tr key={rma.id}>
                <td>{rma.rma_number}</td>

                <td>{rma.order_id}</td>

                <td>
                  {new Date(rma.created_at).toLocaleString()}
                </td>

                <td>
                  <span
                    style={{
                      ...styles.status,
                      background:
                        rma.status === "cancelled"
                          ? "#fee2e2"
                          : "#dcfce7",
                      color:
                        rma.status === "cancelled"
                          ? "#b91c1c"
                          : "#166534",
                    }}
                  >
                    {rma.status || "submitted"}
                  </span>
                </td>

                <td>{rma.total_items}</td>

                <td>
                  <button
                    style={styles.viewBtn}
                    onClick={() =>
                      router.push(`/rma/${rma.id}`)
                    }
                  >
                    View
                  </button>

                  {rma.status !== "cancelled" && (
                    <button
                      style={styles.cancelBtn}
                      onClick={() => handleCancel(rma.id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ✅ SIMPLE CLEAN STYLES
const styles: any = {
  container: {
    padding: 24,
    fontFamily: "sans-serif",
  },
  title: {
    marginBottom: 16,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  status: {
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
  },
  viewBtn: {
    padding: "6px 10px",
    marginRight: 8,
    border: "none",
    borderRadius: 6,
    background: "#1d4ed8",
    color: "white",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "6px 10px",
    border: "none",
    borderRadius: 6,
    background: "#dc2626",
    color: "white",
    cursor: "pointer",
  },
};