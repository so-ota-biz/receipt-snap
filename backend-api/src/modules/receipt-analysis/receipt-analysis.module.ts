import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UploadAndClassifyController } from './presentation/controllers/upload-and-classify.controller'
import { UploadAndClassifyService } from './application/services/upload-and-classify.service'
import { MockUploadService } from './infrastructure/upload/mock-upload.service'
import { ClassificationApiService } from './infrastructure/external-api/classification-api.service'
import { AiAnalysisLogRepository } from './infrastructure/repositories/ai-analysis-log.repository'
import { AiAnalysisLogSchema } from './infrastructure/persistence/typeorm/schemas/ai-analysis-log.schema'

@Module({
  imports: [TypeOrmModule.forFeature([AiAnalysisLogSchema])],
  controllers: [UploadAndClassifyController],
  // DIの設定
  providers: [
    UploadAndClassifyService,
    {
      provide: 'IUploadService',
      useClass: MockUploadService,
    },
    {
      provide: 'IClassificationService',
      useClass: ClassificationApiService,
    },
    {
      provide: 'IAiAnalysisLogRepository',
      useClass: AiAnalysisLogRepository,
    },
  ],
  // 他のモジュールから使用する可能性がある場合はexportする
  exports: ['IAiAnalysisLogRepository'],
})
export class ReceiptAnalysisModule {}
