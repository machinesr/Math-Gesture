import { LOBBY_BG, STAGES, PLAYER_SPRITES, getStage } from "../../shared/constants/stages"
import { NODES, useStageMap } from "./useStageMap"

function computeNodeSize(viewportW: number) {
  return Math.min(180, Math.max(72, Math.round(viewportW * 0.094)))
}

function getLinePoints(
  ax: number, ay: number, bx: number, by: number,
  totalW: number, totalH: number, nodeR: number,
) {
  const apx = (ax / 100) * totalW
  const apy = (ay / 100) * totalH
  const bpx = (bx / 100) * totalW
  const bpy = (by / 100) * totalH
  const dx = bpx - apx
  const dy = bpy - apy
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len
  const uy = dy / len
  const gap = nodeR + 8
  return {
    x1: `${ax + (ux * gap / totalW) * 100}%`,
    y1: `${ay + (uy * gap / totalH) * 100}%`,
    x2: `${bx - (ux * gap / totalW) * 100}%`,
    y2: `${by - (uy * gap / totalH) * 100}%`,
  }
}

export default function StageMapPage() {
  const { roomData, countdown, playerXY, animating, viewport } = useStageMap()
  const W = viewport.w
  const H = viewport.h
  const NODE_SIZE = computeNodeSize(W)
  const NODE_R = NODE_SIZE / 2

  const stageNum = roomData?.current_stage ?? 1
  const upcoming = getStage(stageNum)

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
        fontFamily: "Nunito, sans-serif",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />

      <div
        style={{
          position: "absolute",
          top: "clamp(1rem,3vh,2.5rem)",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          zIndex: 10,
          width: "min(90vw, 720px)",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "clamp(0.875rem,1.25vw,1.125rem)",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {animating
            ? "Traveling..."
            : stageNum === 1
              ? "Prepare for Battle"
              : `Stage ${stageNum - 1} Clear!`}
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: "clamp(2rem,5vw,5.5rem)",
            fontWeight: 900,
            letterSpacing: "0.05em",
            lineHeight: 1.05,
            marginTop: "0.25rem",
          }}
        >
          STAGE {stageNum}
        </div>
        <div
          style={{
            color: "#fde047",
            fontSize: "clamp(1rem,1.75vw,2rem)",
            fontWeight: 800,
            marginTop: "0.25rem",
            letterSpacing: "0.04em",
          }}
        >
          VS {upcoming.name}
        </div>
        <div
          style={{
            marginTop: "clamp(0.5rem,1vh,0.875rem)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "clamp(0.4rem,0.75vh,0.6rem) clamp(0.875rem,1.5vw,1.5rem)",
            borderRadius: "999px",
            backdropFilter: "blur(6px)",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(0.75rem,1vw,1rem)", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            starting in
          </span>
          <span style={{ color: "#fff", fontSize: "clamp(1.25rem,2vw,2rem)", fontWeight: 900, lineHeight: 1 }}>
            {animating ? "..." : countdown}
          </span>
        </div>
      </div>

      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 5, pointerEvents: "none" }}>
        {NODES.slice(0, -1).map((node, i) => {
          const next = NODES[i + 1]
          const done = i + 1 < (roomData?.current_stage || 1)
          const pts = getLinePoints(node.x, node.y, next.x, next.y, W, H, NODE_R)
          return (
            <line
              key={i}
              x1={pts.x1}
              y1={pts.y1}
              x2={pts.x2}
              y2={pts.y2}
              stroke={done ? "#00e676" : "rgba(255,255,255,0.3)"}
              strokeWidth="4"
              strokeLinecap="round"
            />
          )
        })}
      </svg>

      {NODES.map((node, i) => {
        const stageNum = i + 1
        const isDone = stageNum < (roomData?.current_stage || 1)
        const isActive = stageNum === (roomData?.current_stage || 1)
        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
              width: NODE_SIZE,
              height: NODE_SIZE,
              borderRadius: "50%",
              overflow: "hidden",
              border: `4px solid ${isDone ? "#00e676" : isActive ? "#fff" : "rgba(255,255,255,0.3)"}`,
              boxShadow: isActive ? "0 0 20px rgba(255,255,255,0.5)" : "none",
              zIndex: 10,
            }}
          >
            <img
              src={STAGES[i].bg}
              alt={`lv${stageNum}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: isDone ? "none" : isActive ? "none" : "grayscale(1) opacity(0.5)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                fontSize: "clamp(0.875rem,1.5vw,1.5rem)",
                fontWeight: 900,
                width: "33%",
                height: "33%",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {stageNum}
            </div>
          </div>
        )
      })}

      <div
        style={{
          position: "absolute",
          left: `${playerXY.x}%`,
          top: `${playerXY.y}%`,
          transform: "translate(-50%, -180%)",
          display: "flex",
          gap: "clamp(4px,0.4vw,8px)",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        {PLAYER_SPRITES.slice(0, Object.keys(roomData?.players || {}).length).map((img, i) => (
          <div
            key={i}
            style={{
              width: "clamp(32px,3vw,56px)",
              height: "clamp(32px,3vw,56px)",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
              background: "#222",
            }}
          >
            <img
              src={img}
              alt="player"
              style={{ width: "100%", height: "160%", objectFit: "cover", objectPosition: "top" }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
