import { useEffect, useRef, useState } from "react"
import { LOBBY_BG, PLAYER_SPRITES, DIFFICULTIES, type Difficulty } from "../../shared/constants/stages"
import type { Player } from "../../shared/types/room"
import PlayerCharacter from "../battle/components/PlayerCharacter"
import ReadyButton from "./ReadyButton"
import { useLobby } from "./useLobby"
import { useRoom } from "../../app/RoomProvider"
import { socket } from "../../infrastructure/socket/client"

const DIFFICULTY_OPTIONS: Difficulty[] = DIFFICULTIES

export default function LobbyPage() {
  const { roomData, isStarting, handleReadyToggle } = useLobby()
  const { difficulty, setDifficulty } = useRoom()
  const allPlayers: Player[] = roomData?.players ? Object.values(roomData.players) : []
  const players = allPlayers.filter(p => !p.is_spectator)
  const spectators = allPlayers.filter(p => p.is_spectator)

  const me = roomData && socket.id ? roomData.players?.[socket.id] : undefined
  const isSpectator = !!me?.is_spectator
  const isHost = !!socket.id && socket.id === roomData?.creator_session_id

  const [levelOpen, setLevelOpen] = useState(false)
  const levelRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!levelOpen) return
    const onClick = (e: MouseEvent) => {
      if (!levelRef.current?.contains(e.target as Node)) setLevelOpen(false)
    }
    window.addEventListener("mousedown", onClick)
    return () => window.removeEventListener("mousedown", onClick)
  }, [levelOpen])

  return (
    <div
      className="relative w-screen h-svh bg-cover bg-center overflow-hidden flex flex-col items-center font-sans animate-page-in"
      style={{ backgroundImage: `url(${LOBBY_BG})` }}
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {!isStarting && !isSpectator && <ReadyButton onToggle={handleReadyToggle} />}
      {!isStarting && isSpectator && (
        <div className="absolute top-[clamp(1.5rem,3vh,3rem)] right-[clamp(1.5rem,2.5vw,2.5rem)] px-[clamp(1.5rem,3vw,2.5rem)] py-[clamp(0.5rem,1.5vh,1rem)] rounded-[15px] bg-black/60 border border-white/10 text-white/80 font-bold text-[clamp(1rem,1.5vw,1.5rem)] uppercase tracking-widest backdrop-blur-sm">
          spectating
        </div>
      )}

      {spectators.length > 0 && (
        <div className="absolute top-[clamp(1.5rem,3vh,3rem)] left-[clamp(1.5rem,2.5vw,2.5rem)] z-20 bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl px-[clamp(1rem,1.5vw,1.5rem)] py-[clamp(0.5rem,1vh,0.75rem)] text-white/80 text-[clamp(0.875rem,1.25vw,1.125rem)] font-semibold flex items-center gap-2">
          <span>👁</span>
          <span>{spectators.length} watching</span>
        </div>
      )}

      <div
        className={`absolute top-[18%] left-1/2 -translate-x-1/2 backdrop-blur-md border border-white/10 rounded-[40px] py-[clamp(1.5rem,4vh,5rem)] flex flex-col items-center w-[90vw] max-w-5xl shadow-2xl z-20 transition-all duration-700 ${
          isStarting ? "bg-green-500/30 border-green-400/40 scale-105" : "bg-black/40"
        }`}
      >
        <h1 className="text-white text-[clamp(1.5rem,4.5vw,5.5rem)] font-bold tracking-tight mb-[clamp(0.5rem,1.5vh,1.5rem)] text-center w-full px-4">
          {isStarting ? "Starting Game..." : "waiting for everyone to ready up..."}
        </h1>
        <p className="text-white/80 text-[clamp(0.875rem,1.75vw,2rem)] font-medium">
          {isStarting ? "Get ready!" : `code : ${roomData?.pin || "----"}`}
        </p>
      </div>

      <div className="absolute bottom-[clamp(1.5rem,4vh,5rem)] w-full px-[clamp(1rem,2.5vw,2.5rem)] flex justify-center gap-[clamp(1rem,2.5vw,3.5rem)]">
        {[0, 1, 2, 3].map(index => {
          const p = players[index]
          const isOccupied = !!p
          const isReady = isOccupied && p.is_ready

          return (
            <div key={index} className="flex flex-col items-center w-[clamp(8rem,14vw,20rem)]">
              <div className="bg-black/30 backdrop-blur-sm px-[clamp(0.75rem,1.5vw,1.5rem)] py-[clamp(0.25rem,0.75vh,0.75rem)] rounded-xl mb-[clamp(0.75rem,2vh,1.5rem)] w-full text-center border border-white/5">
                <p
                  className={`text-[clamp(0.75rem,1.25vw,1.5rem)] font-semibold truncate transition-colors duration-300 ${
                    isReady ? "text-[#71C58E]" : "text-white"
                  }`}
                >
                  {isOccupied ? p.nickname : "waiting..."}
                </p>
              </div>

              <div className={isOccupied ? "opacity-100" : "opacity-40 grayscale-[0.5]"}>
                <PlayerCharacter name="" sprite={PLAYER_SPRITES[index]} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Difficulty selector — bottom-left, host-controlled. Click to open
          a small popover; non-hosts see it disabled. Fonts/sizes match the
          rest of the lobby chrome. */}
      <div
        ref={levelRef}
        className="absolute bottom-[clamp(1rem,2.5vh,2rem)] left-[clamp(1rem,2vw,2rem)] z-30"
      >
        {levelOpen && (
          <div className="absolute bottom-full left-0 mb-2 flex flex-col gap-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-[clamp(0.4rem,0.8vw,0.6rem)] shadow-2xl min-w-full">
            {DIFFICULTY_OPTIONS.map(opt => {
              const active = opt === difficulty
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setDifficulty(opt)
                    setLevelOpen(false)
                  }}
                  className={`px-[clamp(1rem,1.5vw,1.5rem)] py-[clamp(0.4rem,0.75vh,0.6rem)] rounded-xl text-[clamp(0.875rem,1.25vw,1.125rem)] font-bold uppercase tracking-wider text-left transition-all duration-150 ${
                    active
                      ? "bg-white/90 text-black"
                      : "bg-white/5 text-white/80 hover:bg-white/15 hover:text-white"
                  } active:scale-95 cursor-pointer`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        <button
          type="button"
          disabled={!isHost || isStarting}
          onClick={() => setLevelOpen(o => !o)}
          className={`flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl px-[clamp(1rem,1.75vw,1.75rem)] py-[clamp(0.5rem,1vh,0.875rem)] text-white text-[clamp(0.875rem,1.25vw,1.125rem)] font-bold uppercase tracking-wider shadow-xl transition-all duration-200 ${
            !isHost || isStarting ? "opacity-70 cursor-not-allowed" : "hover:bg-black/75 active:scale-95"
          }`}
        >
          <span className="text-white/60 font-semibold">level:</span>
          <span>{difficulty}</span>
          <span className="text-white/50 text-[0.8em]">▾</span>
        </button>
      </div>
    </div>
  )
}
