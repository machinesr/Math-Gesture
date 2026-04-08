import { socket } from "../../infrastructure/socket/client"
import { useRoom } from "../../app/RoomProvider"
import { getStage, PLAYER_SPRITES } from "../../shared/constants/stages"
import { useBattle } from "./useBattle"
import HandCamera from "./components/HandCamera"
import GameUI from "./components/GameUI"
import Enemy from "./components/Enemy"
import BossHealthBar from "./components/BossHealthBar"
import PlayerCharacter from "./components/PlayerCharacter"
import AttackEffect from "./components/AttackEffect"
import DamageLog from "./components/DamageLog"
import type { Player } from "../../shared/types/room"

export default function BattlePage() {
  const { roomData } = useRoom()
  const {
    state,
    damageLog,
    activeAttackerId,
    playerCombos,
    isWaitingForBoss,
    isAnyAttackActive,
    handleNumber,
    skipQuestion,
  } = useBattle()

  const currentStage = roomData?.current_stage || 1
  const currentBG = getStage(currentStage).bg
  const allPlayers: Player[] = roomData?.players ? Object.values(roomData.players) : []
  const players = allPlayers.filter(p => !p.is_spectator)
  const me = roomData && socket.id ? roomData.players?.[socket.id] : undefined
  const isSpectator = !!me?.is_spectator

  const renderPlayer = (slot: number, side: "left" | "right") => {
    const p = players[slot]
    if (!p) return null
    const isCurrentPlayer = p.session_id === socket.id
    const combo = isCurrentPlayer ? (state?.combo ?? 0) : (playerCombos[p.session_id] ?? 0)
    return (
      <PlayerCharacter
        key={p.session_id}
        side={side}
        name={p.nickname}
        sprite={PLAYER_SPRITES[slot]}
        isAttacking={activeAttackerId === p.session_id}
        combo={combo}
        isCurrentPlayer={isCurrentPlayer}
      />
    )
  }

  return (
    <div
      className="relative w-screen h-svh bg-cover bg-center bg-no-repeat transition-all duration-700 overflow-hidden animate-page-in"
      style={{ backgroundImage: `url(${currentBG})` }}
    >
      <DamageLog entries={damageLog} />

      {isWaitingForBoss ? (
        <div className="absolute top-[clamp(2rem,4vh,4rem)] left-1/2 -translate-x-1/2 text-white text-[clamp(1rem,1.5vw,1.75rem)] font-bold bg-black/50 px-[clamp(1rem,2vw,2rem)] py-[clamp(0.75rem,1.5vw,1.5rem)] rounded-xl backdrop-blur-md z-50 animate-soft-pulse border border-white/10 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          Summoning Boss
        </div>
      ) : roomData?.status === "finished" ? null : isSpectator ? (
        <div className="absolute top-[clamp(2rem,4vh,4rem)] left-1/2 -translate-x-1/2 text-white text-[clamp(1rem,1.5vw,1.75rem)] font-bold bg-black/50 px-[clamp(1rem,2vw,2rem)] py-[clamp(0.75rem,1.5vw,1.5rem)] rounded-xl backdrop-blur-md z-50 border border-white/10 uppercase tracking-widest flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-300/80" />
          spectating
        </div>
      ) : state ? (
        <GameUI state={state} onSkip={skipQuestion} />
      ) : (
        <div className="absolute top-[clamp(2rem,4vh,4rem)] left-1/2 -translate-x-1/2 text-white text-[clamp(1rem,1.5vw,1.75rem)] font-bold bg-black/50 px-[clamp(1rem,2vw,2rem)] py-[clamp(0.75rem,1.5vw,1.5rem)] rounded-xl backdrop-blur-md z-50 animate-soft-pulse border border-white/10">
          Syncing battle data
        </div>
      )}

      {!isSpectator && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 md:bottom-auto md:top-[clamp(0.75rem,2vh,2rem)] md:left-auto md:translate-x-0 md:right-[clamp(0.75rem,2vw,2rem)] w-[clamp(192px,60vw,420px)] md:w-[clamp(192px,21vw,420px)] bg-black/60 p-2 rounded-t-2xl md:rounded-2xl border border-white/10 border-b-0 md:border-b z-50 overflow-hidden">
          <HandCamera onNumberDetected={handleNumber} />
        </div>
      )}

      <AttackEffect trigger={isAnyAttackActive} />

      <div className="absolute top-[58%] md:top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none">
        {!isWaitingForBoss && (
          <>
            <BossHealthBar
              hp={roomData?.shared_monster_hp ?? 0}
              maxHp={roomData?.shared_monster_max_hp ?? 200}
              stage={currentStage}
            />
            <Enemy stage={currentStage} isHit={isAnyAttackActive} />
          </>
        )}
      </div>

      <div className="absolute top-[55%] left-0 w-full -translate-y-1/2 h-[45vh] pointer-events-none">
        <div className="absolute left-[6%] md:left-[12%] h-full flex flex-col-reverse items-center justify-center gap-[clamp(1.5rem,4vh,5rem)]">
          {[0, 2].map(i => renderPlayer(i, "left"))}
        </div>
        <div className="absolute right-[6%] md:right-[12%] h-full flex flex-col-reverse items-center justify-center gap-[clamp(1.5rem,4vh,5rem)]">
          {[1, 3].map(i => renderPlayer(i, "right"))}
        </div>
      </div>
    </div>
  )
}