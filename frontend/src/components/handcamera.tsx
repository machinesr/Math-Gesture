import { useRef, useEffect, useState } from "react"
import { Hands } from "@mediapipe/hands"
import { countFingers } from "../vision/fingerCounter"
import { FingerStabilizer } from "../vision/fingerStabilizer"

type Props = {
  onNumberDetected: (num: number) => void
}

const stabilizers = [
  new FingerStabilizer(5),
  new FingerStabilizer(5)
]

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export default function HandCamera({ onNumberDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const handsRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const lastFrameTime = useRef(0)
  const callbackRef = useRef(onNumberDetected)

  useEffect(() => {
    callbackRef.current = onNumberDetected
  }, [onNumberDetected])

  useEffect(() => {
    if (!videoRef.current) return

    let isMounted = true

    const startHandTracker = async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      if (!isMounted || !videoRef.current) return

      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      })

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: isMobile ? 0 : 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      })

      hands.onResults((results: any) => {
        if (!isMounted) return
        if (!isLoaded && results.multiHandLandmarks) setIsLoaded(true)

        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
          stabilizers.forEach(s => s.reset?.())
          return
        }

        let total = 0
        let detectedHands = 0
        results.multiHandLandmarks.forEach((hand: any, i: number) => {
          const handedness = results.multiHandedness?.[i]?.label
          const fingers = countFingers(hand, handedness)
          const stable = stabilizers[i]?.update(fingers)
          if (stable !== null) {
            total += stable
            detectedHands++
          }
        })

        if (detectedHands > 0) callbackRef.current(total)
      })

      try {
        await hands.initialize()
        handsRef.current = hands
      } catch (err) {
        console.error("AI Initialization failed:", err)
        return
      }

      // Use getUserMedia directly so we can set facingMode for mobile
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: isMobile ? 320 : 640 },
            height: { ideal: isMobile ? 240 : 360 },
          }
        })
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      } catch (err) {
        console.error("Camera access failed:", err)
        return
      }

      // Throttle to 15fps on mobile, 30fps on desktop
      const frameInterval = 1000 / (isMobile ? 15 : 30)

      const processFrame = async (timestamp: number) => {
        if (!isMounted) return
        animFrameRef.current = requestAnimationFrame(processFrame)

        if (timestamp - lastFrameTime.current < frameInterval) return
        lastFrameTime.current = timestamp

        if (videoRef.current && videoRef.current.readyState >= 2 && handsRef.current) {
          try {
            await handsRef.current.send({ image: videoRef.current })
          } catch (_) {
            // ignore frame errors
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(processFrame)
    }

    startHandTracker()

    return () => {
      console.log("Stage Transition: Killing Hand Tracker...")
      isMounted = false

      cancelAnimationFrame(animFrameRef.current)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      if (handsRef.current) {
        handsRef.current.close()
        handsRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl bg-black aspect-video w-full shadow-2xl border border-white/10">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80 backdrop-blur-md z-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
    </div>
  )
}
