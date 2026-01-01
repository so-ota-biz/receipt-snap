import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Button,
  Paper,
  Text,
  Group,
  Stack,
  Badge,
  Alert,
  Loader,
  Select,
  List,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconUpload, IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react'
import { uploadAndClassify, performOcr } from './api/client'
import { CLASS_NAMES, TEST_FILE_NAMES } from './types/api'
import type { UploadAndClassifyResponse } from './types/api'

function App() {
  // 基本的な状態管理
  const [fileName, setFileName] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadAndClassifyResponse | null>(null)

  // 確認画面とOCR処理用の状態
  const [selectedReceiptType, setSelectedReceiptType] = useState<number | null>(null)
  const [showOcrSuccess, setShowOcrSuccess] = useState(false)

  // タイムアウト制御: 再試行可能までの秒数
  const [retryAvailableIn, setRetryAvailableIn] = useState(0)

  // カウントダウンタイマー
  useEffect(() => {
    if (retryAvailableIn > 0) {
      const timer = setTimeout(() => {
        setRetryAvailableIn(retryAvailableIn - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [retryAvailableIn])

  // アップロード＆分類を実行
  const handleSubmit = async () => {
    if (!fileName.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'ファイル名を選択してください',
        color: 'red',
        icon: <IconX />,
      })
      return
    }

    setLoading(true)
    setResult(null)
    setShowOcrSuccess(false) // OCR結果もクリア

    try {
      const response = await uploadAndClassify(fileName)
      setResult(response)

      if (response.success && response.data) {
        // 成功時の通知
        notifications.show({
          title: '成功',
          message: '画像の分類が完了しました',
          color: 'green',
          icon: <IconCheck />,
        })

        // パターンB対応: requiresConfirmationに基づいて分岐
        if (response.data.requiresConfirmation) {
          // 中・低信頼度: 確認画面を表示
          setSelectedReceiptType(response.data.class) // デフォルト選択
          notifications.show({
            title: '確認が必要です',
            message: '領収書の種類を確認してください',
            color: 'yellow',
            icon: <IconAlertCircle />,
          })
        } else {
          // 高信頼度: 自動的にOCR APIを呼び出し（エラー前提）
          await handleOcrRequest(response.data.uploadedPath, response.data.class)
        }
      } else {
        // エラー時の処理
        if (response.errorCode === 'E50408') {
          // タイムアウトエラーの場合は5秒間再試行不可
          setRetryAvailableIn(5)
          notifications.show({
            title: 'タイムアウト',
            message: response.message + ' 5秒後に再試行できます',
            color: 'orange',
            icon: <IconX />,
          })
        } else {
          // その他のエラー（バリデーションエラー E40003, E40004, E40005 含む）
          notifications.show({
            title: 'エラー',
            message: response.message,
            color: 'red',
            icon: <IconX />,
          })
        }
      }
    } catch (error) {
      console.error('Error:', error)
      notifications.show({
        title: 'エラー',
        message: 'APIリクエストに失敗しました',
        color: 'red',
        icon: <IconX />,
      })
    } finally {
      setLoading(false)
    }
  }

  // OCR APIを呼び出す関数（未実装のためエラー前提）
  const handleOcrRequest = async (imagePath: string, receiptType: number) => {
    try {
      // OCR APIは未実装なので、必ずエラーになる
      await performOcr(imagePath, receiptType)
    } catch (error) {
      // エラーが想定通りなので、catch節で「次のOCRフォーム遷移」をシミュレート
      console.log('OCR API未実装（想定通りのエラー）。次のフォーム画面へ遷移します。', error)

      // OCR成功画面を表示（本番では専用フォームへ遷移）
      setSelectedReceiptType(receiptType) // 領収書タイプを保存
      setShowOcrSuccess(true)

      notifications.show({
        title: 'OCR処理完了（モック）',
        message: `領収書タイプ「${CLASS_NAMES[receiptType]}」のフォーム画面へ遷移します`,
        color: 'blue',
        icon: <IconCheck />,
      })
    }
  }

  // 確認画面の「確定」ボタン
  const handleConfirmReceipt = async () => {
    if (result?.data && selectedReceiptType !== null) {
      await handleOcrRequest(result.data.uploadedPath, selectedReceiptType)
    }
  }

  // 信頼度のバッジカラーを取得
  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 0.85) return 'green'
    if (confidence >= 0.7) return 'yellow'
    return 'orange'
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* タイトル */}
        <Title order={1}>領収書分類システム - ReceiptSnap</Title>

        {/* 入力フォーム */}
        <Paper shadow="sm" p="md" withBorder>
          <Stack gap="md">
            <Title order={3}>画像アップロード＆分類</Title>
            <Select
              label="テスト用ファイル名を選択"
              placeholder="ファイルを選択してください"
              value={fileName}
              onChange={(value) => setFileName(value || '')}
              disabled={loading}
              data={TEST_FILE_NAMES}
              searchable
              clearable
            />
            <Button
              leftSection={loading ? <Loader size="sm" /> : <IconUpload size={16} />}
              onClick={handleSubmit}
              disabled={loading || retryAvailableIn > 0 || !fileName}
              fullWidth
            >
              {loading
                ? '処理中...'
                : retryAvailableIn > 0
                  ? `${retryAvailableIn}秒後に再試行できます`
                  : 'アップロード＆分類実行'}
            </Button>
          </Stack>
        </Paper>

        {/* 結果表示 */}
        {result && (
          <Paper shadow="sm" p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>分類結果</Title>
              {result.success && result.data ? (
                <Alert color="green" title="分類成功" icon={<IconCheck />}>
                  <Stack gap="xs">
                    <Text>
                      <strong>クラス:</strong> {CLASS_NAMES[result.data.class]}
                    </Text>
                    <Group gap="xs">
                      <Text>
                        <strong>信頼度:</strong>
                      </Text>
                      <Badge color={getConfidenceBadgeColor(result.data.confidence)}>
                        {(result.data.confidence * 100).toFixed(2)}%
                      </Badge>
                    </Group>
                    {result.data.requiresConfirmation && (
                      <Badge color="yellow" size="lg">
                        確認が必要です（信頼度 {'<'} 85%）
                      </Badge>
                    )}
                    <Text size="sm" c="dimmed">
                      アップロード先: {result.data.uploadedPath}
                    </Text>
                  </Stack>
                </Alert>
              ) : (
                <Alert color="red" title="分類失敗" icon={<IconX />}>
                  <Stack gap="xs">
                    <Text>
                      <strong>メッセージ:</strong> {result.message}
                    </Text>
                    {result.errorCode && (
                      <Text>
                        <strong>エラーコード:</strong> {result.errorCode}
                      </Text>
                    )}
                    {result.recommendedActions && result.recommendedActions.length > 0 && (
                      <>
                        <Text mt="sm">
                          <strong>次に行うべきアクション:</strong>
                        </Text>
                        <List size="sm">
                          {result.recommendedActions.map((action, index) => (
                            <List.Item key={index}>{action}</List.Item>
                          ))}
                        </List>
                      </>
                    )}
                  </Stack>
                </Alert>
              )}
            </Stack>
          </Paper>
        )}

        {/* 確認画面（requiresConfirmation === true の場合） */}
        {result?.success && result.data?.requiresConfirmation && !showOcrSuccess && (
          <Paper shadow="sm" p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>領収書の種類を確認してください</Title>
              <Alert color="yellow" icon={<IconAlertCircle />}>
                信頼度が中程度のため、確認が必要です。AIが推定した種類が正しいか確認し、必要に応じて変更してください。
              </Alert>

              <Select
                label="領収書サブタイプ"
                value={selectedReceiptType?.toString()}
                onChange={(value) => setSelectedReceiptType(value ? parseInt(value) : null)}
                data={[
                  { value: '0', label: CLASS_NAMES[0] },
                  { value: '1', label: CLASS_NAMES[1] },
                  { value: '2', label: CLASS_NAMES[2] },
                  { value: '3', label: CLASS_NAMES[3] },
                  { value: '4', label: CLASS_NAMES[4] },
                ]}
              />

              <Button
                onClick={handleConfirmReceipt}
                disabled={selectedReceiptType === null}
                fullWidth
              >
                確定してOCR処理を実行
              </Button>
            </Stack>
          </Paper>
        )}

        {/* OCR成功画面（モック） */}
        {showOcrSuccess && (
          <Paper shadow="sm" p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>OCR処理完了</Title>
              <Alert color="blue" title="次のステップ" icon={<IconCheck />}>
                <Stack gap="xs">
                  <Text>
                    領収書タイプ「
                    <strong>
                      {selectedReceiptType !== null ? CLASS_NAMES[selectedReceiptType] : ''}
                    </strong>
                    」のOCR処理が完了しました。
                  </Text>
                  <Text size="sm" c="dimmed">
                    ※ 本番実装では、ここからサブタイプごとの専用入力フォーム画面へ遷移します
                  </Text>
                  <Text size="sm" c="dimmed">
                    ※ OCR
                    APIは今回の実装では未実装のため、エラー後に次画面遷移をシミュレートしています
                  </Text>
                </Stack>
              </Alert>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  )
}

export default App
