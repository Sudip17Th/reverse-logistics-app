"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import "../../../styles/rma.css";

export default function ReviewRMA() {
  const router = useRouter();

  const [draft, setDraft] = useState<any>(null);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Load draft from sessionStorage (correct flow)
  useEffect(() => {
    const stored = sessionStorage.getItem("rma_draft");

    if (!stored) {
      router.replace("/dashboard");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setDraft(parsed);
    } catch {
      router.replace("/dashboard");
    }
  }, [router]);

  if (!draft) {
    return (
      <div className="rma-page">
        <div className="rma-container">
          <p>Loading review...</p>
        </div>
      </div>
    );
  }

  const { order, items, user } = draft;

  // -----------------------------
  // SUBMIT RMA (RPC BASED - SAFE)
  // -----------------------------
  const handleSubmit = async () => {
    if (submitting) return;

    if (!agree) {
      alert("Please accept return policy before submitting");
      return;
    }

    setSubmitting(true);

    try {
      // ✅ Get fresh session (never trust stored user)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("Session expired. Please login again.");
      }

      // ✅ Call secure backend function
      const { data: rmaId, error } = await supabase.rpc("create_rma", {
        p_user_id: session.user.id,
        p_order_id: order.id,
        p_items: items,
      });

      if (error) throw error;

      // ✅ Clear draft after success
      sessionStorage.removeItem("rma_draft");

      // ✅ Redirect to success page
      router.replace(`/rma/${rmaId}`);
    } catch (err: any) {
      console.error("RMA ERROR:", err);
      alert(err.message || "Something went wrong");
    }

    setSubmitting(false);
  };

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
              <span className="rma-breadcrumb-dim">Orders</span>
              <span className="rma-breadcrumb-sep">/</span>
              <span className="rma-breadcrumb-dim">
                {order?.sales_order}
              </span>
              <span className="rma-breadcrumb-sep">/</span>
              <span>Review</span>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="rma-items">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="rma-item">
              <div className="rma-item-info">
                <div className="rma-item-name">
                  {item.product_name || "Item"}
                </div>

                <div className="rma-item-meta">
                  <span className="rma-tag">
                    Qty: {item.quantity}
                  </span>
                  <span className="rma-tag">
                    Reason: {item.reason}
                  </span>
                  {item.comments && (
                    <span className="rma-tag">
                      Notes: {item.comments}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* POLICY */}
        <div style={{ marginTop: 20 }}>
          <label>
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
            />
            I agree to return policy
          </label>
        </div>

        {/* SUBMIT */}
        <button
          className="rma-submit-btn"
          onClick={handleSubmit}
          disabled={!agree || submitting}
        >
          {submitting ? "Submitting..." : "Submit RMA"}
        </button>

      </div>
    </div>
  );
}