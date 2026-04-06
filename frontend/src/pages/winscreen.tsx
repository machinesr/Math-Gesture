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

  const PODIUM_H: Record<number, string> = { 1: "54vh", 2: "44vh", 3: "36vh" }
  const SPRITE_H: Record<number, string> = { 1: "clamp(60px, 12vh, 140px)", 2: "clamp(44px, 9vh, 100px)", 3: "clamp(40px, 7.5vh, 88px)" }

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
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "clamp(14px, 1.5vw, 28px)" }}>Total Clear Time:</div>
        <div style={{ color: "#fff", fontSize: "clamp(32px, 5vw, 80px)", fontWeight: 800 }}>{time}</div>
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
                display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "3vh",
                borderTop: isFirst ? "6px solid #ffd700" : player.rank === 2 ? "6px solid #c0c0c0" : "6px solid #cd7f32"
              }}>
                <div style={{ fontSize: `clamp(16px, ${isFirst ? "3vw" : "2vw"}, ${isFirst ? 52 : 36}px)`, fontWeight: 800, color: "#333" }}>{player.nickname}</div>
                <div style={{ fontSize: `clamp(20px, ${isFirst ? "3.5vw" : "2.5vw"}, ${isFirst ? 60 : 40}px)`, fontWeight: 900, color: "#000" }}>{player.score.toLocaleString()}</div>
                <div style={{ fontSize: "clamp(10px, 1.2vw, 20px)", color: "#888", fontWeight: 600 }}>DMG DEALT</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}