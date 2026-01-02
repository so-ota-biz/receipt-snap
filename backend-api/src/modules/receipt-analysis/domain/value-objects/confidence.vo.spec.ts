import { Confidence } from './confidence.vo'

describe('Confidence ValueObject', () => {
  describe('constructor', () => {
    it('正常系: 有効な値（0.0-1.0）で作成できる', () => {
      // Arrange & Act & Assert
      expect(() => new Confidence(0.0)).not.toThrow()
      expect(() => new Confidence(0.5)).not.toThrow()
      expect(() => new Confidence(1.0)).not.toThrow()
      expect(() => new Confidence(0.9234)).not.toThrow()
    })

    it('異常系: 負の値で例外が発生', () => {
      // Arrange & Act & Assert
      expect(() => new Confidence(-0.1)).toThrow('Confidence must be between 0 and 1')
      expect(() => new Confidence(-1.0)).toThrow('Confidence must be between 0 and 1')
    })

    it('異常系: 1.0より大きい値で例外が発生', () => {
      // Arrange & Act & Assert
      expect(() => new Confidence(1.1)).toThrow('Confidence must be between 0 and 1')
      expect(() => new Confidence(2.0)).toThrow('Confidence must be between 0 and 1')
    })
  })

  describe('getValue', () => {
    it('正常系: 設定した値が取得できる', () => {
      // Arrange
      const value = 0.9234
      const confidence = new Confidence(value)

      // Act
      const result = confidence.getValue()

      // Assert
      expect(result).toBe(value)
    })
  })

  describe('getLevel', () => {
    it('正常系: 0.85以上は"high"を返す', () => {
      // Arrange & Act & Assert
      expect(new Confidence(0.85).getLevel()).toBe('high')
      expect(new Confidence(0.9234).getLevel()).toBe('high')
      expect(new Confidence(1.0).getLevel()).toBe('high')
    })

    it('正常系: 0.70-0.84は"medium"を返す', () => {
      // Arrange & Act & Assert
      expect(new Confidence(0.7).getLevel()).toBe('medium')
      expect(new Confidence(0.7823).getLevel()).toBe('medium')
      expect(new Confidence(0.84).getLevel()).toBe('medium')
    })

    it('正常系: 0.50-0.69は"low"を返す', () => {
      // Arrange & Act & Assert
      expect(new Confidence(0.5).getLevel()).toBe('low')
      expect(new Confidence(0.6).getLevel()).toBe('low')
      expect(new Confidence(0.69).getLevel()).toBe('low')
    })

    it('正常系: 0.50未満は"very-low"を返す', () => {
      // Arrange & Act & Assert
      expect(new Confidence(0.0).getLevel()).toBe('very-low')
      expect(new Confidence(0.3).getLevel()).toBe('very-low')
      expect(new Confidence(0.49).getLevel()).toBe('very-low')
    })

    it('境界値: 境界値で正しいレベルが返される', () => {
      // Arrange & Act & Assert
      expect(new Confidence(0.8499).getLevel()).toBe('medium') // 0.85未満
      expect(new Confidence(0.85).getLevel()).toBe('high') // 0.85以上
      expect(new Confidence(0.6999).getLevel()).toBe('low') // 0.70未満
      expect(new Confidence(0.7).getLevel()).toBe('medium') // 0.70以上
      expect(new Confidence(0.4999).getLevel()).toBe('very-low') // 0.50未満
      expect(new Confidence(0.5).getLevel()).toBe('low') // 0.50以上
    })
  })
})
