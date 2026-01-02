import { Injectable, Inject } from '@nestjs/common'
import { ApplicationError } from '@/shared/common/errors/application.error'
import { ERROR_CATALOG, ErrorCode } from '@/shared/common/errors/error-catalog'
import { AiAnalysisLog } from '../../domain/entities/ai-analysis-log.entity'
import { ImagePath } from '../../domain/value-objects/image-path.vo'
import { Confidence } from '../../domain/value-objects/confidence.vo'
import type { IAiAnalysisLogRepository } from '../../domain/repositories/ai-analysis-log.repository.interface'
import type {
  IClassificationService,
  ClassificationResult,
} from '../interfaces/classification.interface'
import type { IUploadService } from '../interfaces/upload.interface'

/**
 * アップロード＆分類処理のレスポンス型
 * ErrorResponseとの互換性を持つ
 */
export interface UploadAndClassifyResult {
  /** 処理成功可否 */
  success: boolean
  /** レスポンスメッセージ */
  message: string
  /** タイムスタンプ */
  timestamp: string
  /** エラーコード（エラー時のみ） */
  errorCode?: string
  /** エラー名（エラー時のみ） */
  errorName?: string
  /** ユーザー向けメッセージ（エラー時のみ） */
  userMessage?: string
  /** 推奨アクション（エラー時のみ） */
  recommendedActions?: readonly string[]
  /** 分類結果データ（成功時のみ） */
  data?: {
    /** 領収書クラスID（0-4） */
    class?: number
    /** 信頼度（0.0-1.0） */
    confidence?: number
    /** アップロード画像パス（OCR API呼び出し用） */
    uploadedPath?: string
    /** ユーザー確認が必要か（信頼度<0.85の場合true） */
    requiresConfirmation?: boolean
  }
}

@Injectable()
export class UploadAndClassifyService {
  constructor(
    @Inject('IUploadService')
    private readonly uploadService: IUploadService,
    @Inject('IClassificationService')
    private readonly classificationApi: IClassificationService,
    @Inject('IAiAnalysisLogRepository')
    private readonly repository: IAiAnalysisLogRepository,
  ) {}

  /**
   * 画像アップロード＆AI分類処理
   *
   * ファイル名から画像パスを生成し、AI-APIで領収書タイプを分類します。
   * 成功・失敗に関わらず、すべての処理結果をDBに保存します。
   *
   * 処理フロー:
   * 1. 画像ファイルバリデーション（モック）
   * 2. ファイルアップロード（ファイル名→パス変換）
   * 3. パス形式バリデーション
   * 4. AI-API呼び出し
   * 5. DB保存
   * 6. レスポンス返却
   *
   * @param fileName - アップロードするファイル名（拡張子を含む）
   * @returns 分類結果と処理状況
   * @throws ApplicationError - バリデーションエラー時
   */
  async uploadAndClassify(fileName: string): Promise<UploadAndClassifyResult> {
    const requestTimestamp = new Date()
    let imagePathString: string | null = null

    try {
      // STEP 1. 画像ファイルバリデーション（モック実装）
      this.validateMockImageFile(fileName)

      // STEP 2. ファイルアップロード処理（モック：ファイル名→パス変換）
      imagePathString = await this.uploadService.uploadFile(fileName)

      // STEP 3. パス形式バリデーション（生成されたパスの検証）
      this.validatePathFormat(imagePathString)

      // STEP 4. AI-API呼び出し
      const apiResponse = await this.classificationApi.classify(imagePathString)
      const responseTimestamp = new Date()

      // STEP 5. DB保存 & レスポンス返却
      return await this.handleApiResponse(
        apiResponse,
        imagePathString,
        requestTimestamp,
        responseTimestamp,
      )
    } catch (error: unknown) {
      const responseTimestamp = new Date()
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const imagePathForLog = imagePathString ? new ImagePath(imagePathString) : fileName

      // エラーログ保存
      const log = AiAnalysisLog.createErrorLog(
        0,
        imagePathForLog,
        errorMessage,
        requestTimestamp,
        responseTimestamp,
      )
      await this.repository.save(log)

      // エラーレスポンス返却
      if (error instanceof ApplicationError) {
        return {
          ...error.toJSON(),
          timestamp: responseTimestamp.toISOString(),
        }
      }

      // 一般的なエラーの場合、エラーコードを抽出してカタログから情報を取得
      return this.createErrorResponse(errorMessage, responseTimestamp)
    }
  }

  /**
   * AI-APIレスポンスを処理し、DB保存とレスポンス返却を行う
   *
   * @param apiResponse - AI-APIからのレスポンス
   * @param imagePathString - アップロード済み画像パス
   * @param requestTimestamp - リクエスト開始時刻
   * @param responseTimestamp - レスポンス受信時刻
   * @returns クライアントへのレスポンス
   */
  private async handleApiResponse(
    apiResponse: ClassificationResult,
    imagePathString: string,
    requestTimestamp: Date,
    responseTimestamp: Date,
  ): Promise<UploadAndClassifyResult> {
    const imagePath = new ImagePath(imagePathString)
    const confidence = this.createConfidenceSafely(apiResponse.estimated_data.confidence)

    // DB保存
    if (apiResponse.success) {
      const log = AiAnalysisLog.createSuccessLog(
        0,
        imagePath,
        apiResponse.message,
        apiResponse.estimated_data.class || null,
        confidence,
        requestTimestamp,
        responseTimestamp,
      )
      await this.repository.save(log)

      // 成功レスポンス
      const confidenceValue = confidence ? confidence.getValue() : 0
      return {
        success: true,
        message: '画像の分類が完了しました',
        timestamp: responseTimestamp.toISOString(),
        data: {
          class: apiResponse.estimated_data.class ?? undefined,
          confidence: confidenceValue,
          uploadedPath: imagePathString,
          requiresConfirmation: confidenceValue < 0.85,
        },
      }
    } else {
      const log = AiAnalysisLog.createErrorLog(
        0,
        imagePath,
        apiResponse.message,
        requestTimestamp,
        responseTimestamp,
      )
      await this.repository.save(log)

      // エラーレスポンス - エラーカタログから完全な情報を取得
      return this.createErrorResponse(apiResponse.message, responseTimestamp)
    }
  }

  /**
   * Confidenceオブジェクトを安全に生成
   *
   * @param confidenceValue - 信頼度の値
   * @returns Confidenceオブジェクト、または生成失敗時はnull
   */
  private createConfidenceSafely(confidenceValue: number | undefined): Confidence | null {
    if (confidenceValue === undefined) {
      return null
    }

    try {
      return new Confidence(confidenceValue)
    } catch {
      return null
    }
  }

  /**
   * パス形式バリデーション
   * アップロード処理後に生成されたパス（imagePathString）を検証
   *
   * @param imagePath - 検証対象のパス文字列
   * @throws ApplicationError - バリデーションエラー時
   */
  private validatePathFormat(imagePath: string): void {
    // 1. 開始文字チェック：パスが `/` で始まること
    if (!imagePath.startsWith('/')) {
      // Invalid image_path format
      throw new ApplicationError('E40002')
    }

    // 2. 禁止文字チェック：親ディレクトリ参照を含まないこと
    if (imagePath.includes('..')) {
      // Invalid image_path format
      throw new ApplicationError('E40002')
    }

    // 3. 連続スラッシュチェック：`//` を含まないこと
    if (imagePath.includes('//')) {
      // Invalid image_path format
      throw new ApplicationError('E40002')
    }
  }

  /**
   * 画像ファイルバリデーション（モック実装）
   *
   * 【本運用での実装内容（最低限）】
   * 1. MIMEタイプチェック（セキュリティ対策）
   *    - エラー時: E41001
   *
   * 2. ファイルサイズチェック（リソース保護）
   *    - 最大10MB（10,485,760 bytes）
   *    - エラー時: E41003
   *
   * 3. 画像サイズチェック（電子帳簿保存法対応）
   *    - 最小200×200px以上（法定要件）
   *    - エラー時: E41004
   *
   * @param fileName - 検証対象のファイル名
   * @throws ApplicationError - バリデーションエラー時 (E40003, E40004, E40005)
   */
  private validateMockImageFile(fileName: string): void {
    const lowerFileName = fileName.toLowerCase()

    // MIMEタイプチェック（モック）
    if (lowerFileName.includes('invalid-mime') || lowerFileName.includes('invalid_mime')) {
      throw new ApplicationError('E40006')
    }

    // ファイルサイズチェック（モック）
    if (lowerFileName.includes('too-large') || lowerFileName.includes('too_large')) {
      throw new ApplicationError('E40004')
    }

    // 画像サイズチェック（モック）
    if (
      lowerFileName.includes('invalid-dimensions') ||
      lowerFileName.includes('invalid_dimensions')
    ) {
      throw new ApplicationError('E40005')
    }
    // 上記のいずれにも該当しない場合はバリデーション成功
  }

  /**
   * エラーメッセージからエラーコードを抽出
   *
   * AI-APIやその他のエラーメッセージから、エラーコードの部分のみを取り出します。
   *
   * @param message - エラーメッセージ（例: "Error:E41002"）
   * @returns エラーコード（例: "E41002"）、見つからない場合はundefined
   *
   * @example
   * extractErrorCode("Error:E41002") // => "E41002"
   * extractErrorCode("Unknown error") // => undefined
   */
  private extractErrorCode(message: string): string | undefined {
    const match = message.match(/Error:([A-Z0-9]+)/)
    return match ? match[1] : undefined
  }

  /**
   * エラーメッセージからエラーレスポンスを構築
   *
   * エラーメッセージからエラーコードを抽出し、ERROR_CATALOG から完全な情報を取得します。
   * エラーコードが見つからない場合は、簡易的なレスポンスを返します。
   *
   * @param message - エラーメッセージ
   * @param timestamp - レスポンスタイムスタンプ
   * @returns エラーレスポンス
   */
  private createErrorResponse(
    message: string,
    timestamp: Date,
  ): Omit<UploadAndClassifyResult, 'data'> {
    const errorCode = this.extractErrorCode(message)

    if (errorCode && errorCode in ERROR_CATALOG) {
      const errorInfo = ERROR_CATALOG[errorCode as ErrorCode]
      return {
        success: false,
        errorCode: errorCode,
        errorName: errorInfo.name,
        message: errorInfo.message,
        userMessage: errorInfo.userMessage,
        recommendedActions: errorInfo.recommendedActions,
        timestamp: timestamp.toISOString(),
      }
    }

    // エラーコードが見つからない場合
    return {
      success: false,
      message: message,
      timestamp: timestamp.toISOString(),
      errorCode: errorCode,
    }
  }
}
