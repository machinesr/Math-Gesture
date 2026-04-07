type PlayerCharacterProps = {
  name: string
  sprite: string
  isAttacking?: boolean
  combo?: number
  isCurrentPlayer?: boolean
}

export default function PlayerCharacter({ name, sprite, isAttacking, combo = 0, isCurrentPlayer = false }: PlayerCharacterProps) {
  const comboColor =
    combo >= 8 ? "text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.9)]" :
    combo >= 4 ? "text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.9)]" :
                 "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.7)]"

  return (
    <div className={`flex flex-col items-center transition-transform duration-200 ${isAttacking ? "translate-x-[clamp(2rem,4vw,5rem)] scale-110" : "translate-x-0"}`}>

      {isCurrentPlayer && combo > 0 && (
        <div className={`flex flex-col items-center font-extrabold leading-none mb-1 ${comboColor}`}>
          <span className="text-[clamp(1.25rem,2.5vw,3rem)] tracking-tight">x{combo}</span>
          <span className="text-[clamp(0.5rem,0.9vw,1rem)] tracking-widest uppercase opacity-80">combo</span>
        </div>
      )}

      {!isCurrentPlayer && combo > 0 ? (
        <div className="flex items-center gap-1 mb-[clamp(0.25rem,0.75vh,0.5rem)]">
          <p className="text-white font-semibold text-[clamp(0.75rem,1vw,1.125rem)] drop-shadow">
            {name}
          </p>
          <span className={`font-extrabold text-[clamp(0.6rem,0.85vw,1rem)] leading-none ${comboColor}`}>x{combo}</span>
        </div>
      ) : (
        <p className="text-white font-semibold text-[clamp(0.75rem,1vw,1.125rem)] drop-shadow mb-[clamp(0.25rem,0.75vh,0.5rem)]">
          {name}
        </p>
      )}

      <img
        src={sprite}
        alt={name}
        className={`w-[clamp(48px,14vw,200px)] md:w-[clamp(80px,10.4vw,200px)] select-none pointer-events-none ${isAttacking ? "brightness-125" : ""}`}
      />

    </div>
  )
}
