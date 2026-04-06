import type { GameState } from "../game/gameController"

function ComboDisplay({ combo }: { combo: number }) {
  if (combo === 0) return null

  const colorClass =
    combo >= 8 ? "text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.9)]" :
    combo >= 4 ? "text-orange-400 drop-shadow-[0_0_20px_rgba(251,146,60,0.9)]" :
                 "text-yellow-300 drop-shadow-[0_0_16px_rgba(253,224,71,0.7)]"

  return (
    <div className={`absolute bottom-[clamp(2rem,5vh,5rem)] right-[clamp(2rem,4vw,5rem)] flex flex-col items-end font-extrabold leading-none ${colorClass}`}>
      <span className="text-[clamp(2rem,5vw,6rem)] tracking-tight">x{combo}</span>
      <span className="text-[clamp(1rem,2vw,2.5rem)] tracking-widest uppercase opacity-80">combo</span>
    </div>
  )
}

function QuestionDisplay({ question }: { question: {a:number,b:number} }) {
  return (
    <div className="text-[clamp(1.5rem,2.5vw,3rem)] text-white text-center w-full">
      {question.a} + {question.b} = ?
    </div>
  )
}

function AnswerDisplay({
  number,
  opacity,
  result
}: {
  number: number | null
  opacity: number
  result: "correct" | "wrong" | null
}) {

  let feedbackClass = ""

  if (result === "correct")
    feedbackClass = "text-green-400 drop-shadow-[0_0_25px_rgba(74,222,128,0.9)]"

  if (result === "wrong")
    feedbackClass = "text-red-400 drop-shadow-[0_0_25px_rgba(248,113,113,0.9)]"

  return (
    <div
      className={`text-[clamp(2.5rem,4vw,5rem)] transition-all duration-200 ${feedbackClass}`}
      style={{ opacity }}
    >
      {number ?? ""}
    </div>
  )
}

export default function GameUI({ state }: { state: GameState }) {
  return (
    <div className="absolute inset-0 pointer-events-none font-bold">

      <div className="absolute top-14 left-1/2 -translate-x-1/2 md:top-[clamp(0.5rem,1.5vh,2rem)]
                w-[min(clamp(280px,31vw,600px),90vw)]
                bg-black/60 px-[clamp(1rem,2vw,2rem)] py-[clamp(0.5rem,1.5vh,1.5rem)] rounded-xl
                flex flex-col items-center gap-[clamp(0.5rem,1.5vh,1rem)]">

        <QuestionDisplay question={state.question} />

        <AnswerDisplay
          number={state.currentNumber}
          opacity={state.holdProgress}
          result={state.result}
        />

      </div>

      <ComboDisplay combo={state.combo} />

    </div>
  )
}