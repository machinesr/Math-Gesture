type GameState = {
    question: {
      a: number
      b: number
      answer: number
    }
    currentNumber: number | null
    holdProgress: number
  }
  
  export default function GameUI({ state }: { state: GameState }) {
  
    const opacity = state.holdProgress
  
    return (
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        fontFamily: "sans-serif",
        color: "white"
      }}>
  
        {/* Question */}
        <div style={{
          position: "absolute",
          top: 40,
          width: "100%",
          textAlign: "center",
          fontSize: "48px",
          fontWeight: "bold"
        }}>
          {state.question.a} + {state.question.b}
        </div>
  
        {/* Player number */}
        <div style={{
          position: "absolute",
          bottom: 100,
          width: "100%",
          textAlign: "center",
          fontSize: "96px",
          opacity: opacity,
          transition: "opacity 0.1s linear"
        }}>
          {state.currentNumber ?? ""}
        </div>
  
      </div>
    )
  }