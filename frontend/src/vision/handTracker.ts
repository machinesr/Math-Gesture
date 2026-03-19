import { Hands } from "@mediapipe/hands"
import { Camera } from "@mediapipe/camera_utils"

export function initHandTracker(videoElement, onResults) {
  const hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  })

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
  })

  hands.onResults(onResults)

  const camera = new Camera(videoElement, {
    onFrame: async () => {
 
      if (videoElement.readyState >= 2) {
        try {
          await hands.send({ image: videoElement })
        } catch (e) {
          console.warn("Hands send cancelled or failed:", e)
        }
      }
    },
    width: 640,
    height: 360
  })

  camera.start()


  return () => {
    console.log("Shutting down MediaPipe Camera and Hands...");
    camera.stop();
    hands.close();
  }
}