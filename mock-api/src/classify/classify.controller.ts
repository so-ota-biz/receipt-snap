import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger
} from '@nestjs/common'

interface ClassifyRequest {
  image_path: string
}

interface ClassifyResponse {
  success: boolean
  message: string
  estimated_data: {
    class?: number
    confidence?: number
  }
}

@Controller('api/v1')
export class ClassifyController {
  private readonly logger = new Logger(ClassifyController.name)

  @Post('classify')
  @HttpCode(HttpStatus.OK)
  async classify(@Body() request: ClassifyRequest): Promise<ClassifyResponse> {
    this.logger.log('=== Mock API: Classify endpoint called ===')
    this.logger.log(`Received request:`, request)

    const { image_path } = request

    if (!image_path) {
      this.logger.warn('No image_path provided in request')
    } else {
      this.logger.log(`Processing image_path: ${image_path}`)
    }

    // ファイルパスに基づいてモックレスポンスを返す
    const response = await this.getMockResponse(image_path)
    this.logger.log(`Returning response:`, response)
    this.logger.log('=== Mock API: Request completed ===')

    return response
  }

  private async getMockResponse(imagePath: string): Promise<ClassifyResponse> {
    // 擬似的な処理遅延
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 正常系
    if (imagePath.includes('taxi')) {
      return {
        success: true,
        message: 'success',
        estimated_data: { class: 2, confidence: 0.9234 }
      }
    }
    if (imagePath.includes('hotel')) {
      return {
        success: true,
        message: 'success',
        estimated_data: { class: 4, confidence: 0.8876 }
      }
    }
    if (imagePath.includes('convenience')) {
      return {
        success: true,
        message: 'success',
        estimated_data: { class: 0, confidence: 0.8534 }
      }
    }
    if (imagePath.includes('restaurant')) {
      return {
        success: true,
        message: 'success',
        estimated_data: { class: 1, confidence: 0.7823 }
      }
    }

    // エラー系
    if (imagePath.includes('file_not_found')) {
      return {
        success: false,
        message: 'Error:E40004',
        estimated_data: {}
      }
    }
    if (imagePath.includes('corrupted')) {
      return {
        success: false,
        message: 'Error:E41002',
        estimated_data: {}
      }
    }
    if (imagePath.includes('too_small')) {
      return {
        success: false,
        message: 'Error:E41004',
        estimated_data: {}
      }
    }
    if (imagePath.includes('no_receipt')) {
      return {
        success: false,
        message: 'Error:E41006',
        estimated_data: {}
      }
    }
    if (imagePath.includes('text_unreadable')) {
      return {
        success: false,
        message: 'Error:E41007',
        estimated_data: {}
      }
    }
    if (imagePath.includes('blurry')) {
      return {
        success: false,
        message: 'Error:E41008',
        estimated_data: {}
      }
    }
    if (imagePath.includes('multiple_receipts')) {
      return {
        success: false,
        message: 'Error:E41009',
        estimated_data: {}
      }
    }
    if (imagePath.includes('timeout')) {
      return {
        success: false,
        message: 'Error:E50012',
        estimated_data: {}
      }
    }

    // デフォルト（その他のファイルパス）
    this.logger.log('No specific pattern matched, returning default response')
    return {
      success: true,
      message: 'success',
      estimated_data: { class: 9, confidence: 0.4521 }
    }
  }
}
