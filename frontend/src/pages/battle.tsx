import { useState, useCallback, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom" 
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

import { socket } from "../network/socket"

export default function Battle() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [roomData, setRoomData] = useState<any>(location.state?.roomData || null)
  const gameRef = useRef(new GameController())
  const roomDataRef = useRef<any>(roomData)
  
  const [state, setState] = useState<any>(null)
  const [damageLog, setDamageLog] = useState<any[]>([])
  const [activeAttackerId, setActiveAttackerId] = useState<string | null>(null)
  
  const hasAdvancedRef = useRef(false)
  const bossWasAlive = useRef(false)

  const isWaitingForBoss = !roomData || roomData.shared_monster_hp === -1;

  // 1. INITIAL SYNC & SOCKET LISTENERS
  useEffect(() => {
    if (!roomData?.pin) {
      navigate("/")
      return
    }

    socket.emit("join_room", { pin: roomData.pin.toString() });

    const onGameStarted = (data: any) => {
      setRoomData(data)
      hasAdvancedRef.current = false
      bossWasAlive.current = data.shared_monster_hp > 0
      setState(gameRef.current.update(0))
    }

    const onMonsterDamaged = (data: any) => {
      setRoomData((prev: any) => (prev ? { ...prev, shared_monster_hp: data.shared_monster_hp } : prev))
      setActiveAttackerId(data.player_id)
      setTimeout(() => setActiveAttackerId(null), 800)

      const players = roomDataRef.current?.players || {}
      const attackerNickname = players[data.player_id]?.nickname || "Player"
      const logId = Date.now()
      setDamageLog(prev => [{ id: logId, text: `${attackerNickname} dealt ${data.damage || 10} damage!` }, ...prev].slice(0, 3))
      setTimeout(() => setDamageLog(prev => prev.filter(e => e.id !== logId)), 4000)
    }

    socket.on("lobby_updated", (data) => setRoomData(data))
    socket.on("game_started", onGameStarted)
    socket.on("monster_damaged", onMonsterDamaged)

    return () => {
      socket.off("lobby_updated")
      socket.off("game_started", onGameStarted)
      socket.off("monster_damaged", onMonsterDamaged)
    }
  }, [navigate, roomData?.pin])

  // 2. INTERNAL LOGIC MONITOR (VICTORY & HP)
  useEffect(() => {
    roomDataRef.current = roomData

    if (roomData?.shared_monster_hp > 0) {
      bossWasAlive.current = true
      if (!state) {
        setState(gameRef.current.update(0))
      }
    }

    // --- MULTIPLAYER FIX ---
    // Only the creator (Host) should emit the advance_level signal.
    // Everyone else just navigates to the map.
    const isHost = socket.id === roomData?.creator_session_id;

    if (
      roomData?.status === "playing" && 
      roomData?.shared_monster_hp === 0 && 
      bossWasAlive.current && 
      !hasAdvancedRef.current
    ) {
      hasAdvancedRef.current = true;

      // Only the host tells the server to increment stage_num
      if (isHost) {
        console.log("Host detected: Sending advance_level signal...");
        socket.emit("advance_level", { pin: roomData.pin.toString() });
      }

      const timer = setTimeout(() => {
        navigate("/Map", { 
          state: { 
            roomData: { 
              ...roomData, 
              shared_monster_hp: -1, 
              current_stage: (roomData.current_stage || 1) + 1 
            } 
          } 
        })
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [roomData, state, navigate])

  // 3. HANDLER
  const handleNumber = useCallback((num: number) => {
    if (isWaitingForBoss || (roomData?.shared_monster_hp ?? 0) <= 0) return
    
    const newState = gameRef.current.update(num)
    if (newState?.event === "attack") {
      socket.emit("damage_monster", { 
        pin: roomData.pin.toString(), 
        damage: 10 
      })
    }
    setState(newState)
  }, [roomData, isWaitingForBoss])

  const players = roomData?.players ? Object.values(roomData.players) : []

  return (
    <div className="relative w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden" 
          style={{ backgroundImage: `url(${cave})`}}>

      <DamageLog entries={damageLog} />
      
      {isWaitingForBoss ? (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-white text-2xl font-bold bg-black/50 p-4 rounded-xl backdrop-blur-md z-50 animate-pulse">
          Summoning Boss...
        </div>
      ) : state ? (
        <GameUI state={state} />
      ) : (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-white text-2xl font-bold bg-black/50 p-4 rounded-xl backdrop-blur-md z-50">
          Syncing Battle Data...
        </div>
      )}
      
      <div className="absolute top-4 right-4 w-80 bg-black/60 p-2 rounded-2xl border border-white/10 z-50 overflow-hidden">
        <HandCamera onNumberDetected={handleNumber} />
      </div>

      <AttackEffect trigger={state?.event === "attack"} />

      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-10 pointer-events-none">
          {!isWaitingForBoss && (
            <>
              <BossHealthBar hp={roomData?.shared_monster_hp} maxHp={roomData?.shared_monster_max_hp ?? 200} />
              <Boss isHit={state?.event === "attack"} />
            </>
          )}
      </div>

      <div className="absolute top-[55%] left-0 w-full -translate-y-1/2 h-[45vh] pointer-events-none">
        <div className="absolute left-[12%] h-full flex flex-col-reverse items-center justify-center gap-12">
          {[0, 2].map((i) => {
            const p: any = players[i]
            if (!p) return null
            return <PlayerCharacterLeft key={p.session_id} name={p.nickname} sprite={i === 0 ? red : pink} isAttacking={activeAttackerId === p.session_id} />
          })}
        </div>

        <div className="absolute right-[12%] h-full flex flex-col-reverse items-center justify-center gap-12">
          {[1, 3].map((i) => {
            const p: any = players[i]
            if (!p) return null
            return <PlayerCharacterRight key={p.session_id} name={p.nickname} sprite={i === 1 ? blue : green} isAttacking={activeAttackerId === p.session_id} />
          })}
        </div>
      </div>
    </div>
  )
}