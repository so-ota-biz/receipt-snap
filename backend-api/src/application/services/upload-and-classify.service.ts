import { Injectable } from '@nestjs/common'
import { AiAnalysisLog } from '@/domain/entities/ai-analysis-log.entity'
import { AiAnalysisLogRepository } from '@/infrastructure/repositories/ai-analysis-log.repository'
import { ClassificationApiService } from '@/infrastructure/external-api/classification-api.service'
import { MockUploadService } from '@/infrastructure/upload/mock-upload.service'

export interface UploadAndClassifyResult {
  success: boolean
  saved_id: number
  classification?: {
    class?: number
    confidence?: number
  }
  error?: string
}

@Injectable()
export class UploadAndClassifyService {
  constructor(
    private readonly uploadService: MockUploadService,
    private readonly classificationApi: ClassificationApiService,
    private readonly repository: AiAnalysisLogRepository,
  ) {}

  async uploadAndClassify(fileName: string): Promise<UploadAndClassifyResult> {
    // STEP 0. リクエストタイムスタンプ記録
    const requestTimestamp = new Date()

    try {
      // STEP 1. ファイルアップロード処理（モック：ファイル名→パス変換）
      const imagePath = await this.uploadService.uploadFile(fileName)

      // STEP 2. AI-API呼び出し
      const apiResponse = await this.classificationApi.classify(imagePath)

      // STEP 3. レスポンスタイムスタンプ記録
      const responseTimestamp = new Date()

      // STEP 4. DB保存（エンティティ作成）
      const log = new AiAnalysisLog()
      log.image_path = imagePath
      log.success = apiResponse.success ? 1 : 0
      log.message = apiResponse.message
      log.class = apiResponse.estimated_data.class || null
      log.confidence = apiResponse.estimated_data.confidence || null
      log.request_timestamp = requestTimestamp
      log.response_timestamp = responseTimestamp

      const savedLog = await this.repository.save(log)

      // STEP 5. レスポンス返却
      return {
        success: true,
        saved_id: savedLog.id,
        classification: apiResponse.success
          ? {
              class: apiResponse.estimated_data.class,
              confidence: apiResponse.estimated_data.confidence,
            }
          : undefined,
      }
    } catch (error: unknown) {
      // エラー時もDB保存
      const responseTimestamp = new Date()

      // エラーメッセージを安全に取得
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      const log = new AiAnalysisLog()
      log.image_path = fileName // エラー時はfileNameをそのまま記録
      log.success = 0
      log.message = errorMessage
      log.class = null
      log.confidence = null
      log.request_timestamp = requestTimestamp
      log.response_timestamp = responseTimestamp

      const savedLog = await this.repository.save(log)

      return {
        success: false,
        saved_id: savedLog.id,
        error: errorMessage,
      }
    }
  }

  async getRecentLogs(limit = 10): Promise<AiAnalysisLog[]> {
    return await this.repository.findRecent(limit)
  }
}
