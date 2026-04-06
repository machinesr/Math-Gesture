import { useState, useCallback, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom" 
import HandCamera from "../components/handcamera"
import { GameController } from "../game/gameController"
import GameUI from "../components/gameUI"
import PlayerCharacterLeft from "../components/playermodelleft"
import PlayerCharacterRight from "../components/playermodelright"
import Enemy from "../components/enemy" 
import BossHealthBar from "../components/healthbar"
import red from "../assets/red.png"
import blue from "../assets/blue.png"
import green from "../assets/green.png"
import pink from "../assets/pink.png"
import AttackEffect from "../components/attackEffect"
import DamageLog from "../components/damageLog"


import cave from "../assets/cavebg.png"
import graveyard from "../assets/graveyardbg.png"
import castle from "../assets/castlebg.png"
import terrace from "../assets/terracebg.png"
import throneroom from "../assets/throneroombg.png"

import { socket } from "../network/socket"

const BATTLE_BGS: Record<number, string> = {
  1: cave,
  2: graveyard,
  3: castle,
  4: terrace,
  5: throneroom
}

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


  const currentStage = roomData?.current_stage || 1;
  const currentBG = BATTLE_BGS[currentStage] || cave;

 
  const isAnyAttackActive = !!activeAttackerId || state?.event === "attack";

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

    const onGameOver = (data: any) => {
      console.log("Game Complete! Preparing results...");
      setTimeout(() => {
        navigate("/Winscreen", { 
          state: { 
            leaderboard: data.leaderboard, 
            time: data.time 
          } 
        });
      }, 500); 
    }

    socket.on("lobby_updated", (data) => setRoomData(data))
    socket.on("game_started", onGameStarted)
    socket.on("monster_damaged", onMonsterDamaged)
    socket.on("game_over", onGameOver)

    return () => {
      socket.off("lobby_updated")
      socket.off("game_started", onGameStarted)
      socket.off("monster_damaged", onMonsterDamaged)
      socket.off("game_over", onGameOver)
    }
  }, [navigate, roomData?.pin])

  useEffect(() => {
    roomDataRef.current = roomData
    if (roomData?.shared_monster_hp > 0) {
      bossWasAlive.current = true
      if (!state) setState(gameRef.current.update(0))
    }

    const isHost = socket.id === roomData?.creator_session_id;

    if (roomData?.status === "playing" && roomData?.shared_monster_hp === 0 && bossWasAlive.current && !hasAdvancedRef.current) {
      hasAdvancedRef.current = true;
      if (isHost) socket.emit("advance_level", { pin: roomData.pin.toString() });

      if (roomData.current_stage < 5) {
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
    }
  }, [roomData, state, navigate])

  const handleNumber = useCallback((num: number) => {
    if (isWaitingForBoss || (roomData?.shared_monster_hp ?? 0) <= 0) return
    const newState = gameRef.current.update(num)
    if (newState?.event === "attack") {
      socket.emit("damage_monster", { pin: roomData.pin.toString(), damage: newState.attackDamage })
    }
    setState(newState)
  }, [roomData, isWaitingForBoss])

  const players = roomData?.players ? Object.values(roomData.players) : []

  return (
    <div 
      className="relative w-screen h-screen bg-cover bg-center bg-no-repeat transition-all duration-700 overflow-hidden" 
      style={{ backgroundImage: `url(${currentBG})`}} 
    >
      <DamageLog entries={damageLog} />
      
      {isWaitingForBoss ? (
        <div className="absolute top-[clamp(2rem,4vh,4rem)] left-1/2 -translate-x-1/2 text-white text-[clamp(1rem,1.5vw,1.75rem)] font-bold bg-black/50 p-[clamp(0.75rem,1.5vw,1.5rem)] rounded-xl backdrop-blur-md z-50 animate-pulse">
          Summoning Boss...
        </div>
      ) : roomData?.status === "finished" ? (
        <div className=""></div>
      ) : state ? (
        <GameUI state={state} />
      ) : (
        <div className="absolute top-[clamp(2rem,4vh,4rem)] left-1/2 -translate-x-1/2 text-white text-[clamp(1rem,1.5vw,1.75rem)] font-bold bg-black/50 p-[clamp(0.75rem,1.5vw,1.5rem)] rounded-xl backdrop-blur-md z-50">
          Syncing Battle Data...
        </div>
      )}
      
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 md:bottom-auto md:top-[clamp(0.75rem,2vh,2rem)] md:left-auto md:translate-x-0 md:right-[clamp(0.75rem,2vw,2rem)] w-[clamp(192px,60vw,420px)] md:w-[clamp(192px,21vw,420px)] bg-black/60 p-2 rounded-2xl border border-white/10 z-50 overflow-hidden">
        <HandCamera onNumberDetected={handleNumber} />
      </div>

      {/* UPDATED: trigger now responds to anyone attacking */}
      <AttackEffect trigger={isAnyAttackActive} />

      <div className="absolute top-[52%] md:top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none">
          {!isWaitingForBoss && (
            <>
              <BossHealthBar 
                hp={roomData?.shared_monster_hp} 
                maxHp={roomData?.shared_monster_max_hp ?? 200} 
                stage={currentStage}
              />
              {/* UPDATED: isHit now responds to anyone attacking */}
              <Enemy stage={currentStage} isHit={isAnyAttackActive} />
            </>
          )}
      </div>

      <div className="absolute top-[55%] left-0 w-full -translate-y-1/2 h-[45vh] pointer-events-none">
        <div className="absolute left-[6%] md:left-[12%] h-full flex flex-col-reverse items-center justify-center gap-[clamp(1.5rem,4vh,5rem)]">
          {[0, 2].map((i) => {
            const p: any = players[i]
            if (!p) return null
            return <PlayerCharacterLeft key={p.session_id} name={p.nickname} sprite={i === 0 ? red : pink} isAttacking={activeAttackerId === p.session_id} />
          })}
        </div>
        <div className="absolute right-[6%] md:right-[12%] h-full flex flex-col-reverse items-center justify-center gap-[clamp(1.5rem,4vh,5rem)]">
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