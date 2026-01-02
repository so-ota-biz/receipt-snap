import axios from 'axios'
import type { UploadAndClassifyResponse, OcrRequest, OcrResponse } from '../types/api'

// 環境変数からAPIのベースURLを取得（デフォルトはlocalhost:3000）
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * 画像アップロード＆分類APIを呼び出す
 */
export const uploadAndClassify = async (fileName: string): Promise<UploadAndClassifyResponse> => {
  const response = await axios.post<UploadAndClassifyResponse>(
    `${API_BASE_URL}/api/upload-and-classify`,
    { fileName },
  )
  return response.data
}

/**
 * 領収書 OCR APIを呼び出す
 */
export const performOcr = async (imagePath: string, receiptType: number): Promise<OcrResponse> => {
  const response = await axios.post<OcrResponse>(`${API_BASE_URL}/api/v1/ocr`, {
    imagePath,
    receiptType,
  } as OcrRequest)
  return response.data
}
