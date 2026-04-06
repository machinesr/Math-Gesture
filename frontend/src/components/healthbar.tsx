type BossHealthBarProps = {
  hp: number
  maxHp: number
  stage: number 
}

const ENEMY_NAMES: Record<number, string> = {
  1: "Centipede",
  2: "Ancient Turtle",
  3: "Crypt Zombie",
  4: "Corrupted Knight",
  5: "Final Chimera"
}

export default function BossHealthBar({ hp, maxHp, stage }: BossHealthBarProps) {

  const percent = maxHp > 0 ? Math.max(0, (hp / maxHp) * 100) : 0
  const enemyName = ENEMY_NAMES[stage] || "Enemy"

  return (
    <div className="bg-black p-1 rounded-lg w-full max-w-[clamp(200px,80vw,760px)] md:max-w-[clamp(280px,40vw,760px)] shadow-2xl">
      <div className="h-[clamp(1.5rem,3vh,3.5rem)] md:h-[clamp(2.25rem,4vh,3.5rem)] relative rounded overflow-hidden bg-red-900/50 border border-red-500/30">

        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />

        <div className="absolute inset-0 flex items-center justify-center text-white text-[clamp(0.55rem,2.5vw,1.125rem)] md:text-[clamp(0.75rem,1vw,1.125rem)] font-bold tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          {enemyName}: {Math.max(0, hp)} / {maxHp}
        </div>

      </div>
    </div>
  )
}