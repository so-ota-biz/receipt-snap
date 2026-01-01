/**
 * エラー情報カタログ
 * 全てのエラーコードとその詳細情報を一元管理
 */
export const ERROR_CATALOG = {
  // 4xx系: クライアントエラー
  E40001: {
    code: 'E40001',
    name: 'Invalid parameter',
    httpStatus: 400,
    message: '必須パラメーターが不足しています',
    userMessage: '画像のアップロードに失敗しました。再度撮影してください',
    recommendedActions: ['撮影し直す'],
  },
  E40002: {
    code: 'E40002',
    name: 'Invalid image_path format',
    httpStatus: 400,
    message: 'image_pathの形式が不正です',
    userMessage: '画像の読み込みに失敗しました。再度撮影してください',
    recommendedActions: ['撮影し直す'],
  },
  E40003: {
    code: 'E40003',
    name: 'Image path too long',
    httpStatus: 400,
    message: 'パス長が255文字を超えています',
    userMessage: 'ファイル名が長すぎます。再度アップロードしてください',
    recommendedActions: ['撮影し直す'],
  },
  E40004: {
    code: 'E40004',
    name: 'File size exceeded',
    httpStatus: 400,
    message: 'ファイルサイズが上限を超えています',
    userMessage: 'ファイルサイズが大きすぎます（上限: 10MB）。画質を下げて再度撮影してください',
    recommendedActions: ['撮影し直す'],
  },
  E40005: {
    code: 'E40005',
    name: 'Invalid image dimensions',
    httpStatus: 400,
    message: '画像サイズが不正です',
    userMessage:
      '画像の解像度が不正です。推奨サイズ（200dpi以上、最大4096x4096px）で撮影してください',
    recommendedActions: ['撮影し直す'],
  },
  E40006: {
    code: 'E40006',
    name: 'Invalid MIME type',
    httpStatus: 400,
    message: '無効なファイル形式です',
    userMessage: '画像ファイル（JPEG, PNG）のみアップロード可能です。再度撮影してください',
    recommendedActions: ['撮影し直す'],
  },
  E41001: {
    code: 'E41001',
    name: 'Unsupported image format',
    httpStatus: 400,
    message: '対応していない画像形式です',
    userMessage: '画像形式が対応していません。JPEG/PNG形式で撮影してください',
    recommendedActions: ['撮影し直す'],
  },
  E41002: {
    code: 'E41002',
    name: 'Image file corrupted',
    httpStatus: 400,
    message: '画像ファイルが破損しています',
    userMessage: '画像が破損しています。もう一度撮影してください',
    recommendedActions: ['撮影し直す'],
  },
  E41004: {
    code: 'E41004',
    name: 'Image too small',
    httpStatus: 400,
    message: '画像サイズが小さすぎます（200dpi未満）',
    userMessage:
      '画像が小さすぎます。法律で定められた解像度（200dpi以上）を満たす必要があります。より鮮明に撮影してください',
    recommendedActions: ['撮影し直す'],
  },
  E41006: {
    code: 'E41006',
    name: 'Receipt not detected',
    httpStatus: 400,
    message: '領収書が検出されませんでした',
    userMessage: '領収書が見つかりません。領収書を画面中央に配置して撮影してください',
    recommendedActions: ['撮影し直す'],
  },
  E41007: {
    code: 'E41007',
    name: 'Text not readable',
    httpStatus: 400,
    message: '文字が不鮮明で読み取り不可',
    userMessage: '文字が不鮮明です。明るい場所でピントを合わせて撮影してください',
    recommendedActions: ['撮影し直す'],
  },
  E41008: {
    code: 'E41008',
    name: 'Image too blurry',
    httpStatus: 400,
    message: '画像がぼやけています',
    userMessage: '画像がぼやけています。手ブレに注意してピントを合わせて再撮影してください',
    recommendedActions: ['撮影し直す'],
  },
  E41009: {
    code: 'E41009',
    name: 'Multiple receipts detected',
    httpStatus: 400,
    message: '複数の領収書が写り込んでいます',
    userMessage: '複数の領収書が検出されました。1枚ずつ撮影してください',
    recommendedActions: ['撮影し直す'],
  },

  // 5xx系: サーバーエラー
  E50001: {
    code: 'E50001',
    name: 'Internal server error',
    httpStatus: 500,
    message: 'サーバー内部エラーが発生しました',
    userMessage: 'システムエラーが発生しました。時間をおいて再試行してください',
    recommendedActions: ['時間をおいて再試行', 'サポートに連絡'],
  },
  E50012: {
    code: 'E50012',
    name: 'Processing timeout',
    httpStatus: 504,
    message: '処理がタイムアウトしました（60秒超過）',
    userMessage: '処理に時間がかかりすぎています。時間をおいて再試行してください',
    recommendedActions: ['時間をおいて再試行', 'サポートに連絡'],
  },
} as const

// ErrorCodeの型
export type ErrorCode = keyof typeof ERROR_CATALOG

// エラー情報の型
export type ErrorInfo = (typeof ERROR_CATALOG)[ErrorCode]

/**
 * エラーレスポンスの統一型
 * すべての例外フィルターでこの形式を返却する
 */
export interface ErrorResponse {
  success: false
  errorCode?: string
  errorName?: string
  message: string
  userMessage?: string
  recommendedActions?: readonly string[]
  timestamp: string
}
