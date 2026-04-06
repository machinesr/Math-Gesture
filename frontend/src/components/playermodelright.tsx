type PlayerCharacterProps = {
  name: string
  sprite: string
  isAttacking?: boolean
}

export default function PlayerCharacter({ name, sprite, isAttacking }: PlayerCharacterProps) {
  return (
    <div className={`flex flex-col items-center transition-transform duration-200 ${isAttacking ? "-translate-x-[clamp(2rem,4vw,5rem)] scale-110" : "translate-x-0"}`}>

      <p className="text-white font-semibold text-[clamp(0.75rem,1vw,1.125rem)] drop-shadow mb-[clamp(0.25rem,0.75vh,0.5rem)]">
        {name}
      </p>

      <img
        src={sprite}
        alt={name}
        className={`w-[clamp(48px,14vw,200px)] md:w-[clamp(80px,10.4vw,200px)] select-none pointer-events-none scale-x-[-1] ${isAttacking ? "brightness-125" : ""}`}
      />

    </div>
  )
}