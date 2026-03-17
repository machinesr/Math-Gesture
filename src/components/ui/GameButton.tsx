import type { ReactNode } from "react";

interface GameButtonProps {
  onClick?: () => void;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "back";
}

export default function GameButton({
  onClick,
  children,
  type = "button",
  variant = "primary",
}: GameButtonProps) {
  const className = variant === "back" ? "mg-btn-back" : "mg-btn";

  return (
    <button className={className} type={type} onClick={onClick}>
      {children}
    </button>
  );
}
