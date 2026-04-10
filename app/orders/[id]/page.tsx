"use client";

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

      console.log("ORDER ID:", orderId);

      // 📦 Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError) {
        console.error("ORDER ERROR:", orderError);
      } else {
        setOrder(orderData);
      }

      // 📦 Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      console.log("ITEMS:", itemsData);
      console.log("ITEM ERROR:", itemsError);

      if (!itemsError) {
        setItems(itemsData || []);
      }

      setLoading(false);
    };

    fetchOrderData();
  }, [orderId]);

  if (loading) {
    return <p style={{ padding: 40 }}>Loading order...</p>;
  }

  if (!order) {
    return <p style={{ padding: 40 }}>Order not found</p>;
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      
      {/* HEADER */}
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        Order Details
      </h1>

      <div style={{ marginTop: 10, marginBottom: 30 }}>
        <p>
          <strong>Sales Order:</strong> {order.sales_order}
        </p>
        <p>
          <strong>Order Date:</strong>{" "}
          {new Date(order.order_date).toLocaleDateString()}
        </p>
      </div>

      {/* ITEMS TABLE */}
      <h2 style={{ marginBottom: 10 }}>Items</h2>

      {items.length === 0 ? (
        <p>No items found</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={thStyle}>Product Name</th>
              <th style={thStyle}>SKU</th>
              <th style={thStyle}>Initial Qty</th>
              <th style={thStyle}>Returnable Left</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.product_name}</td>
                <td style={tdStyle}>{item.sku}</td>
                <td style={tdStyle}>
                  {item.initial_purchased_quantity}
                </td>
                <td style={tdStyle}>
                  {item.returnable_quantity_left}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// 🎨 Styles
const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  fontWeight: "bold",
  textAlign: "center" as const,
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center" as const,
};