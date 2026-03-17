import type { ChangeEvent } from "react";
import Card from "../ui/Card";
import GameButton from "../ui/GameButton";
import GameInput from "../ui/GameInput";

interface JoinStepProps {
  pin: string;
  onPinChange: (value: string) => void;
  onEnter: () => void;
  onCreateRoom: () => void;
  shaking: boolean;
}

export default function JoinStep({
  pin,
  onPinChange,
  onEnter,
  onCreateRoom,
  shaking,
}: JoinStepProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    onPinChange(digits);
  };

  return (
    <div className="mg-wrapper animate-in">
      <h1 className="mg-heading">Join a room</h1>

      <Card shaking={shaking}>
        <GameInput
          value={pin}
          onChange={handleChange}
          onEnter={onEnter}
          placeholder="room code!"
          inputMode="numeric"
          maxLength={4}
          autoFocus
          pinStyle
        />
        <GameButton onClick={onEnter}>enter</GameButton>
      </Card>

      <p className="mg-create-link">
        or{" "}
        <button className="mg-create-link__action" onClick={onCreateRoom} type="button">
          create
        </button>
        {" "}one...
      </p>
    </div>
  );
}
