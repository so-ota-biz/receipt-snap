import { Test, TestingModule } from '@nestjs/testing'
import { MockUploadService } from './mock-upload.service'
import { ApplicationError } from '@/shared/common/errors/application.error'

describe('MockUploadService', () => {
  let service: MockUploadService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockUploadService],
    }).compile()

    service = module.get<MockUploadService>(MockUploadService)
  })

  describe('uploadFile', () => {
    it('正常系: 正しいファイル名でパスが返される', async () => {
      // Arrange
      const fileName = 'taxi_receipt.jpg'
      const expectedPath = '/image/a1b2c3d4e5f6g7h8i9j0/k1l2m3n4o5p6q7r8s/taxi_receipt.jpg'

      // Act
      const result = await service.uploadFile(fileName)

      // Assert
      expect(result).toBe(expectedPath)
    })

    it('正常系: すべての定義済みファイル名が変換できる', async () => {
      // Arrange
      const testCases = [
        {
          fileName: 'convenience_receipt.jpg',
          expectedPath: '/image/c3d4e5f6g7h8i9j0k1l2/m3n4o5p6q7r8s9t0u/convenience_receipt.jpg',
        },
        {
          fileName: 'restaurant_bill.jpg',
          expectedPath: '/image/d4e5f6g7h8i9j0k1l2m3/n4o5p6q7r8s9t0u1v/restaurant_bill.jpg',
        },
        {
          fileName: 'hotel_invoice.jpg',
          expectedPath: '/image/b2c3d4e5f6g7h8i9j0k1/l2m3n4o5p6q7r8s9t/hotel_invoice.jpg',
        },
        {
          fileName: 'parking_receipt.jpg',
          expectedPath: '/image/e5f6g7h8i9j0k1l2m3n4/o5p6q7r8s9t0u1v2w/parking_receipt.jpg',
        },
        {
          fileName: 'error_corrupted.jpg',
          expectedPath: '/image/f6g7h8i9j0k1l2m3n4o5/p6q7r8s9t0u1v2w3x/error_corrupted.jpg',
        },
      ]

      // Act & Assert
      for (const testCase of testCases) {
        const result = await service.uploadFile(testCase.fileName)
        expect(result).toBe(testCase.expectedPath)
      }
    })

    it('異常系: 空文字でE40001エラーが発生', async () => {
      // Arrange
      const fileName = ''

      // Act & Assert
      await expect(service.uploadFile(fileName)).rejects.toThrow(ApplicationError)
      await expect(service.uploadFile(fileName)).rejects.toMatchObject({
        errorCode: 'E40001',
      })
    })

    it('異常系: 未定義のファイル名でE40001エラーが発生', async () => {
      // Arrange
      const fileName = 'unknown_file.jpg'

      // Act & Assert
      await expect(service.uploadFile(fileName)).rejects.toThrow(ApplicationError)
      await expect(service.uploadFile(fileName)).rejects.toMatchObject({
        errorCode: 'E40001',
      })
    })
  })
})
