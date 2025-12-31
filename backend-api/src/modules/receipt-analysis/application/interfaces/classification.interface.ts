/**
 * AI分類APIサービスのインターフェース
 */

export interface ClassificationResult {
  success: boolean
  message: string
  estimated_data: {
    class?: number
    confidence?: number
  }
}

export interface IClassificationService {
  /**
   * 画像を分類する
   *
   * @param imagePath - 分類対象の画像パス
   * @returns 分類結果
   * @throws Error - API呼び出し失敗時
   */
  classify(imagePath: string): Promise<ClassificationResult>
}
