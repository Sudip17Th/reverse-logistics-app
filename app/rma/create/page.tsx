"use client";

/**
 * Create RMA Page
 * ----------------
 * Enhanced UI – sleek, polished, professional enterprise design.
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function CreateRMA() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<any>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) return;
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user);
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);
      setOrder(orderData);
      setItems(itemsData || []);
      setLoading(false);
    };
    fetchData();
  }, [orderId]);

  const handleToggle = (id: string) => {
    setSelectedItems((prev: any) => {
      const updated = { ...prev };
      if (updated[id]) {
        delete updated[id];
      } else {
        updated[id] = { qty: 1, reason: "", comments: "" };
      }
      return updated;
    });
  };

  const handleSelectAll = () => {
    const returnableItems = items.filter((i) => i.returnable_quantity_left > 0);
    if (Object.keys(selectedItems).length === returnableItems.length) {
      setSelectedItems({});
    } else {
      const all: any = {};
      returnableItems.forEach((item) => {
        all[item.id] = { qty: 1, reason: "", comments: "" };
      });
      setSelectedItems(all);
    }
  };

  const handleChange = (id: string, field: string, value: any, max: number) => {
    if (field === "qty") {
      if (value > max) value = max;
      if (value < 1) value = 1;
    }
    setSelectedItems((prev: any) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const filteredItems = items.filter((item) =>
    `${item.product_name} ${item.sku}`.toLowerCase().includes(search.toLowerCase())
  );

  const returnableCount = items.filter((i) => i.returnable_quantity_left > 0).length;
  const selectedCount = Object.keys(selectedItems).length;
  const allSelected = selectedCount === returnableCount && returnableCount > 0;

  const handleSubmit = async () => {
    const entries = Object.entries(selectedItems);
    if (entries.length === 0) {
      alert("Select at least one item to continue.");
      return;
    }
    const hasMissingReason = entries.some(([_, val]: any) => !val.reason);
    if (hasMissingReason) {
      alert("Please select a return reason for all selected items.");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    console.log("RMA DATA:", selectedItems);
    alert("RMA Submitted successfully.");
    setSubmitting(false);
  };

  if (loading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div className="rma-page">
          <div className="rma-loading">
            <div className="rma-spinner" />
            <span>Loading order details…</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className="rma-page">
        <div className="rma-container">

          {/* HEADER */}
          <div className="rma-header">
            <div className="rma-header-left">
              <button className="rma-back-btn" onClick={() => window.history.back()}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <div className="rma-breadcrumb">
                <span className="rma-breadcrumb-dim">Orders</span>
                <span className="rma-breadcrumb-sep">/</span>
                <span className="rma-breadcrumb-dim">{order?.sales_order}</span>
                <span className="rma-breadcrumb-sep">/</span>
                <span>Create RMA</span>
              </div>
            </div>
            <div className="rma-header-right">
              <div className="rma-badge">
                {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
              </div>
              <button
                className={`rma-submit-btn${submitting ? " rma-submit-btn--loading" : ""}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="rma-btn-spinner" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M2 7.5L6 11.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Submit RMA
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PAGE TITLE */}
          <div className="rma-title-row">
            <h1 className="rma-title">Return Merchandise Authorization</h1>
            <p className="rma-subtitle">Select items to return, specify quantities, and provide return reasons.</p>
          </div>

          {/* ORDER SUMMARY CARD */}
          <div className="rma-order-card">
            <div className="rma-order-card-label">Order Summary</div>
            <div className="rma-order-card-grid">
              <div className="rma-order-field">
                <span className="rma-field-label">Sales Order</span>
                <span className="rma-field-value rma-field-value--mono">{order?.sales_order}</span>
              </div>
              <div className="rma-order-divider" />
              <div className="rma-order-field">
                <span className="rma-field-label">Order Date</span>
                <span className="rma-field-value">
                  {new Date(order?.order_date).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
              </div>
              <div className="rma-order-divider" />
              <div className="rma-order-field">
                <span className="rma-field-label">Account</span>
                <span className="rma-field-value">{user?.email}</span>
              </div>
              <div className="rma-order-divider" />
              <div className="rma-order-field">
                <span className="rma-field-label">Total Items</span>
                <span className="rma-field-value">{items.length} line{items.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="rma-controls">
            <div className="rma-search-wrapper">
              <svg className="rma-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                className="rma-search"
                placeholder="Search by product name or SKU…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="rma-search-clear" onClick={() => setSearch("")}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
            <label className="rma-select-all">
              <div className={`rma-checkbox${allSelected ? " rma-checkbox--checked" : ""}`} onClick={handleSelectAll}>
                {allSelected && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span>Select all returnable</span>
            </label>
          </div>

          {/* ITEMS */}
          <div className="rma-items">
            {filteredItems.length === 0 && (
              <div className="rma-empty">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="8" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 8V6a5 5 0 0110 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p>No items match your search.</p>
              </div>
            )}

            {filteredItems.map((item, index) => {
              const selected = selectedItems[item.id];
              const max = item.returnable_quantity_left;
              const isDisabled = max === 0;

              return (
                <div
                  key={item.id}
                  className={`rma-item${selected ? " rma-item--selected" : ""}${isDisabled ? " rma-item--disabled" : ""}`}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* LEFT: Checkbox + Info */}
                  <div className="rma-item-left">
                    <div
                      className={`rma-checkbox${selected ? " rma-checkbox--checked" : ""}${isDisabled ? " rma-checkbox--disabled" : ""}`}
                      onClick={() => !isDisabled && handleToggle(item.id)}
                    >
                      {selected && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="rma-item-info">
                      <div className="rma-item-name">{item.product_name}</div>
                      <div className="rma-item-meta">
                        <span className="rma-tag">SKU: {item.sku}</span>
                        <span className="rma-tag">Ordered: {item.initial_purchased_quantity}</span>
                        {isDisabled ? (
                          <span className="rma-tag rma-tag--warning">Non-returnable</span>
                        ) : (
                          <span className="rma-tag rma-tag--success">Returnable: {max}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Controls */}
                  <div className={`rma-item-controls${!selected ? " rma-item-controls--hidden" : ""}`}>
                    {/* QTY */}
                    <div className="rma-field-group">
                      <label className="rma-field-label">Quantity</label>
                      <div className="rma-qty-control">
                        <button
                          className="rma-qty-btn"
                          disabled={!selected || (selected?.qty <= 1)}
                          onClick={() => handleChange(item.id, "qty", (selected?.qty || 1) - 1, max)}
                        >−</button>
                        <span className="rma-qty-value">{selected?.qty || 1}</span>
                        <button
                          className="rma-qty-btn"
                          disabled={!selected || (selected?.qty >= max)}
                          onClick={() => handleChange(item.id, "qty", (selected?.qty || 1) + 1, max)}
                        >+</button>
                        <span className="rma-qty-max">/ {max}</span>
                      </div>
                    </div>

                    {/* REASON */}
                    <div className="rma-field-group rma-field-group--reason">
                      <label className="rma-field-label">
                        Reason <span className="rma-required">*</span>
                      </label>
                      <div className="rma-select-wrapper">
                        <select
                          className={`rma-select${selected?.reason ? " rma-select--filled" : ""}`}
                          value={selected?.reason || ""}
                          disabled={!selected}
                          onChange={(e) => handleChange(item.id, "reason", e.target.value, max)}
                        >
                          <option value="">Select reason…</option>
                          <option value="Damaged">Damaged</option>
                          <option value="Wrong Item">Wrong Item</option>
                          <option value="Not Needed">Not Needed</option>
                        </select>
                        <svg className="rma-select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    {/* COMMENTS */}
                    <div className="rma-field-group rma-field-group--comments">
                      <label className="rma-field-label">Comments</label>
                      <input
                        className="rma-input"
                        placeholder="Optional note…"
                        value={selected?.comments || ""}
                        disabled={!selected}
                        onChange={(e) => handleChange(item.id, "comments", e.target.value, max)}
                      />
                    </div>
                  </div>

                  {/* SELECT TOGGLE BUTTON */}
                  {!selected && !isDisabled && (
                    <button className="rma-select-btn" onClick={() => handleToggle(item.id)}>
                      Add to return
                    </button>
                  )}
                  {selected && (
                    <button className="rma-deselect-btn" onClick={() => handleToggle(item.id)}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* FOOTER */}
          {selectedCount > 0 && (
            <div className="rma-footer">
              <div className="rma-footer-summary">
                <span className="rma-footer-count">{selectedCount}</span>
                <span> item{selectedCount !== 1 ? "s" : ""} queued for return</span>
              </div>
              <button
                className={`rma-submit-btn${submitting ? " rma-submit-btn--loading" : ""}`}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <><span className="rma-btn-spinner" />Submitting…</>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M2 7.5L6 11.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Submit RMA
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

/* ===== STYLES ===== */

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rma-page {
    font-family: 'DM Sans', sans-serif;
    background: #f0f2f5;
    min-height: 100vh;
    padding: 32px 24px 80px;
    color: #111827;
  }

  .rma-loading {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    padding: 80px;
    color: #6b7280;
    font-size: 14px;
  }

  .rma-spinner {
    width: 20px; height: 20px;
    border: 2px solid #e5e7eb;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: rma-spin 0.7s linear infinite;
  }

  @keyframes rma-spin { to { transform: rotate(360deg); } }

  .rma-container {
    max-width: 1100px;
    margin: 0 auto;
  }

  /* HEADER */
  .rma-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    gap: 16px;
  }

  .rma-header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .rma-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .rma-back-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    padding: 7px 12px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  }

  .rma-back-btn:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  .rma-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: #111827;
  }

  .rma-breadcrumb-dim { color: #9ca3af; }
  .rma-breadcrumb-sep { color: #d1d5db; }

  .rma-badge {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    border-radius: 20px;
    padding: 5px 12px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .rma-submit-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    background: #1d4ed8;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 9px 18px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
    box-shadow: 0 1px 3px rgba(29,78,216,0.3), 0 1px 2px rgba(0,0,0,0.06);
  }

  .rma-submit-btn:hover:not(:disabled) {
    background: #1e40af;
    box-shadow: 0 4px 12px rgba(29,78,216,0.35);
    transform: translateY(-1px);
  }

  .rma-submit-btn:active:not(:disabled) { transform: translateY(0); }
  .rma-submit-btn--loading, .rma-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .rma-btn-spinner {
    width: 13px; height: 13px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: rma-spin 0.6s linear infinite;
    display: inline-block;
  }

  /* TITLE */
  .rma-title-row { margin-bottom: 24px; }

  .rma-title {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.4px;
    color: #0f172a;
    line-height: 1.2;
    margin-bottom: 4px;
  }

  .rma-subtitle {
    font-size: 14px;
    color: #6b7280;
    font-weight: 400;
  }

  /* ORDER CARD */
  .rma-order-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .rma-order-card-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #9ca3af;
    margin-bottom: 14px;
  }

  .rma-order-card-grid {
    display: flex;
    align-items: center;
    gap: 0;
    flex-wrap: wrap;
  }

  .rma-order-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 0 24px 0 0;
  }

  .rma-order-divider {
    width: 1px;
    height: 32px;
    background: #e5e7eb;
    margin-right: 24px;
    flex-shrink: 0;
  }

  .rma-field-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #9ca3af;
    display: block;
    margin-bottom: 2px;
  }

  .rma-field-value {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
  }

  .rma-field-value--mono {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    color: #2563eb;
    background: #eff6ff;
    padding: 2px 7px;
    border-radius: 5px;
    letter-spacing: 0.03em;
    display: inline-block;
  }

  /* CONTROLS */
  .rma-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .rma-search-wrapper {
    position: relative;
    flex: 1;
    max-width: 400px;
  }

  .rma-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    pointer-events: none;
  }

  .rma-search {
    width: 100%;
    padding: 9px 12px 9px 36px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: #111827;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }

  .rma-search:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
  }

  .rma-search-clear {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .rma-search-clear:hover { color: #374151; background: #f3f4f6; }

  .rma-select-all {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 500;
    color: #374151;
    user-select: none;
    white-space: nowrap;
  }

  /* CHECKBOX */
  .rma-checkbox {
    width: 18px; height: 18px;
    border: 1.5px solid #d1d5db;
    border-radius: 5px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }

  .rma-checkbox:hover:not(.rma-checkbox--disabled) {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .rma-checkbox--checked {
    background: #2563eb;
    border-color: #2563eb;
  }

  .rma-checkbox--disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ITEMS */
  .rma-items { display: flex; flex-direction: column; gap: 10px; }

  .rma-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 60px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    color: #9ca3af;
    font-size: 14px;
  }

  .rma-item {
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    animation: rma-fade-in 0.3s ease both;
    position: relative;
  }

  @keyframes rma-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .rma-item:hover:not(.rma-item--disabled) {
    border-color: #bfdbfe;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .rma-item--selected {
    border-color: #93c5fd !important;
    background: #fafcff;
    box-shadow: 0 2px 10px rgba(37,99,235,0.07) !important;
  }

  .rma-item--disabled {
    opacity: 0.5;
    background: #fafafa;
    cursor: not-allowed;
  }

  .rma-item-left {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 240px;
    flex-shrink: 0;
  }

  .rma-item-info { display: flex; flex-direction: column; gap: 5px; }

  .rma-item-name {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    letter-spacing: -0.1px;
  }

  .rma-item-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .rma-tag {
    font-size: 11.5px;
    font-weight: 500;
    color: #6b7280;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 2px 7px;
    white-space: nowrap;
    font-family: 'DM Mono', monospace;
  }

  .rma-tag--success { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
  .rma-tag--warning { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }

  /* ITEM CONTROLS */
  .rma-item-controls {
    display: flex;
    align-items: flex-end;
    gap: 14px;
    flex: 1;
    transition: opacity 0.2s;
  }

  .rma-item-controls--hidden { opacity: 0; pointer-events: none; }

  .rma-field-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 80px;
  }

  .rma-field-group--reason { min-width: 150px; }
  .rma-field-group--comments { flex: 1; }

  .rma-required { color: #ef4444; }

  /* QTY CONTROL */
  .rma-qty-control {
    display: flex;
    align-items: center;
    gap: 0;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    overflow: hidden;
    background: white;
    height: 34px;
  }

  .rma-qty-btn {
    width: 30px;
    height: 100%;
    background: #f9fafb;
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: 300;
    color: #374151;
    transition: background 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .rma-qty-btn:hover:not(:disabled) { background: #f3f4f6; }
  .rma-qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .rma-qty-value {
    min-width: 28px;
    text-align: center;
    font-size: 13.5px;
    font-weight: 600;
    font-family: 'DM Mono', monospace;
    color: #111827;
    border-left: 1px solid #e5e7eb;
    border-right: 1px solid #e5e7eb;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
  }

  .rma-qty-max {
    font-size: 12px;
    color: #9ca3af;
    font-family: 'DM Mono', monospace;
    padding: 0 8px;
  }

  /* SELECT */
  .rma-select-wrapper { position: relative; }

  .rma-select {
    width: 100%;
    padding: 7px 28px 7px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    background: white;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #9ca3af;
    cursor: pointer;
    appearance: none;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    height: 34px;
  }

  .rma-select--filled { color: #111827; }
  .rma-select:disabled { opacity: 0.5; cursor: not-allowed; }

  .rma-select:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
  }

  .rma-select-arrow {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #9ca3af;
  }

  /* INPUT */
  .rma-input {
    width: 100%;
    padding: 7px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #111827;
    background: white;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    height: 34px;
  }

  .rma-input::placeholder { color: #d1d5db; }
  .rma-input:disabled { opacity: 0.5; cursor: not-allowed; background: #f9fafb; }

  .rma-input:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
  }

  /* SELECT / DESELECT BTN */
  .rma-select-btn {
    background: none;
    border: 1px dashed #d1d5db;
    border-radius: 7px;
    padding: 7px 14px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    flex-shrink: 0;
  }

  .rma-select-btn:hover {
    border-color: #2563eb;
    color: #2563eb;
    background: #eff6ff;
    border-style: solid;
  }

  .rma-deselect-btn {
    position: absolute;
    top: 14px;
    right: 16px;
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 4px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, background 0.15s;
  }

  .rma-deselect-btn:hover { color: #374151; background: #f3f4f6; }

  /* FOOTER */
  .rma-footer {
    position: sticky;
    bottom: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 14px 20px;
    margin-top: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
    animation: rma-slide-up 0.2s ease;
  }

  @keyframes rma-slide-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .rma-footer-summary {
    font-size: 14px;
    color: #374151;
  }

  .rma-footer-count {
    font-weight: 700;
    font-size: 18px;
    color: #1d4ed8;
    margin-right: 4px;
  }

  @media (max-width: 768px) {
    .rma-item { flex-direction: column; align-items: flex-start; }
    .rma-item-left { min-width: unset; }
    .rma-item-controls { flex-wrap: wrap; opacity: 1 !important; pointer-events: all !important; }
    .rma-item-controls--hidden { display: none; }
    .rma-order-card-grid { flex-direction: column; align-items: flex-start; gap: 12px; }
    .rma-order-divider { display: none; }
    .rma-header { flex-direction: column; align-items: flex-start; }
    .rma-controls { flex-direction: column; align-items: flex-start; }
    .rma-search-wrapper { max-width: 100%; width: 100%; }
  }
`;
