// Buffers raw finger counts and only emits a value once N consecutive
// readings agree. Filters out flicker from MediaPipe's per-frame jitter.
export class FingerStabilizer {
  private buffer: number[] = []
  private readonly size: number

  constructor(size = 5) {
    this.size = size
  }

  update(value: number): number | null {
    this.buffer.push(value)
    if (this.buffer.length > this.size) this.buffer.shift()
    if (this.buffer.length < this.size) return null

    const first = this.buffer[0]
    const stable = this.buffer.every(v => v === first)
    return stable ? first : null
  }

  reset() {
    this.buffer = []
  }
}
