type BossHealthBarProps = {
  hp: number
  maxHp: number
}

export default function BossHealthBar({ hp, maxHp }: BossHealthBarProps) {

  const percent = (hp / maxHp) * 100

  return (
    <div className="bg-black p-1 rounded-lg">
    <div className="w-100 h-10 relative rounded overflow-hidden bg-red-900 ">

      {/* Health fill */}
      <div
        className="h-full bg-red-500 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />

      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold">
        Centipede: {hp}/{maxHp}
      </div>

    </div>
    </div>
  )
}