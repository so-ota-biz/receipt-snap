import { Module } from '@nestjs/common'
import { ClassifyController } from './classify.controller'

@Module({
  controllers: [ClassifyController]
})
export class ClassifyModule {}
