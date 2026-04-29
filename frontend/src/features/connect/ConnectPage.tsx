import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { socket } from "../../infrastructure/socket/client"
import { SOCKET_EVENTS } from "../../infrastructure/socket/events"
import { useRoom } from "../../app/RoomProvider"
import { LOBBY_BG } from "../../shared/constants/stages"

type LookupResult = {
  pin: string
  status: string
  player_count: number
  capacity: number
  can_play: boolean
  can_spectate: boolean
}

export default function ConnectPage() {
  const navigate = useNavigate()
  const { setRoomData, notice, setNotice } = useRoom()
  const [step, setStep] = useState<"code" | "username">("code")
  const [isCreating, setIsCreating] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [lookupErr, setLookupErr] = useState<string | null>(null)
  const [lookup, setLookup] = useState<LookupResult | null>(null)

  useEffect(() => {
    const onRoomCreated = (data: any) => {
      setLoading(false)
      setRoomData(data)
      navigate("/lobby")
    }

    const onLobbyUpdated = (data: any) => {
      if (loading) {
        setLoading(false)
        setRoomData(data)
        navigate("/lobby")
      }
    }

    const onRoomFound = (data: LookupResult) => {
      setLoading(false)
      setLookup(data)
      setLookupErr(null)
      setStep("username")
    }

    const onRoomNotFound = () => {
      setLoading(false)
      setLookupErr("No room with that code")
    }

    const onError = (err: any) => {
      setLoading(false)
      setLookupErr(err?.message || "Something went wrong")
    }

    socket.on(SOCKET_EVENTS.ROOM_CREATED, onRoomCreated)
    socket.on(SOCKET_EVENTS.LOBBY_UPDATED, onLobbyUpdated)
    socket.on(SOCKET_EVENTS.ROOM_FOUND, onRoomFound)
    socket.on(SOCKET_EVENTS.ROOM_NOT_FOUND, onRoomNotFound)
    socket.on(SOCKET_EVENTS.ERROR, onError)

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_CREATED, onRoomCreated)
      socket.off(SOCKET_EVENTS.LOBBY_UPDATED, onLobbyUpdated)
      socket.off(SOCKET_EVENTS.ROOM_FOUND, onRoomFound)
      socket.off(SOCKET_EVENTS.ROOM_NOT_FOUND, onRoomNotFound)
      socket.off(SOCKET_EVENTS.ERROR, onError)
    }
  }, [loading, navigate, setRoomData])

  const handleNextStep = () => {
    if (step === "code" && roomCode.trim() !== "") {
      // Lookup the room first — no nickname yet.
      setLookupErr(null)
      setLoading(true)
      socket.emit(SOCKET_EVENTS.LOOKUP_ROOM, { pin: roomCode.trim() })
    } else if (step === "username" && username.trim() !== "") {
      setLoading(true)
      localStorage.setItem("nickname", username)
      if (isCreating) {
        socket.emit(SOCKET_EVENTS.CREATE_ROOM, { nickname: username })
      } else {
        socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
          pin: roomCode,
          nickname: username,
          spectate: lookup ? !lookup.can_play : false,
        })
      }
    }
  }

  const handleCreateTrigger = () => {
    setIsCreating(true)
    setLookup(null)
    setStep("username")
  }

  const handleBack = () => {
    setStep("code")
    setIsCreating(false)
    setUsername("")
    setLookup(null)
    setLookupErr(null)
  }

  const titleText = loading
    ? "connecting..."
    : step === "code"
      ? "Join a room"
      : isCreating
        ? "create a room — your name?"
        : "enter your username..."

  const subText =
    step === "username" && !isCreating && lookup
      ? lookup.can_play
        ? `joining room ${lookup.pin} — ${lookup.player_count}/${lookup.capacity} players`
        : `watching room ${lookup.pin} as spectator${lookup.status !== "lobby" ? " — game in progress" : ""}`
      : null

  return (
    <div
      className="relative w-screen h-svh bg-cover bg-center flex flex-col items-center justify-center font-sans animate-page-in"
      style={{ backgroundImage: `url(${LOBBY_BG})` }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {notice && (
        <div className="absolute top-[clamp(1rem,3vh,2.5rem)] left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-[clamp(1rem,2vw,2rem)] py-[clamp(0.5rem,1vh,0.75rem)] text-white text-[clamp(0.875rem,1.25vw,1.125rem)] font-semibold flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          {notice}
          <button
            onClick={() => setNotice(null)}
            className="ml-2 text-white/60 hover:text-white text-[clamp(1rem,1.5vw,1.5rem)] leading-none"
            aria-label="dismiss"
          >
            ×
          </button>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center w-fit px-[clamp(1.5rem,3vw,4rem)]">
        <h1 className="text-white text-[clamp(1.75rem,4vw,5rem)] font-bold mb-[clamp(0.75rem,2vh,1.5rem)] tracking-tight text-center">
          {titleText}
        </h1>

        {subText && (
          <p className="text-white/80 text-[clamp(0.875rem,1.25vw,1.125rem)] font-medium mb-[clamp(0.75rem,1.5vh,1.25rem)] text-center">
            {subText}
          </p>
        )}

        <div className="bg-white w-full rounded-[40px] p-[clamp(1.5rem,3vw,4rem)] shadow-2xl flex flex-col gap-[clamp(0.75rem,1.5vh,1.25rem)]">
          <input
            type="text"
            autoFocus
            disabled={loading}
            placeholder={step === "code" ? "room code!" : "username..."}
            value={step === "code" ? roomCode : username}
            onChange={e => {
              if (step === "code") {
                setRoomCode(e.target.value)
                if (lookupErr) setLookupErr(null)
              } else {
                setUsername(e.target.value)
              }
            }}
            onKeyDown={e => e.key === "Enter" && handleNextStep()}
            className="w-full border-2 border-gray-100 rounded-2xl py-[clamp(0.75rem,2vh,1.5rem)] px-[clamp(1.25rem,2vw,2.5rem)] text-center text-gray-400 text-[clamp(1rem,1.75vw,2.25rem)]! font-semibold placeholder-gray-200 outline-none focus:border-gray-200 transition-colors disabled:opacity-50"
          />

          {lookupErr && step === "code" && (
            <p className="text-red-500 text-center text-[clamp(0.875rem,1.25vw,1.125rem)] font-semibold -mt-1">
              {lookupErr}
            </p>
          )}

          <button
            onClick={handleNextStep}
            disabled={loading}
            className="w-full bg-[#111] text-white rounded-2xl text-[clamp(1rem,1.75vw,2.25rem)]! font-bold hover:bg-black active:scale-[0.98] transition-all disabled:bg-gray-400 h-[clamp(3.5rem,5vw,5.5rem)]"
          >
            {loading ? "loading..." : "enter"}
          </button>
        </div>

        {step === "code" && !loading && (
          <p className="mt-[clamp(0.75rem,2vh,1.25rem)] text-white text-[clamp(1rem,1.5vw,1.5rem)] font-medium">
            or{" "}
            <span
              onClick={handleCreateTrigger}
              className="underline cursor-pointer hover:text-gray-200 transition-colors"
            >
              create
            </span>{" "}
            one...
          </p>
        )}

        {step === "username" && !loading && (
          <button
            type="button"
            onClick={handleBack}
            className="mt-[clamp(0.75rem,2vh,1.25rem)] text-white/80 hover:text-white text-[clamp(1rem,1.5vw,1.5rem)] font-medium transition-colors"
          >
            ← back
          </button>
        )}
      </div>
    </div>
  )
}
