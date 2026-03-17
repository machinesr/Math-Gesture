import { useState } from "react";

import JoinStep from "../components/join/JoinStep";
import UsernameStep from "../components/join/UsernameStep";
import CreateStep from "../components/join/CreateStep";
import { useShake } from "../hooks/useShake";
import { STEPS } from "../constants/theme";
import type { Step } from "../constants/theme";

import "../styles/global.css";
import "../styles/animations.css";
import "../styles/components.css";

export default function JoinPage() {
  const [step, setStep] = useState<Step>(STEPS.JOIN);
  const [pin, setPin] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>("");

  const { shaking, triggerShake } = useShake();

  // JOIN 
  const handleJoinEnter = () => {
    if (pin.length < 4) { triggerShake(); return; }
    setStep(STEPS.USERNAME);
  };

  // USERNAME
  const handleUsernameEnter = () => {
    if (username.trim().length < 2) { triggerShake(); return; }
    // TODO: socket.emit("join_room", { pin, username });
    alert(`Joining room ${pin} as "${username}"`); // delete when socket implemented
  };

  const handleBackToJoin = () => {
    setPin("");
    setStep(STEPS.JOIN);
  };

  // CREATE
  const handleCreateEnter = (timeLimit: number) => {
    if (creatorName.trim().length < 2) { triggerShake(); return; }
    // TODO: socket.emit("create_room", { creatorName, timeLimit });
    alert(`Creating room as "${creatorName}" with ${timeLimit}min limit`); //delete when socket implemented
  };

  return (
    <div className="mg-root">
      {step === STEPS.JOIN && (
        <JoinStep
          pin={pin}
          onPinChange={setPin}
          onEnter={handleJoinEnter}
          onCreateRoom={() => setStep(STEPS.CREATE)}
          shaking={shaking}
        />
      )}

      {step === STEPS.USERNAME && (
        <UsernameStep
          pin={pin}
          username={username}
          onUsernameChange={setUsername}
          onEnter={handleUsernameEnter}
          onBack={handleBackToJoin}
          shaking={shaking}
        />
      )}

      {step === STEPS.CREATE && (
        <CreateStep
          creatorName={creatorName}
          onCreatorChange={setCreatorName}
          onEnter={handleCreateEnter}
          onBack={() => setStep(STEPS.JOIN)}
          shaking={shaking}
        />
      )}
    </div>
  );
}
