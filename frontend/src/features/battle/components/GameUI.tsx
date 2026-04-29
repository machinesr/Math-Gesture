import type { GameState, Question } from "../../../domain/game/types"

function IntegralDisplay({
  lower,
  upper,
  integrand,
  differential,
}: {
  lower: string
  upper: string
  integrand: string
  differential: string
}) {
  return (
    <span className="inline-flex items-center gap-[0.6em] font-serif whitespace-nowrap">
      <span className="inline-flex flex-col items-center leading-none">
        <span className="text-[0.5em] font-bold not-italic mb-[0.3em]">{upper}</span>
        <span className="text-[2em] leading-[0.8]">∫</span>
        <span className="text-[0.5em] font-bold not-italic mt-[0.5em]">{lower}</span>
      </span>
      <span className="italic tracking-wide">{integrand}</span>
      <span className="italic">{differential}</span>
      <span className="not-italic ml-[0.25em]">= ?</span>
    </span>
  )
}

function QuestionDisplay({ question }: { question: Question }) {
  const isIntegral = question.layout?.kind === "integral"
  return (
    <div
      className={`text-white text-center w-full font-bold tracking-tight whitespace-nowrap ${
        isIntegral
          ? "text-[clamp(1rem,2vw,2.25rem)] py-[clamp(0.5rem,1.5vh,1.25rem)] px-[0.5em]"
          : "text-[clamp(1.25rem,2.25vw,2.75rem)]"
      }`}
    >
      {question.layout?.kind === "integral" ? (
        <IntegralDisplay
          lower={question.layout.lower}
          upper={question.layout.upper}
          integrand={question.layout.integrand}
          differential={question.layout.differential}
        />
      ) : (
        question.display
      )}
    </div>
  )
}

function AnswerDisplay({
  number,
  opacity,
  result,
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

export default function GameUI({
  state,
  onSkip,
}: {
  state: GameState
  onSkip?: () => void
}) {
  return (
    <div className="absolute inset-0 pointer-events-none font-bold">
      <div
        className="absolute top-[clamp(0.5rem,1.5vh,2rem)] left-1/2 -translate-x-1/2
                w-[min(clamp(260px,31vw,600px),88vw)]
                max-h-[44vh] md:max-h-[40vh]
                bg-black/60 px-[clamp(1rem,2vw,2rem)] py-[clamp(0.5rem,1.25vh,1.25rem)] rounded-xl
                flex flex-col items-center gap-[clamp(0.4rem,1vh,0.875rem)]"
      >
        <QuestionDisplay question={state.question} />
        <AnswerDisplay
          number={state.currentNumber}
          opacity={state.holdProgress}
          result={state.result}
        />

        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            // Flat, blends with the question box (slightly darker shade of bg-black/60).
            // Pointer events are re-enabled here since the parent disables them.
            className="pointer-events-auto mt-[clamp(0.25rem,0.75vh,0.5rem)]
              bg-black/40 hover:bg-black/60 active:bg-black/70
              text-white/60 hover:text-white/90
              text-[clamp(0.625rem,0.9vw,0.875rem)] font-semibold uppercase tracking-[0.2em]
              px-[clamp(0.875rem,1.5vw,1.5rem)] py-[clamp(0.25rem,0.5vh,0.5rem)]
              rounded-md border border-white/5 hover:border-white/10
              transition-all duration-200 active:scale-95
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            skip
          </button>
        )}
      </div>
    </div>
  )
}
