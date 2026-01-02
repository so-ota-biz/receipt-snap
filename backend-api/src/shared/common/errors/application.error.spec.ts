import { ApplicationError } from './application.error'
import { ERROR_CATALOG } from './error-catalog'

describe('ApplicationError', () => {
  describe('constructor', () => {
    it('正常系: エラーコードから正しいエラー情報が設定される', () => {
      // Arrange & Act
      const error = new ApplicationError('E41002')

      // Assert
      expect(error.errorCode).toBe('E41002')
      expect(error.errorInfo).toEqual(ERROR_CATALOG.E41002)
      expect(error.message).toBe('画像ファイルが破損しています')
      expect(error.getStatus()).toBe(400)
    })
  })

  describe('toJSON', () => {
    it('正常系: フロントエンド向けJSON形式に変換できる', () => {
      // Arrange
      const error = new ApplicationError('E41007')

      // Act
      const json = error.toJSON()

      // Assert
      expect(json).toHaveProperty('success', false)
      expect(json).toHaveProperty('errorCode', 'E41007')
      expect(json).toHaveProperty('errorName', 'Text not readable')
      expect(json).toHaveProperty('message', '文字が不鮮明で読み取り不可')
      expect(json).toHaveProperty(
        'userMessage',
        '文字が不鮮明です。明るい場所でピントを合わせて撮影してください',
      )
      expect(json).toHaveProperty('recommendedActions', ['撮影し直す'])
      expect(json).toHaveProperty('timestamp')
      expect(new Date(json.timestamp)).toBeInstanceOf(Date)
    })

    it('正常系: 全てのエラーコードでJSON変換が可能', () => {
      // Arrange
      const errorCodes = Object.keys(ERROR_CATALOG) as Array<keyof typeof ERROR_CATALOG>

      // Act & Assert
      errorCodes.forEach((errorCode) => {
        const error = new ApplicationError(errorCode)
        const json = error.toJSON()

        expect(json.errorCode).toBe(errorCode)
        expect(json.success).toBe(false)
        expect(json.userMessage).toBeTruthy()
      })
    })
  })

  describe('HTTPステータスコード', () => {
    it('正常系: 4xxエラーコードは400番台のHTTPステータスを返す', () => {
      // Arrange & Act & Assert
      expect(new ApplicationError('E40001').getStatus()).toBe(400)
      expect(new ApplicationError('E40003').getStatus()).toBe(400)
      expect(new ApplicationError('E40004').getStatus()).toBe(400)
      expect(new ApplicationError('E40005').getStatus()).toBe(400)
      expect(new ApplicationError('E40006').getStatus()).toBe(400)
      expect(new ApplicationError('E41002').getStatus()).toBe(400)
    })

    it('正常系: 5xxエラーコードは500番台のHTTPステータスを返す', () => {
      // Arrange & Act & Assert
      expect(new ApplicationError('E50001').getStatus()).toBe(500)
      expect(new ApplicationError('E50012').getStatus()).toBe(504)
    })
  })

  describe('バリデーションエラーコード（E40003-E40006）', () => {
    it('正常系: E40003（画像パス長超過）が正しく設定される', () => {
      // Arrange & Act
      const error = new ApplicationError('E40003')

      // Assert
      expect(error.errorCode).toBe('E40003')
      expect(error.errorInfo.name).toBe('Image path too long')
      expect(error.errorInfo.userMessage).toContain('ファイル名が長すぎます')
      expect(error.errorInfo.recommendedActions).toContain('撮影し直す')
    })

    it('正常系: E40004（ファイルサイズ超過）が正しく設定される', () => {
      // Arrange & Act
      const error = new ApplicationError('E40004')

      // Assert
      expect(error.errorCode).toBe('E40004')
      expect(error.errorInfo.name).toBe('File size exceeded')
      expect(error.errorInfo.userMessage).toContain('ファイルサイズ')
      expect(error.errorInfo.recommendedActions).toContain('撮影し直す')
    })

    it('正常系: E40005（画像サイズ不正）が正しく設定される', () => {
      // Arrange & Act
      const error = new ApplicationError('E40005')

      // Assert
      expect(error.errorCode).toBe('E40005')
      expect(error.errorInfo.name).toBe('Invalid image dimensions')
      expect(error.errorInfo.userMessage).toContain('画像の解像度')
      expect(error.errorInfo.recommendedActions).toContain('撮影し直す')
    })

    it('正常系: E40006（無効なMIMEタイプ）が正しく設定される', () => {
      // Arrange & Act
      const error = new ApplicationError('E40006')

      // Assert
      expect(error.errorCode).toBe('E40006')
      expect(error.errorInfo.name).toBe('Invalid MIME type')
      expect(error.errorInfo.userMessage).toContain('画像ファイル')
      expect(error.errorInfo.recommendedActions).toContain('撮影し直す')
    })
  })
})
