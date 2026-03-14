import { NormalizedLandmark } from "@mediapipe/hands"

export function countFingers(
  landmarks: NormalizedLandmark[],
  handedness: "Left" | "Right"
) {
  let fingers = 0

  // Thumb (mirrored camera fix)
  if (handedness === "Right") {
    if (landmarks[4].x < landmarks[3].x) fingers++
  } else {
    if (landmarks[4].x > landmarks[3].x) fingers++
  }

  // Index
  if (landmarks[8].y < landmarks[6].y) fingers++

  // Middle
  if (landmarks[12].y < landmarks[10].y) fingers++

  // Ring
  if (landmarks[16].y < landmarks[14].y) fingers++

  // Pinky
  if (landmarks[20].y < landmarks[18].y) fingers++

  return fingers
}