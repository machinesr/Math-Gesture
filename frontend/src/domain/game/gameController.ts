import { generateQuestion } from "./questionGenerator"
import { HoldDetector } from "./holdDetector"
import type { GameState, Question } from "./types"
import {
  BASE_DAMAGE,
  COMBO_MULT,
  FEEDBACK_MS,
  DEFAULT_DIFFICULTY,
  type Difficulty,
} from "../../shared/constants/stages"

// Pure game logic. No React, no socket, no DOM.
// Boss HP is server-authoritative — this controller no longer tracks it locally.
export class GameController {
  private combo = 0
  private attackDamage = 0
  private holdDetector = new HoldDetector()
  private lastAnswer: number | undefined
  private question: Question
  private lastLocked = false
  private result: "correct" | "wrong" | null = null
  private feedbackEnd = 0
  private difficulty: Difficulty

  constructor(difficulty: Difficulty = DEFAULT_DIFFICULTY) {
    this.difficulty = difficulty
    this.question = generateQuestion(undefined, this.difficulty)
    this.lastAnswer = this.question.answer
  }

  setDifficulty(d: Difficulty) {
    if (d === this.difficulty) return
    this.difficulty = d
    // Replace the in-flight question so the player isn't stuck on a question
    // from the old format. Combo and feedback state are preserved.
    this.question = generateQuestion(this.lastAnswer, this.difficulty)
    this.lastAnswer = this.question.answer
    this.holdDetector.reset()
    this.lastLocked = false
  }

  getQuestion() {
    return this.question
  }

  // Player gives up on the current question — fresh question, combo broken,
  // no damage dealt and no wrong-answer flash.
  skip() {
    this.combo = 0
    this.attackDamage = 0
    this.result = null
    this.feedbackEnd = 0
    this.question = generateQuestion(this.lastAnswer, this.difficulty)
    this.lastAnswer = this.question.answer
    this.holdDetector.reset()
    this.lastLocked = false
  }

  // Passive feedback-timer advance. Lets a wall-clock timer (in React) drive
  // the post-correct question rotation when no hand is in frame, without
  // disturbing an ongoing hold. Returns null while feedback is still pending.
  tick(): GameState | null {
    const now = performance.now()
    if (!this.result || now <= this.feedbackEnd) return null

    const wasCorrect = this.result === "correct"
    this.result = null
    if (wasCorrect) {
      this.question = generateQuestion(this.lastAnswer, this.difficulty)
      this.lastAnswer = this.question.answer
    }
    this.holdDetector.reset()
    this.lastLocked = false

    return {
      holdProgress: 0,
      currentNumber: null,
      locked: false,
      result: null,
      question: this.question,
      event: null,
      combo: this.combo,
      attackDamage: this.attackDamage,
    }
  }

  update(number: number | null): GameState {
    const now = performance.now()
    const hold = this.holdDetector.update(number)

    let event: "attack" | null = null
    const justLocked = hold.locked && !this.lastLocked

    if (justLocked) {
      if (hold.number === this.question.answer) {
        this.result = "correct"
        event = "attack"
        this.attackDamage = BASE_DAMAGE + this.combo * COMBO_MULT
        this.combo++
      } else {
        this.result = "wrong"
        this.combo = 0
        this.attackDamage = 0
      }
      this.feedbackEnd = now + FEEDBACK_MS
    }

    if (this.result && now > this.feedbackEnd) {
      const wasCorrect = this.result === "correct"
      this.result = null
      // Only advance to a new question on success. On a wrong answer the
      // player must keep trying until they get it right.
      if (wasCorrect) {
        this.question = generateQuestion(this.lastAnswer, this.difficulty)
        this.lastAnswer = this.question.answer
      }
      // Always reset the hold detector and lock latch after feedback ends.
      // Without this the player stays "locked" on the same number after a
      // correct answer and can never re-trigger justLocked for the next
      // question until they pull their hand out of frame.
      this.holdDetector.reset()
      this.lastLocked = false
    }

    this.lastLocked = hold.locked

    return {
      holdProgress: hold.progress,
      currentNumber: hold.number,
      locked: hold.locked,
      result: this.result,
      question: this.question,
      event,
      combo: this.combo,
      attackDamage: this.attackDamage,
    }
  }
}
