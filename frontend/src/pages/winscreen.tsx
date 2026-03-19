import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import confetti from "canvas-confetti"
import blue from "../assets/blue.png"
import red  from "../assets/red.png"
import pink from "../assets/pink.png"
import green from "../assets/green.png"
import bg from "../assets/lobbybg.png"

const SPRITE_MAP: Record<number, any> = { 0: blue, 1: red, 2: green, 3: pink }

export default function Results() {
  const location = useLocation()
 
  const { leaderboard = [], time = "0:00" } = location.state || {}

  const podiumOrder = [
    leaderboard.find((p: any) => p.rank === 2),
    leaderboard.find((p: any) => p.rank === 1),
    leaderboard.find((p: any) => p.rank === 3),
  ].filter(Boolean) 

  const PODIUM_H: Record<number, string> = { 1: "52vh", 2: "42vh", 3: "34vh" }
  const SPRITE_H: Record<number, number> = { 1: 110, 2: 80, 3: 72 }

  useEffect(() => {
    const colors = ["#ffd700", "#ff5e7e", "#26ccff", "#88ff5a", "#a25afd"]
    const end = Date.now() + 2000

    const frame = () => {
      if (Date.now() > end) return
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors })
      requestAnimationFrame(frame)
    }
    frame()
  }, [])

  return (
    <div style={{
      width: "100vw", height: "100vh", backgroundImage: `url(${bg})`,
      backgroundSize: "cover", backgroundPosition: "center", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />

 
      <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 10, width: "100%" }}>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 24 }}>Total Clear Time:</div>
        <div style={{ color: "#fff", fontSize: 64, fontWeight: 800 }}>{time}</div>
      </div>

   
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 10 }}>
        {podiumOrder.map((player) => {
          const isFirst = player.rank === 1
         
          const spriteImg = SPRITE_MAP[player.rank % 4] 

          return (
            <div key={player.session_id} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, maxWidth: 250 }}>
              <img src={spriteImg} style={{ height: SPRITE_H[player.rank], marginBottom: -10, zIndex: 2, imageRendering: "pixelated" }} />
              
              <div style={{
                background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", height: PODIUM_H[player.rank],
                display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 30,
                borderTop: isFirst ? "6px solid #ffd700" : player.rank === 2 ? "6px solid #c0c0c0" : "6px solid #cd7f32"
              }}>
                <div style={{ fontSize: isFirst ? 40 : 28, fontWeight: 800, color: "#333" }}>{player.nickname}</div>
                <div style={{ fontSize: isFirst ? 48 : 32, fontWeight: 900, color: "#000" }}>{player.score.toLocaleString()}</div>
                <div style={{ color: "#888", fontWeight: 600 }}>DMG DEALT</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}