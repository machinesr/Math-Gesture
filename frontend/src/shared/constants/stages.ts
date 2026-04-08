// Stage assets
import cave from "../../assets/cavebg.png"
import graveyard from "../../assets/graveyardbg.png"
import castle from "../../assets/castlebg.png"
import terrace from "../../assets/terracebg.png"
import throneroom from "../../assets/throneroombg.png"

import centipede from "../../assets/centipede.png"
import centipedeHit from "../../assets/centipede-hit.png"
import turtle from "../../assets/turtle.png"
import turtleHit from "../../assets/turtle-hit.png"
import zombie from "../../assets/zombie.png"
import zombieHit from "../../assets/zombie-hit.png"
import guy from "../../assets/guy.png"
import guyHit from "../../assets/guy-hit.png"
import chimera from "../../assets/chimera.png"
import chimeraHit from "../../assets/chimera-hit.png"

// Player sprites
import red from "../../assets/red.png"
import blue from "../../assets/blue.png"
import green from "../../assets/green.png"
import pink from "../../assets/pink.png"

// Misc
import lobbyBg from "../../assets/lobbybg.png"

export type StageDef = {
  id: number
  name: string
  bg: string
  enemy: string
  enemyHit: string
}

export const STAGES: StageDef[] = [
  { id: 1, name: "Centipede",        bg: cave,       enemy: centipede, enemyHit: centipedeHit },
  { id: 2, name: "Ancient Turtle",   bg: graveyard,  enemy: turtle,    enemyHit: turtleHit },
  { id: 3, name: "Crypt Zombie",     bg: castle,     enemy: zombie,    enemyHit: zombieHit },
  { id: 4, name: "Corrupted Knight", bg: terrace,    enemy: guy,       enemyHit: guyHit },
  { id: 5, name: "Final Chimera",    bg: throneroom, enemy: chimera,   enemyHit: chimeraHit },
]

export function getStage(stageNum: number): StageDef {
  return STAGES[Math.max(0, Math.min(STAGES.length - 1, stageNum - 1))]
}

// Player sprite slots — index = player slot 0..3
// Order matches lobby/battle layout: 0=top-left, 1=top-right, 2=bottom-left, 3=bottom-right
export const PLAYER_SPRITES = [red, blue, pink, green]

export const LOBBY_BG = lobbyBg

// Game tunables
export const HOLD_MS = 1000
export const BASE_DAMAGE = 5
export const COMBO_MULT = 2
export const ATTACK_FRAME_MS = 40
export const ATTACK_INDICATION_MS = 800
export const DAMAGE_LOG_TTL_MS = 4000
export const DAMAGE_LOG_MAX = 3
export const STAGE_COUNTDOWN_SEC = 5
export const STAGE_TRAVEL_MS = 1500
export const CONFETTI_MS = 2000
export const FEEDBACK_MS = 700

// Difficulty — answers always live in 0..10 (the finger-count range).
//   baby   : addition only          (1 + 4)
//   normal : addition + subtraction (7 - 3)
//   master : single-variable algebra (2x + 3 = 11)
//   god    : definite integrals     (∫[0,4] 2 dx)
export type Difficulty = "baby" | "normal" | "master" | "god"
export const DIFFICULTIES: Difficulty[] = ["baby", "normal", "master", "god"]
export const DEFAULT_DIFFICULTY: Difficulty = "baby"
export const ANSWER_MIN = 0
export const ANSWER_MAX = 10
