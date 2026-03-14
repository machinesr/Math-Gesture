import { generateQuestion } from "./questionGenerator"
import { HoldDetector } from "./holdDetector"
import type { Question } from "./questionGenerator"
export class GameController {

  private holdDetector = new HoldDetector(2000)

  private question: Question = generateQuestion()

  private lastLocked = false

  getQuestion() {
    return this.question
  }

  update(number: number | null) {

    const hold = this.holdDetector.update(number)

    let result: "correct" | "wrong" | null = null

    if (hold.locked && !this.lastLocked) {

      if (hold.number === this.question.answer) {
        result = "correct"
      } else {
        result = "wrong"
      }

      this.question = generateQuestion()
    }

    this.lastLocked = hold.locked

    return {
      holdProgress: hold.progress,
      currentNumber: hold.number,
      locked: hold.locked,
      result,
      question: this.question
    }
  }
}