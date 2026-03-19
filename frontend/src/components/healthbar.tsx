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
    <div className="bg-black p-1 rounded-lg w-full max-w-md shadow-2xl">
      <div className="h-10 relative rounded overflow-hidden bg-red-900/50 border border-red-500/30">


        <div
          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />

  
        <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          {enemyName}: {Math.max(0, hp)} / {maxHp}
        </div>

      </div>
    </div>
  )
}