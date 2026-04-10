"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState("sales_order");
  const [searchText, setSearchText] = useState("");

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
        .select("*")
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
    if (!searchText) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter((order) => {
      if (filterType === "sales_order") {
        return order.sales_order
          ?.toLowerCase()
          .includes(searchText.toLowerCase());
      }

      if (filterType === "order_date") {
        const formattedDate = new Date(order.order_date)
          .toLocaleDateString()
          .toLowerCase();
        return formattedDate.includes(searchText.toLowerCase());
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
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1
          style={{
            fontSize: "34px",
            fontWeight: "bold",
            marginBottom: 30,
          }}
        >
          Orders Dashboard
        </h1>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#e53935",
            color: "#fff",
            padding: "10px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            height: "fit-content",
          }}
        >
          Logout
        </button>
      </div>

      {/* USER */}
      <p style={{ marginBottom: 20 }}>Welcome: {user?.email}</p>

      {/* FILTER BOX */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
          backgroundColor: "#fafafa",
        }}
      >
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        >
          <option value="sales_order">Sales Order</option>
          <option value="order_date">Order Date</option>
        </select>

        <input
          type="text"
          placeholder="Enter search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          style={{ padding: 8, marginRight: 10 }}
        />

        <button
          onClick={handleSearch}
          style={{
            padding: "8px 16px",
            backgroundColor: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Search
        </button>
      </div>

      {/* TABLE */}
      {filteredOrders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={thStyle}>Sales Order</th>
              <th style={thStyle}>Order Date</th>
              <th style={thStyle}>Items Purchased</th>
              <th style={thStyle}>Returnable Left</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td style={tdStyle}>
                  <span
                    onClick={() =>
                      (window.location.href = `/orders/${order.id}`)
                    }
                    style={{
                      color: "#1976d2",
                      fontWeight: "bold",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {order.sales_order}
                  </span>
                </td>

                <td style={tdStyle}>
                  {new Date(order.order_date).toLocaleDateString()}
                </td>

                <td style={tdStyle}>
                  {order.items_purchased_initially}
                </td>

                <td style={tdStyle}>
                  {order.items_left_for_return}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// STYLES (safe version, no TS issues)
const thStyle: any = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "center",
  fontWeight: "bold",
};

const tdStyle: any = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "center",
};