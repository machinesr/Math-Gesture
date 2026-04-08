import { useState } from "react"

export default function ReadyButton({ onToggle }: { onToggle: (ready: boolean) => void }) {
  const [isReady, setIsReady] = useState(false)

  const handlePress = () => {
    const newState = !isReady
    setIsReady(newState)
    onToggle(newState)
  }

  return (
    <button
      onClick={handlePress}
      className={`absolute top-[clamp(1.5rem,3vh,3rem)] right-[clamp(1.5rem,2.5vw,2.5rem)] px-[clamp(1.5rem,3vw,2.5rem)] py-[clamp(0.5rem,1.5vh,1rem)] !rounded-[15px] font-bold transition-all duration-200 active:scale-95 hover:scale-[1.03] flex items-center justify-center border !border-white/5 w-[clamp(8rem,10vw,14rem)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
        ${isReady
          ? "!bg-[#71C58E] hover:!bg-[#5fb87d] !text-white shadow-lg shadow-emerald-500/30"
          : "!bg-black/60 hover:!bg-black/75 !backdrop-blur-sm !text-white/80 hover:!text-white"
        }`}
    >
      <span className="!text-[clamp(1rem,2vw,2rem)] tracking-tight">ready</span>
    </button>
  )
}
