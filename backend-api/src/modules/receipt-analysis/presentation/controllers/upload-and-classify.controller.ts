import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { UploadAndClassifyService } from '../../application/services/upload-and-classify.service'
import { UploadAndClassifyDto, UploadAndClassifyResponseDto } from '../dto/upload-and-classify.dto'

@Controller('api')
export class UploadAndClassifyController {
  constructor(private readonly service: UploadAndClassifyService) {}

  @Post('upload-and-classify')
  @HttpCode(HttpStatus.OK)
  async uploadAndClassify(
    @Body() dto: UploadAndClassifyDto,
  ): Promise<UploadAndClassifyResponseDto> {
    // ファイルアップロード → AI-API → DB保存 を一括実行
    return await this.service.uploadAndClassify(dto.fileName)
  }
}
