import { Test, TestingModule } from '@nestjs/testing'
import { UploadAndClassifyService } from './upload-and-classify.service'
import type { IUploadService } from '../interfaces/upload.interface'
import type { IClassificationService } from '../interfaces/classification.interface'
import type { IAiAnalysisLogRepository } from '../../domain/repositories/ai-analysis-log.repository.interface'
import { AiAnalysisLog } from '../../domain/entities/ai-analysis-log.entity'
import { ApplicationError } from '@/shared/common/errors/application.error'
import { ImagePath } from '../../domain/value-objects/image-path.vo'
import { Confidence } from '../../domain/value-objects/confidence.vo'

describe('UploadAndClassifyService', () => {
  let service: UploadAndClassifyService
  let mockUploadService: jest.Mocked<IUploadService>
  let classificationApiService: jest.Mocked<IClassificationService>
  let repository: jest.Mocked<IAiAnalysisLogRepository>

  beforeEach(async () => {
    // モックオブジェクトの作成
    const mockUploadServiceMock = {
      uploadFile: jest.fn(),
    }

    const classificationApiServiceMock = {
      classify: jest.fn(),
    }

    const repositoryMock = {
      save: jest.fn(),
      findById: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadAndClassifyService,
        {
          provide: 'IUploadService',
          useValue: mockUploadServiceMock,
        },
        {
          provide: 'IClassificationService',
          useValue: classificationApiServiceMock,
        },
        {
          provide: 'IAiAnalysisLogRepository',
          useValue: repositoryMock,
        },
      ],
    }).compile()

    service = module.get<UploadAndClassifyService>(UploadAndClassifyService)
    mockUploadService = module.get('IUploadService')
    classificationApiService = module.get('IClassificationService')
    repository = module.get('IAiAnalysisLogRepository')
  })

  describe('uploadAndClassify', () => {
    it('正常系: 高信頼度（≥0.85）で成功時に正しいレスポンスが返される', async () => {
      // Arrange
      const fileName = 'taxi_receipt.jpg'
      const imagePath = '/image/a1b2c3d4e5f6g7h8i9j0/k1l2m3n4o5p6q7r8s/taxi_receipt.jpg'
      const apiResponse = {
        success: true,
        message: 'success',
        estimated_data: { class: 2, confidence: 0.9234 },
      }
      const savedLog = AiAnalysisLog.createSuccessLog(
        123,
        new ImagePath(imagePath),
        'success',
        2,
        new Confidence(0.9234),
        new Date(),
        new Date(),
      )

      mockUploadService.uploadFile.mockResolvedValue(imagePath)
      classificationApiService.classify.mockResolvedValue(apiResponse)
      repository.save.mockResolvedValue(savedLog)

      // Act
      const result = await service.uploadAndClassify(fileName)

      // Assert
      expect(mockUploadService.uploadFile).toHaveBeenCalledWith(fileName)
      expect(classificationApiService.classify).toHaveBeenCalledWith(imagePath)
      expect(repository.save).toHaveBeenCalled()
      expect(result).toMatchObject({
        success: true,
        message: '画像の分類が完了しました',
        data: {
          class: 2,
          confidence: 0.9234,
          uploadedPath: imagePath,
          requiresConfirmation: false, // 0.9234 >= 0.85
        },
      })
      expect(result).toHaveProperty('timestamp')
    })

    it('正常系: 低信頼度（<0.85）で確認が必要になる', async () => {
      // Arrange
      const fileName = 'restaurant_bill.jpg'
      const imagePath = '/image/d4e5f6g7h8i9j0k1l2m3/n4o5p6q7r8s9t0u1v/restaurant_bill.jpg'
      const apiResponse = {
        success: true,
        message: 'success',
        estimated_data: { class: 1, confidence: 0.7823 },
      }
      const savedLog = AiAnalysisLog.createSuccessLog(
        124,
        new ImagePath(imagePath),
        'success',
        1,
        new Confidence(0.7823),
        new Date(),
        new Date(),
      )

      mockUploadService.uploadFile.mockResolvedValue(imagePath)
      classificationApiService.classify.mockResolvedValue(apiResponse)
      repository.save.mockResolvedValue(savedLog)

      // Act
      const result = await service.uploadAndClassify(fileName)

      // Assert
      expect(result).toMatchObject({
        success: true,
        message: '画像の分類が完了しました',
        data: {
          class: 1,
          confidence: 0.7823,
          uploadedPath: imagePath,
          requiresConfirmation: true, // 0.7823 < 0.85
        },
      })
      expect(result).toHaveProperty('timestamp')
    })

    it('正常系: AI-API失敗時にerrorCodeが抽出される', async () => {
      // Arrange
      const fileName = 'error_corrupted.jpg'
      const imagePath = '/image/f6g7h8i9j0k1l2m3n4o5/p6q7r8s9t0u1v2w3x/error_corrupted.jpg'
      const apiResponse = {
        success: false,
        message: 'Error:E41002 - 画像ファイルが破損しています',
        estimated_data: {},
      }

      mockUploadService.uploadFile.mockResolvedValue(imagePath)
      classificationApiService.classify.mockResolvedValue(apiResponse)
      const mockLog = {
        id: 125,
        imagePath: new ImagePath(imagePath),
      } as unknown as AiAnalysisLog
      repository.save.mockResolvedValue(mockLog)

      // Act
      const result = await service.uploadAndClassify(fileName)

      // Assert
      expect(repository.save).toHaveBeenCalled()
      expect(result).toMatchObject({
        success: false,
        errorCode: 'E41002',
        errorName: 'Image file corrupted',
        message: '画像ファイルが破損しています',
        userMessage: '画像が破損しています。もう一度撮影してください',
        recommendedActions: ['撮影し直す'],
      })
      expect(result).toHaveProperty('timestamp')
    })

    it('異常系: バリデーションエラー（ApplicationError）でrecommendedActionsが含まれる', async () => {
      // Arrange
      const fileName = 'receipt_invalid-mime.jpg'
      const error = new ApplicationError('E40006')

      mockUploadService.uploadFile.mockRejectedValue(error)
      const mockLog = {
        id: 126,
      } as unknown as AiAnalysisLog
      repository.save.mockResolvedValue(mockLog)

      // Act
      const result = await service.uploadAndClassify(fileName)

      // Assert
      expect(repository.save).toHaveBeenCalled()
      expect(result).toMatchObject({
        success: false,
        errorCode: 'E40006',
        errorName: 'Invalid MIME type',
        message: '無効なファイル形式です',
        userMessage: '画像ファイル（JPEG, PNG）のみアップロード可能です。再度撮影してください',
        recommendedActions: ['撮影し直す'],
      })
      expect(result).toHaveProperty('timestamp')
    })

    it('異常系: 一般的なエラー時にエラーメッセージが返される', async () => {
      // Arrange
      const fileName = 'unknown.jpg'
      const error = new Error('Unknown error')

      mockUploadService.uploadFile.mockRejectedValue(error)
      const mockLog = {
        id: 127,
      } as unknown as AiAnalysisLog
      repository.save.mockResolvedValue(mockLog)

      // Act
      const result = await service.uploadAndClassify(fileName)

      // Assert
      expect(repository.save).toHaveBeenCalled()
      expect(result.success).toBe(false)
      expect(result.message).toBe('Unknown error')
    })
  })
})
