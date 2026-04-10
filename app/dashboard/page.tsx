"use client";

/**
 * Orders Dashboard Page
 * ---------------------
 * Displays all user orders with filtering.
 * Users can:
 * - View order details
 * - Track RMAs
 * - Create new RMA requests
 */


import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState("sales_order");
  const [searchText, setSearchText] = useState("");

  const mockRmaOrders = ["1", "3"];

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        window.location.href = "/";
        return;
      }

      setUser(userData.user);

      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items (id, initial_purchased_quantity, returnable_quantity_left)`)
        .eq("user_id", userData.user.id);

      if (!error && data) {
        setOrders(data);
        setFilteredOrders(data);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    if (!searchText) return setFilteredOrders(orders);

    const filtered = orders.filter((order) => {
      if (filterType === "sales_order") {
        return order.sales_order?.toLowerCase().includes(searchText.toLowerCase());
      }

      if (filterType === "order_date") {
        return new Date(order.order_date)
          .toLocaleDateString()
          .toLowerCase()
          .includes(searchText.toLowerCase());
      }

      return true;
    });

    setFilteredOrders(filtered);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div style={pageBg}>
        <div style={loadingWrap}>
          <div style={spinner} />
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={pageBg}>
      <div style={container}>

        {/* HEADER */}
        <div style={header}>
          <div>
            <h1 style={title}>Orders Dashboard</h1>
            <p style={subtitle}>Manage orders and return requests</p>
          </div>

          <button onClick={handleLogout} style={dangerBtn}>
            Logout
          </button>
        </div>

        <p style={userText}>Logged in as: {user?.email}</p>

        {/* FILTER CARD */}
        <div style={card}>
          <div style={filterRow}>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={input}
            >
              <option value="sales_order">Sales Order</option>
              <option value="order_date">Order Date</option>
            </select>

            <input
              type="text"
              placeholder="Search orders..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={input}
            />

            <button onClick={handleSearch} style={primaryBtn}>
              Search
            </button>

          </div>
        </div>

        {/* TABLE */}
        <div style={card}>
          {filteredOrders.length === 0 ? (
            <div style={emptyState}>No orders found</div>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Sales Order</th>
                  <th style={th}>Date</th>
                  <th style={th}>Items</th>
                  <th style={th}>Returnable</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const hasRMA = mockRmaOrders.includes(String(order.id));
                  const totalItems = order.order_items?.length || 0;

                  const returnableItems =
                    order.order_items?.filter(
                      (i: any) => i.returnable_quantity_left > 0
                    ).length || 0;

                  return (
                    <tr key={order.id} style={row}>
                      <td
                        style={link}
                        onClick={() => (window.location.href = `/orders/${order.id}`)}
                      >
                        {order.sales_order}
                      </td>

                      <td style={td}>
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>

                      <td style={td}>{totalItems}</td>
                      <td style={td}>{returnableItems}</td>

                      <td style={td}>
                        <div style={actionWrap}>

                          {hasRMA && (
                            <button
                              onClick={() => (window.location.href = `/rma/${order.id}`)}
                              style={secondaryBtn}
                            >
                              Track
                            </button>
                          )}

                          <button
                            onClick={() =>
                              (window.location.href = `/rma/create?orderId=${order.id}`)
                            }
                            style={primaryBtn}
                          >
                            Create RMA
                          </button>

                        </div>
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
  maxWidth: "1200px",
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

const userText: any = {
  marginBottom: "16px",
  fontSize: "13px",
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

const filterRow: any = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const input: any = {
  padding: "9px 10px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontSize: "13px",
  outline: "none",
  transition: "0.15s",
};

const primaryBtn: any = {
  background: "#1d4ed8",
  color: "#fff",
  border: "none",
  padding: "9px 14px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtn: any = {
  background: "#f0fdf4",
  color: "#16a34a",
  border: "1px solid #bbf7d0",
  padding: "8px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  cursor: "pointer",
};

const dangerBtn: any = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "8px",
  fontSize: "13px",
  cursor: "pointer",
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

const link: any = {
  ...td,
  color: "#1d4ed8",
  fontWeight: 600,
  cursor: "pointer",
};

const row: any = {
  transition: "0.15s",
};

const actionWrap: any = {
  display: "flex",
  gap: "8px",
};

const emptyState: any = {
  textAlign: "center",
  padding: "40px",
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