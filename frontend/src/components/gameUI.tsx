function QuestionDisplay({ question }: { question: {a:number,b:number} }) {
  return (
    <div className="text-6xl text-white text-center w-full">
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
      className={`text-8xl transition-all duration-200 ${feedbackClass}`}
      style={{ opacity }}
    >
      {number ?? ""}
    </div>
  )
}

export default function GameUI({ state }: { state: GameState }) {
  return (
    <div className="absolute inset-0 pointer-events-none font-bold">

      <div className="absolute top-6 left-1/2 -translate-x-1/2
                w-[480px]
                bg-black/60 px-10 py-6 rounded-xl
                flex flex-col items-center gap-4">

        <QuestionDisplay question={state.question} />

        <AnswerDisplay
          number={state.currentNumber}
          opacity={state.holdProgress}
          result={state.result}
        />

      </div>

    </div>
  )
}