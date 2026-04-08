import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { RoomData } from "../shared/types/room"
import { socket } from "../infrastructure/socket/client"
import { SOCKET_EVENTS } from "../infrastructure/socket/events"
import { DEFAULT_DIFFICULTY, type Difficulty } from "../shared/constants/stages"

type RoomContextValue = {
  roomData: RoomData | null
  setRoomData: (data: RoomData | null) => void
  patchRoomData: (patch: Partial<RoomData>) => void
  notice: string | null
  setNotice: (msg: string | null) => void
  difficulty: Difficulty
  setDifficulty: (d: Difficulty) => void
}

const RoomContext = createContext<RoomContextValue | null>(null)

export function RoomProvider({ children }: { children: ReactNode }) {
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  // Local fallback for the pre-room phase. Once a room exists, the
  // server-broadcast `roomData.difficulty` is the source of truth.
  const [localDifficulty, setLocalDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY)

  const difficulty: Difficulty =
    (roomData?.difficulty as Difficulty | undefined) ?? localDifficulty

  const setDifficulty = useCallback(
    (d: Difficulty) => {
      if (roomData?.pin) {
        // Host emits to server; server validates + broadcasts via lobby_updated.
        socket.emit(SOCKET_EVENTS.SET_DIFFICULTY, {
          pin: roomData.pin.toString(),
          difficulty: d,
        })
      } else {
        setLocalDifficulty(d)
      }
    },
    [roomData?.pin]
  )

  const patchRoomData = useCallback((patch: Partial<RoomData>) => {
    setRoomData(prev => (prev ? { ...prev, ...patch } : prev))
  }, [])

  // Global lifecycle: if the host disconnects the server emits room_closed.
  // We bounce everyone back to the connect screen with a notice.
  useEffect(() => {
    const onRoomClosed = (data: { reason?: string }) => {
      setRoomData(null)
      setNotice(data?.reason === "Creator Disconnected" ? "Host left the room." : (data?.reason || "Room closed."))
    }
    socket.on(SOCKET_EVENTS.ROOM_CLOSED, onRoomClosed)
    return () => {
      socket.off(SOCKET_EVENTS.ROOM_CLOSED, onRoomClosed)
    }
  }, [])

  return (
    <RoomContext.Provider value={{ roomData, setRoomData, patchRoomData, notice, setNotice, difficulty, setDifficulty }}>
      {children}
    </RoomContext.Provider>
  )
}

export function useRoom(): RoomContextValue {
  const ctx = useContext(RoomContext)
  if (!ctx) throw new Error("useRoom must be used inside <RoomProvider>")
  return ctx
}
