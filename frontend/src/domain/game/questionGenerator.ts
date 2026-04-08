import type { Question } from "./types"
import {
  ANSWER_MAX,
  ANSWER_MIN,
  type Difficulty,
} from "../../shared/constants/stages"

// All difficulties produce an answer in [ANSWER_MIN, ANSWER_MAX] (0..10) so
// the player can express it with finger counts.

function pickAnswer(prev?: number): number {
  let n: number
  do {
    n = Math.floor(Math.random() * (ANSWER_MAX - ANSWER_MIN + 1)) + ANSWER_MIN
  } while (n === prev)
  return n
}

function randInt(lo: number, hi: number): number {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo
}

// --- baby: addition only -------------------------------------------------
function genBaby(prev?: number): Question {
  const answer = pickAnswer(prev)
  const a = randInt(0, answer)
  const b = answer - a
  return { display: `${a} + ${b} = ?`, answer }
}

// --- normal: addition + subtraction --------------------------------------
function genNormal(prev?: number): Question {
  const answer = pickAnswer(prev)
  const useMinus = Math.random() < 0.5
  if (!useMinus) {
    const a = randInt(0, answer)
    const b = answer - a
    return { display: `${a} + ${b} = ?`, answer }
  }
  // a - b = answer, with both a and b in [0, ANSWER_MAX]
  const b = randInt(0, ANSWER_MAX - answer)
  const a = answer + b
  return { display: `${a} − ${b} = ?`, answer }
}

// --- master: ax ± b = c, solve for x -------------------------------------
function genMaster(prev?: number): Question {
  const x = pickAnswer(prev)            // the unknown, 0..10
  const a = randInt(1, 4)               // small coefficient
  const useMinus = Math.random() < 0.5
  const b = randInt(1, 10)
  const c = useMinus ? a * x - b : a * x + b
  const op = useMinus ? "−" : "+"
  return { display: `${a}x ${op} ${b} = ${c},  x = ?`, answer: x }
}

// --- god: definite integrals --------------------------------------------
// Harder than the previous version: linear, quadratic, and mixed integrands
// over shifted intervals. Rejection sampling keeps the answer an integer in
// [0,10] and excludes any form anchored at lower bound 0 (which used to make
// the constant case trivial).
//
// Supported integrand templates:
//   m              (constant)            ∫_a^b m dx
//   m·x + c        (linear)              ∫_a^b (mx + c) dx
//   m·x²           (pure quadratic)      ∫_a^b mx² dx
//   m·x² + n·x     (mixed quadratic)     ∫_a^b (mx² + nx) dx
//   m·x² + c       (quadratic + const)   ∫_a^b (mx² + c) dx
//
// All bounds are shifted (lo > 0 or lo < 0), so no [0, n] forms slip through.

function fmtCoef(coef: number, variable: string): string {
  if (coef === 0) return ""
  if (coef === 1) return variable
  if (coef === -1) return `-${variable}`
  return `${coef}${variable}`
}

function joinTerms(terms: string[]): string {
  // Build "ax² + bx - c"-style display from a list of signed term strings.
  const filtered = terms.filter(t => t !== "")
  if (filtered.length === 0) return "0"
  let out = filtered[0]
  for (let i = 1; i < filtered.length; i++) {
    const t = filtered[i]
    if (t.startsWith("-")) out += ` − ${t.slice(1)}`
    else out += ` + ${t}`
  }
  return out
}

function makeIntegralQuestion(
  lo: number,
  hi: number,
  integrand: string,
  answer: number
): Question {
  return {
    display: `∫[${lo},${hi}] (${integrand}) dx = ?`,
    layout: {
      kind: "integral",
      lower: `${lo}`,
      upper: `${hi}`,
      integrand,
      differential: "dx",
    },
    answer,
  }
}

function genGod(prev?: number): Question {
  // Try up to 400 random parameter sets; the integer-in-range constraint is
  // tight but easy to satisfy in practice.
  for (let i = 0; i < 400; i++) {
    // Lower bound is intentionally never 0 — that's the case the user asked
    // us to remove.
    const lo = Math.random() < 0.5 ? randInt(-3, -1) : randInt(1, 4)
    const span = randInt(1, 4)
    const hi = lo + span

    const form = randInt(0, 4)
    let integrand = ""
    let value = 0

    if (form === 0) {
      // Linear: m·x + c
      const m = randInt(1, 3)
      const c = randInt(-4, 5)
      const num = m * (hi * hi - lo * lo)
      if (num % 2 !== 0) continue
      value = num / 2 + c * (hi - lo)
      integrand = joinTerms([fmtCoef(m, "x"), c === 0 ? "" : `${c}`])
    } else if (form === 1) {
      // Pure quadratic: m·x²
      const m = randInt(1, 3)
      const num = m * (hi * hi * hi - lo * lo * lo)
      if (num % 3 !== 0) continue
      value = num / 3
      integrand = `${m === 1 ? "" : m}x²`
    } else if (form === 2) {
      // Mixed quadratic: m·x² + n·x
      const m = randInt(1, 2)
      const n = randInt(1, 3)
      const cube = m * (hi * hi * hi - lo * lo * lo)
      const sq = n * (hi * hi - lo * lo)
      if (cube % 3 !== 0 || sq % 2 !== 0) continue
      value = cube / 3 + sq / 2
      integrand = joinTerms([
        m === 1 ? "x²" : `${m}x²`,
        fmtCoef(n, "x"),
      ])
    } else if (form === 3) {
      // Quadratic + constant: m·x² + c
      const m = randInt(1, 2)
      const c = randInt(-4, 4)
      const cube = m * (hi * hi * hi - lo * lo * lo)
      if (cube % 3 !== 0) continue
      value = cube / 3 + c * (hi - lo)
      integrand = joinTerms([
        m === 1 ? "x²" : `${m}x²`,
        c === 0 ? "" : `${c}`,
      ])
    } else {
      // Constant times a shifted interval (kept rare so god mode bites).
      const m = randInt(2, 5)
      value = m * (hi - lo)
      integrand = `${m}`
    }

    if (
      Number.isInteger(value) &&
      value >= 0 &&
      value <= 10 &&
      value !== prev
    ) {
      return makeIntegralQuestion(lo, hi, integrand, value)
    }
  }

  // Extremely unlikely fallback — guarantee something playable.
  const answer = pickAnswer(prev)
  const lo = randInt(1, 3)
  const hi = lo + 1
  return makeIntegralQuestion(lo, hi, `${answer}`, answer)
}

export function generateQuestion(prevAnswer?: number, difficulty: Difficulty = "baby"): Question {
  switch (difficulty) {
    case "baby":   return genBaby(prevAnswer)
    case "normal": return genNormal(prevAnswer)
    case "master": return genMaster(prevAnswer)
    case "god":    return genGod(prevAnswer)
  }
}
