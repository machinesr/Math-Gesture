// Optional rich layout for questions that don't render well as a flat string
// (e.g. integrals with stacked limits). When omitted, the renderer falls back
// to the plain `display` string.
export type QuestionLayout =
  | {
      kind: "integral"
      lower: string
      upper: string
      integrand: string
      differential: string
    }

export type Question = {
  // Plain-text fallback / debug form, including the "= ?" or "x = ?" tail.
  display: string
  layout?: QuestionLayout
  answer: number
}

export type GameState = {
  holdProgress: number
  currentNumber: number | null
  locked: boolean
  result: "correct" | "wrong" | null
  question: Question
  event: "attack" | null
  combo: number
  attackDamage: number
}
