import type { ChangeEvent } from "react";
import Card from "../ui/Card";
import GameButton from "../ui/GameButton";
import GameInput from "../ui/GameInput";
import RoomBadge from "../ui/RoomBadge";

interface UsernameStepProps {
  pin: string;
  username: string;
  onUsernameChange: (value: string) => void;
  onEnter: () => void;
  onBack: () => void;
  shaking: boolean;
}

export default function UsernameStep({
  pin,
  username,
  onUsernameChange,
  onEnter,
  onBack,
  shaking,
}: UsernameStepProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    onUsernameChange(e.target.value);

  return (
    <div className="mg-wrapper animate-in">
      <h1 className="mg-heading">enter your username...</h1>

      <Card shaking={shaking}>
        <RoomBadge pin={pin} />

        <GameInput
          value={username}
          onChange={handleChange}
          onEnter={onEnter}
          placeholder="username..."
          maxLength={16}
          autoFocus
        />

        <GameButton onClick={onEnter}>enter</GameButton>
        <GameButton variant="back" onClick={onBack}>← back</GameButton>
      </Card>
    </div>
  );
}
