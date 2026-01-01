/**
 * ファイル名から画像パスへの変換マッピング
 */
export const FILE_NAME_TO_PATH_MAPPING: Record<string, string> = {
  // 正常系
  'taxi_receipt.jpg': '/image/a1b2c3d4e5f6g7h8i9j0/k1l2m3n4o5p6q7r8s/taxi_receipt.jpg',
  'hotel_invoice.jpg': '/image/b2c3d4e5f6g7h8i9j0k1/l2m3n4o5p6q7r8s9t/hotel_invoice.jpg',
  'convenience_receipt.jpg':
    '/image/c3d4e5f6g7h8i9j0k1l2/m3n4o5p6q7r8s9t0u/convenience_receipt.jpg',
  'restaurant_bill.jpg': '/image/d4e5f6g7h8i9j0k1l2m3/n4o5p6q7r8s9t0u1v/restaurant_bill.jpg',
  'parking_receipt.jpg': '/image/e5f6g7h8i9j0k1l2m3n4/o5p6q7r8s9t0u1v2w/parking_receipt.jpg',

  // エラー系
  'error_corrupted.jpg': '/image/f6g7h8i9j0k1l2m3n4o5/p6q7r8s9t0u1v2w3x/error_corrupted.jpg',
  'error_too_small.jpg': '/image/g7h8i9j0k1l2m3n4o5p6/q7r8s9t0u1v2w3x4y/error_too_small.jpg',
  'error_no_receipt.jpg': '/image/h8i9j0k1l2m3n4o5p6q7/r8s9t0u1v2w3x4y5z/error_no_receipt.jpg',
  'error_unreadable.jpg': '/image/i9j0k1l2m3n4o5p6q7r8/s9t0u1v2w3x4y5z6a/error_unreadable.jpg',
  'error_blurry.jpg': '/image/j0k1l2m3n4o5p6q7r8s9/t0u1v2w3x4y5z6a7b/error_blurry.jpg',
  'error_multiple.jpg': '/image/k1l2m3n4o5p6q7r8s9t0/u1v2w3x4y5z6a7b8c/error_multiple.jpg',
  'error_timeout.jpg': '/image/l2m3n4o5p6q7r8s9t0u1/v2w3x4y5z6a7b8c9d/error_timeout.jpg',

  // バリデーションエラー系
  'receipt_invalid-mime.jpg':
    '/image/m3n4o5p6q7r8s9t0u1v2/w3x4y5z6a7b8c9d0e/receipt_invalid-mime.jpg',
  'receipt_too-large.jpg': '/image/n4o5p6q7r8s9t0u1v2w3/x4y5z6a7b8c9d0e1f/receipt_too-large.jpg',
  'receipt_invalid-dimensions.jpg':
    '/image/o5p6q7r8s9t0u1v2w3x4/y5z6a7b8c9d0e1f2g/receipt_invalid-dimensions.jpg',
}

/**
 * マッピングに存在するファイル名の一覧を取得
 */
export const AVAILABLE_FILE_NAMES = Object.keys(FILE_NAME_TO_PATH_MAPPING)
