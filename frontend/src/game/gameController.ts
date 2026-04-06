import { generateQuestion } from "./questionGenerator"
import { HoldDetector } from "./holdDetector"
import type { Question } from "./questionGenerator"

export type GameState = {
  holdProgress: number
  currentNumber: number | null
  locked: boolean
  result: "correct" | "wrong" | null
  question: Question
  event: "attack" | null
  bossHp: number
  maxBossHp: number
  combo: number
  attackDamage: number
}

export class GameController {

  private bossHp = 200
  private maxBossHp = 250

  private combo = 0
  private attackDamage = 0

  private holdDetector = new HoldDetector(1000)

  private lastAnswer: number | undefined

  private question: Question

  private lastLocked = false

  private result: "correct" | "wrong" | null = null

  private feedbackEnd = 0

  constructor() {
    this.question = generateQuestion()
    this.lastAnswer = this.question.answer
  }

  getQuestion() {
    return this.question
  }

  update(number: number | null) {

    const now = performance.now()

    const hold = this.holdDetector.update(number)

    let event: "attack" | null = null

    const justLocked = hold.locked && !this.lastLocked

    if (justLocked) {

      if (hold.number === this.question.answer) {
        this.result = "correct"
        event = "attack"
        this.attackDamage = 5 + this.combo * 2
        this.combo++

        // remove this later waktu connect backend
        this.bossHp -= this.attackDamage
        if (this.bossHp < 0) this.bossHp = 0
        //

      } else {
        this.result = "wrong"
        this.combo = 0
        this.attackDamage = 0
      }

      this.feedbackEnd = now + 700
    }

    if (this.result && now > this.feedbackEnd) {
      this.result = null

      this.question = generateQuestion(this.lastAnswer)
      this.lastAnswer = this.question.answer
    }

    this.lastLocked = hold.locked

    return {
      holdProgress: hold.progress,
      currentNumber: hold.number,
      locked: hold.locked,
      result: this.result,
      question: this.question,
      event,
      bossHp: this.bossHp,
      maxBossHp: this.maxBossHp,
      combo: this.combo,
      attackDamage: this.attackDamage,
    }
  }
}