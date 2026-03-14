export class FingerStabilizer {

    private buffer: number[] = []
    private readonly size: number
  
    constructor(size = 5) {
      this.size = size
    }
  
    update(value: number): number | null {
  
      this.buffer.push(value)
  
      if (this.buffer.length > this.size) {
        this.buffer.shift()
      }
  
      if (this.buffer.length < this.size) {
        return null
      }
  
      const first = this.buffer[0]
  
      const stable = this.buffer.every(v => v === first)
  
      if (stable) {
        return first
      }
  
      return null
    }
  }