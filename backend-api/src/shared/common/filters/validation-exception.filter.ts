import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, Logger } from '@nestjs/common'
import { Request, Response } from 'express'
import { ApplicationError } from '../errors/application.error'
import { ErrorCode } from '../errors/error-catalog'

/**
 * ValidationPipeから投げられるBadRequestExceptionをキャッチし、
 * ApplicationError形式に変換して統一的なエラーレスポンスを返す
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name)

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // ValidationPipeから返されるエラーメッセージを取得
    const exceptionResponse = exception.getResponse()
    const validationErrors = this.extractValidationErrors(exceptionResponse)

    // エラーメッセージからエラーコードを判定
    const errorCode = this.determineErrorCode(validationErrors)

    // ApplicationErrorに変換
    const applicationError = new ApplicationError(errorCode)

    // エラーログを記録
    this.logger.error({
      errorCode: errorCode,
      validationErrors: validationErrors,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    })

    // 統一されたJSON形式でレスポンス返却
    response.status(applicationError.getStatus()).json(applicationError.toJSON())
  }

  /**
   * exceptionResponseからバリデーションエラーメッセージを抽出
   */
  private extractValidationErrors(exceptionResponse: string | object): string[] {
    if (typeof exceptionResponse === 'string') {
      return [exceptionResponse]
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const response = exceptionResponse as { message?: string | string[] }
      if (Array.isArray(response.message)) {
        return response.message
      }
      if (typeof response.message === 'string') {
        return [response.message]
      }
    }

    return ['Validation failed']
  }

  /**
   * バリデーションエラーメッセージから適切なエラーコードを判定（より基本的な条件を先にチェック）
   */
  private determineErrorCode(validationErrors: string[]): ErrorCode {
    const errorMessage = validationErrors.join(' ').toLowerCase()

    // 1. 型チェック（最優先）
    if (errorMessage.includes('must be a string')) {
      return 'E40001' // Invalid parameter
    }

    // 2. 空文字・必須チェック
    if (
      errorMessage.includes('required') ||
      errorMessage.includes('should not be empty') ||
      errorMessage.includes('is not empty')
    ) {
      return 'E40001' // Invalid parameter
    }

    // 3. 長さチェック（255文字超過）
    if (errorMessage.includes('length') && errorMessage.includes('255')) {
      return 'E40003' // Image path too long
    }

    // 4. 拡張子チェック（画像形式）
    if (errorMessage.includes('unsupported image format')) {
      return 'E41001' // Unsupported image format
    }

    // デフォルト（パラメーター不正）
    return 'E40001' // Invalid parameter
  }
}
