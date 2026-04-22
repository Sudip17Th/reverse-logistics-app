"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reason: string;
    comments: string;
  }) => void;
}

const reasons = [
  "Changed my mind",
  "Wrong item selected",
  "Found better option",
  "Ordered by mistake",
];

export default function CancelRmaModal({
  isOpen,
  onClose,
  onSubmit,
}: Props) {
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason && !comments) {
      alert("Please select a reason or enter comments");
      return;
    }

    onSubmit({
      reason,
      comments,
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <h2 style={{ marginBottom: 16 }}>
          Cancel Return Request
        </h2>

        <p>I want to cancel my return because:</p>

        {/* DROPDOWN */}
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={styles.input}
        >
          <option value="">Select reason</option>
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <p style={{ textAlign: "center", margin: "10px 0" }}>
          OR
        </p>

        {/* TEXTAREA */}
        <textarea
          maxLength={250}
          placeholder="Write your reason (max 250 characters)"
          value={comments}
          onChange={(e) =>
            setComments(e.target.value)
          }
          style={styles.textarea}
        />

        <div style={styles.counter}>
          {comments.length}/250
        </div>

        {/* ACTIONS */}
        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>

          <button onClick={handleSubmit} style={styles.submitBtn}>
            Submit
          </button>
        </div>

      </div>
    </div>
  );
}

const styles: any = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    padding: 24,
    borderRadius: 10,
    width: 400,
  },
  input: {
    width: "100%",
    padding: 8,
    marginTop: 8,
  },
  textarea: {
    width: "100%",
    height: 80,
    marginTop: 8,
    padding: 8,
  },
  counter: {
    fontSize: 12,
    textAlign: "right",
    color: "#6b7280",
  },
  actions: {
    marginTop: 20,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    padding: "6px 12px",
    border: "1px solid #ccc",
    borderRadius: 6,
    background: "white",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: 6,
    background: "#dc2626",
    color: "white",
    cursor: "pointer",
  },
};