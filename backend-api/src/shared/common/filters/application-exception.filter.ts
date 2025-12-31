import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common'
import { Request, Response } from 'express'
import { ApplicationError } from '../errors/application.error'

/**
 * ApplicationError専用例外フィルター
 * アプリケーション固有のエラー（ビジネスロジックエラー）を処理
 */
@Catch(ApplicationError)
export class ApplicationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApplicationExceptionFilter.name)

  catch(exception: ApplicationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()

    // エラーログを記録
    this.logger.error({
      errorCode: exception.errorCode,
      message: exception.message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
    })

    // 統一されたJSON形式でレスポンス返却
    response.status(status).json(exception.toJSON())
  }
}
