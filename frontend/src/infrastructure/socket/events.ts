// Centralized socket event names. Use these constants instead of raw strings
// so refactors are safe and IDE autocomplete works.

export const SOCKET_EVENTS = {
  // Client → Server
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
  PLAYER_READY: "player_ready",
  DAMAGE_MONSTER: "damage_monster",
  ADVANCE_LEVEL: "advance_level",
  LOOKUP_ROOM: "lookup_room",
  SET_DIFFICULTY: "set_difficulty",

  // Server → Client
  ROOM_CREATED: "room_created",
  LOBBY_UPDATED: "lobby_updated",
  ALL_PLAYERS_READY: "all_players_ready",
  GAME_STARTED: "game_started",
  MONSTER_DAMAGED: "monster_damaged",
  STAGE_ADVANCED: "stage_advanced",
  GAME_OVER: "game_over",
  ROOM_FOUND: "room_found",
  ROOM_NOT_FOUND: "room_not_found",
  ROOM_CLOSED: "room_closed",
  ERROR: "error",
} as const
