"use client";

/**
 * Order Details Page
 * ------------------
 * PURPOSE:
 * Shows full order breakdown with items and return eligibility.
 *
 * FEATURES:
 * - Order summary (sales order, date)
 * - List of purchased items
 * - Returnable quantity tracking
 * - Direct navigation to Create RMA
 * - Back navigation to dashboard
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function OrderDetails() {
  const params = useParams();

  const orderId =
    typeof params?.id === "string" ? params.id : params?.id?.[0];

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;

      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderData) setOrder(orderData);

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      setItems(itemsData || []);
      setLoading(false);
    };

    fetchOrderData();
  }, [orderId]);

  if (loading) {
    return (
      <div style={pageBg}>
        <div style={loadingWrap}>
          <div style={spinner} />
          <span>Loading order...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={pageBg}>
        <div style={loadingWrap}>Order not found</div>
      </div>
    );
  }

  return (
    <div style={pageBg}>
      <div style={container}>

        {/* HEADER */}
        <div style={header}>
          <div>
            <h1 style={title}>Order #{order.sales_order}</h1>
            <p style={subtitle}>Order details and return eligibility</p>
          </div>

          <button
            onClick={() => (window.location.href = "/dashboard")}
            style={secondaryBtn}
          >
            ← Back
          </button>
        </div>

        {/* ORDER SUMMARY */}
        <div style={card}>
          <div style={sectionTitle}>Order Summary</div>

          <div style={summaryGrid}>
            <div>
              <div style={label}>Sales Order</div>
              <div style={valueMono}>{order.sales_order}</div>
            </div>

            <div>
              <div style={label}>Order Date</div>
              <div style={value}>
                {new Date(order.order_date).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div style={label}>Total Items</div>
              <div style={value}>{items.length}</div>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div style={card}>
          <div style={sectionTitle}>
            Order Items ({items.length})
          </div>

          {items.length === 0 ? (
            <div style={emptyState}>No items found</div>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Product</th>
                  <th style={th}>SKU</th>
                  <th style={th}>Purchased</th>
                  <th style={th}>Returnable</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const isReturnable =
                    item.returnable_quantity_left > 0;

                  return (
                    <tr
                      key={item.id}
                      style={row}
                    >
                      <td style={tdBold}>{item.product_name}</td>
                      <td style={tdMono}>{item.sku}</td>
                      <td style={td}>{item.initial_purchased_quantity}</td>
                      <td style={td}>{item.returnable_quantity_left}</td>

                      <td style={td}>
                        {isReturnable ? (
                          <button
                            onClick={() =>
                              (window.location.href =
                                `/rma/create?orderId=${order.id}&itemId=${item.id}`)
                            }
                            style={primaryBtn}
                          >
                            Create RMA
                          </button>
                        ) : (
                          <span style={mutedText}>Not returnable</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

/* ================= CONSISTENT UI THEME ================= */

const pageBg: any = {
  background: "#f0f2f5",
  minHeight: "100vh",
  padding: "32px 24px",
  fontFamily: "'DM Sans', sans-serif",
};

const container: any = {
  maxWidth: "1100px",
  margin: "0 auto",
};

const header: any = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const title: any = {
  fontSize: "26px",
  fontWeight: 700,
  color: "#0f172a",
};

const subtitle: any = {
  fontSize: "14px",
  color: "#6b7280",
};

const card: any = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const sectionTitle: any = {
  fontSize: "14px",
  fontWeight: 600,
  marginBottom: "12px",
  color: "#111827",
};

const summaryGrid: any = {
  display: "flex",
  gap: "40px",
  flexWrap: "wrap",
};

const label: any = {
  fontSize: "11px",
  color: "#9ca3af",
  textTransform: "uppercase",
  marginBottom: "4px",
};

const value: any = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#111827",
};

const valueMono: any = {
  ...value,
  fontFamily: "'DM Mono', monospace",
  color: "#1d4ed8",
};

const table: any = {
  width: "100%",
  borderCollapse: "collapse",
};

const th: any = {
  textAlign: "left",
  padding: "10px",
  fontSize: "12px",
  color: "#6b7280",
  borderBottom: "1px solid #e5e7eb",
};

const td: any = {
  padding: "12px 10px",
  fontSize: "13px",
  borderBottom: "1px solid #f1f5f9",
  color: "#111827",
};

const tdBold: any = {
  ...td,
  fontWeight: 600,
};

const tdMono: any = {
  ...td,
  fontFamily: "'DM Mono', monospace",
  color: "#374151",
};

const row: any = {
  transition: "0.15s",
};

const primaryBtn: any = {
  background: "#1d4ed8",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtn: any = {
  background: "#fff",
  color: "#374151",
  border: "1px solid #e5e7eb",
  padding: "8px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  cursor: "pointer",
};

const mutedText: any = {
  fontSize: "13px",
  color: "#9ca3af",
};

const emptyState: any = {
  padding: "30px",
  textAlign: "center",
  color: "#9ca3af",
};

const loadingWrap: any = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "80px",
  color: "#6b7280",
};

const spinner: any = {
  width: "18px",
  height: "18px",
  border: "2px solid #e5e7eb",
  borderTop: "2px solid #1d4ed8",
  borderRadius: "50%",
  animation: "spin 0.7s linear infinite",
};