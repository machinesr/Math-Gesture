import { useState, useCallback } from "react"
import HandCamera from "../components/handcamera"
import { GameController } from "../game/gameController"
import GameUI from "../components/GameUI"
import PlayerCharacterLeft from "../components/playermodelleft"
import PlayerCharacterRight from "../components/playermodelright"
import Boss from "../components/centipede"
import BossHealthBar from "../components/healthbar"
import red from "../assets/red.png"
import blue from "../assets/blue.png"
import green from "../assets/green.png"
import pink from "../assets/pink.png"
import cave from "../assets/cavebg.png"
import AttackEffect from "../components/AttackEffect"
import DamageLog from "../components/damageLog"
const game = new GameController()

export default function Battle() {

  const [state, setState] = useState<any>(null)
  const [damageLog, setDamageLog] = useState<any[]>([])
  

  const handleNumber = useCallback((num: number) => {

    const newState = game.update(num)

    if (newState.event === "attack") {

        const damage = 10
        const player = "calvin1"

        const id = Date.now()   // ← create it here

        setDamageLog(prev => {

          const entry = {
            id,
            text: `${player} just did ${damage} damage!`
          }

          const updated = [entry, ...prev]

          return updated.slice(0, 3)
        })

        setTimeout(() => {
          setDamageLog(prev => prev.filter(e => e.id !== id))
        }, 7000)
      }

    if (newState.result === "wrong") {
      console.log("WRONG ANSWER")
    }

    setState(newState)

  }, [])

  return (
    <div className="relative w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden" 
          style={{ backgroundImage: `url(${cave})`}}>

      {/* UI Layer */}
      {state && <GameUI state={state} />}
      <DamageLog entries={damageLog} />
      <div className="absolute top-0 right-0 w-120 bg-black/60 p-2 rounded-lg">
      <HandCamera onNumberDetected={handleNumber} />
      </div>
      

        {/* Attack Effect */}
        <AttackEffect trigger={state?.event === "attack"} />

      {/* Arena */}
      <div className="absolute inset-0 flex items-end justify-between px-65">

  {/* Left team */}
  <div className="flex flex-col gap-24 mb-35">
    <PlayerCharacterLeft name="calvin" sprite={red}/>
    <PlayerCharacterLeft name="alex" sprite={blue}/>
  </div>

  {/* Boss zone */}
  <div className="flex flex-col items-center mb-70 gap-10">

    <BossHealthBar
      hp={state?.bossHp ?? 200}
      maxHp={250}
    />

    <Boss isHit={state?.event === "attack"} />

  </div>

  {/* Right team */}
  <div className="flex flex-col gap-24 mb-35">
    <PlayerCharacterRight name="nael" sprite={pink}/>
    <PlayerCharacterRight name="nick" sprite={green}/>
  </div>

</div>

    </div>
  )
}