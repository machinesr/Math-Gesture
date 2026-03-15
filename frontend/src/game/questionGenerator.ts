export type Question = {
  a: number
  b: number
  answer: number
}

export function generateQuestion(prevAnswer?: number): Question {

  // choose answer first (1–10)
  let answer: number

  do {
    answer = Math.floor(Math.random() * 10) + 1
  } while (answer === prevAnswer)

  // generate numbers that sum to the answer
  const a = Math.floor(Math.random() * (answer + 1))
  const b = answer - a

  return { a, b, answer }
}