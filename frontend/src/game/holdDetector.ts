export class HoldDetector {

    private lastNumber: number | null = null
    private holdStart: number | null = null
    private readonly holdTime: number
  
    constructor(holdTime = 1000) {
      this.holdTime = holdTime
    }
  
    update(number: number | null) {
  
      const now = performance.now()
  
      if (number === null) {
        this.reset()
        return { progress: 0, locked: false, number: null }
      }
  
      if (number !== this.lastNumber) {
        this.lastNumber = number
        this.holdStart = now
        return { progress: 0, locked: false, number }
      }
  
      if (this.holdStart === null) {
        this.holdStart = now
      }
  
      const elapsed = now - this.holdStart
      const progress = Math.min(elapsed / this.holdTime, 1)
  
      const locked = progress >= 1
  
      return {
        progress,
        locked,
        number
      }
    }
  
    reset() {
      this.lastNumber = null
      this.holdStart = null
    }
  }