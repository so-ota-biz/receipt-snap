import { AiAnalysisLog } from '../entities/ai-analysis-log.entity'

export interface IAiAnalysisLogRepository {
  save(log: AiAnalysisLog): Promise<AiAnalysisLog>
  findById(id: number): Promise<AiAnalysisLog | null>
  findRecent(limit: number): Promise<AiAnalysisLog[]>
}
