import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AiAnalysisLog } from '@/domain/entities/ai-analysis-log.entity'
import { IAiAnalysisLogRepository } from '@/domain/repositories/ai-analysis-log.repository.interface'

@Injectable()
export class AiAnalysisLogRepository implements IAiAnalysisLogRepository {
  constructor(
    @InjectRepository(AiAnalysisLog)
    private readonly repository: Repository<AiAnalysisLog>,
  ) {}

  async save(log: AiAnalysisLog): Promise<AiAnalysisLog> {
    return await this.repository.save(log)
  }

  async findById(id: number): Promise<AiAnalysisLog | null> {
    return await this.repository.findOne({ where: { id } })
  }

  async findRecent(limit: number = 10): Promise<AiAnalysisLog[]> {
    return await this.repository.find({
      order: { request_timestamp: 'DESC' },
      take: limit,
    })
  }
}
