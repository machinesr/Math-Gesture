import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { socket } from "../../infrastructure/socket/client"
import { SOCKET_EVENTS } from "../../infrastructure/socket/events"
import { useRoom } from "../../app/RoomProvider"
import { STAGE_COUNTDOWN_SEC, STAGE_TRAVEL_MS } from "../../shared/constants/stages"

export type Node = { id: number; x: number; y: number }

export const NODES: Node[] = [
  { id: 1, x: 18, y: 63 },
  { id: 2, x: 35, y: 36 },
  { id: 3, x: 52, y: 63 },
  { id: 4, x: 68, y: 36 },
  { id: 5, x: 85, y: 63 },
]

export function useStageMap() {
  const navigate = useNavigate()
  const { roomData, setRoomData } = useRoom()

  const initialStage = roomData?.current_stage || 1
  const startVisualNodeIdx = initialStage > 1 ? initialStage - 2 : 0

  const [countdown, setCountdown] = useState(STAGE_COUNTDOWN_SEC)
  const [playerXY, setPlayerXY] = useState({
    x: NODES[startVisualNodeIdx].x,
    y: NODES[startVisualNodeIdx].y,
  })
  const [animating, setAnimating] = useState(false)
  const [isTimerActive, setIsTimerActive] = useState(false)

  // Track viewport size so the SVG line geometry reacts to window resizes /
  // device rotation. Previously this was captured once at module load.
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener("resize", onResize)
    window.addEventListener("orientationchange", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("orientationchange", onResize)
    }
  }, [])

  const visualStageRef = useRef<number>(initialStage > 1 ? initialStage - 1 : 1)
  const roomDataRef = useRef(roomData)

  useEffect(() => {
    roomDataRef.current = roomData
  }, [roomData])

  // Re-join room and listen for updates
  useEffect(() => {
    if (roomData?.pin) {
      const myNickname = localStorage.getItem("nickname") || "Player"
      socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
        pin: roomData.pin.toString(),
        nickname: myNickname,
      })
    }

    const onUpdate = (data: any) => setRoomData(data)

    socket.on(SOCKET_EVENTS.LOBBY_UPDATED, onUpdate)
    socket.on(SOCKET_EVENTS.STAGE_ADVANCED, onUpdate)

    return () => {
      socket.off(SOCKET_EVENTS.LOBBY_UPDATED, onUpdate)
      socket.off(SOCKET_EVENTS.STAGE_ADVANCED, onUpdate)
    }
  }, [roomData?.pin, setRoomData])

  // Animation / countdown gating
  useEffect(() => {
    if (!roomData || animating) return
    const currentStage = roomData.current_stage || 1

    if (currentStage > visualStageRef.current) {
      setIsTimerActive(false)
      const t = setTimeout(() => {
        animateToNext(visualStageRef.current, currentStage)
        visualStageRef.current = currentStage
      }, 600)
      return () => clearTimeout(t)
    } else if (!animating && !isTimerActive) {
      const node = NODES[currentStage - 1]
      setPlayerXY({ x: node.x, y: node.y })
      setIsTimerActive(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomData?.current_stage, animating, isTimerActive])

  // Countdown ticker
  useEffect(() => {
    if (!isTimerActive) return
    const interval = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [isTimerActive])

  // Navigate to battle when countdown hits zero
  useEffect(() => {
    if (countdown === 0 && isTimerActive) {
      navigate("/battle")
    }
  }, [countdown, isTimerActive, navigate])

  function animateToNext(fromIdx: number, toIdx: number) {
    setAnimating(true)
    const from = NODES[fromIdx - 1]
    const to = NODES[toIdx - 1]
    const startTime = performance.now()

    function step(now: number) {
      const progress = Math.min((now - startTime) / STAGE_TRAVEL_MS, 1)
      setPlayerXY({
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress,
      })
      if (progress < 1) requestAnimationFrame(step)
      else setAnimating(false)
    }
    requestAnimationFrame(step)
  }

  return { roomData, countdown, playerXY, animating, viewport }
}
