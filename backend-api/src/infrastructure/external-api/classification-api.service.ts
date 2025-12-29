import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import axios, { AxiosError } from 'axios'

export interface ClassificationRequest {
  image_path: string
}

export interface ClassificationResponse {
  success: boolean
  message: string
  estimated_data: {
    class?: number
    confidence?: number
  }
}

@Injectable()
export class ClassificationApiService {
  private readonly apiUrl = process.env.EXTERNAL_API_URL || 'http://example.com:3001'
  private readonly timeout = 65000 // 65秒

  async classify(imagePath: string): Promise<ClassificationResponse> {
    try {
      const response = await axios.post<ClassificationResponse>(
        `${this.apiUrl}/api/v1/classify`,
        { image_path: imagePath },
        {
          timeout: this.timeout,
          headers: { 'Content-Type': 'application/json' },
        },
      )

      return response.data
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>
        if (axiosError.code === 'ECONNABORTED') {
          throw new HttpException('Request Timeout', HttpStatus.GATEWAY_TIMEOUT)
        }
        if (axiosError.response) {
          const errorMessage = axiosError.response.data?.message || 'External API Error'
          throw new HttpException(errorMessage, axiosError.response.status)
        }
      }
      throw new HttpException('Connection Error', HttpStatus.SERVICE_UNAVAILABLE)
    }
  }
}
