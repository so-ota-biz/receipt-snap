import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { ApplicationExceptionFilter } from '@/shared/common/filters/application-exception.filter'
import { AllExceptionsFilter } from '@/shared/common/filters/all-exceptions.filter'
import { ValidationExceptionFilter } from '@/shared/common/filters/validation-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  // グローバル例外フィルターを登録（登録順序の逆順で実行）
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new ApplicationExceptionFilter(),
    new ValidationExceptionFilter(),
  )
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
bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
