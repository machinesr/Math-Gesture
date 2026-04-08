import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Hands } from "@mediapipe/hands"
import { countFingers } from "../domain/vision/fingerCounter"
import { FingerStabilizer } from "../domain/vision/fingerStabilizer"

type Subscriber = (num: number) => void

type CameraContextValue = {
  isReady: boolean
  isInitializing: boolean
  stream: MediaStream | null
  init: () => Promise<void>
  subscribe: (cb: Subscriber) => () => void
}

const CameraContext = createContext<CameraContextValue | null>(null)

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

// Single source of truth for the camera + MediaPipe Hands pipeline.
// Mounted at the App level so the stream and ML model survive page navigations,
// eliminating the cold-start delay every time the user enters a new battle.
//
// Components consume this via `useCamera()`. The visible <video> in BattlePage
// just attaches the same MediaStream — the heavy lifting (stream acquisition,
// model load, frame loop) happens exactly once per session.
export function CameraProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const handsRef = useRef<any>(null)
  const sourceVideoRef = useRef<HTMLVideoElement | null>(null)
  const animFrameRef = useRef<number>(0)
  const lastFrameTime = useRef(0)
  const initStartedRef = useRef(false)
  const subscribersRef = useRef<Set<Subscriber>>(new Set())
  const stabilizers = useRef([new FingerStabilizer(5), new FingerStabilizer(5)])

  const subscribe = useCallback((cb: Subscriber) => {
    subscribersRef.current.add(cb)
    return () => {
      subscribersRef.current.delete(cb)
    }
  }, [])

  const init = useCallback(async () => {
    if (initStartedRef.current) return
    initStartedRef.current = true
    setIsInitializing(true)

    // Hidden source video used by MediaPipe to read frames. Kept off-screen
    // so the public BattlePage video can be styled / positioned independently.
    const sourceVideo = document.createElement("video")
    sourceVideo.muted = true
    sourceVideo.playsInline = true
    sourceVideo.autoplay = true
    Object.assign(sourceVideo.style, {
      position: "fixed",
      width: "1px",
      height: "1px",
      left: "-9999px",
      top: "-9999px",
      opacity: "0",
      pointerEvents: "none",
    })
    document.body.appendChild(sourceVideo)
    sourceVideoRef.current = sourceVideo

    try {
      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: isMobile ? 0 : 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      })

      hands.onResults((results: any) => {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
          stabilizers.current.forEach((s) => s.reset?.())
          return
        }
        let total = 0
        let detected = 0
        results.multiHandLandmarks.forEach((hand: any, i: number) => {
          const handedness = results.multiHandedness?.[i]?.label
          const fingers = countFingers(hand, handedness)
          const stable = stabilizers.current[i]?.update(fingers)
          if (stable !== null) {
            total += stable
            detected++
          }
        })
        if (detected > 0) {
          subscribersRef.current.forEach((cb) => cb(total))
        }
      })

      await hands.initialize()
      handsRef.current = hands

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width:  { ideal: isMobile ? 320 : 640 },
          height: { ideal: isMobile ? 240 : 360 },
        },
      })
      sourceVideo.srcObject = mediaStream
      await sourceVideo.play()
      setStream(mediaStream)

      // Throttle to 15fps mobile / 30fps desktop
      const frameInterval = 1000 / (isMobile ? 15 : 30)

      const processFrame = async (timestamp: number) => {
        animFrameRef.current = requestAnimationFrame(processFrame)
        if (timestamp - lastFrameTime.current < frameInterval) return
        lastFrameTime.current = timestamp
        if (sourceVideo.readyState >= 2 && handsRef.current) {
          try {
            await handsRef.current.send({ image: sourceVideo })
          } catch {
            // ignore frame errors
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(processFrame)

      setIsReady(true)
    } catch (err) {
      console.error("Camera/MediaPipe init failed:", err)
      // Allow a retry on next call
      initStartedRef.current = false
    } finally {
      setIsInitializing(false)
    }
  }, [])

  // Tear down on full app unmount only
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (stream) stream.getTracks().forEach((t) => t.stop())
      if (handsRef.current) {
        try { handsRef.current.close() } catch { /* ignore */ }
      }
      if (sourceVideoRef.current) {
        sourceVideoRef.current.srcObject = null
        sourceVideoRef.current.remove()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <CameraContext.Provider value={{ isReady, isInitializing, stream, init, subscribe }}>
      {children}
    </CameraContext.Provider>
  )
}

export function useCamera(): CameraContextValue {
  const ctx = useContext(CameraContext)
  if (!ctx) throw new Error("useCamera must be used inside <CameraProvider>")
  return ctx
}
