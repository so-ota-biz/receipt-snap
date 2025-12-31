import { Injectable } from '@nestjs/common'
import { ApplicationError } from '@/shared/common/errors/application.error'
import { IUploadService } from '../../application/interfaces/upload.interface'
import { FILE_NAME_TO_PATH_MAPPING } from './file-name-mapping'

/**
 * モックアップロードサービス
 * ファイル名を画像パスに変換（実運用ではAWS S3等へのアップロード処理を想定）
 */
@Injectable()
export class MockUploadService implements IUploadService {
  /**
   * ファイル名から画像パスを生成
   *
   * @param fileName - アップロードするファイル名
   * @returns 画像パス
   * @throws ApplicationError - ファイル名が不正な場合
   */
  async uploadFile(fileName: string): Promise<string> {
    // ファイル名の検証
    if (!fileName || fileName.trim() === '') {
      throw new ApplicationError('E40001')
    }

    // マッピングテーブルから変換
    const imagePath = FILE_NAME_TO_PATH_MAPPING[fileName]

    if (!imagePath) {
      // 未定義のファイル名の場合はエラー
      throw new ApplicationError('E40001')
    }

    // モック実装のため、ここで実際のアップロード処理は行わない
    // 実運用では以下の処理を想定：
    // 1. ファイルバイナリを受け取る
    // 2. AWS S3等にアップロード
    // 3. アップロード先のパスを返す

    // 擬似的な処理遅延
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return imagePath
  }

  /**
   * 利用可能なファイル名一覧を取得
   */
  getAvailableFileNames(): string[] {
    return Object.keys(FILE_NAME_TO_PATH_MAPPING)
  }
}
