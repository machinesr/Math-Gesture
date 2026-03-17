import type { ChangeEvent } from "react";

interface GameInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "decimal" | "email" | "search" | "tel" | "url";
  maxLength?: number;
  autoFocus?: boolean;
  pinStyle?: boolean;
}

export default function GameInput({
  value,
  onChange,
  onEnter,
  placeholder = "",
  type = "text",
  inputMode,
  maxLength,
  autoFocus = false,
  pinStyle = false,
}: GameInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onEnter?.();
  };

  return (
    <input
      className={`mg-input${pinStyle ? " mg-input--pin" : ""}`}
      type={type}
      inputMode={inputMode}
      placeholder={placeholder}
      value={value}
      maxLength={maxLength}
      autoFocus={autoFocus}
      onChange={onChange}
      onKeyDown={handleKeyDown}
    />
  );
}
