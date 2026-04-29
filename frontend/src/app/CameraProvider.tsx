import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { countFingers } from "../domain/vision/fingerCounter"
import { FingerStabilizer } from "../domain/vision/fingerStabilizer"

type Subscriber = (num: number) => void

type CameraContextValue = {
  isReady: boolean
  isInitializing: boolean
  stream: MediaStream | null
  error: string | null
  init: () => Promise<void>
  subscribe: (cb: Subscriber) => () => void
  attachVideo: (el: HTMLVideoElement | null) => void
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
  const [error, setError] = useState<string | null>(null)

  const handsRef = useRef<any>(null)
  // The video element we read frames from. Registered by HandCamera via
  // attachVideo() so MediaPipe reads from an on-screen, actively-rendering
  // element. Earlier we used a 1×1 off-screen video here, but iOS Safari (and
  // some Android battery-saver modes) throttle/pause hidden video decoding,
  // which silently starves the model — readyState reports OK, send() doesn't
  // throw, but onResults gets stale/black frames so detections never fire.
  const videoElRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const lastFrameTime = useRef(0)
  const initStartedRef = useRef(false)
  const subscribersRef = useRef<Set<Subscriber>>(new Set())
  // Mobile cameras hand the model noisier frames, so we accept a 1-frame
  // outlier in the 5-frame window. Desktop stays strict — the full model at
  // 30fps is consistent enough that majority-voting would just slow lock-in.
  const stabilizers = useRef([
    new FingerStabilizer(5, isMobile ? 1 : 0),
    new FingerStabilizer(5, isMobile ? 1 : 0),
  ])

  const subscribe = useCallback((cb: Subscriber) => {
    subscribersRef.current.add(cb)
    return () => {
      subscribersRef.current.delete(cb)
    }
  }, [])

  const startFrameLoop = useCallback(() => {
    if (animFrameRef.current) return
    const frameInterval = 1000 / (isMobile ? 24 : 30)
    const tick = async (timestamp: number) => {
      animFrameRef.current = requestAnimationFrame(tick)
      if (timestamp - lastFrameTime.current < frameInterval) return
      lastFrameTime.current = timestamp
      const el = videoElRef.current
      if (el && el.readyState >= 2 && handsRef.current) {
        try {
          await handsRef.current.send({ image: el })
        } catch {
          // ignore frame errors
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(tick)
  }, [])

  const stopFrameLoop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = 0
    }
  }, [])

  // HandCamera registers/deregisters its visible <video> here. We start the
  // frame loop the moment we have both an element AND a loaded model — order
  // doesn't matter (init may finish before HandCamera mounts, or vice versa).
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoElRef.current = el
    if (!el) {
      stopFrameLoop()
      return
    }
    if (handsRef.current) startFrameLoop()
  }, [startFrameLoop, stopFrameLoop])

  const init = useCallback(async () => {
    if (initStartedRef.current) return
    initStartedRef.current = true
    setIsInitializing(true)
    setError(null)

    // Camera APIs are gated to secure contexts. On a LAN-served dev build
    // without a trusted cert, mediaDevices is undefined and getUserMedia will
    // throw a generic TypeError that's hard to diagnose on a phone — surface
    // the real reason up front.
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "Camera requires HTTPS. Open this page over https:// and trust the dev certificate on this device."
      )
      setIsInitializing(false)
      initStartedRef.current = false
      return
    }

    try {
      // Dynamic import keeps the ~3MB @mediapipe/hands bundle out of the
      // initial page load. Connect and lobby pages render before the user
      // ever needs the camera, so making them pay for the model upfront is
      // pure waste on mobile networks.
      const { Hands } = await import("@mediapipe/hands")
      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })
      hands.setOptions({
        maxNumHands: 2,
        // The "lite" model (0) is significantly noisier than the full model
        // and that noise interacts badly with the FingerStabilizer's strict
        // consecutive-match rule, especially at low FPS. Modern phones can
        // handle the full model at the resolutions/framerates we run at.
        modelComplexity: 1,
        // Slightly lower thresholds on mobile: phone front cameras give the
        // model dimmer/noisier frames, and the default 0.6 floor causes the
        // model to drop landmarks mid-gesture, which the stabilizer then
        // interprets as a hand-leaving-frame and hard-resets the lock.
        minDetectionConfidence: isMobile ? 0.5 : 0.6,
        minTrackingConfidence: isMobile ? 0.5 : 0.6,
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
          // 320x240 starved the model on phones; 480x360 is the smallest
          // resolution where landmark accuracy stays close to desktop.
          width:  { ideal: isMobile ? 480 : 640 },
          height: { ideal: isMobile ? 360 : 360 },
        },
      })
      streamRef.current = mediaStream
      setStream(mediaStream)

      // If HandCamera is already mounted (e.g. user landed straight on
      // /battle), kick the frame loop now. Otherwise it'll start when
      // attachVideo() runs.
      if (videoElRef.current) startFrameLoop()

      setIsReady(true)
    } catch (err) {
      console.error("Camera/MediaPipe init failed:", err)
      const name = (err as { name?: string })?.name
      let message: string
      if (name === "NotAllowedError") {
        message = "Camera permission was denied. Allow camera access in your browser settings and reload."
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        message = "No usable camera was found on this device."
      } else if (name === "NotReadableError") {
        message = "Camera is in use by another app. Close other apps using the camera and reload."
      } else if (name === "SecurityError") {
        message = "Camera access blocked by the browser. Make sure the page is loaded over a trusted https:// URL."
      } else {
        message = (err as { message?: string })?.message || "Camera failed to start."
      }
      setError(message)
      // Allow a retry on next call
      initStartedRef.current = false
    } finally {
      setIsInitializing(false)
    }
  }, [])

  // Tear down on full app unmount only
  useEffect(() => {
    return () => {
      stopFrameLoop()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (handsRef.current) {
        try { handsRef.current.close() } catch { /* ignore */ }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <CameraContext.Provider value={{ isReady, isInitializing, stream, error, init, subscribe, attachVideo }}>
      {children}
    </CameraContext.Provider>
  )
}

export function useCamera(): CameraContextValue {
  const ctx = useContext(CameraContext)
  if (!ctx) throw new Error("useCamera must be used inside <CameraProvider>")
  return ctx
}
