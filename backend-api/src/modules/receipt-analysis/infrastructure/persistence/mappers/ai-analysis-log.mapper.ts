import { AiAnalysisLog } from '../../../domain/entities/ai-analysis-log.entity'
import { ImagePath } from '../../../domain/value-objects/image-path.vo'
import { Confidence } from '../../../domain/value-objects/confidence.vo'
import { AiAnalysisLogSchema } from '../typeorm/schemas/ai-analysis-log.schema'

/**
 * ドメインエンティティ・TypeORMスキーマ（インフラストラクチャ）間の変換を担当
 */
export class AiAnalysisLogMapper {
  /**
   * TypeORMスキーマ → ドメインエンティティ
   */
  static toDomain(schema: AiAnalysisLogSchema): AiAnalysisLog {
    // image_pathをImagePathまたはstringに変換
    // ImagePathのバリデーション（/ で始まる）を満たす場合はImagePath、満たさない場合はstring
    let imagePath: ImagePath | string | null = null
    if (schema.image_path) {
      try {
        imagePath = new ImagePath(schema.image_path)
      } catch {
        // ImagePath生成失敗（ファイル名のみの場合）はstringとして保持
        imagePath = schema.image_path
      }
    }

    const confidence = schema.confidence !== null ? new Confidence(schema.confidence) : null

    return new AiAnalysisLog(
      schema.id,
      imagePath,
      schema.success === 1,
      schema.message,
      schema.class,
      confidence,
      schema.request_timestamp,
      schema.response_timestamp,
    )
  }

  /**
   * ドメインエンティティ → TypeORMスキーマ
   */
  static toSchema(entity: AiAnalysisLog): AiAnalysisLogSchema {
    const schema = new AiAnalysisLogSchema()
    schema.id = entity.id
    // ImagePathインスタンスならgetValue()、stringならそのまま、nullならnull
    schema.image_path = entity.imagePath
      ? entity.imagePath instanceof ImagePath
        ? entity.imagePath.getValue()
        : entity.imagePath
      : null
    schema.success = entity.success ? 1 : 0
    schema.message = entity.message
    schema.class = entity.classNumber
    schema.confidence = entity.confidence ? entity.confidence.getValue() : null
    schema.request_timestamp = entity.requestTimestamp
    schema.response_timestamp = entity.responseTimestamp
    return schema
  }

  /**
   * 新規作成用（IDなし）のスキーマを生成
   */
  static toSchemaForCreate(
    imagePath: string | null,
    success: boolean,
    message: string | null,
    classNumber: number | null,
    confidence: number | null,
    requestTimestamp: Date,
    responseTimestamp: Date,
  ): Omit<AiAnalysisLogSchema, 'id'> {
    const schema = new AiAnalysisLogSchema()
    schema.image_path = imagePath
    schema.success = success ? 1 : 0
    schema.message = message
    schema.class = classNumber
    schema.confidence = confidence
    schema.request_timestamp = requestTimestamp
    schema.response_timestamp = responseTimestamp
    return schema
  }
}
