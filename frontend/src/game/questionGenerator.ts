export type Question = {
    a: number
    b: number
    answer: number
  }
  
  export function generateQuestion(): Question {
  
    // pick first number 0–10
    const a = Math.floor(Math.random() * 11)
  
    // second number limited so total ≤ 10
    const b = Math.floor(Math.random() * (11 - a))
  
    return {
      a,
      b,
      answer: a + b
    }
  }