import PlayerCharacter from "../components/playermodel"
import red from "../assets/red.png"
import blue from "../assets/blue.png"
import pink from "../assets/pink.png"
import green from "../assets/green.png"
import HandTracker from "../components/handcamera"

const game = new GameController()

export default function Battle() {

  const [state, setState] = useState<any>(null)

  function handleNumber(num: number) {

    const newState = game.update(num)

    setState(newState)

  }
  return (
    <div className="relative w-screen h-screen">

      <PlayerCharacter
        name="calvin"
        sprite={red}
        className="absolute left-32 bottom-48"
      />

      <PlayerCharacter
        name="alex"
        sprite={blue}
        className="absolute left-32 bottom-12"
      />

      <PlayerCharacter
        name="nael"
        sprite={pink}
        className="absolute right-32 bottom-48"
      />

      <PlayerCharacter
        name="nick"
        sprite={green}
        className="absolute right-32 bottom-12"
      />

    </div>
    
  )
}