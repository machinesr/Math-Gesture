import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { socket } from "../../infrastructure/socket/client"
import { SOCKET_EVENTS } from "../../infrastructure/socket/events"
import { GameController } from "../../domain/game/gameController"
import type { GameState } from "../../domain/game/types"
import { useRoom } from "../../app/RoomProvider"
import type { DamageEntry } from "../../shared/types/room"
import {
  ATTACK_INDICATION_MS,
  DAMAGE_LOG_MAX,
  DAMAGE_LOG_TTL_MS,
  FEEDBACK_MS,
} from "../../shared/constants/stages"

type UseBattleResult = {
  state: GameState | null
  damageLog: DamageEntry[]
  activeAttackerId: string | null
  playerCombos: Record<string, number>
  isWaitingForBoss: boolean
  isAnyAttackActive: boolean
  handleNumber: (num: number) => void
  skipQuestion: () => void
}

export function useBattle(): UseBattleResult {
  const navigate = useNavigate()
  const { roomData, setRoomData, patchRoomData, difficulty } = useRoom()

  const gameRef = useRef(new GameController(difficulty))
  const roomDataRef = useRef(roomData)
  const hasAdvancedRef = useRef(false)
  const bossWasAlive = useRef(false)

  const [state, setState] = useState<GameState | null>(null)
  const [damageLog, setDamageLog] = useState<DamageEntry[]>([])
  const [activeAttackerId, setActiveAttackerId] = useState<string | null>(null)
  const [playerCombos, setPlayerCombos] = useState<Record<string, number>>({})
  const [isTransitioning, setIsTransitioning] = useState(false)

  const isSpectator = useMemo(() => {
    if (!roomData || !socket.id) return false
    return !!roomData.players?.[socket.id]?.is_spectator
  }, [roomData])

  const isWaitingForBoss = isTransitioning || !roomData || roomData.shared_monster_hp === -1
  const isAnyAttackActive = !!activeAttackerId || state?.event === "attack"

  // Keep the controller's difficulty in sync if the host changes it later.
  // setDifficulty internally regenerates the in-flight question to match the
  // new format, so we re-publish controller state to React.
  useEffect(() => {
    gameRef.current.setDifficulty(difficulty)
    setState(gameRef.current.update(0))
  }, [difficulty])

  // Bootstrap + socket listeners
  useEffect(() => {
    if (!roomData?.pin) {
      navigate("/")
      return
    }

    socket.emit(SOCKET_EVENTS.JOIN_ROOM, { pin: roomData.pin.toString() })

    const onLobbyUpdated = (data: any) => setRoomData(data)

    const onGameStarted = (data: any) => {
      setRoomData(data)
      hasAdvancedRef.current = false
      bossWasAlive.current = data.shared_monster_hp > 0
      setIsTransitioning(false)
      setState(gameRef.current.update(0))
    }

    const onStageAdvanced = (data: any) => {
      // Server is the source of truth for current_stage and HP. We just sync.
      setRoomData(data)
      hasAdvancedRef.current = false
      bossWasAlive.current = data.shared_monster_hp > 0
      setIsTransitioning(true)
      // Everyone — players AND spectators — moves to the stage map between
      // bosses. Driving the navigation off this event (instead of the hp==0
      // detection effect) avoids a React batching race where spectators never
      // observe the transient hp=0 frame.
      setTimeout(() => navigate("/stage"), 1200)
    }

    const onMonsterDamaged = (data: any) => {
      patchRoomData({ shared_monster_hp: data.shared_monster_hp })
      setActiveAttackerId(data.player_id)
      setPlayerCombos(prev => ({ ...prev, [data.player_id]: data.combo ?? 0 }))

      setTimeout(() => setActiveAttackerId(null), ATTACK_INDICATION_MS)

      const players = roomDataRef.current?.players || {}
      const attackerNickname = players[data.player_id]?.nickname || "Player"
      const logId = Date.now()
      setDamageLog(prev =>
        [{ id: logId, text: `${attackerNickname} dealt ${data.damage || 10} damage!` }, ...prev].slice(0, DAMAGE_LOG_MAX)
      )
      setTimeout(() => setDamageLog(prev => prev.filter(e => e.id !== logId)), DAMAGE_LOG_TTL_MS)
    }

    const onGameOver = (data: any) => {
      console.log("Game Complete! Preparing results...")
      setTimeout(() => {
        navigate("/results", {
          state: { leaderboard: data.leaderboard, time: data.time },
        })
      }, 500)
    }

    socket.on(SOCKET_EVENTS.LOBBY_UPDATED, onLobbyUpdated)
    socket.on(SOCKET_EVENTS.GAME_STARTED, onGameStarted)
    socket.on(SOCKET_EVENTS.STAGE_ADVANCED, onStageAdvanced)
    socket.on(SOCKET_EVENTS.MONSTER_DAMAGED, onMonsterDamaged)
    socket.on(SOCKET_EVENTS.GAME_OVER, onGameOver)

    return () => {
      socket.off(SOCKET_EVENTS.LOBBY_UPDATED, onLobbyUpdated)
      socket.off(SOCKET_EVENTS.GAME_STARTED, onGameStarted)
      socket.off(SOCKET_EVENTS.STAGE_ADVANCED, onStageAdvanced)
      socket.off(SOCKET_EVENTS.MONSTER_DAMAGED, onMonsterDamaged)
      socket.off(SOCKET_EVENTS.GAME_OVER, onGameOver)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, roomData?.pin])

  // Stage advancement & first-state seeding
  useEffect(() => {
    roomDataRef.current = roomData
    if (!roomData) return

    if (roomData.shared_monster_hp > 0) {
      bossWasAlive.current = true
      if (!state) setState(gameRef.current.update(0))
    }

    const isHost = socket.id === roomData.creator_session_id

    if (
      roomData.status === "playing" &&
      roomData.shared_monster_hp === 0 &&
      bossWasAlive.current &&
      !hasAdvancedRef.current
    ) {
      hasAdvancedRef.current = true
      // Show the transition overlay immediately so the dead-boss frame doesn't
      // linger. The host nudges the server to advance; everyone (host +
      // spectators) navigates from the STAGE_ADVANCED listener instead, which
      // is robust against React 18 batching of monster_damaged + stage_advanced.
      setIsTransitioning(true)
      if (isHost) socket.emit(SOCKET_EVENTS.ADVANCE_LEVEL, { pin: roomData.pin.toString() })
    }
  }, [roomData, state, navigate])

  // Drive the post-result advance from a wall-clock timer instead of camera
  // events, so a correct answer rotates to a new question even if the player
  // pulls their hand out of frame the moment they lock in.
  useEffect(() => {
    if (!state?.result) return
    const t = setTimeout(() => {
      const next = gameRef.current.tick()
      if (next) setState(next)
    }, FEEDBACK_MS + 50)
    return () => clearTimeout(t)
  }, [state?.result])

  const handleNumber = useCallback(
    (num: number) => {
      if (isSpectator || isWaitingForBoss || (roomData?.shared_monster_hp ?? 0) <= 0) return
      const newState = gameRef.current.update(num)
      if (newState?.event === "attack") {
        socket.emit(SOCKET_EVENTS.DAMAGE_MONSTER, {
          pin: roomData!.pin.toString(),
          damage: newState.attackDamage,
          combo: newState.combo,
        })
      }
      setState(newState)
    },
    [roomData, isWaitingForBoss, isSpectator]
  )

  const skipQuestion = useCallback(() => {
    if (isSpectator || isWaitingForBoss) return
    gameRef.current.skip()
    setState(gameRef.current.update(0))
  }, [isWaitingForBoss, isSpectator])

  return {
    state,
    damageLog,
    activeAttackerId,
    playerCombos,
    isWaitingForBoss,
    isAnyAttackActive,
    handleNumber,
    skipQuestion,
  }
}
