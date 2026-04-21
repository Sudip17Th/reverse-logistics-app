"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import "../../../styles/rma.css";

export default function CreateRMA() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [returnReasons, setReturnReasons] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        router.replace("/dashboard");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      const { data: itemsData } = await supabase
        .from("order_items_with_returnable")
        .select("*")
        .eq("order_id", orderId)
        .gt("returnable_quantity", 0);

      const { data: reasonsData } = await supabase
        .from("return_reasons")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      setOrder(orderData);
      setItems(itemsData || []);
      setReturnReasons(reasonsData || []);
      setLoading(false);
    };

    fetchData();
  }, [orderId, router]);

  // ✅ TOGGLE ITEM
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

  // ✅ CHANGE HANDLER
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

  const filteredItems = items.filter((item) =>
    `${item.product_name} ${item.sku}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const selectedCount = Object.keys(selectedItems).length;

  // ✅ SUBMIT → SAVE DRAFT
  const handleSubmit = () => {
    const entries = Object.entries(selectedItems);

    if (entries.length === 0) {
      alert("Select at least one item.");
      return;
    }

    const hasMissingReason = entries.some(
      ([_, val]: any) => !val.reason
    );

    if (hasMissingReason) {
      alert("Please select return reason for all items.");
      return;
    }

    setSubmitting(true);

    // 🔥 STORE ONLY WHAT YOU NEED
    sessionStorage.setItem(
      "rma_draft",
      JSON.stringify({
        order,
        selectedItems,
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

        <div className="rma-header">
          <div className="rma-header-left">
            <button
              className="rma-back-btn"
              onClick={() => router.back()}
            >
              ← Back
            </button>

            <div className="rma-breadcrumb">
              <span className="rma-breadcrumb-dim">Orders</span>
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
              Validate
            </button>
          </div>
        </div>

        <input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="rma-items">
          {filteredItems.map((item) => {
            const selected = selectedItems[item.id];
            const max = item.returnable_quantity;

            return (
              <div
                key={item.id}
                className={`rma-item ${
                  selected ? "rma-item--selected" : ""
                }`}
              >
                <div className="rma-item-left">
                  <div
                    className={`rma-checkbox ${
                      selected ? "rma-checkbox--checked" : ""
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
                      <span className="rma-tag">SKU: {item.sku}</span>
                      <span className="rma-tag">
                        Ordered: {item.initial_purchased_quantity}
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
                          handleChange(item.id, "qty", selected.qty - 1, max)
                        }
                      >
                        -
                      </button>

                      <span>{selected.qty}</span>

                      <button
                        onClick={() =>
                          handleChange(item.id, "qty", selected.qty + 1, max)
                        }
                      >
                        +
                      </button>

                      <span>/ {max}</span>
                    </div>

                    <select
                      value={selected.reason || ""}
                      onChange={(e) =>
                        handleChange(item.id, "reason", e.target.value, max)
                      }
                    >
                      <option value="">Select reason</option>
                      {returnReasons.map((r) => (
                        <option key={r.id} value={r.code}>
                          {r.label}
                        </option>
                      ))}
                    </select>

                    <input
                      placeholder="Comments"
                      value={selected.comments || ""}
                      onChange={(e) =>
                        handleChange(item.id, "comments", e.target.value, max)
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}