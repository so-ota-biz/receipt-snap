import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common'
import { Request, Response } from 'express'
import { ErrorResponse } from '../errors/error-catalog'

/**
 * 全例外をキャッチする汎用フィルター
 * ApplicationError以外のすべての例外を処理
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // HttpExceptionの場合
    if (exception instanceof HttpException) {
      const status = exception.getStatus()

      this.logger.warn({
        message: exception.message,
        status,
        path: request.url,
      })

      const errorResponse: ErrorResponse = {
        success: false,
        message: exception.message,
        timestamp: new Date().toISOString(),
      }

      response.status(status).json(errorResponse)
      return
    }

    // 予期しないエラー（500エラー）
    this.logger.error({
      message: exception instanceof Error ? exception.message : 'Unknown error',
      path: request.url,
      ...(process.env.NODE_ENV === 'development' &&
        exception instanceof Error && { stack: exception.stack }),
    })

    const errorResponse: ErrorResponse = {
      success: false,
      errorCode: 'E50001',
      message: 'Internal server error',
      userMessage: 'システムエラーが発生しました。時間をおいて再試行してください',
      timestamp: new Date().toISOString(),
    }

    response.status(500).json(errorResponse)
  }
}
