"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState("sales_order");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      setUser(user);

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("order_date", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setLoading(false);
        return;
      }

      const { data: returnableData, error: returnableError } = await supabase
        .from("order_items_with_returnable")
        .select("*");

      if (returnableError) {
        console.error("Error fetching returnable items:", returnableError);
        setLoading(false);
        return;
      }

      const enriched = (ordersData || []).map((order: any) => {
        const items = (returnableData || []).filter(
          (r: any) => r.order_id === order.id
        );

        const totalItems = items.length;
        const returnableItems = items.filter(
          (i: any) => i.returnable_quantity > 0
        ).length;

        const canCreateRMA = returnableItems > 0;

        return {
          ...order,
          totalItems,
          returnableItems,
          canCreateRMA,
        };
      });

      setOrders(enriched);
      setFilteredOrders(enriched);
      setLoading(false);
    };

    fetchData();
  }, [router]);

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
        return new Date(order.order_date)
          .toLocaleDateString()
          .toLowerCase()
          .includes(searchText.toLowerCase());
      }

      return true;
    });

    setFilteredOrders(filtered);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1>Orders Dashboard</h1>

      <p>Logged in as: {user?.email}</p>

      {/* 🔍 Search */}
      <div style={styles.searchBar}>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="sales_order">Sales Order</option>
          <option value="order_date">Order Date</option>
        </select>

        <input
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <button onClick={handleSearch}>Search</button>
      </div>

      {/* 📦 Orders Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Sales Order</th>
            <th>Date</th>
            <th>Total Items</th>
            <th>Returnable Items</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.sales_order}</td>
              <td>
                {new Date(order.order_date).toLocaleDateString()}
              </td>
              <td>{order.totalItems}</td>
              <td>{order.returnableItems}</td>

              <td>
                <button
                  disabled={!order.canCreateRMA}
                  style={{
                    ...styles.button,
                    background: order.canCreateRMA
                      ? "#1d4ed8"
                      : "#9ca3af",
                    cursor: order.canCreateRMA
                      ? "pointer"
                      : "not-allowed",
                  }}
                  onClick={() =>
                    router.push(`/rma/create?orderId=${order.id}`)
                  }
                >
                  {order.canCreateRMA
                    ? "Create RMA"
                    : "No Returns Available"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: any = {
  container: {
    padding: 20,
    fontFamily: "sans-serif",
  },
  searchBar: {
    marginBottom: 16,
    display: "flex",
    gap: 8,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  button: {
    padding: "6px 10px",
    border: "none",
    borderRadius: 6,
    color: "white",
  },
};