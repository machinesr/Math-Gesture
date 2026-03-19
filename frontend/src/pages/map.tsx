import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { socket } from "../network/socket"

import bg  from "../assets/lobbybg.png"
import lv3 from "../assets/castlebg.png"
import lv2 from "../assets/graveyardbg.png"
import lv4 from "../assets/terracebg.png"
import lv1 from "../assets/cavebg.png"
import lv5 from "../assets/throneroombg.png"

import p2 from "../assets/blue.png"
import p1 from "../assets/red.png"
import p3 from "../assets/green.png"
import p4 from "../assets/pink.png"

const LEVEL_IMAGES  = [lv1, lv2, lv3, lv4, lv5]
const PLAYER_IMAGES = [p1, p2, p3, p4]

const NODES = [
  { id: 1, x: 18, y: 63 },
  { id: 2, x: 35, y: 36 },
  { id: 3, x: 52, y: 63 },
  { id: 4, x: 68, y: 36 },
  { id: 5, x: 85, y: 63 },
]

const NODE_SIZE = 120  
const NODE_R    = NODE_SIZE / 2  

function getLinePoints(ax: number, ay: number, bx: number, by: number, totalW: number, totalH: number) {
  const apx = ax / 100 * totalW; const apy = ay / 100 * totalH;
  const bpx = bx / 100 * totalW; const bpy = by / 100 * totalH;
  const dx = bpx - apx; const dy = bpy - apy;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len; const uy = dy / len;
  const gap = NODE_R + 8;
  return {
    x1: `${ax + (ux * gap / totalW * 100)}%`,
    y1: `${ay + (uy * gap / totalH * 100)}%`,
    x2: `${bx - (ux * gap / totalW * 100)}%`,
    y2: `${by - (uy * gap / totalH * 100)}%`,
  }
}

export default function Map() {
  const location = useLocation()
  const navigate = useNavigate()

  const initialRoomData = location.state?.roomData || null;
  const currentStageNum = initialRoomData?.current_stage || 1;
  const startVisualNodeIdx = currentStageNum > 1 ? currentStageNum - 2 : 0;

  const [roomData, setRoomData] = useState<any>(initialRoomData)
  const [countdown, setCountdown] = useState(5)
  const [playerXY, setPlayerXY] = useState({ 
    x: NODES[startVisualNodeIdx].x, 
    y: NODES[startVisualNodeIdx].y 
  })
  const [animating, setAnimating] = useState(false)
  const [isTimerActive, setIsTimerActive] = useState(false)

  const visualStageRef = useRef<number>(currentStageNum > 1 ? currentStageNum - 1 : 1)
  const roomDataRef = useRef<any>(roomData)

  useEffect(() => { roomDataRef.current = roomData }, [roomData])


  useEffect(() => {
    if (roomData?.pin) {
      const myNickname = localStorage.getItem("nickname") || "Player";
      socket.emit("join_room", { 
        pin: roomData.pin.toString(),
        nickname: myNickname 
      });
    }

    const onUpdate = (data: any) => {
      console.log("Map synced with latest room data:", data);
      setRoomData(data);
    };

    socket.on("lobby_updated", onUpdate);
    socket.on("stage_advanced", onUpdate);

    return () => {
      socket.off("lobby_updated", onUpdate);
      socket.off("stage_advanced", onUpdate);
    }
  }, [roomData?.pin]);


  useEffect(() => {
    if (!roomData || animating) return;

    const currentStage = roomData.current_stage || 1;

    if (currentStage > visualStageRef.current) {
        setIsTimerActive(false); 
        const t = setTimeout(() => {
            animateToNext(visualStageRef.current, currentStage);
            visualStageRef.current = currentStage;
        }, 600);
        return () => clearTimeout(t);
    } 
    else if (!animating && !isTimerActive) {
        const node = NODES[currentStage - 1];
        setPlayerXY({ x: node.x, y: node.y });
        setIsTimerActive(true);
    }
  }, [roomData?.current_stage, animating, isTimerActive]);


  useEffect(() => {
    if (!isTimerActive) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive]);


  useEffect(() => {
    if (countdown === 0 && isTimerActive) {
        navigate("/Battle", { state: { roomData: roomDataRef.current } });
    }
  }, [countdown, isTimerActive, navigate]);

  function animateToNext(fromIdx: number, toIdx: number) {
    setAnimating(true);
    const from = NODES[fromIdx - 1];
    const to = NODES[toIdx - 1];
    const startTime = performance.now();

    function step(now: number) {
      const progress = Math.min((now - startTime) / 1500, 1);
      setPlayerXY({
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress
      });
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setAnimating(false);
      }
    }
    requestAnimationFrame(step);
  }

  const W = window.innerWidth; const H = window.innerHeight;

  return (
    <div style={{
      width: "100vw", height: "100vh", backgroundImage: `url(${bg})`,
      backgroundSize: "cover", backgroundPosition: "center", position: "relative", overflow: "hidden", fontFamily: "Nunito, sans-serif"
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />

      <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 10 }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            {animating ? "Traveling..." : (roomData?.current_stage === 1 ? "Prepare for Battle!" : `Stage ${roomData?.current_stage - 1} Clear!`)}
        </div>
        <div style={{ color: "#fff", fontSize: 52, fontWeight: 900, lineHeight: 1 }}>
            {animating ? "..." : countdown}
        </div>
      </div>

      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 5, pointerEvents: "none" }}>
        {NODES.slice(0, -1).map((node, i) => {
          const next = NODES[i + 1];
          const done = i + 1 < (roomData?.current_stage || 1);
          const pts = getLinePoints(node.x, node.y, next.x, next.y, W, H);
          return (
            <line key={i} x1={pts.x1} y1={pts.y1} x2={pts.x2} y2={pts.y2}
              stroke={done ? "#00e676" : "rgba(255,255,255,0.3)"} strokeWidth="4" strokeLinecap="round" />
          )
        })}
      </svg>

      {NODES.map((node, i) => {
        const stageNum = i + 1;
        const isDone = stageNum < (roomData?.current_stage || 1);
        const isActive = stageNum === (roomData?.current_stage || 1);
        return (
          <div key={node.id} style={{
            position: "absolute", left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)",
            width: NODE_SIZE, height: NODE_SIZE, borderRadius: "50%", overflow: "hidden",
            border: `4px solid ${isDone ? "#00e676" : isActive ? "#fff" : "rgba(255,255,255,0.3)"}`,
            boxShadow: isActive ? "0 0 20px rgba(255,255,255,0.5)" : "none", zIndex: 10,
          }}>
            <img src={LEVEL_IMAGES[i]} alt={`lv${stageNum}`} style={{ width: "100%", height: "100%", objectFit: "cover", filter: isDone ? "none" : isActive ? "none" : "grayscale(1) opacity(0.5)" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 24, fontWeight: 900, width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {stageNum}
            </div>
          </div>
        )
      })}

      <div style={{ position: "absolute", left: `${playerXY.x}%`, top: `${playerXY.y}%`, transform: "translate(-50%, -180%)", display: "flex", gap: 6, zIndex: 20, pointerEvents: "none" }}>
        {PLAYER_IMAGES.slice(0, Object.keys(roomData?.players || {}).length).map((img, i) => (
          <div key={i} style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", border: "3px solid #fff", boxShadow: "0 4px 10px rgba(0,0,0,0.5)", background: "#222" }}>
            <img src={img} alt="player" style={{ width: "100%", height: "160%", objectFit: "cover", objectPosition: "top" }} />
          </div>
        ))}
      </div>
    </div>
  )
}