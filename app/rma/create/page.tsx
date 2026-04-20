"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import "../../../styles/rma.css";

export default function CreateRMA() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMounted = useRef(false);

  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    isMounted.current = true;

    const fetchData = async () => {
      if (!orderId) {
        router.replace("/dashboard");
        return;
      }

      // ✅ Auth check
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      setUser(user);

      // ✅ Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError || !orderData) {
        router.replace("/dashboard");
        return;
      }

      // ✅ Fetch ONLY returnable items from VIEW
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items_with_returnable")
        .select("*")
        .eq("order_id", orderId)
        .gt("returnable_quantity", 0);

      if (itemsError) {
        console.error(itemsError);
        router.replace("/dashboard");
        return;
      }

      if (isMounted.current) {
        setOrder(orderData);
        setItems(itemsData || []);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [orderId, router]);

  // -----------------------------
  // TOGGLE ITEM
  // -----------------------------
  const handleToggle = (id: string, max: number) => {
    setSelectedItems((prev: any) => {
      const updated = { ...prev };

      if (updated[id]) {
        delete updated[id];
      } else {
        updated[id] = {
          qty: 1,
          reason: "",
          comments: "",
          max,
        };
      }

      return updated;
    });
  };

  // -----------------------------
  // HANDLE CHANGE
  // -----------------------------
  const handleChange = (
    id: string,
    field: string,
    value: any,
    max: number
  ) => {
    if (field === "qty") {
      if (value > max) value = max;
      if (value < 1) value = 1;
    }

    setSelectedItems((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // -----------------------------
  // FILTER
  // -----------------------------
  const filteredItems = items.filter((item) =>
    `${item.product_name} ${item.sku}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const selectedCount = Object.keys(selectedItems).length;

  // -----------------------------
  // VALIDATE & MOVE TO REVIEW
  // -----------------------------
  const handleSubmit = async () => {
    if (submitting) return;

    const entries = Object.entries(selectedItems);

    if (entries.length === 0) {
      alert("Select at least one item.");
      return;
    }

    const hasMissingReason = entries.some(
      ([_, val]: any) => !val.reason
    );

    if (hasMissingReason) {
      alert("Select reason for all items.");
      return;
    }

    setSubmitting(true);

    // ✅ Prepare payload for review
    const payload = entries.map(([id, val]: any) => ({
      order_item_id: id,
      quantity: val.qty,
      reason: val.reason,
      comments: val.comments || "",
    }));

    sessionStorage.setItem(
      "rma_draft",
      JSON.stringify({
        order,
        items: payload,
        user,
      })
    );

    router.push("/rma/review");
  };

  if (loading) {
    return (
      <div className="rma-page">
        <div className="rma-loading">
          <div className="rma-spinner" />
          <span>Loading order details…</span>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rma-page">
        <div className="rma-container">
          <h2>No returnable items available</h2>
          <button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rma-page">
      <div className="rma-container">

        {/* HEADER */}
        <div className="rma-header">
          <div className="rma-header-left">
            <button
              className="rma-back-btn"
              onClick={() => router.back()}
            >
              Back
            </button>

            <div className="rma-breadcrumb">
              <span className="rma-breadcrumb-dim">
                Orders
              </span>
              <span className="rma-breadcrumb-sep">/</span>
              <span className="rma-breadcrumb-dim">
                {order?.sales_order}
              </span>
              <span className="rma-breadcrumb-sep">/</span>
              <span>Create RMA</span>
            </div>
          </div>

          <div className="rma-header-right">
            <div className="rma-badge">
              {selectedCount} item
              {selectedCount !== 1 ? "s" : ""} selected
            </div>

            <button
              className="rma-submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Validating..." : "Validate"}
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div style={{ marginBottom: 16 }}>
          <input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ITEMS */}
        <div className="rma-items">
          {filteredItems.map((item) => {
            const selected = selectedItems[item.id];
            const max = item.returnable_quantity;

            return (
              <div
                key={item.id}
                className={`rma-item${
                  selected ? " rma-item--selected" : ""
                }`}
              >
                <div className="rma-item-left">
                  <div
                    className={`rma-checkbox${
                      selected ? " rma-checkbox--checked" : ""
                    }`}
                    onClick={() => handleToggle(item.id, max)}
                  >
                    {selected && "✓"}
                  </div>

                  <div className="rma-item-info">
                    <div className="rma-item-name">
                      {item.product_name}
                    </div>

                    <div className="rma-item-meta">
                      <span className="rma-tag">
                        SKU: {item.sku}
                      </span>
                      <span className="rma-tag">
                        Ordered:{" "}
                        {item.initial_purchased_quantity}
                      </span>
                      <span className="rma-tag rma-tag--success">
                        Returnable: {max}
                      </span>
                    </div>
                  </div>
                </div>

                {selected && (
                  <div className="rma-item-controls">
                    <div className="rma-qty-control">
                      <button
                        onClick={() =>
                          handleChange(
                            item.id,
                            "qty",
                            selected.qty - 1,
                            max
                          )
                        }
                        disabled={selected.qty <= 1}
                      >
                        -
                      </button>

                      <span>{selected.qty}</span>

                      <button
                        onClick={() =>
                          handleChange(
                            item.id,
                            "qty",
                            selected.qty + 1,
                            max
                          )
                        }
                        disabled={selected.qty >= max}
                      >
                        +
                      </button>

                      <span>/ {max}</span>
                    </div>

                    <select
                      value={selected.reason}
                      onChange={(e) =>
                        handleChange(
                          item.id,
                          "reason",
                          e.target.value,
                          max
                        )
                      }
                    >
                      <option value="">Reason</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Wrong Item">Wrong Item</option>
                      <option value="Not Needed">Not Needed</option>
                    </select>

                    <input
                      placeholder="Comments"
                      value={selected.comments}
                      onChange={(e) =>
                        handleChange(
                          item.id,
                          "comments",
                          e.target.value,
                          max
                        )
                      }
                    />
                  </div>
                )}

                {!selected && (
                  <button
                    onClick={() => handleToggle(item.id, max)}
                  >
                    Add to return
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}