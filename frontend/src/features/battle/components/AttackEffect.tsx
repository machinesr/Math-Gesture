import { useEffect, useState, useRef } from "react"

import frame1 from "../../../assets/attack/attack-1.png"
import frame2 from "../../../assets/attack/attack-2.png"
import frame3 from "../../../assets/attack/attack-3.png"
import frame4 from "../../../assets/attack/attack-4.png"
import frame5 from "../../../assets/attack/attack-5.png"
import frame6 from "../../../assets/attack/attack-6.png"
import frame7 from "../../../assets/attack/attack-7.png"
import { ATTACK_FRAME_MS } from "../../../shared/constants/stages"

const frames = [frame1, frame2, frame3, frame4, frame5, frame6, frame7]

export default function AttackEffect({ trigger }: { trigger: boolean }) {
  const [visible, setVisible] = useState(false)
  const [frame, setFrame] = useState(0)
  const prevTrigger = useRef(false)

  useEffect(() => {
    if (trigger && !prevTrigger.current) {
      setVisible(true)
      setFrame(0)
      let i = 0
      const interval = setInterval(() => {
        i++
        if (i >= frames.length) {
          clearInterval(interval)
          setVisible(false)
          return
        }
        setFrame(i)
      }, ATTACK_FRAME_MS)
    }
    prevTrigger.current = trigger
  }, [trigger])

  if (!visible) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
      <img
        key={frame}
        src={frames[frame]}
        className="w-[clamp(300px,52vw,1000px)] translate-y-[clamp(3rem,5vh,7rem)]"
      />
    </div>
  )
}
