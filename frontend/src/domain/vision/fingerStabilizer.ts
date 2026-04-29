// Buffers raw finger counts and emits the dominant value once a sliding
// window of N readings has formed. Filters out per-frame jitter from
// MediaPipe.
//
// `tolerance` controls how many outliers in the window are allowed before
// the stabilizer refuses to emit. tolerance=0 reproduces the original
// strict "all frames must match" behaviour; tolerance>=1 falls back to
// majority voting, which is much more forgiving of the noisier landmark
// streams produced by mobile front cameras at low light.
export class FingerStabilizer {
  private buffer: number[] = []
  private readonly size: number
  private readonly tolerance: number

  constructor(size = 5, tolerance = 0) {
    this.size = size
    this.tolerance = tolerance
  }

  update(value: number): number | null {
    this.buffer.push(value)
    if (this.buffer.length > this.size) this.buffer.shift()
    if (this.buffer.length < this.size) return null

    if (this.tolerance === 0) {
      const first = this.buffer[0]
      return this.buffer.every(v => v === first) ? first : null
    }

    // Mode-based: pick the most common value, require it to dominate the
    // window by at least (size - tolerance). This rejects ambiguous frames
    // during real transitions while ignoring isolated single-frame misreads.
    const counts = new Map<number, number>()
    for (const v of this.buffer) counts.set(v, (counts.get(v) ?? 0) + 1)
    let bestVal = -1
    let bestCount = 0
    for (const [val, count] of counts) {
      if (count > bestCount) {
        bestCount = count
        bestVal = val
      }
    }
    return bestCount >= this.size - this.tolerance ? bestVal : null
  }

  reset() {
    this.buffer = []
  }
}
