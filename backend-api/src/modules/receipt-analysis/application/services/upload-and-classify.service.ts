import { Injectable, Inject } from '@nestjs/common'
import { ApplicationError } from '@/shared/common/errors/application.error'
import { AiAnalysisLog } from '../../domain/entities/ai-analysis-log.entity'
import { ImagePath } from '../../domain/value-objects/image-path.vo'
import { Confidence } from '../../domain/value-objects/confidence.vo'
import type { IAiAnalysisLogRepository } from '../../domain/repositories/ai-analysis-log.repository.interface'
import type { IClassificationService } from '../interfaces/classification.interface'
import type { IUploadService } from '../interfaces/upload.interface'

/**
 * アップロード＆分類処理のレスポンス型
 */
export interface UploadAndClassifyResult {
  /** 処理成功可否 */
  success: boolean
  /** レスポンスメッセージ */
  message: string
  /** エラーコード（エラー時のみ） */
  errorCode?: string
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
    // STEP 0. リクエストタイムスタンプ記録
    const requestTimestamp = new Date()

    try {
      // STEP 1. 画像ファイルバリデーション（モック実装）
      // 不正なファイルはアップロード前に弾く（本運用: バイナリに対してサイズ・形式・縦横比などをチェック）
      this.validateMockImageFile(fileName)

      // STEP 2. ファイルアップロード処理（モック：ファイル名→パス変換）
      const imagePathString = await this.uploadService.uploadFile(fileName)

      // STEP 3. パス形式バリデーション（生成されたパスの検証）
      this.validatePathFormat(imagePathString)

      // STEP 4. AI-API呼び出し
      const apiResponse = await this.classificationApi.classify(imagePathString)

      // STEP 5. レスポンスタイムスタンプ記録
      const responseTimestamp = new Date()

      // STEP 6. DB保存（ドメインエンティティ作成）
      const imagePath = new ImagePath(imagePathString)
      const confidence =
        apiResponse.estimated_data.confidence !== undefined
          ? new Confidence(apiResponse.estimated_data.confidence)
          : null

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

      // STEP 7. レスポンス返却
      if (apiResponse.success) {
        const confidenceValue = apiResponse.estimated_data.confidence || 0
        const requiresConfirmation = confidenceValue < 0.85 // 信頼度0.85未満なら確認必要

        return {
          success: true,
          message: '画像の分類が完了しました',
          data: {
            class: apiResponse.estimated_data.class ?? undefined,
            confidence: confidenceValue,
            uploadedPath: imagePathString, // OCR APIリクエストで使用するため返す
            requiresConfirmation: requiresConfirmation,
          },
        }
      } else {
        return {
          success: false,
          message: apiResponse.message,
          errorCode: this.extractErrorCode(apiResponse.message),
        }
      }
    } catch (error: unknown) {
      // エラー時もDB保存
      const responseTimestamp = new Date()

      // エラーメッセージを安全に取得
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      // エラー時のドメインエンティティ生成
      const log = AiAnalysisLog.createErrorLog(
        0,
        fileName, // エラー時はfileNameをそのまま記録
        errorMessage,
        requestTimestamp,
        responseTimestamp,
      )

      await this.repository.save(log)

      return {
        success: false,
        message: errorMessage,
        errorCode: this.extractErrorCode(errorMessage),
      }
    }
  }

  /**
   * 最新のAI分析ログを取得
   *
   * リクエストタイムスタンプの降順で、指定件数のログを取得します。
   *
   * @param limit - 取得件数（デフォルト: 10）
   * @returns AI分析ログの配列
   */
  async getRecentLogs(limit = 10): Promise<AiAnalysisLog[]> {
    return await this.repository.findRecent(limit)
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
   * @param fileName - ファイル名（モック実装では未使用）
   */
  private validateMockImageFile(fileName: string): void {
    // モック実装：常に検証成功として扱う
    return
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
}
