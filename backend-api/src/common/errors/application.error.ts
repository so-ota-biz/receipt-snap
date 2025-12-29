import { HttpException } from '@nestjs/common'
import { ERROR_CATALOG, ErrorCode, ErrorInfo, ErrorResponse } from './error-catalog'

/**
 * アプリケーション固有の例外クラス
 */
export class ApplicationError extends HttpException {
  public readonly errorCode: ErrorCode
  public readonly errorInfo: ErrorInfo

  constructor(errorCode: ErrorCode) {
    const errorInfo = ERROR_CATALOG[errorCode]
    super(errorInfo.message, errorInfo.httpStatus)

    this.errorCode = errorCode
    this.errorInfo = errorInfo
    this.name = 'ApplicationError'
  }

  /**
   * フロントエンドに返すJSON形式
   */
  toJSON(): ErrorResponse {
    return {
      success: false,
      errorCode: this.errorCode,
      errorName: this.errorInfo.name,
      message: this.errorInfo.message,
      userMessage: this.errorInfo.userMessage,
      recommendedActions: this.errorInfo.recommendedActions,
      timestamp: new Date().toISOString(),
    }
  }
}
