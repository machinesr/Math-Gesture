import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  shaking?: boolean;
}

export default function Card({ children, shaking = false }: CardProps) {
  return (
    <div className={`mg-card${shaking ? " shake" : ""}`}>
      {children}
    </div>
  );
}
