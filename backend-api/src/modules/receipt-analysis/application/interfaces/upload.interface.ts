/**
 * ファイルアップロードサービスのインターフェース
 */
export interface IUploadService {
  /**
   * ファイルをアップロードして、保存先のパスを返す
   *
   * @param fileName - アップロードするファイル名
   * @returns 画像パス（URL or ファイルパス）
   * @throws Error - アップロード失敗時
   */
  uploadFile(fileName: string): Promise<string>
}
