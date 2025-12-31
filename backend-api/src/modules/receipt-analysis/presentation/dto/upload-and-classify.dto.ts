import { IsString, IsNotEmpty, Length, Matches } from 'class-validator'

export class UploadAndClassifyDto {
  @IsNotEmpty({ message: 'fileName is required' })
  @IsString({ message: 'fileName must be a string' })
  @Length(1, 255, { message: 'fileName length must be between 1 and 255 characters' })
  @Matches(/\.(jpg|jpeg|png|gif|bmp|webp)$/i, {
    message: 'Unsupported image format. Allowed formats: jpg, jpeg, png, gif, bmp, webp',
  })
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
