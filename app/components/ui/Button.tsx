"use client";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.15s ease",
    opacity: disabled ? 0.6 : 1,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "#1d4ed8",
      color: "white",
      border: "1px solid #1d4ed8",
    },
    ghost: {
      background: "transparent",
      color: "#374151",
    },
    danger: {
      background: "#dc2626",
      color: "white",
      border: "1px solid #dc2626",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...variants[variant],
      }}
    >
      {children}
    </button>
  );
}