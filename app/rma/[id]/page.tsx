"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function RmaDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const isMounted = useRef(false);

  const [rma, setRma] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isMounted.current = true;

    const fetchRMA = async () => {
      if (!id) return;

      setLoading(true);

      // ✅ Auth check
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      // ✅ Fetch RMA (secure: user-specific)
      const { data: rmaData, error: rmaError } = await supabase
        .from("rma_requests")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (rmaError || !rmaData) {
        if (isMounted.current) {
          setLoading(false);
          setRma(null);
        }
        return;
      }

      // ✅ Fetch RMA items
      const { data: itemData, error: itemError } = await supabase
        .from("rma_items")
        .select("*")
        .eq("rma_id", id);

      if (itemError) {
        console.error(itemError);
      }

      if (isMounted.current) {
        setRma(rmaData);
        setItems(itemData || []);
        setLoading(false);
      }
    };

    fetchRMA();

    return () => {
      isMounted.current = false;
    };
  }, [id, router]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading RMA details...</div>
      </div>
    );
  }

  if (!rma) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>RMA not found</h2>
          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* HEADER */}
        <button
          style={styles.back}
          onClick={() => router.push("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <h2 style={styles.success}>Created Successfully!</h2>

        <div style={styles.meta}>
          <p><b>RMA Number:</b> {rma.rma_number}</p>
          <p><b>Status:</b> {rma.status}</p>
          <p><b>Order ID:</b> {rma.order_id}</p>
          <p>
            <b>Created At:</b>{" "}
            {new Date(rma.created_at).toLocaleString()}
          </p>
          <p>
            <b>Returned Items:</b> {items.length}
          </p>
        </div>

        {/* ITEMS LIST */}
        <div style={styles.items}>
          <h3>Item Details</h3>

          {items.map((item) => (
            <div key={item.id} style={styles.item}>
              <div style={styles.itemTitle}>
                {item.product_name}
              </div>

              <div style={styles.itemMeta}>
                <span>SKU: {item.sku}</span>
                <span>Qty: {item.quantity}</span>
                <span>Reason: {item.reason}</span>
              </div>

              {item.comments && (
                <div style={styles.comment}>
                  Notes: {item.comments}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    fontFamily: "sans-serif",
  },
  card: {
    width: 500,
    background: "white",
    padding: 24,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
  },
  back: {
    marginBottom: 10,
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
  },
  success: {
    color: "#16a34a",
    marginBottom: 16,
  },
  meta: {
    fontSize: 14,
    marginBottom: 20,
  },
  items: {
    marginTop: 10,
  },
  item: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  itemTitle: {
    fontWeight: 600,
    marginBottom: 4,
  },
  itemMeta: {
    display: "flex",
    gap: 12,
    fontSize: 13,
    color: "#555",
  },
  comment: {
    marginTop: 6,
    fontSize: 13,
    color: "#333",
  },
};