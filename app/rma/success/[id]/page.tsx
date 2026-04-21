"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RmaSuccessPage() {
  const params = useParams();
  const router = useRouter();

  // ✅ FIX: Always normalize id
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [rma, setRma] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      console.log("RMA ID:", id); // 🔍 debug

      setLoading(true);

      // ✅ Auth check
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/");
        return;
      }

      // ✅ Fetch RMA
      const { data: rmaData, error: rmaError } = await supabase
        .from("rma_requests")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (rmaError || !rmaData) {
        console.error("RMA fetch error:", rmaError);
        setLoading(false);
        return;
      }

      // ✅ 🔥 CORRECT WAY: JOIN ITEMS
      const { data: itemsData, error: itemError } = await supabase
        .from("rma_items")
        .select("*")
        .eq("rma_id", id);

      if (itemError) {
        console.error("Item fetch error:", itemError);
      }

      console.log("Items fetched:", itemsData); // 🔍 debug

      setRma(rmaData);
      setItems(itemsData || []);
      setLoading(false);
    };

    fetchData();
  }, [id, router]);

  if (loading) return <div>Loading...</div>;

  if (!rma) return <div>RMA not found</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>RMA Created Successfully</h1>

      <h2>{rma.rma_number}</h2>

      <p>Status: {rma.status}</p>

      <p>
        Created At:{" "}
        {new Date(rma.created_at).toLocaleString()}
      </p>

      <h3>
        Returned Items ({items.length})
      </h3>

      {items.length === 0 ? (
        <p>No items found</p>
      ) : (
        items.map((item) => (
          <div key={item.id} style={{ marginBottom: 12 }}>
            <strong>{item.product_name}</strong>
            <div>Qty: {item.quantity}</div>
            <div>Reason: {item.reason}</div>
          </div>
        ))
      )}

      <button onClick={() => router.push("/rma")}>
        Go to My RMAs
      </button>
    </div>
  );
}