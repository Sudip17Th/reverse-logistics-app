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

  useEffect(() => {
    const stored = sessionStorage.getItem("rma_draft");

    if (!stored) {
      router.replace("/dashboard");
      return;
    }

    try {
      setDraft(JSON.parse(stored));
    } catch {
      router.replace("/dashboard");
    }
  }, [router]);

  if (!draft) {
    return <div>Loading...</div>;
  }

  const order = draft.order;
  const selectedItems = draft.selectedItems || {};

  const selectedList = Object.entries(selectedItems);

  const handleSubmit = async () => {
    if (!agree) {
      alert("Accept return policy");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) throw new Error("Session expired");

      const payload = selectedList.map(([id, val]: any) => ({
        order_item_id: id,
        quantity: val.qty,
        reason: val.reason,
        comments: val.comments || null,
      }));

      console.log("RMA ITEMS PAYLOAD:", payload);
      
      const { data: rmaId, error } = await supabase.rpc("create_rma", {
        p_user_id: session.user.id,
        p_order_id: order.id,
        p_items: payload,
      });

      if (error) throw error;

      sessionStorage.removeItem("rma_draft");

      const finalId = Array.isArray(rmaId) ? rmaId[0] : rmaId;

router.replace(`/rma/success/${finalId}`);

    } catch (err: any) {
      alert(err.message);
    }

    setSubmitting(false);
  };

  return (
    <div className="rma-page">
      <div className="rma-container">

        <h2>Review RMA</h2>

        {selectedList.map(([id, val]: any) => (
          <div key={id} className="rma-item">
            <div>Item ID: {id}</div>
            <div>Qty: {val.qty}</div>
            <div>Reason: {val.reason}</div>
          </div>
        ))}

        <label>
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
          />
          I agree to return policy
        </label>

        <button onClick={handleSubmit} disabled={!agree || submitting}>
          Submit RMA
        </button>

      </div>
    </div>
  );
}