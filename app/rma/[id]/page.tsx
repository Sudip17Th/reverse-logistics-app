"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type RMA = {
  id: string;
  rma_number: string;
  order_id: string;
  status: string;
  created_at: string;
};

type RMAItem = {
  id: string;
  product_name: string;
  sku: string;
  quantity: number;
  reason: string;
  comments?: string;
};

export default function RMADetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [rma, setRma] = useState<RMA | null>(null);
  const [items, setItems] = useState<RMAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // ✅ Auth check
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/");
          return;
        }

        // ✅ Fetch RMA
        const { data: rmaData, error: rmaError } = await supabase
          .from("rma_requests")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (rmaError || !rmaData) {
          throw new Error("RMA not found or access denied");
        }

        // ✅ Fetch items
        const { data: itemData, error: itemError } = await supabase
          .from("rma_items")
          .select("*")
          .eq("rma_id", id);

        if (itemError) {
          throw new Error("Failed to fetch RMA items");
        }

        if (isMounted) {
          setRma(rmaData);
          setItems(itemData || []);
        }
      } catch (err: any) {
        console.error(err);
        if (isMounted) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, router]);

  // ---------------------------
  // UI STATES
  // ---------------------------

  if (loading) {
    return <div style={styles.loading}>Loading RMA details...</div>;
  }

  if (error) {
    return (
      <div style={styles.errorBox}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!rma) {
    return <div style={styles.errorBox}>RMA not found</div>;
  }

  // ---------------------------
  // MAIN UI
  // ---------------------------

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => router.back()}>
          ← Back
        </button>

        <div style={styles.headerContent}>
          <h1 style={styles.title}>{rma.rma_number}</h1>

          <span
            style={{
              ...styles.badge,
              background:
                rma.status === "cancelled" ? "#fee2e2" : "#dcfce7",
              color:
                rma.status === "cancelled" ? "#991b1b" : "#166534",
            }}
          >
            {rma.status || "submitted"}
          </span>
        </div>
      </div>

      {/* META */}
      <div style={styles.meta}>
        <div>
          <strong>Order ID:</strong> {rma.order_id}
        </div>

        <div>
          <strong>Created:</strong>{" "}
          {new Date(rma.created_at).toLocaleString()}
        </div>

        <div>
          <strong>Total Items:</strong> {items.length}
        </div>
      </div>

      {/* ITEMS */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Returned Items</h2>

        {items.length === 0 ? (
          <p>No items found</p>
        ) : (
          <div style={styles.itemsList}>
            {items.map((item) => (
              <div key={item.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.product}>
                    {item.product_name}
                  </span>
                  <span style={styles.qty}>
                    Qty: {item.quantity}
                  </span>
                </div>

                <div style={styles.metaRow}>
                  <span>SKU: {item.sku}</span>
                  <span>Reason: {item.reason}</span>
                </div>

                {item.comments && (
                  <div style={styles.comment}>
                    {item.comments}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------
// STYLES
// ---------------------------

const styles: any = {
  container: {
    padding: 24,
    fontFamily: "sans-serif",
    maxWidth: 900,
    margin: "0 auto",
  },
  loading: {
    padding: 24,
  },
  errorBox: {
    padding: 24,
    color: "red",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    border: "1px solid #ddd",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
  },
  badge: {
    padding: "4px 8px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
  },
  meta: {
    display: "flex",
    gap: 20,
    marginBottom: 20,
    fontSize: 14,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 12,
    background: "#fff",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  product: {
    fontWeight: 600,
  },
  qty: {
    fontSize: 13,
    color: "#555",
  },
  metaRow: {
    display: "flex",
    gap: 16,
    fontSize: 13,
    color: "#555",
  },
  comment: {
    marginTop: 6,
    fontSize: 13,
    color: "#333",
  },
};