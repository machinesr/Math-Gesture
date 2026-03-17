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
      // px-10 py-3 to match the proportions of the "test" box
      className={`absolute top-8 right-10 px-10 py-3 !rounded-[15px] font-bold transition-all active:scale-95 flex items-center justify-center border !border-white/5 w-40
        ${isReady 
          ? "!bg-[#71C58E] !text-white" // Solid green when ready
          : "!bg-black/60 !backdrop-blur-sm !text-white/80" // Darker, matching the slots
        }`}
    >
      <span className="!text-[32px] tracking-tight">ready</span>
    </button>
  );
}