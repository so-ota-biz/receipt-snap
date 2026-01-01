// アップロード＆分類APIのレスポンス
export interface UploadAndClassifyResponse {
  success: boolean
  message: string
  errorCode?: string // エラー時のエラーコード（例: E41002, E50408）
  recommendedActions?: string[] // エラー時の推奨アクション
  data?: {
    class: number // AI推定の領収書サブタイプ（0-4）
    confidence: number // 信頼度（0.0-1.0）
    uploadedPath: string // S3パス（OCR APIリクエストで使用）
    requiresConfirmation: boolean // 確認画面を表示するかどうか（confidenceが0.85以上ならfalse）
  }
}

// 領収書 OCR APIのリクエスト
export interface OcrRequest {
  imagePath: string // S3パス（分類APIから取得したuploadedPath）
  receiptType: number // ユーザー選択の領収書サブタイプ（0-4）
}

// 領収書 OCR APIのレスポンス（モック実装用の簡易版）
export interface OcrResponse {
  success: boolean
  message: string
  data?: {
    receiptType: number
    extractedFields: string[]
  }
}

// クラス名のマッピング
export const CLASS_NAMES: Record<number, string> = {
  0: 'レシート（コンビニ・小売）',
  1: 'レシート（飲食店）',
  2: 'タクシー領収書',
  3: '交通系ICカード履歴',
  4: 'ホテル領収書',
  9: 'その他領収書（分類不能）',
}

// テスト用ファイル名のリスト（ドロップダウン選択用）
export const TEST_FILE_NAMES = [
  {
    group: '正常系',
    items: [
      { value: 'convenience_receipt.jpg', label: 'コンビニレシート（信頼度: 中、要確認）' },
      { value: 'restaurant_bill.jpg', label: '飲食店レシート（信頼度: 中、要確認）' },
      { value: 'taxi_receipt.jpg', label: 'タクシー領収書（信頼度: 高）' },
      { value: 'hotel_invoice.jpg', label: 'ホテル領収書（信頼度: 高）' },
      { value: 'parking_receipt.jpg', label: 'その他領収書（信頼度: 低、要確認）' },
    ],
  },
  {
    group: 'AI-APIエラー',
    items: [
      { value: 'error_corrupted.jpg', label: 'E41002: 画像破損エラー' },
      { value: 'error_too_small.jpg', label: 'E41004: 画像サイズ小エラー' },
      { value: 'error_no_receipt.jpg', label: 'E41006: 領収書未検出エラー' },
      { value: 'error_unreadable.jpg', label: 'E41007: 文字不鮮明エラー' },
      { value: 'error_blurry.jpg', label: 'E41008: 画像ぼやけエラー' },
      { value: 'error_multiple.jpg', label: 'E41009: 複数領収書エラー' },
      { value: 'error_timeout.jpg', label: 'E50408: タイムアウトエラー' },
    ],
  },
  {
    group: 'バリデーションエラー',
    items: [
      { value: 'receipt_invalid-mime.jpg', label: 'E40003: 無効なMIMEタイプ' },
      { value: 'receipt_too-large.jpg', label: 'E40004: ファイルサイズ超過' },
      { value: 'receipt_invalid-dimensions.jpg', label: 'E40005: 画像サイズ不正' },
    ],
  },
]
