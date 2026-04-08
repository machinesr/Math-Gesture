import { useEffect, useRef } from "react"
import { useCamera } from "../../../app/CameraProvider"

type Props = {
  onNumberDetected: (num: number) => void
}

// Thin display layer for the shared camera. Owns nothing — the MediaStream and
// MediaPipe Hands instance live in CameraProvider so they survive across page
// navigations and don't need to cold-start when the user enters a new battle.
export default function HandCamera({ onNumberDetected }: Props) {
  const { isReady, stream, subscribe, init } = useCamera()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const callbackRef = useRef(onNumberDetected)

  useEffect(() => {
    callbackRef.current = onNumberDetected
  }, [onNumberDetected])

  // Defensive: kick init if the user somehow reached battle without going
  // through ConnectPage's eager init (e.g. dev refresh on /battle)
  useEffect(() => {
    if (!isReady) init()
  }, [isReady, init])

  // Attach the persistent stream to our local visible <video>
  useEffect(() => {
    const el = videoRef.current
    if (el && stream) {
      el.srcObject = stream
      el.play().catch(() => {})
    }
  }, [stream])

  // Subscribe to detection events for as long as we're mounted
  useEffect(() => {
    return subscribe((num) => callbackRef.current(num))
  }, [subscribe])

  return (
    <div className="relative overflow-hidden rounded-xl bg-black aspect-video w-full shadow-2xl border border-white/10">
      {!isReady && (
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
