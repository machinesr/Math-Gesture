export type Player = {
  session_id: string
  nickname: string
  is_ready: boolean
  is_spectator?: boolean
  score?: number
  highest_combo?: number
  rank?: number
}

export type RoomStatus = "waiting" | "playing" | "finished"

export type RoomData = {
  pin: string | number
  players: Record<string, Player>
  status: RoomStatus
  shared_monster_hp: number
  shared_monster_max_hp: number
  current_stage: number
  creator_session_id: string
  difficulty?: string
}

export type LeaderboardEntry = Player & {
  rank: number
  score: number
  highest_combo: number
}

export type DamageEntry = {
  id: number
  text: string
}
