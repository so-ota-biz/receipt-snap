import { ImagePath } from '../value-objects/image-path.vo'
import { Confidence } from '../value-objects/confidence.vo'

/**
 * ピュアドメインエンティティ
 */
export class AiAnalysisLog {
  id: number
  imagePath: ImagePath | null
  success: boolean
  message: string | null
  classNumber: number | null
  confidence: Confidence | null
  requestTimestamp: Date | null
  responseTimestamp: Date | null

  constructor(
    id: number,
    imagePath: ImagePath | null,
    success: boolean,
    message: string | null,
    classNumber: number | null,
    confidence: Confidence | null,
    requestTimestamp: Date | null,
    responseTimestamp: Date | null,
  ) {
    this.id = id
    this.imagePath = imagePath
    this.success = success
    this.message = message
    this.classNumber = classNumber
    this.confidence = confidence
    this.requestTimestamp = requestTimestamp
    this.responseTimestamp = responseTimestamp
  }

  /**
   * エラー時のログを生成
   */
  static createErrorLog(
    id: number,
    fileName: string,
    errorMessage: string,
    requestTimestamp: Date,
    responseTimestamp: Date,
  ): AiAnalysisLog {
    return new AiAnalysisLog(
      id,
      null, // エラー時はImagePath未生成
      false,
      errorMessage,
      null,
      null,
      requestTimestamp,
      responseTimestamp,
    )
  }

  /**
   * 成功時のログを生成
   */
  static createSuccessLog(
    id: number,
    imagePath: ImagePath,
    message: string,
    classNumber: number | null,
    confidence: Confidence | null,
    requestTimestamp: Date,
    responseTimestamp: Date,
  ): AiAnalysisLog {
    return new AiAnalysisLog(
      id,
      imagePath,
      true,
      message,
      classNumber,
      confidence,
      requestTimestamp,
      responseTimestamp,
    )
  }

  /**
   * 信頼度レベルを取得
   */
  getConfidenceLevel(): 'high' | 'medium' | 'low' | 'very-low' | 'none' {
    if (!this.confidence) return 'none'
    return this.confidence.getLevel()
  }
}
