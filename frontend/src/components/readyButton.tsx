import { useState } from "react";

export default function ReadyButton({ onToggle }: { onToggle: (ready: boolean) => void }) {
  const [isReady, setIsReady] = useState(false);

  const handlePress = () => {
    const newState = !isReady;
    setIsReady(newState);
    onToggle(newState);
  };

  return (
    <button
      onClick={handlePress}
      className={`absolute top-[clamp(1.5rem,3vh,3rem)] right-[clamp(1.5rem,2.5vw,2.5rem)] px-[clamp(1.5rem,3vw,2.5rem)] py-[clamp(0.5rem,1.5vh,1rem)] !rounded-[15px] font-bold transition-all active:scale-95 flex items-center justify-center border !border-white/5 w-[clamp(8rem,10vw,14rem)]
        ${isReady
          ? "!bg-[#71C58E] !text-white"
          : "!bg-black/60 !backdrop-blur-sm !text-white/80"
        }`}
    >
      <span className="!text-[clamp(1rem,2vw,2rem)] tracking-tight">ready</span>
    </button>
  );
}