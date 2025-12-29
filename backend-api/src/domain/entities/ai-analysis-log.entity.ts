import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('ai_analysis_log')
export class AiAnalysisLog {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_path: string | null

  @Column({ type: 'tinyint', width: 1 })
  success: number // 0 or 1

  @Column({ type: 'varchar', length: 255, nullable: true })
  message: string | null

  @Column({ type: 'int', nullable: true })
  class: number | null

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  confidence: number | null

  @Column({ type: 'datetime', precision: 6, nullable: true })
  request_timestamp: Date | null

  @Column({ type: 'datetime', precision: 6, nullable: true })
  response_timestamp: Date | null
}
