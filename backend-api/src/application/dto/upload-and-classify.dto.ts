import { IsString, IsNotEmpty, MaxLength } from 'class-validator'

export class UploadAndClassifyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string
}

export class UploadAndClassifyResponseDto {
  success: boolean
  saved_id?: number
  classification?: {
    class?: number
    confidence?: number
  }
  error?: string
}
