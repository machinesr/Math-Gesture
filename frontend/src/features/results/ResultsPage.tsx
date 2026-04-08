import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import confetti from "canvas-confetti"
import { LOBBY_BG, PLAYER_SPRITES, CONFETTI_MS } from "../../shared/constants/stages"
import type { LeaderboardEntry } from "../../shared/types/room"

export default function ResultsPage() {
  const location = useLocation()
  const { leaderboard = [], time = "0:00" } = (location.state || {}) as {
    leaderboard?: LeaderboardEntry[]
    time?: string
  }

  const podiumOrder = [
    leaderboard.find(p => p.rank === 2),
    leaderboard.find(p => p.rank === 1),
    leaderboard.find(p => p.rank === 3),
  ].filter(Boolean) as LeaderboardEntry[]

  const PODIUM_H: Record<number, string> = { 1: "54vh", 2: "44vh", 3: "36vh" }
  const SPRITE_SIZE = "clamp(80px, 14vh, 180px)"

  useEffect(() => {
    const colors = ["#ffd700", "#ff5e7e", "#26ccff", "#88ff5a", "#a25afd"]
    const end = Date.now() + CONFETTI_MS

    const frame = () => {
      if (Date.now() > end) return
      confetti({ particleCount: 3, angle: 60,  spread: 55, origin: { x: 0, y: 0.7 }, colors })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors })
      requestAnimationFrame(frame)
    }
    frame()
  }, [])

  return (
    <div
      className="animate-page-in"
      style={{
        width: "100vw",
        height: "100svh",
        backgroundImage: `url(${LOBBY_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />

      <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 10, width: "100%" }}>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "clamp(14px, 1.5vw, 28px)" }}>Total Clear Time:</div>
        <div style={{ color: "#fff", fontSize: "clamp(32px, 5vw, 80px)", fontWeight: 800 }}>{time}</div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 10 }}>
        {podiumOrder.map(player => {
          const isFirst = player.rank === 1
          const spriteImg = PLAYER_SPRITES[player.rank % PLAYER_SPRITES.length]

          return (
            <div key={player.session_id} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, maxWidth: 250 }}>
              {player.highest_combo > 0 && (
                <div style={{ textAlign: "center", marginBottom: 4, zIndex: 2 }}>
                  <div
                    style={{
                      color: player.highest_combo >= 8 ? "#f87171" : player.highest_combo >= 4 ? "#fb923c" : "#fde047",
                      fontWeight: 900,
                      fontSize: "clamp(14px, 2.2vw, 32px)",
                      lineHeight: 1,
                    }}
                  >
                    x{player.highest_combo}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: 700,
                      fontSize: "clamp(9px, 1vw, 14px)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    best combo
                  </div>
                </div>
              )}
              <img
                src={spriteImg}
                style={{ height: SPRITE_SIZE, marginBottom: -10, zIndex: 2, imageRendering: "pixelated" }}
              />

              <div
                style={{
                  background: "#fff",
                  borderRadius: "20px 20px 0 0",
                  width: "100%",
                  height: PODIUM_H[player.rank],
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingTop: "3vh",
                  borderTop: isFirst
                    ? "6px solid #ffd700"
                    : player.rank === 2
                      ? "6px solid #c0c0c0"
                      : "6px solid #cd7f32",
                }}
              >
                <div style={{ fontSize: `clamp(16px, ${isFirst ? "3vw" : "2vw"}, ${isFirst ? 52 : 36}px)`, fontWeight: 800, color: "#333" }}>
                  {player.nickname}
                </div>
                <div style={{ fontSize: `clamp(20px, ${isFirst ? "3.5vw" : "2.5vw"}, ${isFirst ? 60 : 40}px)`, fontWeight: 900, color: "#000" }}>
                  {player.score.toLocaleString()}
                </div>
                <div style={{ fontSize: "clamp(10px, 1.2vw, 20px)", color: "#888", fontWeight: 600 }}>DMG DEALT</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
