import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AiAnalysisLog } from '../../domain/entities/ai-analysis-log.entity'
import { IAiAnalysisLogRepository } from '../../domain/repositories/ai-analysis-log.repository.interface'
import { AiAnalysisLogSchema } from '../persistence/typeorm/schemas/ai-analysis-log.schema'
import { AiAnalysisLogMapper } from '../persistence/mappers/ai-analysis-log.mapper'

@Injectable()
export class AiAnalysisLogRepository implements IAiAnalysisLogRepository {
  constructor(
    @InjectRepository(AiAnalysisLogSchema)
    private readonly repository: Repository<AiAnalysisLogSchema>,
  ) {}

  async save(log: AiAnalysisLog): Promise<AiAnalysisLog> {
    const schema = AiAnalysisLogMapper.toSchema(log)
    const savedSchema = await this.repository.save(schema)
    return AiAnalysisLogMapper.toDomain(savedSchema)
  }

  async findById(id: number): Promise<AiAnalysisLog | null> {
    const schema = await this.repository.findOne({ where: { id } })
    if (!schema) return null
    return AiAnalysisLogMapper.toDomain(schema)
  }

  async findRecent(limit: number = 10): Promise<AiAnalysisLog[]> {
    const schemas = await this.repository.find({
      order: { request_timestamp: 'DESC' },
      take: limit,
    })
    return schemas.map((schema) => AiAnalysisLogMapper.toDomain(schema))
  }
}
