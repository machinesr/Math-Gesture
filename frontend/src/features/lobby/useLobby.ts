import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { socket } from "../../infrastructure/socket/client"
import { SOCKET_EVENTS } from "../../infrastructure/socket/events"
import { useRoom } from "../../app/RoomProvider"

export function useLobby() {
  const navigate = useNavigate()
  const { roomData, setRoomData } = useRoom()
  const [isStarting, setIsStarting] = useState(false)
  // Camera pre-warm is now handled by CameraProvider, kicked off from
  // ConnectPage when the user first connects. No need to do it here.

  useEffect(() => {
    const onLobbyUpdated = (data: any) => setRoomData(data)

    const handleStartSequence = (data: any) => {
      setIsStarting(true)
      if (data) setRoomData(data)
      setTimeout(() => navigate("/stage"), 3000)
    }

    socket.on(SOCKET_EVENTS.LOBBY_UPDATED, onLobbyUpdated)
    socket.on(SOCKET_EVENTS.ALL_PLAYERS_READY, handleStartSequence)
    socket.on(SOCKET_EVENTS.GAME_STARTED, handleStartSequence)

    return () => {
      socket.off(SOCKET_EVENTS.LOBBY_UPDATED, onLobbyUpdated)
      socket.off(SOCKET_EVENTS.ALL_PLAYERS_READY, handleStartSequence)
      socket.off(SOCKET_EVENTS.GAME_STARTED, handleStartSequence)
    }
  }, [navigate, setRoomData])

  const handleReadyToggle = (isReady: boolean) => {
    socket.emit(SOCKET_EVENTS.PLAYER_READY, {
      pin: roomData?.pin,
      ready: isReady,
    })
  }

  return { roomData, isStarting, handleReadyToggle }
}
