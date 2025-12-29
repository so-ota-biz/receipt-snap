import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { ApplicationExceptionFilter } from './common/filters/application-exception.filter'
import { AllExceptionsFilter } from './common/filters/application-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // グローバル例外フィルターを登録
  app.useGlobalFilters(new AllExceptionsFilter(), new ApplicationExceptionFilter())
  // バリデーションパイプを登録
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  // CORS有効化
  app.enableCors()
  await app.listen(process.env.PORT ?? 3000)
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`)
}
void bootstrap()
