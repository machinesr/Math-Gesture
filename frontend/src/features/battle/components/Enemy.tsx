import { getStage } from "../../../shared/constants/stages"

type EnemyProps = {
  isHit?: boolean
  stage: number
}

export default function Enemy({ isHit, stage }: EnemyProps) {
  const def = getStage(stage)
  const sprite = isHit ? def.enemyHit : def.enemy

  return (
    <div
      className={`
        transition-transform duration-150
        ${isHit ? "animate-[shake_0.35s]" : ""}
      `}
    >
      <img
        src={sprite}
        className="w-[clamp(144px,20vw,384px)] select-none pointer-events-none object-contain"
        alt={def.name}
      />
    </div>
  )
}
