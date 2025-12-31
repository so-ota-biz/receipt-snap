import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(process.env.PORT ?? 3001)
  console.log(
    `Mock Classification API is running on: http://localhost:${process.env.PORT ?? 3001}`
  )
}
bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
