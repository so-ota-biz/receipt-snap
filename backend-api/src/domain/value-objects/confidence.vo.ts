export class Confidence {
  private readonly value: number

  constructor(value: number) {
    this.validate(value)
    this.value = value
  }

  private validate(value: number): void {
    if (value < 0 || value > 1) {
      throw new Error('Confidence must be between 0 and 1')
    }
  }

  getValue(): number {
    return this.value
  }

  getLevel(): 'high' | 'medium' | 'low' | 'very-low' {
    if (this.value >= 0.85) return 'high'
    if (this.value >= 0.7) return 'medium'
    if (this.value >= 0.5) return 'low'
    return 'very-low'
  }
}
