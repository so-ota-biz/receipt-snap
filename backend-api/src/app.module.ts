import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UploadAndClassifyController } from '@/presentation/controllers/upload-and-classify.controller'
import { UploadAndClassifyService } from '@/application/services/upload-and-classify.service'
import { MockUploadService } from '@/infrastructure/upload/mock-upload.service'
import { ClassificationApiService } from '@/infrastructure/external-api/classification-api.service'
import { AiAnalysisLogRepository } from '@/infrastructure/repositories/ai-analysis-log.repository'
import { AiAnalysisLog } from '@/domain/entities/ai-analysis-log.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'receipt_snap_db',
      entities: [AiAnalysisLog],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([AiAnalysisLog]),
  ],
  controllers: [AppController, UploadAndClassifyController],
  providers: [
    AppService,
    UploadAndClassifyService,
    MockUploadService,
    ClassificationApiService,
    AiAnalysisLogRepository,
  ],
})
export class AppModule {}
