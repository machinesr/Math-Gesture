import centipede from "../assets/centipede.png"
import centipedeHit from "../assets/centipede-hit.png"
import turtle from "../assets/turtle.png"
import turtleHit from "../assets/turtle-hit.png"
import zombie from "../assets/zombie.png"
import zombieHit from "../assets/zombie-hit.png"
import guy from "../assets/guy.png"
import guyHit from "../assets/guy-hit.png"
import chimera from "../assets/chimera.png"
import chimeraHit from "../assets/chimera-hit.png"

type EnemyProps = {
  isHit?: boolean
  stage: number
}

const SPRITES: Record<number, { normal: string; hit: string }> = {
  1: { normal: centipede, hit: centipedeHit },
  2: { normal: turtle,    hit: turtleHit },
  3: { normal: zombie,    hit: zombieHit },
  4: { normal: guy,       hit: guyHit },
  5: { normal: chimera,   hit: chimeraHit },
}

export default function Enemy({ isHit, stage }: EnemyProps) {

  const currentSet = SPRITES[stage] || SPRITES[1]
  const sprite = isHit ? currentSet.hit : currentSet.normal

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
        alt="Enemy"
      />
    </div>
  )
}