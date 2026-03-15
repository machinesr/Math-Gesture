import centipedeHit from "../assets/centipede-hit.png"
import centipede from "../assets/centipede.png"
type BossProps = {
  isHit?: boolean
}

export default function Boss({ isHit }: BossProps) {

  const sprite = isHit ? centipedeHit : centipede

  return (
    <div
      className={`
        transition-transform duration-150
        ${isHit ? "animate-[shake_0.35s]" : ""}
      `}
    >
      <img
        src={sprite}
        className="w-72 select-none pointer-events-none"
      />
    </div>
  )
}