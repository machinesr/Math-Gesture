import { useState } from "react";
import type { ChangeEvent } from "react";
import Card from "../ui/Card";
import GameButton from "../ui/GameButton";
import GameInput from "../ui/GameInput";
import { TIME_LIMIT_OPTIONS } from "../../constants/theme";

interface CreateStepProps {
  creatorName: string;
  onCreatorChange: (value: string) => void;
  onEnter: (timeLimit: number) => void;
  onBack: () => void;
  shaking: boolean;
}

export default function CreateStep({
  creatorName,
  onCreatorChange,
  onEnter,
  onBack,
  shaking,
}: CreateStepProps) {
  const [timeLimit, setTimeLimit] = useState<number>(3);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    onCreatorChange(e.target.value);

  const handleEnter = () => onEnter(timeLimit);

  return (
    <div className="mg-wrapper animate-in">
      <h1 className="mg-heading">Create a room</h1>

      <Card shaking={shaking}>
        <GameInput
          value={creatorName}
          onChange={handleChange}
          onEnter={handleEnter}
          placeholder="your username..."
          maxLength={16}
          autoFocus
        />

        <p className="time-label">time limit (minutes)</p>
        <div className="time-row">
          {TIME_LIMIT_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              className={`time-option${timeLimit === t ? " time-option--selected" : ""}`}
              onClick={() => setTimeLimit(t)}
            >
              {t}m
            </button>
          ))}
        </div>

        <GameButton onClick={handleEnter}>create room</GameButton>
        <GameButton variant="back" onClick={onBack}>← back to join</GameButton>
      </Card>
    </div>
  );
}
